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
  const id_esc = await db.insertEscolaridade(dados); // tabela escolaridade
  await db.inst_ensino({...dados, id_esc}); // tabela instituicao_ensino
  await db.insertQuimioterapia({...dados, id_pcte});           // tabela quimioterapia
  await db.insertRadioterapia({...dados, id_pcte});            // tabela radioterapia
  await db.insertCirurgia({...dados, id_pcte});             // tabela cirurgia
  const id_est_civil = await db.insertEstadoCivil(dados); // tabela estado_civil
  const id_resp = await db.insertResponsavel({...dados,  id_esc, id_est_civil, id_pcte, id_end});  // tabela responsavel  
  await db.insertHistoricoSaude({...dados, id_pcte});          // tabela historico saude paciente
  const id_unidade = await db.insertUbsReferencia(dados);           // tabela ubs_referencia
  const id_cras = await db.insertCrasReferencia(dados);          // tabela cras_referencia
  await db.locaisHist({id_unidade, id_cras}); // tabela locais historico
  await db.insertHistoricoSaudeResponsavel({...dados, id_resp}); // tabela responsavel_diagnostico
  await db.insertSituacaoSocioEconomica({...dados, id_inst_ensino, id_pcte});  // tabela socio_economica
  const id_adq_casa = await db.insertAdquirirCasa(dados);         // tabela Tipo da aquisição da casa
  const id_caract = await db.insertCaracteristicasCasa(dados); // tabela Características da casa
  await db.insertSituacaoHabitacional({dados, id_caract, id_pcte, id_adq_casa}); // tabela Situação habitacional
  res.sendStatus(201);
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});