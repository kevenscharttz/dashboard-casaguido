async function connect() {

    if (global.connection) {
        return global.connection.connect();
    }

    const { Pool } = require('pg');
    const pool = new Pool({
        connectionString: process.env.CONNECTION_STRING
    });

    // Testa a conexão com o banco de dados
    const client = await pool.connect();
    console.log("Conectado ao banco de dados com sucesso!");

    const res = await client.query('SELECT NOW()');
    console.log("Hora atual do banco de dados:", res.rows[0].now);
    client.release();

    // Armazena a conexão globalmente
    global.connection = pool;
    return pool.connect();
}

async function insertEnderecoPaciente(endereco) {
  const client = await connect();
  const sql = `INSERT INTO end_pcte (rua_end, num_end, complemento_end, 
               cidade_end, cep_end, uf_end) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_end;`;
  const values = [
    endereco.rua_end,
    endereco.num_end,
    endereco.complemento_end,
    endereco.cidade_end,
    endereco.cep_end,
    endereco.uf_end,
  ];
  await client.query(sql, values);
}

async function insertPaciente(paciente) {
  const client = await connect();
  const sql = `INSERT INTO paciente (nome_pcte, data_nasc_pcte, cpf_pcte, rg_pcte, 
               cns_pcte, tel_pcte, cel_pcte) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_pcte;`;
  const values = [
    paciente.nome_pcte,
    paciente.data_nasc_pcte,  
    paciente.cpf_pcte,
    paciente.rg_pcte,
    paciente.cns_pcte, 
    paciente.tel_pcte,
    paciente.cel_pcte
  ];
  await client.query(sql, values);
}



async function insertResponsavel(responsavel) {
  const client = await connect();
  const sql = `INSERT INTO responsavel (nome_resp, parentesco_pcte, id_escolaridade, 
               id_estado_civil, renda_resp, id_pcte) VALUES ($1, $2, $3, $4, $5, $6);`;
  const values = [
    responsavel.nome_resp,
    responsavel.parentesco_pcte,
    responsavel.id_escolaridade,
    responsavel.id_estado_civil,
    responsavel.renda_resp,
    responsavel.id_pcte
  ];
  await client.query(sql, values);
}

async function insertQuimioterapia(quimio) {
  const client = await connect();
  const sql = `INSERT INTO pcte_quimio (data_inicio, data_fim, protocolo, 
               observacoes, id_pcte) VALUES ($1, $2, $3, $4, $5);`;
  const values = [
    quimio.data_inicio,
    quimio.data_fim,
    quimio.protocolo,
    quimio.observacoes,
    quimio.id_pcte
  ];
  await client.query(sql, values);
}

async function insertRadioterapia(radio) {
  const client = await connect();
  const sql = `INSERT INTO pcte_radio (data_inicio, data_fim, dose_total, 
               fracionamento, local_aplicacao, id_pcte) VALUES ($1, $2, $3, $4, $5, $6);`;
  const values = [
    radio.data_inicio,
    radio.data_fim,
    radio.dose_total,
    radio.fracionamento,
    radio.local_aplicacao,
    radio.id_pcte
  ];
  await client.query(sql, values);
}

async function insertCirurgia(cirurgia) {
  const client = await connect();
  const sql = `INSERT INTO cirurgia (data_cirurgia, tipo_cirurgia, hospital, 
               medico_responsavel, observacoes, id_pcte) VALUES ($1, $2, $3, $4, $5, $6);`;
  const values = [
    cirurgia.data_cirurgia,
    cirurgia.tipo_cirurgia,
    cirurgia.hospital,
    cirurgia.medico_responsavel,
    cirurgia.observacoes,
    cirurgia.id_pcte
  ];
  await client.query(sql, values);
}

async function insertHistoricoSaude(historico) {
  const client = await connect();
  const sql = `INSERT INTO hist_saude (id_pcte, id_doenca, id_cid, 
               data_diagnostico, ativo) VALUES ($1, $2, $3, $4, $5);`;
  const values = [
    historico.id_pcte,
    historico.id_doenca,
    historico.id_cid,
    historico.data_diagnostico,
    historico.ativo
  ];
  await client.query(sql, values);
}

async function insertSituacaoSocioEconomica(situacao) {
  const client = await connect();
  const sql = `INSERT INTO sit_socio_econo (renda_familiar, num_pessoas_casa, 
               beneficio_social, id_inst_ensino, id_pcte) VALUES ($1, $2, $3, $4, $5);`;
  const values = [
    situacao.renda_familiar,
    situacao.num_pessoas_casa,
    situacao.beneficio_social,
    situacao.id_inst_ensino,
    situacao.id_pcte
  ];
  await client.query(sql, values);
}

async function insertUbsReferencia(ubs) {
  const client = await connect();
  const sql = `INSERT INTO ubs_ref (nome_ubs, endereco_ubs, telefone_ubs, 
               responsavel_ubs, id_pcte) VALUES ($1, $2, $3, $4, $5);`;
  const values = [
    ubs.nome_ubs,
    ubs.endereco_ubs,
    ubs.telefone_ubs,
    ubs.responsavel_ubs,
    ubs.id_pcte
  ];
  await client.query(sql, values);
}

async function insertCrasReferencia(cras) {
  const client = await connect();
  const sql = `INSERT INTO cras_ref (nome_cras, endereco_cras, telefone_cras, 
               assistente_social, id_pcte) VALUES ($1, $2, $3, $4, $5);`;
  const values = [
    cras.nome_cras,
    cras.endereco_cras,
    cras.telefone_cras,
    cras.assistente_social,
    cras.id_pcte
  ];
  await client.query(sql, values);
}

module.exports = { insertPaciente, insertEnderecoPaciente, insertResponsavel,
                   insertQuimioterapia, insertRadioterapia, insertCirurgia, 
                   insertHistoricoSaude, insertSituacaoSocioEconomica, 
                   insertUbsReferencia, insertCrasReferencia, connect };

connect();
