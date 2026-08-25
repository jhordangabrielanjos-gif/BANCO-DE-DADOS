const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 3000;

// ========================================
// CONFIGURAÇÕES
// ========================================

app.use(cors());

app.use(express.json());

// ========================================
// BANCO POSTGRESQL
// ========================================

if (!process.env.DATABASE_URL) {
    console.error("ERRO: DATABASE_URL não foi configurada.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// ========================================
// TESTAR CONEXÃO
// ========================================

pool.connect()
    .then((client) => {

        console.log("PostgreSQL conectado com sucesso!");

        client.release();

    })
    .catch((err) => {

        console.error(
            "Erro ao conectar ao PostgreSQL:",
            err.message
        );

    });

// ========================================
// CRIAR TABELA DO BABA
// ========================================

async function criarTabela() {

    try {

        await pool.query(`
            CREATE TABLE IF NOT EXISTS baba_usuarios (

                id SERIAL PRIMARY KEY,

                nome TEXT NOT NULL,

                valor REAL NOT NULL,

                hrdobaba TEXT NOT NULL

            )
        `);

        console.log("Tabela baba_usuarios pronta!");

    } catch (err) {

        console.error(
            "Erro ao criar tabela do BABA:",
            err.message
        );

    }

}

criarTabela();

// ========================================
// INÍCIO
// ========================================

app.get("/", (req, res) => {

    res.json({
        mensagem: "API BABA DOS GURI funcionando!"
    });

});

// ========================================
// LISTAR
// ========================================

app.get("/usuarios", async (req, res) => {

    try {

        const resultado = await pool.query(`
            SELECT
                id,
                nome,
                valor AS "VALOR",
                hrdobaba AS "HRDOBABA"

            FROM baba_usuarios

            ORDER BY id DESC
        `);

        res.json(resultado.rows);

    } catch (err) {

        console.error(
            "Erro ao listar:",
            err.message
        );

        res.status(500).json({
            erro: err.message
        });

    }

});

// ========================================
// CADASTRAR
// ========================================

app.post("/usuarios", async (req, res) => {

    const {
        nome,
        VALOR,
        HRDOBABA
    } = req.body;

    if (
        !nome ||
        VALOR === undefined ||
        VALOR === null ||
        !HRDOBABA
    ) {

        return res.status(400).json({

            erro:
                "Nome, VALOR e HR DO BABA são obrigatórios."

        });

    }

    try {

        const resultado = await pool.query(
            `
            INSERT INTO baba_usuarios
            (
                nome,
                valor,
                hrdobaba
            )

            VALUES ($1, $2, $3)

            RETURNING id
            `,
            [
                nome,
                Number(VALOR),
                HRDOBABA
            ]
        );

        res.status(201).json({

            mensagem:
                "Usuário cadastrado!",

            id:
                resultado.rows[0].id

        });

    } catch (err) {

        console.error(
            "Erro ao cadastrar:",
            err.message
        );

        res.status(500).json({
            erro: err.message
        });

    }

});

// ========================================
// EDITAR
// ========================================

app.put("/usuarios/:id", async (req, res) => {

    const id = req.params.id;

    const {
        nome,
        VALOR,
        HRDOBABA
    } = req.body;

    if (
        !nome ||
        VALOR === undefined ||
        VALOR === null ||
        !HRDOBABA
    ) {

        return res.status(400).json({

            erro:
                "Nome, VALOR e HR DO BABA são obrigatórios."

        });

    }

    try {

        const resultado = await pool.query(
            `
            UPDATE baba_usuarios

            SET
                nome = $1,
                valor = $2,
                hrdobaba = $3

            WHERE id = $4

            RETURNING id
            `,
            [
                nome,
                Number(VALOR),
                HRDOBABA,
                id
            ]
        );

        if (resultado.rowCount === 0) {

            return res.status(404).json({

                erro:
                    "Usuário não encontrado."

            });

        }

        res.json({

            mensagem:
                "Usuário atualizado!"

        });

    } catch (err) {

        console.error(
            "Erro ao editar:",
            err.message
        );

        res.status(500).json({
            erro: err.message
        });

    }

});

// ========================================
// EXCLUIR
// ========================================

app.delete("/usuarios/:id", async (req, res) => {

    const id = req.params.id;

    try {

        const resultado = await pool.query(
            `
            DELETE FROM baba_usuarios

            WHERE id = $1

            RETURNING id
            `,
            [id]
        );

        if (resultado.rowCount === 0) {

            return res.status(404).json({

                erro:
                    "Usuário não encontrado."

            });

        }

        res.json({

            mensagem:
                "Usuário excluído!"

        });

    } catch (err) {

        console.error(
            "Erro ao excluir:",
            err.message
        );

        res.status(500).json({
            erro: err.message
        });

    }

});

// ========================================
// SERVIDOR
// ========================================

app.listen(
    PORT,
    () => {

        console.log(
            `Servidor rodando na porta ${PORT}`
        );

    }
);
