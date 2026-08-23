const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// CONFIGURAÇÕES
// ==============================
app.use(cors());
app.use(express.json());


// ==============================
// BANCO DE DADOS
// ==============================
const dbPath = path.join(__dirname, "banco.db");

const db = new sqlite3.Database(dbPath, (err) => {

    if (err) {
        console.error("Erro ao conectar ao banco:", err.message);
    } else {
        console.log("Banco conectado com sucesso!");
    }

});


// ==============================
// CRIAR / ATUALIZAR TABELA
// ==============================
db.serialize(() => {

    db.all(
        "PRAGMA table_info(usuarios)",
        [],
        (err, colunas) => {

            if (err) {
                console.error("Erro ao verificar tabela:", err.message);
                return;
            }


            // Se a tabela não existir
            if (colunas.length === 0) {

                db.run(`
                    CREATE TABLE usuarios (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nome TEXT NOT NULL,
                        VALOR REAL NOT NULL,
                        HRDOBABA TEXT NOT NULL
                    )
                `, (err) => {

                    if (err) {
                        console.error(
                            "Erro ao criar tabela:",
                            err.message
                        );
                    } else {
                        console.log(
                            "Tabela usuarios criada!"
                        );
                    }

                });

                return;
            }


            console.log("Tabela usuarios já existe.");

        }
    );

});


// ==============================
// PÁGINA INICIAL
// ==============================
app.get("/", (req, res) => {

    res.json({
        mensagem: "API funcionando!"
    });

});


// ==============================
// LISTAR USUÁRIOS
// ==============================
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


// ==============================
// CADASTRAR USUÁRIO
// ==============================
app.post("/usuarios", (req, res) => {

    const {
        nome,
        VALOR,
        HRDOBABA
    } = req.body;


    if (!nome || VALOR === undefined || !HRDOBABA) {

        return res.status(400).json({
            erro: "Nome, VALOR e HR DO BABA são obrigatórios."
        });

    }


    db.run(
        `
        INSERT INTO usuarios
        (nome, VALOR, HRDOBABA)
        VALUES (?, ?, ?)
        `,
        [
            nome,
            Number(VALOR),
            HRDOBABA
        ],
        function (err) {

            if (err) {

                console.error(err.message);

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


// ==============================
// EDITAR USUÁRIO
// ==============================
app.put("/usuarios/:id", (req, res) => {

    const id = req.params.id;

    const {
        nome,
        VALOR,
        HRDOBABA
    } = req.body;


    if (!nome || VALOR === undefined || !HRDOBABA) {

        return res.status(400).json({
            erro: "Nome, VALOR e HR DO BABA são obrigatórios."
        });

    }


    db.run(
        `
        UPDATE usuarios
        SET
            nome = ?,
            VALOR = ?,
            HRDOBABA = ?
        WHERE id = ?
        `,
        [
            nome,
            Number(VALOR),
            HRDOBABA,
            id
        ],
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


// ==============================
// EXCLUIR USUÁRIO
// ==============================
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


// ==============================
// INICIAR SERVIDOR
// ==============================
app.listen(PORT, () => {

    console.log(
        `Servidor rodando na porta ${PORT}`
    );

});
