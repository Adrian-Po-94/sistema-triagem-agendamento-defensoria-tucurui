/*
 * Autor: Adrian Caldas Pó
 * Data: 29/11/2024
 * Descrição: Este script gerencia a interação com os formulários de cadastro e login de usuários, defensores e agendamentos,
 *            além de realizar operações de listagem de agendamentos e carregamento de defensores e assuntos.

 */

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o formulário de cadastro de usuário está presente
    const usuarioForm = document.getElementById('cadastro-usuario');
    if (usuarioForm) {
        usuarioForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://localhost:3000/usuarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const feedbackDiv = document.getElementById('feedback');
                if (response.ok) {
                    feedbackDiv.innerText = 'Usuário cadastrado com sucesso!';
                    event.target.reset();
                } else {
                    const errorText = await response.text();
                    feedbackDiv.innerText = 'Erro: ' + errorText;
                }
            } catch (error) {
                console.error('Erro ao cadastrar usuário:', error);
                document.getElementById('feedback').innerText = 'Erro ao cadastrar usuário.';
            }
        });
    }

    // Verifica se o formulário de cadastro de defensor está presente
    const defensorForm = document.getElementById('cadastro-defensor');
    if (defensorForm) {
        defensorForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://localhost:3000/defensores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const feedbackDiv = document.getElementById('feedback');
                if (response.ok) {
                    feedbackDiv.innerText = 'Defensor cadastrado com sucesso!';
                    event.target.reset();
                } else {
                    const errorText = await response.text();
                    feedbackDiv.innerText = 'Erro: ' + errorText;
                }
            } catch (error) {
                console.error('Erro ao cadastrar defensor:', error);
                document.getElementById('feedback').innerText = 'Erro ao cadastrar defensor.';
            }
        });
    }

    // Verifica se o formulário de agendamento está presente
    const cadastroAgendamentoForm = document.getElementById('cadastro-agendamento');
    if (cadastroAgendamentoForm) {
        cadastroAgendamentoForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://localhost:3000/agendamentos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const feedbackDiv = document.getElementById('feedback');
                if (response.ok) {
                    feedbackDiv.innerText = 'Agendamento cadastrado com sucesso!';
                    event.target.reset();
                    
                } else {
                    const errorText = await response.text();
                    feedbackDiv.innerText = 'Erro: ' + errorText;
                }
            } catch (error) {
                console.error('Erro ao cadastrar agendamento:', error);
                document.getElementById('feedback').innerText = 'Erro ao cadastrar agendamento.';
            }
        });
    }

   // Cadastrar login
   const loginForm = document.getElementById('loginForm');
   if (loginForm) {
       loginForm.addEventListener('submit', async (e) => {
           e.preventDefault(); // Evitar o envio do formulário

           const cpf = document.getElementById('cpf').value;
           const senha = document.getElementById('senha').value;

           const response = await fetch('http://localhost:3000/login', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({ cpf, senha }),
           });

           const mensagemDiv = document.getElementById('mensagem');

           if (response.ok) {
               const usuario = await response.json();
               localStorage.setItem('usuarioLogado', JSON.stringify(usuario)); // Armazenar informações do usuário
               window.location.href = 'index2.html'; // Redirecionar para a página principal
           } else {
               const erro = await response.text();
               mensagemDiv.textContent = erro; // Exibir mensagem de erro
           }
       });
   }
   
    // Adiciona o evento de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('usuarioLogado'); // Remove as informações do usuário
            window.location.href = 'index.html'; // Redireciona para a página de login
        });
    }

     const agendamentosList = document.getElementById('agendamentos-list');
    if (agendamentosList) {
        listarAgendamentos(); // Chama listarAgendamentos apenas se o elemento existir
    }

    // Chama as funções de carregar defensores e assuntos se o formulário de agendamento estiver presente
    if (cadastroAgendamentoForm) {
        carregarDefensores();
        carregarAssuntos();
    }
});



// Função para carregar defensores
async function carregarDefensores() {
    const defensorSelect = document.getElementById('defensor_id');
    if (!defensorSelect) {
        console.error('Elemento defensor_id não encontrado');
        return; // Sai da função se o elemento não existir
    }

    try {
        const response = await fetch('http://localhost:3000/defensores');
        const defensores = await response.json();

        defensores.forEach(defensor => {
            const option = document.createElement('option');
            option.value = defensor.id;
            option.textContent = defensor.nome;
            defensorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar defensores:', error);
    }
}

// Função para carregar assuntos
async function carregarAssuntos() {
    const assuntoSelect = document.getElementById('assunto_id');
    if (!assuntoSelect) {
        console.error('Elemento assunto_id não encontrado');
        return; // Sai da função se o elemento não existir
    }

    try {
        const response = await fetch('http://localhost:3000/assuntos');
        const assuntos = await response.json();

        assuntos.forEach(assunto => {
            const option = document.createElement('option');
            option.value = assunto.id;
            option.textContent = assunto.descricao;
            assuntoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar assuntos:', error);
    }
}

// Função para listar agendamentos
async function listarAgendamentos() {
    try {
        const response = await fetch('http://localhost:3000/agendamentos');
        const agendamentos = await response.json();
        //console.log(agendamentos); // Verifique os dados retornados
    
    
        const agendamentosList = document.getElementById('agendamentos-list');
        if (!agendamentosList) {
            console.error('Elemento agendamentos-list não encontrado');
            return;
        }

        agendamentosList.innerHTML = ''; // Limpa a tabela antes de preencher

        // Agrupa agendamentos por dia da semana
        const diasDaSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
        const agendamentosPorDia = {};

        agendamentos.forEach(agendamento => {
            const data = new Date(agendamento.data_hora);
            const diaSemana = data.getDay(); // 0 = Domingo, 1 = Segunda-feira, ..., 6 = Sábado
            
            // Filtra apenas de segunda a sexta (1 a 5)
            if (diaSemana >= 1 && diaSemana <= 5) {
                const dia = diasDaSemana[diaSemana - 1]; // Ajusta para o índice correto
                if (!agendamentosPorDia[dia]) {
                    agendamentosPorDia[dia] = [];
                }
                agendamentosPorDia[dia].push(agendamento);
            }
        });

        // Exibe os agendamentos por dia da semana
        for (const dia of diasDaSemana) {
            if (agendamentosPorDia[dia]) {
                const diaRow = document.createElement('tr');
                diaRow.innerHTML = `<td colspan="9"><strong>${dia}</strong></td>`; // Ajuste para a nova coluna
                agendamentosList.appendChild(diaRow);

                agendamentosPorDia[dia].forEach(agendamento => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${agendamento.id}</td>
                        <td>${agendamento.defensor}</td>
                        <td>${agendamento.nome_cliente}</td>
                        <td>${agendamento.telefone}</td>
                        <td>${agendamento.assunto}</td>
                        <td>${agendamento.observacao}</td>
                        <td>${new Date(agendamento.data_hora).toLocaleString()}</td>
                        <td>
                            <button onclick="abrirModalEditar(${agendamento.id})">Editar</button>
                            <button onclick="deletarAgendamento(${agendamento.id})">Excluir</button>
                        </td>
                    `;
                    agendamentosList.appendChild(row);
                });
            }
        }
    } catch (error) {
        console.error('Erro ao listar agendamentos:', error);
    }
}
// Verifica se o elemento existe antes de chamar listarAgendamentos
document.addEventListener('DOMContentLoaded', function () {
    const agendamentosList = document.getElementById('agendamentos-list');
    if (agendamentosList) {
        listarAgendamentos(); // Somente chama a função se o elemento existe
    }
});

// Função para abrir o modal de edição
function abrirModalEditar(agendamentoId) {
    // Exibir o modal
    const modal = document.getElementById('modalEditar');
    modal.style.display = 'block';

    // Popule os campos com os dados do agendamento
    document.getElementById('agendamento-id').value = agendamentoId;

    // Carregar defensores e assuntos
    preencherDefensores();
    preencherAssuntos();

    // Aqui você pode adicionar a lógica para preencher os outros campos, como nome do cliente e telefone
    carregarAgendamento(agendamentoId);
}

// Função para preencher a lista de defensores
async function preencherDefensores() {
    const defensorSelect = document.getElementById('defensor-editar');
    defensorSelect.innerHTML = ''; // Limpar opções existentes

    try {
        const response = await fetch('http://localhost:3000/defensores'); // Rota que retorna os defensores
        const defensores = await response.json();

        defensores.forEach(defensor => {
            const option = document.createElement('option');
            option.value = defensor.id; // ID do defensor
            option.textContent = defensor.nome; // Nome do defensor
            defensorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar defensores:', error);
    }
}

// Função para preencher a lista de assuntos
async function preencherAssuntos() {
    const assuntoSelect = document.getElementById('assunto-editar');
    assuntoSelect.innerHTML = ''; // Limpar opções existentes

    try {
        const response = await fetch('http://localhost:3000/assuntos'); // Rota que retorna os assuntos
        const assuntos = await response.json();

        assuntos.forEach(assunto => {
            const option = document.createElement('option');
            option.value = assunto.id; // ID do assunto
            option.textContent = assunto.descricao; // Descrição do assunto
            assuntoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar assuntos:', error);
    }
}

// Função para carregar os dados do agendamento e preencher os campos
async function carregarAgendamento(agendamentoId) {
    try {
        const response = await fetch(`http://localhost:3000/agendamentos/${agendamentoId}`);
        const agendamento = await response.json();

        // Preencher os campos do modal com os dados do agendamento
        document.getElementById('nome-editar').value = agendamento.nome;
        document.getElementById('telefone-editar').value = agendamento.telefone;
        document.getElementById('assunto-editar').value = agendamento.assunto_id; // Assunto selecionado
        document.getElementById('observacao-editar').value = agendamento.observacao;

        // Definir o defensor selecionado
        document.getElementById('defensor-editar').value = agendamento.defensor_id; // Defensor selecionado
    } catch (error) {
        console.error('Erro ao carregar agendamento:', error);
    }
}

// Função para fechar o modal de edição
function fecharModalEditar() {
    const modal = document.getElementById('modalEditar');
    modal.style.display = 'none';
}

// Função para salvar a edição do agendamento
// Função para salvar as edições do agendamento
async function salvarEdicaoAgendamento() {
    // Obtém os dados editados do modal
    const agendamentoId = document.getElementById('agendamento-id').value;
    const nome = document.getElementById('nome-editar').value;
    const telefone = document.getElementById('telefone-editar').value;
    const defensorId = document.getElementById('defensor-editar').value;
    const assuntoId = document.getElementById('assunto-editar').value;
    const observacao = document.getElementById('observacao-editar').value;
    const dataHora = document.getElementById('data-hora-editar').value; // Captura o valor do campo data e hora

    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!nome || !telefone || !defensorId || !assuntoId || !dataHora) {
        alert("Todos os campos são obrigatórios.");
        return;
    }

    // Dados para enviar ao servidor
    const data = {
        nome,
        telefone,
        defensor_id: defensorId,
        assunto_id: assuntoId,
        observacao,
        data_hora: dataHora // Inclui o campo data_hora no objeto a ser enviado
    };

    try {
        // Envia a requisição para atualizar o agendamento
        const response = await fetch(`http://localhost:3000/agendamentos/${agendamentoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Agendamento atualizado com sucesso!');
            fecharModalEditar(); // Fecha o modal
            listarAgendamentos(); // Atualiza a lista de agendamentos
        } else {
            const errorText = await response.text();
            alert('Erro ao atualizar agendamento: ' + errorText);
        }
    } catch (error) {
        console.error('Erro ao salvar edição do agendamento:', error);
    }
}

// Função para deletar um agendamento
async function deletarAgendamento(agendamentoId) {
    if (confirm('Você tem certeza que deseja excluir este agendamento?')) {
        try {
            const response = await fetch(`http://localhost:3000/agendamentos/${agendamentoId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Agendamento excluído com sucesso!');
                listarAgendamentos(); // Atualiza a lista após a exclusão
            } else {
                const errorText = await response.text();
                alert('Erro: ' + errorText);
            }
        } catch (error) {
            console.error('Erro ao excluir agendamento:', error);
        }
    }
}
