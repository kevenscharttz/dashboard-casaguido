
const form = document.getElementById('cadastro-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

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