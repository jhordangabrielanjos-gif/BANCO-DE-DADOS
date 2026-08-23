const API_URL = "https://banco-de-dados-3-xvqf.onrender.com";

let usuarioEditando = null;

// CARREGAR USUÁRIOS
async function carregarUsuarios() {
    const lista = document.getElementById("listaUsuarios");

    try {
        const resposta = await fetch(`${API_URL}/usuarios`);

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        const usuarios = await resposta.json();

        lista.innerHTML = "";

        if (usuarios.length === 0) {
            lista.innerHTML = "<p>Nenhum usuário cadastrado.</p>";
            return;
        }

        usuarios.forEach(usuario => {
            const div = document.createElement("div");

            div.innerHTML = `
                <p>
                    <strong>ID:</strong> ${usuario.id}<br>
                    <strong>Nome:</strong> ${usuario.nome}<br>
                    <strong>Email:</strong> ${usuario.email}<br>
                    <strong>Idade:</strong> ${usuario.idade ?? "-"}
                </p>

                <button onclick="editarUsuario(${usuario.id}, '${usuario.nome}', '${usuario.email}', '${usuario.idade ?? ""}')">
                    Editar
                </button>

                <button onclick="excluirUsuario(${usuario.id})">
                    Excluir
                </button>

                <hr>
            `;

            lista.appendChild(div);
        });

    } catch (erro) {
        console.error(erro);

        lista.innerHTML = `
            <p style="color:red;">
                Erro ao conectar com a API.<br>
                Verifique se o servidor está online no render
            </p>
        `;
    }
}


// CADASTRAR OU EDITAR
document.getElementById("formUsuario").addEventListener("submit", async function(event) {

    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const idade = document.getElementById("idade").value;

    if (!nome || !email) {
        alert("Preencha nome e email.");
        return;
    }

    const dados = {
        nome: nome,
        email: email,
        idade: idade ? Number(idade) : null
    };

    try {

        let resposta;

        if (usuarioEditando === null) {

            resposta = await fetch(`${API_URL}/usuarios`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });

        } else {

            resposta = await fetch(`${API_URL}/usuarios/${usuarioEditando}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });
        }

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.erro || "Erro ao salvar usuário.");
            return;
        }

        alert(
            usuarioEditando === null
                ? "Usuário cadastrado com sucesso!"
                : "Usuário atualizado com sucesso!"
        );

        cancelarEdicao();

        carregarUsuarios();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao conectar com a API.");
    }
});


// EDITAR
function editarUsuario(id, nome, email, idade) {

    usuarioEditando = id;

    document.getElementById("nome").value = nome;
    document.getElementById("email").value = email;
    document.getElementById("idade").value = idade;

    document.getElementById("titulo-form").textContent = "Editar usuário";
    document.getElementById("btnSalvar").textContent = "Salvar alterações";
    document.getElementById("btnCancelar").style.display = "inline-block";
}


// CANCELAR
function cancelarEdicao() {

    usuarioEditando = null;

    document.getElementById("formUsuario").reset();

    document.getElementById("titulo-form").textContent = "Cadastrar usuário";
    document.getElementById("btnSalvar").textContent = "Cadastrar";
    document.getElementById("btnCancelar").style.display = "none";
}


// EXCLUIR
async function excluirUsuario(id) {

    if (!confirm("Tem certeza que deseja excluir este usuário?")) {
        return;
    }

    try {

        const resposta = await fetch(`${API_URL}/usuarios/${id}`, {
            method: "DELETE"
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.erro || "Erro ao excluir usuário.");
            return;
        }

        alert("Usuário excluído com sucesso!");

        carregarUsuarios();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao conectar com a API.");
    }
}


// INICIAR
carregarUsuarios();
