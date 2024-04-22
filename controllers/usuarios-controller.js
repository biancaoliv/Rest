const bcrypt = require('bcrypt');
const mysql = require('../mysql').pool;
const jwt = require('jsonwebtoken');

exports.cadastrarUsuario = async (req, res, next) => {
    try {
        // const query = 'SELECT * FROM usuarios WHERE email = ?'
        // const result = await mysql.execute(query, [req.body.email])
        // if (results.length > 0) {
        //     res.status(409).send({ mensagem: 'Usuario já cadastrado' });
        //     const hash = await bcrypt.hashSync(req.body.senha, 10)

        const usuarios = req.body.usuarios.map(user => [
                user.email,
                bcrypt.hashSync(user.senha, 10)
            ])

            const query = `INSERT INTO usuarios (email, senha) VALUES (?,?)`;
            await mysql.execute(query, [ req.body.usuarios ]);
            const response = {
                message: 'Usuário criado com sucesso',
                createdUsers: req.body.usuarios.map(usuarios => { return { email: usuarios.email } })
            }
            return res.status(201).send(response);

    } catch (error) {
        return res.status(500).send({ error: error });
    }                
};

exports.login = async (req, res, next) => {
    try {
        const query = `SELECT * FROM usuarios WHERE email= ?`;
        var results = await mysql.execute(query, [req.body.email])
        if (results.length < 1) {
            return res.status(401).send({ message: 'Falha na autenticação' }) 
        }
        if ( bcrypt.compareSync(req.body.senha, results[0].senha)) {
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
        return res.status(500).send({ error: error });

    }
};
