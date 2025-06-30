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
               cidade_end, bairro_end, cep_end, uf_end, ponto_ref_end) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_end;`;
  const values = [
    endereco.endereco,
    endereco.numero,
    endereco.complemento,
    endereco.cidade,
    endereco.bairro,
    endereco.cep,
    endereco.estado,
    endereco.ponto_referencia
  ];
  const result = await client.query(sql, values);
  return result.rows[0].id_end;
}

async function insertPaciente(paciente, id_end) {
  const client = await connect();
  const sql = `INSERT INTO paciente (nome_pcte, data_nasc_pcte, data_cadast_pcte,
               cpf_pcte, cns_pcte, rg_pcte, 
               tel_pcte, cel_pcte, contato_emergencia, id_end) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id_pcte;`;
  const values = [
    paciente.paciente,
    paciente.data_nascimento,
    data_cadastro = new Date(),  
    paciente.cpf,
    paciente.cartao_sus, 
    paciente.rg,
    paciente.telefone1,
    paciente.telefone2,
    paciente.contato_emergencia,
    id_end
  ];
  const result = await client.query(sql, values);
  return result.rows[0].id_pcte;
}

async function insertEscolaridade(escolaridade) {
  const client = await connect();
  const sql = `INSERT INTO escolaridade (desc_esc) VALUES ($1) RETURNING id_esc`;
  let ids = [];

  if (escolaridade.escolaridade_paciente) {
    const result = await client.query(sql, [escolaridade.escolaridade_paciente]);
    ids.push(result.rows[0].id_esc);
  }
  if (escolaridade.mae_escolaridade) {
    const result = await client.query(sql, [escolaridade.mae_escolaridade]);
    ids.push(result.rows[0].id_esc);
  }
  if (escolaridade.pai_escolaridade) {
    const result = await client.query(sql, [escolaridade.pai_escolaridade]);
    ids.push(result.rows[0].id_esc);
  }
  if (escolaridade.outro_escolaridade) {
    const result = await client.query(sql, [escolaridade.outro_escolaridade]);
    ids.push(result.rows[0].id_esc);
  }

  return ids;
}

async function inst_ensino(instituicao, id_esc) {
  const client = await connect();
  const sql = `INSERT INTO inst_ensino (id_esc, nome_inst, tipo_inst, municipio_inst) 
               VALUES ($1, $2, $3, $4) RETURNING id_inst_ens`;
  const values = [
    id_esc,
    instituicao.instituicao_ensino,
    instituicao.tipo_instituicao,
    instituicao.municipio_ensino
  ];
  const result = await client.query(sql, values);
  return result.rows[0].id_inst_ens;
}

async function insertQuimioterapia(quimios, id_pcte) {
  if (!quimios || !Array.isArray(quimios.profissional) || quimios.profissional.length === 0) {
    return; // Não faz nada se não houver quimio
  }
  const client = await connect();
  const sql = `INSERT INTO pcte_quimio (nome_prof_quimio, crm_prof_quimio, local_quimio, 
    data_ini, data_ultima_sessao, id_pcte) VALUES ($1, $2, $3, $4, $5, $6);`;

  for (let i = 0; i < quimios.profissional.length; i++) {
    const values = [
      quimios.profissional[i],
      quimios.crm[i],
      quimios.local[i],
      quimios.inicio[i] || null,
      quimios.fim[i] || null,
      id_pcte
    ];
    await client.query(sql, values);
  }
}

async function insertRadioterapia(radios, id_pcte) {
  if (!radios || !Array.isArray(radios.profissional) || radios.profissional.length === 0) {
    return;
  }
  const client = await connect();
  const sql = `INSERT INTO pcte_radio (nome_prof_radio, crm_prof_radio, local_radio, 
               data_ini, data_ultima_sessao, id_pcte) VALUES ($1, $2, $3, $4, $5, $6);`;

  for (let i = 0; i < radios.profissional.length; i++) {
    const values = [
      radios.profissional[i],
      radios.crm[i],
      radios.local[i],
      radios.inicio[i] || null,
      radios.fim[i] || null,
      id_pcte
    ];
    await client.query(sql, values);
  }
}

async function insertCirurgia(cirurgias, id_pcte) {
  if (!cirurgias || !Array.isArray(cirurgias.profissional) || cirurgias.profissional.length === 0) {
    return;
  }
  const client = await connect();
  const sql = `INSERT INTO cirurgia (nome_prof, crm_prof, data_inic_cirurgia, 
               data_fim_cirurgia, tipo_cirurgia, hosp_cirurgia, id_pcte) VALUES ($1, $2, $3, $4, $5, $6, $7);`;

  for (let i = 0; i < cirurgias.profissional.length; i++) {
    const values = [
      cirurgias.profissional[i],
      cirurgias.crm[i],
      cirurgias.inicio[i] || null,
      cirurgias.fim[i] || null,
      cirurgias.tipo[i],
      cirurgias.local[i],
      id_pcte
    ];
    await client.query(sql, values);
  }
}

async function insertEstadoCivil(dados) {
  const client = await connect();
  const sql = `INSERT INTO estado_civil (denom_estado_civil) VALUES ($1) RETURNING id_est_civil;`;
  let ids = [];

  if (dados.mae_nome && dados.mae_estado_civil) {
    const result = await client.query(sql, [dados.mae_estado_civil]);
    ids.push(result.rows[0].id_est_civil);
  }
  if (dados.pai_nome && dados.pai_estado_civil) {
    const result = await client.query(sql, [dados.pai_estado_civil]);
    ids.push(result.rows[0].id_est_civil);
  }
  if (dados.outro_nome && dados.outro_estado_civil) {
    const result = await client.query(sql, [dados.outro_estado_civil]);
    ids.push(result.rows[0].id_est_civil);
  }
  return ids;
}

async function insertResponsavel(responsavel, ids_esc, ids_est_civil, id_pcte, id_end) {
  const client = await connect();
  const sql = `INSERT INTO responsavel 
    (resp_principal, nome_resp, cpf_resp, rg_resp, data_nasc_resp, natur_resp, tel_cel_responsavel,
    situacao_resp, obs_resp, renda_resp, id_esc, id_est_civil, id_pcte, id_end, parent_resp) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) returning id_responsavel;`;

  let idx = 0;
  let ids = [];

  // Mãe
  if (responsavel.mae_nome) {
    const result = await client.query(sql, [
      responsavel.mae_responsavel_principal,
      responsavel.mae_nome,
      responsavel.mae_cpf,
      responsavel.mae_rg,
      responsavel.mae_data_nascimento,
      responsavel.mae_naturalidade,
      responsavel.mae_telefone,
      responsavel.mae_ocupacao,
      responsavel.mae_observacao,
      responsavel.mae_salario,
      ids_esc[idx],         // id escolaridade da mãe
      ids_est_civil[idx],   // id estado civil da mãe
      id_pcte,
      id_end,
      responsavel.mae_parentesco || null
    ]);
    idx++;
    ids.push(result.rows[0].id_responsavel);
  }

  // Pai
  if (responsavel.pai_nome) {
    const result = await client.query(sql, [
      responsavel.pai_responsavel_principal,
      responsavel.pai_nome,
      responsavel.pai_cpf,
      responsavel.pai_rg,
      responsavel.pai_data_nascimento,
      responsavel.pai_naturalidade,
      responsavel.pai_telefone,
      responsavel.pai_ocupacao,
      responsavel.pai_observacao,
      responsavel.pai_salario,
      ids_esc[idx],         // id escolaridade do pai
      ids_est_civil[idx],   // id estado civil do pai
      id_pcte,
      id_end,
      responsavel.pai_parentesco || null
    ]);
    idx++;
    ids.push(result.rows[0].id_responsavel);
  }

  // Outro
  if (responsavel.outro_nome) {
    const result = await client.query(sql, [
      responsavel.outro_responsavel_principal,
      responsavel.outro_nome,
      responsavel.outro_cpf,
      responsavel.outro_rg,
      responsavel.outro_data_nascimento,
      responsavel.outro_naturalidade,
      responsavel.outro_telefone,
      responsavel.outro_ocupacao,
      responsavel.outro_responsavel_observacao,
      responsavel.outro_salario,
      ids_esc[idx],         // id escolaridade do outro
      ids_est_civil[idx],   // id estado civil do outro
      id_pcte,
      id_end,
      responsavel.outro_parentesco || null
    ]);
    idx++;
    ids.push(result.rows[0].id_responsavel);
  }

  return ids;
}

async function insertHistoricoSaude(historico, id_pcte) {
  const client = await connect();
  const sql = `INSERT INTO pcte_diag (id_pcte, nome_diag, cid_diag, 
               desc_diag, obs_diag, medic_uso, medic_dosagem, medic_freq, med_obs)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id_pcte_diag;`;
  const values = [
    id_pcte,
    historico.nome_1,
    historico.cid_1,
    historico.descricao_1,
    historico.observacao_1,
    historico.medicamento_nome_1,
    historico.medicamento_dosagem_1,
    historico.medicamento_frequencia_1,
    historico.medicamento_observacao_1
  ];
  const result = await client.query(sql, values);
  return result.rows[0].id_pcte_diag;
}

async function insertUbsReferencia(dados) {
  const client = await connect();
  const sql = `INSERT INTO ubs_ref (municipio_ubs_ref, bairro_ubs_ref, 
               obs_ubs_ref) VALUES ($1, $2, $3)  RETURNING id_unidade;`;
  const values = [
    dados.ubs_municipio,
    dados.ubs_bairro,
    dados.ubs_observacao
  ];
  const result = await client.query(sql, values);
  return result.rows[0].id_unidade;
}

async function insertCrasReferencia(dados) {
  const client = await connect();
  const sql = `INSERT INTO cras_ref (municipio_cras_ref, bairro_cras_ref, obs_cras_ref)
               VALUES ($1, $2, $3) RETURNING id_cras;`;
  const values = [
    dados.cras_municipio,
    dados.cras_bairro,
    dados.cras_observacao,
  ];
  const result = await client.query(sql, values);
  return result.rows[0].id_cras;
}

async function locaisHist(id_unidade, id_cras) {
  const client = await connect();
  const sql = `INSERT INTO locais_hist (id_unidade, id_cras)
               VALUES ($1, $2);`;
  const values = [
    id_unidade,
    id_cras
  ];
  await client.query(sql, values);
}

async function insertHistoricoSaudeResponsavel(diagnostico, id_resp) {
  const client = await connect();
  const sql = `INSERT INTO resp_diag (desc_diag, nome_diag, cid_diag, 
               obs_diag, parestesco_diag, id_responsavel)
               VALUES ($1, $2, $3, $4, $5, $6) returning id_pcte_diag;`;
  const values = [
    diagnostico.familia_descricao_1,
    diagnostico.familia_1,
    diagnostico.familia_cid_1,
    diagnostico.familia_observacao_1,
    diagnostico.familia_parentesco_1,
    id_resp
  ];
  const result = await client.query(sql, values);
  return result.rows[0].id_pcte_diag;
}

async function insertSituacaoSocioEconomica(situacaoEcon, id_inst_ensino, id_pcte) {
  const client = await connect();
  const sql = `INSERT INTO sit_socio_econo (remuneracao, bolsa_bpc, 
               id_inst_ensino, id_pcte) VALUES ($1, $2, $3, $4);`;
  const values = [
    situacaoEcon.renda_familiar,
    situacaoEcon.valor_bpc,
    id_inst_ensino,
    id_pcte
  ];
  await client.query(sql, values);
}

async function insertAdquirirCasa(adquiricao) {
  const client = await connect();
  const sql = `INSERT INTO form_adq_casa (forma_adq_casa) 
  VALUES ($1) RETURNING id_adq_casa;`;
  const values = [
    adquiricao.situacao_habitacional
  ];
  const result = await client.query(sql, values);
  return result.rows[0].id_adq_casa;
}

async function insertCaracteristicasCasa(caract) {
  const client = await connect();
  const sql = `INSERT INTO habit_san_caract (nome_caract) 
  VALUES ($1)  RETURNING id_caract;`;
  const values = [material_habitacao];
  const result = await client.query(sql, values);
  return result.rows[0].id_caract;
}

async function insertSituacaoHabitacional(situacaoHibat, id_caract, id_pcte, id_adq_casa) {
  const client = await connect();
  const sql = `INSERT INTO sit_habit_san (id_pcte, id_adq_casa, id_caract, 
               num_comodos, num_pessoas_casa) 
               VALUES ($1, $2, $3, $4, $5);`;
  const values = [
    id_pcte,
    id_adq_casa,
    id_caract,
    situacaoHibat.comodos,
    situacaoHibat.pessoas_casa
  ];
  await client.query(sql, values);
}

module.exports = { insertEnderecoPaciente,
                   insertPaciente, insertEscolaridade, inst_ensino,
                   insertQuimioterapia, insertRadioterapia, insertCirurgia,
                   insertEstadoCivil, insertResponsavel, insertHistoricoSaude,
                   insertUbsReferencia, insertCrasReferencia, locaisHist,
                   insertHistoricoSaudeResponsavel, insertSituacaoSocioEconomica,
                   insertAdquirirCasa, insertCaracteristicasCasa, insertSituacaoHabitacional};
connect();
