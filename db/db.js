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

// ------Contas Login------
async function createUser({ usuario_login, senha_login }) {
    const pool = await connect();
    const client = await pool.connect();
    try {
        const query = 'INSERT INTO contas_login (usuario_login, senha_login) VALUES ($1, $2) RETURNING *';
        const values = [usuario_login, senha_login];
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
}

async function getUserById(id_login) {
    const pool = await connect();
    const client = await pool.connect();
    try {
        const query = 'SELECT * FROM contas_login WHERE id_login = $1';
        const values = [id_login];
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
}

async function updateUser(id_login, { usuario_login, senha_login }) {
    const pool = await connect();
    const client = await pool.connect();
    try {
        const query = 'UPDATE contas_login SET usuario_login = $1, senha_login = $2 WHERE id_login = $3 RETURNING *';
        const values = [usuario_login, senha_login, id_login];
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
}

async function deleteUser(id_login) {
    const pool = await connect();
    const client = await pool.connect();
    try {
        const query = 'DELETE FROM contas_login WHERE id_login = $1 RETURNING *';
        const values = [id_login];
        const result = await client.query(query, values);
        return result.rowCount > 0;
    } finally {
        client.release();
    }
}

async function getAllUsers() {
    const pool = await connect();
    const client = await pool.connect();
    try {
        const query = 'SELECT * FROM contas_login ORDER BY id_login';
        const result = await client.query(query);
        return result.rows;
    } finally {
        client.release();
    }
}

// Inicio pacientes

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

function buildUpdateQuery(table, idField, data, idValue) {
  const keys = Object.keys(data);
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  const values = keys.map(k => data[k]);
  values.push(idValue);
  const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE ${idField} = $${values.length} RETURNING *`;
  return { sql, values };
}

// → CRUD contas_login
async function createLogin({ usuario_login, senha_login }) {
  const sql = `INSERT INTO contas_login (usuario_login, senha_login) VALUES ($1, $2) RETURNING *`;
  const res = await pool.query(sql, [usuario_login, senha_login]);
  return res.rows[0];
}
async function getLogin(id_login) {
  const res = await pool.query(`SELECT * FROM contas_login WHERE id_login = $1`, [id_login]);
  return res.rows[0];
}
async function updateLogin(id_login, data) {
  const { sql, values } = buildUpdateQuery('contas_login', 'id_login', data, id_login);
  const res = await pool.query(sql, values);
  return res.rows[0];
}
async function deleteLogin(id_login) {
  await pool.query(`DELETE FROM contas_login WHERE id_login = $1`, [id_login]);
}

// → CRUD end_pcte
async function createEndereco(end) {
  const fields = Object.keys(end);
  const cols = fields.join(', ');
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
  const values = fields.map(f => end[f]);
  const sql = `INSERT INTO end_pcte (${cols}) VALUES (${placeholders}) RETURNING *`;
  const res = await pool.query(sql, values);
  return res.rows[0];
}
async function getEndereco(id_end) {
  const res = await pool.query(`SELECT * FROM end_pcte WHERE id_end = $1`, [id_end]);
  return res.rows[0];
}
async function updateEndereco(id_end, data) {
  const { sql, values } = buildUpdateQuery('end_pcte', 'id_end', data, id_end);
  const res = await pool.query(sql, values);
  return res.rows[0];
}
async function deleteEndereco(id_end) {
  await pool.query(`DELETE FROM end_pcte WHERE id_end = $1`, [id_end]);
}

// → CRUD estado_civil
async function createEstadoCivil({ denom_estado_civil }) {
  const sql = `INSERT INTO estado_civil (denom_estado_civil) VALUES ($1) RETURNING *`;
  const res = await pool.query(sql, [denom_estado_civil]);
  return res.rows[0];
}
async function getEstadoCivil(id_est_civil) {
  const res = await pool.query(`SELECT * FROM estado_civil WHERE id_est_civil = $1`, [id_est_civil]);
  return res.rows[0];
}
async function listEstadoCivil() {
  const res = await pool.query(`SELECT * FROM estado_civil ORDER BY denom_estado_civil`);
  return res.rows;
}
async function updateEstadoCivil(id_est_civil, data) {
  const { sql, values } = buildUpdateQuery('estado_civil', 'id_est_civil', data, id_est_civil);
  const res = await pool.query(sql, values);
  return res.rows[0];
}
async function deleteEstadoCivil(id_est_civil) {
  await pool.query(`DELETE FROM estado_civil WHERE id_est_civil = $1`, [id_est_civil]);
}

// → CRUD escolaridade
async function createEscolaridade({ desc_esc }) {
  const sql = `INSERT INTO escolaridade (desc_esc) VALUES ($1) RETURNING *`;
  const res = await pool.query(sql, [desc_esc]);
  return res.rows[0];
}
async function getEscolaridade(id_esc) {
  const res = await pool.query(`SELECT * FROM escolaridade WHERE id_esc = $1`, [id_esc]);
  return res.rows[0];
}
async function listEscolaridade() {
  const res = await pool.query(`SELECT * FROM escolaridade ORDER BY desc_esc`);
  return res.rows;
}
async function updateEscolaridade(id_esc, data) {
  const { sql, values } = buildUpdateQuery('escolaridade', 'id_esc', data, id_esc);
  const res = await pool.query(sql, values);
  return res.rows[0];
}
async function deleteEscolaridade(id_esc) {
  await pool.query(`DELETE FROM escolaridade WHERE id_esc = $1`, [id_esc]);
}

// → CRUD ubs_ref
async function createUbsRef(data) {
  const fields = Object.keys(data);
  const cols = fields.join(', ');
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
  const values = fields.map(f => data[f]);
  const sql = `INSERT INTO ubs_ref (${cols}) VALUES (${placeholders}) RETURNING *`;
  const res = await pool.query(sql, values);
  return res.rows[0];
}
async function getUbsRef(id_unidade) {
  const res = await pool.query(`SELECT * FROM ubs_ref WHERE id_unidade = $1`, [id_unidade]);
  return res.rows[0];
}
async function listUbsRef() {
  const res = await pool.query(`SELECT * FROM ubs_ref ORDER BY municipio_ubs_ref`);
  return res.rows;
}
async function updateUbsRef(id_unidade, data) {
  const { sql, values } = buildUpdateQuery('ubs_ref', 'id_unidade', data, id_unidade);
  const res = await pool.query(sql, values);
  return res.rows[0];
}
async function deleteUbsRef(id_unidade) {
  await pool.query(`DELETE FROM ubs_ref WHERE id_unidade = $1`, [id_unidade]);
}

// → CRUD cras_ref
async function createCrasRef(data) {
  const fields = Object.keys(data);
  const cols = fields.join(', ');
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
  const values = fields.map(f => data[f]);
  const sql = `INSERT INTO cras_ref (${cols}) VALUES (${placeholders}) RETURNING *`;
  const res = await pool.query(sql, values);
  return res.rows[0];
}
async function getCrasRef(id_cras) {
  const res = await pool.query(`SELECT * FROM cras_ref WHERE id_cras = $1`, [id_cras]);
  return res.rows[0];
}
async function listCrasRef() {
  const res = await pool.query(`SELECT * FROM cras_ref ORDER BY municipio_cras_ref`);
  return res.rows;
}
async function updateCrasRef(id_cras, data) {
  const { sql, values } = buildUpdateQuery('cras_ref', 'id_cras', data, id_cras);
  const res = await pool.query(sql, values);
  return res.rows[0];
}
async function deleteCrasRef(id_cras) {
  await pool.query(`DELETE FROM cras_ref WHERE id_cras = $1`, [id_cras]);
}

// → CRUD form_adq_casa
async function createFormAdqCasa({ forma_adq_casa }) {
  const sql = `INSERT INTO form_adq_casa (forma_adq_casa) VALUES ($1) RETURNING *`;
  const res = await pool.query(sql, [forma_adq_casa]);
  return res.rows[0];
}
async function getFormAdqCasa(id_adq_casa) {
  const res = await pool.query(`SELECT * FROM form_adq_casa WHERE id_adq_casa = $1`, [id_adq_casa]);
  return res.rows[0];
}
async function listFormAdqCasa() {
  const res = await pool.query(`SELECT * FROM form_adq_casa ORDER BY forma_adq_casa`);
  return res.rows;
}
async function updateFormAdqCasa(id_adq_casa, data) {
  const { sql, values } = buildUpdateQuery('form_adq_casa', 'id_adq_casa', data, id_adq_casa);
  const res = await pool.query(sql, values);
  return res.rows[0];
}
async function deleteFormAdqCasa(id_adq_casa) {
  await pool.query(`DELETE FROM form_adq_casa WHERE id_adq_casa = $1`, [id_adq_casa]);
}

// → CRUD habit_san_caract
async function createHabitSanCaract({ nome_caract }) {
  const sql = `INSERT INTO habit_san_caract (nome_caract) VALUES ($1) RETURNING *`;
  const res = await pool.query(sql, [nome_caract]);
  return res.rows[0];
}
async function getHabitSanCaract(id_caract) {
  const res = await pool.query(`SELECT * FROM habit_san_caract WHERE id_caract = $1`, [id_caract]);
  return res.rows[0];
}
async function listHabitSanCaract() {
  const res = await pool.query(`SELECT * FROM habit_san_caract ORDER BY nome_caract`);
  return res.rows;
}
async function updateHabitSanCaract(id_caract, data) {
  const { sql, values } = buildUpdateQuery('habit_san_caract', 'id_caract', data, id_caract);
  const res = await pool.query(sql, values);
  return res.rows[0];
}
async function deleteHabitSanCaract(id_caract) {
  await pool.query(`DELETE FROM habit_san_caract WHERE id_caract = $1`, [id_caract]);
}

// → CRUD paciente
async function createPaciente(p) {
  const end = await createEndereco(p.endereco);
  const sql = `INSERT INTO paciente (
    nome_pcte, data_nasc_pcte, data_cadast_pcte,
    cpf_pcte, cns_pcte, rg_pcte,
    cel_pcte, tel_pcte, contato_emergencia,
    id_end
  ) VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
  ) RETURNING *`;
  const vals = [
    p.nome_pcte, p.data_nasc_pcte, p.data_cadast_pcte,
    p.cpf_pcte, p.cns_pcte, p.rg_pcte,
    p.cel_pcte, p.tel_pcte, p.contato_emergencia,
    end.id_end
  ];
  const res = await pool.query(sql, vals);
  return res.rows[0];
}
async function getPaciente(id_pcte) {
  const sql = `SELECT p.*, e.* FROM paciente p
               LEFT JOIN end_pcte e ON p.id_end=e.id_end
               WHERE p.id_pcte=$1`;
  const res = await pool.query(sql, [id_pcte]);
  return res.rows[0];
}
async function updatePaciente(id_pcte, data) {
  await updateEndereco(data.endereco.id_end, data.endereco);
  const upFields = (({ endereco, ...rest }) => rest)(data);
  const { sql, values } = buildUpdateQuery('paciente','id_pcte', upFields, id_pcte);
  const res = await pool.query(sql, values);
  return res.rows[0];
}
async function deletePaciente(id_pcte) {
  await pool.query(`DELETE FROM paciente WHERE id_pcte=$1`, [id_pcte]);
}

// → CRUD inst_ensino
async function createInstEnsino(data) {
  const keys = ['id_esc','nome_inst','tipo_inst','municipio_inst'];
  const vals = keys.map(k => data[k]);
  const placeholders = keys.map((_,i)=>`$${i+1}`).join(',');
  const sql = `INSERT INTO inst_ensino (${keys.join(',')}) VALUES(${placeholders}) RETURNING *`;
  const res = await pool.query(sql, vals);
  return res.rows[0];
}
async function getInstEnsino(id_inst_ens) {
  const res = await pool.query(`SELECT * FROM inst_ensino WHERE id_inst_ens=$1`,[id_inst_ens]);
  return res.rows[0];
}
async function updateInstEnsino(id_inst_ens,data){
  const {sql,values}=buildUpdateQuery('inst_ensino','id_inst_ens',data,id_inst_ens);
  const res = await pool.query(sql,values);
  return res.rows[0];
}
async function deleteInstEnsino(id_inst_ens){ await pool.query(`DELETE FROM inst_ensino WHERE id_inst_ens=$1`,[id_inst_ens]);}

// → CRUD pcte_diag
async function createPcteDiag(data){
  const keys=['desc_diag','nome_diag','cid_diag','obs_diag','id_pcte','medic_uso','medic_dosagem','medic_freq','med_obs'];
  const vals=keys.map(k=>data[k]);
  const sql=`INSERT INTO pcte_diag(${keys.join(',')}) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')}) RETURNING *`;
  const res=await pool.query(sql,vals);
  return res.rows[0];
}
async function getPcteDiag(id_pcte_diag){
  const res=await pool.query(`SELECT * FROM pcte_diag WHERE id_pcte_diag=$1`,[id_pcte_diag]); return res.rows[0];
}
async function updatePcteDiag(id_pcte_diag,data){const{sql,values}=buildUpdateQuery('pcte_diag','id_pcte_diag',data,id_pcte_diag);const res=await pool.query(sql,values);return res.rows[0];}
async function deletePcteDiag(id_pcte_diag){await pool.query(`DELETE FROM pcte_diag WHERE id_pcte_diag=$1`,[id_pcte_diag]);}

// → CRUD locais_hist
async function createLocaisHist({id_ubs,id_cras}){const sql=`INSERT INTO locais_hist(id_ubs,id_cras) VALUES($1,$2) RETURNING *`;const res=await pool.query(sql,[id_ubs,id_cras]);return res.rows[0];}
async function getLocaisHist(id_locais_hist){const res=await pool.query(`SELECT * FROM locais_hist WHERE id_locais_hist=$1`,[id_locais_hist]);return res.rows[0];}
async function updateLocaisHist(id_locais_hist,data){const{sql,values}=buildUpdateQuery('locais_hist','id_locais_hist',data,id_locais_hist);const res=await pool.query(sql,values);return res.rows[0];}
async function deleteLocaisHist(id_locais_hist){await pool.query(`DELETE FROM locais_hist WHERE id_locais_hist=$1`,[id_locais_hist]);}

// → CRUD cirurgia
async function createCirurgia(data){
  const keys=['tipo_cirurgia','data_inic_cirurgia','data_fim_cirurgia','hosp_cirurgia','nome_prof','crm_prof','id_pcte'];
  const vals=keys.map(k=>data[k]);
  const sql=`INSERT INTO cirurgia(${keys.join(',')}) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')}) RETURNING *`;
  const res=await pool.query(sql,vals);
  return res.rows[0];
}
async function getCirurgia(id_cirurgia){const res=await pool.query(`SELECT * FROM cirurgia WHERE id_cirurgia=$1`,[id_cirurgia]);return res.rows[0];}
async function updateCirurgia(id_cirurgia,data){const{sql,values}=buildUpdateQuery('cirurgia','id_cirurgia',data,id_cirurgia);const res=await pool.query(sql,values);return res.rows[0];}
async function deleteCirurgia(id_cirurgia){await pool.query(`DELETE FROM cirurgia WHERE id_cirurgia=$1`,[id_cirurgia]);}

// → CRUD sit_habit_san
async function createSitHabitSan(data){
  const keys=['num_comodos','id_pcte','id_adq_casa','id_caract','num_pessoas_casa'];
  const vals=keys.map(k=>data[k]);
  const sql=`INSERT INTO sit_habit_san(${keys.join(',')}) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')}) RETURNING *`;
  const res=await pool.query(sql,vals);
  return res.rows[0];
}
async function getSitHabitSan(id_sit_hab){const res=await pool.query(`SELECT * FROM sit_habit_san WHERE id_sit_hab=$1`,[id_sit_hab]);return res.rows[0];}
async function updateSitHabitSan(id_sit_hab,data){const{sql,values}=buildUpdateQuery('sit_habit_san','id_sit_hab',data,id_sit_hab);const res=await pool.query(sql,values);return res.rows[0];}
async function deleteSitHabitSan(id_sit_hab){await pool.query(`DELETE FROM sit_habit_san WHERE id_sit_hab=$1`,[id_sit_hab]);}

// → CRUD pcte_radio
async function createPcteRadio(data){
  const keys=['data_ini','data_ultima_sessao','local_radio','nome_prof_radio','crm_prof_radio','id_pcte'];
  const vals=keys.map(k=>data[k]);
  const sql=`INSERT INTO pcte_radio(${keys.join(',')}) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')}) RETURNING *`;
  const res=await pool.query(sql,vals);
  return res.rows[0];
}
async function getPcteRadio(id_radio){const res=await pool.query(`SELECT * FROM pcte_radio WHERE id_radio=$1`,[id_radio]);return res.rows[0];}
async function updatePcteRadio(id_radio,data){const{sql,values}=buildUpdateQuery('pcte_radio','id_radio',data,id_radio);const res=await pool.query(sql,values);return res.rows[0];}
async function deletePcteRadio(id_radio){await pool.query(`DELETE FROM pcte_radio WHERE id_radio=$1`,[id_radio]);}

// → CRUD pcte_quimio
async function createPcteQuimio(data){
  const keys=['data_ini','data_ultima_sessao','local_quimio','nome_prof_quimio','crm_prof_quimio','id_pcte'];
  const vals=keys.map(k=>data[k]);
  const sql=`INSERT INTO pcte_quimio(${keys.join(',')}) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')}) RETURNING *`;
  const res=await pool.query(sql,vals);
  return res.rows[0];
}
async function getPcteQuimio(id_quimio){const res=await pool.query(`SELECT * FROM pcte_quimio WHERE id_quimio=$1`,[id_quimio]);return res.rows[0];}
async function updatePcteQuimio(id_quimio,data){const{sql,values}=buildUpdateQuery('pcte_quimio','id_quimio',data,id_quimio);const res=await pool.query(sql,values);return res.rows[0];}
async function deletePcteQuimio(id_quimio){await pool.query(`DELETE FROM pcte_quimio WHERE id_quimio=$1`,[id_quimio]);}

// → CRUD sit_socio_econo
async function createSitSocioEcono(data){
  const keys=['bolsa_bpc','remuneracao','id_inst_ensino','id_pcte'];
  const vals=keys.map(k=>data[k]);
  const sql=`INSERT INTO sit_socio_econo(${keys.join(',')}) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')}) RETURNING *`;
  const res=await pool.query(sql,vals);
  return res.rows[0];
}
async function getSitSocioEcono(id_socio_eco){const res=await pool.query(`SELECT * FROM sit_socio_econo WHERE id_socio_eco=$1`,[id_socio_eco]);return res.rows[0];}
async function updateSitSocioEcono(id_socio_eco,data){const{sql,values}=buildUpdateQuery('sit_socio_econo','id_socio_eco',data,id_socio_eco);const res=await pool.query(sql,values);return res.rows[0];}
async function deleteSitSocioEcono(id_socio_eco){await pool.query(`DELETE FROM sit_socio_econo WHERE id_socio_eco=$1`,[id_socio_eco]);}

// → CRUD responsavel
async function createResponsavel(data){
  const keys=['resp_principal','nome_resp','cpf_resp','rg_resp','data_nasc_resp','natur_resp','tel_cel_responsavel','situacao_resp','obs_resp','renda_resp','parent_resp','id_esc','id_est_civil','id_pcte','id_end'];
  const vals=keys.map(k=>data[k]);
  const sql=`INSERT INTO responsavel(${keys.join(',')}) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')}) RETURNING *`;
  const res=await pool.query(sql,vals);
  return res.rows[0];
}
async function getResponsavel(id_responsavel){const res=await pool.query(`SELECT * FROM responsavel WHERE id_responsavel=$1`,[id_responsavel]);return res.rows[0];}
async function updateResponsavel(id_responsavel,data){const{sql,values}=buildUpdateQuery('responsavel','id_responsavel',data,id_responsavel);const res=await pool.query(sql,values);return res.rows[0];}
async function deleteResponsavel(id_responsavel){await pool.query(`DELETE FROM responsavel WHERE id_responsavel=$1`,[id_responsavel]);}

// → CRUD resp_diag
async function createRespDiag(data){
  const keys=['desc_diag','nome_diag','cid_diag','obs_diag','parestesco_diag','id_pcte'];
  const vals=keys.map(k=>data[k]);
  const sql=`INSERT INTO resp_diag(${keys.join(',')}) VALUES(${keys.map((_,i)=>`$${i+1}`).join(',')}) RETURNING *`;
  const res=await pool.query(sql,vals);
  return res.rows[0];
}
async function getRespDiag(id_resp_diag){const res=await pool.query(`SELECT * FROM resp_diag WHERE id_resp_diag=$1`,[id_resp_diag]);return res.rows[0];}
async function updateRespDiag(id_resp_diag,data){const{sql,values}=buildUpdateQuery('resp_diag','id_resp_diag',data,id_resp_diag);const res=await pool.query(sql,values);return res.rows[0];}
async function deleteRespDiag(id_resp_diag){await pool.query(`DELETE FROM resp_diag WHERE id_resp_diag=$1`,[id_resp_diag]);}

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
                     createLogin, getLogin, updateLogin, deleteLogin,
  createEndereco, getEndereco, updateEndereco, deleteEndereco,
  createEstadoCivil, getEstadoCivil, listEstadoCivil, updateEstadoCivil, deleteEstadoCivil,
  createEscolaridade, getEscolaridade, listEscolaridade, updateEscolaridade, deleteEscolaridade,
  createUbsRef, getUbsRef, listUbsRef, updateUbsRef, deleteUbsRef,
  createCrasRef, getCrasRef, listCrasRef, updateCrasRef, deleteCrasRef,
  createFormAdqCasa, getFormAdqCasa, listFormAdqCasa, updateFormAdqCasa, deleteFormAdqCasa,
  createHabitSanCaract, getHabitSanCaract, listHabitSanCaract, updateHabitSanCaract, deleteHabitSanCaract,
  createPaciente, getPaciente, updatePaciente, deletePaciente,
  createInstEnsino, getInstEnsino, updateInstEnsino, deleteInstEnsino,
  createPcteDiag, getPcteDiag, updatePcteDiag, deletePcteDiag,
  createLocaisHist, getLocaisHist, updateLocaisHist, deleteLocaisHist,
  createCirurgia, getCirurgia, updateCirurgia, deleteCirurgia,
  createSitHabitSan, getSitHabitSan, updateSitHabitSan, deleteSitHabitSan,
  createPcteRadio, getPcteRadio, updatePcteRadio, deletePcteRadio,
  createPcteQuimio, getPcteQuimio, updatePcteQuimio, deletePcteQuimio,
  createSitSocioEcono, getSitSocioEcono, updateSitSocioEcono, deleteSitSocioEcono,
  createResponsavel, getResponsavel, updateResponsavel, deleteResponsavel,
  createRespDiag, getRespDiag, updateRespDiag, deleteRespDiag,
  createUser, getUserById, updateUser, deleteUser, getAllUsers
};
connect();
