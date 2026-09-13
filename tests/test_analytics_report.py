import tempfile
import unittest
from datetime import date
from pathlib import Path

from scripts.analytics_report import (
    Period,
    format_delta,
    format_number,
    percent_change,
    render_markdown,
    resolve_periods,
    write_report,
)


class AnalyticsReportTest(unittest.TestCase):
    def test_resolve_periods_uses_complete_consecutive_ranges(self):
        current, previous = resolve_periods(7, "yesterday", today=date(2026, 9, 13))

        self.assertEqual(current, Period(date(2026, 9, 6), date(2026, 9, 12)))
        self.assertEqual(previous, Period(date(2026, 8, 30), date(2026, 9, 5)))

    def test_rejects_current_or_future_end_date(self):
        with self.assertRaisesRegex(ValueError, "anterior a hoy"):
            resolve_periods(7, "2026-09-13", today=date(2026, 9, 13))

    def test_formats_metrics_and_changes(self):
        self.assertEqual(format_number(0.534, "engagementRate"), "53.4%")
        self.assertEqual(format_number(125, "averageSessionDuration"), "2m 05s")
        self.assertEqual(format_number(1.234, "screenPageViewsPerSession"), "1.23")
        self.assertEqual(percent_change(120, 100), 20)
        self.assertIsNone(percent_change(4, 0))
        self.assertEqual(format_delta(-12.5), "↓ 12.5%")

    def test_writes_utf8_report_files(self):
        metrics = {
            "activeUsers": 10,
            "newUsers": 7,
            "sessions": 12,
            "engagedSessions": 8,
            "engagementRate": 0.666,
            "screenPageViews": 24,
            "screenPageViewsPerSession": 2,
            "averageSessionDuration": 90,
            "eventCount": 40,
            "keyEvents": 3,
        }
        report = {
            "metadata": {
                "property_id": "123",
                "generated_at": "2026-09-13T12:00:00+00:00",
                "current_period": {"start": "2026-09-06", "end": "2026-09-12"},
                "previous_period": {"start": "2026-08-30", "end": "2026-09-05"},
            },
            "summary": {
                "current": metrics,
                "previous": metrics,
                "change_percent": {key: 0 for key in metrics},
            },
            "tables": {
                "daily": [],
                "pages": [{
                    "pagePath": "/",
                    "pageTitle": "Retinar | Teleoftalmología",
                    "screenPageViews": 20,
                    "activeUsers": 9,
                    "averageSessionDuration": 88,
                    "keyEvents": 2,
                }],
                "acquisition": [],
                "countries": [],
                "devices": [],
                "events": [],
            },
        }

        markdown = render_markdown(report)
        self.assertIn("Teleoftalmología", markdown)
        self.assertIn("Usuarios activos", markdown)

        with tempfile.TemporaryDirectory() as directory:
            paths = write_report(report, Path(directory))
            self.assertEqual(len(paths), 9)
            self.assertIn("Teleoftalmología", (Path(directory) / "reporte.md").read_text(encoding="utf-8"))
            self.assertTrue((Path(directory) / "pages.csv").exists())


if __name__ == "__main__":
    unittest.main()
