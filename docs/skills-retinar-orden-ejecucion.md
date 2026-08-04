# Mapa visual de orden de ejecución de skills de documentación de Retinar

Este mapa resume el orden recomendado para usar las skills que hoy tenemos desarrolladas alrededor de la documentación de producto, releases y export regulatorio de Retinar.

## Flujo visual

```mermaid
flowchart TD
    A["Inicio<br/>Tengo que documentar algo en Retinar"] --> B{"¿Qué tipo de trabajo es?"}

    B -->|Nueva funcionalidad| C["1. documentar-nueva-funcionalidad<br/>Crea docs/new-features/NN-* y completa 00-epica.md"]
    B -->|Feature ya documentada que faltó sumar a una release| R1["agregar-feature-a-release-ya-documentada"]
    B -->|Hotfix sobre release existente| H1["hotfix-de-release-existente"]
    B -->|Exportar framework procedimental IEC| F1["actualizar-framework-iec"]
    B -->|Exportar releases auditables| E1{"¿Una release o todas?"}

    C --> D["2. documentar-trazabilidad-funcionalidad<br/>Completa 01-trazabilidad.md"]
    D --> G["3. documentar-riesgos-funcionalidad<br/>Completa 02-riesgos.md"]
    G --> T["4. disenar-plan-testeo-funcionalidad<br/>Completa 03-tests/"]
    T --> DD["5. documentar-diseno-detallado-funcionalidad<br/>Completa 04-diseno-detallado/ y 06-trazabilidad-controles-riesgos.md"]
    DD --> P["6. documentar-plan-implementacion-funcionalidad<br/>Completa 05-plans/"]

    P --> X{"¿Qué quiero hacer después?"}
    X -->|Publicar gestión en Shortcut| S0{"¿Solo épica o todo?"}
    X -->|Implementar la feature en código| I1["implementar-feature-completa-para-retinar"]
    X -->|Preparar una release con una o más features| PR["preparar-release-retinar"]
    X -->|Dejar solo la documentación lista| Z["Fin de documentación de feature"]

    S0 -->|Solo épica| S1["shortcut-crear-epica-desde-00-epica"]
    S0 -->|Épica + tickets + testing| S2["shortcut-publicar-feature-desde-docs"]
    S1 --> PR
    S2 --> PR
    I1 --> PR

    PR --> EM["generar-email-release-notes-retinar<br/>Genera YAML, HTML y TXT del mail"]
    EM --> EX{"¿Necesito export regulatorio?"}
    EX -->|Sí, una release puntual| E2["exportar-release-puntual-segun-iec"]
    EX -->|Sí, todas las releases| E3["exportar-releases-docx-xlsx"]
    EX -->|No| Z2["Fin de release"]

    E1 -->|Una release puntual| E2
    E1 -->|Todas las releases| E3

    R1 --> Z2
    H1 --> EM
    F1 --> Z3["Fin de export del framework"]

    classDef main fill:#e8f4ea,stroke:#1f6f43,stroke-width:2px,color:#123524;
    classDef branch fill:#eef6ff,stroke:#2b6cb0,stroke-width:2px,color:#1a365d;
    classDef output fill:#fff7e6,stroke:#b7791f,stroke-width:2px,color:#744210;
    classDef finale fill:#f3f0ff,stroke:#6b46c1,stroke-width:2px,color:#44337a;

    class C,D,G,T,DD,P,PR,EM main;
    class R1,H1,F1,E2,E3,S1,S2,I1 branch;
    class E1,S0,X,EX branch;
    class Z,Z2,Z3 finale;
```

## Orden recomendado para una feature nueva

1. `documentar-nueva-funcionalidad`
2. `documentar-trazabilidad-funcionalidad`
3. `documentar-riesgos-funcionalidad`
4. `disenar-plan-testeo-funcionalidad`
5. `documentar-diseno-detallado-funcionalidad`
6. `documentar-plan-implementacion-funcionalidad`
7. Opcional: publicar en Shortcut
8. Opcional: `implementar-feature-completa-para-retinar`
9. `preparar-release-retinar`
10. `generar-email-release-notes-retinar`
11. Opcional: export regulatorio de la release

## Por qué este orden

- `01-trazabilidad.md` depende de que `00-epica.md` ya esté bien cerrada.
- `02-riesgos.md` depende de la épica y de la trazabilidad.
- `03-tests/` conviene diseñarlo antes del diseño detallado para que QA quede incorporado al razonamiento de diseño.
- `04-diseno-detallado/` ya usa épica, trazabilidad, riesgos y tests como insumo.
- `05-plans/` queda mucho mejor cuando el diseño ya aterrizó unidades, arquitectura y alcance real.
- La release recién conviene prepararla cuando la feature ya está documentada de punta a punta.

## Atajos y desvíos importantes

- Si la feature ya existe y solo faltó incorporarla a una release ya documentada, usar `agregar-feature-a-release-ya-documentada`.
- Si el cambio es un fix puntual sobre una release existente, usar `hotfix-de-release-existente` en vez del flujo de feature nueva.
- Si no estás preparando una release sino solo exportando evidencia ya existente, ir directo a `exportar-release-puntual-segun-iec` o `exportar-releases-docx-xlsx`.
- Si lo que necesitás es regenerar los procedimientos del framework IEC 62304, usar `actualizar-framework-iec`.

## Archivos generados por cada tramo

- Feature nueva:
  `docs/new-features/NN-*/00-epica.md`
  `01-trazabilidad.md`
  `02-riesgos.md`
  `03-tests/`
  `04-diseno-detallado/`
  `05-plans/`
  `06-trazabilidad-controles-riesgos.md`
- Release:
  `docs/releases/vX.Y.Z/`
  `07-release-notes-email/`
- Export regulatorio:
  `docs/releases_export/`
- Framework IEC:
  `docs/framework-iec62304/export/`

## Artefactos de este mapa

- Fuente Mermaid: [skills-retinar-orden-ejecucion.mmd](/Users/ignaciorlando/Documents/retinar-website/docs/skills-retinar-orden-ejecucion.mmd)
- Esta guía: [skills-retinar-orden-ejecucion.md](/Users/ignaciorlando/Documents/retinar-website/docs/skills-retinar-orden-ejecucion.md)
