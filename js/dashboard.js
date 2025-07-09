// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
  // Data atual
  const currentDateElement = document.getElementById('current-date');
  if (currentDateElement) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('pt-BR', options);
  }

  // Busca dados do backend
  try {
    // Total de pacientes
    const totalRes = await fetch('/dashboard/total-pacientes');
    const totalData = await totalRes.json();
    animateCounter('total-pacientes', 0, totalData.total, 1200);
    animateCounter('sistema-pacientes', 0, totalData.total, 1200);

    // Pacientes cadastrados na semana
    const semanaRes = await fetch('/dashboard/cadastros-semana');
    const semanaData = await semanaRes.json();
    animateCounter('novos-cadastros', 0, semanaData.total, 1200);

    // Pacientes cadastrados hoje
    const hojeRes = await fetch('/dashboard/cadastros-hoje');
    const hojeData = await hojeRes.json();
    animateCounter('cadastros-hoje', 0, hojeData.total, 1200);

    // Últimos 3 pacientes
    const ultimosRes = await fetch('/dashboard/ultimos-pacientes');
    const ultimos = await ultimosRes.json();
    updatePatientList(ultimos);
  } catch (e) {
    // fallback: zera tudo
    animateCounter('total-pacientes', 0, 0, 500);
    animateCounter('sistema-pacientes', 0, 0, 500);
    animateCounter('novos-cadastros', 0, 0, 500);
    animateCounter('cadastros-hoje', 0, 0, 500);
    updatePatientList([]);
  }
});

// Sidebar toggle functions
function openSidebar() {
  document.getElementById('sidebar').classList.add('active');
  document.body.classList.add('sidebar-open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('active');
  document.body.classList.remove('sidebar-open');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
  const sidebar = document.getElementById('sidebar');
  const menuIcon = document.querySelector('.menu-icon');
  
  if (window.innerWidth <= 768 && 
      sidebar.classList.contains('active') && 
      !sidebar.contains(event.target) && 
      !menuIcon.contains(event.target)) {
    closeSidebar();
  }
});

// Smooth counter animation
function animateCounter(elementId, start, end, duration = 1000) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const startTime = performance.now();
  const difference = end - start;
  
  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.round(start + (difference * easeOutQuart));
    
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }
  
  requestAnimationFrame(updateCounter);
}

function updatePatientList(pacientes) {
  const activityList = document.querySelector('.activity-list');
  if (!activityList) return;
  activityList.innerHTML = '';
  if (!pacientes || pacientes.length === 0) {
    activityList.innerHTML = `<div class="activity-item">
      <figure class="activity-icon background-blue">
        <span class="material-icons-outlined">person</span>
      </figure>
      <div class="activity-content">
        <h3>Nenhum paciente cadastrado ainda</h3>
        <p>Clique em \"Registro\" para adicionar o primeiro paciente</p>
        <time class="activity-time">Sistema iniciado</time>
      </div>
    </div>`;
    return;
  }
  pacientes.forEach(paciente => {
    const data = paciente.data_cadast_pcte ? new Date(paciente.data_cadast_pcte).toLocaleDateString('pt-BR') : '';
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <figure class="activity-icon">
        <span class="material-icons-outlined">person</span>
      </figure>
      <div class="activity-content">
        <h3>${paciente.nome_pcte}</h3>
        <p>Cadastrado em: ${data}</p>
      </div>
    `;
    activityList.appendChild(item);
  });
}

// Add smooth hover effects
document.addEventListener('DOMContentLoaded', function() {
  // Card hover effects
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Quick button hover effects
  const quickButtons = document.querySelectorAll('.quick-button');
  quickButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
});

// Handle window resize
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    closeSidebar();
  }
});

//Menu Funcional
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
