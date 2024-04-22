const mysql = require('../mysql').pool;

exports.getPedidos = async (req, res, next) => {
    try {
        const query = `SELECT pedidos.id_pedido,
                              pedidos.quantidade,
                              produtos.id_produto,
                              produtos.nome,
                              produtos.preco
                         FROM pedidos
                   INNER JOIN produtos
                           ON produtos.id_produto = pedidos.id_produto;`;
        const result = await mysql.execute(query);
        const response = {
            pedidos: result.map(pedido => {
                return {
                    id_pedido: pedido.id_pedido,
                    quantidade: pedido.quantidade,
                    produto: {
                        id_produto: pedido.id_produto,
                        nome: pedido.nome,
                        preco: pedido.preco,
                    },
                    request: {
                        tipo: 'GET',
                        descricao:
                            'Retorna os detalhes de um pedido específico',
                        url:
                            'http://localhost:3000/pedidos/' + pedido.id_pedido,
                    },
                };
            }),
        };
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.postPedidos = async (req, res, next) => {
    try {
        const query = 'SELECT * FROM produtos WHERE id_produto = ?';
        const result = await mysql.execute(query, [req.body.id_produto]);

        if (result.length === 0) {
            conn.release();
            return res.status(404).send({ mensagem: 'Produto não encontrado' });
        }

        const queryOrder =
            'INSERT INTO pedidos (id_produto, quantidade) VALUES (?, ?)';
        const resultOrder = await mysql.execute(queryOrder, [
            req.body.id_produto,
            req.body.quantidade,
        ]);
        const response = {
            mensagem: 'Pedido inserido com sucesso',
            pedidoCriado: {
                id_pedido: resultOrder.insertId,
                id_produto: req.body.id_produto,
                quantidade: req.body.quantidade,
                request: {
                    tipo: 'GET',
                    descricao: 'Retorna todos os pedidos',
                    url: process.env.URL_API + 'pedidos',
                },
            },
        };
        return res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.getUmPedido = async (req, res, next) => {
    try {
        const query = 'SELECT * FROM pedidos WHERE id_pedido = ?;';
        const result = await mysql.execute(query, [req.params.id_pedido]);
        if (result.length == 0) {
            return res.status(404).send({
                mensagem: 'Não foi encontrado pedido com este ID',
            });
        }
        const response = {
            pedido: {
                id_pedido: result[0].id_pedido,
                id_produto: result[0].id_produto,
                quantidade: result[0].quantidade,
                request: {
                    tipo: 'GET',
                    descricao: 'Retorna todos os pedidos',
                    url: process.env.URL_API + 'pedidos',
                },
            },
        };
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

exports.deletePedido = async (req, res, next) => {
    try {
        const query = `DELETE FROM pedidos WHERE id_pedido = ?`;
        await mysql.execute(query, [req.body.id_pedido]);

        const response = {
            mensagem: 'Pedido removido com sucesso',
            request: {
                tipo: 'POST',
                descricao: 'Insere um pedido',
                url: process.env.URL_API + 'pedidos'
            },
        };
        return res.status(202).send(response);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};
