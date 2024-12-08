# CSV TO DB

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.sql import text

csv_path = "data.csv"
sqlite_db_path = "data.db"

data = pd.read_csv(csv_path, header=None, skiprows=1)

data_split = data[0].str.split(',', expand=True)

data_split.columns = ["Data", "Tipo Residuo", "Peso"]

data_split["Tipo Residuo"] = data_split["Tipo Residuo"].str.replace('"', '')
data_split["Peso"] = data_split["Peso"].str.replace('"', '')

data_split["Peso"] = pd.to_numeric(data_split["Peso"])

engine = create_engine(f"sqlite:///{sqlite_db_path}")

data_split.to_sql("residuos", con=engine, if_exists="replace", index=False)