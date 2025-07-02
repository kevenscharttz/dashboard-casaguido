document.addEventListener('DOMContentLoaded', function() {
    const userMenuButton = document.getElementById('user-menu-button');
    const dropdownContent = document.querySelector('.dropdown-content');

    if (userMenuButton && dropdownContent) {
        // Função para alternar o dropdown
        function toggleDropdown() {
            const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
            userMenuButton.setAttribute('aria-expanded', !isExpanded);
            dropdownContent.style.display = isExpanded ? 'none' : 'block';
        }

        // Event listener para o botão do menu
        userMenuButton.addEventListener('click', toggleDropdown);

        // Event listener para tecla Enter/Space no botão
        userMenuButton.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleDropdown();
            }
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', function(event) {
            if (!userMenuButton.contains(event.target) && !dropdownContent.contains(event.target)) {
                userMenuButton.setAttribute('aria-expanded', 'false');
                dropdownContent.style.display = 'none';
            }
        });

        // Navegação por teclado no dropdown
        dropdownContent.addEventListener('keydown', function(event) {
            const menuItems = dropdownContent.querySelectorAll('.dropdown-item');
            const currentIndex = Array.from(menuItems).findIndex(item => item === document.activeElement);

            switch(event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
                    menuItems[nextIndex].focus();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
                    menuItems[prevIndex].focus();
                    break;
                case 'Escape':
                    userMenuButton.setAttribute('aria-expanded', 'false');
                    dropdownContent.style.display = 'none';
                    userMenuButton.focus();
                    break;
            }
        });
    }
});

// Funcionalidade da Sidebar
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.querySelector('.menu-icon');
    let isSidebarOpen = false;

    // Função para abrir/fechar sidebar
    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
        body.classList.toggle('sidebar-open', isSidebarOpen);
    }

    // Event listener para o botão do menu
    if (menuButton) {
        menuButton.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleSidebar();
        });
    }

    // Fechar sidebar ao clicar fora dela
    document.addEventListener('click', function(event) {
        const clickedInsideSidebar = sidebar && sidebar.contains(event.target);
        const clickedMenuButton = event.target.closest('.menu-icon');

        if (isSidebarOpen && !clickedInsideSidebar && !clickedMenuButton) {
            isSidebarOpen = false;
            body.classList.remove('sidebar-open');
        }
    });

    // Fechar sidebar ao pressionar ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && isSidebarOpen) {
            isSidebarOpen = false;
            body.classList.remove('sidebar-open');
        }
    });

    // Prevenir propagação de cliques dentro da sidebar
    if (sidebar) {
        sidebar.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
});

// Função para buscar e renderizar pacientes reais
async function carregarPacientes() {
    try {
        const response = await fetch('http://localhost:3000/pacientes');
        if (!response.ok) throw new Error('Erro ao buscar pacientes');
        const pacientes = await response.json();
        const tbody = document.getElementById('patients-tbody');
        tbody.innerHTML = '';
        if (pacientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">Nenhum paciente encontrado.</td></tr>';
            return;
        }
        pacientes.forEach(paciente => {
            const tr = document.createElement('tr');
            function mostrarOuNao(valor) {
                return valor && valor !== '' ? valor : 'Não informado';
            }
            tr.innerHTML = `
                <td><strong>${mostrarOuNao(paciente.prontuario)}</strong></td>
                <td>
                    <div class="patient-info">
                        <div class="patient-avatar">${(paciente.nome || '').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || 'NI'}</div>
                        <div class="patient-details">
                            <span class="patient-name">${mostrarOuNao(paciente.nome)}</span>
                            <span class="patient-id">${mostrarOuNao(paciente.cpf)}</span>
                        </div>
                    </div>
                </td>
                <td>${mostrarOuNao(paciente.idade)}</td>
                <td><span class="badge badge-primary">${mostrarOuNao(paciente.diagnostico)}</span></td>
                <td>${mostrarOuNao(paciente.ultimo_tratamento)}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn" title="Ver prontuário">
                            <span class="material-icons-outlined">visibility</span>
                        </button>
                        <button class="action-btn" title="Editar dados" data-id="${paciente.prontuario}">
                            <span class="material-icons-outlined">edit</span>
                        </button>
                        <button class="action-btn" title="Exportar PDF">
                            <span class="material-icons-outlined">picture_as_pdf</span>
                        </button>
                        <button class="action-btn" title="Excluir paciente">
                            <span class="material-icons-outlined">delete</span>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('button[title="Editar dados"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = btn.getAttribute('data-id');
                window.location.href = `registro.html?id=${id}`;
            });
        });
        
    } catch (err) {
        const tbody = document.getElementById('patients-tbody');
        tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar pacientes.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    carregarPacientes();
});