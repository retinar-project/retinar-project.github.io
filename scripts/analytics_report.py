#!/usr/bin/env python3
"""Genera un reporte periódico de las métricas principales de Google Analytics 4."""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Sequence


SUMMARY_METRICS = (
    "activeUsers",
    "newUsers",
    "sessions",
    "engagedSessions",
    "engagementRate",
    "screenPageViews",
    "screenPageViewsPerSession",
    "averageSessionDuration",
    "eventCount",
    "keyEvents",
)

METRIC_LABELS = {
    "activeUsers": "Usuarios activos",
    "newUsers": "Usuarios nuevos",
    "sessions": "Sesiones",
    "engagedSessions": "Sesiones con interacción",
    "engagementRate": "Tasa de interacción",
    "screenPageViews": "Vistas",
    "screenPageViewsPerSession": "Vistas por sesión",
    "averageSessionDuration": "Duración media de sesión",
    "eventCount": "Eventos",
    "keyEvents": "Eventos clave",
    "totalUsers": "Usuarios",
}

DIMENSION_LABELS = {
    "date": "Fecha",
    "pagePath": "Ruta",
    "pageTitle": "Página",
    "sessionDefaultChannelGroup": "Canal",
    "country": "País",
    "deviceCategory": "Dispositivo",
    "eventName": "Evento",
}

PERCENT_METRICS = {"engagementRate"}
DURATION_METRICS = {"averageSessionDuration"}
DECIMAL_METRICS = {"screenPageViewsPerSession"}


@dataclass(frozen=True)
class Period:
    start: date
    end: date

    @property
    def label(self) -> str:
        return f"{self.start.isoformat()} a {self.end.isoformat()}"


@dataclass(frozen=True)
class TableSpec:
    key: str
    title: str
    dimensions: tuple[str, ...]
    metrics: tuple[str, ...]
    limit: int
    order_by: str


TABLE_SPECS = (
    TableSpec(
        "daily",
        "Evolución diaria",
        ("date",),
        ("activeUsers", "sessions", "screenPageViews", "keyEvents"),
        100,
        "date",
    ),
    TableSpec(
        "pages",
        "Páginas principales",
        ("pagePath", "pageTitle"),
        ("screenPageViews", "activeUsers", "averageSessionDuration", "keyEvents"),
        15,
        "screenPageViews",
    ),
    TableSpec(
        "acquisition",
        "Adquisición por canal",
        ("sessionDefaultChannelGroup",),
        ("sessions", "activeUsers", "engagedSessions", "engagementRate", "keyEvents"),
        15,
        "sessions",
    ),
    TableSpec(
        "countries",
        "Países principales",
        ("country",),
        ("activeUsers", "sessions"),
        10,
        "activeUsers",
    ),
    TableSpec(
        "devices",
        "Dispositivos",
        ("deviceCategory",),
        ("activeUsers", "sessions", "engagementRate"),
        10,
        "activeUsers",
    ),
    TableSpec(
        "events",
        "Eventos principales",
        ("eventName",),
        ("eventCount", "totalUsers", "keyEvents"),
        20,
        "eventCount",
    ),
)


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--property-id",
        default=os.environ.get("GA4_PROPERTY_ID"),
        help="ID numérico de la propiedad GA4 (o variable GA4_PROPERTY_ID).",
    )
    parser.add_argument(
        "--credentials-json",
        default=os.environ.get("GOOGLE_ANALYTICS_CREDENTIALS_JSON"),
        help="JSON de una cuenta de servicio (o variable GOOGLE_ANALYTICS_CREDENTIALS_JSON).",
    )
    parser.add_argument("--days", type=int, default=7, help="Cantidad de días del período (1-90).")
    parser.add_argument(
        "--end-date",
        default="yesterday",
        help="Último día del período en YYYY-MM-DD; por defecto, ayer.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("reports/analytics"),
        help="Carpeta de salida.",
    )
    return parser.parse_args(argv)


def resolve_periods(days: int, end_date: str, today: date | None = None) -> tuple[Period, Period]:
    if not 1 <= days <= 90:
        raise ValueError("--days debe estar entre 1 y 90")
    today = today or date.today()
    if end_date == "yesterday":
        end = today - timedelta(days=1)
    else:
        end = date.fromisoformat(end_date)
    if end >= today:
        raise ValueError("--end-date debe ser anterior a hoy para evitar datos incompletos")
    current = Period(start=end - timedelta(days=days - 1), end=end)
    previous_end = current.start - timedelta(days=1)
    previous = Period(start=previous_end - timedelta(days=days - 1), end=previous_end)
    return current, previous


def build_client(credentials_json: str):
    try:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.oauth2 import service_account
    except ImportError as exc:
        raise RuntimeError(
            "Falta la dependencia google-analytics-data. "
            "Instalá scripts/requirements-analytics.txt."
        ) from exc

    try:
        credentials_info = json.loads(credentials_json)
    except json.JSONDecodeError as exc:
        raise ValueError("GOOGLE_ANALYTICS_CREDENTIALS_JSON no contiene JSON válido") from exc

    credentials = service_account.Credentials.from_service_account_info(
        credentials_info,
        scopes=["https://www.googleapis.com/auth/analytics.readonly"],
    )
    return BetaAnalyticsDataClient(credentials=credentials)


def run_query(
    client: Any,
    property_id: str,
    period: Period,
    dimensions: Sequence[str],
    metrics: Sequence[str],
    limit: int = 100,
    order_by: str | None = None,
) -> list[dict[str, Any]]:
    from google.analytics.data_v1beta.types import (
        DateRange,
        Dimension,
        Metric,
        OrderBy,
        RunReportRequest,
    )

    order_bys = []
    if order_by:
        if order_by in dimensions:
            order_bys.append(
                OrderBy(
                    dimension=OrderBy.DimensionOrderBy(dimension_name=order_by),
                    desc=False,
                )
            )
        else:
            order_bys.append(
                OrderBy(
                    metric=OrderBy.MetricOrderBy(metric_name=order_by),
                    desc=True,
                )
            )

    request = RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(start_date=period.start.isoformat(), end_date=period.end.isoformat())],
        dimensions=[Dimension(name=name) for name in dimensions],
        metrics=[Metric(name=name) for name in metrics],
        order_bys=order_bys,
        limit=limit,
        keep_empty_rows=False,
    )
    response = client.run_report(request=request)
    rows: list[dict[str, Any]] = []
    for response_row in response.rows:
        row: dict[str, Any] = {}
        for index, name in enumerate(dimensions):
            row[name] = response_row.dimension_values[index].value
        for index, name in enumerate(metrics):
            row[name] = numeric_value(response_row.metric_values[index].value)
        rows.append(row)
    return rows


def numeric_value(value: str) -> int | float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0
    return int(number) if number.is_integer() else number


def summary_from_rows(rows: Sequence[dict[str, Any]]) -> dict[str, int | float]:
    if not rows:
        return {name: 0 for name in SUMMARY_METRICS}
    return {name: rows[0].get(name, 0) for name in SUMMARY_METRICS}


def percent_change(current: int | float, previous: int | float) -> float | None:
    if previous == 0:
        return 0.0 if current == 0 else None
    return ((current - previous) / previous) * 100


def collect_report(client: Any, property_id: str, current: Period, previous: Period) -> dict[str, Any]:
    current_summary = summary_from_rows(
        run_query(client, property_id, current, (), SUMMARY_METRICS, limit=1)
    )
    previous_summary = summary_from_rows(
        run_query(client, property_id, previous, (), SUMMARY_METRICS, limit=1)
    )
    changes = {
        metric: percent_change(current_summary[metric], previous_summary[metric])
        for metric in SUMMARY_METRICS
    }

    tables = {
        spec.key: run_query(
            client,
            property_id,
            current,
            spec.dimensions,
            spec.metrics,
            limit=spec.limit,
            order_by=spec.order_by,
        )
        for spec in TABLE_SPECS
    }
    return {
        "metadata": {
            "property_id": property_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "current_period": {"start": current.start.isoformat(), "end": current.end.isoformat()},
            "previous_period": {"start": previous.start.isoformat(), "end": previous.end.isoformat()},
        },
        "summary": {
            "current": current_summary,
            "previous": previous_summary,
            "change_percent": changes,
        },
        "tables": tables,
    }


def format_number(value: int | float, metric: str) -> str:
    number = float(value)
    if metric in PERCENT_METRICS:
        return f"{number * 100:.1f}%"
    if metric in DURATION_METRICS:
        minutes, seconds = divmod(round(number), 60)
        return f"{minutes}m {seconds:02d}s" if minutes else f"{seconds}s"
    if metric in DECIMAL_METRICS:
        return f"{number:.2f}"
    return f"{round(number):,}".replace(",", ".")


def format_delta(value: float | None) -> str:
    if value is None:
        return "nuevo"
    arrow = "↑" if value > 0 else "↓" if value < 0 else "→"
    return f"{arrow} {abs(value):.1f}%"


def escape_markdown(value: Any) -> str:
    return str(value).replace("|", "\\|").replace("\n", " ")


def table_markdown(rows: Sequence[dict[str, Any]], columns: Sequence[str]) -> str:
    if not rows:
        return "_Sin datos para este período._"
    headers = [DIMENSION_LABELS.get(column, METRIC_LABELS.get(column, column)) for column in columns]
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for row in rows:
        cells = []
        for column in columns:
            value = row.get(column, "")
            if column in METRIC_LABELS:
                value = format_number(value, column)
            elif column == "date" and len(str(value)) == 8:
                value = f"{str(value)[0:4]}-{str(value)[4:6]}-{str(value)[6:8]}"
            cells.append(escape_markdown(value))
        lines.append("| " + " | ".join(cells) + " |")
    return "\n".join(lines)


def render_markdown(report: dict[str, Any]) -> str:
    metadata = report["metadata"]
    summary = report["summary"]
    current_period = metadata["current_period"]
    previous_period = metadata["previous_period"]
    lines = [
        "# Reporte de Google Analytics 4",
        "",
        f"**Período:** {current_period['start']} a {current_period['end']}  ",
        f"**Comparación:** {previous_period['start']} a {previous_period['end']}  ",
        f"**Generado:** {metadata['generated_at']}  ",
        "",
        "## Resumen ejecutivo",
        "",
        "| Métrica | Período actual | Período anterior | Variación |",
        "| --- | ---: | ---: | ---: |",
    ]
    for metric in SUMMARY_METRICS:
        lines.append(
            "| {label} | {current} | {previous} | {change} |".format(
                label=METRIC_LABELS[metric],
                current=format_number(summary["current"][metric], metric),
                previous=format_number(summary["previous"][metric], metric),
                change=format_delta(summary["change_percent"][metric]),
            )
        )

    lines.extend(["", "## Lectura rápida", ""])
    pages = report["tables"].get("pages", [])
    acquisition = report["tables"].get("acquisition", [])
    events = report["tables"].get("events", [])
    if pages:
        lines.append(
            f"- La página con más vistas fue **{escape_markdown(pages[0].get('pageTitle') or pages[0].get('pagePath'))}** "
            f"con {format_number(pages[0].get('screenPageViews', 0), 'screenPageViews')}."
        )
    if acquisition:
        lines.append(
            f"- El principal canal fue **{escape_markdown(acquisition[0].get('sessionDefaultChannelGroup'))}** "
            f"con {format_number(acquisition[0].get('sessions', 0), 'sessions')} sesiones."
        )
    if events:
        lines.append(
            f"- El evento más frecuente fue **{escape_markdown(events[0].get('eventName'))}** "
            f"con {format_number(events[0].get('eventCount', 0), 'eventCount')} ocurrencias."
        )
    if not any((pages, acquisition, events)):
        lines.append("- No hubo datos suficientes para generar destacados.")

    for spec in TABLE_SPECS:
        columns = (*spec.dimensions, *spec.metrics)
        lines.extend(
            [
                "",
                f"## {spec.title}",
                "",
                table_markdown(report["tables"].get(spec.key, []), columns),
            ]
        )

    lines.extend(
        [
            "",
            "---",
            "",
            "Los datos excluyen a quienes no aceptaron las cookies de medición. "
            "Google Analytics puede actualizar cifras recientes después de generado el reporte.",
            "",
        ]
    )
    return "\n".join(lines)


def write_csv(path: Path, rows: Sequence[dict[str, Any]], columns: Sequence[str]) -> None:
    with path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def write_report(report: dict[str, Any], output_dir: Path) -> list[Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    created: list[Path] = []

    markdown_path = output_dir / "reporte.md"
    markdown_path.write_text(render_markdown(report), encoding="utf-8")
    created.append(markdown_path)

    json_path = output_dir / "datos.json"
    json_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    created.append(json_path)

    summary_rows = []
    for metric in SUMMARY_METRICS:
        summary_rows.append(
            {
                "metric": metric,
                "label": METRIC_LABELS[metric],
                "current": report["summary"]["current"][metric],
                "previous": report["summary"]["previous"][metric],
                "change_percent": report["summary"]["change_percent"][metric],
            }
        )
    summary_path = output_dir / "resumen.csv"
    write_csv(summary_path, summary_rows, ("metric", "label", "current", "previous", "change_percent"))
    created.append(summary_path)

    for spec in TABLE_SPECS:
        table_path = output_dir / f"{spec.key}.csv"
        write_csv(table_path, report["tables"].get(spec.key, []), (*spec.dimensions, *spec.metrics))
        created.append(table_path)
    return created


def validate_configuration(args: argparse.Namespace) -> None:
    if not args.property_id:
        raise ValueError("Falta GA4_PROPERTY_ID (es el ID numérico de propiedad, no el ID G-…)")
    if not str(args.property_id).isdigit():
        raise ValueError("GA4_PROPERTY_ID debe ser numérico; el ID de medición G-… no sirve para leer reportes")
    if not args.credentials_json:
        raise ValueError("Falta GOOGLE_ANALYTICS_CREDENTIALS_JSON")


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        validate_configuration(args)
        current, previous = resolve_periods(args.days, args.end_date)
        client = build_client(args.credentials_json)
        report = collect_report(client, str(args.property_id), current, previous)
        created = write_report(report, args.output_dir)
    except (ValueError, RuntimeError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    except Exception as exc:  # La API expone varios tipos de error según la causa.
        print(f"No se pudo generar el reporte de Analytics: {exc}", file=sys.stderr)
        return 1

    print(f"Reporte generado para {current.label} en {args.output_dir}")
    for path in created:
        print(f"- {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
