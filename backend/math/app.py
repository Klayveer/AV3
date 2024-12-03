import os
import pandas as pd
import matplotlib.pyplot as plt

file_path = 'CSV/data.csv'
if not os.path.exists(file_path):
    print(f"Error: File '{file_path}' not found.")
    exit()

df = pd.read_csv(file_path)

df.columns = df.columns.str.strip().str.replace('"', '')


df.columns = df.columns.str.replace('Residuo', 'Resíduo')

required_columns = ['Data', 'Tipo Resíduo', 'Peso']

df['Data'] = pd.to_datetime(df['Data'], format='%Y-%m-%d')

df['Peso'] = df['Peso'].str.replace(',', '').astype(float)

plt.ticklabel_format(style='plain', useOffset=False, useLocale=False)

unique_tipos = df['Tipo Resíduo'].unique()

for tipo in unique_tipos:
    tipo_df = df[df['Tipo Resíduo'] == tipo]
    
    tipo_df = tipo_df.set_index('Data').resample('M').sum().reset_index()
    
    plt.figure()
    plt.plot(tipo_df['Data'], tipo_df['Peso'])
    plt.title(f'{tipo} Peso vs Data')
    plt.xlabel('Data')
    plt.ylabel('Peso')
    plt.tight_layout()
    plt.savefig(f'{tipo}.png')

print("Criado.")
