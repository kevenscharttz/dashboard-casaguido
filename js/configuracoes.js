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