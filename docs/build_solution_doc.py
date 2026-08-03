#!/usr/bin/env python3
"""
Genera los dos documentos consolidados de la solución NTE (ES / EN).

Un solo árbol de contenido produce ambos archivos, así que las dos versiones
tienen exactamente la misma estructura e información. Para regenerar:

    python3 docs/build_solution_doc.py

Salida:
    docs/NTE_Solucion_Completa_ES.docx
    docs/NTE_Complete_Solution_EN.docx
"""

import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BASE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(BASE, "platform_screenshots")

GREEN = RGBColor(0x1B, 0x43, 0x32)
GREEN_MID = RGBColor(0x2D, 0x6A, 0x4F)
GREY = RGBColor(0x5A, 0x63, 0x68)
RED = RGBColor(0xB0, 0x1B, 0x1B)
SHADE_HEAD = "1B4332"
SHADE_SOFT = "EEF3EE"
SHADE_BOX = "F4F7F3"
SHADE_PLACE = "FAFAF8"

# ---------------------------------------------------------------- helpers


def shade(cell, hexcolor):
    el = OxmlElement("w:shd")
    el.set(qn("w:val"), "clear")
    el.set(qn("w:fill"), hexcolor)
    cell._tc.get_or_add_tcPr().append(el)


def no_borders(table):
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{edge}")
        e.set(qn("w:val"), "none")
        e.set(qn("w:sz"), "0")
        borders.append(e)
    table._tbl.tblPr.append(borders)


def dashed_borders(table, color="B7C4B7"):
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right"):
        e = OxmlElement(f"w:{edge}")
        e.set(qn("w:val"), "dashed")
        e.set(qn("w:sz"), "8")
        e.set(qn("w:color"), color)
        borders.append(e)
    table._tbl.tblPr.append(borders)


def left_rule(cell, color="2D6A4F"):
    borders = OxmlElement("w:tcBorders")
    e = OxmlElement("w:left")
    e.set(qn("w:val"), "single")
    e.set(qn("w:sz"), "24")
    e.set(qn("w:color"), color)
    borders.append(e)
    cell._tc.get_or_add_tcPr().append(borders)


# ---------------------------------------------------------------- renderer


class Doc:
    def __init__(self, lang):
        self.lang = lang
        self.d = Document()
        self.fig = 0
        self.tab = 0
        self._setup()

    def _setup(self):
        s = self.d.sections[0]
        s.page_width, s.page_height = Cm(21.59), Cm(27.94)
        s.left_margin = s.right_margin = Cm(2.2)
        s.top_margin = Cm(2.0)
        s.bottom_margin = Cm(2.0)

        st = self.d.styles["Normal"]
        st.font.name = "Calibri"
        st.font.size = Pt(10.5)
        st.paragraph_format.space_after = Pt(7)
        st.paragraph_format.line_spacing = 1.15
        st.element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")

        for name, size, color, before in (
            ("Heading 1", 17, GREEN, 20),
            ("Heading 2", 12.5, GREEN_MID, 14),
            ("Heading 3", 11, GREEN_MID, 10),
        ):
            h = self.d.styles[name]
            h.font.name = "Calibri"
            h.font.size = Pt(size)
            h.font.color.rgb = color
            h.font.bold = True
            h.paragraph_format.space_before = Pt(before)
            h.paragraph_format.space_after = Pt(5)

    # -- primitives -------------------------------------------------

    def p(self, text, size=10.5, bold=False, italic=False, color=None,
          align=None, space_after=7, style=None):
        par = self.d.add_paragraph(style=style)
        run = par.add_run(text)
        run.font.size = Pt(size)
        run.bold = bold
        run.italic = italic
        if color:
            run.font.color.rgb = color
        if align:
            par.alignment = align
        par.paragraph_format.space_after = Pt(space_after)
        return par

    def rich(self, chunks, size=10.5, align=None, space_after=7):
        """chunks: list of (text, bold) tuples."""
        par = self.d.add_paragraph()
        for text, bold in chunks:
            r = par.add_run(text)
            r.font.size = Pt(size)
            r.bold = bold
        if align:
            par.alignment = align
        par.paragraph_format.space_after = Pt(space_after)
        return par

    def h1(self, text):
        self.d.add_heading(text, level=1)

    def h2(self, text):
        self.d.add_heading(text, level=2)

    def bullets(self, items):
        for it in items:
            if isinstance(it, tuple):
                par = self.d.add_paragraph(style="List Bullet")
                r = par.add_run(it[0] + " ")
                r.bold = True
                r.font.size = Pt(10.5)
                r2 = par.add_run(it[1])
                r2.font.size = Pt(10.5)
            else:
                par = self.d.add_paragraph(it, style="List Bullet")
                par.runs[0].font.size = Pt(10.5)
            par.paragraph_format.space_after = Pt(3)

    def numbered(self, items):
        for it in items:
            par = self.d.add_paragraph(it, style="List Number")
            par.runs[0].font.size = Pt(10.5)
            par.paragraph_format.space_after = Pt(3)

    def table(self, headers, rows, caption=None, widths=None):
        self.tab += 1
        t = self.d.add_table(rows=1, cols=len(headers))
        t.style = "Table Grid"
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        hdr = t.rows[0].cells
        for i, h in enumerate(headers):
            hdr[i].text = ""
            par = hdr[i].paragraphs[0]
            r = par.add_run(h)
            r.bold = True
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            par.paragraph_format.space_after = Pt(2)
            shade(hdr[i], SHADE_HEAD)
        for ri, row in enumerate(rows):
            cells = t.add_row().cells
            for i, val in enumerate(row):
                cells[i].text = ""
                par = cells[i].paragraphs[0]
                # **bold** markers inside cells
                for j, part in enumerate(str(val).split("**")):
                    r = par.add_run(part)
                    r.font.size = Pt(8.8)
                    r.bold = (j % 2 == 1)
                par.paragraph_format.space_after = Pt(2)
                if ri % 2 == 1:
                    shade(cells[i], SHADE_SOFT)
        if widths:
            for row in t.rows:
                for i, w in enumerate(widths):
                    row.cells[i].width = Cm(w)
        if caption:
            self.caption(f"{self.cap_word_table} {self.tab}. {caption}")
        self.p("", size=4, space_after=2)
        return t

    def caption(self, text):
        par = self.d.add_paragraph()
        r = par.add_run(text)
        r.font.size = Pt(8.5)
        r.italic = True
        r.font.color.rgb = GREY
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        par.paragraph_format.space_before = Pt(3)
        par.paragraph_format.space_after = Pt(10)

    def image(self, filename, caption, width=16.0):
        path = os.path.join(SHOTS, filename)
        self.fig += 1
        par = self.d.add_paragraph()
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        par.paragraph_format.space_after = Pt(2)
        par.add_run().add_picture(path, width=Cm(width))
        self.caption(f"{self.cap_word_fig} {self.fig}. {caption}")

    def placeholder(self, label, hint, height_cm=6.0):
        """Marco punteado: espacio reservado para una foto que aún no existe.

        La altura se fija con trHeight ("atLeast"), así el marco conserva su
        tamaño aunque el texto guía sea corto, y crece si alguien pega una
        imagen más grande dentro.
        """
        self.fig += 1
        t = self.d.add_table(rows=1, cols=1)
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = t.rows[0].cells[0]
        cell.width = Cm(16.0)
        shade(cell, SHADE_PLACE)
        dashed_borders(t)

        trPr = t.rows[0]._tr.get_or_add_trPr()
        h = OxmlElement("w:trHeight")
        h.set(qn("w:val"), str(int(height_cm * 567)))  # cm -> twips
        h.set(qn("w:hRule"), "atLeast")
        trPr.append(h)

        cell.text = ""
        pad = cell.paragraphs[0]
        pad.paragraph_format.space_after = Pt(height_cm * 7)
        p1 = cell.add_paragraph()
        p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p1.add_run(self.place_word)
        r.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = GREEN_MID
        p2 = cell.add_paragraph()
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r2 = p2.add_run(label)
        r2.font.size = Pt(11)
        r2.bold = True
        p3 = cell.add_paragraph()
        p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r3 = p3.add_run(hint)
        r3.font.size = Pt(8.5)
        r3.italic = True
        r3.font.color.rgb = GREY
        self.caption(f"{self.cap_word_fig} {self.fig}. {label}")

    def callout(self, title, text):
        t = self.d.add_table(rows=1, cols=1)
        cell = t.rows[0].cells[0]
        cell.width = Cm(16.6)
        shade(cell, SHADE_BOX)
        no_borders(t)
        left_rule(cell)
        cell.text = ""
        p1 = cell.paragraphs[0]
        p1.paragraph_format.space_before = Pt(6)
        r = p1.add_run(title)
        r.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = GREEN
        p2 = cell.add_paragraph()
        p2.paragraph_format.space_after = Pt(6)
        r2 = p2.add_run(text)
        r2.font.size = Pt(10)
        self.p("", size=4, space_after=4)

    def code(self, text, caption=None):
        t = self.d.add_table(rows=1, cols=1)
        cell = t.rows[0].cells[0]
        cell.width = Cm(16.6)
        shade(cell, "F5F6F5")
        no_borders(t)
        cell.text = ""
        first = True
        for line in text.split("\n"):
            par = cell.paragraphs[0] if first else cell.add_paragraph()
            first = False
            r = par.add_run(line if line else " ")
            r.font.name = "Consolas"
            r.font.size = Pt(8)
            par.paragraph_format.space_after = Pt(0)
            par.paragraph_format.line_spacing = 1.0
        if caption:
            self.fig += 1
            self.caption(f"{self.cap_word_fig} {self.fig}. {caption}")
        else:
            self.p("", size=4, space_after=4)

    def kpis(self, items):
        """items: list of (number, label)"""
        t = self.d.add_table(rows=2, cols=len(items))
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        no_borders(t)
        for i, (num, label) in enumerate(items):
            c = t.rows[0].cells[i]
            c.text = ""
            par = c.paragraphs[0]
            par.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = par.add_run(num)
            r.bold = True
            r.font.size = Pt(20)
            r.font.color.rgb = GREEN
            par.paragraph_format.space_after = Pt(0)
            c2 = t.rows[1].cells[i]
            c2.text = ""
            par2 = c2.paragraphs[0]
            par2.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r2 = par2.add_run(label)
            r2.font.size = Pt(8)
            r2.font.color.rgb = GREY
        self.p("", size=6, space_after=8)

    def flow(self, steps):
        """Cadena horizontal: [(titulo, sub), ...]"""
        n = len(steps)
        cols = n * 2 - 1
        t = self.d.add_table(rows=2, cols=cols)
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        no_borders(t)
        for i, (title, sub) in enumerate(steps):
            ci = i * 2
            c = t.rows[0].cells[ci]
            c.text = ""
            shade(c, SHADE_SOFT)
            par = c.paragraphs[0]
            par.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = par.add_run(title)
            r.bold = True
            r.font.size = Pt(8.5)
            r.font.color.rgb = GREEN
            par.paragraph_format.space_before = Pt(4)
            par.paragraph_format.space_after = Pt(1)
            c2 = t.rows[1].cells[ci]
            c2.text = ""
            shade(c2, SHADE_SOFT)
            par2 = c2.paragraphs[0]
            par2.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r2 = par2.add_run(sub)
            r2.font.size = Pt(7.5)
            r2.font.color.rgb = GREY
            par2.paragraph_format.space_after = Pt(4)
            if i < n - 1:
                a = t.rows[0].cells[ci + 1]
                a.text = ""
                pa = a.paragraphs[0]
                pa.alignment = WD_ALIGN_PARAGRAPH.CENTER
                ra = pa.add_run("→")
                ra.font.size = Pt(11)
                ra.font.color.rgb = GREEN_MID
        self.p("", size=6, space_after=8)

    def rule(self):
        par = self.d.add_paragraph()
        pPr = par._p.get_or_add_pPr()
        pbdr = OxmlElement("w:pBdr")
        b = OxmlElement("w:bottom")
        b.set(qn("w:val"), "single")
        b.set(qn("w:sz"), "6")
        b.set(qn("w:color"), "C8D3C8")
        pbdr.append(b)
        pPr.append(pbdr)
        par.paragraph_format.space_after = Pt(10)

    def page_break(self):
        self.d.add_page_break()

    def save(self, path):
        self.d.save(path)


# ---------------------------------------------------------------- content

L = {
    "es": {
        "cap_fig": "Figura",
        "cap_tab": "Tabla",
        "place": "ESPACIO RESERVADO PARA FOTOGRAFÍA",
        "file": "NTE_Solucion_Completa_ES.docx",
    },
    "en": {
        "cap_fig": "Figure",
        "cap_tab": "Table",
        "place": "SPACE RESERVED FOR PHOTOGRAPH",
        "file": "NTE_Complete_Solution_EN.docx",
    },
}


def build(lang):
    d = Doc(lang)
    d.cap_word_fig = L[lang]["cap_fig"]
    d.cap_word_table = L[lang]["cap_tab"]
    d.place_word = L[lang]["place"]
    es = lang == "es"
    T = (lambda a, b: a if es else b)

    # ============================================================ PORTADA
    d.p(T("FIRST GLOBAL CHALLENGE 2026 · INCHEON · NEW TECHNOLOGY EXPERIENCE",
          "FIRST GLOBAL CHALLENGE 2026 · INCHEON · NEW TECHNOLOGY EXPERIENCE"),
        size=8.5, bold=True, color=GREEN_MID, space_after=4)
    d.p(T("SISTEMA DE DEFENSA ACTIVA (NTE)",
          "ACTIVE DEFENCE SYSTEM (NTE)"),
        size=26, bold=True, color=GREEN, space_after=2)
    d.p(T("Detección de incendios forestales con nodos sensores LoRaWAN e inteligencia artificial",
          "Detecting Wildfires With LoRaWAN Sensor Nodes and Artificial Intelligence"),
        size=13, color=GREEN_MID, space_after=10)
    d.p(T("Equipo: FIRST Global Team Colombia",
          "Team: FIRST Global Team Colombia"), size=11, bold=True, space_after=4)
    d.p(T("Documento consolidado de la solución completa · Versión 2.0 · Agosto de 2026",
          "Consolidated complete-solution document · Version 2.0 · August 2026"),
        size=9.5, color=GREY, space_after=12)

    d.p(T("Una plataforma integral contra el fuego para Colombia: sensado que no depende de "
          "internet, alertas automáticas por Telegram, capas de información en vivo, un modelo "
          "predictivo construido sobre 15 años de registros nacionales de incendios y "
          "biorremediación robótica del suelo cuando el fuego termina.",
          "An end-to-end wildfire platform for Colombia: internet-independent sensing, automatic "
          "Telegram alerting, live information layers, a predictive risk model built on 15 years "
          "of national fire records, and robotic soil bioremediation after the fire is out."),
        size=11, space_after=12)

    d.table(
        [T("Campo", "Field"), T("Contenido", "Content")],
        [
            [T("Nombre del equipo", "Team name"), "FIRST Global Team Colombia"],
            [T("Título del proyecto", "Project title"),
             T("Sistema de Defensa Activa (NTE): detección de incendios forestales con nodos "
               "sensores LoRaWAN e IA",
               "Active Defence System (NTE): Detecting Wildfires With LoRaWAN Sensor Nodes and AI")],
            [T("Categoría", "Category"),
             T("**DETECTAR** (con prevención y recuperación post-incendio como extensiones integradas)",
               "**DETECT** (with prevention and post-fire recovery as integrated extensions)")],
            [T("Región de trabajo", "Working region"),
             T("Valle del Cauca, Colombia — Bosque Seco Tropical y corredor andino",
               "Valle del Cauca, Colombia — Tropical Dry Forest and the Andean corridor")],
            [T("Base de datos del proyecto", "Project dataset"),
             T("14.985 registros de incendios del IDEAM, 2010–2025, procesados por el equipo",
               "14,985 IDEAM wildfire records, 2010–2025, processed by the team")],
            [T("Estado", "Status"),
             T("Plataforma web operativa; nodos y modelo predictivo en construcción",
               "Web platform operational; nodes and predictive model under construction")],
        ],
        widths=[4.5, 12.1],
    )

    d.kpis([
        ("14.985" if es else "14,985", T("registros de incendios\nanalizados (IDEAM 2010–2025)",
                                          "wildfire records analysed\n(IDEAM 2010–2025)")),
        ("406", T("puntos de ignición\nrecurrentes identificados",
                  "recurrent ignition points\nidentified nationwide")),
        ("0", T("conexión a internet\nrequerida en el nodo",
                "internet connection required\nat the sensor node")),
        ("6", T("módulos que cubren el\nciclo completo del fuego",
                "modules covering the\nfull fire cycle")),
    ])

    d.callout(
        T("CÓMO LEER ESTE DOCUMENTO", "HOW TO READ THIS DOCUMENT"),
        T("Las secciones 1 a 4 explican cómo trabajamos, qué categoría elegimos y cuál es el "
          "problema, con los datos que lo sustentan. Las secciones 5 a 11 describen la solución "
          "módulo por módulo. Las secciones 12 a 15 cubren la tecnología, el estado real de cada "
          "componente, el impacto y la continuidad. El anexo reúne las fotografías del proyecto.",
          "Sections 1 to 4 explain how we worked, which category we chose and what the problem is, "
          "with the data that supports it. Sections 5 to 11 describe the solution module by module. "
          "Sections 12 to 15 cover the technology, the honest status of every component, the impact "
          "and the continuation. The appendix collects the project photographs."))

    d.image("landing.jpg",
            T("Portada pública de la plataforma NTE. El sistema está construido y en "
              "funcionamiento; todas las capturas de este documento provienen de la aplicación real.",
              "Public front page of the NTE platform. The system is built and running; every "
              "screenshot in this document comes from the real application."))

    d.page_break()

    # ============================================================ 1 METODOLOGÍA
    d.h1(T("1. Metodología de trabajo", "1. Working methodology"))
    d.p(T("El proyecto se desarrolla con un enfoque iterativo y modular: en lugar de diseñar el "
          "sistema completo antes de construir nada, dividimos la solución en seis módulos "
          "independientes y avanzamos en todos en paralelo, validando cada uno con evidencia real "
          "antes de integrarlo. Esto nos permite tener una plataforma funcionando mientras el "
          "hardware todavía está en construcción, y corregir el diseño con datos y no con "
          "suposiciones.",
          "The project is developed with an iterative, modular approach: instead of designing the "
          "whole system before building anything, we split the solution into six independent "
          "modules and advance all of them in parallel, validating each one against real evidence "
          "before integrating it. That is what lets us have a working platform while the hardware "
          "is still under construction, and correct the design with data rather than assumptions."))
    d.p(T("El trabajo se organiza en sesiones presenciales de equipo con seguimiento de asistencia "
          "y en tres etapas encadenadas:",
          "The work is organised in in-person team sessions with attendance tracking, and in three "
          "chained stages:"))
    d.table(
        [T("Etapa", "Stage"), T("Qué hicimos", "What we did"), T("Resultado", "Output")],
        [
            [T("Investigación y diagnóstico", "Research and diagnosis"),
             T("Analizamos el estado de los incendios forestales en Colombia, revisamos las "
               "soluciones ya implementadas y sus límites, y nos formamos en sensórica, IoT, "
               "programación, teledetección y biotecnología.",
               "We analysed the state of wildfire in Colombia, reviewed the solutions already "
               "deployed and their limits, and trained the team in sensing, IoT, programming, "
               "remote sensing and biotechnology."),
             T("Un diagnóstico cuantificado del problema y un equipo con las competencias técnicas "
               "necesarias para atacarlo.",
               "A quantified diagnosis of the problem and a team with the technical skills needed "
               "to attack it.")],
            [T("Formulación de la propuesta", "Proposal formulation"),
             T("Estudiamos a fondo el reto de FIRST Global y sus criterios, comparamos "
               "alternativas técnicas, identificamos aliados (bomberos, autoridades ambientales, "
               "comunidad) y definimos la arquitectura de seis módulos.",
               "We studied the FIRST Global challenge and its criteria in depth, compared technical "
               "alternatives, identified allies (fire brigades, environmental authorities, the "
               "community) and defined the six-module architecture."),
             T("La categoría elegida (Detectar), la arquitectura de seis módulos y el mapa de "
               "aliados del territorio.",
               "The chosen category (Detect), the six-module architecture and the map of allies in "
               "the territory.")],
            [T("Construcción y validación", "Building and validation"),
             T("Procesamos la base histórica del IDEAM, construimos la plataforma web, integramos "
               "las fuentes satelitales, fijamos el contrato de datos del nodo y empezamos los "
               "ensayos de laboratorio de biorremediación.",
               "We processed the IDEAM historical dataset, built the web platform, integrated the "
               "satellite sources, fixed the node data contract and started the bioremediation "
               "laboratory trials."),
             T("Una plataforma operativa, 14.985 registros integrados y el contrato de datos del "
               "nodo fijado.",
               "An operational platform, 14,985 records integrated and the node data contract "
               "fixed.")],
        ],
        caption=T("Las tres etapas del proceso. Cada una alimenta a la siguiente con evidencia, no "
                  "con opiniones.",
                  "The three stages of the process. Each one feeds the next with evidence, not "
                  "opinions."),
        widths=[3.0, 8.2, 5.4],
    )
    d.p(T("Un principio guía todo el desarrollo: nada entra al documento ni a la plataforma si no "
          "se puede mostrar funcionando o sustentar con una fuente. Por eso la sección 14 declara "
          "de forma explícita qué está construido y qué está en proceso.",
          "One principle guides the whole development: nothing enters the document or the platform "
          "unless it can be shown working or backed by a source. That is why Section 14 states "
          "explicitly what is built and what is in progress."))

    # ============================================================ 2 CATEGORÍA
    d.h1(T("2. Categoría: DETECTAR", "2. Category: DETECT"))
    d.callout(
        T("CATEGORÍA SELECCIONADA: DETECTAR", "CATEGORY SELECTED: DETECT"),
        T("Nuestra contribución técnica central es una red de nodos multisensoriales LoRaWAN y un "
          "motor de fusión que identifican un incendio en sus primeros minutos en zonas sin "
          "conectividad, y despachan la alarma automáticamente. La prevención (mapa predictivo de "
          "riesgo) y la recuperación post-incendio (biorremediación del suelo) se construyen sobre "
          "la misma columna de datos y se presentan como extensiones integradas del sistema de "
          "detección, no como proyectos separados.",
          "Our core technical contribution is a network of multi-sensor LoRaWAN nodes and a fusion "
          "engine that identify a wildfire in its first minutes in areas with no connectivity, and "
          "dispatch the alarm automatically. Prevention (predictive risk mapping) and post-fire "
          "recovery (soil bioremediation) are built on the same data backbone and are presented as "
          "integrated extensions of the detection system, not as separate projects."))
    d.p(T("Elegimos Detectar por cuatro razones concretas:",
          "We chose Detect for four concrete reasons:"))
    d.bullets([
        (T("El centro de gravedad es la detección temprana.",
           "The centre of gravity is early detection."),
         T("El problema técnico más difícil que resolvimos es sensar señales de combustión en un "
           "bosque remoto y sacar esa señal sin internet. Todos los demás módulos consumen lo que "
           "produce la capa de detección.",
           "The hardest technical problem we solved is sensing combustion signatures in a remote "
           "forest and getting that signal out without internet. Every other module consumes what "
           "the detection layer produces.")),
        (T("La definición de la guía coincide exactamente.",
           "The guide's definition matches exactly."),
         T("FIRST Global define detección como «identificar incendios en entornos naturales lo "
           "antes posible para permitir una respuesta y contención rápidas». Esa es la función "
           "literal de nuestros módulos I, II y III.",
           "FIRST Global defines detection as 'identifying fires in natural environments as early "
           "as possible to enable rapid response and containment'. That is the literal function of "
           "our Modules I, II and III.")),
        (T("Las tecnologías que aplicamos son tecnologías de detección.",
           "The technologies we apply are detection technologies."),
         T("Monitoreo y sensórica, redes de área amplia de baja potencia, algoritmos de fusión de "
           "sensores, IA en el borde para clasificar humo y llama, y sistemas automáticos de "
           "comunicación.",
           "Monitoring and sensing, low-power wide-area networking, sensor-fusion algorithms, edge "
           "AI for smoke and flame classification, and automated communication systems.")),
        (T("La brecha medida de Colombia es una brecha de detección.",
           "Colombia's measured gap is a detection gap."),
         T("Como muestra la sección 3, el cuello de botella del país es el tiempo hasta la "
           "detección, no la voluntad ni la capacidad de responder.",
           "As Section 3 shows, the country's bottleneck is time-to-detection, not willingness or "
           "capacity to respond.")),
    ])
    d.table(
        [T("Categoría", "Category"), T("Cómo contribuye nuestra solución", "How our solution contributes"),
         T("Módulos", "Modules")],
        [
            [T("**Detectar** (principal)", "**Detect** (primary)"),
             T("Nodos multisensoriales, transporte LoRaWAN, motor local de fusión, despacho "
               "automático por Telegram, capa de focos satelitales en vivo.",
               "Multi-sensor nodes, LoRaWAN transport, local sensor-fusion decision engine, "
               "automatic Telegram dispatch, live satellite hotspot layer."),
             "I, II, III, IV"],
            [T("**Prevenir** (integrada)", "**Prevent** (integrated)"),
             T("Mapa predictivo = recurrencia histórica × meteorología de incendio actual; umbrales "
               "estacionales; capa educativa y reportes comunitarios; el suelo restaurado es en sí "
               "una medida de prevención.",
               "Predictive map = historical recurrence × current fire-weather; seasonal thresholds; "
               "education layer and community reporting; restored soil is itself a prevention "
               "measure against the next burn."),
             "IV, V, VI"],
            [T("**Combatir** (de apoyo)", "**Combat** (supporting)"),
             T("La plataforma da a las brigadas la imagen operacional durante la extinción: "
               "telemetría, vector de viento, frente estimado, rutas y trazabilidad. No "
               "construimos hardware de extinción.",
               "The platform gives brigades the operational picture during suppression: telemetry, "
               "wind vector, spread-front estimate, routes and dispatch traceability. We do not "
               "build suppression hardware."),
             "III, IV"],
        ],
        caption=T("Cobertura de categorías. El proyecto se evalúa bajo Detectar; las otras dos son "
                  "extensiones de la misma columna de datos.",
                  "Category coverage. The project is judged under Detect; the other two are "
                  "extensions of the same data backbone."),
        widths=[3.2, 10.4, 3.0],
    )

    d.page_break()

    # ============================================================ 3 PROBLEMA
    d.h1(T("3. El problema: los incendios forestales en Colombia",
           "3. The problem: wildfire in Colombia"))
    d.p(T("Colombia pierde cada año decenas de miles de hectáreas de bosque, páramo y humedal por "
          "incendios que casi siempre se detectan demasiado tarde. Nuestro registro nacional —"
          "14.985 incidentes georreferenciados entre 2010 y 2025— muestra que los incendios no son "
          "aleatorios: se concentran en los mismos municipios, en las mismas dos temporadas secas, "
          "y 406 coordenadas se han quemado repetidamente en varios años. La información para "
          "actuar temprano existe. Lo que no existe, en los lugares que se queman, es un "
          "instrumento que vigile el bosque de forma continua y le diga a un bombero, en minutos, "
          "que algo está empezando.",
          "Colombia loses tens of thousands of hectares of forest, páramo and wetland every year to "
          "wildfires that are almost always detected too late. Our national fire record — 14,985 "
          "georeferenced incidents between 2010 and 2025 — shows that the fires are not random: "
          "they concentrate in the same municipalities, in the same two dry seasons, and 406 "
          "coordinates have burned repeatedly across multiple years. The information to act early "
          "exists. What does not exist, in the places that burn, is an instrument that senses the "
          "forest continuously and tells a firefighter, in minutes, that something is starting."))

    d.h2(T("3.1 Lo que muestran los datos", "3.1 What the data shows"))
    d.p(T("El equipo compiló y procesó el registro nacional de incendios del IDEAM (Instituto de "
          "Hidrología, Meteorología y Estudios Ambientales), cruzado con clasificaciones de bioma, "
          "ecosistema, clima, paisaje, relieve y suelos, y con archivos de focos satelitales. El "
          "conjunto resultante está incrustado en la plataforma y es la base empírica de todo el "
          "proyecto. Tres hallazgos guían el diseño:",
          "The team compiled and processed the national wildfire record maintained by IDEAM "
          "(Instituto de Hidrología, Meteorología y Estudios Ambientales), cross-referenced with "
          "biome, ecosystem, climate, landscape, relief and soil classifications, and with "
          "satellite hotspot archives. The resulting dataset is embedded in the platform and is the "
          "empirical foundation of the entire project. Three findings drive the design:"))
    d.table(
        [T("Hallazgo", "Finding"), T("Evidencia en los datos", "Evidence in the data"),
         T("Consecuencia de diseño", "Design consequence")],
        [
            [T("El fuego se concentra, no se dispersa", "Fire is concentrated, not scattered"),
             T("Cundinamarca (2.904), Tolima (1.767), Huila (1.187), Valle del Cauca (1.077), "
               "Boyacá (1.021) y Santander (981) reúnen la mayoría de los incidentes; domina la "
               "región andina.",
               "Cundinamarca (2,904), Tolima (1,767), Huila (1,187), Valle del Cauca (1,077), "
               "Boyacá (1,021) and Santander (981) account for the majority of incidents; the "
               "Andean region dominates."),
             T("El despliegue de nodos se puede priorizar: pocos nodos en los municipios correctos "
               "cubren una porción desproporcionada del riesgo nacional.",
               "Node deployment can be prioritised: a small number of nodes in the right "
               "municipalities covers a disproportionate share of national risk.")],
            [T("El fuego se repite en los mismos lugares", "Fire repeats in the same places"),
             T("406 coordenadas exactas registran igniciones repetidas; los puntos más persistentes "
               "—en Venecia, Ricaurte, Tocaima y Nilo (Cundinamarca)— se quemaron hasta 8 veces en "
               "hasta 5 años distintos.",
               "406 exact coordinates register repeat ignition events; the most persistent points — "
               "in Venecia, Ricaurte, Tocaima and Nilo (Cundinamarca) — burned up to 8 times across "
               "as many as 5 separate years."),
             T("La recurrencia histórica es una variable predictiva legítima: la mitad del «dónde» "
               "de nuestro modelo de riesgo.",
               "Historical recurrence is a legitimate predictive variable — the 'where' half of our "
               "risk model.")],
            [T("El fuego sigue un calendario bimodal", "Fire follows a bimodal calendar"),
             T("Los incidentes se agrupan en la temporada seca de diciembre a marzo y otra vez "
               "entre julio y septiembre, siguiendo el régimen bimodal de lluvias andino.",
               "Incidents cluster in the December–March dry season and again in July–September, "
               "matching the Andean bimodal rainfall regime."),
             T("Los umbrales de riesgo y la sensibilidad de las alertas se ajustan por temporada: "
               "la mitad del «cuándo».",
               "Risk thresholds and alert sensitivity are seasonally adjusted — the 'when' half of "
               "the model.")],
        ],
        caption=T("Tres hallazgos estructurales de 14.985 registros colombianos de incendios "
                  "(IDEAM, 2010–2025).",
                  "Three structural findings from 14,985 Colombian wildfire records (IDEAM, "
                  "2010–2025)."),
        widths=[3.4, 6.6, 6.6],
    )

    d.h2(T("3.2 A quién afecta y por qué falla la práctica actual",
           "3.2 Who is affected and why current practice fails"))
    d.p(T("Las personas más expuestas son las comunidades rurales y periurbanas del corredor "
          "andino, los pequeños agricultores, las comunidades indígenas y campesinas, y las "
          "brigadas de bomberos voluntarios que responden con equipo limitado. Los ecosistemas más "
          "amenazados son justamente los menos reemplazables: el páramo —la fábrica de agua que "
          "abastece a las principales ciudades del país—, el bosque altoandino, los humedales y el "
          "bosque fragmentado, que se regeneran lentamente o no se regeneran tras una quema severa.",
          "The people most exposed are rural and peri-urban communities in the Andean corridor, "
          "small farmers, indigenous and campesino communities, and the volunteer fire brigades who "
          "respond with limited equipment. The ecosystems most at risk are precisely the least "
          "replaceable: páramo — the water factory that supplies the country's major cities — "
          "high-Andean forest, wetlands and fragmented forest, all of which regenerate slowly or "
          "not at all after severe burning."))
    d.table(
        [T("Mecanismo actual", "Current mechanism"), T("Fortaleza", "Strength"),
         T("Vacío estructural", "Structural gap")],
        [
            [T("Reporte ciudadano por teléfono", "Citizen reporting by telephone"),
             T("Rápido donde hay gente y señal.", "Fast where there are people and signal."),
             T("Inútil en las zonas remotas donde empiezan la mayoría de los incendios, y requiere "
               "que alguien ya vea el humo.",
               "Useless in the remote areas where most fires start, and it requires someone to "
               "already see smoke.")],
            [T("Focos satelitales (MODIS / VIIRS)", "Satellite hotspots (MODIS / VIIRS)"),
             T("Cobertura nacional excelente y gratuita.", "Excellent national coverage and free."),
             T("Ciclo de revisita de horas y tamaño mínimo detectable de cientos de metros "
               "cuadrados: cuando se enciende el píxel, la ventana de extinción barata ya cerró.",
               "A revisit cycle measured in hours and a minimum detectable fire size measured in "
               "hundreds of square metres: by the time a pixel lights up, the window for cheap "
               "suppression has usually closed.")],
            [T("Torres de vigilancia y patrullas", "Lookout towers and patrols"),
             T("Efectivas donde existen.", "Effective where they exist."),
             T("Escasas, caras de operar y ciegas de noche y con niebla.",
               "Scarce, expensive to staff, and blind at night and in fog.")],
        ],
        caption=T("Los tres mecanismos de detección vigentes en Colombia y su límite.",
                  "The three detection mechanisms currently used in Colombia and their limits."),
        widths=[4.0, 4.4, 8.2],
    )
    d.callout(
        T("LA BRECHA QUE ATACA ESTE PROYECTO", "THE GAP THIS PROJECT ATTACKS"),
        T("Entre «nadie se ha dado cuenta todavía» y «un satélite ya puede verlo» hay una ventana "
          "de aproximadamente una a tres horas en la que un incendio forestal sigue siendo un "
          "evento pequeño, barato y superable. Ningún instrumento existente en Colombia vigila esa "
          "ventana de forma continua en terreno remoto. Nuestros nodos sensores están diseñados "
          "para vivir dentro de ella.",
          "Between 'nobody has noticed yet' and 'a satellite can see it' there is a window of "
          "roughly one to three hours in which a wildfire is still a small, cheap, survivable "
          "event. No existing instrument in Colombia watches that window continuously in remote "
          "terrain. Our sensor nodes are designed to live inside it."))

    d.h2(T("3.3 Por qué elegimos este problema", "3.3 Why we chose this problem"))
    d.p(T("Nuestro equipo está en el Valle del Cauca, en el corredor andino que los datos "
          "identifican como la región más afectada del país. Hemos visto columnas de humo de "
          "temporada seca desde nuestra propia ciudad, hemos visto incendios de caña y de ladera "
          "cruzar hacia reserva forestal, y las brigadas municipales nos han dicho que su factor "
          "limitante no es el valor ni el equipo: es el tiempo. Se enteran tarde. Todo lo demás se "
          "deriva de ahí. Además, las proyecciones climáticas para los Andes tropicales apuntan a "
          "sequías más largas e intensas, y cada quema severa degrada el suelo que retendría "
          "humedad y vegetación, lo que hace más probable y más grave el siguiente incendio. Ese "
          "bucle de retroalimentación es la razón por la que el proyecto cubre deliberadamente los "
          "dos extremos del ciclo: detectar antes y reparar el suelo después.",
          "Our team is based in the Valle del Cauca, in the Andean corridor that the data "
          "identifies as the country's most fire-affected region. We have watched dry-season smoke "
          "columns from our own city, seen sugarcane and hillside fires cross into forest reserve, "
          "and heard from municipal brigades that their limiting factor is not courage or equipment "
          "— it is time. They learn about fires late. Everything else follows from that. In "
          "addition, climate projections for the tropical Andes point to longer and more intense "
          "dry spells, and each severe burn degrades the soil that would otherwise hold moisture "
          "and vegetation, which makes the next fire more likely and more severe. That feedback "
          "loop is why the project deliberately spans both ends of the cycle: detecting fires "
          "earlier and repairing the ground they leave behind."))

    d.page_break()

    # ============================================================ 4 SOLUCIÓN GENERAL
    d.h1(T("4. La solución completa: visión general", "4. The complete solution: overview"))
    d.p(T("El Sistema de Defensa Activa es una cadena completa que empieza dentro del bosque y "
          "termina con el ecosistema recuperándose. Seis módulos la componen, y cada eslabón puede "
          "sobrevivir a la falla del eslabón anterior: en los territorios para los que diseñamos, "
          "la conectividad, la energía y el personal son todos intermitentes.",
          "The Active Defence System is a complete chain that starts inside the forest and ends "
          "with the ecosystem recovering. Six modules make it up, and each link can survive the "
          "failure of the link above it: in the territories we design for, connectivity, power and "
          "personnel are all intermittent."))
    d.flow([
        (T("SENSAR", "SENSE"), T("nodos LoRaWAN\nen el bosque", "LoRaWAN nodes\nin the forest")),
        (T("DECIDIR", "DECIDE"), T("servidor local\nfusión de sensores", "local server\nsensor fusion")),
        (T("ALERTAR", "ALERT"), T("bot de Telegram\na las brigadas", "Telegram bot\nto brigades")),
        (T("PREDECIR", "PREDICT"), T("modelo sobre\n15 años de datos", "model on\n15 yrs of data")),
        (T("RESTAURAR", "RESTORE"), T("robot con cápsulas\nde Trichoderma", "Trichoderma\ncapsule robot")),
    ])
    d.callout(
        T("LA FRASE QUE RESUME EL PROYECTO", "THE ONE-SENTENCE PITCH"),
        T("Detectamos un incendio forestal en sus primeros minutos con nodos sensores que funcionan "
          "donde no hay internet, mandamos la alarma directamente a quienes pueden apagarlo, "
          "predecimos dónde empezará el próximo usando quince años de historia de incendios de "
          "Colombia, y cuando el fuego termina sanamos el suelo para que el bosque pueda volver "
          "solo.",
          "We detect a wildfire in its first minutes with sensor nodes that work where there is no "
          "internet, we send the alarm straight to the people who can put it out, we predict where "
          "the next fire will start using fifteen years of Colombian fire history, and when the "
          "fire is over we heal the soil so the forest can come back on its own."))
    d.table(
        ["#", T("Módulo", "Module"), T("Función", "Function"), T("Fase del ciclo", "Fire-cycle phase")],
        [
            ["I", T("Red de nodos sensores", "Sensor node network"),
             T("Percepción multisensorial en campo («los cinco sentidos»).",
               "Multi-sensory perception in the field ('the five senses')."),
             T("Detectar", "Detect")],
            ["II", T("Transporte LoRaWAN", "LoRaWAN transport"),
             T("Enlace de largo alcance, bajo consumo e independiente de internet.",
               "Long-range, low-power, internet-independent data link."),
             T("Detectar", "Detect")],
            ["III", T("Motor de alertas + Telegram", "Alert engine + Telegram"),
             T("Fusión de sensores, alarma graduada, despacho automático y trazabilidad.",
               "Sensor fusion, graded alarm, automatic dispatch and traceability."),
             T("Detectar / Combatir", "Detect / Combat")],
            ["IV", T("Plataforma + capas de información", "Platform + information layers"),
             T("Observatorio, mapa en vivo, monitoreo de nodos, comunidad.",
               "Observatory, live map, node monitoring, community."),
             T("Las cuatro fases", "All four")],
            ["V", T("Modelo predictivo", "Predictive model"),
             T("Mapa de riesgo = recurrencia histórica × meteorología de incendio actual.",
               "Risk map from historical recurrence × current fire-weather."),
             T("Prevenir", "Prevent")],
            ["VI", T("Biorremediación", "Bioremediation"),
             T("Cápsulas de Trichoderma dispensadas por un robot terrestre para restaurar el suelo.",
               "Trichoderma capsules dispensed by a ground robot to restore soil."),
             T("Recuperar / Prevenir", "Recover / Prevent")],
        ],
        caption=T("Mapa de módulos. Las secciones 5 a 11 especifican cada uno.",
                  "Module map. Sections 5 to 11 specify each one."),
        widths=[1.0, 4.0, 8.2, 3.4],
    )

    d.h2(T("4.1 La cadena de datos y su tolerancia a fallos",
           "4.1 The data chain and its failure tolerance"))
    d.table(
        [T("Eslabón", "Link"), T("Qué hace", "What it does"), T("Sobrevive sin", "Survives without")],
        [
            [T("1. Nodos sensores", "1. Sensor nodes"),
             T("Perciben el bosque de forma continua y transmiten tramas compactas por LoRaWAN.",
               "Perceive the forest continuously and transmit compact frames over LoRaWAN."),
             T("Internet, red eléctrica, cobertura celular",
               "Internet, mains power, cellular coverage")],
            [T("2. Gateway LoRaWAN", "2. LoRaWAN gateway"),
             T("Recibe las tramas de todos los nodos a su alcance (kilómetros) y las entrega al "
               "servidor local.",
               "Receives frames from every node within range (kilometres) and hands them to the "
               "local server."),
             T("Internet", "Internet")],
            [T("3. Servidor local", "3. Local server"),
             T("Ejecuta la lógica de fusión, decide si una anomalía es fuego, genera el evento "
               "graduado y dispara sirenas locales y el despacho por Telegram.",
               "Runs the sensor-fusion logic, decides whether an anomaly is a fire, raises the "
               "graded event, and triggers local sirens and the Telegram dispatch."),
             T("Internet (para detectar; no para notificar a distancia)",
               "Internet (for detection; not for remote notification)")],
            [T("4. Base de datos", "4. Database"),
             T("Fuente única de verdad: lecturas, salud de nodos, eventos, alertas, reportes "
               "comunitarios, muestras de suelo.",
               "Single source of truth: readings, node health, events, alerts, community reports, "
               "soil samples."),
             "—"],
            [T("5. Plataforma", "5. Platform"),
             T("Visualiza el territorio, monitorea la red, gestiona alertas, atiende a la "
               "comunidad, aloja el mapa predictivo y los planes de recuperación.",
               "Visualises the territory, monitors network health, manages alerts, serves the "
               "community, hosts the predictive map and the recovery plans."),
             T("Internet (modo PWA degradado con datos en caché)",
               "Internet (degraded PWA mode with cached data)")],
        ],
        caption=T("Los cinco eslabones de la cadena de datos y su tolerancia a fallos.",
                  "The five links of the data chain and their failure tolerance."),
        widths=[3.2, 8.6, 4.8],
    )
    d.callout(
        T("PRINCIPIO DE DISEÑO: LA DECISIÓN CRÍTICA OCURRE EN EL BORDE",
          "DESIGN PRINCIPLE: THE CRITICAL DECISION HAPPENS AT THE EDGE"),
        T("La plataforma nunca habla con un sensor y nunca decide por su cuenta que hay un "
          "incendio. La decisión de detección se toma en el territorio, en el servidor local, donde "
          "no se puede perder por una caída de red. La plataforma consume información ya procesada "
          "y la convierte en acción.",
          "The platform never talks to a sensor and never decides on its own that a fire exists. "
          "The detection decision is taken in the territory by the local server, where it cannot be "
          "lost to a network outage. The platform consumes already-processed information and "
          "converts it into action."))

    d.h2(T("4.2 Quién usa el sistema", "4.2 Who uses the system"))
    d.table(
        [T("Rol", "Role"), T("Qué hace en la plataforma", "What they do in the platform"),
         T("Vista principal", "Primary view")],
        [
            [T("Operador / brigada", "Operator / brigade"),
             T("Vigila alertas, confirma eventos, coordina la respuesta.",
               "Watches alerts, confirms events, coordinates the response."),
             T("Tablero, Alertas, Monitoreo", "Dashboard, Alerts, Monitoring")],
            [T("Coordinador / autoridad", "Coordinator / authority"),
             T("Planea vigilancia y recursos con riesgo e historia.",
               "Plans surveillance and resources using risk and history."),
             T("Mapa de Riesgo, Tablero Colombia", "Risk Map, Colombia Dashboard")],
            [T("Miembro de la comunidad", "Community member"),
             T("Reporta lo que ve, consulta guías, conversa con el chatbot.",
               "Reports what they see, consults guides, talks to the chatbot."),
             T("Comunidad (simple, móvil)", "Community (simple, mobile)")],
            [T("Administrador técnico", "Technical administrator"),
             T("Gestiona nodos, umbrales, usuarios e integraciones.",
               "Manages nodes, thresholds, users and integrations."),
             T("Configuración", "Settings")],
        ],
        caption=T("Roles. Los permisos y los datos visibles se limitan según el rol.",
                  "Roles. Permissions and visible data are scoped per role."),
        widths=[3.6, 8.0, 5.0],
    )

    d.page_break()

    # ============================================================ 5 MÓDULO I
    d.h1(T("5. Módulo I — La red de nodos sensores (los cinco sentidos)",
           "5. Module I — The sensor node network (the five senses)"))
    d.p(T("Un nodo es una estación autónoma, alimentada con energía solar, instalada en el bosque. "
          "En lugar de describirla como una lista de componentes, la diseñamos alrededor de una "
          "metáfora que hace legible la ingeniería para las comunidades que van a alojarla: cada "
          "nodo tiene cinco sentidos, y cada sentido informa sobre un lado distinto del triángulo "
          "del fuego (calor, combustible, comburente).",
          "A node is a self-contained, solar-powered station installed in the forest. Rather than "
          "describing it as a list of components, we designed it around a metaphor that makes the "
          "engineering legible to the communities that will host it: each node has five senses, and "
          "each sense reports on a different side of the fire triangle (heat, fuel, oxidiser)."))
    d.table(
        [T("Sentido", "Sense"), T("Qué percibe", "What it perceives"),
         T("Magnitudes medidas", "Magnitudes measured"),
         T("Aporte al triángulo del fuego", "Fire-triangle contribution")],
        [
            [T("Oído", "Hearing"), T("Sonido y crepitar", "Sound and crackle"),
             T("Nivel sonoro (dB), amplitud de onda analógica, bandera de umbral",
               "Sound level (dB), analogue waveform amplitude, threshold flag"),
             T("Señal indirecta de combustión", "Indirect combustion signal")],
            [T("Olfato", "Smell"), T("Gases, humo y partículas", "Gases, smoke and particulates"),
             T("CO / gases combustibles (ppm est.), PM2.5, PM10 (µg/m³)",
               "CO / combustible gases (ppm est.), PM2.5, PM10 (µg/m³)"),
             T("Comburente + productos de combustión", "Oxidiser + combustion products")],
            [T("Tacto", "Touch"), T("Temperatura, humedad y viento", "Temperature, humidity and wind"),
             T("Temperatura del aire y de contacto (°C), humedad relativa (%), presión (hPa), "
               "humedad del suelo (%), velocidad (m/s) y dirección (°) del viento",
               "Air and contact temperature (°C), relative humidity (%), pressure (hPa), soil "
               "moisture (%), wind speed (m/s) and direction (°)"),
             T("Calor + estado del combustible", "Heat + fuel state")],
            [T("Vista", "Sight"), T("Imagen y radiación", "Image and radiation"),
             T("Fotograma RGB (ESP32-CAM), iluminancia (lux), índice UV; clasificación de humo y "
               "llama en el dispositivo",
               "RGB frame (ESP32-CAM), illuminance (lux), UV index; on-device smoke and flame "
               "classification"),
             T("Calor", "Heat")],
            [T("Intuición", "Intuition"),
             T("Contexto ambiental de datos públicos", "Environmental context from public data"),
             T("FWI, focos satelitales, meteorología externa, NDVI",
               "FWI, satellite hotspots, external weather, NDVI"),
             T("Predicción / contexto", "Prediction / context")],
        ],
        caption=T("Los cinco sentidos, sus magnitudes y su relación con el triángulo del fuego.",
                  "The five senses, their magnitudes and their relationship with the fire triangle."),
        widths=[2.2, 3.4, 7.0, 4.0],
    )

    d.h2(T("5.1 Hardware y regla de diseño", "5.1 Hardware and design rule"))
    d.p(T("El nodo se construye sobre una plataforma Arduino MKR. La regla que le imponemos al "
          "equipo de hardware es simple: entregar la magnitud, no la marca. Si un sensor no puede "
          "dar un valor físico calibrado (un MQ-135 sin calibrar, por ejemplo), envía el valor "
          "crudo con su unidad y la normalización ocurre en el servidor. Así el sistema no queda "
          "atado a un modelo de sensor concreto.",
          "The node is built on an Arduino MKR platform. The rule we impose on the hardware team is "
          "simple: deliver the magnitude, not the brand. If a sensor cannot give a calibrated "
          "physical value (an uncalibrated MQ-135, for example), it sends the raw value plus its "
          "unit and the normalisation happens on the server. That way the system is never tied to "
          "one specific sensor model."))
    d.table(
        [T("Sentido", "Sense"), T("Sensores empleados", "Sensors used"),
         T("Qué entregan", "What they deliver")],
        [
            [T("Tacto", "Touch"), "MKR ENV Shield · DS18B20 / LM35 · HD38",
             T("Temperatura del aire y de contacto, humedad relativa, presión atmosférica, humedad "
               "del suelo",
               "Air and contact temperature, relative humidity, atmospheric pressure, soil moisture")],
            [T("Olfato", "Smell"), T("MQ-135 · sensor láser Grove PM2.5", "MQ-135 · Grove laser PM2.5"),
             T("CO₂ / gases combustibles estimados, material particulado PM2.5 y PM10",
               "Estimated CO₂ / combustible gases, PM2.5 and PM10 particulate matter")],
            [T("Vista", "Sight"), T("ESP32-CAM · MKR ENV · sensor UV Adafruit",
                                     "ESP32-CAM · MKR ENV · Adafruit UV breakout"),
             T("Imagen RGB con clasificación de humo/llama, iluminancia en lux, índice UV",
               "RGB image with smoke/flame classification, illuminance in lux, UV index")],
            [T("Oído", "Hearing"), "SparkFun Sound Detector",
             T("Amplitud de onda sonora y bandera digital al superar el umbral",
               "Sound wave amplitude and a digital flag when the threshold is crossed")],
            [T("Contexto", "Context"), T("Anemómetro + veleta · radio LoRa · monitor de batería",
                                          "Anemometer + vane · LoRa radio · battery monitor"),
             T("Vector de viento, calidad de enlace (RSSI/SNR), voltaje de batería",
               "Wind vector, link quality (RSSI/SNR), battery voltage")],
        ],
        caption=T("Selección de sensores por sentido. La lista completa de campos, unidades y tipos "
                  "constituye el diccionario de datos del nodo.",
                  "Sensor selection by sense. The full list of fields, units and types constitutes "
                  "the node's data dictionary."),
        widths=[2.4, 5.6, 8.6],
    )

    d.h2(T("5.2 La trama que produce un nodo", "5.2 The frame a node produces"))
    d.p(T("Este es el JSON canónico que produce un nodo, agrupado por subsistema. Por el aire la "
          "trama viaja en forma binaria compacta y el puente del gateway la expande a esta "
          "estructura, de modo que el servidor, la base de datos y la plataforma hablan un solo "
          "contrato.",
          "This is the canonical JSON a node produces, grouped by subsystem. Over the air the frame "
          "travels in a compact binary form and the gateway bridge expands it into this structure, "
          "so that the server, the database and the platform all speak one contract."))
    d.code(
        """{
  "node_id": 105,
  "timestamp": "2026-07-25T14:30:00Z",
  "sensors": {
    "environment": { "temperature": 34.25, "humidity": 22.8,
                     "pressure": 1008.4, "uv_radiation": 8.5 },
    "wind":        { "speed": 4.7, "direction": 185 },
    "air_quality": { "gas_co_smoke": 320.0, "pm25": 14.2, "pm10": 35.6 },
    "acoustics":   { "sound_level": 45 }
  },
  "location":    { "latitude": 3.4412, "longitude": -76.5189, "altitude": 985.6 },
  "diagnostics": { "battery_voltage": 3.92, "lora_rssi": -92, "lora_snr": 7.5 }
}""",
        caption=T("Trama real del nodo 105, Palmira, Valle del Cauca. Toda alerta que emite el "
                  "sistema es trazable hasta tramas exactamente de esta forma.",
                  "Real uplink frame from node 105, Palmira, Valle del Cauca. Every alert the "
                  "system raises is traceable to frames of exactly this shape."))
    d.p(T("Cada bloque alimenta una función específica. Con los valores del ejemplo: 34,25 °C con "
          "22,8 % de humedad es una atmósfera caliente y muy seca, condiciones en las que la "
          "humedad del combustible muerto cae rápido; el viento de 4,7 m/s desde el sur (185°) le "
          "dice a la brigada hacia dónde correría el frente antes de que llegue; 320 ppm de gas con "
          "PM2.5 en 14,2 µg/m³ está elevado pero aún dentro de la línea base de ese nodo —el ascenso "
          "brusco y simultáneo de ambos es la firma primaria del humo—; y 3,92 V de batería con "
          "RSSI de −92 dBm es un nodo sano con buen enlace. La salud del nodo y la evidencia de "
          "fuego se mantienen estrictamente separadas: una batería que falla nunca puede "
          "disfrazarse de incendio.",
          "Each block feeds a specific function. With the sample values: 34.25 °C at 22.8 % "
          "humidity is a hot, very dry atmosphere, conditions under which dead fuel moisture drops "
          "fast; wind at 4.7 m/s from the south (185°) tells the brigade which way a front would "
          "run before they arrive; 320 ppm of gas with PM2.5 at 14.2 µg/m³ is elevated but still "
          "within this node's baseline — a sharp, simultaneous rise in both is the primary smoke "
          "signature; and a 3.92 V battery with −92 dBm RSSI is a healthy node on a solid link. "
          "Node health and fire evidence are kept strictly separate: a failing battery can never "
          "masquerade as a fire."))

    d.h2(T("5.3 Cada nodo aprende su propia normalidad",
           "5.3 Every node learns its own normal"))
    d.p(T("Los umbrales absolutos no funcionan en un país con páramo a 3.500 m y bosque seco "
          "tropical a 900 m. Por eso cada nodo construye una línea base móvil de su propia "
          "normalidad: un estadístico móvil de 7 días por magnitud y por hora del día. La lógica de "
          "detección trabaja sobre la desviación respecto de esa línea base —cuántas desviaciones "
          "estándar por encima de su propio normal está esta lectura de gas, ahora mismo, a esta "
          "hora— y no sobre un número fijo. Eso es lo que permite instalar el mismo hardware y el "
          "mismo código en otro ecosistema sin volver a hacer ingeniería.",
          "Absolute thresholds do not work across a country with páramo at 3,500 m and dry tropical "
          "forest at 900 m. Each node therefore builds a rolling baseline of its own normal: a "
          "7-day moving statistic per magnitude, per hour of day. Detection logic works on "
          "deviation from that baseline — how many standard deviations above its own normal is this "
          "gas reading, right now, at this hour — rather than on a fixed number. This is what "
          "allows the same hardware and the same code to be deployed in a different ecosystem "
          "without re-engineering."))

    d.placeholder(
        T("Prototipo del nodo sensor en construcción",
          "Sensor node prototype under construction"),
        T("Sugerencia: fotografía del montaje sobre protoboard con la placa Arduino MKR, el ENV "
          "Shield y los sensores conectados; o del nodo ya encapsulado con el panel solar.",
          "Suggestion: photograph of the breadboard assembly with the Arduino MKR board, the ENV "
          "Shield and the sensors wired; or of the node already enclosed with its solar panel."))

    d.page_break()

    # ============================================================ 6 MÓDULO II
    d.h1(T("6. Módulo II — LoRaWAN: sensar sin internet",
           "6. Module II — LoRaWAN: sensing without internet"))
    d.callout(
        T("ESTA ES LA RESTRICCIÓN QUE DA FORMA A TODO EL PROYECTO",
          "THIS IS THE CONSTRAINT THAT SHAPES THE ENTIRE PROJECT"),
        T("Los lugares que se queman son los lugares sin cobertura. Cualquier sistema de detección "
          "de incendios para Colombia que asuma internet, datos celulares o red eléctrica en el "
          "sensor es un sistema que no se va a instalar donde hace falta. LoRaWAN es la decisión de "
          "diseño que hace físicamente posible el resto del proyecto en terreno remoto.",
          "The places that burn are the places with no coverage. Any wildfire detection system for "
          "Colombia that assumes internet, cellular data or mains power at the sensor is a system "
          "that will not be installed where it is needed. LoRaWAN is the design decision that makes "
          "the rest of the project physically possible in remote terrain."))
    d.p(T("LoRaWAN (Long Range Wide Area Network) es un protocolo de radio de bajo consumo y largo "
          "alcance hecho exactamente para esta situación: cantidades pequeñas de datos, enviadas "
          "con poca frecuencia, a larga distancia, por dispositivos a batería, en espectro no "
          "licenciado y sin necesidad de operador, SIM ni suscripción. Nuestros nodos son "
          "dispositivos LoRaWAN de Clase A; un único gateway —que puede ir también con energía "
          "solar sobre un cerro, una torre o el techo de una escuela— recoge todos los nodos de la "
          "zona y entrega al servidor local.",
          "LoRaWAN (Long Range Wide Area Network) is a low-power, long-range radio protocol built "
          "for exactly this situation: tiny amounts of data, sent infrequently, over long "
          "distances, by battery-powered devices, using unlicensed spectrum and requiring no "
          "operator, no SIM card and no subscription. Our nodes are Class A LoRaWAN end devices; a "
          "single gateway — which can itself be solar-powered and mounted on a hill, a tower or a "
          "school roof — collects from every node in the area and delivers to the local server."))
    d.table(
        [T("Opción", "Option"), T("Alcance en terreno", "Range in terrain"),
         T("Consumo del nodo", "Node power draw"), T("Costo recurrente", "Recurring cost"),
         T("Sin cobertura de operador", "No operator coverage"), T("Veredicto", "Verdict")],
        [
            ["Wi-Fi", "~100 m", T("Alto", "High"), T("Plan de internet", "Internet plan"),
             T("No", "No"), T("Imposible en bosque", "Impossible in forest")],
            ["4G / GSM", T("Depende de cobertura", "Coverage-dependent"), T("Alto", "High"),
             T("SIM por nodo", "SIM per node"), T("No", "No"),
             T("Falla justo donde empiezan los incendios", "Fails exactly where fires start")],
            [T("Satélite (IoT)", "Satellite (IoT)"), T("Global", "Global"), T("Alto", "High"),
             T("Alto por mensaje", "High per message"), T("Sí", "Yes"),
             T("Costo prohibitivo a escala de nodo", "Cost prohibitive at node scale")],
            ["**LoRaWAN**", T("2–5 km bajo dosel; 10–15 km línea de vista",
                              "2–5 km dense canopy; 10–15 km line of sight"),
             T("Muy bajo (años con batería + solar)", "Very low (years on battery + solar)"),
             T("Ninguno (banda ISM libre)", "None (unlicensed ISM band)"), T("Sí", "Yes"),
             T("**Seleccionado**", "**Selected**")],
        ],
        caption=T("Comparación de transportes. LoRaWAN es la única opción que satisface alcance, "
                  "consumo, costo e independencia al mismo tiempo.",
                  "Transport comparison. LoRaWAN is the only option that satisfies range, power, "
                  "cost and independence simultaneously."),
        widths=[2.2, 3.0, 2.4, 2.6, 2.2, 4.2],
    )

    d.h2(T("6.2 Diseño del enlace y economía de la trama",
           "6.2 Link design and payload economy"))
    d.bullets([
        (T("Banda y clase.", "Band and class."),
         T("Operación ISM sub-GHz según los parámetros regionales aplicables en Colombia (subbandas "
           "US915 / AU915), dispositivos de Clase A: la clase de menor consumo, en la que el nodo "
           "duerme y solo abre ventanas de recepción justo después de transmitir.",
           "Sub-GHz ISM operation per the regional parameters applicable in Colombia (US915 / AU915 "
           "sub-bands), Class A end devices — the lowest-power class, in which the node sleeps and "
           "only opens receive windows immediately after transmitting.")),
        (T("Factor de dispersión.", "Spreading factor."),
         T("Adaptativo (SF7–SF12). Los nodos cercanos al gateway usan un SF rápido y de bajo "
           "consumo; los lejanos bajo dosel caen a SF12 para máxima sensibilidad a costa de tiempo "
           "en el aire.",
           "Adaptive (SF7–SF12). Nodes close to the gateway use a fast, low-energy SF; distant "
           "nodes under canopy fall back to SF12 for maximum sensitivity at the cost of airtime.")),
        (T("Telemetría del enlace.", "Link quality telemetry."),
         T("Cada trama lleva RSSI y SNR, así la plataforma mapea de forma continua la salud de la "
           "red de radio y puede marcar un nodo cuyo enlace se degrada antes de que se quede mudo.",
           "Every frame carries RSSI and SNR, so the platform continuously maps the health of the "
           "radio network and can flag a node whose link is degrading before it goes silent.")),
        (T("Energía.", "Power."),
         T("Panel solar más celda de litio. El ciclo de trabajo mantiene la corriente media en el "
           "rango de microamperios entre transmisiones, que es lo que hace realista una operación "
           "desatendida de varios años.",
           "Solar panel plus lithium cell. The duty cycle keeps average current in the microampere "
           "range between transmissions, which is what makes multi-year unattended operation "
           "realistic.")),
        (T("Gateway.", "Gateway."),
         T("Un gateway sirve a muchos nodos y es el único equipo que necesita salida a internet; "
           "incluso eso es opcional, porque entrega las tramas al servidor local por red local y la "
           "detección continúa con la salida caída.",
           "One gateway serves many nodes and is the only device that needs a backhaul; even that "
           "is optional, because it hands frames to the local server over the local network and "
           "detection continues with the backhaul down.")),
    ])
    d.p(T("LoRaWAN da largo alcance a cambio de tramas muy pequeñas y tiempo de aire limitado. El "
          "nodo no transmite el JSON completo, sino una trama binaria empaquetada de unos 20 a 30 "
          "bytes, con una cadencia adaptativa:",
          "LoRaWAN gives long range in exchange for very small payloads and limited airtime. The "
          "node therefore does not transmit the full JSON but a packed binary frame of roughly "
          "20–30 bytes, with an adaptive cadence:"))
    d.table(
        [T("Estado del nodo", "Node state"), T("Disparador", "Trigger"),
         T("Intervalo de envío", "Uplink interval"), T("Qué envía", "What is sent")],
        [
            [T("Normal", "Normal"), T("Condiciones de línea base", "Baseline conditions"),
             T("Cada 10–15 minutos", "Every 10–15 minutes"),
             T("Trama compacta completa (los cinco sentidos + diagnósticos)",
               "Full compact frame (all senses + diagnostics)")],
            [T("Vigilancia", "Watch"), T("Un sentido desviado de su línea base",
                                          "One sense deviating from baseline"),
             T("Cada 2–5 minutos", "Every 2–5 minutes"),
             T("Trama completa, mayor cadencia", "Full frame, higher cadence")],
            [T("Alerta", "Alert"), T("Dos o más sentidos concordantes", "Two or more senses concordant"),
             T("Cada 30–60 segundos", "Every 30–60 seconds"),
             T("Trama prioritaria; se solicita captura de cámara; el servidor local escala de "
               "inmediato",
               "Priority frame; camera capture requested; the local server escalates immediately")],
            [T("Mantenimiento", "Maintenance"), T("Batería baja o enlace degradado",
                                                   "Low battery or degraded link"),
             T("Cadencia reducida", "Reduced cadence"),
             T("Solo diagnósticos, para preservar carga", "Diagnostics only, to preserve charge")],
        ],
        caption=T("Ciclo de trabajo adaptativo. La energía se gasta donde importa: la red se pone "
                  "ruidosa justo cuando algo está pasando.",
                  "Adaptive duty cycle. Energy is spent where it matters: the network gets loud "
                  "precisely when something is happening."),
        widths=[2.8, 4.0, 3.2, 6.6],
    )
    d.callout(
        T("QUÉ SIGNIFICA ESTO PARA UN JURADO O UN ALCALDE",
          "WHAT THIS MEANS FOR A JUDGE OR A MAYOR"),
        T("Un nodo se puede instalar en una ladera sin carretera, sin línea eléctrica y sin señal "
          "de teléfono, dejarse solo durante años, y aun así ser la cosa que le avisa al cuerpo de "
          "bomberos de un incendio mientras todavía es pequeño.",
          "A node can be installed on a hillside with no road, no power line and no phone signal, "
          "left alone for years, and still be the thing that tells the fire brigade about a fire "
          "while it is still small."))

    d.placeholder(
        T("Gateway LoRaWAN y despliegue en campo", "LoRaWAN gateway and field deployment"),
        T("Sugerencia: fotografía del gateway instalado en altura, o del equipo haciendo pruebas de "
          "alcance con los nodos en el bosque seco de Palmira.",
          "Suggestion: photograph of the gateway installed at height, or of the team running range "
          "tests with the nodes in the Palmira dry forest."),
        height_cm=5.0)

    d.page_break()

    # ============================================================ 7 MÓDULO III
    d.h1(T("7. Módulo III — Motor de alertas y módulo de Telegram",
           "7. Module III — Alert engine and the Telegram module"))
    d.h2(T("7.1 Fusión de sensores: de lecturas a una decisión",
           "7.1 Sensor fusion: from readings to a decision"))
    d.p(T("Un solo sensor produce falsas alarmas: un tractor que pasa sube el gas, el sol del "
          "mediodía sube la temperatura, una motosierra sube el sonido. Por eso el servidor local "
          "nunca escala con una sola señal.",
          "A single sensor produces false alarms: a passing tractor raises gas, midday sun raises "
          "temperature, a chainsaw raises sound. The local server therefore never escalates on one "
          "signal."))
    d.callout(
        T("REGLA DE FUSIÓN", "FUSION RULE"),
        T("Un evento se genera solo cuando al menos dos sentidos independientes se desvían de forma "
          "concordante de sus propias líneas base dentro de la misma ventana de tiempo y la misma "
          "vecindad espacial. La concordancia es ponderada: un ascenso simultáneo de partículas y "
          "gas (olfato) junto con un ascenso de temperatura (tacto) puntúa mucho más que cualquiera "
          "por separado. Entonces se solicita la cámara (vista) para confirmación visual, y la capa "
          "de contexto (intuición) —focos satelitales, índice meteorológico de incendio— ajusta la "
          "confianza final.",
          "An event is raised only when at least two independent senses deviate concordantly from "
          "their own baselines inside the same time window and the same spatial neighbourhood. "
          "Concordance is weighted: a simultaneous rise in particulates and gas (smell) together "
          "with a temperature rise (touch) scores far higher than either alone. The camera (sight) "
          "is then requested for visual confirmation, and the context layer (intuition) — satellite "
          "hotspots, fire-weather index — adjusts the final confidence."))

    d.h2(T("7.2 La escalera de riesgo", "7.2 The risk ladder"))
    d.p(T("Cada zona lleva una puntuación continua de riesgo de 0,0 a 1,0. Esa puntuación se mapea "
          "a cinco niveles operativos que determinan el color de la interfaz, la cadencia de los "
          "nodos y —lo más importante— a quién se le avisa.",
          "Every zone carries a continuous risk score from 0.0 to 1.0. That score maps to five "
          "operational levels which drive the colour of the interface, the cadence of the nodes "
          "and — critically — who gets told."))
    d.table(
        [T("Nivel", "Level"), T("Puntaje", "Score"), T("Significado", "Meaning"),
         T("Respuesta automática del sistema", "Automatic system response")],
        [
            [T("VERDE — Normal", "GREEN — Normal"), "0,00 – 0,20" if es else "0.00 – 0.20",
             T("Condiciones de línea base.", "Baseline conditions."),
             T("Telemetría de rutina; sin notificación.", "Routine telemetry; no notification.")],
            [T("AMARILLO — Vigilancia", "YELLOW — Watch"), "0,20 – 0,40" if es else "0.20 – 0.40",
             T("Meteorología de incendio deteriorándose o un sentido desviado.",
               "Fire-weather deteriorating or one sense deviating."),
             T("Se aumenta la cadencia del nodo; bandera en el tablero; sin despacho.",
               "Node cadence increased; dashboard flag; no dispatch.")],
            [T("NARANJA — Alerta", "ORANGE — Alert"), "0,40 – 0,60" if es else "0.40 – 0.60",
             T("Anomalía multisensorial concordante; posible ignición.",
               "Concordant multi-sensor anomaly; possible ignition."),
             T("Se crea el evento; captura de cámara; se notifica al operador dentro de la "
               "plataforma.",
               "Event created; camera capture; operator notified in-platform.")],
            [T("ROJO — Alarma", "RED — Alarm"), "0,60 – 0,80" if es else "0.60 – 0.80",
             T("Detección de incendio con alta confianza.", "High-confidence fire detection."),
             T("**Despacho automático por Telegram** a la brigada con ubicación, evidencia e "
               "imagen; sirena local; alerta crítica en la bandeja.",
               "**Automatic Telegram dispatch** to the brigade with location, evidence and image; "
               "local siren; alert appears in the tray as critical.")],
            [T("MORADO — Evacuación", "PURPLE — Evacuation"), "0,80 – 1,00" if es else "0.80 – 1.00",
             T("Incendio confirmado que amenaza a personas o a un ecosistema crítico.",
               "Fire confirmed and threatening people or critical ecosystem."),
             T("**Difusión por Telegram a todos los canales**, rutas de evacuación dibujadas, "
               "notificación a la comunidad, escalamiento al coordinador.",
               "**Telegram broadcast to all channels**, evacuation routes rendered, community "
               "notification, coordinator escalation.")],
        ],
        caption=T("La escalera de cinco niveles. Los umbrales son configurables por ecosistema: el "
                  "páramo y el bosque seco tropical no se queman en las mismas condiciones.",
                  "The five-level risk ladder. Thresholds are configurable per ecosystem — páramo "
                  "and dry tropical forest do not burn under the same conditions."),
        widths=[3.0, 2.0, 5.0, 6.6],
    )

    d.h2(T("7.3 El módulo de Telegram", "7.3 The Telegram module"))
    d.p(T("Telegram no es un adorno en este proyecto: es el mecanismo de entrega que hace útil la "
          "detección. Los cuerpos de bomberos, los líderes comunitarios y los coordinadores "
          "municipales de gestión del riesgo en Colombia ya se coordinan por grupos de Telegram y "
          "WhatsApp en sus propios teléfonos. Encontrarlos donde ya están elimina por completo la "
          "barrera de adopción: no hay app que instalar, ni capacitación, ni un dispositivo nuevo "
          "que cargar.",
          "Telegram is not a decoration on this project; it is the delivery mechanism that makes "
          "detection useful. Fire brigades, community leaders and municipal risk coordinators in "
          "Colombia already coordinate through Telegram and WhatsApp groups on their own phones. "
          "Meeting them where they already are removes the adoption barrier entirely: no app to "
          "install, no training, no new device to charge."))
    d.bullets([
        (T("Disparo.", "Trigger."),
         T("Cuando el servidor local genera un evento en nivel ROJO o MORADO, la plataforma compone "
           "la alerta y llama automáticamente a la API del bot de Telegram. No hay humano en el "
           "lazo para el despacho.",
           "When the local server raises an event at RED or PURPLE level, the platform composes the "
           "alert and calls the Telegram Bot API automatically. No human is in the loop for the "
           "dispatch itself.")),
        (T("Destinatarios.", "Recipients."),
         T("Configurados por zona: el grupo del cuerpo de bomberos municipal, el coordinador de "
           "gestión del riesgo y, en MORADO, el canal comunitario. Los destinos se gestionan en "
           "Configuración, no en el código.",
           "Configured per zone: the municipal fire brigade group, the risk-management coordinator, "
           "and — at PURPLE — the community channel. Destinations are managed in Settings, not in "
           "code.")),
        (T("Contenido.", "Message content."),
         T("Nivel y color, identificador del nodo y zona, coordenadas GPS como pin compartible, "
           "marca de tiempo, la evidencia sensorial que lo disparó, velocidad y dirección del "
           "viento, y la imagen de la ESP32-CAM si se capturó.",
           "Level and colour, node ID and zone, GPS coordinates as a shareable pin, timestamp, the "
           "sensor evidence that triggered it, wind speed and direction, and the ESP32-CAM image if "
           "one was captured.")),
        (T("Trazabilidad.", "Traceability."),
         T("La pestaña de Alertas muestra el estado de entrega de cada despacho —en cola, enviado, "
           "fallido— y permite reenviar. Cada cambio de estado se registra con autor y hora.",
           "The Alerts tab shows the delivery status of every dispatch — queued, sent, failed — and "
           "allows a manual resend. Every state change is logged with author and time.")),
        (T("Modo degradado.", "Degraded mode."),
         T("Si no hay conectividad en el momento del despacho, el mensaje se encola y la sirena "
           "local y el protocolo de radio toman el relevo. La cola se vacía sola cuando vuelve el "
           "enlace, y la plataforma muestra la alerta como pendiente de entrega en lugar de "
           "perderla en silencio.",
           "If there is no connectivity at dispatch time, the message is queued and the local siren "
           "and radio protocol take over. The queue flushes automatically when a link returns, and "
           "the platform shows the alert as pending delivery rather than silently losing it.")),
    ])
    d.code(
        T("""🔴  ALARMA — NIVEL ROJO (puntaje 0,71)

Nodo 105  ·  Zona: Palmira, Valle del Cauca
Hora: 2026-07-25 14:30 UTC  (09:30 local)
Ubicacion: 3.4412, -76.5189  ·  985 m

EVIDENCIA (fusion de sensores, 2 de 5 sentidos concordantes):
  - Olfato : gas 320 -> 780 ppm  (+4,2 sigma sobre linea base)
             PM2.5  14,2 -> 96 ug/m3
  - Tacto  : temp 34,2 -> 41,6 C  ·  humedad 22,8 -> 14 %
  - Vista  : clasificacion de camara -> HUMO (confianza 0,88)

CONDICIONES: viento 4,7 m/s desde el sur (185 grados)
Direccion estimada de propagacion: NORTE

[ imagen de camara adjunta ]
[ abrir en la plataforma ]   [ confirmar y despachar ]""",
          """🔴  ALARM — LEVEL RED (score 0.71)

Node 105  ·  Zone: Palmira, Valle del Cauca
Time: 2026-07-25 14:30 UTC  (09:30 local)
Location: 3.4412, -76.5189  ·  985 m

EVIDENCE (sensor fusion, 2 of 5 senses concordant):
  - Smell : gas 320 -> 780 ppm  (+4.2 sigma over baseline)
            PM2.5  14.2 -> 96 ug/m3
  - Touch : temp 34.2 -> 41.6 C  ·  humidity 22.8 -> 14 %
  - Sight : camera classification -> SMOKE (confidence 0.88)

CONDITIONS: wind 4.7 m/s from the south (185 deg)
Estimated spread direction: NORTH

[ camera image attached ]
[ open in platform ]   [ confirm & dispatch ]"""),
        caption=T("Estructura de una alerta automática de Telegram. El mensaje está diseñado para "
                  "ser accionable desde la pantalla de un teléfono en campo, sin abrir la "
                  "plataforma.",
                  "Structure of an automatic Telegram alert. The message is designed to be "
                  "actionable from a phone screen in the field, without opening the platform."))

    d.h2(T("7.4 Ciclo de vida de una alerta", "7.4 Alert lifecycle"))
    d.flow([
        (T("DETECTADA", "DETECTED"), T("la fusión genera\nel evento", "fusion raises\nthe event")),
        (T("DESPACHADA", "DISPATCHED"), T("Telegram +\nsirena", "Telegram +\nsiren")),
        (T("RECONOCIDA", "ACKNOWLEDGED"), T("el operador abre\nla evidencia", "operator opens\nthe evidence")),
        (T("EN CURSO", "IN PROGRESS"), T("brigada\nrespondiendo", "brigade\nresponding")),
        (T("RESUELTA", "RESOLVED"), T("registrada con\nautor y hora", "logged with\nauthor & time")),
    ])
    d.p(T("Esa trazabilidad importa más allá del incidente: cada alerta resuelta, con su evidencia "
          "y su desenlace, se convierte en un ejemplo etiquetado que mejora los umbrales de fusión "
          "y, con el tiempo, el modelo predictivo.",
          "This traceability matters beyond the incident: every resolved alert, with its evidence "
          "and its outcome, becomes a labelled training example that improves the fusion thresholds "
          "and, eventually, the predictive model."))

    d.placeholder(
        T("Alerta recibida en el teléfono de la brigada",
          "Alert received on the brigade's phone"),
        T("Sugerencia: captura del mensaje real en Telegram, con la imagen de la cámara adjunta.",
          "Suggestion: screenshot of the real Telegram message, with the camera image attached."),
        height_cm=5.0)

    d.page_break()

    # ============================================================ 8 MÓDULO IV — PLATAFORMA
    d.h1(T("8. Módulo IV — La plataforma y sus capas de información",
           "8. Module IV — The platform and its information layers"))
    d.p(T("La plataforma es la aplicación web donde converge todo. Está construida como un único "
          "panel de vidrio: el objetivo de diseño es reducir la carga cognitiva de un coordinador "
          "bajo presión mostrando la mínima información suficiente en una sola pantalla, tanto en "
          "un teléfono como en un escritorio. Está construida y funcionando, es bilingüe "
          "(español / inglés) y es responsiva. Todas las capturas de esta sección provienen de la "
          "aplicación real.",
          "The platform is the web application where everything converges. It is built as a single "
          "pane of glass: the design goal is to reduce the cognitive load of a coordinator under "
          "pressure by showing the minimum sufficient information in one screen, on a phone as "
          "readily as on a desktop. It is built and running, bilingual (Spanish / English) and "
          "responsive. Every screenshot in this section comes from the real application."))
    d.table(
        [T("Sección", "Section"), T("Propósito", "Purpose"), T("Contenido clave", "Key content")],
        [
            [T("Tablero / Alertas", "Dashboard / Alerts"),
             T("Estado global del sistema de un vistazo y conversión de la detección en acción.",
               "Global system state at a glance, and turning detection into action."),
             T("Semáforo de riesgo de cinco niveles con explicación en lenguaje llano, salud de la "
               "red de nodos, eventos activos, bandeja de alertas, detalle de evidencia y estado de "
               "entrega en Telegram.",
               "Five-level risk traffic light with a plain-language explanation, node network "
               "health, active events, alert tray, evidence detail and Telegram delivery state.")],
            [T("Monitoreo", "Monitoring"),
             T("La red de nodos, nodo por nodo.", "The node network, node by node."),
             T("Telemetría en vivo por nodo organizada por los cinco sentidos, batería y calidad de "
               "enlace, tabla comparativa entre nodos, simulación de anomalías para simulacros.",
               "Live telemetry per node organised by the five senses, battery and link quality, "
               "comparison table across nodes, anomaly simulation for drills.")],
            [T("Observatorio", "Observatory"),
             T("Mapa de datos públicos en vivo: observación, no predicción.",
               "Live public-data map — observation, not prediction."),
             T("Capas de color conmutables sobre Colombia y el mundo; clic en cualquier punto para "
               "leer las condiciones actuales allí; animación temporal; capa de reportes "
               "comunitarios.",
               "Switchable colour layers over Colombia and the world; click anywhere to read "
               "current conditions at that point; timeline animation; community reports layer.")],
            [T("Mapa de Riesgo", "Risk Map"),
             T("Salida del modelo predictivo.", "Output of the predictive model."),
             T("Territorio coloreado por riesgo previsto, actualizado cada 10–15 minutos.",
               "Territory coloured by predicted risk, refreshed every 10–15 minutes.")],
            [T("Tablero Colombia", "Colombia Dashboard"),
             T("El registro histórico, explorable.", "The historical record, explorable."),
             T("14.985 incidentes del IDEAM por departamento, municipio, año, mes, bioma, "
               "ecosistema, clima, paisaje y suelo; focos de recurrencia; estacionalidad; análisis "
               "de ecosistemas sensibles.",
               "14,985 IDEAM incidents by department, municipality, year, month, biome, ecosystem, "
               "climate, landscape and soil; recurrence hotspots; seasonality; sensitive-ecosystem "
               "analysis.")],
            [T("Comunidad", "Community"),
             T("Integrar a las personas y a su conocimiento.",
               "Bringing people, and their knowledge, in."),
             T("Reporte ciudadano con foto y ubicación; plaza comunitaria con cuatro categorías "
               "—saberes ancestrales, fauna y ecosistema, historias y cultura, noticias— donde los "
               "usuarios ingresan, publican con imagen, comentan, dan «me gusta», comparten y "
               "traducen; capa educativa, glosario y chatbot.",
               "Citizen reporting with photo and location; a community plaza with four categories "
               "— ancestral knowledge, fauna and ecosystems, stories and culture, news — where "
               "users sign in, post with an image, comment, like, share and translate; learning "
               "layer, glossary and chatbot.")],
            [T("Biorremediación", "Bioremediation"),
             T("Cerrar el ciclo después del incendio.", "Closing the cycle after the fire."),
             T("Mapa de área quemada, puntos de muestreo del robot, diagnóstico del suelo y plan de "
               "recuperación.",
               "Burned-area map, robot sampling points, soil diagnosis and recovery plan.")],
        ],
        caption=T("Secciones de la plataforma.", "Sections of the platform."),
        widths=[3.0, 5.0, 8.6],
    )

    d.image("monitoreo.jpg",
            T("Monitoreo de nodos. Cada tarjeta es un nodo de la red del Valle del Cauca con su "
              "índice VPD (déficit de presión de vapor) y su estado; el mapa superpone los nodos "
              "IoT con los focos activos de NASA FIRMS, y el panel derecho abre la telemetría "
              "completa del nodo seleccionado. La barra superior muestra la red en línea, el "
              "transporte LoRaWAN a 915 MHz y una alarma activa.",
              "Node monitoring. Each card is a node of the Valle del Cauca network with its VPD "
              "(vapour pressure deficit) index and status; the map overlays the IoT nodes with "
              "active NASA FIRMS hotspots, and the right-hand panel opens the full telemetry of the "
              "selected node. The top bar shows the network online, LoRaWAN transport at 915 MHz "
              "and an active alarm."))

    d.h2(T("8.2 Las capas de información del observatorio",
           "8.2 The information layers of the observatory"))
    d.p(T("El observatorio responde una pregunta distinta a la del mapa de riesgo. El mapa de "
          "riesgo dice qué predecimos; el observatorio dice qué está pasando de forma medible "
          "ahora mismo, con datos satelitales y meteorológicos públicos. Las capas se agrupan por "
          "tema y cada una lleva su propia leyenda, control de opacidad, marca de actualización y "
          "atribución de fuente.",
          "The observatory answers a different question from the risk map. The risk map says what "
          "we predict; the observatory says what is measurably happening right now, using public "
          "satellite and meteorological data. Layers are grouped thematically and each carries its "
          "own legend, opacity control, update timestamp and source attribution."))
    d.table(
        [T("Grupo", "Group"), T("Capa", "Layer"), T("Fuente", "Source"),
         T("Actualización", "Refresh")],
        [
            [T("Meteorología", "Weather"), T("Radar de lluvia (animado, 2 h)",
                                              "Rain radar (animated, 2 h)"),
             "RainViewer", T("Cada 5 min", "Every 5 min")],
            [T("Meteorología", "Weather"), T("Temperatura, viento, nubosidad",
                                              "Temperature, wind, cloud cover"),
             "OpenWeatherMap", "~3 h"],
            [T("Meteorología", "Weather"), T("Condiciones puntuales al hacer clic",
                                              "Point conditions on click"),
             "Open-Meteo", T("Horaria", "Hourly")],
            [T("Fuego y calor", "Fire & heat"), T("Focos activos", "Active hotspots"),
             "NASA FIRMS (MODIS / VIIRS)", "< 3 h"],
            [T("Fuego y calor", "Fire & heat"), T("Anomalías térmicas", "Thermal anomalies"),
             "NASA GIBS", "3–5 h"],
            [T("Fuego y calor", "Fire & heat"), T("Áreas quemadas / FWI", "Burned areas / FWI"),
             "Copernicus EFFIS / GWIS", T("Casi en tiempo real", "Near real time")],
            [T("Aire y humo", "Air & smoke"), T("Aerosol / plumas de humo", "Aerosol / smoke plumes"),
             "NASA GIBS (AOD) / CAMS", T("Diaria", "Daily")],
            [T("Aire y humo", "Air & smoke"), T("Calidad del aire al hacer clic (PM2.5, PM10, CO, O₃)",
                                                 "Air quality on click (PM2.5, PM10, CO, O₃)"),
             "Open-Meteo Air Quality", T("Horaria", "Hourly")],
            [T("Vegetación", "Vegetation"), T("Sequedad de la vegetación (NDVI)",
                                               "Vegetation dryness (NDVI)"),
             T("Sentinel-2 / Google Earth Engine", "Sentinel-2 / Google Earth Engine"), "~5 " + T("días", "days")],
            [T("Satélite", "Satellite"), T("Imagen base en color real", "True-colour base imagery"),
             "NASA GIBS", "3–5 h"],
            [T("Red propia", "Own network"), T("Nuestros nodos sensores", "Our sensor nodes"),
             T("Red LoRaWAN", "LoRaWAN network"), T("Segundos a minutos", "Seconds to minutes")],
            [T("Comunidad", "Community"), T("Reportes ciudadanos (humo, calor, fuego)",
                                             "Citizen reports (smoke, heat, fire)"),
             T("Usuarios de la plataforma", "Platform users"), T("En vivo", "Live")],
        ],
        caption=T("Capas de información. Se priorizaron fuentes gratuitas y de cobertura global "
                  "para que la plataforma sea replicable en cualquier país sin costo de datos.",
                  "Information layers. Priority was given to free, globally available sources so "
                  "the platform is replicable in any country at zero data cost."),
        widths=[2.8, 5.6, 4.8, 3.4],
    )
    d.image("observatorio.jpg",
            T("Observatorio. El catálogo lateral expone las capas disponibles —áreas quemadas "
              "(ΔNBR), índice de aridez (PDSI), humedad del suelo y sequía, riesgo de erosión por "
              "pendiente, cobertura arbórea, bosque seco tropical— servidas desde Google Earth "
              "Engine, MODIS, TerraClimate, SRTM y Hansen GFC. La franja inferior muestra las "
              "condiciones actuales de las capitales y el detalle del punto seleccionado.",
              "Observatory. The side catalogue exposes the available layers — burned areas (ΔNBR), "
              "aridity index (PDSI), soil moisture and drought, slope erosion risk, tree cover, "
              "tropical dry forest — served from Google Earth Engine, MODIS, TerraClimate, SRTM and "
              "Hansen GFC. The lower strip shows current conditions for the capitals and the detail "
              "of the selected point."))

    d.h2(T("8.3 La capa comunitaria", "8.3 The community layer"))
    d.p(T("Tres capacidades convierten a la comunidad en parte de la red de sensado y no en su "
          "público: el reporte ciudadano en el mapa, la plaza comunitaria donde se comparte "
          "conocimiento, y la capa educativa con el chatbot.",
          "Three capabilities make the community part of the sensing network rather than an "
          "audience for it: citizen reporting on the map, the community plaza where knowledge is "
          "shared, and the learning layer with the chatbot."))
    d.p(T("Primero, cualquier usuario puede dejar un reporte en el mapa —humo, calor extremo, "
          "lluvia fuerte, fuego activo— con foto y ubicación, y otros usuarios pueden confirmarlo; "
          "un grupo confirmado de reportes ciudadanos es en sí mismo una señal de detección que "
          "alimenta el motor de fusión descrito en la sección 7.",
          "First, any user can drop a report on the map — smoke, extreme heat, heavy rain, active "
          "fire — with a photo and location, and other users can confirm it; a confirmed cluster of "
          "citizen reports is itself a detection signal that feeds the fusion engine described in "
          "Section 7."))

    d.h2(T("8.3.1 La plaza comunitaria: «Voces del territorio»",
           "8.3.1 The community plaza: 'Voices of the territory'"))
    d.p(T("La plaza comunitaria es una red social propia dentro de la plataforma, pensada para que "
          "el conocimiento del territorio circule y quede registrado. No es un tablón de anuncios "
          "de solo lectura: los habitantes ingresan con su cuenta, publican, comentan, reaccionan y "
          "comparten. Su premisa es que la gente que vive en el territorio sabe cosas sobre el "
          "fuego, el clima y el bosque que ningún sensor mide, y que ese conocimiento merece un "
          "lugar formal dentro del sistema, al mismo nivel que la telemetría y los satélites.",
          "The community plaza is a social network of its own inside the platform, built so that "
          "the knowledge of the territory circulates and is placed on the record. It is not a "
          "read-only noticeboard: residents sign in with their account, post, comment, react and "
          "share. Its premise is that the people who live in the territory know things about fire, "
          "weather and forest that no sensor measures, and that this knowledge deserves a formal "
          "place inside the system, on the same footing as telemetry and satellites."))
    d.p(T("Las publicaciones se organizan en cuatro categorías, cada una con su propio color e "
          "icono:",
          "Posts are organised into four categories, each with its own colour and icon:"))
    d.table(
        [T("Categoría", "Category"), T("Qué recoge", "What it collects"),
         T("Por qué importa al sistema", "Why it matters to the system")],
        [
            [T("**Saberes Ancestrales**", "**Ancestral Knowledge**"),
             T("Conocimiento tradicional transmitido entre generaciones: lectura del cielo y de las "
               "nubes, señales de viento y de lluvia, calendarios de quema tradicional, manejo del "
               "fuego aprendido de los abuelos.",
               "Traditional knowledge passed down between generations: reading the sky and the "
               "clouds, wind and rain signs, traditional burning calendars, fire management learned "
               "from the elders."),
             T("Es indicador anticipado de condiciones que nuestros sensores todavía no cubren, y "
               "es la memoria del territorio: dónde se ha quemado antes y por qué.",
               "It is an early indicator of conditions our sensors do not yet cover, and it is the "
               "memory of the territory: where it has burned before and why.")],
            [T("**Fauna y Ecosistema**", "**Fauna & Ecosystems**"),
             T("Avistamientos, comportamiento animal inusual, estado de la vegetación, cambios "
               "observados en quebradas, páramo o bosque.",
               "Sightings, unusual animal behaviour, vegetation state, observed changes in streams, "
               "páramo or forest."),
             T("El comportamiento de la fauna cambia antes que muchas variables físicas; sirve como "
               "verificación en terreno de las capas satelitales.",
               "Wildlife behaviour changes before many physical variables do; it serves as ground "
               "verification of the satellite layers.")],
            [T("**Historias y Cultura**", "**Stories & Culture**"),
             T("Relatos, memoria de incendios pasados, vínculo cultural con el bosque y el "
               "territorio.",
               "Stories, memory of past fires, cultural bond with the forest and the territory."),
             T("Construye pertenencia: quien se siente dueño del bosque lo cuida y reporta.",
               "It builds belonging: someone who feels ownership of the forest looks after it and "
               "reports.")],
            [T("**Noticias de la Comunidad**", "**Community News**"),
             T("Convocatorias, jornadas de limpieza, avisos de la defensa civil y de las brigadas, "
               "alertas locales.",
               "Calls to action, cleaning days, civil defence and brigade notices, local alerts."),
             T("Es el canal por el que una alerta del observatorio se convierte en acción "
               "colectiva concreta.",
               "It is the channel through which an observatory alert becomes concrete collective "
               "action.")],
        ],
        caption=T("Las cuatro categorías de la plaza comunitaria. La primera, Saberes Ancestrales, "
                  "es deliberadamente la primera: el conocimiento tradicional es un dato del "
                  "sistema, no un adorno cultural.",
                  "The four categories of the community plaza. The first one, Ancestral Knowledge, "
                  "is deliberately first: traditional knowledge is a system input, not a cultural "
                  "decoration."),
        widths=[3.4, 6.6, 6.6],
    )
    d.p(T("Sobre esas categorías, la plaza ofrece las funciones que la gente ya espera de una red "
          "social, para que no haya nada nuevo que aprender:",
          "On top of those categories, the plaza offers the functions people already expect from a "
          "social network, so that there is nothing new to learn:"))
    d.table(
        [T("Función", "Capability"), T("Cómo funciona", "How it works")],
        [
            [T("**Ingresar y publicar**", "**Sign in and post**"),
             T("El usuario crea su cuenta e inicia sesión (autenticación de Supabase). Una vez "
               "dentro puede publicar con título, texto, categoría y etiqueta de ubicación.",
               "The user creates an account and signs in (Supabase authentication). Once inside "
               "they can post with a title, body text, category and location tag.")],
            [T("**Subir imágenes**", "**Upload images**"),
             T("Cada publicación admite una fotografía, cargada desde el teléfono, con "
               "previsualización antes de publicar. La foto de una columna de humo, de un "
               "avistamiento o de una quema es evidencia visual con fecha y lugar.",
               "Every post accepts a photograph, uploaded from the phone, with a preview before "
               "publishing. A picture of a smoke column, a sighting or a burn is visual evidence "
               "with a date and a place.")],
            [T("**Dar «me gusta»**", "**Like**"),
             T("Un corazón por publicación, con contador visible y estado propio: la plataforma "
               "recuerda a qué le dio «me gusta» cada usuario y permite quitarlo. Las reacciones "
               "hacen visible qué saberes la comunidad considera valiosos.",
               "One heart per post, with a visible counter and per-user state: the platform "
               "remembers what each user liked and allows un-liking. Reactions make visible which "
               "knowledge the community considers valuable.")],
            [T("**Comentar**", "**Comment**"),
             T("Cada publicación abre un hilo de comentarios con contador, de modo que un saber "
               "puede ser discutido, corregido o ampliado por otros vecinos.",
               "Every post opens a comment thread with a counter, so a piece of knowledge can be "
               "discussed, corrected or extended by other neighbours.")],
            [T("**Compartir**", "**Share**"),
             T("Cualquier publicación se puede compartir fuera de la plataforma, que es como "
               "circula realmente la información en el territorio (grupos de WhatsApp y Telegram).",
               "Any post can be shared outside the platform, which is how information actually "
               "circulates in the territory (WhatsApp and Telegram groups).")],
            [T("**Traducción automática**", "**Automatic translation**"),
             T("Publicaciones y comentarios se traducen entre español e inglés con un botón, y el "
               "contenido traducido se marca como tal. Un saber contado en español por un líder "
               "comunitario queda accesible a un jurado o a un equipo de otro país sin perder el "
               "original.",
               "Posts and comments are translated between Spanish and English at the press of a "
               "button, and translated content is labelled as such. Knowledge told in Spanish by a "
               "community leader stays accessible to a judge or to a team from another country "
               "without losing the original.")],
            [T("**Filtrar y ordenar**", "**Filter and sort**"),
             T("Filtro por categoría y ordenamiento por más reciente o más popular, para encontrar "
               "rápido lo relevante.",
               "Filter by category and sort by most recent or most popular, to find what is "
               "relevant quickly.")],
            [T("**Modo de solo lectura**", "**Read-only mode**"),
             T("Sin cuenta, cualquier persona puede leerlo todo; para publicar, comentar o "
               "reaccionar se pide iniciar sesión. La información nunca queda detrás de un muro, "
               "pero la autoría siempre queda registrada.",
               "Without an account, anyone can read everything; to post, comment or react, signing "
               "in is required. The information is never behind a wall, but authorship is always "
               "on the record.")],
        ],
        caption=T("Funciones de la plaza comunitaria. Todo está disponible en español e inglés y "
                  "diseñado para usarse desde el teléfono.",
                  "Capabilities of the community plaza. Everything is available in Spanish and "
                  "English and designed to be used from a phone."),
        widths=[3.8, 12.8],
    )
    d.callout(
        T("POR QUÉ ESTO ES PARTE DEL SISTEMA DE DETECCIÓN Y NO UN ANEXO",
          "WHY THIS IS PART OF THE DETECTION SYSTEM AND NOT AN ADD-ON"),
        T("Un nodo mide gas, temperatura y humedad. No sabe que en esa ladera se quema todos los "
          "agostos desde hace treinta años, ni que cuando las nubes sobre la cumbre se ponen grises "
          "con bordes amarillos bajan vientos fuertes en 48 horas. Eso lo sabe la gente. Los "
          "saberes ancestrales, los avistamientos y los reportes ciudadanos son una sexta fuente de "
          "evidencia junto a los cinco sentidos del nodo, y la única que puede darnos contexto "
          "histórico y cultural de un territorio antes de instalar un solo sensor en él.",
          "A node measures gas, temperature and humidity. It does not know that this particular "
          "hillside has burned every August for thirty years, nor that when the clouds over the "
          "summit turn grey with yellow edges, strong winds come down within 48 hours. People know "
          "that. Ancestral knowledge, sightings and citizen reports are a sixth source of evidence "
          "alongside the node's five senses, and the only one that can give us the historical and "
          "cultural context of a territory before a single sensor is installed in it."))
    d.p(T("Por último, la capa educativa y el chatbot traducen el contenido técnico —qué significa "
          "un nivel de riesgo, qué hacer al ver humo, por qué importa el páramo— a lenguaje "
          "sencillo, con glosario, en español e inglés y en un teléfono.",
          "Finally, the learning layer and the chatbot translate the technical content — what a "
          "risk level means, what to do when you see smoke, why páramo matters — into plain "
          "language, with a glossary, in Spanish and English and on a phone."))
    d.image("comunidad.jpg",
            T("Plaza comunitaria «Voces del territorio», con sus cuatro categorías —saberes "
              "ancestrales, fauna y ecosistemas, historias y cultura, noticias de la comunidad—, el "
              "ordenamiento por recientes o populares y los contadores de relatos, comentarios y "
              "miembros. El aviso indica el modo de solo lectura: cualquiera puede leer, y basta "
              "iniciar sesión para publicar, subir imágenes y participar. La publicación destacada "
              "convoca a una jornada de limpieza de hojarasca seca a raíz de una alerta naranja "
              "emitida por el observatorio, un ejemplo directo de detección que se convierte en "
              "acción comunitaria; la etiqueta «traducido automáticamente» muestra la traducción "
              "ES↔EN en funcionamiento.",
              "The 'Voices of the territory' community plaza, with its four categories — ancestral "
              "knowledge, fauna and ecosystems, stories and culture, community news — the sort by "
              "recent or popular, and the counters for stories, comments and members. The notice "
              "shows read-only mode: anyone can read, and signing in is all it takes to post, "
              "upload images and take part. The featured post calls a dry-leaf-litter cleaning day "
              "following an orange alert issued by the observatory — a direct example of detection "
              "turning into community action; the 'auto-translated' tag shows the ES↔EN translation "
              "at work."))
    d.image("chatbot.jpg",
            T("El asistente conversacional está disponible en toda la plataforma como botón "
              "flotante y responde preguntas sobre prevención y sobre cómo usar el tablero, sin "
              "sacar al usuario de la vista en la que está trabajando.",
              "The conversational assistant is available across the whole platform as a floating "
              "button and answers questions about prevention and about how to use the dashboard, "
              "without taking the user out of the view they are working in."))

    d.placeholder(
        T("La comunidad usando la plataforma", "The community using the platform"),
        T("Sugerencia: fotografía de una jornada con la comunidad, la brigada de bomberos o el "
          "colegio, usando el tablero o recibiendo la capacitación.",
          "Suggestion: photograph of a session with the community, the fire brigade or the school, "
          "using the dashboard or receiving the training."),
        height_cm=5.0)

    d.page_break()

    # ============================================================ 9 MÓDULO V
    d.h1(T("9. Módulo V — Modelo predictivo a partir de la historia de incendios de Colombia",
           "9. Module V — Predictive model from Colombia's fire history"))
    d.p(T("Los módulos de detección responden «¿se está quemando algo ahora?». El modelo "
          "predictivo responde una pregunta distinta y más barata: «¿dónde es más probable que "
          "empiece un incendio en los próximos días, para poner allí vigilancia, brigadas y "
          "prevención antes de que ocurra?».",
          "The detection modules answer 'is something burning now?'. The predictive model answers a "
          "different and cheaper question: 'where is a fire most likely to start in the coming "
          "days, so we can put surveillance, brigades and prevention there before it does?'"))

    d.h2(T("9.1 El conjunto de datos histórico", "9.1 The historical dataset"))
    d.p(T("La base del modelo es un conjunto de datos que el equipo armó a partir de varias "
          "fuentes, en lugar de descargarlo hecho. Los registros crudos de incendios del IDEAM se "
          "procesaron, limpiaron y georreferenciaron, se cruzaron con clasificaciones ambientales y "
          "se contrastaron contra archivos de focos satelitales. El resultado son 14.985 incidentes "
          "que cubren de 2010 a 2025, cada uno con:",
          "The model's foundation is a dataset the team assembled from several sources rather than "
          "downloading ready-made. Raw IDEAM wildfire records were parsed, cleaned, georeferenced "
          "and joined with environmental classifications, then cross-checked against satellite "
          "hotspot archives. The result is 14,985 incidents covering 2010–2025, each carrying:"))
    d.table(
        [T("Grupo de atributos", "Attribute group"), T("Campos", "Fields"),
         T("Por qué importa al modelo", "Why it matters to the model")],
        [
            [T("Ubicación y tiempo", "Location & time"),
             T("latitud, longitud, fecha, año, mes, departamento, municipio",
               "latitude, longitude, date, year, month, department, municipality"),
             T("Construye la superficie de recurrencia y el perfil estacional.",
               "Builds the recurrence surface and the seasonal profile.")],
            [T("Bioma y ecosistema", "Biome & ecosystem"),
             T("gran bioma, bioma IAvH, síntesis de ecosistema, marca de intervención",
               "gran_bioma, bioma_IAvH, ecosystem synthesis, intervened flag"),
             T("Los ecosistemas se encienden y arden distinto; la marca de intervención separa los "
               "paisajes modificados por el hombre de la cobertura natural.",
               "Different ecosystems ignite and burn differently; the intervened flag separates "
               "human-modified landscapes from natural cover.")],
            [T("Clima", "Climate"),
             T("clasificación climática (p. ej. cálido semihúmedo)",
               "climate classification (e.g. warm semi-humid)"),
             T("Codifica la aridez de fondo del sitio, independiente del clima de hoy.",
               "Encodes the background aridity of the site independently of today's weather.")],
            [T("Terreno", "Terrain"), T("paisaje, relieve, suelos", "landscape, relief, soils"),
             T("La pendiente y el tipo de suelo gobiernan la propagación y la vulnerabilidad del "
               "suelo tras el fuego.",
               "Slope and soil type govern spread behaviour and post-fire soil vulnerability.")],
        ],
        caption=T("Estructura del conjunto histórico (14.985 registros, 2010–2025), procesado por "
                  "el equipo desde el IDEAM y fuentes complementarias.",
                  "Structure of the historical dataset (14,985 records, 2010–2025), processed by "
                  "the team from IDEAM and complementary sources."),
        widths=[3.2, 5.4, 8.0],
    )
    d.image("colombia.jpg",
            T("Tablero Colombia. Los 14.985 focos son explorables por año, mes, departamento, "
              "ecosistema y clima; las tarjetas resumen el ecosistema dominante (agroecosistema, "
              "49,9 %), los focos de alto valor de conservación (1.898, de los cuales 154 en "
              "páramo) y el pico estacional (febrero, con 2.733 focos). El hallazgo automático "
              "resume que el 70 % ocurre en ecosistemas modificados y el 40 % en paisaje de "
              "montaña, el mayor reto logístico para la extinción.",
              "Colombia dashboard. The 14,985 hotspots are explorable by year, month, department, "
              "ecosystem and climate; the cards summarise the dominant ecosystem (agroecosystem, "
              "49.9 %), the high-conservation-value hotspots (1,898, of which 154 in páramo) and "
              "the seasonal peak (February, with 2,733 hotspots). The automatic finding notes that "
              "70 % occurs in modified ecosystems and 40 % on mountain landscape, the biggest "
              "logistical challenge for suppression."))
    d.image("colombia_charts.jpg",
            T("El mismo tablero, desplazado hasta los análisis: distribución por departamento, "
              "estacionalidad bimodal y desagregación por ecosistema y clima. La misma evidencia "
              "que sustenta la sección 3 de este documento es consultable en vivo dentro de la "
              "plataforma.",
              "The same dashboard, scrolled down to the analyses: distribution by department, "
              "bimodal seasonality and breakdown by ecosystem and climate. The same evidence that "
              "supports Section 3 of this document is explorable live inside the platform."))

    d.h2(T("9.2 El modelo", "9.2 The model"))
    d.p(T("Elegimos deliberadamente un modelo explicable, auditable y ejecutable en hardware "
          "modesto por encima de un modelo pesado de caja negra. Un coordinador tiene que poder "
          "responderle a un alcalde que pregunta por qué su municipio está pintado de rojo. La "
          "fórmula conceptual es:",
          "We deliberately chose a model that is explainable, auditable and runnable on modest "
          "hardware over a heavy black-box model. A coordinator has to be able to answer a mayor "
          "who asks why a municipality is coloured red. The conceptual formula is:"))
    d.p(T("RIESGO = RECURRENCIA HISTÓRICA (DÓNDE)  ×  METEOROLOGÍA DE INCENDIO ACTUAL (CUÁNDO)",
          "RISK = HISTORICAL RECURRENCE (WHERE)  ×  CURRENT FIRE-WEATHER (WHEN)"),
        size=11.5, bold=True, color=GREEN, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=8)
    d.p(T("Ambos factores se normalizan a 0–1 y se multiplican, luego se reescalan a 0–1 y se "
          "mapean a la escalera de cinco niveles de la sección 7. Un lugar que se ha quemado "
          "repetidamente no está en riesgo hoy si está empapado; un lugar bajo meteorología extrema "
          "no está en riesgo alto si allí nunca se ha quemado nada y no hay combustible. El riesgo "
          "exige las dos cosas.",
          "Both factors are normalised to 0–1 and multiplied, then rescaled to 0–1 and mapped to "
          "the five-level ladder of Section 7. A place that has burned repeatedly is not at risk "
          "today if it is soaked; a place under extreme fire-weather is not at high risk if nothing "
          "there has ever burned and there is no fuel. Risk requires both."))
    d.numbered([
        T("Dividir el territorio en una malla (o por municipio / vereda): cada celda es una unidad "
          "de predicción.",
          "Divide the territory into a grid (or by municipality / vereda) — each cell is a "
          "prediction unit."),
        T("Calcular para cada celda la recurrencia histórica (0–1) a partir de la densidad y la "
          "repetición de incidentes pasados, ponderada por recencia y por el perfil estacional del "
          "mes en curso.",
          "For each cell, compute historical recurrence (0–1) from the density and repetition of "
          "past incidents, weighted by recency and by the seasonal profile of the current month."),
        T("Calcular para cada celda un índice meteorológico de incendio (0–1) combinando "
          "temperatura, humedad relativa, velocidad del viento y días sin lluvia de Open-Meteo, con "
          "el Fire Weather Index de Copernicus GWIS como contraste y respaldo.",
          "For each cell, compute a current fire-weather index (0–1) combining temperature, "
          "relative humidity, wind speed and days since last rain from Open-Meteo, with the "
          "Copernicus GWIS Fire Weather Index as a cross-check and fallback."),
        T("Donde existan nodos propios, sustituir la estimación meteorológica por la verdad de "
          "campo medida: la temperatura, la humedad y la humedad del suelo del nodo son mucho más "
          "precisas que una malla interpolada.",
          "Where our own nodes exist, override the meteorological estimate with measured ground "
          "truth — node temperature, humidity and soil moisture are far more accurate than an "
          "interpolated grid."),
        T("Multiplicar, normalizar, asignar el nivel y pintar la celda en el Mapa de Riesgo. "
          "Refrescar cada 10–15 minutos.",
          "Multiply, normalise, assign the level, and paint the cell on the Risk Map. Refresh every "
          "10–15 minutes."),
    ])
    d.p(T("El modelo no consume el JSON crudo del nodo, sino un vector de características "
          "consolidado por celda y por paso de tiempo, lo que mantiene el trabajo de modelado "
          "independiente de los cambios de hardware: variables estáticas e históricas (índice de "
          "recurrencia, años desde el último incendio, bioma, ecosistema, clima, relieve, suelo), "
          "estacionales (mes, fase de temporada seca, anomalía climatológica), meteorológicas "
          "actuales, vegetación (NDVI vía Sentinel-2 y Google Earth Engine), verdad de campo de "
          "nuestros nodos, y actividad en vivo (focos satelitales cercanos, reportes comunitarios "
          "confirmados).",
          "The model does not consume raw node JSON but a consolidated feature vector per cell per "
          "time step, which keeps the modelling work independent of hardware changes: static and "
          "historical variables (recurrence index, years since last fire, biome, ecosystem, "
          "climate, relief, soil), seasonal ones (month, dry-season phase, climatological anomaly), "
          "current meteorology, vegetation (NDVI via Sentinel-2 and Google Earth Engine), ground "
          "truth from our nodes, and live activity (nearby satellite hotspots, confirmed community "
          "reports)."))
    d.p(T("La validación es por retención temporal: se entrenan las componentes de recurrencia y "
          "estacionalidad con 2010–2022 y se comprueba si la superficie de riesgo resultante "
          "anticipa los incidentes de 2023–2025. A medida que crecen la red de nodos y el historial "
          "de alertas, cada alerta confirmada y cada alerta descartada se vuelve un ejemplo "
          "etiquetado, lo que abre el camino desde el modelo multiplicativo explicable actual hacia "
          "un modelo de aprendizaje supervisado sobre el mismo vector de características, sin "
          "cambiar ninguna interfaz. El modelo explicable permanece como respaldo y como capa de "
          "explicación.",
          "Validation is by hold-out in time: the recurrence and seasonal components are trained on "
          "2010–2022 and tested on whether the resulting risk surface anticipates the 2023–2025 "
          "incidents. As the node network and the alert history grow, every confirmed and every "
          "dismissed alert becomes a labelled example, which opens the path from the current "
          "explainable multiplicative model to a supervised learning model on the same feature "
          "vector, without changing any interface. The explainable model remains as the fallback "
          "and as the explanation layer."))

    d.page_break()

    # ============================================================ 10 MÓDULO VI
    d.h1(T("10. Módulo VI — Biorremediación: sanar el suelo después del fuego",
           "10. Module VI — Bioremediation: healing the soil after the fire"))
    d.callout(
        T("LA IDEA QUE ORIGINÓ ESTE MÓDULO", "THE INSIGHT THAT STARTED THIS MODULE"),
        T("Cuando ocurre un incendio forestal, la primera reacción siempre es sembrar árboles. "
          "Suena lógico, pero muy a menudo el problema real está mucho más abajo: en el suelo. Si "
          "el suelo perdió sus microorganismos, su estructura y su capacidad de sostener vida, "
          "sembrar árboles no garantiza que el ecosistema se recupere. Por eso cambiamos el orden: "
          "primero sanar el suelo, porque un suelo sano es lo que permite que un bosque se regenere "
          "de forma natural y sostenible.",
          "When a forest fire happens, the first reaction is always to plant trees. It sounds "
          "logical, but very often the real problem is much further down — in the soil. If the soil "
          "has lost its microorganisms, its structure and its capacity to sustain life, planting "
          "trees does not guarantee that the ecosystem recovers. So we change the order: heal the "
          "soil first, because healthy soil is what lets a forest regenerate naturally and "
          "sustainably."))
    d.p(T("Un incendio de alta intensidad no solo elimina la vegetación sobre el suelo. Esteriliza "
          "la capa superficial, matando las comunidades de hongos y bacterias que ciclan los "
          "nutrientes y ligan las partículas. Destruye la materia orgánica y la estructura, lo que "
          "colapsa la capacidad de retener agua. Puede dejar una costra hidrofóbica que hace que la "
          "lluvia escurra en lugar de infiltrarse, causando erosión y deslizamientos. Las plántulas "
          "sembradas en ese sustrato compiten sobre un terreno que perdió la maquinaria biológica "
          "que normalmente las sostendría, y por eso tanta reforestación post-incendio fracasa en "
          "silencio uno o dos años después de las fotografías.",
          "A high-intensity fire does not only remove the vegetation above ground. It sterilises the "
          "top layer of soil, killing the fungal and bacterial communities that cycle nutrients and "
          "bind soil particles together. It destroys organic matter and structure, which collapses "
          "the soil's capacity to hold water. It can leave a water-repellent crust that makes rain "
          "run off instead of soaking in, driving erosion and landslides. Seedlings planted into "
          "that substrate compete on ground that has lost the biological machinery that would "
          "normally support them — which is why so much post-fire reforestation fails quietly, a "
          "year or two after the photographs are taken."))

    d.h2(T("10.1 Nuestro enfoque: Trichoderma", "10.1 Our approach: Trichoderma"))
    d.p(T("Trabajamos con Trichoderma, un género de hongos benéficos del suelo ampliamente usado en "
          "agricultura y cada vez más en restauración ecológica. Ayuda a recuperar la actividad "
          "biológica del suelo, promueve el crecimiento radicular, mejora la disponibilidad de "
          "nutrientes y crea las condiciones para que el ecosistema empiece a funcionar de nuevo. "
          "Es de producción local, bajo costo, no tóxico y no introduce un macroorganismo ajeno al "
          "ecosistema: restablece un grupo funcional que el fuego eliminó.",
          "We work with Trichoderma, a genus of beneficial soil fungi widely used in agriculture and "
          "increasingly in ecological restoration. It helps recover the biological activity of the "
          "soil, promotes root growth, improves nutrient availability, and creates the conditions "
          "for the ecosystem to start functioning again. It is locally producible, low cost, "
          "non-toxic and does not introduce a foreign macro-organism into the ecosystem — it "
          "re-establishes a functional group that the fire removed."))
    d.p(T("Nuestro objetivo actual es empírico: determinar la mejor forma de aplicarlo. Un "
          "inoculante fúngico que muere al contacto con un suelo post-incendio caliente, seco e "
          "hidrofóbico es inútil, por buena que sea la biología. Por eso evaluamos varias "
          "formulaciones contra dos criterios: supervivencia del hongo y eficiencia de distribución "
          "sobre el terreno afectado.",
          "Our present objective is empirical: to determine the best way to apply it. A fungal "
          "inoculant that dies on contact with hot, dry, hydrophobic post-fire soil is useless, "
          "however good the biology. We therefore evaluate several formulations against two "
          "criteria — survival of the fungus and efficiency of distribution across affected "
          "ground."))
    d.table(
        [T("Formulación en ensayo", "Formulation under test"), T("Razón", "Rationale"),
         T("Qué medimos", "What we measure")],
        [
            [T("Trichoderma + melaza", "Trichoderma + molasses"),
             T("La melaza aporta una fuente inmediata de carbono que sostiene al hongo durante su "
               "establecimiento en un sustrato empobrecido.",
               "Molasses provides an immediate carbon source to sustain the fungus through "
               "establishment in a nutrient-stripped substrate."),
             T("Supervivencia de colonias en el tiempo; facilidad de aplicación en campo",
               "Colony survival over time; ease of field application")],
            [T("Trichoderma en hidrogel", "Trichoderma in hydrogel"),
             T("El hidrogel retiene humedad alrededor del inóculo y lo amortigua frente a la "
               "sequedad y la hidrofobicidad del suelo quemado.",
               "The hydrogel retains moisture around the inoculum, buffering it against the dryness "
               "and hydrophobicity of burned soil."),
             T("Retención de humedad; supervivencia en condiciones post-incendio simuladas",
               "Moisture retention; survival under simulated post-fire conditions")],
            [T("Trichoderma encapsulado", "Encapsulated Trichoderma"),
             T("Una cápsula biodegradable protege el inóculo durante el transporte y la dispersión, "
               "y lo libera cuando se rompe y toma humedad del terreno.",
               "A biodegradable capsule protects the inoculum during transport and dispersal and "
               "releases it when it breaks and takes on moisture from the ground."),
             T("Comportamiento de ruptura, tiempo de liberación, supervivencia, aptitud para el "
               "dispensado robótico",
               "Rupture behaviour, release timing, survival, suitability for robotic dispensing")],
        ],
        caption=T("Formulaciones en evaluación. El método seleccionado determina la carga del "
                  "robot.",
                  "Formulations under evaluation. The selected method determines the payload of the "
                  "robot."),
        widths=[3.6, 7.0, 6.0],
    )

    d.h2(T("10.2 El robot de dispersión", "10.2 The dispersal robot"))
    d.p(T("Una vez definido el método más efectivo empieza la parte tecnológica del módulo. "
          "Diseñaremos un robot terrestre capaz de moverse por terreno afectado por el fuego y "
          "dispensar cápsulas biodegradables con el hongo en puntos estratégicos. Las cápsulas "
          "viajan en una tolva a bordo y se liberan sobre el terreno conforme el robot avanza; la "
          "cápsula genera humedad a su alrededor y, cuando se rompe, el hongo empieza a estimular "
          "el crecimiento de los microorganismos del suelo.",
          "Once the most effective method is defined, the technological part of the module begins. "
          "We will design a ground robot able to move across fire-affected terrain and dispense "
          "biodegradable capsules containing the fungus at strategic points. The capsules travel in "
          "an onboard hopper and are released across the ground as the robot advances; the capsule "
          "generates moisture around itself, and when it breaks open the fungus inside begins "
          "stimulating the growth of soil microorganisms."))
    d.bullets([
        (T("Por qué un robot.", "Why a robot."),
         T("El terreno quemado es inestable, sigue caliente durante días, está lleno de riesgos de "
           "caída y con frecuencia es inaccesible por carretera. El robot llega a zonas de acceso "
           "humano difícil o peligroso y distribuye el tratamiento más rápido, más uniforme y de "
           "forma más segura que una cuadrilla a pie.",
           "Burned terrain is unstable, hot for days, full of falling hazards and frequently "
           "unreachable by road. The robot reaches areas where human access is difficult or "
           "dangerous and distributes the treatment faster, more uniformly and more safely than a "
           "crew on foot.")),
        (T("Guiado por la plataforma.", "Guided by the platform."),
         T("El robot no deambula. Se dirige a los polígonos quemados y a las clases de severidad "
           "que la plataforma deriva de las capas de área quemada y de los datos de los nodos: el "
           "mismo mapa que detectó el incendio le dice al robot dónde está el daño peor.",
           "The robot does not wander. It is directed to the burned polygons and the severity "
           "classes that the platform derives from burned-area layers and node data — the same map "
           "that detected the fire tells the robot where the damage is worst.")),
        (T("Muestreo en el camino.", "Sampling on the way."),
         T("Además de dispensar, el robot toma muestras de suelo en sus puntos de paso. Esas "
           "muestras alimentan el panel de diagnóstico (pH, materia orgánica, humedad, nitrógeno, "
           "carbono, cobertura viva) que la plataforma promedia por zona.",
           "Beyond dispensing, the robot takes soil samples at its waypoints. Those samples feed "
           "the diagnosis panel (pH, organic matter, moisture, nitrogen, carbon, living cover) that "
           "the platform averages per zone.")),
        (T("Resultado: un plan de recuperación.", "Output: a recovery plan."),
         T("A partir del diagnóstico, la plataforma genera un plan ordenado —estabilizar, aplicar "
           "enmiendas, sembrar especies pioneras, restaurar, monitorear— con un horizonte temporal, "
           "exportable para la autoridad responsable del área.",
           "From the diagnosis the platform generates an ordered plan — stabilise, apply amendments, "
           "sow pioneer species, restore, monitor — with a time horizon, exportable for the "
           "authority responsible for the area.")),
    ])
    d.flow([
        (T("MAPEAR", "MAP"), T("polígonos quemados\ny severidad", "burned polygons\n& severity")),
        (T("MUESTREAR", "SAMPLE"), T("el robot toma\nmuestras de suelo", "robot collects\nsoil samples")),
        (T("DIAGNOSTICAR", "DIAGNOSE"), T("pH, materia orgánica,\nhumedad, N, C",
                                           "pH, organic matter,\nmoisture, N, C")),
        (T("TRATAR", "TREAT"), T("dispersión de cápsulas\nde Trichoderma", "capsule dispersal\nTrichoderma")),
        (T("MONITOREAR", "MONITOR"), T("plan de recuperación\ny seguimiento", "recovery plan\n& follow-up")),
    ])
    d.callout(
        T("EN RESUMEN", "IN SHORT"),
        T("No estamos tratando de reemplazar a la naturaleza: le estamos dando una mano para que "
          "pueda recuperarse. Si restauramos primero la salud del suelo y le devolvemos su "
          "actividad biológica, creamos las condiciones para que la vegetación y el ecosistema se "
          "regeneren con mucho más éxito con el tiempo. Y un suelo más sano, que retiene humedad y "
          "tiene cobertura viva, es en sí mismo un paisaje más difícil de quemar; por eso este "
          "módulo pertenece tanto a la prevención como a la recuperación.",
          "We are not trying to replace nature — we are giving it a hand so it can recover. If we "
          "restore the health of the soil first and give back its biological activity, we create "
          "the conditions for the vegetation and the ecosystem to regenerate far more successfully "
          "over time. And healthier, moisture-retaining soil with living cover is, in itself, a "
          "landscape that is harder to burn — which is why this module belongs to prevention as "
          "much as to recovery."))

    d.placeholder(
        T("Ensayos de laboratorio con Trichoderma", "Trichoderma laboratory trials"),
        T("Sugerencia: fotografía de las cajas de Petri con las colonias, de las tres formulaciones "
          "en comparación (melaza, hidrogel, encapsulado) o del equipo en el laboratorio.",
          "Suggestion: photograph of the Petri dishes with the colonies, of the three formulations "
          "side by side (molasses, hydrogel, encapsulated) or of the team in the laboratory."),
        height_cm=5.0)
    d.placeholder(
        T("Diseño del robot dispersor de cápsulas", "Design of the capsule-dispensing robot"),
        T("Sugerencia: render CAD del robot con la tolva y el mecanismo dispensador, o fotografía "
          "del prototipo con las piezas de REV Robotics.",
          "Suggestion: CAD render of the robot with the hopper and dispensing mechanism, or "
          "photograph of the prototype with the REV Robotics parts."),
        height_cm=5.0)

    d.page_break()

    # ============================================================ 11 DATOS
    d.h1(T("11. Modelo de datos y superficie de la API",
           "11. Data model and API surface"))
    d.p(T("Todo el sistema se apoya en un conjunto pequeño de entidades y un contrato de acceso "
          "estable. Los datos rápidos (lecturas, eventos) se empujan por WebSockets; los datos de "
          "contexto (clima, focos, riesgo) se consultan cada 10–15 minutos.",
          "The whole system rests on a small set of entities and a stable access contract. Fast data "
          "(readings, events) is pushed over WebSockets; context data (weather, hotspots, risk) is "
          "polled every 10–15 minutes."))
    d.table(
        [T("Entidad", "Entity"), T("Qué representa", "What it represents"),
         T("Atributos clave", "Key attributes")],
        [
            [T("Zona", "Zone"), T("El territorio monitoreado (vereda, municipio, sector de bosque).",
                                   "The monitored territory (vereda, municipality, forest sector)."),
             T("id, nombre, municipio, ecosistema, geometría, altitud media",
               "id, name, municipality, ecosystem, geometry, mean altitude")],
            [T("Nodo", "Node"), T("Una estación sensora en campo.", "A sensor station in the field."),
             T("id, zona, gateway, coordenadas, altitud, estado, batería, última conexión",
               "id, zone, gateway, coordinates, altitude, status, battery, last seen")],
            [T("Tipo de medición", "MeasurementType"),
             T("El catálogo de magnitudes, registradas una sola vez.",
               "The catalogue of magnitudes, registered once each."),
             T("id, sentido, magnitud, unidad, rango válido",
               "id, sense, magnitude, unit, valid range")],
            [T("Lectura", "Reading"), T("Un valor medido por un nodo en un instante.",
                                         "One measured value from one node at one time."),
             T("id, nodo, tipo de medición, valor, marca de tiempo",
               "id, node, measurement type, value, timestamp")],
            [T("Evento", "Event"), T("Una detección generada por el motor de fusión.",
                                      "A detection raised by the fusion engine."),
             T("id, nodo(s), zona, nivel, puntaje, desglose de evidencia, imagen, marca de tiempo",
               "id, node(s), zone, level, score, evidence breakdown, image, timestamp")],
            [T("Alerta", "Alert"), T("El despacho y el ciclo de vida de un evento.",
                                      "The dispatch and lifecycle of an event."),
             T("id, evento, estado, destinatarios, estado de entrega en Telegram, autor, historial",
               "id, event, state, recipients, Telegram delivery status, author, history")],
            [T("Reporte comunitario", "CommunityReport"),
             T("Una observación ciudadana en el mapa.", "A citizen observation on the map."),
             T("id, usuario, tipo, foto, coordenadas, confirmaciones, marca de tiempo",
               "id, user, type, photo, coordinates, confirmations, timestamp")],
            [T("Zona quemada / Muestra de suelo", "BurnedZone / SoilSample"),
             T("Área post-incendio y muestreo del robot.", "Post-fire area and robot sampling."),
             T("polígono, área (ha), severidad, muestras (pH, materia orgánica, humedad, N, C, "
               "cobertura viva)",
               "polygon, area (ha), severity, samples (pH, organic matter, moisture, N, C, living "
               "cover)")],
            [T("Predicción", "Prediction"), T("Salida del modelo por celda y paso de tiempo.",
                                               "Model output per cell per time step."),
             T("celda, marca de tiempo, recurrencia, índice meteorológico, puntaje de riesgo, nivel",
               "cell, timestamp, recurrence, fire-weather index, risk score, level")],
        ],
        caption=T("Entidades centrales del modelo de datos.", "Core entities of the data model."),
        widths=[3.4, 5.6, 7.6],
    )
    d.code(
        """# Nodos y lecturas / Nodes and readings
GET   /api/nodos                  -> estado de la red, salud, ultima lectura por nodo
GET   /api/nodos/{id}/lecturas    -> serie de tiempo de un nodo, por sentido
WS    /ws/lecturas                -> lecturas en vivo (latencia de segundos)

# Eventos y alertas / Events and alerts
GET   /api/alertas?estado=        -> bandeja de alertas, filtrable por estado
GET   /api/alertas/{id}           -> detalle de evidencia + estado de entrega Telegram
PATCH /api/alertas/{id}           -> cambiar estado (confirmar / en curso / descartar)
WS    /ws/eventos                 -> eventos en vivo

# Observatorio / Observatory  (proxy de datos publicos: oculta claves, cachea, normaliza)
GET   /api/capas                  -> catalogo de capas (nombre, grupo, leyenda, atribucion)
GET   /api/clima?lat=&lon=        -> temperatura, sensacion, humedad, lluvia, viento
GET   /api/aire?lat=&lon=         -> PM2.5, PM10, CO, O3
GET   /api/focos?bbox=            -> focos satelitales activos como GeoJSON
GET   /api/gee/layer/{type}       -> capa de teselas de Earth Engine (NDVI, severidad)
GET   /api/gee/point?lat=&lon=    -> consulta puntual a Earth Engine

# Prediccion y recuperacion / Prediction and recovery
GET   /api/riesgo?bbox=           -> malla de riesgo previsto (puntaje + nivel por celda)
GET   /api/zonas-quemadas         -> poligonos de area quemada
GET   /api/muestras?zona={id}     -> muestras de suelo del robot para una zona
GET   /api/plan?zona={id}         -> plan de recuperacion generado""",
        caption=T("Superficie REST y WebSocket del sistema.",
                  "REST and WebSocket surface of the system."))

    # ============================================================ 12 TECNOLOGÍA
    d.h1(T("12. Tecnología, seguridad y operación sin conexión",
           "12. Technology, security and offline operation"))
    d.table(
        [T("Capa", "Layer"), T("Función", "Function"), T("Tecnología en uso", "Technology in use")],
        [
            [T("Nodo sensor", "Sensor node"), T("Percepción y transmisión", "Perception and transmission"),
             T("Plataforma Arduino MKR, MKR ENV Shield, MQ-135, Grove láser PM2.5, DS18B20 / LM35, "
               "HD38, sensor UV Adafruit, SparkFun Sound Detector, ESP32-CAM, radio LoRa",
               "Arduino MKR platform, MKR ENV Shield, MQ-135, Grove laser PM2.5, DS18B20 / LM35, "
               "HD38, Adafruit UV, SparkFun Sound Detector, ESP32-CAM, LoRa radio")],
            [T("Transporte", "Transport"), T("Del campo al servidor", "Field to server"),
             T("LoRaWAN (Clase A, ISM sub-GHz), gateway LoRaWAN",
               "LoRaWAN (Class A, sub-GHz ISM), LoRaWAN gateway")],
            [T("Borde", "Edge"), T("Decisión de detección", "Detection decision"),
             T("Servidor local en el territorio (clase Raspberry Pi), lógica de fusión de sensores",
               "Local server in the territory (Raspberry Pi class), sensor-fusion logic")],
            [T("Base de datos", "Database"), T("Fuente única de verdad", "Single source of truth"),
             "Supabase (PostgreSQL)"],
            [T("Backend / API", "Backend / API"), T("Acceso a datos y orquestación",
                                                     "Data access and orchestration"),
             T("Node.js + Express, API de Google Earth Engine, proxy de NASA FIRMS con caché",
               "Node.js + Express, Google Earth Engine API, NASA FIRMS proxy with caching")],
            [T("Frontend", "Frontend"), T("Interfaz", "Interface"),
             T("React 19, Vite, Tailwind CSS 4, Leaflet + react-leaflet, leaflet.heat, clustering "
               "de marcadores, Recharts, lucide-react",
               "React 19, Vite, Tailwind CSS 4, Leaflet + react-leaflet, leaflet.heat, marker "
               "clustering, Recharts, lucide-react")],
            [T("Tiempo real", "Real time"), T("Empuje en vivo", "Live push"),
             T("WebSockets (compatible con MQTT en el borde)",
               "WebSockets (MQTT-compatible at the edge)")],
            [T("Integraciones", "Integrations"), T("Notificación y datos públicos",
                                                    "Notification and public data"),
             T("API de bots de Telegram; Open-Meteo; RainViewer; OpenWeatherMap; NASA GIBS y FIRMS; "
               "Copernicus EFFIS / GWIS; Sentinel-2",
               "Telegram Bot API; Open-Meteo; RainViewer; OpenWeatherMap; NASA GIBS & FIRMS; "
               "Copernicus EFFIS / GWIS; Sentinel-2")],
        ],
        caption=T("Pila tecnológica. La plataforma corre igual en la nube o en una máquina local en "
                  "el territorio.",
                  "Technology stack. The platform runs equally in the cloud or on a local machine "
                  "in the territory."),
        widths=[2.8, 4.0, 9.8],
    )
    d.bullets([
        (T("Manejo de claves.", "Key handling."),
         T("Las claves de API (FIRMS, OpenWeatherMap, cuenta de servicio de Earth Engine) y el "
           "token del bot de Telegram viven solo en el backend, nunca en el paquete del frontend. "
           "Las capas de datos públicos se sirven a través de nuestros propios endpoints proxy.",
           "API keys (FIRMS, OpenWeatherMap, Earth Engine service account) and the Telegram bot "
           "token live in the backend only, never in the frontend bundle. Public-data layers are "
           "served through our own proxy endpoints.")),
        (T("Acceso por rol y auditoría.", "Role-based access and audit."),
         T("Cada perfil ve y hace solo lo que su rol permite, y toda acción sobre una alerta o "
           "sobre la configuración queda registrada con autor y marca de tiempo.",
           "Each profile sees and does only what its role permits, and every action on an alert or "
           "on the configuration is recorded with author and timestamp.")),
        (T("Caché del proxy.", "Proxy caching."),
         T("El proxy cachea las respuestas de las fuentes externas, lo que respeta sus límites de "
           "tasa (FIRMS permite 5.000 peticiones cada 10 minutos) y habilita la operación sin "
           "conexión.",
           "The proxy caches upstream responses, which both respects source rate limits (FIRMS "
           "allows 5,000 requests per 10 minutes) and enables offline operation.")),
        (T("Operación sin conexión.", "Offline operation."),
         T("La detección continúa sin nada de internet, porque la decisión se toma en el borde. La "
           "plataforma es una PWA instalable que cachea la última vista del mapa, los estados de "
           "nodo y las guías; los reportes comunitarios se encolan localmente y se sincronizan al "
           "volver la conexión; los despachos de Telegram no entregados se encolan y se muestran "
           "como pendientes en lugar de perderse; y la sirena local y el protocolo de radio son la "
           "vía de notificación de último recurso.",
           "Detection continues with no internet at all, because the decision is taken at the edge. "
           "The platform is an installable PWA that caches the last map view, node states and "
           "guides; community reports are queued locally and synchronised when a connection "
           "returns; undelivered Telegram dispatches are queued and shown as pending rather than "
           "lost; and the local siren and radio protocol act as the last-resort notification "
           "path.")),
    ])

    d.page_break()

    # ============================================================ 13 IMPLEMENTACIÓN / ESTADO
    d.h1(T("13. Implementación: qué está construido hoy",
           "13. Implementation: what is built today"))
    d.p(T("Esta sección declara de forma honesta el estado real de cada componente. Lo que está "
          "construido se puede mostrar funcionando; lo que está en proceso se declara como tal.",
          "This section states honestly the real status of every component. What is built can be "
          "shown working; what is in progress is declared as such."))
    d.table(
        [T("Componente", "Component"), T("Estado", "Status"), T("Detalle", "Detail")],
        [
            [T("Plataforma web", "Web platform"), T("**Construida y funcionando**", "**Built and running**"),
             T("Aplicación React + Tailwind + Leaflet con tablero, monitoreo, observatorio, tablero "
               "histórico de Colombia, alertas, comunidad, chatbot y capa educativa; bilingüe "
               "ES/EN; responsiva en móvil.",
               "React + Tailwind + Leaflet application with dashboard, monitoring, observatory, "
               "Colombia historical dashboard, alerts, community, chatbot and learning layer; "
               "bilingual ES/EN; responsive on mobile.")],
            [T("Conjunto de datos histórico", "Historical dataset"), T("**Completo**", "**Complete**"),
             T("14.985 incidentes del IDEAM (2010–2025) procesados, limpiados, georreferenciados, "
               "enriquecidos e integrados; 406 puntos de ignición recurrentes calculados.",
               "14,985 IDEAM incidents (2010–2025) parsed, cleaned, georeferenced, enriched and "
               "integrated; 406 recurrent ignition points computed.")],
            [T("Integración de datos públicos", "Public data integration"),
             T("**Funcionando**", "**Working**"),
             T("Focos de NASA FIRMS, capas y consultas puntuales de Google Earth Engine, "
               "Open-Meteo, RainViewer, GIBS y EFFIS activos en el observatorio.",
               "NASA FIRMS hotspots, Google Earth Engine layers and point queries, Open-Meteo, "
               "RainViewer, GIBS and EFFIS live in the observatory.")],
            [T("Backend", "Backend"), T("**Funcionando**", "**Working**"),
             T("Servidor Express con endpoints proxy de Earth Engine y FIRMS, manejo de claves y "
               "caché; Supabase para persistencia y autenticación.",
               "Express server with Earth Engine and FIRMS proxy endpoints, key handling and "
               "caching; Supabase for persistence and authentication.")],
            [T("Contrato de datos del nodo", "Node data contract"),
             T("**Definido y validado**", "**Defined and validated**"),
             T("Diccionario de campos y contrato JSON fijados a partir del estudio comparativo de "
               "sensores del equipo.",
               "Field dictionary and JSON contract fixed from the team's comparative sensor "
               "study.")],
            [T("Prototipo de nodo sensor", "Sensor node prototype"),
             T("En construcción", "In construction"),
             T("Plataforma Arduino MKR con el conjunto de sensores seleccionado; enlace LoRaWAN y "
               "ciclo de trabajo en caracterización.",
               "Arduino MKR platform with the selected sensor set; LoRaWAN link and duty cycle "
               "being characterised.")],
            [T("Motor de alertas + Telegram", "Alert engine + Telegram"),
             T("En integración", "In integration"),
             T("Reglas de fusión y escalera de cinco niveles especificadas; el flujo de despacho y "
               "estado de entrega se está conectando al bot.",
               "Fusion rules and the five-level ladder specified; dispatch and delivery-status flow "
               "being wired to the bot.")],
            [T("Modelo predictivo", "Predictive model"), T("En desarrollo", "In development"),
             T("Superficie de recurrencia calculada desde el conjunto histórico; el índice "
               "meteorológico y la malla combinada de riesgo se están implementando.",
               "Recurrence surface computed from the historical dataset; the fire-weather index and "
               "the combined risk grid being implemented.")],
            [T("Biorremediación", "Bioremediation"), T("En laboratorio", "In laboratory"),
             T("Formulaciones de Trichoderma (melaza, hidrogel, encapsulado) en evaluación "
               "comparativa; robot dispensador en diseño.",
               "Trichoderma formulations (molasses, hydrogel, encapsulation) under comparative "
               "evaluation; capsule-dispensing robot in design.")],
        ],
        caption=T("Estado honesto de cada componente.", "Honest status of every component."),
        widths=[3.6, 3.4, 9.6],
    )
    d.image("knowledge.jpg",
            T("Sección narrativa y educativa del sitio público. La plataforma no solo muestra "
              "datos: explica por qué importan, con el foco puesto en el Bosque Seco Tropical "
              "colombiano, del que solo queda el 8 % del bosque original.",
              "Narrative and educational section of the public site. The platform does not only "
              "show data: it explains why the data matters, focused on the Colombian Tropical Dry "
              "Forest, of which only 8 % of the original forest remains."))

    d.h2(T("13.1 Hoja de ruta", "13.1 Roadmap"))
    d.table(
        [T("Horizonte", "Horizon"), T("Objetivo", "Objective"), T("Entregable", "Deliverable")],
        [
            [T("Ago – Sep 2026 (Fase 2)", "Aug – Sep 2026 (Phase 2)"),
             T("Cerrar el lazo de detección de extremo a extremo.",
               "Close the detection loop end to end."),
             T("Prototipo de nodo transmitiendo por LoRaWAN al servidor local; motor de fusión "
               "generando eventos graduados; despacho automático por Telegram demostrado en vivo; "
               "malla de riesgo dibujada en el mapa.",
               "Node prototype transmitting over LoRaWAN into the local server; fusion engine "
               "raising graded events; automatic Telegram dispatch demonstrated live; risk grid "
               "rendered on the map.")],
            [T("Sep – Oct 2026 (Fase 3)", "Sep – Oct 2026 (Phase 3)"),
             T("Demostración en campo.", "Field demonstration."),
             T("Piloto multinodo en una zona del Valle del Cauca; demostración con anomalía "
               "controlada; formulación de Trichoderma seleccionada con datos de supervivencia; "
               "prototipo del mecanismo de dispersión.",
               "Multi-node pilot in a Valle del Cauca zone; controlled anomaly demonstration; "
               "selected Trichoderma formulation with survival data; robot dispersal mechanism "
               "prototype.")],
            [T("Nov 2026 – 2027", "Nov 2026 – 2027"), T("Piloto municipal.", "Municipal pilot."),
             T("Instalación permanente en un municipio de alta recurrencia con el cuerpo de "
               "bomberos local; modelo predictivo validado contra la retención 2023–2025; plan de "
               "recuperación aplicado sobre una cicatriz de quema real.",
               "Permanent installation in one high-recurrence municipality with the local fire "
               "brigade; predictive model validated against the 2023–2025 hold-out; recovery plan "
               "applied on a real burn scar.")],
            [T("2027 en adelante", "2027 onwards"), T("Replicación.", "Replication."),
             T("Kit de despliegue (lista de materiales, firmware, plataforma y documentación) para "
               "que otros equipos, municipios y países reproduzcan el sistema sobre sus propios "
               "datos.",
               "Deployment kit (hardware bill of materials, firmware, platform and documentation) "
               "so other teams, municipalities and countries can reproduce the system on their own "
               "data.")],
        ],
        caption=T("Hoja de ruta desde la presentación de la Fase 1 hasta la replicación.",
                  "Roadmap from Phase 1 submission to replication."),
        widths=[3.4, 3.6, 9.6],
    )

    d.page_break()

    # ============================================================ 14 IMPACTO
    d.h1(T("14. Impacto, escalabilidad, riesgos y continuidad",
           "14. Impact, scalability, risks and continuation"))
    d.h2(T("14.1 Impacto", "14.1 Impact"))
    d.bullets([
        (T("Tiempo hasta la detección.", "Time to detection."),
         T("El resultado medible es el intervalo entre la ignición y el momento en que la brigada "
           "se entera. Los productos satelitales y las llamadas ciudadanas operan en horas; una red "
           "de nodos con despacho automático opera en minutos. Esa diferencia es la diferencia "
           "entre una hectárea y cien.",
           "The measurable outcome is the interval between ignition and the brigade knowing. "
           "Satellite products and citizen calls operate in hours; a node network with automatic "
           "dispatch operates in minutes. That difference is the difference between a hectare and a "
           "hundred.")),
        (T("Costo de la respuesta.", "Cost of response."),
         T("Extinguir un incendio pequeño es órdenes de magnitud más barato que extinguir uno "
           "establecido: en dinero, en equipo, en riesgo para los bomberos y en carbono liberado.",
           "Suppressing a small fire is orders of magnitude cheaper than suppressing an established "
           "one — in money, in equipment, in risk to firefighters and in carbon released.")),
        (T("Protección de ecosistemas.", "Ecosystem protection."),
         T("Nuestro análisis histórico marca los incidentes en páramo, bosque altoandino, humedal y "
           "zonas glaciares. Son los ecosistemas que regulan el agua de las ciudades colombianas y "
           "los que más lentamente se recuperan. Priorizarlos es una decisión de diseño incorporada "
           "en la plataforma.",
           "Our historical analysis flags incidents in páramo, high-Andean forest, wetland and "
           "glacier-adjacent zones. These are the ecosystems that regulate the water supply of "
           "Colombian cities and that recover most slowly. Prioritising them is a design choice "
           "built into the platform.")),
        (T("Capacidad comunitaria y memoria del territorio.",
           "Community capability and the memory of the territory."),
         T("El reporte ciudadano, la plaza comunitaria, la capa educativa y el chatbot convierten a "
           "los habitantes de espectadores en parte de la red de sensado, y les dan a las brigadas "
           "una imagen operacional compartida que hoy no tienen. Además, la categoría de saberes "
           "ancestrales deja por escrito conocimiento sobre el fuego, el viento y el bosque que "
           "hasta ahora solo se transmitía de forma oral y que se pierde con cada generación.",
           "Citizen reporting, the community plaza, the learning layer and the chatbot turn "
           "residents from spectators into part of the sensing network, and give brigades a shared "
           "operational picture they currently lack. Beyond that, the ancestral knowledge category "
           "puts on the record knowledge about fire, wind and forest that until now was only passed "
           "on orally and that is lost with every generation.")),
        (T("Carbono.", "Carbon."),
         T("Cada hectárea que no se quema es carbono que no se libera y un sumidero preservado; "
           "cada hectárea de suelo restaurado es un sumidero que vuelve.",
           "Every hectare not burned is carbon not released and a sink preserved; every hectare of "
           "soil restored is a sink coming back.")),
    ])

    d.h2(T("14.2 Escalabilidad", "14.2 Scalability"))
    d.p(T("La escalabilidad fue una restricción de diseño desde el principio y funciona en tres "
          "niveles. Dentro de un municipio, ampliar la cobertura significa agregar nodos a un "
          "gateway existente: el costo marginal del siguiente nodo es el nodo mismo. En el país, "
          "las 406 coordenadas recurrentes que identificó nuestro conjunto de datos son una fila "
          "ordenada de despliegue: el sistema nos dice dónde instalarse a continuación. Entre "
          "países, todas las fuentes públicas de las que dependemos (FIRMS, GIBS, Open-Meteo, "
          "RainViewer, Copernicus, Sentinel-2) son globales y gratuitas, el modelo de riesgo solo "
          "necesita un registro histórico nacional de incendios para reajustarse, y los umbrales "
          "son configurables por ecosistema, que es lo que permite que el mismo código sirva al "
          "páramo, al bosque seco tropical o a cualquier otro bioma.",
          "Scalability was a design constraint from the beginning, and it works at three levels. "
          "Within a municipality, adding coverage means adding nodes to an existing gateway — the "
          "marginal cost of the next node is the node itself. Across the country, the 406 recurrent "
          "coordinates our dataset identified are a ranked deployment queue: the system tells us "
          "where to install itself next. Across countries, every public data source we depend on "
          "(FIRMS, GIBS, Open-Meteo, RainViewer, Copernicus, Sentinel-2) is global and free, the "
          "risk model needs only a national historical fire record to be re-fitted, and the "
          "thresholds are configurable per ecosystem — which is what lets the same code serve "
          "páramo, dry tropical forest, or any other biome."))

    d.h2(T("14.3 Riesgos y mitigaciones", "14.3 Risks and mitigations"))
    d.table(
        [T("Riesgo", "Risk"), T("Mitigación", "Mitigation")],
        [
            [T("Las falsas alarmas erosionan la confianza de la brigada.",
               "False alarms erode brigade trust."),
             T("Se exige concordancia entre varios sentidos antes de escalar; líneas base "
               "adaptativas por nodo en lugar de umbrales fijos; confirmación por cámara; cada "
               "alerta descartada retroalimenta el ajuste de umbrales.",
               "Multi-sense concordance required before escalation; per-node adaptive baselines "
               "instead of fixed thresholds; camera confirmation; every dismissed alert feeds back "
               "into threshold tuning.")],
            [T("Pérdida de nodos por fuego, clima, animales o robo.",
               "Node loss to fire, weather, animals or theft."),
             T("Bajo costo unitario, telemetría de salud (batería, RSSI, SNR) que marca un nodo que "
               "falla antes de que se quede mudo, y redundancia de red para que ningún nodo sea un "
               "punto único de falla.",
               "Low unit cost, health telemetry (battery, RSSI, SNR) that flags a failing node "
               "before it goes silent, and network redundancy so no single node is a single point "
               "of failure.")],
            [T("Falla de conectividad justo en el momento de la alerta.",
               "Connectivity failure at the moment of an alert."),
             T("La detección ocurre en el borde y nunca depende de internet; sirena local y "
               "protocolo de radio como respaldo; cola de Telegram con estado pendiente visible y "
               "reenvío automático.",
               "Detection is edge-side and never depends on internet; local siren and radio "
               "protocol as fallback; Telegram queue with visible pending state and automatic "
               "resend.")],
            [T("La formulación de Trichoderma no sobrevive en suelo quemado.",
               "Trichoderma formulation fails to survive in burned soil."),
             T("Tres formulaciones evaluadas en paralelo contra criterios explícitos de "
               "supervivencia antes de cualquier despliegue en campo; el robot se diseña alrededor "
               "del formato de cápsula que gane, y no al revés.",
               "Three formulations evaluated in parallel against explicit survival criteria before "
               "any field deployment; the robot is designed around the capsule format that wins, "
               "not the other way round.")],
            [T("Una fuente de datos pública cambia o limita su tasa.",
               "A public data source changes or rate-limits."),
             T("Todas las fuentes externas se consumen a través de nuestro propio proxy con caché y "
               "normalización, así se puede reemplazar una fuente sin tocar el frontend.",
               "All external sources are consumed through our own proxy with caching and "
               "normalisation, so a source can be swapped without touching the frontend.")],
        ],
        caption=T("Principales riesgos y cómo los absorbe el diseño.",
                  "Principal risks and how the design absorbs them."),
        widths=[5.6, 11.0],
    )

    d.h2(T("14.4 Continuidad del proyecto", "14.4 Project continuation"))
    d.p(T("Este proyecto no termina en Incheon. La plataforma ya está operativa y se seguirá "
          "desarrollando como un instrumento abierto para los territorios colombianos: un piloto "
          "municipal con un cuerpo de bomberos aliado, la validación del modelo predictivo contra "
          "años retenidos, la publicación del conjunto de datos histórico procesado como recurso "
          "público, y un kit de replicación —lista de materiales, firmware, plataforma y "
          "documentación— para que cualquier equipo, en cualquier país con la misma brecha de "
          "conectividad, pueda construir su propio Sistema de Defensa Activa.",
          "This project does not end in Incheon. The platform is already operational and will "
          "continue to be developed as an open instrument for Colombian territories: a municipal "
          "pilot with a partner fire brigade, validation of the predictive model against held-out "
          "years, publication of the processed historical dataset as a public resource, and a "
          "replication kit — bill of materials, firmware, platform and documentation — so that any "
          "team, in any country with the same connectivity gap, can build their own Active Defence "
          "System."))
    d.callout(
        T("NUESTRO COMPROMISO", "OUR COMMITMENT"),
        T("Estamos construyendo esto primero para las brigadas, las comunidades y los bosques de "
          "nuestra propia región. Todo lo que aprendamos —la selección de sensores, los umbrales de "
          "fusión, la historia de incendios procesada, los ensayos de formulación— quedará "
          "documentado y compartido para que pueda reconstruirse en otro lugar.",
          "We are building this for the brigades, the communities and the forests of our own region "
          "first. Everything we learn — the sensor selection, the fusion thresholds, the processed "
          "fire history, the formulation trials — will be documented and shared so it can be "
          "rebuilt elsewhere."))

    d.page_break()

    # ============================================================ ANEXO A — FOTOS
    d.h1(T("Anexo A — Registro fotográfico del proyecto",
           "Appendix A — Project photographic record"))
    d.p(T("Los espacios en marco punteado están reservados para las fotografías del equipo. Para "
          "insertar una imagen, haga clic dentro del marco y use Insertar → Imagen; el pie de "
          "figura ya está escrito debajo de cada uno.",
          "The dashed frames are reserved for the team's photographs. To insert an image, click "
          "inside the frame and use Insert → Picture; the figure caption is already written below "
          "each one."))
    for label, hint in [
        (T("El equipo en sesión de trabajo", "The team in a working session"),
         T("Sugerencia: una de las sesiones presenciales de los sábados.",
           "Suggestion: one of the Saturday in-person sessions.")),
        (T("Salida de campo y reconocimiento del territorio",
           "Field trip and territory reconnaissance"),
         T("Sugerencia: el equipo en el bosque seco tropical de Palmira o en los Farallones.",
           "Suggestion: the team in the Palmira tropical dry forest or in the Farallones.")),
        (T("Trabajo con la brigada de bomberos o la autoridad ambiental",
           "Working with the fire brigade or the environmental authority"),
         T("Sugerencia: reunión, entrevista o demostración de la plataforma con los aliados.",
           "Suggestion: meeting, interview or platform demonstration with the allies.")),
        (T("Foto libre", "Free slot"),
         T("Espacio adicional para cualquier evidencia que el equipo quiera incluir.",
           "Additional space for any evidence the team wishes to include.")),
        (T("Foto libre", "Free slot"),
         T("Espacio adicional para cualquier evidencia que el equipo quiera incluir.",
           "Additional space for any evidence the team wishes to include.")),
    ]:
        d.placeholder(label, hint, height_cm=5.0)

    d.page_break()

    # ============================================================ ANEXO B — REFERENCIAS
    d.h1(T("Anexo B — Fuentes de datos, glosario y referencias",
           "Appendix B — Data sources, glossary and references"))
    d.h2(T("B.1 Fuentes de datos", "B.1 Data sources"))
    d.table(
        [T("Fuente", "Source"), T("Qué tomamos de ella", "What we take from it"),
         T("Se usa en", "Used in")],
        [
            [T("IDEAM (Colombia)", "IDEAM (Colombia)"),
             T("Registro histórico nacional de incendios forestales, 2010–2025",
               "National historical wildfire records, 2010–2025"),
             T("Modelo predictivo, tablero Colombia", "Predictive model, Colombia dashboard")],
            ["NASA FIRMS (MODIS / VIIRS)",
             T("Focos activos: lat, lon, brillo, confianza, FRP, hora",
               "Active hotspots: lat, lon, brightness, confidence, FRP, time"),
             T("Observatorio, contexto de fusión", "Observatory, fusion context")],
            ["NASA GIBS", T("Imagen en color real, anomalías térmicas, aerosol",
                             "True-colour imagery, thermal anomalies, aerosol"),
             T("Capas del observatorio", "Observatory layers")],
            ["Open-Meteo", T("Temperatura, humedad, viento y lluvia actuales y pronosticadas",
                              "Current and forecast temperature, humidity, wind, rain"),
             T("Índice meteorológico, consultas puntuales", "Fire-weather index, point queries")],
            ["Open-Meteo Air Quality", "PM2.5, PM10, CO, O₃",
             T("Capa de aire, consultas puntuales", "Air layer, point queries")],
            ["RainViewer", T("Radar de precipitación animado", "Animated precipitation radar"),
             T("Capa meteorológica", "Weather layer")],
            ["OpenWeatherMap", T("Capas de temperatura, viento y nubes",
                                  "Temperature, wind and cloud tile layers"),
             T("Capas meteorológicas", "Weather layers")],
            ["Copernicus EFFIS / GWIS", T("Áreas quemadas, FWI y subíndices",
                                           "Burned areas, FWI and sub-indices"),
             T("Contraste de riesgo, mapeo de área quemada",
               "Risk cross-check, burned-area mapping")],
            [T("Sentinel-2 / Google Earth Engine", "Sentinel-2 / Google Earth Engine"),
             T("NDVI, sequedad de la vegetación, severidad de quema",
               "NDVI, vegetation dryness, burn severity"),
             T("Capa de vegetación, biorremediación", "Vegetation layer, bioremediation")],
            [T("Reportes comunitarios", "Community reports"),
             T("Observaciones ciudadanas de humo, calor y fuego",
               "Citizen observations of smoke, heat and fire"),
             T("Contexto de fusión, capa del observatorio", "Fusion context, observatory layer")],
            [T("Nuestra red de nodos LoRaWAN", "Our LoRaWAN node network"),
             T("Telemetría multisensorial de verdad de campo",
               "Ground-truth multi-sensor telemetry"),
             T("Detección, alertas, corrección del modelo",
               "Detection, alerts, model correction")],
        ],
        caption=T("Todas las fuentes externas son gratuitas y de cobertura global, que es lo que "
                  "hace replicable el sistema fuera de Colombia sin costo de datos.",
                  "All external sources are free and globally available, which is what makes the "
                  "system replicable outside Colombia at no data cost."),
        widths=[4.0, 7.0, 5.6],
    )

    d.h2(T("B.2 Glosario", "B.2 Glossary"))
    d.table(
        [T("Término", "Term"), T("Definición", "Definition")],
        [
            ["LoRaWAN", T("Long Range Wide Area Network. Protocolo de radio de bajo consumo para "
                          "tramas pequeñas a larga distancia en espectro no licenciado; no requiere "
                          "SIM, operador ni suscripción.",
                          "Long Range Wide Area Network. Low-power radio protocol for small "
                          "payloads over long distances on unlicensed spectrum; requires no SIM, "
                          "operator or subscription.")],
            ["Gateway", T("Receptor de radio que recoge las tramas de muchos nodos LoRaWAN y las "
                          "reenvía a un servidor.",
                          "Radio receiver that collects frames from many LoRaWAN nodes and forwards "
                          "them to a server.")],
            [T("Fusión de sensores", "Sensor fusion"),
             T("Combinar evidencia de varios sensores independientes para llegar a una decisión que "
               "ningún sensor podría sostener por sí solo de forma confiable.",
               "Combining evidence from several independent sensors to reach a decision that no "
               "single sensor could support reliably.")],
            [T("Triángulo del fuego", "Fire triangle"),
             T("Calor, combustible y comburente: las tres condiciones que un fuego requiere. Cada "
               "uno de nuestros sentidos informa sobre una de ellas.",
               "Heat, fuel and oxidiser — the three conditions a fire requires. Each of our senses "
               "reports on one of them.")],
            ["FWI", T("Fire Weather Index. Índice meteorológico de peligro de incendio; aquí se usa "
                      "como contraste de nuestro propio cálculo.",
                      "Fire Weather Index. Meteorological index of fire danger; used here as a "
                      "cross-check on our own computation.")],
            ["NDVI", T("Índice de vegetación de diferencia normalizada. Medida satelital del vigor "
                       "de la vegetación, usada como aproximación de su sequedad y del estado del "
                       "combustible.",
                       "Normalized Difference Vegetation Index. Satellite measure of vegetation "
                       "vigour, used as a proxy for vegetation dryness and fuel state.")],
            ["VPD", T("Déficit de presión de vapor. Medida de cuánta humedad le falta al aire para "
                      "saturarse; a mayor VPD, más rápido se seca el combustible vegetal.",
                      "Vapour Pressure Deficit. A measure of how far the air is from saturation; "
                      "the higher the VPD, the faster vegetal fuel dries out.")],
            [T("Recurrencia", "Recurrence"),
             T("Con qué frecuencia y cuántas veces se ha quemado históricamente un lugar; la mitad "
               "del «dónde» del modelo de riesgo.",
               "How often and how repeatedly a given location has burned historically; the 'where' "
               "half of the risk model.")],
            ["RSSI / SNR", T("Intensidad de señal recibida y relación señal-ruido; los indicadores "
                             "de salud del enlace de radio de un nodo.",
                             "Received signal strength and signal-to-noise ratio; the health "
                             "indicators of a node's radio link.")],
            ["Trichoderma", T("Género de hongos benéficos del suelo usado para restaurar la "
                              "actividad biológica, promover el crecimiento radicular y mejorar la "
                              "disponibilidad de nutrientes en suelo degradado.",
                              "Genus of beneficial soil fungi used to restore biological activity, "
                              "promote root growth and improve nutrient availability in degraded "
                              "soil.")],
            [T("Biorremediación", "Bioremediation"),
             T("Usar organismos vivos para restaurar un ambiente dañado; aquí, restaurar el suelo "
               "quemado en lugar de solo replantar encima.",
               "Using living organisms to restore a damaged environment — here, restoring burned "
               "soil rather than only replanting above it.")],
            ["PWA", T("Progressive Web App. Aplicación web instalable que funciona con conectividad "
                      "intermitente o nula.",
                      "Progressive Web App. Installable web application that works with "
                      "intermittent or absent connectivity.")],
        ],
        widths=[3.4, 13.2],
    )

    d.h2(T("B.3 Referencias", "B.3 References"))
    for ref in [
        "IDEAM — Instituto de Hidrología, Meteorología y Estudios Ambientales. "
        + T("Registros históricos de incendios de la cobertura vegetal, Colombia, 2010–2025.",
            "Historical records of vegetation-cover fires, Colombia, 2010–2025.")
        + " https://www.ideam.gov.co",
        "NASA FIRMS — Fire Information for Resource Management System (MODIS / VIIRS). "
        "https://firms.modaps.eosdis.nasa.gov",
        "NASA GIBS — Global Imagery Browse Services. https://nasa-gibs.github.io",
        "Copernicus EFFIS / GWIS — European Forest Fire Information System / Global Wildfire "
        "Information System. https://effis.jrc.ec.europa.eu",
        "Open-Meteo — " + T("API meteorológica y de calidad del aire abierta.",
                            "Open weather and air-quality API.") + " https://open-meteo.com",
        "RainViewer — " + T("Radar de precipitación global.", "Global precipitation radar.")
        + " https://www.rainviewer.com",
        "Google Earth Engine / Sentinel-2 — " + T("Plataforma de análisis geoespacial y misión de "
                                                  "observación terrestre de la ESA.",
                                                  "Geospatial analysis platform and ESA Earth "
                                                  "observation mission.")
        + " https://earthengine.google.com",
        "LoRa Alliance — LoRaWAN Specification and Regional Parameters. https://lora-alliance.org",
        "Telegram — Bot API documentation. https://core.telegram.org/bots/api",
        "Hansen, M. C., et al. (2013). High-Resolution Global Maps of 21st-Century Forest Cover "
        "Change. Science, 342(6160), 850–853.",
        "Abatzoglou, J. T., et al. (2018). TerraClimate, a high-resolution global dataset of "
        "monthly climate and climatic water balance. Scientific Data, 5, 170191.",
        "Key, C. H., & Benson, N. C. (2006). Landscape Assessment: Sampling and Analysis Methods "
        "(" + T("índice NBR / ΔNBR de severidad de quema", "NBR / ΔNBR burn severity index")
        + "). USDA Forest Service, RMRS-GTR-164.",
        "Harman, G. E., et al. (2004). Trichoderma species — opportunistic, avirulent plant "
        "symbionts. Nature Reviews Microbiology, 2(1), 43–56.",
        "Certini, G. (2005). Effects of fire on properties of forest soils: a review. Oecologia, "
        "143(1), 1–10.",
        "DeBano, L. F. (2000). The role of fire and soil heating on water repellency in wildland "
        "environments: a review. Journal of Hydrology, 231–232, 195–206.",
        "Pimont, F., et al. (2019). Why is the effect of vapour pressure deficit on fire danger so "
        "strong? " + T("Sobre el uso del VPD como indicador de sequedad del combustible.",
                       "On the use of VPD as a fuel-dryness indicator."),
        T("FIRST Global Challenge (2026). Guía del reto: New Technology Experience — Igniting "
          "Innovation.",
          "FIRST Global Challenge (2026). Challenge guide: New Technology Experience — Igniting "
          "Innovation."),
    ]:
        par = d.d.add_paragraph(ref, style="List Bullet")
        par.runs[0].font.size = Pt(9)
        par.paragraph_format.space_after = Pt(3)

    d.rule()
    d.p("FIRST Global Team Colombia", size=9.5, bold=True, color=GREEN,
        align=WD_ALIGN_PARAGRAPH.CENTER, space_after=1)
    d.p(T("Sistema de Defensa Activa (NTE) · New Technology Experience 2026 · Categoría: Detectar",
          "Active Defence System (NTE) · New Technology Experience 2026 · Category: Detect"),
        size=8.5, color=GREY, align=WD_ALIGN_PARAGRAPH.CENTER)

    out = os.path.join(BASE, L[lang]["file"])
    d.save(out)
    return out


if __name__ == "__main__":
    for lang in ("es", "en"):
        print("->", build(lang))
