/*
 * Autor: Adrian Caldas Pó
 * Data: 29/11/2024
 * Descrição: Este arquivo é o servidor principal da aplicação. Ele configura e inicializa o servidor Express, realiza a conexão com o banco de dados MySQL, 
 *            e define os middlewares para processar requisições, sessões e arquivos estáticos. O servidor também inclui o suporte a CORS e um sistema de tratamento de erros.
 *            As rotas da aplicação são definidas em um arquivo separado ('routes.js') e estão sendo importadas e utilizadas aqui.
 */

const express = require('express');
const routes = require('./routes');
const cors = require('cors');
const mysql = require('mysql2');
const session = require('express-session'); // Adicionado para sessão

const app = express();
const PORT = 3000;

// Configuração da conexão com o banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Altere conforme necessário
    password: 'admin', // Altere conforme necessário
    database: 'defensoria2'
});

connection.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL.');
});

// Configuração do middleware de sessão
app.use(session({
    secret: 'defensoria-publica', // Substitua por uma chave secreta segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Se estiver usando HTTPS, mude para true
}));

// Middleware para processar o corpo da requisição
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Ativa CORS para todas as rotas

// Servir arquivos estáticos
app.use(express.static('public'));

// Usar rotas definidas em outro arquivo
app.use(routes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});



app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
