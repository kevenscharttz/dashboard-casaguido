// Código existente para dropdown do usuário
document.addEventListener('DOMContentLoaded', function() {
    const userMenuButton = document.getElementById('user-menu-button');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    // Função para alternar o dropdown
    function toggleDropdown() {
        const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
        userMenuButton.setAttribute('aria-expanded', !isExpanded);
        dropdownContent.style.display = isExpanded ? 'none' : 'block';
    }
    
    // Event listener para o botão do menu
    if (userMenuButton) {
        userMenuButton.addEventListener('click', toggleDropdown);
        
        // Event listener para tecla Enter/Space no botão
        userMenuButton.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleDropdown();
            }
        });
    }
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', function(event) {
        if (userMenuButton && dropdownContent && !userMenuButton.contains(event.target) && !dropdownContent.contains(event.target)) {
            userMenuButton.setAttribute('aria-expanded', 'false');
            dropdownContent.style.display = 'none';
        }
    });
    
    // Navegação por teclado no dropdown
    if (dropdownContent) {
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

    // Inicializar funcionalidades específicas da página de pacientes
    initPacientesPage();
});

// Menu Funcional
document.addEventListener('click', function(event) {
    const body = document.body;
    const sidebar = document.getElementById('sidebar');

    const isSidebarOpen = body.classList.contains('sidebar-open');
    const clickedInsideSidebar = sidebar.contains(event.target);
    const clickedMenuButton = event.target.closest('.menu-icon');

    if (isSidebarOpen && !clickedInsideSidebar && !clickedMenuButton) {
        body.classList.remove('sidebar-open');
    }
});

function openSidebar() {
    const body = document.body;
    // Alterna a classe para abrir ou fechar
    body.classList.toggle('sidebar-open');
}

function closeSidebar() {
    const body = document.body;
    body.classList.remove('sidebar-open');
}

// Função para criar o conteúdo do prontuário baseado no ID
function createProntuarioContent(prontuarioId) {
    // Dados mock baseados no prontuário - em uma aplicação real, isso viria de uma API
    const pacientesData = {
        'P00123': {
            nome: 'Laura Silva',
            cpf: '12.345.678-9',
            idade: '8 anos',
            nascimento: '15/05/2017',
            cartaoSus: '123 4567 8901 2345',
            endereco: 'Rua Exemplo, 123 - Centro, São Paulo/SP',
            telefone: '(11) 99999-9999',
            diagnostico: 'Leucemia Linfóide Aguda',
            cid: 'C91.0',
            status: 'Em tratamento',
            ultimoAtendimento: '15/05/2025'
        },
        'P00124': {
            nome: 'Miguel Costa',
            cpf: '23.456.789-0',
            idade: '12 anos',
            nascimento: '10/08/2013',
            cartaoSus: '234 5678 9012 3456',
            endereco: 'Av. Principal, 456 - Vila Nova, São Paulo/SP',
            telefone: '(11) 88888-8888',
            diagnostico: 'Linfoma de Hodgkin',
            cid: 'C81.9',
            status: 'Em acompanhamento',
            ultimoAtendimento: '10/05/2025'
        },
        'P00125': {
            nome: 'Julia Oliveira',
            cpf: '34.567.890-1',
            idade: '6 anos',
            nascimento: '22/12/2018',
            cartaoSus: '345 6789 0123 4567',
            endereco: 'Rua das Flores, 789 - Jardim, São Paulo/SP',
            telefone: '(11) 77777-7777',
            diagnostico: 'Neuroblastoma',
            cid: 'C74.9',
            status: 'Acompanhamento urgente',
            ultimoAtendimento: '18/05/2025'
        }
    };

    const paciente = pacientesData[prontuarioId];
    if (!paciente) {
        return '<p>Paciente não encontrado.</p>';
    }

    const iniciais = paciente.nome.split(' ').map(n => n[0]).join('').substring(0, 2);

    return `
        <main class="prontuario-container" role="main" aria-labelledby="prontuario-title">
            <header class="prontuario-header">
                <h1 id="prontuario-title">Prontuário Médico</h1>
                <section class="patient-identification" aria-labelledby="patient-info-title">
                    <h2 id="patient-info-title" class="visually-hidden">Identificação do Paciente</h2>
                    <div class="patient-avatar" role="img" aria-label="Avatar do paciente ${paciente.nome}">${iniciais}</div>
                    <div class="patient-main-details">
                        <h2 id="patient-name">${paciente.nome}</h2>
                        <dl class="patient-meta">
                            <dt class="visually-hidden">Número do Prontuário:</dt>
                            <dd id="patient-id">Prontuário: ${prontuarioId}</dd>
                            <dt class="visually-hidden">Idade:</dt>
                            <dd id="patient-age">${paciente.idade}</dd>
                            <dt class="visually-hidden">CPF:</dt>
                            <dd id="patient-cpf">${paciente.cpf}</dd>
                        </dl>
                    </div>
                </section>
            </header>

            <div class="prontuario-content">
                <section class="dados-pessoais" aria-labelledby="dados-pessoais-title">
                    <h3 id="dados-pessoais-title">Dados Pessoais</h3>
                    <dl class="prontuario-grid">
                        <dt>Data de Nascimento:</dt>
                        <dd id="birth-date">
                            <time datetime="${paciente.nascimento}">${paciente.nascimento}</time>
                        </dd>
                        
                        <dt>Cartão SUS:</dt>
                        <dd id="sus-card">${paciente.cartaoSus}</dd>
                        
                        <dt>Endereço:</dt>
                        <dd id="address">
                            <address>${paciente.endereco}</address>
                        </dd>
                        
                        <dt>Telefone:</dt>
                        <dd id="phone">
                            <a href="tel:${paciente.telefone.replace(/[^\d]/g, '')}">${paciente.telefone}</a>
                        </dd>
                    </dl>
                </section>

                <section class="diagnostico-principal" aria-labelledby="diagnostico-title">
                    <h3 id="diagnostico-title">Diagnóstico Principal</h3>
                    <div class="diagnosis-info">
                        <h4 class="diagnosis-badge">${paciente.diagnostico}</h4>
                        <dl class="diagnosis-details">
                            <dt>CID:</dt>
                            <dd>${paciente.cid}</dd>
                            
                            <dt>Status:</dt>
                            <dd>
                                <span class="status-active" role="status" aria-live="polite">${paciente.status}</span>
                            </dd>
                            
                            <dt>Último atendimento:</dt>
                            <dd>
                                <time datetime="${paciente.ultimoAtendimento}">${paciente.ultimoAtendimento}</time>
                            </dd>
                        </dl>
                    </div>
                </section>

                <section class="historico-tratamentos" aria-labelledby="tratamentos-title">
                    <h3 id="tratamentos-title">Histórico de Tratamentos</h3>
                    <div class="treatment-tabs" role="tablist" aria-label="Tipos de tratamento">
                        <button class="treatment-tab active" role="tab" aria-selected="true" aria-controls="quimio-panel" id="quimio-tab">
                            Quimioterapia
                        </button>
                        <button class="treatment-tab" role="tab" aria-selected="false" aria-controls="radio-panel" id="radio-tab">
                            Radioterapia
                        </button>
                        <button class="treatment-tab" role="tab" aria-selected="false" aria-controls="cirurgia-panel" id="cirurgia-tab">
                            Cirurgias
                        </button>
                    </div>
                    
                    <div class="treatment-content" role="tabpanel" id="quimio-panel" aria-labelledby="quimio-tab">
                        <article class="treatment-item">
                            <header class="treatment-header">
                                <time datetime="2025-03-10" class="treatment-date">10/03/2025</time>
                                <h4>Protocolo XYZ</h4>
                            </header>
                            <div class="treatment-details">
                                <p><strong>Local:</strong> Hospital das Clínicas - São Paulo/SP</p>
                                <p><strong>Observações:</strong> Paciente respondeu bem ao tratamento inicial</p>
                            </div>
                        </article>
                        
                        <article class="treatment-item">
                            <header class="treatment-header">
                                <time datetime="2025-04-15" class="treatment-date">15/04/2025</time>
                                <h4>Protocolo XYZ - Ciclo 2</h4>
                            </header>
                            <div class="treatment-details">
                                <p><strong>Local:</strong> Hospital das Clínicas - São Paulo/SP</p>
                                <p><strong>Observações:</strong> Apresentou náuseas moderadas</p>
                            </div>
                        </article>
                    </div>
                </section>
            </div>

            <footer class="prontuario-actions">
                <button class="btn-print" type="button" aria-label="Imprimir prontuário">
                    <span class="material-icons-outlined" aria-hidden="true">print</span>
                    Imprimir
                </button>
                <button class="btn-pdf" type="button" aria-label="Exportar prontuário como PDF">
                    <span class="material-icons-outlined" aria-hidden="true">picture_as_pdf</span>
                    Exportar PDF
                </button>
            </footer>
        </main>
    `;
}

// Função para criar e exibir o modal do prontuário
function openProntuarioModal(prontuarioId) {
    // Verificar se já existe um modal aberto e removê-lo
    const existingModal = document.getElementById('prontuario-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Criar o modal
    const modal = document.createElement('div');
    modal.id = 'prontuario-modal';
    modal.className = 'modal-wrapper';
    
    // Criar o conteúdo do prontuário
    const prontuarioContent = createProntuarioContent(prontuarioId);
    
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Prontuário do Paciente</h2>
                    <button class="modal-close" type="button" aria-label="Fechar prontuário">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    ${prontuarioContent}
                </div>
            </div>
        </div>
    `;
    
    // Adicionar o modal ao body
    document.body.appendChild(modal);
    
    // Adicionar classe ao body para prevenir scroll
    document.body.classList.add('modal-open');
    
    // Adicionar event listeners
    const closeButton = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    closeButton.addEventListener('click', closeProntuarioModal);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeProntuarioModal();
        }
    });
    
    // Configurar tabs dentro do modal
    setupTabs(modal);
    
    // Configurar botões de ação
    setupProntuarioActions(modal);
}

// Função para fechar o modal
function closeProntuarioModal() {
    const modal = document.getElementById('prontuario-modal');
    if (modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
    }
}

// Função para configurar as tabs do prontuário
function setupTabs(container) {
    const tabs = container.querySelectorAll('[role="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remover active de todas as tabs
            tabs.forEach(t => {
                t.setAttribute('aria-selected', 'false');
                t.classList.remove('active');
            });
            
            // Adicionar active na tab clicada
            this.setAttribute('aria-selected', 'true');
            this.classList.add('active');
        });
    });
}

// Função para configurar ações do prontuário
function setupProntuarioActions(container) {
    const printBtn = container.querySelector('.btn-print');
    const pdfBtn = container.querySelector('.btn-pdf');
    
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }
    
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function() {
            alert('Funcionalidade de exportar PDF será implementada em breve.');
        });
    }
}

// Função para inicializar a página de pacientes
function initPacientesPage() {
    // Selecionar todos os botões de visualizar (olhinho)
    const viewButtons = document.querySelectorAll('.action-btn[title="Ver prontuário"]');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Pegar o ID do prontuário da linha atual
            const row = this.closest('tr');
            const prontuarioId = row.querySelector('td:first-child strong').textContent;
            
            // Abrir o modal com o prontuário
            openProntuarioModal(prontuarioId);
        });
    });
    
    // Fechar modal com a tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProntuarioModal();
        }
    });
    
    // Toggle dos filtros
    const filterBtn = document.getElementById('filterBtn');
    const filterSection = document.getElementById('filterSection');
    const clearFilters = document.getElementById('clearFilters');
    
    if (filterBtn && filterSection) {
        filterBtn.addEventListener('click', function() {
            const isVisible = filterSection.style.display !== 'none';
            filterSection.style.display = isVisible ? 'none' : 'flex';
        });
    }
    
    if (clearFilters) {
        clearFilters.addEventListener('click', function() {
            // Resetar todos os selects
            const selects = filterSection.querySelectorAll('select');
            selects.forEach(select => {
                select.value = '';
            });
        });
    }
}

// Adicionar estilos CSS para o modal
const modalStyles = `
    .modal-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
    }
    
    .modal-content {
        background: white;
        border-radius: 8px;
        width: 95%;
        max-width: 1200px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        position: relative;
        z-index: 10000;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
        background-color: #f8f9fa;
        position: sticky;
        top: 0;
        z-index: 10001;
    }
    
    .modal-header h2 {
        margin: 0;
        color: #333;
        font-size: 1.25rem;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 8px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    
    .modal-close:hover {
        background-color: #f0f0f0;
        color: #333;
    }
    
    .modal-body {
        padding: 0;
        overflow-y: auto;
        max-height: calc(90vh - 80px);
    }
    
    .modal-body .prontuario-container {
        padding: 20px;
    }
    
    body.modal-open {
        overflow: hidden;
    }
    
    .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    /* Estilos básicos para o prontuário dentro do modal */
    .prontuario-header {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e9ecef;
    }
    
    .patient-identification {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .patient-avatar {
        width: 60px;
        height: 60px;
        background: linear-gradient(45deg, #007acc, #0099ff);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.2rem;
    }
    
    .patient-main-details h2 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.5rem;
    }
    
    .patient-meta {
        margin: 0;
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .patient-meta dd {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
    }
    
    .prontuario-content section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .prontuario-content h3 {
        margin: 0 0 1rem 0;
        color: #333;
        font-size: 1.1rem;
        font-weight: 600;
    }
    
    .prontuario-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5rem 1rem;
        margin: 0;
    }
    
    .prontuario-grid dt {
        font-weight: 600;
        color: #495057;
    }
    
    .prontuario-grid dd {
        margin: 0;
        color: #666;
    }
    
    .diagnosis-badge {
        background: #007acc;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
        display: inline-block;
        margin-bottom: 1rem;
    }
    
    .diagnosis-details {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5rem 1rem;
        margin: 0;
    }
    
    .treatment-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .treatment-tab {
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .treatment-tab.active {
        background: #007acc;
        color: white;
        border-color: #007acc;
    }
    
    .treatment-item {
        background: white;
        padding: 1rem;
        border-radius: 6px;
        margin-bottom: 1rem;
        border-left: 4px solid #007acc;
    }
    
    .treatment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .treatment-date {
        color: #666;
        font-size: 0.9rem;
    }
    
    .treatment-header h4 {
        margin: 0;
        color: #333;
    }
    
    .prontuario-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        padding: 1rem 0;
        border-top: 1px solid #eee;
        margin-top: 2rem;
    }
    
    .prontuario-actions button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .prontuario-actions button:hover {
        background: #f8f9fa;
        border-color: #007acc;
    }
    
    @media (max-width: 768px) {
        .modal-content {
            width: 98%;
            margin: 10px;
        }
        
        .patient-identification {
            flex-direction: column;
            text-align: center;
        }
        
        .prontuario-grid {
            grid-template-columns: 1fr;
        }
        
        .treatment-tabs {
            flex-direction: column;
        }
        
        .prontuario-actions {
            flex-direction: column;
        }
    }
`;

// Adicionar os estilos ao documento
if (!document.getElementById('modal-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'modal-styles';
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);
}