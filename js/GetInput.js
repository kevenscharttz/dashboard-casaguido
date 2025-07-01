const form = document.getElementById('cadastro-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Monta o objeto quimio
  data.quimio = {
    profissional: formData.getAll('quimio_profissional[]'),
    crm: formData.getAll('quimio_crm[]'),
    local: formData.getAll('quimio_local[]'),
    inicio: formData.getAll('quimio_inicio[]'),
    fim: formData.getAll('quimio_fim[]')
  };

  // Monta o objeto radio
  data.radio = {
    profissional: formData.getAll('radio_profissional[]'),
    crm: formData.getAll('radio_crm[]'),
    local: formData.getAll('radio_local[]'),
    inicio: formData.getAll('radio_inicio[]'),
    fim: formData.getAll('radio_fim[]')
  };

  // Monta o objeto cirurgia
  data.cirurgia = {
    profissional: formData.getAll('cirurgia_profissional[]'),
    crm: formData.getAll('cirurgia_crm[]'),
    inicio: formData.getAll('cirurgia_inicio[]'),
    fim: formData.getAll('cirurgia_fim[]'),
    tipo: formData.getAll('cirurgia_tipo[]'),
    local: formData.getAll('cirurgia_local[]')
  };

  // Diagnósticos Familiares
  data.diagnosticosFamiliares = {
    nome: formData.getAll('familia[]'),
    cid: formData.getAll('familia_cid[]'),
    parentesco: formData.getAll('familia_parentesco[]'),
    descricao: formData.getAll('familia_descricao[]'),
    observacao: formData.getAll('familia_observacao[]')
  };

  // Diagnósticos do paciente
  data.diagnosticos = {
    nome: formData.getAll('nome[]'),
    cid: formData.getAll('cid[]'),
    descricao: formData.getAll('descricao[]'),
    observacao: formData.getAll('observacao[]')
  };

  // Monta o array de medicamentos
  data.medicamentos = {
    nome: formData.getAll('medicamento_nome[]'),
    dosagem: formData.getAll('medicamento_dosagem[]'),
    frequencia: formData.getAll('medicamento_frequencia[]'),
    observacao: formData.getAll('medicamento_observacao_[]')
  };

  // Conversão dos campos de dinheiro para inteiro, sem o R$ e sem vírgulas
  const moneyFields = ['mae_salario', 'pai_salario', 'outro_salario', 'valor_bpc', 'renda_familiar'];
  moneyFields.forEach(field => {
    if (data[field]) {
      data[field] = parseInt(data[field].replace(/\D/g, ''), 10) || 0;
    }
  });

  await fetch('http://localhost:3000/paciente', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
});