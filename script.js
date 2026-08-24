const API_URL = "https://banco-de-dados-2-0atp.onrender.com";

let usuarioEditando = null;
let usuariosCarregados = [];


// ========================================
// CARREGAR USUÁRIOS
// ========================================

async function carregarUsuarios() {

    const lista = document.getElementById("listaUsuarios");

    if (!lista) {
        console.error("Elemento #listaUsuarios não encontrado.");
        return;
    }

    try {

        console.log("Conectando à API...");

        const resposta = await fetch(`${API_URL}/usuarios`);

        console.log("Status da API:", resposta.status);

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        const usuarios = await resposta.json();

        console.log("Usuários recebidos:", usuarios);

        usuariosCarregados = usuarios;

        lista.innerHTML = "";

        if (!Array.isArray(usuarios) || usuarios.length === 0) {

            lista.innerHTML = `
                <tr>
                    <td colspan="5">
                        Nenhum usuário cadastrado.
                    </td>
                </tr>
            `;

            return;
        }


        usuarios.forEach(usuario => {

            const linha = document.createElement("tr");


            // ID
            const tdId = document.createElement("td");
            tdId.textContent = usuario.id;
            linha.appendChild(tdId);


            // NOME
            const tdNome = document.createElement("td");
            tdNome.textContent = usuario.nome;
            linha.appendChild(tdNome);


            // VALOR
            const tdValor = document.createElement("td");

            const valorNumerico = Number(usuario.VALOR);

            tdValor.textContent =
                "R$ " +
                (Number.isNaN(valorNumerico)
                    ? "0.00"
                    : valorNumerico.toFixed(2));

            linha.appendChild(tdValor);


            // HORÁRIO
            const tdHora = document.createElement("td");
            tdHora.textContent = usuario.HRDOBABA || "";
            linha.appendChild(tdHora);


            // BOTÕES
            const tdBotoes = document.createElement("td");


            // BOTÃO EDITAR
            const botaoEditar =
                document.createElement("button");

            botaoEditar.type = "button";
            botaoEditar.textContent = "Editar";

            botaoEditar.addEventListener(
                "click",
                function () {

                    editarUsuario(usuario.id);

                }
            );


            // BOTÃO EXCLUIR
            const botaoExcluir =
                document.createElement("button");

            botaoExcluir.type = "button";
            botaoExcluir.textContent = "Excluir";

            botaoExcluir.addEventListener(
                "click",
                function () {

                    excluirUsuario(usuario.id);

                }
            );


            tdBotoes.appendChild(botaoEditar);

            tdBotoes.appendChild(
                document.createTextNode(" ")
            );

            tdBotoes.appendChild(botaoExcluir);


            linha.appendChild(tdBotoes);

            lista.appendChild(linha);

        });


    } catch (erro) {

        console.error("ERRO NA API:", erro);

        lista.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="color:red;"
                >
                    Erro ao conectar com a API.
                </td>
            </tr>
        `;

    }

}


// ========================================
// CADASTRAR / EDITAR
// ========================================

const formUsuario =
    document.getElementById("formUsuario");


if (formUsuario) {

    formUsuario.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const nome =
                document
                    .getElementById("nome")
                    .value
                    .trim();


            const valor =
                document
                    .getElementById("VALOR")
                    .value
                    .trim();


            const horaBaba =
                document
                    .getElementById("HRDOBABA")
                    .value
                    .trim();


            if (!nome) {

                alert("Digite o nome.");

                return;

            }


            if (!valor) {

                alert("Digite o valor.");

                return;

            }


            if (!horaBaba) {

                alert("Digite o horário do baba.");

                return;

            }


            const dados = {

                nome: nome,

                VALOR: Number(valor),

                HRDOBABA: horaBaba

            };


            console.log("Enviando:", dados);


            try {

                let resposta;


                // ====================================
                // CADASTRAR
                // ====================================

                if (usuarioEditando === null) {

                    resposta = await fetch(
                        `${API_URL}/usuarios`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(dados)
                        }
                    );

                }


                // ====================================
                // EDITAR
                // ====================================

                else {

                    console.log(
                        "Editando usuário ID:",
                        usuarioEditando
                    );


                    resposta = await fetch(
                        `${API_URL}/usuarios/${usuarioEditando}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(dados)
                        }
                    );

                }


                const resultado =
                    await resposta.json();


                console.log(
                    "Resposta da API:",
                    resultado
                );


                if (!resposta.ok) {

                    alert(
                        resultado.erro ||
                        "Erro ao salvar usuário."
                    );

                    return;

                }


                if (usuarioEditando === null) {

                    alert(
                        "Usuário cadastrado com sucesso!"
                    );

                } else {

                    alert(
                        "Usuário atualizado com sucesso!"
                    );

                }


                cancelarEdicao();

                await carregarUsuarios();


            } catch (erro) {

                console.error(
                    "Erro ao salvar:",
                    erro
                );

                alert(
                    "Erro ao conectar com a API."
                );

            }

        }
    );

}


// ========================================
// EDITAR
// ========================================

function editarUsuario(id) {

    console.log(
        "Clicou em editar. ID:",
        id
    );


    // Procura o usuário que foi clicado
    const usuario =
        usuariosCarregados.find(
            function (item) {

                return Number(item.id) === Number(id);

            }
        );


    if (!usuario) {

        console.error(
            "Usuário não encontrado:",
            id
        );

        alert(
            "Não foi possível encontrar esse usuário."
        );

        return;

    }


    console.log(
        "Usuário selecionado:",
        usuario
    );


    usuarioEditando = usuario.id;


    // ====================================
    // PREENCHER NOME
    // ====================================

    const campoNome =
        document.getElementById("nome");

    if (campoNome) {

        campoNome.value =
            usuario.nome || "";

    }


    // ====================================
    // PREENCHER VALOR
    // ====================================

    const campoValor =
        document.getElementById("VALOR");

    if (campoValor) {

        campoValor.value =
            usuario.VALOR ?? "";

    }


    // ====================================
    // PREENCHER HORÁRIO
    // ====================================

    const campoHora =
        document.getElementById("HRDOBABA");

    if (campoHora) {

        campoHora.value =
            usuario.HRDOBABA || "";

    }


    // ====================================
    // ALTERAR TÍTULO
    // ====================================

    const titulo =
        document.getElementById("titulo-form");

    if (titulo) {

        titulo.textContent =
            "EDITAR QUEM VAI?";

    }


    // ====================================
    // ALTERAR BOTÃO SALVAR
    // ====================================

    const btnSalvar =
        document.getElementById("btnSalvar");

    if (btnSalvar) {

        btnSalvar.textContent =
            "Salvar alterações";

    }


    // ====================================
    // MOSTRAR CANCELAR
    // ====================================

    const btnCancelar =
        document.getElementById("btnCancelar");

    if (btnCancelar) {

        btnCancelar.style.display =
            "inline-block";

    }


    // Coloca o usuário no início da tela
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ========================================
// CANCELAR EDIÇÃO
// ========================================

function cancelarEdicao() {

    usuarioEditando = null;


    const form =
        document.getElementById("formUsuario");

    if (form) {

        form.reset();

    }


    const titulo =
        document.getElementById("titulo-form");

    if (titulo) {

        titulo.textContent =
            "QUEM VAI?";

    }


    const btnSalvar =
        document.getElementById("btnSalvar");

    if (btnSalvar) {

        btnSalvar.textContent =
            "Cadastrar";

    }


    const btnCancelar =
        document.getElementById("btnCancelar");

    if (btnCancelar) {

        btnCancelar.style.display =
            "none";

    }

}


// ========================================
// EXCLUIR
// ========================================

async function excluirUsuario(id) {

    if (
        !confirm(
            "Tem certeza que deseja excluir este usuário?"
        )
    ) {

        return;

    }


    try {

        console.log(
            "Excluindo usuário:",
            id
        );


        const resposta =
            await fetch(
                `${API_URL}/usuarios/${id}`,
                {
                    method: "DELETE"
                }
            );


        const resultado =
            await resposta.json();


        console.log(
            "Resposta da exclusão:",
            resultado
        );


        if (!resposta.ok) {

            alert(
                resultado.erro ||
                "Erro ao excluir usuário."
            );

            return;

        }


        alert(
            "Usuário excluído com sucesso!"
        );


        await carregarUsuarios();


    } catch (erro) {

        console.error(
            "Erro ao excluir:",
            erro
        );

        alert(
            "Erro ao conectar com a API."
        );

    }

}


// ========================================
// INICIAR SISTEMA
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        carregarUsuarios();

    }
);
