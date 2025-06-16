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

// Função para criar e exibir o modal do prontuário
function openProntuarioModal(prontuarioId) {
    // Criar o modal
    const modal = document.createElement('div');
    modal.id = 'prontuario-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Carregando prontuário...</h2>
                    <button class="modal-close" onclick="closeProntuarioModal()">
                        <span class="material-icons-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="loading-spinner">Carregando...</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Carregar o conteúdo do prontuário
    fetch('prontuario.html')
        .then(response => response.text())
        .then(html => {
            // Extrair apenas o conteúdo do main do prontuário
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const prontuarioContent = doc.querySelector('.prontuario-container');
            
            if (prontuarioContent) {
                // Substituir o conteúdo do modal
                modal.querySelector('.modal-body').innerHTML = prontuarioContent.outerHTML;
                modal.querySelector('.modal-header h2').textContent = 'Prontuário do Paciente';
                
                // Adicionar evento para fechar o modal nos botões do prontuário
                const closeButtons = modal.querySelectorAll('.btn-close, .modal-close');
                closeButtons.forEach(btn => {
                    btn.addEventListener('click', closeProntuarioModal);
                });
                
                // Executar o script do prontuário se necessário
                const script = document.createElement('script');
                script.src = '../js/prontuario.js';
                document.head.appendChild(script);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar prontuário:', error);
            modal.querySelector('.modal-body').innerHTML = '<p>Erro ao carregar o prontuário.</p>';
        });
}

// Função para fechar o modal
function closeProntuarioModal() {
    const modal = document.getElementById('prontuario-modal');
    if (modal) {
        modal.remove();
    }
}

// Inicialização dos event listeners
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Fechar modal ao clicar no overlay
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeProntuarioModal();
        }
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
            filterSection.style.display = filterSection.style.display === 'none' ? 'flex' : 'none';
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
});

// Adicionar estilos CSS para o modal
const modalStyles = `
    #prontuario-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
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
    }
    
    .modal-content {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 1200px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
        background-color: #f8f9fa;
    }
    
    .modal-header h2 {
        margin: 0;
        color: #333;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 5px;
        border-radius: 4px;
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
    
    .loading-spinner {
        text-align: center;
        padding: 40px;
        color: #666;
    }
`;

// Adicionar os estilos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);