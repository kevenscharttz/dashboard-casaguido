const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();
const db = require('./db/db'); // Importa a conexão com o banco de dados

// const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
// app.use('/api', authRoutes);

app.post('/paciente', async (req, res) => {
  const dados = req.body;
  const id_end = await db.insertEnderecoPaciente(dados);        // tabela endereco_paciente
  const id_pcte = await db.insertPaciente({...dados, id_end});                // tabela pacientes
  await db.insertResponsavel(dados);             // tabela responsaveis
  await db.insertQuimioterapia(dados);           // tabela quimioterapia
  await db.insertRadioterapia(dados);            // tabela radioterapia
  await db.insertCirurgia(dados);                // tabela cirurgia
  await db.insertHistoricoSaude(dados);          // tabela historico_saude
  await db.insertSituacaoSocioEconomica(dados);  // tabela socio_economica
  await db.insertUbsReferencia(dados);           // tabela ubs_referencia
  await db.insertCrasReferencia(dados);          // tabela cras_referencia
  res.sendStatus(201);
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});