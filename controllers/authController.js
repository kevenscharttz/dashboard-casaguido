const pool = require('../db/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../db/db');

exports.register = async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    await pool.execute(
      'INSERT INTO usuarios (nome, email, senha_hash, tipo, status) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senhaHash, tipo, 'ativo']
    );
    res.status(201).json({ mensagem: 'Usuário registrado com sucesso.' });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ erro: 'Erro ao registrar usuário.' });
  }
};

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

// Cadastro de paciente
exports.cadastrarPaciente = async (req, res) => {
  try {
    const dados = req.body;

    // Agora CPF também é obrigatório
    if (!dados.paciente || !dados.data_nascimento || !dados.telefone1 || !dados.cpf) {
      return res.status(400).json({ error: 'Nome, data de nascimento, telefone e CPF são obrigatórios.' });
    }

    // 1. Endereço
    const id_end = await db.insertEnderecoPaciente(dados);

    // 2. Paciente
    const id_pcte = await db.insertPaciente(dados, id_end);

    // 3. Escolaridade (paciente, mãe, pai, outro)
    const ids_esc = await db.insertEscolaridade(dados);

    // 4. Instituição de ensino (se houver)
    let id_inst_ensino = null;
    if (dados.instituicao_ensino) {
      id_inst_ensino = await db.inst_ensino(dados, ids_esc[0]);
    }

    // 5. Estado civil (mãe, pai, outro)
    const ids_est_civil = await db.insertEstadoCivil(dados);

    // 6. Responsáveis
    await db.insertResponsavel(dados, ids_esc, ids_est_civil, id_pcte, id_end);

    // 7. Quimioterapia, radioterapia, cirurgia
    await db.insertQuimioterapia(dados.quimio || {}, id_pcte);
    await db.insertRadioterapia(dados.radio || {}, id_pcte);
    await db.insertCirurgia(dados.cirurgia || {}, id_pcte);

    // 8. Histórico de saúde do paciente
    await db.insertHistoricoSaude(dados, id_pcte);

    // 9. UBS e CRAS de referência
    const id_ubs = await db.insertUbsReferencia(dados);
    const id_cras = await db.insertCrasReferencia(dados);
    await db.locaisHist(id_ubs, id_cras);

    // 10. Diagnósticos familiares
    if (dados.diagnosticosFamiliares) {
      await db.insertHistoricoSaudeResponsavel(dados.diagnosticosFamiliares, id_pcte);
    }

    // 11. Situação socioeconômica
    await db.insertSituacaoSocioEconomica(dados, id_inst_ensino, id_pcte);

    // 12. Situação habitacional
    const id_adq_casa = await db.insertAdquirirCasa(dados);
    const id_caract = await db.insertCaracteristicasCasa(dados);
    await db.insertSituacaoHabitacional(dados, id_pcte, id_adq_casa, id_caract);

    res.status(201).json({ message: 'Paciente cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar paciente:', error);
    res.status(500).json({ error: 'Erro ao cadastrar paciente.' });
  }
};
