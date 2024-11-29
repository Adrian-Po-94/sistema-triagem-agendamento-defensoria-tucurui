/*
 * Autor: Adrian Caldas Pó
 * Data: 29/11/2024
 * Descrição: Este módulo contém as rotas da aplicação para login, logout, cadastro de usuários, defensores e agendamentos.
 *            Também realiza a verificação do limite de agendamentos diários de defensores, além de permitir editar, excluir e listar agendamentos.
 *            Utiliza o MySQL para comunicação com o banco de dados e o bcrypt para segurança nas senhas dos usuários.
 */

const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Configuração da conexão com o banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Altere conforme necessário
    password: 'admin', // Altere conforme necessário
    database: 'defensoria2'
});

// Rota para login
router.post('/login', (req, res) => {
    const { cpf, senha } = req.body;

    // Verificar se o usuário existe no banco de dados
    const query = 'SELECT * FROM usuarios WHERE cpf = ?';
    connection.query(query, [cpf], (error, results) => {
        if (error) {
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).send('Erro ao buscar usuário.');
        }

        // Verificar se o usuário foi encontrado
        if (results.length === 0) {
            return res.status(401).send('CPF ou senha inválidos.');
        }

        const usuario = results[0];

        // Aqui você deve usar uma biblioteca como bcrypt para comparar a senha
        // Usar bcrypt para comparar a senha
        bcrypt.compare(senha, usuario.senha, (err, match) => {
            if (err) {
                console.error('Erro ao comparar senhas:', err);
                return res.status(500).send('Erro ao verificar senha.');
            }
            if (!match) {
                return res.status(401).send('CPF ou senha inválidos.');
            }

            // Login bem-sucedido
            res.json({
                id: usuario.id,
                matricula: usuario.matricula,
                nome: usuario.nome,
                email: usuario.email,
            });
        });

    });
});


// Rota para logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao encerrar a sessão:', err);
            return res.status(500).send('Erro ao encerrar a sessão.');
        }
        res.redirect('/'); // Redireciona para a página inicial (index.html)
    });
});

// Rota para cadastrar usuário
router.post('/usuarios', async (req, res) => {
    const { matricula, nome, cpf, email, senha } = req.body;

    // Hash da senha antes de armazenar
    try {
        const hashedPassword = await bcrypt.hash(senha, 10); // Salting rounds: 10

        // Inserir o usuário no banco de dados
        const query = 'INSERT INTO usuarios (matricula, nome, cpf, email, senha) VALUES (?, ?, ?, ?, ?)';
        connection.query(query, [matricula, nome, cpf, email, hashedPassword], (error, results) => {
            if (error) {
                console.error('Erro ao cadastrar usuário:', error);
                return res.status(500).send('Erro ao cadastrar usuário.');
            }
            res.status(201).send('Usuário cadastrado com sucesso!');
        });
    } catch (error) {
        console.error('Erro ao gerar hash da senha:', error);
        return res.status(500).send('Erro ao cadastrar usuário.');
    }
});

// Rota para cadastrar defensor
router.post('/defensores', (req, res) => {
    const { nome, tipo } = req.body;

    const query = 'INSERT INTO defensores (nome, tipo) VALUES (?, ?)';
    connection.query(query, [nome, tipo], (error, results) => {
        if (error) {
            console.error('Erro ao cadastrar defensor:', error);
            return res.status(500).send('Erro ao cadastrar defensor.');
        }
        res.status(201).send('Defensor cadastrado com sucesso!');
    });
});

// Rota para cadastrar agendamentos
router.post('/agendamentos', (req, res) => {
    const { defensor_id, nome, telefone, assunto_id, observacao, data_hora } = req.body;

    const data = new Date(data_hora);
    const dia = data.toISOString().split('T')[0];

    const getTypeQuery = 'SELECT tipo FROM defensores WHERE id = ?';
    connection.query(getTypeQuery, [defensor_id], (err, result) => {
        if (err) {
            console.error('Erro ao buscar tipo do defensor:', err);
            return res.status(500).json({ message: 'Erro ao buscar tipo do defensor.' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Defensor não encontrado.' });
        }

        const tipoDefensor = result[0].tipo;
        console.log(`Tipo do defensor com ID ${defensor_id}:`, tipoDefensor);

        let limiteDiario;
        switch (tipoDefensor) {
            case 'defensor':
                limiteDiario = 10;
                break;
            case 'servidor':
            case 'assessor':
                limiteDiario = 5;
                break;
            case 'estagiario':
                limiteDiario = 4;
                break;
            default:
                console.error('Tipo de defensor inválido:', tipoDefensor);
                return res.status(400).json({ message: 'Tipo de defensor inválido.' });
        }

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM agendamentos
            WHERE defensor_id = ? AND DATE(data_hora) = ?
        `;
        
        connection.query(countQuery, [defensor_id, dia], (err, results) => {
            if (err) {
                console.error('Erro ao contar agendamentos:', err);
                return res.status(500).json({ message: 'Erro ao contar agendamentos.' });
            }

            const totalAgendamentos = results[0].total;
            console.log(`Total de agendamentos para o defensor ${defensor_id} no dia ${dia}: ${totalAgendamentos}`);
            console.log(`Limite diário para o tipo de defensor ${tipoDefensor}: ${limiteDiario}`);

            if (totalAgendamentos >= limiteDiario) {
                return res.status(400).json({
                    message: `⚠️ Atenção: O defensor já atingiu o limite diário de ${limiteDiario} agendamentos. Por favor, verifique e tente novamente.`
                });
            }

            const insertQuery = `
                INSERT INTO agendamentos (defensor_id, nome, telefone, assunto_id, observacao, data_hora)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            connection.query(insertQuery, [defensor_id, nome, telefone, assunto_id, observacao, data_hora], (error, results) => {
                if (error) {
                    console.error('Erro ao cadastrar agendamento:', error);
                    return res.status(500).json({ message: 'Erro ao cadastrar agendamento.' });
                }
                res.status(201).json({ message: 'Agendamento cadastrado com sucesso!' });
            });
        });
    });
});

// Rota para listar defensores
router.get('/defensores', (req, res) => {
    const query = 'SELECT id, nome FROM defensores';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Erro ao buscar defensores:', error);
            return res.status(500).send('Erro ao buscar defensores.');
        }
        res.json(results);
    });
});

// Rota para listar assuntos
router.get('/assuntos', (req, res) => {
    const query = 'SELECT id, descricao FROM assuntos';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Erro ao buscar assuntos:', error);
            return res.status(500).send('Erro ao buscar assuntos.');
        }
        res.json(results);
    });
});

// Rota para listar todos os agendamentos
router.get('/agendamentos', (req, res) => {
    const query = `
        SELECT agendamentos.id, defensores.nome AS defensor, agendamentos.nome AS nome_cliente, 
               agendamentos.telefone, assuntos.descricao AS assunto, agendamentos.observacao, agendamentos.data_hora
        FROM agendamentos
        JOIN defensores ON agendamentos.defensor_id = defensores.id
        JOIN assuntos ON agendamentos.assunto_id = assuntos.id
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar agendamentos:', err);
            return res.status(500).send('Erro ao buscar agendamentos');
        }
        res.json(results);
    });
});

// Rota para buscar agendamento por ID
router.get('/agendamentos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM agendamentos WHERE id = ?';

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Erro ao buscar agendamento:', err);
            return res.status(500).send('Erro ao buscar agendamento.');
        }
        if (results.length === 0) {
            return res.status(404).send('Agendamento não encontrado.');
        }
        res.json(results[0]);
    });
});

// Editar agendamento
router.put('/agendamentos/:id', (req, res) => {
    const { id } = req.params; // Pega o ID do agendamento
    const { defensor_id, nome, telefone, assunto_id, observacao, data_hora } = req.body;

    const query = `
        UPDATE agendamentos 
        SET defensor_id = ?, nome = ?, telefone = ?, assunto_id = ?, observacao = ?, data_hora = ?
        WHERE id = ?
    `;

    connection.query(query, [defensor_id, nome, telefone, assunto_id, observacao, data_hora, id], (err, result) => {
        if (err) {
            console.error('Erro ao editar agendamento:', err);
            return res.status(500).send('Erro ao editar agendamento.');
        }
        
        // Verifica se alguma linha foi afetada
        if (result.affectedRows === 0) {
            return res.status(404).send('Agendamento não encontrado.');
        }

        res.send('Agendamento editado com sucesso!');
    });
});

// Excluir agendamento
router.delete('/agendamentos/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM agendamentos WHERE id = ?';

    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Erro ao excluir agendamento:', err);
            return res.status(500).send('Erro ao excluir agendamento.');
        }
        // Verifica se alguma linha foi afetada
        if (result.affectedRows === 0) {
            return res.status(404).send('Agendamento não encontrado.');
        }
        res.send('Agendamento excluído com sucesso!');
    });
});

module.exports = router;
