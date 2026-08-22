const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// Configurações
app.use(cors());
app.use(express.json());

// Banco de dados
const dbPath = path.join(__dirname, "banco.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco:", err.message);
    } else {
        console.log("Banco conectado com sucesso!");
    }
});

// Criar tabela
db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        idade INTEGER
    )
`, (err) => {

    if (err) {
        console.error("Erro ao criar tabela:", err.message);
    } else {
        console.log("Tabela usuarios pronta!");
    }

});

// Página inicial
app.get("/", (req, res) => {
    res.json({
        mensagem: "API funcionando!"
    });
});

// Listar usuários
app.get("/usuarios", (req, res) => {

    db.all(
        "SELECT * FROM usuarios ORDER BY id DESC",
        [],
        (err, usuarios) => {

            if (err) {
                return res.status(500).json({
                    erro: err.message
                });
            }

            res.json(usuarios);
        }
    );

});

// Cadastrar usuário
app.post("/usuarios", (req, res) => {

    const { nome, email, idade } = req.body;

    if (!nome || !email) {
        return res.status(400).json({
            erro: "Nome e email são obrigatórios."
        });
    }

    db.run(
        `INSERT INTO usuarios (nome, email, idade)
         VALUES (?, ?, ?)`,
        [nome, email, idade || null],
        function (err) {

            if (err) {

                if (err.message.includes("UNIQUE")) {
                    return res.status(400).json({
                        erro: "Este email já está cadastrado."
                    });
                }

                return res.status(500).json({
                    erro: err.message
                });
            }

            res.status(201).json({
                mensagem: "Usuário cadastrado!",
                id: this.lastID
            });
        }
    );

});

// Editar usuário
app.put("/usuarios/:id", (req, res) => {

    const id = req.params.id;
    const { nome, email, idade } = req.body;

    db.run(
        `UPDATE usuarios
         SET nome = ?, email = ?, idade = ?
         WHERE id = ?`,
        [nome, email, idade || null, id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    erro: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    erro: "Usuário não encontrado."
                });
            }

            res.json({
                mensagem: "Usuário atualizado!"
            });
        }
    );

});

// Excluir usuário
app.delete("/usuarios/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM usuarios WHERE id = ?",
        [id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    erro: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    erro: "Usuário não encontrado."
                });
            }

            res.json({
                mensagem: "Usuário excluído!"
            });
        }
    );

});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
