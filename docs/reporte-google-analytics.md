# Reportes automáticos de Google Analytics 4

El repositorio genera dos reportes privados y complementarios:

- **Semanal:** todos los lunes a las 08:00 (hora de Argentina), con los últimos 7 días completos frente a los 7 anteriores. También puede ejecutarse manualmente para períodos de 7, 14, 28 o 30 días.
- **Mensual:** el día 3 de cada mes a las 08:00 (hora de Argentina), con el mes calendario anterior completo frente al mes calendario previo. El margen de dos días permite que Google Analytics termine de procesar los datos diarios. También puede ejecutarse manualmente para cualquier mes ya cerrado.

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

La misma propiedad y el mismo secreto sirven para ambos reportes. No hace falta crear otra cuenta de servicio ni otra credencial.

Para verificar el reporte semanal, ejecutar manualmente el workflow para 7 días. Para verificar el mensual:

1. abrir **GitHub → Actions → Reporte mensual de Google Analytics**;
2. elegir **Run workflow**;
3. dejar el campo de mes vacío para informar el último mes completo, o escribir un mes cerrado en formato `YYYY-MM`, por ejemplo `2026-09`;
4. confirmar con **Run workflow**.

Al finalizar cualquiera de los dos:

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

# Último mes calendario completo
python scripts/analytics_report.py --month previous --output-dir reports/analytics-monthly

# Un mes cerrado específico
python scripts/analytics_report.py --month 2026-09 --output-dir reports/analytics-monthly
```

La salida semanal local se guarda en `reports/analytics/` y la mensual en `reports/analytics-monthly/`.

## Qué queda manual

El código, la agenda mensual, el cálculo de meses y la exportación quedan automatizados. La intervención manual se limita a:

1. subir estos cambios a la rama principal del repositorio;
2. confirmar que el secreto `GOOGLE_ANALYTICS_CREDENTIALS_JSON` siga configurado en GitHub;
3. ejecutar una primera prueba manual y revisar que los totales sean coherentes con Google Analytics;
4. descargar los artefactos antes de 90 días si se desea conservar un archivo histórico permanente.

Los workflows programados de GitHub Actions se ejecutan desde la rama principal. Si el secreto ya alimenta correctamente el reporte semanal, no hay que realizar ninguna configuración adicional en Google Cloud ni en Google Analytics.
