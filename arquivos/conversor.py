# CSV TO DB

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.sql import text  # Necessário para consultas diretas

# Configurações do arquivo CSV e do banco de dados
csv_path = "data2024.csv"  # Certifique-se de substituir pelo nome real do seu arquivo CSV
sqlite_db_path = "data.db"  # O arquivo SQLite será criado ou substituído

# Ler o arquivo CSV com apenas uma coluna
data = pd.read_csv(csv_path, header=None, skiprows=1)

# Dividir os valores que estão na única coluna em múltiplas colunas
data_split = data[0].str.split(',', expand=True)

# Renomear as colunas
data_split.columns = ["Data", "Tipo Residuo", "Peso"]

# Remover aspas dos campos "Tipo Residuo" e "Peso"
data_split["Tipo Residuo"] = data_split["Tipo Residuo"].str.replace('"', '')
data_split["Peso"] = data_split["Peso"].str.replace('"', '')

# Converter "Peso" para número inteiro
data_split["Peso"] = pd.to_numeric(data_split["Peso"])

# Configurar a conexão com SQLite
engine = create_engine(f"sqlite:///{sqlite_db_path}")

# Salvar os dados na tabela 'residuos'
data_split.to_sql("residuos", con=engine, if_exists="replace", index=False)

print(f"Dados processados e salvos no banco de dados SQLite: {sqlite_db_path}")

# Verificar os dados inseridos no banco
with engine.connect() as connection:
    query = text("SELECT * FROM residuos")  # Preparar a consulta SQL
    result = connection.execute(query)
    print("Dados inseridos no banco:")
    for row in result:
        print(row)
