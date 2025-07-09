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
                    <button class="action-btn btn-prontuario" title="Prontuário" data-id="${paciente.prontuario}">
                        <span class="material-icons-outlined">assignment</span>
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
    // Evento botão visualizar prontuário (olho)
    tbody.querySelectorAll('button[title="Ver prontuário"]').forEach((btn, idx) => {
        btn.addEventListener('click', function() {
            const paciente = pacientesData[(paginaAtual - 1) * pacientesPorPagina + idx];
            abrirModalProntuario(paciente.prontuario);
        });
    });
    // Evento botão prontuário (prancheta/documento)
    setTimeout(() => {
        tbody.querySelectorAll('.btn-prontuario').forEach((btn, idx) => {
            btn.onclick = function() {
                const paciente = pacientesData[(paginaAtual - 1) * pacientesPorPagina + idx];
                // Redireciona para a página de prontuário com o ID do paciente
                window.location.href = `prontuario.html?id=${paciente.prontuario}`;
            };
        });
    }, 0);
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

// Função para abrir o modal do prontuário
function abrirModalProntuario(idPaciente) {
    // Cria o modal se não existir
    let modal = document.getElementById('modal-prontuario');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-prontuario';
        modal.className = 'modal-prontuario-bg';
        modal.innerHTML = `<div class="modal-prontuario-content"><span class="modal-close" id="closeProntuario">&times;</span><div id="prontuario-dinamico">Carregando...</div></div>`;
        document.body.appendChild(modal);
    } else {
        modal.style.display = 'flex';
    }
    document.getElementById('closeProntuario').onclick = () => { modal.style.display = 'none'; };
    // Busca os dados do paciente e preenche o modal
    fetch(`/paciente/${idPaciente}`)
        .then(resp => resp.json())
        .then(paciente => preencherProntuarioDinamico(paciente))
        .catch(() => { document.getElementById('prontuario-dinamico').innerHTML = 'Erro ao carregar prontuário.'; });
}

// Função para preencher o HTML do prontuário dinamicamente
function preencherProntuarioDinamico(p) {
    const html = `
        <h2>Prontuário de ${p.nome_pcte || ''}</h2>
        <p><strong>CPF:</strong> ${p.cpf_pcte || ''}</p>
        <p><strong>Data de Nascimento:</strong> ${p.data_nasc_pcte ? new Date(p.data_nasc_pcte).toLocaleDateString('pt-BR') : ''}</p>
        <p><strong>Cartão SUS:</strong> ${p.cns_pcte || ''}</p>
        <p><strong>Endereço:</strong> ${p.endereco || ''}</p>
        <p><strong>Telefone:</strong> ${p.tel_pcte || ''}</p>
        <p><strong>Contato Emergência:</strong> ${p.contato_emergencia || ''}</p>
        <!-- Adicione mais campos conforme necessário -->
    `;
    document.getElementById('prontuario-dinamico').innerHTML = html;
}

// Função para abrir o modal do prontuário completo com layout do prontuario.html
function abrirModalProntuarioCompleto(idPaciente) {
    let modal = document.getElementById('modal-prontuario');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-prontuario';
        modal.className = 'modal-prontuario-bg';
        modal.innerHTML = `<div class="modal-prontuario-content" style="max-width:1200px;width:98vw;padding:0;overflow:auto;max-height:98vh;">
            <span class="modal-close" id="closeProntuario">&times;</span>
            <div id="prontuario-dinamico"></div>
        </div>`;
        document.body.appendChild(modal);
    } else {
        modal.style.display = 'flex';
    }
    document.getElementById('closeProntuario').onclick = () => { modal.style.display = 'none'; };
    fetch(`/paciente/${idPaciente}`)
        .then(resp => resp.json())
        .then(paciente => preencherProntuarioCompletoComLayout(paciente))
        .catch(() => { document.getElementById('prontuario-dinamico').innerHTML = 'Erro ao carregar prontuário.'; });
}

// Função para preencher o HTML do prontuário completo com layout do prontuario.html
function preencherProntuarioCompletoComLayout(p) {
    // Avatar com iniciais
    const avatar = (p.nome_pcte || '').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || 'NI';
    // Exemplo de endereço
    const endereco = p.endereco || '';
    // Exemplo de familiares (ajuste conforme estrutura do seu backend)
    const familiares = p.familiares || [];
    // Diagnóstico e tratamentos (ajuste conforme estrutura do seu backend)
    const diagnostico = p.diagnostico || '';
    const cid = p.cid || '';
    const status = p.status || '';
    const ultimoAtendimento = p.ultimo_atendimento || '';
    const tratamentos = p.tratamentos || [];
    // Socioeconômico
    const renda = p.renda_familiar || '';
    const bpc = p.bpc || '';
    const escola = p.escola || '';
    const moradia = p.moradia || '';
    // Histórico de saúde
    const condicoes = p.condicoes || '';
    const medicamentos = p.medicamentos || [];
    const ubs = p.ubs || '';
    const historicoFamiliar = p.historico_familiar || '';
    // Monta o HTML
    const html = `
    <main class="prontuario-container" role="main" aria-labelledby="prontuario-title">
        <header class="prontuario-header">
            <img class="logo-nova" src="../img/logo-nova.png" alt="Logo Casa Guido" width="100" height="100">
            <h1 id="prontuario-title">Prontuário Médico</h1>
            <section class="patient-identification" aria-labelledby="patient-info-title">
                <h2 id="patient-info-title" class="visually-hidden">Identificação do Paciente</h2>
                <div class="patient-avatar" role="img">${avatar}</div>
                <div class="patient-main-details">
                    <h2 id="patient-name">${p.nome_pcte || ''}</h2>
                    <dl class="patient-meta">
                        <dt class="visually-hidden">Número do Prontuário:</dt>
                        <dd id="patient-id">Prontuário: ${p.id_pcte || ''}</dd>
                        <dt class="visually-hidden">Idade:</dt>
                        <dd id="patient-age">Idade: ${p.data_nasc_pcte ? calcularIdade(p.data_nasc_pcte) : ''}</dd>
                        <dt class="visually-hidden">CPF:</dt>
                        <dd id="patient-cpf">CPF: ${p.cpf_pcte || ''}</dd>
                    </dl>
                </div>
            </section>
        </header>
        <div class="prontuario-content">
            <section class="dados-pessoais" aria-labelledby="dados-pessoais-title">
                <h3 id="dados-pessoais-title">Dados Pessoais</h3>
                <dl class="prontuario-grid">
                    <div class="prontuario-grid-item">
                        <dt>Data de Nascimento:</dt>
                        <dd id="birth-date">
                            <time>${p.data_nasc_pcte ? new Date(p.data_nasc_pcte).toLocaleDateString('pt-BR') : ''}</time>
                        </dd>
                    </div>
                    <div class="prontuario-grid-item">
                        <dt>Cartão SUS:</dt>
                        <dd id="sus-card">${p.cns_pcte || ''}</dd>
                    </div>
                    <div class="prontuario-grid-item">
                        <dt>Endereço:</dt>
                        <dd id="address"><address>${endereco}</address></dd>
                    </div>
                    <div class="prontuario-grid-item">
                        <dt>Telefone:</dt>
                        <dd id="phone"><a href="tel:${p.tel_pcte || ''}">${p.tel_pcte || ''}</a></dd>
                    </div>
                </dl>
            </section>
            <section class="dados-familiares" aria-labelledby="familia-title">
                <h3 id="familia-title">Familiares</h3>
                <div class="family-grid">
                    ${(familiares.length ? familiares.map(f => `
                    <article class="family-member">
                        <h4>${f.parentesco || ''}</h4>
                        <dl>
                            <dt>Nome:</dt><dd>${f.nome || ''}</dd>
                            <dt>Telefone:</dt><dd><a href="tel:${f.telefone || ''}">${f.telefone || ''}</a></dd>
                            <dt>Responsável principal:</dt><dd>${f.responsavel_principal ? 'Sim' : 'Não'}</dd>
                        </dl>
                    </article>
                    `).join('') : '<p>Nenhum familiar cadastrado.</p>')}
                </div>
            </section>
            <section class="diagnostico-principal" aria-labelledby="diagnostico-title">
                <h3 id="diagnostico-title">Diagnósticos</h3>
                <div class="diagnosis-info">
                    <h4 class="diagnosis-badge">${diagnostico}</h4>
                    <dl class="diagnosis-details">
                        <div class="diagnosis-details-item"><dt>CID:</dt><dd>${cid}</dd></div>
                        <div class="diagnosis-details-item"><dt>Status:</dt><dd><span class="status-active">${status}</span></dd></div>
                        <div class="diagnosis-details-item"><dt>Último atendimento:</dt><dd><time>${ultimoAtendimento}</time></dd></div>
                    </dl>
                </div>
            </section>
            <section class="historico-tratamentos" aria-labelledby="tratamentos-title">
                <h3 id="tratamentos-title">Histórico de Tratamentos</h3>
                <div class="treatment-content" role="tabpanel" id="quimio-panel" aria-labelledby="quimio-tab">
                    ${(tratamentos.length ? tratamentos.map(t => `
                    <article class="treatment-item">
                        <header class="treatment-header">
                            <time class="treatment-date">Data de início: ${t.data_inicio || ''}</time>
                            <h4>${t.tipo || ''}</h4>
                        </header>
                        <div class="treatment-details">
                            <p><strong>Local:</strong> ${t.local || ''}</p>
                            <p><strong>Observações:</strong> ${t.observacoes || ''}</p>
                        </div>
                    </article>
                    `).join('') : '<p>Nenhum tratamento registrado.</p>')}
                </div>
            </section>
            <dl class="health-history">
                <dt>Condições de saúde:</dt>
                <dd>${condicoes || 'Nenhuma condição adicional relatada'}</dd>
                <dt>Medicamentos em uso:</dt>
                <dd><ul>${medicamentos.length ? medicamentos.map(m => `<li>${m}</li>`).join('') : '<li>Nenhum</li>'}</ul></dd>
                <dt>UBS de referência:</dt>
                <dd>${ubs || ''}</dd>
                <dt>Histórico familiar de saúde:</dt>
                <dd>${historicoFamiliar || ''}</dd>
            </dl>
            <section class="situacao-socioeconomica" aria-labelledby="socioeconomico-title">
                <h3 id="socioeconomico-title">Situação Socioeconômica</h3>
                <dl class="socioeconomic-info">
                    <dt>Renda familiar:</dt>
                    <dd><data>${renda}</data></dd>
                    <dt>Recebe BPC:</dt>
                    <dd>${bpc}</dd>
                    <dt>Escola:</dt>
                    <dd>${escola}</dd>
                    <dt>Moradia:</dt>
                    <dd>${moradia}</dd>
                </dl>
            </section>
        </div>
        <footer class="prontuario-actions">
            <button class="btn-close" type="button" aria-label="Fechar prontuário" onclick="document.getElementById('modal-prontuario').style.display='none'">
                <span class="material-icons-outlined" aria-hidden="true">close</span>
                Fechar
            </button>
        </footer>
    </main>
    `;
    document.getElementById('prontuario-dinamico').innerHTML = html;
}

// CSS básico para o modal do prontuário
(function() {
    const style = document.createElement('style');
    style.innerHTML = `
    .modal-prontuario-bg {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;
    }
    .modal-prontuario-content {
        background: #fff; border-radius: 8px; max-width: 600px; width: 95vw; padding: 32px 24px; box-shadow: 0 2px 16px #0002; position: relative;
    }
    .modal-close {
        position: absolute; top: 12px; right: 18px; font-size: 2rem; color: #888; cursor: pointer;
    }
    @media (max-width: 600px) {
        .modal-prontuario-content { padding: 12px 4px; }
    }
    `;
    document.head.appendChild(style);
})();