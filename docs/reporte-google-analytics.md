# Reporte automático de Google Analytics 4

El repositorio genera un reporte privado todos los lunes a las 08:00 (hora de Argentina). También puede ejecutarse manualmente desde **GitHub → Actions → Reporte semanal de Google Analytics → Run workflow** para períodos de 7, 14, 28 o 30 días.

El reporte compara el período elegido con el período inmediatamente anterior e incluye:

- usuarios activos y nuevos;
- sesiones, sesiones con interacción y tasa de interacción;
- vistas, vistas por sesión y duración media;
- eventos y eventos clave;
- evolución diaria;
- páginas, canales de adquisición, países, dispositivos y eventos principales.

Cada ejecución muestra el resumen directamente en GitHub Actions y conserva durante 90 días un archivo descargable con:

- `reporte.md`: reporte legible;
- `datos.json`: datos completos y metadatos;
- `resumen.csv` y un CSV por cada desglose.

Los reportes no se publican en la web ni se agregan al historial de Git.

## Configuración inicial

### 1. ID de propiedad configurado

El workflow ya está configurado con el ID de propiedad `550799346`. No usar el ID de medición `G-837F132VX0`: ese ID permite enviar visitas, pero no leer reportes.

### 2. Crear el acceso de solo lectura

1. Crear o elegir un proyecto en Google Cloud.
2. Habilitar **Google Analytics Data API**.
3. Crear una cuenta de servicio y descargar su clave JSON.
4. Copiar el correo de la cuenta de servicio.
5. En Google Analytics, abrir **Administrar → Gestión de accesos a la propiedad**.
6. Agregar ese correo con el rol **Lector**.

La cuenta de servicio no necesita permisos de edición en Analytics.

### 3. Configurar GitHub Actions

En **GitHub → Settings → Secrets and variables → Actions** crear:

- un secreto de repositorio llamado `GOOGLE_ANALYTICS_CREDENTIALS_JSON`, pegando el contenido completo de la clave JSON.

Nunca guardar la clave JSON como archivo en este repositorio.

### 4. Verificar

Ejecutar manualmente el workflow para 7 días. Al finalizar:

1. abrir la ejecución;
2. revisar el resumen generado;
3. descargar el artefacto `reporte-google-analytics-…`;
4. confirmar que los totales sean razonables frente a Google Analytics.

Las cifras pueden diferir levemente de la interfaz de Analytics por actualizaciones tardías, umbrales, identidad de reporte o zona horaria. Además, la implementación de consentimiento de este sitio no mide a visitantes que rechazaron las cookies analíticas.

## Ejecución local opcional

Con Python 3.12 o posterior:

```bash
python -m pip install -r scripts/requirements-analytics.txt
export GA4_PROPERTY_ID="550799346"
export GOOGLE_ANALYTICS_CREDENTIALS_JSON="$(<ruta-privada/credencial.json)"
python scripts/analytics_report.py --days 7
```

La salida local se guarda en `reports/analytics/`.
