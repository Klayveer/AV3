import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os

# Configuração do app FastAPI
app = FastAPI()

# Caminho para o arquivo JSON (atualize para o caminho absoluto correto)
JSON_FILE_PATH = r"C:\Users\Klayveer Nascimento\Downloads\api\backend\app\data.json"

# Função para carregar os dados do JSON
def load_json_data():
    if not os.path.exists(JSON_FILE_PATH):
        raise FileNotFoundError(f"Arquivo JSON não encontrado: {JSON_FILE_PATH}")
    with open(JSON_FILE_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

# Função para salvar os dados no JSON
def save_json_data(data):
    with open(JSON_FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)

# Modelo Pydantic para validação
class Residuo(BaseModel):
    date: str
    residue_type: str
    weight: str

# Endpoint para listar os 10 primeiros resíduos
@app.get("/residuos/", response_model=List[Residuo])
def get_residuos():
    data = load_json_data()
    return [
        {"date": item["date"], "residue_type": item["Residue Type"], "weight": item["weight"]}
        for item in data[:10]
    ]

# Endpoint para buscar resíduos por data
@app.get("/residuos/{date}", response_model=List[Residuo])
def get_residuos_by_date(date: str):
    data = load_json_data()
    filtered = [
        {"date": item["date"], "residue_type": item["Residue Type"], "weight": item["weight"]}
        for item in data if item["date"] == date
    ]
    if not filtered:
        raise HTTPException(status_code=404, detail="Nenhum resíduo encontrado para esta data")
    return filtered

# Endpoint para adicionar um novo resíduo
@app.post("/residuos/", response_model=Residuo)
def create_residuo(residuo: Residuo):
    data = load_json_data()
    new_residuo = {
        "date": residuo.date,
        "Residue Type": residuo.residue_type,
        "weight": residuo.weight
    }
    data.insert(0, new_residuo)  # Adiciona o novo resíduo no início da lista
    save_json_data(data)
    return residuo

# Endpoint para atualizar um resíduo
@app.put("/residuos/", response_model=Residuo)
def update_residuo(residuo: Residuo):
    data = load_json_data()
    for item in data:
        if item["date"] == residuo.date and item["Residue Type"] == residuo.residue_type:
            item["weight"] = residuo.weight
            save_json_data(data)
            return residuo
    raise HTTPException(status_code=404, detail="Resíduo não encontrado")

# Endpoint para excluir um resíduo
@app.delete("/residuos/")
def delete_residuo(date: str, residue_type: str, weight: str):
    data = load_json_data()
    updated_data = [
        item for item in data
        if not (item["date"] == date and item["Residue Type"] == residue_type and item["weight"] == weight)
    ]
    if len(updated_data) == len(data):
        raise HTTPException(status_code=404, detail="Resíduo não encontrado")
    save_json_data(updated_data)
    return {"message": "Resíduo excluído com sucesso"}
