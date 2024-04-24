const mysql = require('../mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
        await mysql.execute(query, [email, hashedPassword]);

        const response = {
            message: 'Usuário criado com sucesso',
            createdUser: { email: email }
        };
        return res.status(201).send(response);

    } catch (error) {
        console.error('Erro ao criar usuário:', error.message);
        return res.status(500).send({ error: 'Erro interno ao criar usuário' });
    }
};

exports.Login = async (req, res, next) => {

    try {
        const query = `SELECT * FROM users WHERE email = ?`;
        var results = await mysql.execute(query, [req.body.email]);

        if (results.length < 1) {
            return res.status(401).send({ message: 'Falha na autenticação' })
        }

        if (await bcrypt.compareSync(req.body.password, results[0].password)) {
            const token = jwt.sign({
                userId: results[0].userId,
                email: results[0].email
            },
            process.env.JWT_KEY,
            {
                expiresIn: "1h"
            });
            return res.status(200).send({
                message: 'Autenticado com sucesso',
                token: token
            });
        }
        return res.status(401).send({ message: 'Falha na autenticação' })

    } catch (error) {
        return res.status(500).send({ message: 'Falha na autenticação' });
    }
};