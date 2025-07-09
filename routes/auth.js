const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/cadastrar-paciente', authController.cadastrarPaciente);
// Rota para listar todos os usuários
router.get('/usuarios', authController.listUsers);
// Rota para cadastrar usuário na tabela contas_login
router.post('/contas_login', authController.createLoginUser);

module.exports = router;
