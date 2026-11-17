# WorkLedger Labor Casebook

Cuaderno laboral sintético para organizar periodos de remuneración, antecedentes y eventos en una cronología. Es un MVP educativo para el portafolio TITAN GITHUB y una base para investigación de producto; no es asesoría jurídica ni un sistema de liquidación oficial.

## Ejecutar

Abre `index.html` en un navegador moderno. No requiere compilación ni servicios externos para su lógica. Google Fonts es opcional; el sitio usa fuentes locales de respaldo. Los cambios se guardan en `localStorage` del navegador. CSV y JSON se exportan desde la interfaz.

## Funciones

- Datos ficticios pre cargados para explorar el panel.
- Alta de periodo con bruto, líquido, base contractual de referencia, fuente y nota.
- Diferencia aritmética `base contractual ingresada - bruto registrado`. No representa deuda laboral ni compara por sí sola componentes jurídicamente equivalentes.
- Agregar metadatos de documentos y eventos; vincular una referencia documental a cada periodo.
- Gráfico y filtro por año; exportación CSV con separación de campos y protección básica frente a fórmulas de hoja de cálculo.
- Exportación del expediente local a JSON.
- Cálculos determinísticos en el navegador; cada registro es aportado por quien usa la herramienta y se etiqueta como tal.

## Alcance y límites

Todos los nombres, periodos, montos y eventos iniciales son ficticios. La demo no carga archivos ni los envía a un servidor. No integra autenticación, base de datos, almacenamiento seguro, OCR, IA, firma electrónica, cálculo tributario/previsional, reloj de plazos procesales, evaluación de evidencia ni generación de demandas. `localStorage` no es una bóveda cifrada: no ingreses RUN, datos bancarios, liquidaciones, contratos ni información real en una copia pública.

La comparación de montos sirve para detectar filas que requieren revisión documental. Las remuneraciones pueden incluir componentes de distinta naturaleza; contrasta concepto, periodo, jornada, contrato y fuente antes de extraer conclusiones. La app no determina si una diferencia es exigible, está prescrita, se debe o puede demandarse.

## Referencias oficiales de Chile

Fuentes revisadas el 16-11-2026. Los enlaces son para consulta; la app no codifica sus reglas como veredicto:

- [Código del Trabajo consolidado, Biblioteca del Congreso Nacional](https://www.bcn.cl/leychile/navegar?buscar=c%C3%B3digo%2Bdel%2Btrabajo&idNorma=207436), incluido art. 54 (comprobante de pago y desglose de remuneraciones).
- [Dirección del Trabajo: contenido del comprobante de remuneraciones](https://www.dt.gob.cl/portal/1628/w3-article-60226.html).
- [Dirección del Trabajo: prescripción de derechos laborales](https://www.dt.gob.cl/portal/1628/w3-article-60622.html).
- [Dirección del Trabajo: plazo para reclamar por despido](https://www.dt.gob.cl/portal/1628/w3-article-125098.html).
- [Dirección del Trabajo: trámite de reclamo por despido](https://www.dt.gob.cl/portal/1626/w3-article-125086.html).

Los plazos dependen del tipo de pretensión, fechas, actuaciones y hechos. Los artículos informativos de la DT y el texto normativo pueden actualizarse. Consulta directamente las fuentes vigentes y asesoría laboral calificada. Esta herramienta no ofrece recordatorios ni cómputos de plazos.

## Próximos incrementos posibles

Para avanzar hacia un producto serio hacen falta control de acceso por persona/organización, cifrado y retención de documentos, auditoría de cambios, respaldos, permisos de exportación y revisión legal de reglas versionadas antes de cualquier cálculo especializado.

## Licencia

MIT. Consulta `LICENSE`.
