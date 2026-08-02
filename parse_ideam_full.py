import pandas as pd
import json
from collections import defaultdict

df = pd.read_excel('docs/resultado_incendios_IDEAM.xlsx')

data = []

intervened_keywords = ['agroecosistema', 'secundaria', 'artificializado', 'transicional', 'transformado']

recurrence_map = defaultdict(lambda: {'count': 0, 'years': set(), 'dept': '', 'mun': ''})

for _, row in df.iterrows():
    coords = str(row.get('COORDENADAS', ''))
    if ',' in coords:
        parts = coords.split(',')
        try:
            lat = float(parts[0].strip())
            lng = float(parts[1].strip())
            
            fecha_val = str(row.get('FECHA', '')).split(' ')[0]
            if not fecha_val or fecha_val == 'nan' or fecha_val == 'NaT':
                continue
                
            parts_date = fecha_val.split('-')
            year = parts_date[0]
            month = parts_date[1] if len(parts_date) > 1 else '01'
            
            dept = str(row.get('DEPARTAMENTO', 'Unknown')).strip().upper()
            mun = str(row.get('MUNICIPIO', 'Unknown')).strip().upper()
            
            # Clean department names (e.g., GUAVIARE)
            if dept == 'GUAVIARE':
                dept = 'GUAVIARE'
            elif dept == 'NACION':
                dept = 'NACIÓN'
                
            gran_bioma = str(row.get('gran_bioma', '')).strip()
            bioma_iavh = str(row.get('bioma_IAvH', '')).strip()
            ecos = str(row.get('ecos_sintesis', '')).strip()
            if ecos == 'nan' or not ecos:
                ecos = str(row.get('ecos_general', '')).strip()
                
            clima = str(row.get('clima', '')).strip()
            paisaje = str(row.get('paisaje', '')).strip()
            relieve = str(row.get('relieve', '')).strip()
            suelos = str(row.get('suelos', '')).strip()
            
            ecos_lower = ecos.lower()
            is_intervened = any(k in ecos_lower for k in intervened_keywords)
            
            # Recurrence tracking
            coord_key = f"{lat},{lng}"
            recurrence_map[coord_key]['count'] += 1
            recurrence_map[coord_key]['years'].add(year)
            if not recurrence_map[coord_key]['dept']:
                recurrence_map[coord_key]['dept'] = dept
                recurrence_map[coord_key]['mun'] = mun
                recurrence_map[coord_key]['lat'] = lat
                recurrence_map[coord_key]['lng'] = lng
            
            data.append({
                'lat': lat,
                'lng': lng,
                'fecha': fecha_val,
                'year': year,
                'month': month,
                'dept': dept,
                'mun': mun,
                'gran_bioma': gran_bioma,
                'bioma_iavh': bioma_iavh,
                'ecos': ecos,
                'is_intervened': is_intervened,
                'clima': clima,
                'paisaje': paisaje,
                'relieve': relieve,
                'suelos': suelos
            })
        except Exception as e:
            pass

# Process recurrence: MUST have >= 2 distinct years, sort by years_count desc, then total count desc
recurrence_list = []
for k, v in recurrence_map.items():
    if len(v['years']) >= 2:
        recurrence_list.append({
            'coord': k,
            'lat': v['lat'],
            'lng': v['lng'],
            'dept': v['dept'],
            'mun': v['mun'],
            'count': v['count'],
            'years_count': len(v['years']),
            'years_list': sorted(list(v['years']))
        })

# Sort primary by years_count desc, secondary by total count desc
recurrence_list.sort(key=lambda x: (x['years_count'], x['count']), reverse=True)

output = {
    'total': len(data),
    'incidents': data,
    'recurrence': recurrence_list
}

with open('public/ideam_data.json', 'w') as f:
    json.dump(output, f, separators=(',', ':'))

print("Full data exported successfully to public/ideam_data.json")
print("Total rows exported:", len(data))
print("Real recurrent points found (>=2 years):", len(recurrence_list))
