const express = require('express');
const router = express.Router();
const login = require('../middleware/login');

const imagensController = require('../controllers/imagens-controller');

router.delete('/:id_imagem', login.obrigatorio, imagensController.deleteImagem);


module.exports = router;