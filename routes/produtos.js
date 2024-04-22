const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const multer = require('multer');
const login = require('../middleware/login');

const produtosController = require('../controllers/produtos-controller');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        let data = new Date().toISOString().replace(/:/g, '-') + '-';
        cb(null, data + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
});

router.get('/', produtosController.getProdutos);
router.post(
    '/',
    login.obrigatorio,
    upload.single('produto_imagem'),
    produtosController.postProduto,
);
router.get('/:id_produto', produtosController.getUmProduto);

router.patch('/', login.obrigatorio, produtosController.updateProduto);

//  EXCLUI UM PRODUTO
router.delete('/', login.obrigatorio, produtosController.deleteProduto);

router.post(
    '/:id_produto/imagem',
    login.obrigatorio,
    upload.single('produto_imagem'),
    produtosController.postImagem
);

router.get(
    '/:id_produto/imagens',
    produtosController.getImagens
)

module.exports = router;
