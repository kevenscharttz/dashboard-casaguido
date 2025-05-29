// Funções para o menu responsivo
function openSidebar() {
  console.log('Abrindo sidebar...'); // Debug
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.add('sidebar-responsive');
    console.log('Classe adicionada:', sidebar.classList); // Debug
  } else {
    console.error('Sidebar não encontrado!');
  }
}

function closeSidebar() {
  console.log('Fechando sidebar...'); // Debug
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.remove('sidebar-responsive');
    console.log('Classe removida:', sidebar.classList); // Debug
  } else {
    console.error('Sidebar não encontrado!');
  }
}

// Fechar sidebar ao clicar fora dele
document.addEventListener('click', function(event) {
  const sidebar = document.getElementById('sidebar');
  const menuIcon = document.querySelector('.menu-icon');
  
  // Se o sidebar está aberto e o clique foi fora do sidebar e não no menu
  if (sidebar && sidebar.classList.contains('sidebar-responsive') && 
      !sidebar.contains(event.target) && 
      !menuIcon.contains(event.target)) {
    closeSidebar();
  }
});

// Fechar sidebar com a tecla Escape
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('sidebar-responsive')) {
      closeSidebar();
    }
  }
});

// Mostrar data atual
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado'); // Debug
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  const currentDateElement = document.getElementById('current-date');
  
  if (currentDateElement) {
    currentDateElement.textContent = today.toLocaleDateString('pt-BR', options);
  }
  
  // Carregar dados dos pacientes do localStorage
  carregarDadosDashboard();
  
  // Verificar se os elementos existem (debug)
  console.log('Menu icon:', document.querySelector('.menu-icon'));
  console.log('Sidebar:', document.getElementById('sidebar'));
});

function carregarDadosDashboard() {
  // Recuperar dados dos pacientes do localStorage
  const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
  
  // Atualizar contadores
  const totalPacientes = document.getElementById('total-pacientes');
  const sistemaPacientes = document.getElementById('sistema-pacientes');
  
  if (totalPacientes) {
    totalPacientes.textContent = pacientes.length;
    totalPacientes.setAttribute('value', pacientes.length);
  }
  
  if (sistemaPacientes) {
    sistemaPacientes.textContent = pacientes.length;
    sistemaPacientes.setAttribute('value', pacientes.length);
  }
  
  // Calcular pacientes ativos (exemplo: pacientes cadastrados nos últimos 30 dias)
  const hoje = new Date();
  const trintaDiasAtras = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  const pacientesAtivos = pacientes.filter(paciente => {
    if (paciente.dataCadastro) {
      const dataCadastro = new Date(paciente.dataCadastro);
      return dataCadastro >= trintaDiasAtras;
    }
    return false;
  });
  
  const pacientesAtivosEl = document.getElementById('pacientes-ativos');
  const sistemaAtivosEl = document.getElementById('sistema-ativos');
  
  if (pacientesAtivosEl) {
    pacientesAtivosEl.textContent = pacientesAtivos.length;
    pacientesAtivosEl.setAttribute('value', pacientesAtivos.length);
  }
  
  if (sistemaAtivosEl) {
    sistemaAtivosEl.textContent = pacientesAtivos.length;
    sistemaAtivosEl.setAttribute('value', pacientesAtivos.length);
  }
  
  // Calcular cadastros desta semana
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  inicioSemana.setHours(0, 0, 0, 0);
  
  const cadastrosEstaSemana = pacientes.filter(paciente => {
    if (paciente.dataCadastro) {
      const dataCadastro = new Date(paciente.dataCadastro);
      return dataCadastro >= inicioSemana;
    }
    return false;
  });
  
  const novosCadastrosEl = document.getElementById('novos-cadastros');
  if (novosCadastrosEl) {
    novosCadastrosEl.textContent = cadastrosEstaSemana.length;
    novosCadastrosEl.setAttribute('value', cadastrosEstaSemana.length);
  }
  
  // Calcular cadastros de hoje
  const inicioHoje = new Date(hoje);
  inicioHoje.setHours(0, 0, 0, 0);
  
  const cadastrosHoje = pacientes.filter(paciente => {
    if (paciente.dataCadastro) {
      const dataCadastro = new Date(paciente.dataCadastro);
      return dataCadastro >= inicioHoje;
    }
    return false;
  });
  
  const cadastrosHojeEl = document.getElementById('cadastros-hoje');
  if (cadastrosHojeEl) {
    cadastrosHojeEl.textContent = cadastrosHoje.length;
    cadastrosHojeEl.setAttribute('value', cadastrosHoje.length);
  }
  
  // Atualizar lista de últimos pacientes
  atualizarUltimosPacientes(pacientes);
}

function atualizarUltimosPacientes(pacientes) {
  const activityList = document.querySelector('.activity-list');
  
  if (!activityList || pacientes.length === 0) {
    return; // Manter mensagem padrão
  }
  
  // Ordenar por data de cadastro (mais recentes primeiro)
  const pacientesOrdenados = pacientes.sort((a, b) => {
    const dataA = new Date(a.dataCadastro || 0);
    const dataB = new Date(b.dataCadastro || 0);
    return dataB - dataA;
  });
  
  // Pegar os 4 mais recentes
  const ultimosPacientes = pacientesOrdenados.slice(0, 4);
  
  // Limpar lista atual
  activityList.innerHTML = '';
  
  // Adicionar últimos pacientes
  ultimosPacientes.forEach(paciente => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    const dataCadastro = paciente.dataCadastro ? new Date(paciente.dataCadastro).toLocaleDateString('pt-BR') : 'Data não informada';
    
    activityItem.innerHTML = `
      <figure class="activity-icon background-blue">
        <span class="material-icons-outlined">person</span>
      </figure>
      <div class="activity-content">
        <h3>Paciente cadastrado</h3>
        <p>Nome: ${paciente.nome || 'Nome não informado'}</p>
        <time class="activity-time">${dataCadastro}</time>
      </div>
    `;
    
    activityList.appendChild(activityItem);
  });
}
