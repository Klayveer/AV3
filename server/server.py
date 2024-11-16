import os
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    graph_dir = os.path.join(os.getcwd(), 'server', 'static', 'Graphs')

    # Verifica se o diretório existe antes de tentar listar os arquivos
    if os.path.exists(graph_dir):
        files = [f for f in os.listdir(graph_dir) if f.endswith('.png')]
    else:
        files = []  # Caso o diretório não exista, retorna uma lista vazia

    return render_template('index.html', files=files)

if __name__ == '__main__':
    app.run(debug=True)
