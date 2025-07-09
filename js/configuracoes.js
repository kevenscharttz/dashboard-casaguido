// Funções básicas para os modais e interações
        function abrirModalResetSenha(nomeUsuario) {
            document.getElementById('reset-user-name').textContent = nomeUsuario;
            document.getElementById('modal-reset-password').style.display = 'block';
        }
        
        function fecharModal() {
            document.getElementById('modal-reset-password').style.display = 'none';
        }
        
        // Event listeners para os botões de ação
        document.addEventListener('DOMContentLoaded', function() {
            // Botões de resetar senha
            document.querySelectorAll('.btn-reset-password').forEach(button => {
                button.addEventListener('click', function() {
                    const row = this.closest('tr');
                    const nomeUsuario = row.cells[0].textContent;
                    abrirModalResetSenha(nomeUsuario);
                });
            });
            
            // Fechar modal ao clicar no X
            document.querySelector('.modal-close').addEventListener('click', fecharModal);
            
            // Fechar modal ao clicar fora dele
            window.addEventListener('click', function(event) {
                const modal = document.getElementById('modal-reset-password');
                if (event.target === modal) {
                    fecharModal();
                }
            });
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

        // Função para buscar e preencher a tabela de usuários
        async function carregarUsuarios() {
            try {
                const response = await fetch('/auth/usuarios');
                const usuarios = await response.json();
                const tbody = document.getElementById('usuarios-tbody');
                tbody.innerHTML = '';
                usuarios.forEach(usuario => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${usuario.id_login}</td>
                        <td>${usuario.usuario_login}</td>
                        <td>
                            <button class="btn-reset-password" data-usuario="${usuario.usuario_login}"><i class="bi bi-key"></i> Resetar Senha</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                // Reatribui eventos aos botões de resetar senha
                document.querySelectorAll('.btn-reset-password').forEach(button => {
                    button.addEventListener('click', function() {
                        const row = this.closest('tr');
                        const nomeUsuario = row.cells[1].textContent;
                        abrirModalResetSenha(nomeUsuario);
                    });
                });
            } catch (error) {
                console.error('Erro ao carregar usuários:', error);
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            carregarUsuarios();
        });

        // Função para cadastrar novo usuário
        async function cadastrarNovoUsuario(event) {
            event.preventDefault();
            const usuario_login = document.getElementById('usuario_login').value;
            const senha_login = document.getElementById('senha_login').value;
            try {
                const response = await fetch('/auth/contas_login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_login, senha_login })
                });
                if (response.ok) {
                    document.getElementById('novo-usuario-form').reset();
                    await carregarUsuarios();
                    alert('Usuário cadastrado com sucesso!');
                } else {
                    const erro = await response.json();
                    alert(erro.erro || 'Erro ao cadastrar usuário.');
                }
            } catch (error) {
                alert('Erro ao cadastrar usuário.');
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('novo-usuario-form');
            if (form) {
                form.addEventListener('submit', cadastrarNovoUsuario);
            }
        });
