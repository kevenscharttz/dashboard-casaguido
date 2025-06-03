// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Set current date
  const currentDateElement = document.getElementById('current-date');
  if (currentDateElement) {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    currentDateElement.textContent = now.toLocaleDateString('pt-BR', options);
  }
  
  // Initialize sample data with smooth counting animation
  setTimeout(() => {
    animateCounter('total-pacientes', 0, 42, 1500);
    animateCounter('novos-cadastros', 0, 7, 1200);
    animateCounter('pacientes-ativos', 0, 38, 1800);
    animateCounter('cadastros-hoje', 0, 3, 800);
    animateCounter('sistema-pacientes', 0, 42, 1500);
    animateCounter('sistema-ativos', 0, 38, 1800);
  }, 300);
  
  // Add sample patient data
  updatePatientList();
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

// APENAS PARA ENFEITE!!!!!!!! ARRUMAREM QUANDO LIGAR O BANCO 
function updatePatientList() {
  const activityList = document.querySelector('.activity-list');
  if (!activityList) return;
  
  const samplePatients = [
    {
      name: 'Ana Silva',
      date: '15/05/2024',
      status: 'Ativo'
    },
    {
      name: 'João Santos',
      date: '14/05/2024',
      status: 'Em tratamento'
    },
    {
      name: 'Maria Oliveira',
      date: '13/05/2024',
      status: 'Consulta agendada'
    }
  ];
  
  // Clear existing content
  activityList.innerHTML = '';
  
  // Add sample patients
  samplePatients.forEach(patient => {
    const patientItem = document.createElement('div');
    patientItem.className = 'activity-item';
    patientItem.innerHTML = `
      <figure class="activity-icon">
        <span class="material-icons-outlined">person</span>
      </figure>
      <div class="activity-content">
        <h3>${patient.name}</h3>
        <p>Cadastrado em: ${patient.date}</p>
        <time class="activity-time">Status: ${patient.status}</time>
      </div>
    `;
    activityList.appendChild(patientItem);
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
