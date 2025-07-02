async function connect() {
    if (global.connection) {
        return global.connection;
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
    global.connection = pool;
    return pool; 
}

async function insertEnderecoPaciente(endereco) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO end_pcte (rua_end, num_end, complemento_end, 
                 cidade_end, bairro_end, cep_end, uf_end, ponto_ref_end) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_end;`;
    const values = [
      endereco.endereco || null,
      endereco.numero || null,
      endereco.complemento || null,
      endereco.cidade || null,
      endereco.bairro || null,
      endereco.cep || null,
      endereco.estado || null,
      endereco.ponto_referencia || null
    ];
    const result = await client.query(sql, values);
    return result.rows[0].id_end;
  } finally {
    client.release();
  }
}

async function insertPaciente(paciente, id_end) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO paciente (nome_pcte, data_nasc_pcte, data_cadast_pcte,
                 cpf_pcte, cns_pcte, rg_pcte, 
                 tel_pcte, cel_pcte, contato_emergencia, id_end) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id_pcte;`;
    const values = [
      paciente.paciente,
      paciente.data_nascimento,
      new Date(),  
      paciente.cpf,
      paciente.cartao_sus || null, 
      paciente.rg || null,
      paciente.telefone1,
      paciente.telefone2 || paciente.telefone1,
      paciente.contato_emergencia || null,
      id_end
    ];
    const result = await client.query(sql, values);
    return result.rows[0].id_pcte;
  } finally {
    client.release();
  }
}

async function insertEscolaridade(escolaridade) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO escolaridade (desc_esc) VALUES ($1) RETURNING id_esc`;
    let ids = [];
    // Sempre insere, mesmo que vazio
    const resultPaciente = await client.query(sql, [escolaridade.escolaridade_paciente || null]);
    ids.push(resultPaciente.rows[0].id_esc);

    const resultMae = await client.query(sql, [escolaridade.mae_escolaridade || null]);
    ids.push(resultMae.rows[0].id_esc);

    const resultPai = await client.query(sql, [escolaridade.pai_escolaridade || null]);
    ids.push(resultPai.rows[0].id_esc);

    const resultOutro = await client.query(sql, [escolaridade.outro_escolaridade || null]);
    ids.push(resultOutro.rows[0].id_esc);

    return ids;
  } finally {
    client.release();
  }
}

async function inst_ensino(instituicao, id_esc) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO inst_ensino (id_esc, nome_inst, tipo_inst, municipio_inst) 
                 VALUES ($1, $2, $3, $4) RETURNING id_inst_ens`;
    const values = [
      id_esc || null,
      instituicao.instituicao_ensino || null,
      instituicao.tipo_instituicao || null,
      instituicao.municipio_ensino || null
    ];
    const result = await client.query(sql, values);
    return result.rows[0].id_inst_ens;
  } finally {
    client.release();
  }
}

async function insertQuimioterapia(quimios, id_pcte) {
  if (!quimios || !Array.isArray(quimios.profissional) || quimios.profissional.length === 0) {
    return;
  }
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO pcte_quimio (nome_prof_quimio, crm_prof_quimio, local_quimio, 
      data_ini, data_ultima_sessao, id_pcte) VALUES ($1, $2, $3, $4, $5, $6);`;
    for (let i = 0; i < quimios.profissional.length; i++) {
      const values = [
        quimios.profissional[i] || null,
        quimios.crm[i] || null,
        quimios.local[i] || null,
        quimios.inicio[i] || null,
        quimios.fim[i] || null,
        id_pcte || null
      ];
      await client.query(sql, values);
    }
  } finally {
    client.release();
  }
}

async function insertRadioterapia(radios, id_pcte) {
  if (!radios || !Array.isArray(radios.profissional) || radios.profissional.length === 0) {
    return;
  }
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO pcte_radio (nome_prof_radio, crm_prof_radio, local_radio, 
                 data_ini, data_ultima_sessao, id_pcte) VALUES ($1, $2, $3, $4, $5, $6);`;
    for (let i = 0; i < radios.profissional.length; i++) {
      const values = [
        radios.profissional[i] || null,
        radios.crm[i] || null,
        radios.local[i] || null,
        radios.inicio[i] || null,
        radios.fim[i] || null,
        id_pcte || null
      ];
      await client.query(sql, values);
    }
  } finally {
    client.release();
  }
}

async function insertCirurgia(cirurgias, id_pcte) {
  if (!cirurgias || !Array.isArray(cirurgias.profissional) || cirurgias.profissional.length === 0) {
    return;
  }
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO cirurgia (tipo_cirurgia, data_inic_cirurgia, data_fim_cirurgia, hosp_cirurgia, nome_prof, crm_prof, id_pcte) VALUES ($1, $2, $3, $4, $5, $6, $7);`;
    for (let i = 0; i < cirurgias.profissional.length; i++) {
      const values = [
        cirurgias.tipo[i] || null,
        cirurgias.inicio[i] || null,
        cirurgias.fim[i] || null,
        cirurgias.local[i] || null,
        cirurgias.profissional[i] || null,
        cirurgias.crm[i] || null,
        id_pcte || null
      ];
      await client.query(sql, values);
    }
  } finally {
    client.release();
  }
}

async function insertEstadoCivil(dados) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO estado_civil (denom_estado_civil) VALUES ($1) RETURNING id_est_civil;`;
    let ids = [];

    const resultMae = await client.query(sql, [dados.mae_estado_civil || null]);
    ids.push(resultMae.rows[0].id_est_civil);

    const resultPai = await client.query(sql, [dados.pai_estado_civil || null]);
    ids.push(resultPai.rows[0].id_est_civil);

    const resultOutro = await client.query(sql, [dados.outro_estado_civil || null]);
    ids.push(resultOutro.rows[0].id_est_civil);

    return ids;
  } finally {
    client.release();
  }
};

async function insertResponsavel(responsavel, ids_esc, ids_est_civil, id_pcte, id_end) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO responsavel 
      (resp_principal, nome_resp, cpf_resp, rg_resp, data_nasc_resp, natur_resp, tel_cel_responsavel,
      situacao_resp, obs_resp, renda_resp, id_esc, id_est_civil, id_pcte, id_end, parent_resp) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) returning id_responsavel;`;

    let idx = 0;
    let ids = [];

    // Mãe
    const resultMae = await client.query(sql, [
      responsavel.mae_responsavel_principal || null,
      responsavel.mae_nome || null,
      responsavel.mae_cpf || null,
      responsavel.mae_rg || null,
      responsavel.mae_data_nascimento || null,
      responsavel.mae_naturalidade || null,
      responsavel.mae_telefone || null,
      responsavel.mae_ocupacao || null,
      responsavel.mae_observacao || null,
      responsavel.mae_salario || null,
      ids_esc[idx] || null,         
      ids_est_civil[idx] || null,   
      id_pcte || null,
      id_end || null,
      responsavel.mae_parentesco || null
    ]);
    ids.push(resultMae.rows[0].id_responsavel);
    idx++;

    // Pai
    const resultPai = await client.query(sql, [
      responsavel.pai_responsavel_principal || null,
      responsavel.pai_nome || null,
      responsavel.pai_cpf || null,
      responsavel.pai_rg || null,
      responsavel.pai_data_nascimento || null,
      responsavel.pai_naturalidade || null,
      responsavel.pai_telefone || null,
      responsavel.pai_ocupacao || null,
      responsavel.pai_observacao || null,
      responsavel.pai_salario || null,
      ids_esc[idx] || null,       
      ids_est_civil[idx] || null,   
      id_pcte || null,
      id_end || null,
      responsavel.pai_parentesco || null
    ]);
    ids.push(resultPai.rows[0].id_responsavel);
    idx++;

    // Outro
    const resultOutro = await client.query(sql, [
      responsavel.outro_responsavel_principal || null,
      responsavel.outro_nome || null,
      responsavel.outro_cpf || null,
      responsavel.outro_rg || null,
      responsavel.outro_data_nascimento || null,
      responsavel.outro_naturalidade || null,
      responsavel.outro_telefone || null,
      responsavel.outro_ocupacao || null,
      responsavel.outro_responsavel_observacao || null,
      responsavel.outro_salario || null,
      ids_esc[idx] || null,        
      ids_est_civil[idx] || null,   
      id_pcte || null,
      id_end || null,
      responsavel.outro_parentesco || null
    ]);
    ids.push(resultOutro.rows[0].id_responsavel);

    return ids;
  } finally {
    client.release();
  }
}

async function insertHistoricoSaude(historico, id_pcte) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    // Suporte a múltiplos diagnósticos e medicamentos
    const diagnosticos = historico.diagnosticos || {};
    const nomes = diagnosticos.nome || [];
    const cids = diagnosticos.cid || [];
    const descricoes = diagnosticos.descricao || [];
    const observacoes = diagnosticos.observacao || [];

    const medicamentos = historico.medicamentos || {};
    const medic_uso = medicamentos.nome || [];
    const medic_dosagem = medicamentos.dosagem || [];
    const medic_freq = medicamentos.frequencia || [];
    const med_obs = medicamentos.observacao || [];

    // Descobre o maior tamanho dos arrays
    const max = Math.max(
      nomes.length, cids.length, descricoes.length, observacoes.length,
      medic_uso.length, medic_dosagem.length, medic_freq.length, med_obs.length
    );

    const sql = `INSERT INTO pcte_diag (desc_diag, nome_diag, cid_diag, obs_diag, id_pcte, medic_uso, medic_dosagem, medic_freq, med_obs)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_pcte_diag;`;

    let ids = [];
    for (let i = 0; i < max; i++) {
      const values = [
        descricoes[i] || null,
        nomes[i] || null,
        cids[i] || null,
        observacoes[i] || null,
        id_pcte || null,
        medic_uso[i] || null,
        medic_dosagem[i] || null,
        medic_freq[i] || null,
        med_obs[i] || null
      ];
      const result = await client.query(sql, values);
      ids.push(result.rows[0].id_pcte_diag);
    }
    return ids;
  } finally {
    client.release();
  }
}

async function insertUbsReferencia(dados) {
  const pool = await connect();
  const client = await pool.connect();
  try {
  const sql = `INSERT INTO ubs_ref (municipio_ubs_ref, bairro_ubs_ref, 
               obs_ubs_ref) VALUES ($1, $2, $3)  RETURNING id_unidade;`;
  const values = [
    dados.ubs_municipio || null,
    dados.ubs_bairro || null,
    dados.ubs_observacao || null
  ];
  const result = await client.query(sql, values);
  return result.rows[0].id_unidade;
  }
  finally {
    client.release();
  }
}

async function insertCrasReferencia(dados) {
  const pool = await connect();
  const client = await pool.connect();
  try {
  const sql = `INSERT INTO cras_ref (municipio_cras_ref, bairro_cras_ref, obs_cras_ref)
               VALUES ($1, $2, $3) RETURNING id_cras;`;
  const values = [
    dados.cras_municipio || null,
    dados.cras_bairro || null,
    dados.cras_observacao || null
  ];
  const result = await client.query(sql, values);
  return result.rows[0].id_cras;
  }
  finally {
    client.release();
  }
}

async function locaisHist(id_unidade, id_cras) {
  const pool = await connect();
  const client = await pool.connect();
  try {
  const sql = `INSERT INTO locais_hist (id_ubs, id_cras) VALUES ($1, $2);`;
  const values = [
    id_unidade || null,
    id_cras || null
  ];
  await client.query(sql, values);
  }
  finally {
    client.release();
  }
}

async function insertHistoricoSaudeResponsavel(diagnosticosFamiliares, id_pcte) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    // Suporte a múltiplos diagnósticos familiares
    const nomes = diagnosticosFamiliares.nome 
    const cids = diagnosticosFamiliares.cid 
    const descricoes = diagnosticosFamiliares.descricao
    const observacoes = diagnosticosFamiliares.observacao
    const parentescos = diagnosticosFamiliares.parentesco

    const max = Math.max(nomes.length, cids.length, descricoes.length, observacoes.length, parentescos.length);

    const sql = `INSERT INTO resp_diag (desc_diag, nome_diag, cid_diag, obs_diag, parestesco_diag, id_pcte)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_resp_diag;`;

    for (let i = 0; i < max; i++) {
      const values = [
        descricoes[i] || null,
        nomes[i] || null,
        cids[i] || null,
        observacoes[i] || null,
        parentescos[i] || null,
        id_pcte || null
      ];
      await client.query(sql, values);
    }
  } finally {
    client.release();
  }
}

async function insertSituacaoSocioEconomica(situacaoEcon, id_inst_ensino, id_pcte) {
  const pool = await connect();
  const client = await pool.connect();
  try {
  const sql = `INSERT INTO sit_socio_econo (bolsa_bpc, remuneracao, id_inst_ensino, id_pcte) VALUES ($1, $2, $3, $4);`;
  const values = [
    situacaoEcon.valor_bpc || null,
    situacaoEcon.renda_familiar || null,
    id_inst_ensino || null,
    id_pcte || null
  ];
  await client.query(sql, values);
  }
  finally {
    client.release();
  }
}

async function insertAdquirirCasa(adquiricao) {
  const pool = await connect();
  const client = await pool.connect();
  try {
  const sql = `INSERT INTO form_adq_casa (forma_adq_casa) 
  VALUES ($1) RETURNING id_adq_casa;`;
  const values = [
    adquiricao.situacao_habitacional || null
  ];
  const result = await client.query(sql, values);
  return result.rows[0].id_adq_casa;
  }
  finally {
    client.release();
  }
}

async function insertCaracteristicasCasa(caract) {
  const pool = await connect();
  const client = await pool.connect();
  try {
  const sql = `INSERT INTO habit_san_caract (nome_caract) 
  VALUES ($1)  RETURNING id_caract;`;
  const values = [caract.material_habitacao || null];
  const result = await client.query(sql, values);
  return result.rows[0].id_caract;
  }
  finally {
    client.release();
  }
}

async function insertSituacaoHabitacional(situacaoHibat, id_pcte, id_adq_casa, id_caract) {
  const pool = await connect();
  const client = await pool.connect();
  try {
  const sql = `INSERT INTO sit_habit_san (num_comodos, id_pcte, id_adq_casa, id_caract, num_pessoas_casa) VALUES ($1, $2, $3, $4, $5);`;
  const values = [
    situacaoHibat.comodos || null,
    id_pcte || null,
    id_adq_casa || null,
    id_caract || null,
    situacaoHibat.pessoas_casa || null
  ];
  await client.query(sql, values);
  }
  finally {
    client.release();
  }
}

async function getPacientes() {
  const pool = await connect();
  const client = await pool.connect();
  try {
    // Busca pacientes, diagnóstico principal e data do último tratamento (fim mais recente de quimio, radio ou cirurgia)
    const sql = `SELECT p.id_pcte as prontuario, p.nome_pcte as nome, p.cpf_pcte as cpf, p.data_nasc_pcte,
                        (SELECT nome_diag FROM pcte_diag d WHERE d.id_pcte = p.id_pcte ORDER BY d.id_pcte_diag ASC LIMIT 1) as diagnostico,
                        GREATEST(
                          COALESCE((SELECT MAX(data_ultima_sessao) FROM pcte_quimio q WHERE q.id_pcte = p.id_pcte), '1900-01-01'),
                          COALESCE((SELECT MAX(data_ultima_sessao) FROM pcte_radio r WHERE r.id_pcte = p.id_pcte), '1900-01-01'),
                          COALESCE((SELECT MAX(data_fim_cirurgia) FROM cirurgia c WHERE c.id_pcte = p.id_pcte), '1900-01-01')
                        ) as ultimo_tratamento
                 FROM paciente p ORDER BY p.id_pcte DESC`;
    const result = await client.query(sql);
    const pacientes = result.rows.map(row => {
      let idade = '';
      if (row.data_nasc_pcte) {
        const nasc = new Date(row.data_nasc_pcte);
        const hoje = new Date();
        let anos = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) anos--;
        if (anos < 1) {
          let meses = (hoje.getFullYear() - nasc.getFullYear()) * 12 + (hoje.getMonth() - nasc.getMonth());
          if (hoje.getDate() < nasc.getDate()) meses--;
          meses = Math.max(meses, 0);
          idade = meses + (meses === 1 ? ' mês' : ' meses');
        } else {
          idade = anos + (anos === 1 ? ' ano' : ' anos');
        }
      }
      let ultimo_tratamento = '';
      if (row.ultimo_tratamento && row.ultimo_tratamento.toISOString) {
        const data = new Date(row.ultimo_tratamento);
        if (data.getFullYear() > 1900) {
          ultimo_tratamento = data.toLocaleDateString('pt-BR');
        }
      }
      return {
        prontuario: row.prontuario,
        nome: row.nome,
        cpf: row.cpf,
        idade,
        diagnostico: row.diagnostico || '',
        ultimo_tratamento,
      };
    });
    return pacientes;
  } finally {
    client.release();
  }
}

async function getTotalPacientes() {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT COUNT(*) AS total FROM paciente');
    return parseInt(result.rows[0].total, 10);
  } finally {
    client.release();
  }
}

async function getCadastrosHoje() {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT COUNT(*) AS total FROM paciente WHERE data_cadast_pcte::date = CURRENT_DATE");
    return parseInt(result.rows[0].total, 10);
  } finally {
    client.release();
  }
}

async function getCadastrosSemana() {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT COUNT(*) AS total FROM paciente WHERE data_cadast_pcte >= date_trunc('week', CURRENT_DATE)");
    return parseInt(result.rows[0].total, 10);
  } finally {
    client.release();
  }
}

async function getUltimosPacientes() {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT nome_pcte, data_cadast_pcte FROM paciente ORDER BY data_cadast_pcte DESC, id_pcte DESC LIMIT 3');
    return result.rows;
  } finally {
    client.release();
  }
}

module.exports = { insertEnderecoPaciente,
                   insertPaciente, insertEscolaridade, inst_ensino,
                   insertQuimioterapia, insertRadioterapia, insertCirurgia,
                   insertEstadoCivil, insertResponsavel, insertHistoricoSaude,
                   insertUbsReferencia, insertCrasReferencia, locaisHist,
                   insertHistoricoSaudeResponsavel, insertSituacaoSocioEconomica,
                   insertAdquirirCasa, insertCaracteristicasCasa, insertSituacaoHabitacional,
                   getPacientes,
                   getTotalPacientes,
                   getCadastrosHoje,
                   getCadastrosSemana,
                   getUltimosPacientes};
connect();
