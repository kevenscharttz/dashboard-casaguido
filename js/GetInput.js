
const form = document.getElementById('cadastro-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  await fetch('http://localhost:3000/paciente', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
});