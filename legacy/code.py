# ─────────────────────────────────────────────────────────────────────────────
# ORIGINAL PROJECT — preserved for provenance.
# Source: https://github.com/Mori3lM/IL-Car-Details-Finder  (code.py)
# This is the original CLI the web app was rebuilt from. Kept here unchanged as a
# reference; the field-translation dictionary and the data.gov.il resource id below
# were ported into src/lib/govData/ . Not used by the web app at runtime.
# ─────────────────────────────────────────────────────────────────────────────

import urllib.request
import json

def search_car(api_url, user_input): # searching for the car data
    url = f'{api_url}&q={user_input}'
    with urllib.request.urlopen(url) as response:
        data = response.read().decode('utf-8')
        json_data = json.loads(data)
        return json_data

api_url = 'https://data.gov.il/api/3/action/datastore_search?resource_id=053cea08-09bc-40ec-8f7a-156f0677aff3&limit=5'

 # defining car details in hebrew
field_translation = {
    'mispar_rechev': 'מספר רכב',
    'tozeret_cd': 'קוד תוצר',
    'sug_degem': 'סוג דגם',
    'tozeret_nm': 'שם תוצר',
    'degem_cd': 'קוד דגם',
    'degem_nm': 'שם דגם',
    'ramat_gimur': 'רמת גימור',
    'ramat_eivzur_betihuty': 'רמת אבזור בטיחותי',
    'kvutzat_zihum': 'קבוצת זיהום',
    'shnat_yitzur': 'שנת יצור',
    'degem_manoa': 'דגם מנוע',
    'mivchan_acharon_dt': 'תאריך מבחן אחרון',
    'tokef_dt': 'תוקף',
    'baalut': 'בעלות',
    'misgeret': 'שלדה',
    'misgeret_amitit': 'מספר יד 1',
    'tzeva_rechev': 'צבע רכב',
    'zmig_kidmi': 'צמיג קדמי',
    'zmig_ahori': 'צמיג אחורי',
    'sug_delek_nm': 'סוג דלק',
    'moed_aliya_lakvish': 'מועד עלייה לכביש',
    'kinuy_mishari': 'סוג דגם',
    'horaat_rishum': 'הוראת רישום',
}

# Fields to exclude
fields_to_exclude = ['דירוג', 'הוראת רישום', 'זמן עזיבה', 'tzeva_cd', 'ramat_eivzur_betihuty', 'degem_cd', 'tozeret_cd', 'misgeret_amitit', 'kvutzat_zihum', 'rank']

try:
    while True:
        user_input = input("Enter car number (mispar_rechev) or VIN (misgeret), 'exit' to quit: ")
        if user_input.lower() == 'exit':
            break

        found_car_data = search_car(api_url, user_input)

        if 'result' in found_car_data:
            result = found_car_data['result']
            if 'records' in result:
                records = result['records']
                if records:
                    print("\nCar Found:")
                    for car in records:
                        filtered_fields = [(field_translation.get(field, field), value) for field, value in car.items() if field not in fields_to_exclude]
                        for field_name, value in filtered_fields:
                            print(f"{field_name}: {value}")
                        print("--------------------")
                else:
                    print(f"\nCar with {user_input} not found.")
            else:
                print("\nThe 'records' key is not present in the 'result' section.")
        else:
            print("\nThe 'result' key is not present in the response.")

except Exception as e:
    print(f"An error occurred: {e}")
