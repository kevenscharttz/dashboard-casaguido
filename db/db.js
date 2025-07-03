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

function toNullIfEmpty(val) {
  return val === '' ? null : val;
}

async function insertEnderecoPaciente(endereco) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO end_pcte (rua_end, num_end, complemento_end, 
                 cidade_end, bairro_end, cep_end, uf_end, ponto_ref_end) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_end;`;
    const values = [
      toNullIfEmpty(endereco.endereco),
      toNullIfEmpty(endereco.numero),
      toNullIfEmpty(endereco.complemento),
      toNullIfEmpty(endereco.cidade),
      toNullIfEmpty(endereco.bairro),
      toNullIfEmpty(endereco.cep),
      toNullIfEmpty(endereco.estado),
      toNullIfEmpty(endereco.ponto_referencia)
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
      toNullIfEmpty(paciente.paciente),
      toNullIfEmpty(paciente.data_nascimento),
      new Date(),  
      toNullIfEmpty(paciente.cpf),
      toNullIfEmpty(paciente.cartao_sus),
      toNullIfEmpty(paciente.rg),
      toNullIfEmpty(paciente.telefone1),
      toNullIfEmpty(paciente.telefone2 || paciente.telefone1),
      toNullIfEmpty(paciente.contato_emergencia),
      toNullIfEmpty(id_end)
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
    const resultPaciente = await client.query(sql, [toNullIfEmpty(escolaridade.escolaridade_paciente)]);
    ids.push(resultPaciente.rows[0].id_esc);

    const resultMae = await client.query(sql, [toNullIfEmpty(escolaridade.mae_escolaridade)]);
    ids.push(resultMae.rows[0].id_esc);

    const resultPai = await client.query(sql, [toNullIfEmpty(escolaridade.pai_escolaridade)]);
    ids.push(resultPai.rows[0].id_esc);

    const resultOutro = await client.query(sql, [toNullIfEmpty(escolaridade.outro_escolaridade)]);
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
        toNullIfEmpty(quimios.profissional[i]),
        toNullIfEmpty(quimios.crm[i]),
        toNullIfEmpty(quimios.local[i]),
        toNullIfEmpty(quimios.inicio[i]),
        toNullIfEmpty(quimios.fim[i]),
        toNullIfEmpty(id_pcte)
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
        toNullIfEmpty(radios.profissional[i]),
        toNullIfEmpty(radios.crm[i]),
        toNullIfEmpty(radios.local[i]),
        toNullIfEmpty(radios.inicio[i]),
        toNullIfEmpty(radios.fim[i]),
        toNullIfEmpty(id_pcte)
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
        toNullIfEmpty(cirurgias.tipo[i]),
        toNullIfEmpty(cirurgias.inicio[i]),
        toNullIfEmpty(cirurgias.fim[i]),
        toNullIfEmpty(cirurgias.local[i]),
        toNullIfEmpty(cirurgias.profissional[i]),
        toNullIfEmpty(cirurgias.crm[i]),
        toNullIfEmpty(id_pcte)
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

async function buscarPacientes(termo) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `SELECT p.id_pcte, p.nome_pcte, p.cpf_pcte, p.data_nasc_pcte, p.data_cadast_pcte
                 FROM paciente p
                 WHERE LOWER(p.nome_pcte) LIKE LOWER($1) OR p.cpf_pcte LIKE $2
                 ORDER BY p.data_cadast_pcte DESC, p.id_pcte DESC`;
    const values = [`%${termo}%`, `%${termo}%`];
    const result = await client.query(sql, values);
    return result.rows;
  } finally {
    client.release();
  }
}

async function deletarPaciente(id) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    // Remove todas as dependências antes do paciente
    await client.query('DELETE FROM pcte_diag WHERE id_pcte = $1', [id]);
    await client.query('DELETE FROM cirurgia WHERE id_pcte = $1', [id]);
    await client.query('DELETE FROM pcte_quimio WHERE id_pcte = $1', [id]);
    await client.query('DELETE FROM pcte_radio WHERE id_pcte = $1', [id]);
    await client.query('DELETE FROM resp_diag WHERE id_pcte = $1', [id]);
    await client.query('DELETE FROM sit_socio_econo WHERE id_pcte = $1', [id]);
    await client.query('DELETE FROM responsavel WHERE id_pcte = $1', [id]);
    await client.query('DELETE FROM sit_habit_san WHERE id_pcte = $1', [id]);
    // Por fim, remove o paciente
    await client.query('DELETE FROM paciente WHERE id_pcte = $1', [id]);
    return true;
  } finally {
    client.release();
  }
}

async function getPacientePorId(id) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    // Dados básicos do paciente
    const result = await client.query('SELECT * FROM paciente WHERE id_pcte = $1', [id]);
    if (!result.rows.length) return null;
    const paciente = result.rows[0];

    // Endereço
    let endereco = null;
    if (paciente.id_end) {
      const endRes = await client.query('SELECT * FROM end_pcte WHERE id_end = $1', [paciente.id_end]);
      endereco = endRes.rows[0] || {};
    }

    // Quimioterapias
    const quimioRes = await client.query('SELECT * FROM pcte_quimio WHERE id_pcte = $1', [id]);
    paciente.quimio = {
      id_quimio: quimioRes.rows.map(r => r.id_quimio),
      profissional: quimioRes.rows.map(r => r.nome_prof_quimio),
      crm: quimioRes.rows.map(r => r.crm_prof_quimio),
      local: quimioRes.rows.map(r => r.local_quimio),
      inicio: quimioRes.rows.map(r => r.data_ini ? r.data_ini.toISOString().substr(0,10) : ''),
      fim: quimioRes.rows.map(r => r.data_ultima_sessao ? r.data_ultima_sessao.toISOString().substr(0,10) : '')
    };

    // Radioterapias
    const radioRes = await client.query('SELECT * FROM pcte_radio WHERE id_pcte = $1', [id]);
    paciente.radio = {
      id_radio: radioRes.rows.map(r => r.id_radio),
      profissional: radioRes.rows.map(r => r.nome_prof_radio),
      crm: radioRes.rows.map(r => r.crm_prof_radio),
      local: radioRes.rows.map(r => r.local_radio),
      inicio: radioRes.rows.map(r => r.data_ini ? r.data_ini.toISOString().substr(0,10) : ''),
      fim: radioRes.rows.map(r => r.data_ultima_sessao ? r.data_ultima_sessao.toISOString().substr(0,10) : '')
    };

    // Cirurgias
    const cirurgiaRes = await client.query('SELECT * FROM cirurgia WHERE id_pcte = $1', [id]);
    paciente.cirurgia = {
      id_cirurgia: cirurgiaRes.rows.map(r => r.id_cirurgia),
      tipo: cirurgiaRes.rows.map(r => r.tipo_cirurgia),
      inicio: cirurgiaRes.rows.map(r => r.data_inic_cirurgia ? r.data_inic_cirurgia.toISOString().substr(0,10) : ''),
      fim: cirurgiaRes.rows.map(r => r.data_fim_cirurgia ? r.data_fim_cirurgia.toISOString().substr(0,10) : ''),
      local: cirurgiaRes.rows.map(r => r.hosp_cirurgia),
      profissional: cirurgiaRes.rows.map(r => r.nome_prof),
      crm: cirurgiaRes.rows.map(r => r.crm_prof)
    };

    // Diagnósticos e medicamentos
    const diagRes = await client.query('SELECT * FROM pcte_diag WHERE id_pcte = $1', [id]);
    paciente.diagnosticos = {
      id_pcte_diag: diagRes.rows.map(r => r.id_pcte_diag),
      nome: diagRes.rows.map(r => r.nome_diag),
      cid: diagRes.rows.map(r => r.cid_diag),
      descricao: diagRes.rows.map(r => r.desc_diag),
      observacao: diagRes.rows.map(r => r.obs_diag)
    };
    paciente.medicamentos = {
      nome: diagRes.rows.map(r => r.medic_uso),
      dosagem: diagRes.rows.map(r => r.medic_dosagem),
      frequencia: diagRes.rows.map(r => r.medic_freq),
      observacao: diagRes.rows.map(r => r.med_obs)
    };

    // Diagnósticos familiares
    const diagFamRes = await client.query('SELECT * FROM resp_diag WHERE id_pcte = $1', [id]);
    paciente.diagnosticosFamiliares = {
      id_resp_diag: diagFamRes.rows.map(r => r.id_resp_diag),
      nome: diagFamRes.rows.map(r => r.nome_diag),
      cid: diagFamRes.rows.map(r => r.cid_diag),
      descricao: diagFamRes.rows.map(r => r.desc_diag),
      observacao: diagFamRes.rows.map(r => r.obs_diag),
      parentesco: diagFamRes.rows.map(r => r.parestesco_diag)
    };

    // Responsáveis
    const respRes = await client.query('SELECT * FROM responsavel WHERE id_pcte = $1 ORDER BY id_responsavel ASC', [id]);
    const responsaveis = respRes.rows;
    paciente.responsavel = {
      mae_nome: responsaveis[0]?.nome_resp || '',
      mae_cpf: responsaveis[0]?.cpf_resp || '',
      mae_rg: responsaveis[0]?.rg_resp || '',
      mae_data_nascimento: responsaveis[0]?.data_nasc_resp ? responsaveis[0].data_nasc_resp.toISOString().substr(0,10) : '',
      mae_naturalidade: responsaveis[0]?.natur_resp || '',
      mae_telefone: responsaveis[0]?.tel_cel_responsavel || '',
      mae_ocupacao: responsaveis[0]?.situacao_resp || '',
      mae_observacao: responsaveis[0]?.obs_resp || '',
      mae_salario: responsaveis[0]?.renda_resp || '',
      mae_parentesco: responsaveis[0]?.parent_resp || '',
      mae_responsavel_principal: responsaveis[0]?.resp_principal || false,

      pai_nome: responsaveis[1]?.nome_resp || '',
      pai_cpf: responsaveis[1]?.cpf_resp || '',
      pai_rg: responsaveis[1]?.rg_resp || '',
      pai_data_nascimento: responsaveis[1]?.data_nasc_resp ? responsaveis[1].data_nasc_resp.toISOString().substr(0,10) : '',
      pai_naturalidade: responsaveis[1]?.natur_resp || '',
      pai_telefone: responsaveis[1]?.tel_cel_responsavel || '',
      pai_ocupacao: responsaveis[1]?.situacao_resp || '',
      pai_observacao: responsaveis[1]?.obs_resp || '',
      pai_salario: responsaveis[1]?.renda_resp || '',
      pai_parentesco: responsaveis[1]?.parent_resp || '',
      pai_responsavel_principal: responsaveis[1]?.resp_principal || false,

      outro_nome: responsaveis[2]?.nome_resp || '',
      outro_cpf: responsaveis[2]?.cpf_resp || '',
      outro_rg: responsaveis[2]?.rg_resp || '',
      outro_data_nascimento: responsaveis[2]?.data_nasc_resp ? responsaveis[2].data_nasc_resp.toISOString().substr(0,10) : '',
      outro_naturalidade: responsaveis[2]?.natur_resp || '',
      outro_telefone: responsaveis[2]?.tel_cel_responsavel || '',
      outro_ocupacao: responsaveis[2]?.situacao_resp || '',
      outro_responsavel_observacao: responsaveis[2]?.obs_resp || '',
      outro_salario: responsaveis[2]?.renda_resp || '',
      outro_parentesco: responsaveis[2]?.parent_resp || '',
      outro_responsavel_principal: responsaveis[2]?.resp_principal || false,
    };

    // Escolaridade dos responsáveis
    paciente.escolaridade_paciente = null;
    paciente.mae_escolaridade = null;
    paciente.pai_escolaridade = null;
    paciente.outro_escolaridade = null;
    if (responsaveis[0]?.id_esc) {
      const escMae = await client.query('SELECT desc_esc FROM escolaridade WHERE id_esc = $1', [responsaveis[0].id_esc]);
      paciente.mae_escolaridade = escMae.rows[0]?.desc_esc || '';
    }
    if (responsaveis[1]?.id_esc) {
      const escPai = await client.query('SELECT desc_esc FROM escolaridade WHERE id_esc = $1', [responsaveis[1].id_esc]);
      paciente.pai_escolaridade = escPai.rows[0]?.desc_esc || '';
    }
    if (responsaveis[2]?.id_esc) {
      const escOutro = await client.query('SELECT desc_esc FROM escolaridade WHERE id_esc = $1', [responsaveis[2].id_esc]);
      paciente.outro_escolaridade = escOutro.rows[0]?.desc_esc || '';
    }

    // Estado civil dos responsáveis
    paciente.mae_estado_civil = null;
    paciente.pai_estado_civil = null;
    paciente.outro_estado_civil = null;
    if (responsaveis[0]?.id_est_civil) {
      const estMae = await client.query('SELECT denom_estado_civil FROM estado_civil WHERE id_est_civil = $1', [responsaveis[0].id_est_civil]);
      paciente.mae_estado_civil = estMae.rows[0]?.denom_estado_civil || '';
    }
    if (responsaveis[1]?.id_est_civil) {
      const estPai = await client.query('SELECT denom_estado_civil FROM estado_civil WHERE id_est_civil = $1', [responsaveis[1].id_est_civil]);
      paciente.pai_estado_civil = estPai.rows[0]?.denom_estado_civil || '';
    }
    if (responsaveis[2]?.id_est_civil) {
      const estOutro = await client.query('SELECT denom_estado_civil FROM estado_civil WHERE id_est_civil = $1', [responsaveis[2].id_est_civil]);
      paciente.outro_estado_civil = estOutro.rows[0]?.denom_estado_civil || '';
    }

    // Situação socioeconômica
    const socioRes = await client.query('SELECT * FROM sit_socio_econo WHERE id_pcte = $1', [id]);
    if (socioRes.rows.length) {
      paciente.valor_bpc = socioRes.rows[0].bolsa_bpc || '';
      paciente.renda_familiar = socioRes.rows[0].remuneracao || '';
      paciente.id_inst_ensino = socioRes.rows[0].id_inst_ensino || null;
    }

    // Instituição de ensino
    if (paciente.id_inst_ensino) {
      const instEnsRes = await client.query('SELECT * FROM inst_ensino WHERE id_inst_ens = $1', [paciente.id_inst_ensino]);
      const inst = instEnsRes.rows[0] || {};
      paciente.instituicao_ensino = inst.nome_inst || '';
      paciente.tipo_instituicao = inst.tipo_inst || '';
      paciente.municipio_ensino = inst.municipio_inst || '';
      paciente.id_esc = inst.id_esc || null;
    }

    // UBS de referência
    const ubsRes = await client.query('SELECT * FROM ubs_ref WHERE id_unidade = (SELECT id_ubs FROM locais_hist WHERE id_cras = (SELECT id_cras FROM cras_ref WHERE id_cras = (SELECT id_cras FROM responsavel WHERE id_pcte = $1 LIMIT 1)))', [id]);
    if (ubsRes.rows.length) {
      paciente.ubs_municipio = ubsRes.rows[0].municipio_ubs_ref || '';
      paciente.ubs_bairro = ubsRes.rows[0].bairro_ubs_ref || '';
      paciente.ubs_observacao = ubsRes.rows[0].obs_ubs_ref || '';
    }

    // CRAS de referência
    const crasRes = await client.query('SELECT * FROM cras_ref WHERE id_cras = (SELECT id_cras FROM responsavel WHERE id_pcte = $1 LIMIT 1)', [id]);
    if (crasRes.rows.length) {
      paciente.cras_municipio = crasRes.rows[0].municipio_cras_ref || '';
      paciente.cras_bairro = crasRes.rows[0].bairro_cras_ref || '';
      paciente.cras_observacao = crasRes.rows[0].obs_cras_ref || '';
    }

    // Situação habitacional sanitária
    const habitRes = await client.query('SELECT * FROM sit_habit_san WHERE id_pcte = $1', [id]);
    if (habitRes.rows.length) {
      paciente.comodos = habitRes.rows[0].num_comodos || '';
      paciente.pessoas_casa = habitRes.rows[0].num_pessoas_casa || '';
      paciente.id_adq_casa = habitRes.rows[0].id_adq_casa || null;
      paciente.id_caract = habitRes.rows[0].id_caract || null;
    }

    // Forma de aquisição da casa
    if (paciente.id_adq_casa) {
      const adqRes = await client.query('SELECT * FROM form_adq_casa WHERE id_adq_casa = $1', [paciente.id_adq_casa]);
      paciente.situacao_habitacional = adqRes.rows[0]?.forma_adq_casa || '';
    }

    // Características da casa
    if (paciente.id_caract) {
      const caractRes = await client.query('SELECT * FROM habit_san_caract WHERE id_caract = $1', [paciente.id_caract]);
      paciente.material_habitacao = caractRes.rows[0]?.nome_caract || '';
    }

    // Junta endereço ao objeto principal
    if (endereco) {
      paciente.endereco = endereco.rua_end || '';
      paciente.numero = endereco.num_end || '';
      paciente.complemento = endereco.complemento_end || '';
      paciente.cidade = endereco.cidade_end || '';
      paciente.bairro = endereco.bairro_end || '';
      paciente.cep = endereco.cep_end || '';
      paciente.estado = endereco.uf_end || '';
      paciente.ponto_referencia = endereco.ponto_ref_end || '';
      paciente.id_end = endereco.id_end || null;
    }

    return paciente;
  } finally {
    client.release();
  }
}

// Atualiza todos os dados do paciente e suas dependências (apenas UPDATE)
async function atualizarPaciente(id, dados) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Atualiza dados básicos do paciente
    await client.query(
      `UPDATE paciente SET 
        nome_pcte = $1,
        data_nasc_pcte = $2,
        cpf_pcte = $3,
        cns_pcte = $4,
        rg_pcte = $5,
        tel_pcte = $6,
        cel_pcte = $7,
        contato_emergencia = $8
      WHERE id_pcte = $9`,
      [
        toNullIfEmpty(dados.paciente),
        toNullIfEmpty(dados.data_nascimento),
        toNullIfEmpty(dados.cpf),
        toNullIfEmpty(dados.cartao_sus),
        toNullIfEmpty(dados.rg),
        toNullIfEmpty(dados.telefone1),
        toNullIfEmpty(dados.telefone2 || dados.telefone1),
        toNullIfEmpty(dados.contato_emergencia),
        parseInt(id, 10)
      ]
    );

    // Atualiza endereço se vier id_end
    if (dados.id_end) {
      await client.query(
        `UPDATE end_pcte SET 
          rua_end = $1, num_end = $2, complemento_end = $3, cidade_end = $4, bairro_end = $5, cep_end = $6, uf_end = $7, ponto_ref_end = $8
        WHERE id_end = $9`,
        [
          toNullIfEmpty(dados.endereco),
          toNullIfEmpty(dados.numero),
          toNullIfEmpty(dados.complemento),
          toNullIfEmpty(dados.cidade),
          toNullIfEmpty(dados.bairro),
          toNullIfEmpty(dados.cep),
          toNullIfEmpty(dados.estado),
          toNullIfEmpty(dados.ponto_referencia),
          toNullIfEmpty(dados.id_end)
        ]
      );
    }

    // Atualiza quimioterapias
    if (dados.quimio && Array.isArray(dados.quimio.id_quimio)) {
      const sql = `UPDATE pcte_quimio SET 
        nome_prof_quimio = $1, crm_prof_quimio = $2, local_quimio = $3, data_ini = $4, data_ultima_sessao = $5
        WHERE id_quimio = $6 AND id_pcte = $7`;
      for (let i = 0; i < dados.quimio.id_quimio.length; i++) {
        await client.query(sql, [
          toNullIfEmpty(dados.quimio.profissional[i]),
          toNullIfEmpty(dados.quimio.crm[i]),
          toNullIfEmpty(dados.quimio.local[i]),
          toNullIfEmpty(dados.quimio.inicio[i]),
          toNullIfEmpty(dados.quimio.fim[i]),
          toNullIfEmpty(dados.quimio.id_quimio[i]),
          parseInt(id, 10)
        ]);
      }
    }

    // Atualiza radioterapias
    if (dados.radio && Array.isArray(dados.radio.id_radio)) {
      const sql = `UPDATE pcte_radio SET 
        nome_prof_radio = $1, crm_prof_radio = $2, local_radio = $3, data_ini = $4, data_ultima_sessao = $5
        WHERE id_radio = $6 AND id_pcte = $7`;
      for (let i = 0; i < dados.radio.id_radio.length; i++) {
        await client.query(sql, [
          toNullIfEmpty(dados.radio.profissional[i]),
          toNullIfEmpty(dados.radio.crm[i]),
          toNullIfEmpty(dados.radio.local[i]),
          toNullIfEmpty(dados.radio.inicio[i]),
          toNullIfEmpty(dados.radio.fim[i]),
          toNullIfEmpty(dados.radio.id_radio[i]),
          parseInt(id, 10)
        ]);
      }
    }

    // Atualiza cirurgias
    if (dados.cirurgia && Array.isArray(dados.cirurgia.id_cirurgia)) {
      const sql = `UPDATE cirurgia SET 
        tipo_cirurgia = $1, data_inic_cirurgia = $2, data_fim_cirurgia = $3, hosp_cirurgia = $4, nome_prof = $5, crm_prof = $6
        WHERE id_cirurgia = $7 AND id_pcte = $8`;
      for (let i = 0; i < dados.cirurgia.id_cirurgia.length; i++) {
        await client.query(sql, [
          toNullIfEmpty(dados.cirurgia.tipo[i]),
          toNullIfEmpty(dados.cirurgia.inicio[i]),
          toNullIfEmpty(dados.cirurgia.fim[i]),
          toNullIfEmpty(dados.cirurgia.local[i]),
          toNullIfEmpty(dados.cirurgia.profissional[i]),
          toNullIfEmpty(dados.cirurgia.crm[i]),
          toNullIfEmpty(dados.cirurgia.id_cirurgia[i]),
          parseInt(id, 10)
        ]);
      }
    }

    // Atualiza diagnósticos e medicamentos
    if (dados.diagnosticos && Array.isArray(dados.diagnosticos.id_pcte_diag)) {
    const sqlUpdate = `UPDATE pcte_diag SET 
    desc_diag = $1, nome_diag = $2, cid_diag = $3, obs_diag = $4, medic_uso = $5, medic_dosagem = $6, medic_freq = $7, med_obs = $8
    WHERE id_pcte_diag = $9 AND id_pcte = $10`;

    console.log('ID Paciente:', id);

    for (let i = 0; i < dados.diagnosticos.id_pcte_diag.length; i++) {
      const idDiagRaw = dados.diagnosticos.id_pcte_diag[i];
      let idDiag;
      if (idDiagRaw && idDiagRaw !== '') {
        idDiag = parseInt(idDiagRaw, 10);
      } else {
        idDiag = parseInt(id, 10); 
        console.warn(`id_pcte_diag vazio, usando id do paciente (${idDiag}) como idDiag no índice ${i}`);
      }

      try {
        const result = await client.query(sqlUpdate, [
          toNullIfEmpty(dados.diagnosticos.descricao[i]),
          toNullIfEmpty(dados.diagnosticos.nome[i]),
          toNullIfEmpty(dados.diagnosticos.cid[i]),
          toNullIfEmpty(dados.diagnosticos.observacao[i]),
          (dados.medicamentos && Array.isArray(dados.medicamentos.nome) ? toNullIfEmpty(dados.medicamentos.nome[i]) : null),
          (dados.medicamentos && Array.isArray(dados.medicamentos.dosagem) ? toNullIfEmpty(dados.medicamentos.dosagem[i]) : null),
          (dados.medicamentos && Array.isArray(dados.medicamentos.frequencia) ? toNullIfEmpty(dados.medicamentos.frequencia[i]) : null),
          (dados.medicamentos && Array.isArray(dados.medicamentos.observacao) ? toNullIfEmpty(dados.medicamentos.observacao[i]) : null),
          idDiag,
          parseInt(id, 10)
        ]);

        console.log(`Diagnóstico ID ${idDiag} atualizado, linhas afetadas:`, result.rowCount);
      } catch (error) {
        console.error('Erro ao atualizar diagnóstico ID:', idDiag, error);
      }
    }
}

    // Atualiza diagnósticos familiares
    if (dados.diagnosticosFamiliares && Array.isArray(dados.diagnosticosFamiliares.id_resp_diag)) {
      const sql = `UPDATE resp_diag SET 
        desc_diag = $1, nome_diag = $2, cid_diag = $3, obs_diag = $4, parestesco_diag = $5
        WHERE id_resp_diag = $6 AND id_pcte = $7`;
      for (let i = 0; i < dados.diagnosticosFamiliares.id_resp_diag.length; i++) {
        await client.query(sql, [
          toNullIfEmpty(dados.diagnosticosFamiliares.descricao[i]),
          toNullIfEmpty(dados.diagnosticosFamiliares.nome[i]),
          toNullIfEmpty(dados.diagnosticosFamiliares.cid[i]),
          toNullIfEmpty(dados.diagnosticosFamiliares.observacao[i]),
          toNullIfEmpty(dados.diagnosticosFamiliares.parentesco[i]),
          toNullIfEmpty(dados.diagnosticosFamiliares.id_resp_diag[i]),
          parseInt(id, 10)
        ]);
      }
    }

    // Adicione outros updates de tabelas relacionadas conforme sua modelagem

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Atualiza estado civil
async function atualizarEstadoCivil(id_est_civil, denom_estado_civil) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE estado_civil SET denom_estado_civil = $1 WHERE id_est_civil = $2`,
      [denom_estado_civil, id_est_civil]
    );
    return true;
  } finally {
    client.release();
  }
}

// Atualiza escolaridade
async function atualizarEscolaridade(id_esc, desc_esc) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE escolaridade SET desc_esc = $1 WHERE id_esc = $2`,
      [desc_esc, id_esc]
    );
    return true;
  } finally {
    client.release();
  }
}

// Atualiza UBS de referência
async function atualizarUbsReferencia(id_unidade, dados) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE ubs_ref SET municipio_ubs_ref = $1, bairro_ubs_ref = $2, obs_ubs_ref = $3 WHERE id_unidade = $4`,
      [
        dados.ubs_municipio || null,
        dados.ubs_bairro || null,
        dados.ubs_observacao || null,
        id_unidade
      ]
    );
    return true;
  } finally {
    client.release();
  }
}

// Atualiza CRAS de referência
async function atualizarCrasReferencia(id_cras, dados) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE cras_ref SET municipio_cras_ref = $1, bairro_cras_ref = $2, obs_cras_ref = $3 WHERE id_cras = $4`,
      [
        dados.cras_municipio || null,
        dados.cras_bairro || null,
        dados.cras_observacao || null,
        id_cras
      ]
    );
    return true;
  } finally {
    client.release();
  }
}

// Atualiza forma de aquisição da casa
async function atualizarAdquirirCasa(id_adq_casa, situacao_habitacional) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE form_adq_casa SET forma_adq_casa = $1 WHERE id_adq_casa = $2`,
      [situacao_habitacional, id_adq_casa]
    );
    return true;
  } finally {
    client.release();
  }
}

// Atualiza características da casa
async function atualizarCaracteristicasCasa(id_caract, material_habitacao) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE habit_san_caract SET nome_caract = $1 WHERE id_caract = $2`,
      [material_habitacao, id_caract]
    );
    return true;
  } finally {
    client.release();
  }
}

// Atualiza instituição de ensino
async function atualizarInstEnsino(id_inst_ens, dados) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE inst_ensino SET id_esc = $1, nome_inst = $2, tipo_inst = $3, municipio_inst = $4 WHERE id_inst_ens = $5`,
      [
        dados.id_esc || null,
        dados.instituicao_ensino || null,
        dados.tipo_instituicao || null,
        dados.municipio_ensino || null,
        id_inst_ens
      ]
    );
    return true;
  } finally {
    client.release();
  }
}

// Atualiza locais_hist
async function atualizarLocaisHist(id_locais_hist, id_ubs, id_cras) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE locais_hist SET id_ubs = $1, id_cras = $2 WHERE id_locais_hist = $3`,
      [id_ubs, id_cras, id_locais_hist]
    );
    return true;
  } finally {
    client.release();
  }
}

// Atualiza situação habitacional sanitária
async function atualizarSituacaoHabitacional(id_sit_hab, dados) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE sit_habit_san SET num_comodos = $1, id_pcte = $2, id_adq_casa = $3, id_caract = $4, num_pessoas_casa = $5 WHERE id_sit_hab = $6`,
      [
        dados.comodos || null,
        dados.id_pcte || null,
        dados.id_adq_casa || null,
        dados.id_caract || null,
        dados.pessoas_casa || null,
        id_sit_hab
      ]
    );
    return true;
  } finally {
    client.release();
  }
}

// Atualiza situação socioeconômica
async function atualizarSituacaoSocioEconomica(id_socio_eco, dados) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE sit_socio_econo SET bolsa_bpc = $1, remuneracao = $2, id_inst_ensino = $3, id_pcte = $4 WHERE id_socio_eco = $5`,
      [
        dados.valor_bpc || null,
        dados.renda_familiar || null,
        dados.id_inst_ensino || null,
        dados.id_pcte || null,
        id_socio_eco
      ]
    );
    return true;
  } finally {
    client.release();
  }
}

// Atualiza responsável
async function atualizarResponsavel(id_responsavel, dados) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE responsavel SET 
        resp_principal = $1, nome_resp = $2, cpf_resp = $3, rg_resp = $4, data_nasc_resp = $5, natur_resp = $6,
        tel_cel_responsavel = $7, situacao_resp = $8, obs_resp = $9, renda_resp = $10, parent_resp = $11,
        id_esc = $12, id_est_civil = $13, id_pcte = $14, id_end = $15
      WHERE id_responsavel = $16`,
      [
        dados.resp_principal || null,
        dados.nome_resp || null,
        dados.cpf_resp || null,
        dados.rg_resp || null,
        dados.data_nasc_resp || null,
        dados.natur_resp || null,
        dados.tel_cel_responsavel || null,
        dados.situacao_resp || null,
        dados.obs_resp || null,
        dados.renda_resp || null,
        dados.parent_resp || null,
        dados.id_esc || null,
        dados.id_est_civil || null,
        dados.id_pcte || null,
        dados.id_end || null,
        id_responsavel
      ]
    );
    return true;
  } finally {
    client.release();
  }
}

// Helper para UPDATE dinâmico (padrão db_functions.js)
function buildUpdateQuery(table, idField, data, idValue) {
  const keys = Object.keys(data);
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  const values = keys.map(k => data[k]);
  values.push(idValue);
  const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE ${idField} = $${values.length} RETURNING *`;
  return { sql, values };
}

// CRUD helpers para tabelas principais

// Escolaridade
async function createEscolaridade({ desc_esc }) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO escolaridade (desc_esc) VALUES ($1) RETURNING *`;
    const res = await client.query(sql, [desc_esc]);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function getEscolaridade(id_esc) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM escolaridade WHERE id_esc = $1`, [id_esc]);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function updateEscolaridadeCRUD(id_esc, data) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const { sql, values } = buildUpdateQuery('escolaridade', 'id_esc', data, id_esc);
    const res = await client.query(sql, values);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function deleteEscolaridade(id_esc) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM escolaridade WHERE id_esc = $1`, [id_esc]);
    return true;
  } finally {
    client.release();
  }
}

// Endereço do paciente
async function createEndereco(end) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const fields = Object.keys(end);
    const cols = fields.join(', ');
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const values = fields.map(f => end[f]);
    const sql = `INSERT INTO end_pcte (${cols}) VALUES (${placeholders}) RETURNING *`;
    const res = await client.query(sql, values);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function getEndereco(id_end) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM end_pcte WHERE id_end = $1`, [id_end]);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function updateEndereco(id_end, data) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const { sql, values } = buildUpdateQuery('end_pcte', 'id_end', data, id_end);
    const res = await client.query(sql, values);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function deleteEndereco(id_end) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM end_pcte WHERE id_end = $1`, [id_end]);
    return true;
  } finally {
    client.release();
  }
}

// Estado civil
async function createEstadoCivilCRUD({ denom_estado_civil }) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO estado_civil (denom_estado_civil) VALUES ($1) RETURNING *`;
    const res = await client.query(sql, [denom_estado_civil]);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function getEstadoCivil(id_est_civil) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM estado_civil WHERE id_est_civil = $1`, [id_est_civil]);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function updateEstadoCivilCRUD(id_est_civil, data) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const { sql, values } = buildUpdateQuery('estado_civil', 'id_est_civil', data, id_est_civil);
    const res = await client.query(sql, values);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function deleteEstadoCivil(id_est_civil) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM estado_civil WHERE id_est_civil = $1`, [id_est_civil]);
    return true;
  } finally {
    client.release();
  }
}

// UBS de referência
async function createUbsRef(data) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const fields = Object.keys(data);
    const cols = fields.join(', ');
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const values = fields.map(f => data[f]);
    const sql = `INSERT INTO ubs_ref (${cols}) VALUES (${placeholders}) RETURNING *`;
    const res = await client.query(sql, values);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function getUbsRef(id_unidade) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM ubs_ref WHERE id_unidade = $1`, [id_unidade]);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function updateUbsRef(id_unidade, data) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const { sql, values } = buildUpdateQuery('ubs_ref', 'id_unidade', data, id_unidade);
    const res = await client.query(sql, values);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function deleteUbsRef(id_unidade) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM ubs_ref WHERE id_unidade = $1`, [id_unidade]);
    return true;
  } finally {
    client.release();
  }
}

// CRAS de referência
async function createCrasRef(data) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const fields = Object.keys(data);
    const cols = fields.join(', ');
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const values = fields.map(f => data[f]);
    const sql = `INSERT INTO cras_ref (${cols}) VALUES (${placeholders}) RETURNING *`;
    const res = await client.query(sql, values);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function getCrasRef(id_cras) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM cras_ref WHERE id_cras = $1`, [id_cras]);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function updateCrasRef(id_cras, data) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const { sql, values } = buildUpdateQuery('cras_ref', 'id_cras', data, id_cras);
    const res = await client.query(sql, values);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function deleteCrasRef(id_cras) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM cras_ref WHERE id_cras = $1`, [id_cras]);
    return true;
  } finally {
    client.release();
  }
}

// Forma de aquisição da casa
async function createFormAdqCasa({ forma_adq_casa }) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO form_adq_casa (forma_adq_casa) VALUES ($1) RETURNING *`;
    const res = await client.query(sql, [forma_adq_casa]);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function getFormAdqCasa(id_adq_casa) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM form_adq_casa WHERE id_adq_casa = $1`, [id_adq_casa]);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function updateFormAdqCasa(id_adq_casa, data) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const { sql, values } = buildUpdateQuery('form_adq_casa', 'id_adq_casa', data, id_adq_casa);
    const res = await client.query(sql, values);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function deleteFormAdqCasa(id_adq_casa) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM form_adq_casa WHERE id_adq_casa = $1`, [id_adq_casa]);
    return true;
  } finally {
    client.release();
  }
}

// Características da casa
async function createHabitSanCaract({ nome_caract }) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const sql = `INSERT INTO habit_san_caract (nome_caract) VALUES ($1) RETURNING *`;
    const res = await client.query(sql, [nome_caract]);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function getHabitSanCaract(id_caract) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM habit_san_caract WHERE id_caract = $1`, [id_caract]);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function updateHabitSanCaract(id_caract, data) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    const { sql, values } = buildUpdateQuery('habit_san_caract', 'id_caract', data, id_caract);
    const res = await client.query(sql, values);
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function deleteHabitSanCaract(id_caract) {
  const pool = await connect();
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM habit_san_caract WHERE id_caract = $1`, [id_caract]);
    return true;
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
                   getUltimosPacientes,
                   buscarPacientes,
                   deletarPaciente,
                   getPacientePorId,
                   atualizarPaciente,
                   atualizarEstadoCivil,
                   atualizarEscolaridade,
                   atualizarUbsReferencia,
                   atualizarCrasReferencia,
                   atualizarAdquirirCasa,
                   atualizarCaracteristicasCasa,
                   atualizarInstEnsino,
                   atualizarLocaisHist,
                   atualizarSituacaoHabitacional,
                   atualizarSituacaoSocioEconomica,
                   atualizarResponsavel
};
connect();
