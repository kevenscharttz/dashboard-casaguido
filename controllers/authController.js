const pool = require('../db/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [username]);
    const user = rows[0];

    if (!user) return res.status(401).json({ erro: 'Usuário não encontrado.' });

    const senhaValida = await bcrypt.compare(password, user.senha_hash);
    if (!senhaValida) return res.status(401).json({ erro: 'Senha inválida.' });

    const token = jwt.sign({ id: user.id, tipo: user.tipo }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({ mensagem: 'Login bem-sucedido', token, nome: user.nome, tipo: user.tipo });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro ao realizar login.' });
  }
};
