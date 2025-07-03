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

    // Cadastro de novo usuário
    const form = document.getElementById('novo-usuario-form');
    if (form) {
        // Remove event listeners duplicados, se houver
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const usuario_login = document.getElementById('usuario_login').value;
            const senha_login = document.getElementById('senha_login').value;
            await fetch('/api/contas/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ usuario_login, senha_login })
            });
            carregarUsuarios();
            e.target.reset();
        }, { once: true });
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




// Modal de edição de usuário
function abrirModalEditarUsuario(id, usuarioAtual) {
    document.getElementById('editar-id-usuario').value = id;
    document.getElementById('editar-usuario_login').value = usuarioAtual;
    document.getElementById('editar-senha_login').value = '';
    document.getElementById('modal-editar-usuario').style.display = 'block';
}

function fecharModalEditarUsuario() {
    document.getElementById('modal-editar-usuario').style.display = 'none';
}

// Submissão do formulário de edição
document.addEventListener('DOMContentLoaded', function() {
    const formEditar = document.getElementById('editar-usuario-form');
    if (formEditar) {
        formEditar.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('editar-id-usuario').value;
            const usuario_login = document.getElementById('editar-usuario_login').value.trim();
            const senha_login = document.getElementById('editar-senha_login').value.trim();
            if (!usuario_login || !senha_login) {
                alert('Usuário e senha são obrigatórios!');
                return;
            }
            const resp = await fetch(`/api/contas/users/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ usuario_login, senha_login })
            });
            if (resp.status === 409) {
                alert('Já existe um usuário com esse nome!');
            } else if (resp.status === 404) {
                alert('Usuário não encontrado!');
            } else if (!resp.ok) {
                alert('Erro ao editar usuário!');
            } else {
                fecharModalEditarUsuario();
                carregarUsuarios();
            }
        });
    }
});

// Excluir usuário
async function deletarUsuario(id) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        await fetch(`/api/contas/users/${id}`, { method: 'DELETE' });
        carregarUsuarios();
    }
}

// Atualize a função carregarUsuarios para incluir o botão de editar:
async function carregarUsuarios() {
    const res = await fetch('/api/contas/users');
    const usuarios = await res.json();
    const tbody = document.getElementById('usuarios-tbody');
    tbody.innerHTML = '';
    usuarios.forEach(u => {
        tbody.innerHTML += `
            <tr>
                <td>${u.id_login}</td>
                <td>${u.usuario_login}</td>
                <td>
                    <button onclick="abrirModalEditarUsuario(${u.id_login}, '${u.usuario_login.replace(/'/g, "&#39;")}' )">Editar</button>
                    <button onclick="deletarUsuario(${u.id_login})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

window.onload = carregarUsuarios;
