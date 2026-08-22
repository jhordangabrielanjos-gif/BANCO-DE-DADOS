const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./banco.db", (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco:", err.message);
    } else {
        console.log("Banco SQLite conectado!");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        idade INTEGER NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error("Erro ao criar tabela:", err.message);
    } else {
        console.log("Tabela usuarios pronta!");
    }
});

module.exports = db;
