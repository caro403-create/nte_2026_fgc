# Documentos oficiales de la solución (home)

La sección "05 — Documentación oficial" de la portada (`src/components/LandingPage.jsx`)
espera exactamente estos cuatro archivos en esta carpeta. Los nombres importan: el
código los referencia de forma literal.

| Archivo                          | Qué es                                            |
|----------------------------------|---------------------------------------------------|
| `NTE_Solucion_Completa_ES.pdf`   | PDF del documento consolidado en español          |
| `NTE_Complete_Solution_EN.pdf`   | PDF del documento consolidado en inglés           |
| `qr-solucion-es.png`             | QR que apunta al PDF en español                   |
| `qr-solution-en.png`             | QR que apunta al PDF en inglés                    |

Mientras los PNG de los QR no existan, la portada muestra un recuadro punteado con la
leyenda "Espacio reservado para el código QR". En cuanto se suban con el nombre correcto,
la imagen aparece sola: no hay que tocar el código.

Los `.docx` de origen viven en `docs/` y se regeneran con `python3 docs/build_solution_doc.py`.
