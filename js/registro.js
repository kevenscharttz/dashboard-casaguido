document.addEventListener('DOMContentLoaded', function() {
    // Inicializações
    initializeFormatting();
    initializeFormLogic();
    initializeBirthDateValidation();
    initializeNavigation();
    initializeValidation();
    
    // Mostra a primeira seção
    showSection(1);
    
    // Configura o submit do formulário
    const form = document.getElementById('cadastro-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateAllSections()) {
                showSuccessMessage();
            }
        });
    }
});

// Funções de formatação
function formatCPF(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
}

function formatPhone(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
        .replace(/(-\d{4})\d+?$/, '$1');
}

function formatCEP(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1');
}

function formatCartaoSUS(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1 $2')
        .replace(/(\d{4})(\d)/, '$1 $2')
        .replace(/(\d{4})(\d)/, '$1 $2')
        .replace(/(\d{4})\d+?$/, '$1');
}

function formatMoney(value) {
    value = value.replace(/\D/g, '');
    value = (parseInt(value) / 100).toFixed(2);
    return 'R$ ' + value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Funções de validação
function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

function validateCartaoSUS(cartao) {
    cartao = cartao.replace(/\D/g, '');
    return cartao.length === 15;
}

function validatePhone(phone) {
    phone = phone.replace(/\D/g, '');
    return phone.length === 10 || phone.length === 11;
}

function validateCEP(cep) {
    cep = cep.replace(/\D/g, '');
    return cep.length === 8;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateBirthDate(birthDate) {
    if (!birthDate) return { isValid: false, message: 'Data de nascimento é obrigatória' };
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    today.setHours(0, 0, 0, 0);
    birth.setHours(0, 0, 0, 0);
    
    if (isNaN(birth.getTime())) {
        return { isValid: false, message: 'Data inválida' };
    }
    
    if (birth > today) {
        return { isValid: false, message: 'Data de nascimento não pode ser no futuro' };
    }
    
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 150);
    if (birth < maxAge) {
        return { isValid: false, message: 'Data de nascimento muito antiga' };
    }
    
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    
    const adjustedAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;
    
    if (adjustedAge > 20) {
        return { isValid: false, message: 'Pacientes acima de 20 anos não são permitidos' };
    }
    
    return { isValid: true, message: '' };
}

function calculateAge(birthDate) {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (isNaN(birth.getTime())) return '';
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }
    
    if (age < 0) return '';
    
    if (age > 20) {
        return 'Idade superior a 20 anos - não permitido';
    }
    
    if (age < 1) {
        const months = today.getMonth() - birth.getMonth() + (12 * (today.getFullYear() - birth.getFullYear()));
        if (months < 0) return '';
        return months + (months === 1 ? ' mês' : ' meses');
    }
    
    return age + (age === 1 ? ' ano' : ' anos');
}

// Inicializações
function initializeFormatting() {
    // CPF
    const cpfFields = ['cpf', 'mae_cpf', 'pai_cpf', 'outro_cpf'];
    cpfFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', function(e) {
                e.target.value = formatCPF(e.target.value);
                const errorElement = document.getElementById(field + '-error');
                if (errorElement) {
                    if (e.target.value && !validateCPF(e.target.value)) {
                        showError(field, 'CPF inválido');
                    } else {
                        hideError(field);
                    }
                }
            });
        }
    });

    // Telefone
    const phoneFields = ['telefone1', 'telefone2', 'mae_telefone', 'pai_telefone', 'outro_telefone'];
    phoneFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', function(e) {
                e.target.value = formatPhone(e.target.value);
                const errorElement = document.getElementById(field + '-error');
                if (errorElement && e.target.value) {
                    if (!validatePhone(e.target.value)) {
                        showError(field, 'Telefone inválido');
                    } else {
                        hideError(field);
                    }
                }
            });
        }
    });

    // CEP
    const cepElement = document.getElementById('cep');
    if (cepElement) {
        cepElement.addEventListener('input', function(e) {
            e.target.value = formatCEP(e.target.value);
            if (e.target.value && !validateCEP(e.target.value)) {
                showError('cep', 'CEP inválido');
            } else {
                hideError('cep');
                if (validateCEP(e.target.value)) {
                    searchCEP(e.target.value.replace(/\D/g, ''));
                }
            }
        });
    }

    // Cartão SUS
    const cartaoSusElement = document.getElementById('cartao_sus');
    if (cartaoSusElement) {
        cartaoSusElement.addEventListener('input', function(e) {
            e.target.value = formatCartaoSUS(e.target.value);
            if (e.target.value && !validateCartaoSUS(e.target.value)) {
                showError('cartao_sus', 'Número de cartão SUS inválido');
            } else {
                hideError('cartao_sus');
            }
        });
    }

    // Campos numéricos
    const numberOnlyFields = ['pessoas_casa', 'comodos', 'quartos'];
    numberOnlyFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }
    });

    // Campos de nome
    const nameFields = ['paciente', 'mae_nome', 'pai_nome', 'outro_nome'];
    nameFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
            });
        }
    });
}

function initializeBirthDateValidation() {
    const birthDateElement = document.getElementById('data_nascimento');
    if (birthDateElement) {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        birthDateElement.setAttribute('max', todayString);
        
        birthDateElement.addEventListener('change', function(e) {
            const validation = validateBirthDate(e.target.value);
            const ageElement = document.getElementById('idade');
            
            if (!validation.isValid) {
                showError('data_nascimento', validation.message);
                if (ageElement) ageElement.value = '';
            } else {
                hideError('data_nascimento');
                if (ageElement) ageElement.value = calculateAge(e.target.value);
            }
        });
        
        birthDateElement.addEventListener('input', function(e) {
            if (e.target.value) {
                const validation = validateBirthDate(e.target.value);
                if (!validation.isValid) {
                    showError('data_nascimento', validation.message);
                } else {
                    hideError('data_nascimento');
                }
            }
        });
    }
}

// Restante do código (initializeFormLogic, validateSection1, etc.) permanece igual
// ... [mantenha as outras funções como estão, sem duplicações]

// Funções de navegação e seções
let currentSection = 1;
const totalSections = 7;

function showSection(sectionNumber) {
    for (let i = 1; i <= totalSections; i++) {
        const section = document.getElementById(`section-${i}`);
        if (section) section.classList.remove('active');
    }
    
    const activeSection = document.getElementById(`section-${sectionNumber}`);
    if (activeSection) activeSection.classList.add('active');
    
    updateProgressIndicator(sectionNumber);
    updateProgressBar(sectionNumber);
    currentSection = sectionNumber;
}

function updateProgressIndicator(sectionNumber) {
    for (let i = 1; i <= totalSections; i++) {
        const stepCircle = document.getElementById(`step-${i}`);
        const stepText = stepCircle?.parentElement.querySelector('.step-text');
        
        if (stepCircle && stepText) {
            if (i < sectionNumber) {
                stepCircle.classList.add('completed');
                stepText.classList.add('completed');
            } else if (i === sectionNumber) {
                stepCircle.classList.add('active');
                stepText.classList.add('active');
            } else {
                stepCircle.classList.remove('active', 'completed');
                stepText.classList.remove('active', 'completed');
            }
        }
    }
}

function updateProgressBar(sectionNumber) {
    const percentage = Math.round((sectionNumber / totalSections) * 100);
    const progressBar = document.getElementById('form-progress');
    const percentageText = document.getElementById('completion-percentage');
    
    if (progressBar) progressBar.style.width = percentage + '%';
    if (percentageText) percentageText.textContent = percentage + '%';
}

function initializeNavigation() {
    for (let i = 1; i <= totalSections - 1; i++) {
        const nextBtn = document.getElementById(`btn-next-${i}`);
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (validateCurrentSection(i)) showSection(i + 1);
            });
        }
    }
    
    for (let i = 2; i <= totalSections; i++) {
        const prevBtn = document.getElementById(`btn-prev-${i}`);
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                showSection(i - 1);
            });
        }
    }
}

function validateCurrentSection(sectionNumber) {
    let isValid = true;
    
    switch (sectionNumber) {
        case 1:
            if (!document.getElementById('paciente').value.trim()) {
                showError('paciente', 'Nome do paciente é obrigatório');
                isValid = false;
            }
            if (!document.getElementById('data_nascimento').value) {
                showError('data_nascimento', 'Data de nascimento é obrigatória');
                isValid = false;
            }
            break;
            
        case 2:
            if (!document.getElementById('telefone1').value.trim()) {
                showError('telefone1', 'Telefone principal é obrigatório');
                isValid = false;
            }
            if (!document.getElementById('cep').value.trim()) {
                showError('cep', 'CEP é obrigatório');
                isValid = false;
            }
            if (!document.getElementById('endereco').value.trim()) {
                showError('endereco', 'Endereço é obrigatório');
                isValid = false;
            }
            break;
            
        case 3:
            if (!document.getElementById('mae_nome').value.trim()) {
                showError('mae_nome', 'Nome da mãe é obrigatório');
                isValid = false;
            }
            break;
    }
    
    return isValid;
}

function validateAllSections() {
    for (let i = 1; i <= totalSections - 1; i++) {
        if (!validateCurrentSection(i)) {
            showSection(i);
            return false;
        }
    }
    return true;
}

// Funções auxiliares
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
    
    if (field) field.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
    
    if (field) field.classList.remove('error');
    if (errorElement) errorElement.style.display = 'none';
}

function showSuccessMessage() {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
        successMessage.style.display = 'block';
        successMessage.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => successMessage.style.display = 'none', 5000);
    }
}

async function searchCEP(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            document.getElementById('endereco').value = data.logradouro || '';
            document.getElementById('bairro').value = data.bairro || '';
            document.getElementById('cidade').value = data.localidade || '';
            document.getElementById('estado').value = data.uf || '';
            document.getElementById('numero').focus();
        }
    } catch (error) {
        console.log('Erro ao buscar CEP:', error);
    }
}