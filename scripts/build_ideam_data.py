#!/usr/bin/env python3
"""
Construye `public/ideam_data.json` a partir del archivo del IDEAM.

Sustituye a `parse_ideam_full.py`, que copiaba tal cual las columnas
DEPARTAMENTO y MUNICIPIO del Excel. Auditamos esas columnas contra las
coordenadas y no describen dónde ocurrió el incendio:

    · el MUNICIPIO del archivo coincide con el municipio que contiene a la
      coordenada solo en el 4 % de los registros, y ese 4 % se mantiene igual
      en todos los años, incluido 2025;
    · el DEPARTAMENTO coincide en el 94 % de los registros de 2025 pero solo
      en ~50 % entre 2012 y 2019;
    · los desacuerdos son sistemáticamente municipios vecinos del mismo
      departamento (Yopal↔San Luis de Palenque, Ibagué↔Ortega,
      Puerto Carreño↔Cumaribo), el patrón de una atribución administrativa
      del reporte, no de una ubicación.

La coordenada, en cambio, es el dato observado: viene de la detección
satelital. Así que aquí la ubicación se **deriva de la coordenada** cruzándola
con el Marco Geoestadístico Nacional del DANE (1.122 municipios), y la
etiqueta original del archivo se conserva en `dept_src` / `mun_src` para poder
mostrar ambas y no borrar lo que dice la fuente.

Uso:
    python3 scripts/build_ideam_data.py
"""

import json
import os
import sys
import unicodedata
from collections import defaultdict

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(BASE, 'docs', 'resultado_incendios_IDEAM.xlsx')
MGN = os.path.join(BASE, 'docs', 'mgn_municipios_2018.geojson')
OUT = os.path.join(BASE, 'public', 'ideam_data.json')

# Origen del MGN, por si hay que volver a descargarlo:
MGN_URL = ('https://raw.githubusercontent.com/caticoa3/colombia_mapa/'
           'master/co_2018_MGN_MPIO_POLITICO.geojson')

INTERVENED_KEYWORDS = ['agroecosistema', 'secundaria', 'artificializado',
                       'transicional', 'transformado']

# El resto de la plataforma usa los nombres en mayúscula y sin tildes, salvo la
# eñe de Nariño. El MGN los trae acentuados.
DEPT_ALIAS = {
    'ARCHIPIELAGO DE SAN ANDRES, PROVIDENCIA Y SANTA CATALINA': 'SAN ANDRES',
}


def deaccent(s):
    """Quita tildes pero conserva la eñe, que sí distingue nombres."""
    out = []
    for ch in unicodedata.normalize('NFD', str(s)):
        if ch == '̃':          # tilde de la ñ
            out.append(ch)
            continue
        if unicodedata.combining(ch):
            continue
        out.append(ch)
    return unicodedata.normalize('NFC', ''.join(out)).upper().strip()


def load_municipalities():
    if not os.path.exists(MGN):
        sys.exit(f"Falta {MGN}. Descárgalo de:\n  {MGN_URL}")

    geo = json.load(open(MGN))
    polys = []
    for f in geo['features']:
        p = f['properties']
        dept = deaccent(p['DPTO_CNMBR'])
        dept = DEPT_ALIAS.get(dept, dept)
        mun = deaccent(p['MPIO_CNMBR'])

        g = f['geometry']
        rings = ([g['coordinates'][0]] if g['type'] == 'Polygon'
                 else [poly[0] for poly in g['coordinates']])

        # Caja envolvente por anillo y por municipio: sin este filtro previo,
        # cruzar 15.000 puntos contra 1.122 polígonos es inviable.
        with_bbox = []
        for r in rings:
            xs = [c[0] for c in r]
            ys = [c[1] for c in r]
            with_bbox.append((r, (min(xs), min(ys), max(xs), max(ys))))
        bx = (min(b[1][0] for b in with_bbox), min(b[1][1] for b in with_bbox),
              max(b[1][2] for b in with_bbox), max(b[1][3] for b in with_bbox))
        polys.append((dept, mun, with_bbox, bx))
    return polys


def point_in_ring(ring, x, y):
    """Ray casting clásico."""
    n = len(ring)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def make_locator(polys):
    def locate(lng, lat):
        for dept, mun, rings, (x0, y0, x1, y1) in polys:
            if not (x0 <= lng <= x1 and y0 <= lat <= y1):
                continue
            for ring, (rx0, ry0, rx1, ry1) in rings:
                if rx0 <= lng <= rx1 and ry0 <= lat <= ry1 and point_in_ring(ring, lng, lat):
                    return dept, mun
        return None
    return locate


def main():
    import pandas as pd

    polys = load_municipalities()
    locate = make_locator(polys)
    print(f"Municipios oficiales cargados: {len(polys)}")

    df = pd.read_excel(XLSX)
    print(f"Filas en el archivo del IDEAM: {len(df)}")

    data = []
    recurrence = defaultdict(lambda: {'count': 0, 'years': set()})
    stats = {'sin_municipio': 0, 'dept_igual': 0, 'mun_igual': 0}

    for _, row in df.iterrows():
        coords = str(row.get('COORDENADAS', ''))
        if ',' not in coords:
            continue
        try:
            lat = float(coords.split(',')[0].strip())
            lng = float(coords.split(',')[1].strip())
        except ValueError:
            continue

        fecha = str(row.get('FECHA', '')).split(' ')[0]
        if not fecha or fecha in ('nan', 'NaT'):
            continue
        parts = fecha.split('-')
        year = parts[0]
        month = parts[1] if len(parts) > 1 else '01'

        dept_src = deaccent(row.get('DEPARTAMENTO', ''))
        mun_src = deaccent(row.get('MUNICIPIO', ''))
        if dept_src == 'NACION':
            dept_src = 'NACIÓN'

        hit = locate(lng, lat)
        if hit is None:
            # Sin municipio: pasa en un puñado de puntos sobre la línea de
            # costa o de frontera. Se conserva lo que diga el archivo, marcado.
            stats['sin_municipio'] += 1
            dept, mun, geo_src = dept_src, mun_src, 'archivo'
        else:
            dept, mun = hit
            geo_src = 'coordenada'
            if dept == dept_src:
                stats['dept_igual'] += 1
            if mun == mun_src:
                stats['mun_igual'] += 1

        ecos = str(row.get('ecos_sintesis', '')).strip()
        if ecos in ('nan', ''):
            ecos = str(row.get('ecos_general', '')).strip()
        ecos_lower = ecos.lower()

        key = f"{lat},{lng}"
        recurrence[key]['count'] += 1
        recurrence[key]['years'].add(year)
        recurrence[key].setdefault('lat', lat)
        recurrence[key].setdefault('lng', lng)
        recurrence[key].setdefault('dept', dept)
        recurrence[key].setdefault('mun', mun)

        rec = {
            'lat': lat, 'lng': lng, 'fecha': fecha, 'year': year, 'month': month,
            'dept': dept, 'mun': mun,
            'gran_bioma': str(row.get('gran_bioma', '')).strip(),
            'bioma_iavh': str(row.get('bioma_IAvH', '')).strip(),
            'ecos': ecos,
            'is_intervened': any(k in ecos_lower for k in INTERVENED_KEYWORDS),
            'clima': str(row.get('clima', '')).strip(),
            'paisaje': str(row.get('paisaje', '')).strip(),
            'relieve': str(row.get('relieve', '')).strip(),
            'suelos': str(row.get('suelos', '')).strip(),
            'geo_src': geo_src,
        }
        # La atribución original solo se guarda cuando difiere: si coincide, el
        # dato ya está en `dept`/`mun` y repetirlo solo engorda el archivo.
        if dept_src != dept:
            rec['dept_src'] = dept_src
        if mun_src != mun:
            rec['mun_src'] = mun_src

        data.append(rec)

    recurrence_list = [{
        'coord': k, 'lat': v['lat'], 'lng': v['lng'], 'dept': v['dept'], 'mun': v['mun'],
        'count': v['count'], 'years_count': len(v['years']),
        'years_list': sorted(v['years']),
    } for k, v in recurrence.items() if len(v['years']) >= 2]
    recurrence_list.sort(key=lambda x: (x['years_count'], x['count']), reverse=True)

    located = len(data) - stats['sin_municipio']
    output = {
        'total': len(data),
        'incidents': data,
        'recurrence': recurrence_list,
        # Metadatos de la auditoría: la plataforma los muestra en las notas
        # metodológicas, para que la cifra no haya que creerla de memoria.
        'geo_audit': {
            'located': located,
            'unlocated': stats['sin_municipio'],
            'dept_matches_source': stats['dept_igual'],
            'mun_matches_source': stats['mun_igual'],
            'boundaries': 'DANE · Marco Geoestadístico Nacional 2018 (1.122 municipios)',
        },
    }

    with open(OUT, 'w') as f:
        json.dump(output, f, separators=(',', ':'), ensure_ascii=False)

    print(f"\nRegistros exportados      : {len(data)}")
    print(f"Ubicados por coordenada   : {located} ({located/len(data):.2%})")
    print(f"Sin municipio (costa/borde): {stats['sin_municipio']}")
    print(f"Puntos recurrentes (≥2 años): {len(recurrence_list)}")
    print("\nCoincidencia con la atribución del archivo:")
    print(f"  departamento: {stats['dept_igual']/located:.1%}")
    print(f"  municipio   : {stats['mun_igual']/located:.1%}")
    print(f"\nEscrito en {OUT}")


if __name__ == '__main__':
    main()
