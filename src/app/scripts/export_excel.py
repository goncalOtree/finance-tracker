import sys
import json
import xlsxwriter


month_dict ={"janeiro": "F",
 "fevereiro": "G",
 "março": "H",
 "abril": "I",
 "maio": "J",
 "junho": "K",
 "julho": "L",
 "agosto": "M",
 "setembro": "N",
 "outubro": "O",
 "novembro": "P",
 "dezembro": "Q"}

if len(sys.argv) < 2:
    print("Error: No input/output file provided")
    sys.exit(1)

input_file = sys.argv[1]
output_file = input_file.replace(".json", ".xlsx")

with open(input_file, "r", encoding="utf8") as file:
    transactions = json.load(file)


# Create a workbook and add a worksheet.
workbook = xlsxwriter.Workbook(output_file)
worksheet = workbook.add_worksheet()

# Define formats
bold = workbook.add_format({'bold': True})
green =workbook.add_format({'font_color':'green'})
green_bold =workbook.add_format({'bold':True,'font_color':'green'})
red =workbook.add_format({'font_color':'red'})
red_bold =workbook.add_format({'bold':True,'font_color':'red'})
# Organize data
months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
categories = sorted(set((t['category']['name'], t['category']['type']) for t in transactions), key=lambda x: x[1])

number_categories_fixo = len([c for c in categories if c[1] == 'FIXO'])
number_categories_vencimento = len([c for c in categories if c[1] == 'VENCIMENTO' and c[0] != "Vencimentos"])
number_categories_variavel = len([c for c in categories if c[1] == 'VARIÁVEL'])

# Write headers
worksheet.write(3, 1, transactions[0]["year"], bold)
col = 5
for month in months:
    worksheet.write(4, col, month, bold)
    col += 1

# Write categories and transactions
row = 7
for cat_type in ['FIXO', 'VENCIMENTO', 'VARIÁVEL']:
    for category in categories:
        if category[1] == cat_type and category[0] != "Vencimentos":
            worksheet.write(row, 1, category[0], green if cat_type == 'VENCIMENTO' else None)
            col = 5
            for month in months:
                total = sum(t['amount'] for t in transactions if t['month'] == month and t['category']['name'] == category[0] )
                worksheet.write(row, col, total)
                col += 1
            row += 1
    row += 1

# Write totals
row += 3
worksheet.write(row, 2, 'Total fixo', red_bold)
worksheet.write(row+1, 2, 'Total variável', red_bold)
worksheet.write(row+2, 2, 'Total Poupança', green_bold)
worksheet.write(row+4, 2, 'Total geral', red_bold)
worksheet.write(row+6, 2, 'Vencimentos', green_bold)
worksheet.write(row+8, 2, 'Poupança', green_bold)
col = 5
for month in months:
    
    total_fixo = worksheet.write_formula(row, col, f'=SUM({month_dict[month]}{8}:{month_dict[month]}{8+number_categories_fixo-1})')

    row_variavel = 8+number_categories_fixo+number_categories_vencimento+2
    total_variavel = worksheet.write_formula(row+1, col, f'=SUM({month_dict[month]}{row_variavel}:{month_dict[month]}{row_variavel + number_categories_variavel -1})')

    row_poupanca = row_variavel - number_categories_vencimento - 1
    total_vencimento = worksheet.write_formula(row+2, col, f'=SUM({month_dict[month]}{row_poupanca}:{month_dict[month]}{row_poupanca + number_categories_vencimento -1})')

    
    total = worksheet.write_formula(row+4, col, f'=SUM({month_dict[month]}{row+1}:{month_dict[month]}{row+2})')
    

    vencimentos = sum(t['amount'] for t in transactions if t['month'] == month and t['category']['name'] == 'Vencimentos')
    worksheet.write(row+6, col, vencimentos)


    poupanca = total_vencimento + vencimentos - total
    poupanca = worksheet.write_formula(row+8, col, f'={month_dict[month]}{row+7}-{month_dict[month]}{row+5}')
    col += 1

workbook.close()