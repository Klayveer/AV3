import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JSON_FILE_PATH = os.path.join(os.path.dirname(__file__), 'data.json')

def load_json_data():
    if not os.path.exists(JSON_FILE_PATH):
        raise FileNotFoundError(f"Arquivo JSON não encontrado: {JSON_FILE_PATH}")
    with open(JSON_FILE_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json_data(data):
    with open(JSON_FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)

class Residuo(BaseModel):
    date: str
    residue_type: str
    weight: str

@app.get("/residuos/", response_model=List[Residuo])
def get_residuos():
    data = load_json_data()
    return [
        {"date": item["date"], "residue_type": item["residue_type"], "weight": item["weight"]}
        for item in data[:1000]
    ]

@app.get("/residuos/{date}", response_model=List[Residuo])
def get_residuos_by_date(date: str):
    data = load_json_data()
    filtered = [
        {"date": item["date"], "residue_type": item["residue_type"], "weight": item["weight"]}
        for item in data if item["date"] == date
    ]
    if not filtered:
        raise HTTPException(status_code=404, detail="Nenhum resíduo encontrado para esta data")
    return filtered

@app.get("/residuos/mes/{ano_mes}", response_model=List[Residuo])
def get_residuos_by_month(ano_mes: str):
    try:
        datetime.strptime(ano_mes, "%Y-%m")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido. Use 'YYYY-MM'.")

    data = load_json_data()
    filtered = [
        {
            "date": item["date"],
            "residue_type": item["residue_type"],
            "weight": item["weight"]
        }
        for item in data
        if item["date"].startswith(ano_mes)
    ]
    
    if not filtered:
        raise HTTPException(status_code=404, detail="Nenhum resíduo encontrado para este mês")

    return filtered

@app.get("/residuos/tipo/{residue_type}", response_model=List[Residuo])
def get_residuos_by_type(residue_type: str):
    data = load_json_data()
    filtered = [
        {
            "date": item["date"],
            "residue_type": item["residue_type"],
            "weight": item["weight"]
        }
        for item in data
        if item["residue_type"].lower() == residue_type.lower()
    ]
    
    if not filtered:
        raise HTTPException(status_code=404, detail="Nenhum resíduo encontrado para este tipo")

    return filtered

@app.post("/residuos/", response_model=Residuo)
def create_residuo(residuo: Residuo):
    data = load_json_data()
    new_residuo = {
        "date": residuo.date,
        "residue_type": residuo.residue_type,
        "weight": residuo.weight
    }
    data.insert(0, new_residuo)
    save_json_data(data)
    return residuo

@app.put("/residuos/", response_model=Residuo)
def update_residuo(residuo: Residuo):
    data = load_json_data()
    for item in data:
        if item["date"] == residuo.date and item["residue_type"] == residuo.residue_type:
            item["weight"] = residuo.weight
            save_json_data(data)
            return residuo
    raise HTTPException(status_code=404, detail="Resíduo não encontrado")

@app.delete("/residuos/")
def delete_residuo(date: str, residue_type: str, weight: str):
    data = load_json_data()
    updated_data = [
        item for item in data
        if not (item["date"] == date and item["residue_type"] == residue_type and item["weight"] == weight)
    ]
    if len(updated_data) == len(data):
        raise HTTPException(status_code=404, detail="Resíduo não encontrado")
    save_json_data(updated_data)
    return {"message": "Resíduo excluído com sucesso"}
