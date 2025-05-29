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
        });
