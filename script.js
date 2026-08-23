const API_URL = "https://banco-de-dados-2-0atp.onrender.com";

let usuarioEditando = null;


// ========================================
// CARREGAR USUÁRIOS
// ========================================

async function carregarUsuarios() {

    const lista = document.getElementById("listaUsuarios");

    try {

        console.log("Conectando à API...");

        const resposta = await fetch(
            `${API_URL}/usuarios`
        );

        console.log(
            "Status da API:",
            resposta.status
        );

        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }

        const usuarios = await resposta.json();

        console.log(
            "Usuários:",
            usuarios
        );

        lista.innerHTML = "";


        if (usuarios.length === 0) {

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

            const linha =
                document.createElement("tr");


            linha.innerHTML = `

                <td>
                    ${usuario.id}
                </td>

                <td>
                    ${usuario.nome}
                </td>

                <td>
                    R$ ${Number(usuario.VALOR).toFixed(2)}
                </td>

                <td>
                    ${usuario.HRDOBABA}
                </td>

                <td>

                    <button
                        onclick="editarUsuario(
                            ${usuario.id},
                            ${JSON.stringify(usuario.nome)},
                            ${JSON.stringify(usuario.VALOR)},
                            ${JSON.stringify(usuario.HRDOBABA)}
                        )"
                    >
                        Editar
                    </button>

                    <button
                        onclick="excluirUsuario(${usuario.id})"
                    >
                        Excluir
                    </button>

                </td>

            `;


            lista.appendChild(linha);

        });


    } catch (erro) {

        console.error(
            "ERRO NA API:",
            erro
        );


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

document
    .getElementById("formUsuario")
    .addEventListener(
        "submit",
        async function(event) {

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


            console.log(
                "Enviando:",
                dados
            );


            try {

                let resposta;


                // CADASTRAR

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


                // EDITAR

                else {

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
                    "Resposta:",
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
                    erro
                );

                alert(
                    "Erro ao conectar com a API."
                );

            }

        }
    );


// ========================================
// EDITAR
// ========================================

function editarUsuario(
    id,
    nome,
    valor,
    horaBaba
) {

    usuarioEditando = id;


    document
        .getElementById("nome")
        .value = nome;


    document
        .getElementById("VALOR")
        .value = valor;


    document
        .getElementById("HRDOBABA")
        .value = horaBaba;


    document
        .getElementById("titulo-form")
        .textContent =
        "EDITAR QUEM VAI?";


    document
        .getElementById("btnSalvar")
        .textContent =
        "Salvar alterações";


    document
        .getElementById("btnCancelar")
        .style.display =
        "inline-block";

}


// ========================================
// CANCELAR
// ========================================

function cancelarEdicao() {

    usuarioEditando = null;


    document
        .getElementById("formUsuario")
        .reset();


    document
        .getElementById("titulo-form")
        .textContent =
        "QUEM VAI?";


    document
        .getElementById("btnSalvar")
        .textContent =
        "Cadastrar";


    document
        .getElementById("btnCancelar")
        .style.display =
        "none";

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

        const resposta =
            await fetch(
                `${API_URL}/usuarios/${id}`,
                {
                    method: "DELETE"
                }
            );


        const resultado =
            await resposta.json();


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
            erro
        );

        alert(
            "Erro ao conectar com a API."
        );

    }

}


// ========================================
// INICIAR
// ========================================

carregarUsuarios();
