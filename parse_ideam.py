import pandas as pd
import json

df = pd.read_excel('docs/resultado_incendios_IDEAM.xlsx')
data = []
dept_counts = {}

for _, row in df.iterrows():
    coords = str(row.get('COORDENADAS', ''))
    if ',' in coords:
        parts = coords.split(',')
        try:
            lat = float(parts[0].strip())
            lng = float(parts[1].strip())
            
            # keep basic info
            dept = str(row.get('DEPARTAMENTO', 'Unknown'))
            if dept not in dept_counts:
                dept_counts[dept] = 0
            dept_counts[dept] += 1
            
            data.append({
                'lat': lat,
                'lng': lng,
                'fecha': str(row.get('FECHA', '')).split(' ')[0],
                'dept': dept,
                'mun': str(row.get('MUNICIPIO', '')),
                'ecos': str(row.get('ecos_general', ''))
            })
        except:
            pass

# sort departments
sorted_depts = sorted(dept_counts.items(), key=lambda x: x[1], reverse=True)

output = {
    'total': len(data),
    'top_departments': [{'name': k, 'count': v} for k, v in sorted_depts[:10]],
    'incidents': data
}

with open('public/ideam_data.json', 'w') as f:
    json.dump(output, f)

print("Data exported successfully to public/ideam_data.json")
