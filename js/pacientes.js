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

// Variáveis de controle de paginação
let pacientesData = [];
let paginaAtual = 1;
let pacientesPorPagina = 10;

function atualizarPaginacao(totalPacientes) {
    const paginacao = document.querySelector('.pagination');
    if (!paginacao) return;
    paginacao.innerHTML = '';
    const totalPaginas = Math.ceil(totalPacientes / pacientesPorPagina);
    // Botão anterior
    const btnPrev = document.createElement('button');
    btnPrev.className = 'pagination-btn';
    btnPrev.disabled = paginaAtual === 1;
    btnPrev.innerHTML = '<span class="material-icons-outlined">keyboard_arrow_left</span>';
    btnPrev.onclick = () => { if (paginaAtual > 1) { paginaAtual--; renderizarPacientes(); } };
    paginacao.appendChild(btnPrev);
    // Botões de página
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn' + (i === paginaAtual ? ' active' : '');
        btn.textContent = i;
        btn.onclick = () => { paginaAtual = i; renderizarPacientes(); };
        paginacao.appendChild(btn);
    }
    // Botão próximo
    const btnNext = document.createElement('button');
    btnNext.className = 'pagination-btn';
    btnNext.disabled = paginaAtual === totalPaginas || totalPaginas === 0;
    btnNext.innerHTML = '<span class="material-icons-outlined">keyboard_arrow_right</span>';
    btnNext.onclick = () => { if (paginaAtual < totalPaginas) { paginaAtual++; renderizarPacientes(); } };
    paginacao.appendChild(btnNext);
}

function renderizarPacientes() {
    const tbody = document.getElementById('patients-tbody');
    tbody.innerHTML = '';
    if (!pacientesData.length) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhum paciente encontrado.</td></tr>';
        atualizarPaginacao(0);
        return;
    }
    const inicio = (paginaAtual - 1) * pacientesPorPagina;
    const fim = inicio + pacientesPorPagina;
    const pacientesPagina = pacientesData.slice(inicio, fim);
    pacientesPagina.forEach(paciente => {
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
                    <button class="action-btn btn-delete-paciente" title="Excluir paciente" data-id="${paciente.prontuario}" data-nome="${paciente.nome}">
                        <span class="material-icons-outlined">delete</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    // Evento botão editar
    tbody.querySelectorAll('button[title="Editar dados"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = btn.getAttribute('data-id');
            if (id) {
                window.location.href = `registro.html?id=${id}`;
            }
        });
    });
    // Evento botão apagar
    tbody.querySelectorAll('.btn-delete-paciente').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = btn.getAttribute('data-id');
            const nome = btn.getAttribute('data-nome') || '';
            mostrarModalConfirmacao(id, nome);
        });
    });
    atualizarPaginacao(pacientesData.length);
}

// Modal de confirmação de exclusão
function mostrarModalConfirmacao(id, nome) {
    let modal = document.getElementById('modal-confirm-delete');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-confirm-delete';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.4)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div style="background:#fff;padding:32px 24px;border-radius:8px;max-width:90vw;min-width:320px;box-shadow:0 2px 16px #0002;text-align:center;">
                <h2 style="margin-bottom:16px;font-size:1.2rem;">Confirmar exclusão</h2>
                <p id="modal-delete-msg" style="margin-bottom:24px;"></p>
                <button id="btn-cancel-delete" style="margin-right:16px;padding:8px 18px;">Cancelar</button>
                <button id="btn-confirm-delete" style="background:#c00;color:#fff;padding:8px 18px;">Apagar</button>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.style.display = 'flex';
    }
    document.getElementById('modal-delete-msg').textContent = `Deseja realmente apagar o paciente "${nome}"? Esta ação não poderá ser desfeita.`;
    document.getElementById('btn-cancel-delete').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('btn-confirm-delete').onclick = async () => {
        await apagarPaciente(id, modal);
    };
}

async function apagarPaciente(id, modal) {
    try {
        const resp = await fetch(`/paciente/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('Erro ao apagar paciente');
        modal.style.display = 'none';
        carregarPacientes();
        alert('Paciente apagado com sucesso!');
    } catch (err) {
        alert('Erro ao apagar paciente.');
        modal.style.display = 'none';
    }
}

// Função para buscar e renderizar pacientes reais
async function carregarPacientes() {
    try {
        const response = await fetch('/pacientes');
        if (!response.ok) throw new Error('Erro ao buscar pacientes');
        const pacientes = await response.json();
        pacientesData = pacientes;
        paginaAtual = 1;
        renderizarPacientes();
    } catch (err) {
        const tbody = document.getElementById('patients-tbody');
        tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar pacientes.</td></tr>';
        atualizarPaginacao(0);
        console.error('Erro ao carregar pacientes:', err);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    carregarPacientes();
    // Evento para mudar quantidade de pacientes por página
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', function() {
            pacientesPorPagina = parseInt(this.value, 10);
            paginaAtual = 1;
            renderizarPacientes();
            console.log('Alterou pacientes por página para', pacientesPorPagina);
        });
    }
    // Evento de pesquisa
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const termo = this.value.trim();
            if (termo.length === 0) {
                carregarPacientes();
                return;
            }
            searchTimeout = setTimeout(async () => {
                try {
                    const response = await fetch(`/pacientes/busca?q=${encodeURIComponent(termo)}`);
                    if (!response.ok) throw new Error('Erro ao buscar pacientes');
                    const resultados = await response.json();
                    pacientesData = resultados.map(p => ({
                        prontuario: p.id_pcte,
                        nome: p.nome_pcte,
                        cpf: p.cpf_pcte,
                        idade: p.data_nasc_pcte ? calcularIdade(p.data_nasc_pcte) : '',
                        diagnostico: '',
                        ultimo_tratamento: p.data_cadast_pcte ? new Date(p.data_cadast_pcte).toLocaleDateString('pt-BR') : ''
                    }));
                    paginaAtual = 1;
                    renderizarPacientes();
                } catch (err) {
                    const tbody = document.getElementById('patients-tbody');
                    tbody.innerHTML = '<tr><td colspan="7">Erro ao buscar pacientes.</td></tr>';
                    atualizarPaginacao(0);
                    console.error('Erro ao buscar pacientes:', err);
                }
            }, 400);
        });
    }
});

function calcularIdade(dataNasc) {
    const nasc = new Date(dataNasc);
    const hoje = new Date();
    let anos = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) anos--;
    if (anos < 1) {
        let meses = (hoje.getFullYear() - nasc.getFullYear()) * 12 + (hoje.getMonth() - nasc.getMonth());
        if (hoje.getDate() < nasc.getDate()) meses--;
        meses = Math.max(meses, 0);
        return meses + (meses === 1 ? ' mês' : ' meses');
    } else {
        return anos + (anos === 1 ? ' ano' : ' anos');
    }
}