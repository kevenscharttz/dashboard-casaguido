
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

require('dotenv').config();
const db = require('./db/db'); // Importa a conexão com o banco de dados

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'html')));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'js')));
app.use(express.static(__dirname)); // Para servir index.html na raiz

// Endpoint de login para contas_login
app.post('/api/contas/login', async (req, res) => {
    try {
        const { usuario_login, senha_login } = req.body;
        const users = await db.getAllUsers();
        const user = users.find(u => u.usuario_login === usuario_login && u.senha_login === senha_login);
        if (!user) {
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }
        // Aqui você pode gerar token/jwt se quiser
        res.status(200).json({ message: 'Login realizado com sucesso', usuario_login: user.usuario_login });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao tentar login', error });
    }
});

// CRUD direto para contas_login
// Evita cadastro duplicado de usuário
app.post('/api/contas/register', async (req, res) => {
    try {
        const userData = req.body;
        if (!userData.usuario_login || !userData.senha_login) {
            return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
        }
        // Verifica se já existe usuário com o mesmo nome
        const allUsers = await db.getAllUsers();
        const exists = allUsers.some(u => u.usuario_login === userData.usuario_login);
        if (exists) {
            return res.status(409).json({ message: 'Usuário já existe' });
        }
        const newUser = await db.createUser(userData);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

app.get('/api/contas/users', async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
});

app.get('/api/contas/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await db.getUserById(userId);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
});

app.put('/api/contas/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;
        if (!updatedData.usuario_login || !updatedData.senha_login) {
            return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
        }
        // Verifica se já existe outro usuário com o mesmo nome
        const allUsers = await db.getAllUsers();
        const exists = allUsers.some(u => u.usuario_login === updatedData.usuario_login && String(u.id_login) !== String(userId));
        if (exists) {
            return res.status(409).json({ message: 'Usuário já existe' });
        }
        const updatedUser = await db.updateUser(userId, updatedData);
        if (updatedUser) {
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Erro ao editar usuário:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

app.delete('/api/contas/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await db.deleteUser(userId);
        if (result) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
});

app.post('/paciente', async (req, res) => {
  const dados = req.body;
  console.log('Dados recebidos:', dados);
  const id_cras = await db.insertCrasReferencia(dados);          // tabela cras_referencia
  const id_unidade = await db.insertUbsReferencia(dados);        // tabela ubs_referencia
  const id_end = await db.insertEnderecoPaciente(dados);         // tabela endereco_paciente
  const id_pcte = await db.insertPaciente({...dados},id_end);    // tabela pacientes
  const ids_esc = await db.insertEscolaridade(dados);            // retorna array
  const ids_est_civil = await db.insertEstadoCivil(dados); // tabela estado_civil
  const id_esc = Array.isArray(ids_esc) ? ids_esc[0] : ids_esc; // pega só o primeiro
  const id_inst_ensino = await db.inst_ensino({...dados}, id_esc); // tabela instituicao_ensino
  await db.insertCirurgia(dados.cirurgia, id_pcte);             // tabela cirurgia
  await db.insertQuimioterapia(dados.quimio, id_pcte);           // tabela quimioterapia
  await db.insertRadioterapia(dados.radio, id_pcte);            // tabela radioterapia
  await db.insertResponsavel({...dados},  ids_esc, ids_est_civil, id_pcte, id_end);  // tabela responsavel  
  await db.insertHistoricoSaude(dados, id_pcte);
  await db.locaisHist(id_unidade, id_cras); // tabela locais historico
  await db.insertHistoricoSaudeResponsavel(dados.diagnosticosFamiliares, id_pcte); // tabela responsavel_diagnostico
  await db.insertSituacaoSocioEconomica({...dados}, id_inst_ensino, id_pcte);  // tabela socio_economica
  const id_adq_casa = await db.insertAdquirirCasa({situacao_habitacional: dados.situacao_habitacional || null});         // tabela Tipo da aquisição da casa
  const id_caract = await db.insertCaracteristicasCasa(dados); // tabela Características da casa
  await db.insertSituacaoHabitacional(dados, id_pcte, id_adq_casa, id_caract); // tabela Situação habitacional
  res.sendStatus(201);
});

app.get('/pacientes', async (req, res) => {
  try {
    const pacientes = await db.getPacientes();
    res.json(pacientes);
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({ erro: 'Erro ao buscar pacientes' });
  }
});

// Endpoint: total de pacientes
app.get('/dashboard/total-pacientes', async (req, res) => {
  try {
    const total = await db.getTotalPacientes();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar total de pacientes' });
  }
});

// Endpoint: pacientes cadastrados hoje
app.get('/dashboard/cadastros-hoje', async (req, res) => {
  try {
    const total = await db.getCadastrosHoje();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar cadastros de hoje' });
  }
});

// Endpoint: pacientes cadastrados na semana
app.get('/dashboard/cadastros-semana', async (req, res) => {
  try {
    const total = await db.getCadastrosSemana();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar cadastros da semana' });
  }
});

// Endpoint: últimos 3 pacientes
app.get('/dashboard/ultimos-pacientes', async (req, res) => {
  try {
    const pacientes = await db.getUltimosPacientes();
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar últimos pacientes' });
  }
});

// Endpoint de busca de pacientes por nome ou CPF
app.get('/pacientes/busca', async (req, res) => {
  const termo = req.query.q || '';
  try {
    const pacientes = await db.buscarPacientes(termo);
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar pacientes' });
  }
});

// Rota para deletar paciente
app.delete('/paciente/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await db.deletarPaciente(id);
    res.sendStatus(204); // No Content
  } catch (error) {
    console.error('Erro ao deletar paciente:', error);
    res.status(500).json({ erro: 'Erro ao deletar paciente' });
  }
});

// Endpoint para buscar paciente por ID
app.get('/paciente/:id', async (req, res) => {
  try {
    const paciente = await db.getPacientePorId(req.params.id);
    if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado' });
    res.json(paciente);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar paciente' });
  }
});

// Endpoint para atualizar paciente por ID
app.put('/paciente/:id', async (req, res) => {
  const id = req.params.id;
  const novosDados = req.body;

  try {
    // Atualiza os dados do paciente no banco
    await db.atualizarPaciente(id, novosDados);
    res.sendStatus(204); // No Content
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    res.status(500).json({ erro: 'Erro ao atualizar paciente' });
  }
});

// Exemplo de rota para index.html na raiz:
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});