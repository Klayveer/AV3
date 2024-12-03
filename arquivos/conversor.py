# CSV TO DB

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.sql import text

csv_path = "data.csv"
sqlite_db_path = "data.db"

# Ler o arquivo CSV com apenas uma coluna
data = pd.read_csv(csv_path, header=None, skiprows=1)

# Dividir os valores que estão na única coluna em múltiplas colunas
data_split = data[0].str.split(',', expand=True)

# Renomeia as colunas
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