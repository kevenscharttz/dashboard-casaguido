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
  console.log('DADOS RECEBIDOS DO FRONTEND:', dados);
  const id_cras = await db.insertCrasReferencia(dados);          // tabela cras_referencia
  const id_unidade = await db.insertUbsReferencia(dados);        // tabela ubs_referencia
  const id_end = await db.insertEnderecoPaciente(dados);         // tabela endereco_paciente
  const id_pcte = await db.insertPaciente({...dados},id_end);    // tabela pacientes
  const ids_esc = await db.insertEscolaridade(dados);            // retorna array
  const ids_est_civil = await db.insertEstadoCivil(dados); // tabela estado_civil
  const id_esc = Array.isArray(ids_esc) ? ids_esc[0] : ids_esc; // pega só o primeiro
  const id_inst_ensino = await db.inst_ensino({...dados}, id_esc); // tabela instituicao_ensino
  await db.insertQuimioterapia(dados.quimio, id_pcte);           // tabela quimioterapia
  await db.insertRadioterapia(dados.radio, id_pcte);            // tabela radioterapia
  await db.insertCirurgia(dados.cirurgia, id_pcte);             // tabela cirurgia
  const id_responsavel = await db.insertResponsavel({...dados},  ids_esc, ids_est_civil, id_pcte, id_end);  // tabela responsavel  
  await db.insertHistoricoSaude({...dados}, id_pcte);          // tabela historico saude paciente
  await db.locaisHist(id_unidade, id_cras); // tabela locais historico
  await db.insertHistoricoSaudeResponsavel({...dados}, id_responsavel); // tabela responsavel_diagnostico
  await db.insertSituacaoSocioEconomica({...dados}, id_inst_ensino, id_pcte);  // tabela socio_economica
  const id_adq_casa = await db.insertAdquirirCasa({situacao_habitacional: dados.situacao_habitacional || null});         // tabela Tipo da aquisição da casa
  const id_caract = await db.insertCaracteristicasCasa(dados); // tabela Características da casa
  await db.insertSituacaoHabitacional(dados, id_caract, id_pcte, id_adq_casa); // tabela Situação habitacional
  res.sendStatus(201);
  console.log('UBS:', {
    municipio: dados.ubs_municipio,
    bairro: dados.ubs_bairro,
    obs: dados.ubs_observacao
  });
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});