import sqlite3
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Função para conectar ao banco de dados SQLite
def get_db_connection():
    conn = sqlite3.connect('residuos.db')
    conn.row_factory = sqlite3.Row
    return conn

# Função para criar a tabela no banco de dados
def create_table():
    conn = get_db_connection()
    conn.execute('''CREATE TABLE IF NOT EXISTS residuos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        data TEXT NOT NULL,
                        tipo_residuo TEXT NOT NULL,
                        peso REAL NOT NULL)''')
    conn.commit()
    conn.close()

# Pydantic Model para validação de entrada de dados
class Residuo(BaseModel):
    data: str
    tipo_residuo: str
    peso: float

# Caminho absoluto para o arquivo CSV
csv_file_path = r'C:\Users\Klayveer Nascimento\Downloads\API\backend\data.csv'

# Rota para importar dados do CSV para o banco de dados
@app.post("/import")
async def import_data():
    try:
        # Carrega o CSV e limpa os dados
        data_df = pd.read_csv(csv_file_path, delimiter=',', quotechar='"', encoding='ISO-8859-1')
        data_df.columns = data_df.columns.str.replace('"', '', regex=False).str.strip()
        
        # Conecta ao banco de dados
        conn = get_db_connection()
        
        # Insere os dados no banco de dados
        for _, row in data_df.iterrows():
            conn.execute('INSERT INTO residuos (data, tipo_residuo, peso) VALUES (?, ?, ?)', 
                         (row['Data'], row['Tipo Resíduo'], row['Peso'].replace(',', '.')))
        
        conn.commit()
        conn.close()
        
        return {"message": "Dados importados com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao importar dados: {e}")

# Rota para obter todos os dados (GET)
@app.get("/data", response_model=List[Residuo])
async def get_data():
    try:
        conn = get_db_connection()
        cursor = conn.execute('SELECT * FROM residuos')
        data = cursor.fetchall()
        conn.close()
        
        if not data:
            raise HTTPException(status_code=404, detail="Nenhum dado encontrado")
        
        return [dict(row) for row in data]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao processar os dados: {e}")

# Rota para obter os dados por data (GET)
@app.get("/data/{date}", response_model=List[Residuo])
async def get_data_by_date(date: str):
    try:
        conn = get_db_connection()
        cursor = conn.execute('SELECT * FROM residuos WHERE data = ?', (date,))
        data = cursor.fetchall()
        conn.close()
        
        if not data:
            raise HTTPException(status_code=404, detail="Nenhum dado encontrado para essa data")
        
        return [dict(row) for row in data]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao processar os dados: {e}")

# Rota para atualizar dados (PUT)
@app.put("/data/{id}")
async def update_data(id: int, new_data: Residuo):
    try:
        conn = get_db_connection()
        conn.execute('UPDATE residuos SET data = ?, tipo_residuo = ?, peso = ? WHERE id = ?',
                     (new_data.data, new_data.tipo_residuo, new_data.peso, id))
        conn.commit()
        conn.close()
        
        return {"message": "Dados atualizados com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar os dados: {e}")

# Rota para excluir dados (DELETE)
@app.delete("/data/{id}")
async def delete_data(id: int):
    try:
        conn = get_db_connection()
        conn.execute('DELETE FROM residuos WHERE id = ?', (id,))
        conn.commit()
        conn.close()
        
        return {"message": "Dados excluídos com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao excluir os dados: {e}")

if __name__ == "__main__":
    create_table()  # Cria a tabela no banco de dados
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

