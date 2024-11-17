# codigo antigo

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import sqlite3

# Configuração do app FastAPI
app = FastAPI()

# Caminho absoluto para o banco de dados
DATABASE = 'data.db'

# Função para conexão ao banco de dados
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Permite acessar colunas por nome
    return conn

# Função para listar tabelas no banco de dados
def listar_tabelas():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tabelas = [tabela["name"] for tabela in cursor.fetchall()]
    conn.close()
    return tabelas

# Modelo Pydantic para validação
class Residuo(BaseModel):
    data: str
    tipo_residuo: str
    peso: int

# Endpoint para listar tabelas disponíveis no banco (para debug)
@app.get("/tabelas/")
def get_tabelas():
    return {"tabelas": listar_tabelas()}

# Endpoint para listar todos os resíduos
@app.get("/residuos/", response_model=List[Residuo])
def get_residuos():
    conn = get_db_connection()
    residuos = conn.execute("SELECT * FROM residuos").fetchall()
    conn.close()
    return [
        {"data": residuo["Data"], "tipo_residuo": residuo["Tipo Residuo"], "peso": residuo["Peso"]}
        for residuo in residuos
    ]

# Endpoint para buscar resíduos por data
@app.get("/residuos/{data}", response_model=List[Residuo])
def get_residuos_by_date(data: str):
    conn = get_db_connection()
    residuos = conn.execute("SELECT * FROM residuos WHERE Data = ?", (data,)).fetchall()
    conn.close()
    return [
        {"data": residuo["Data"], "tipo_residuo": residuo["Tipo Residuo"], "peso": residuo["Peso"]}
        for residuo in residuos
    ]

# Endpoint para adicionar um novo resíduo
@app.post("/residuos/", response_model=Residuo)
def create_residuo(residuo: Residuo):
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO residuos (Data, Tipo Residuo, Peso) VALUES (?, ?, ?)",
        (residuo.data, residuo.tipo_residuo, residuo.peso),
    )
    conn.commit()
    conn.close()
    return residuo

# Endpoint para atualizar um resíduo
@app.put("/residuos/", response_model=Residuo)
def update_residuo(residuo: Residuo):
    conn = get_db_connection()
    cursor = conn.execute(
        """
        UPDATE residuos
        SET Peso = ?
        WHERE Data = ? AND [Tipo Residuo] = ?
        """,
        (residuo.peso, residuo.data, residuo.tipo_residuo),
    )
    conn.commit()
    conn.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Resíduo não encontrado")
    return residuo

# Endpoint para excluir um resíduo
@app.delete("/residuos/")
def delete_residuo(data: str, tipo_residuo: str, peso: int):
    conn = get_db_connection()
    cursor = conn.execute(
        """
        DELETE FROM residuos
        WHERE Data = ? AND [Tipo Residuo] = ? AND Peso = ?
        """,
        (data, tipo_residuo, peso),
    )
    conn.commit()
    conn.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Resíduo não encontrado")
    return {"message": "Resíduo excluído com sucesso"}
