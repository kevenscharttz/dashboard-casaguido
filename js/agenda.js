
        document.querySelectorAll('.btn-primary').forEach(btn => {
            if (btn.textContent.includes('Novo Agendamento') || btn.textContent.includes('Agendar Novo')) {
                btn.addEventListener('click', () => {
                    document.getElementById('eventModal').style.display = 'flex';
                });
            }
        });
        document.querySelector('.close-btn').addEventListener('click', () => {
            document.getElementById('eventModal').style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === document.getElementById('eventModal')) {
                document.getElementById('eventModal').style.display = 'none';
            }
        });

        document.querySelector('.modal-footer .btn-outline').addEventListener('click', () => {
            document.getElementById('eventModal').style.display = 'none';
        });