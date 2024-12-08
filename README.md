# RECICLA.ME

Este é um projeto que envolve o uso de uma API pública sobre dados de reciclagem, com um backend desenvolvido utilizando o FastAPI para realizar operações CRUD em um arquivo JSON. O frontend foi desenvolvido em HTML, CSS e JavaScript e oferece uma interface interativa para visualização de métricas de reciclagem.

## Índice

- [Descrição do Projeto](#descrição-do-projeto)
- [Funcionalidades do Frontend](#funcionalidades-do-frontend)
- [Funcionalidades do Backend](#funcionalidades-do-backend)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Como Executar o Projeto](#como-executar-o-projeto)
- [Estrutura do Backend](#estrutura-do-backend)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## Descrição do Projeto

Este sistema rastreia dados de reciclagem dos últimos 10 anos e inclui um dashboard para visualizar as seguintes métricas:

- **Peso total reciclado**
- **Material mais reciclado**
- **Tendências de reciclagem mensais**

### Funcionalidades do Frontend

- **Charts interativos**: gráficos para visualizar as métricas de reciclagem ao longo do tempo.
- **Tabelas**: exibição das informações em formato tabular.
- **Modais**: para exibir detalhes adicionais ou informações contextuais, com funcionalidade de fechamento ao clicar fora deles.

### Funcionalidades do Backend

- **Operações CRUD**: realiza operações de Create, Read, Update e Delete em um arquivo JSON que armazena os dados de reciclagem.
- **API**: oferece endpoints RESTful para fornecer os dados de reciclagem.

## Tecnologias Utilizadas

- **Frontend**:
  - HTML
  - CSS
  - JavaScript (para gráficos e interatividade)
  - Live Server (para desenvolvimento local)

- **Backend**:
  - FastAPI
  - Uvicorn (servidor ASGI)

## Como Executar o Projeto

### Backend (FastAPI)

1. Clone o repositório:
   ```bash
   git clone https://github.com/Klayveer/RECICLA.ME.git
   ```

2. Instale as dependências do backend:
    ```bash
    pip install -r requirements.txt
    ``` 

3. Inicie o servidor Uvicorn:

    ```bash
    uvicorn backend.app.app:app --reload
    ``` 

O backend estará disponível em `http://127.0.0.1:8000/docs#/`.

### Frontend (HTML, CSS, JavaScript)

1. Navegue até a pasta do frontend.

2. Utilize o Live Server para uma experiência de desenvolvimento mais fluida.

## Estrutura do Backend

- **GET /residuos/**  
  Retorna os 100 primeiros resíduos.  
  _Resposta: Lista de resíduos com data, tipo e peso._

- **GET /residuos/{date}**  
  Retorna resíduos de uma data específica.  
  _Parâmetro: `date` no formato `YYYY-MM-DD`._  
  _Resposta: Lista de resíduos para a data fornecida._

- **GET /residuos/mes/{ano_mes}**  
  Retorna resíduos filtrados por mês e ano.  
  _Parâmetro: `ano_mes` no formato `YYYY-MM`._  
  _Resposta: Lista de resíduos para o mês e ano fornecido._

- **GET /residuos/tipo/{residue_type}**  
  Retorna resíduos filtrados por tipo (por exemplo, papel, metal).  
  _Parâmetro: `residue_type` é o tipo de resíduo._  
  _Resposta: Lista de resíduos do tipo especificado._

- **POST /residuos/**  
  Adiciona um novo resíduo à lista.  
  _Corpo da requisição: `{ "date": "YYYY-MM-DD", "residue_type": "tipo", "weight": "peso" }`_  
  _Resposta: Resíduo adicionado._

- **PUT /residuos/**  
  Atualiza o peso de um resíduo existente.  
  _Corpo da requisição: `{ "date": "YYYY-MM-DD", "residue_type": "tipo", "weight": "peso" }`_  
  _Resposta: Resíduo atualizado._

- **DELETE /residuos/**  
  Exclui um resíduo específico baseado na data, tipo e peso.  
  _Parâmetros: `date`, `residue_type`, `weight`._  
  _Resposta: Mensagem de sucesso ou erro._

## Estrutura do Projeto
        
    .
    ├── backend/
    │   ├── app/
    │   │   ├── app.py
    │   │   └── data.json
    │   └── math/
    │       ├── csv/
    │       └── app.py
    ├── frontend/
    │   ├── csv/
    │   ├── dados.html
    │   ├── index.html
    │   ├── script-dados.js
    │   ├── sobre.html
    │   ├── styles-dados.css
    │   ├── styles-sobre.css
    │   └── styles.css
    └── arquivos/
        ├── csv/
        └── app.py

## Contribuindo

1. Faça um fork deste repositório.

2. Crie uma nova branch `git checkout -b feature/nome-da-feature`.

3. Faça suas alterações e envie uma pull request.

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
