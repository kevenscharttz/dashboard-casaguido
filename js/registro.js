document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApplication();
    } catch (error) {
        console.error('Erro na inicialização da aplicação:', error);
        showGlobalError();
    }
});

function initializeApplication() {
    initializeFormatting();
    initializeValidation();
    initializeFormLogic();
    initializeBirthDateValidation();
    initializeNavigation();
    showSection(1);
    
    setupFormSubmission();
}

// ==================== FUNÇÕES DE FORMATAÇÃO ====================

function formatCPF(value) {
    if (!value) return '';
    
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
}

function formatPhone(value) {
    if (!value) return '';
    
    const digits = value.replace(/\D/g, '');
    const isCellphone = digits.length === 11;
    
    return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(isCellphone ? /(\d{5})(\d)/ : /(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
}

function formatCEP(value) {
    if (!value) return '';
    
    return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1');
}

function formatCartaoSUS(value) {
    if (!value) return '';
    
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1 $2')
        .replace(/(\d{4})(\d)/, '$1 $2')
        .replace(/(\d{4})(\d)/, '$1 $2')
        .replace(/(\d{4})\d+?$/, '$1');
}

function formatMoney(value) {
    if (!value) return '';
    
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    
    const amount = parseInt(digits) / 100;
    return amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function formatName(value) {
    if (!value) return '';
    
    // Remove caracteres especiais, mantendo acentos e espaços
    return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
}

// ==================== FUNÇÕES DE VALIDAÇÃO ====================

// Validação de CPF
function validateCPF(cpf) {
    if (!cpf) return false;
    cpf = cpf.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

    // Verifica se tem 11 dígitos e não é uma sequência repetida
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
}

// Validação de Cartão SUS
function validateCartaoSUS(cartao) {
    if (!cartao) return false;
    cartao = cartao.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

    // Verifica se tem 15 dígitos
    if (cartao.length !== 15) {
        return false;
    }

    // Verificação do dígito verificador pode ser implementada aqui, se necessário

    return true;
}

function validatePhone(phone) {
    if (!phone) return false;
    
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11;
}

function validateCEP(cep) {
    if (!cep) return false;
    return cep.replace(/\D/g, '').length === 8;
}

function validateEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateBirthDate(birthDate) {
    if (!birthDate) return { isValid: false, message: 'Data de nascimento é obrigatória' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
        return { isValid: false, message: 'Data inválida' };
    }
    
    birth.setHours(0, 0, 0, 0);
    
    if (birth > today) {
        return { isValid: false, message: 'Data de nascimento não pode ser no futuro' };
    }
    
    const maxAgeDate = new Date();
    maxAgeDate.setFullYear(maxAgeDate.getFullYear() - 150);
    if (birth < maxAgeDate) {
        return { isValid: false, message: 'Data de nascimento muito antiga' };
    }
    
    return { isValid: true, message: '' };
}

function calculateAge(birthDateString) {
    // Verifica se a data está completa (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDateString)) return '';
    
    const birthDate = new Date(birthDateString);
    const today = new Date();
    
    // Verifica se a data é válida
    if (isNaN(birthDate.getTime())) return '';
    
    // Calcula a diferença
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Ajusta se ainda não fez aniversário este ano
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    // Retorna vazio para datas futuras
    if (age < 0) return '';
    
    // Formata a saída
    return age + (age === 1 ? ' ano' : ' anos');
}

// Função para validar data enquanto digita
function handleDateInput(event) {
    const input = event.target;
    const dateValue = input.value;
    
    // Só calcula quando a data estiver completa (10 caracteres)
    if (dateValue.length === 10) {
        const ageElement = document.getElementById('idade');
        if (ageElement) {
            ageElement.value = calculateAge(dateValue);
        }
    } else if (dateValue.length > 0 && dateValue.length < 10) {
        // Data incompleta - limpa a idade
        const ageElement = document.getElementById('idade');
        if (ageElement) {
            ageElement.value = '';
        }
    }
}

// ==================== INICIALIZAÇÃO DE COMPONENTES ====================

function initializeFormatting() {
    // Formatação de CPF
    const cpfFields = ['cpf', 'mae_cpf', 'pai_cpf', 'outro_cpf'];
    setupFieldFormatting(cpfFields, formatCPF, validateCPF, 'CPF inválido');
    
    // Formatação de telefone
    const phoneFields = ['telefone1', 'telefone2', 'mae_telefone', 'pai_telefone', 'outro_telefone'];
    setupFieldFormatting(phoneFields, formatPhone, validatePhone, 'Telefone inválido');
    
    // Formatação de CEP
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
    
    // Formatação de Cartão SUS
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
    
    // Formatação de valores monetários
    const salaryFields = ['mae_salario', 'pai_salario', 'outro_salario', 'valor_bpc', 'renda_familiar'];
    salaryFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', function(e) {
                e.target.value = formatMoney(e.target.value);
                calculateTotalIncome();
            });
        }
    });
    
    // Campos numéricos apenas
    const numberOnlyFields = ['pessoas_casa', 'comodos', 'quartos'];
    numberOnlyFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }
    });
    
    // Campos de nome (apenas letras e espaços)
    const nameFields = ['paciente', 'mae_nome', 'pai_nome', 'outro_nome'];
    nameFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', function(e) {
                e.target.value = formatName(e.target.value);
            });
        }
    });
}

function setupFieldFormatting(fields, formatter, validator, errorMessage) {
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', function(e) {
                e.target.value = formatter(e.target.value);
                
                const errorElement = document.getElementById(field + '-error');
                if (errorElement) {
                    if (e.target.value && !validator(e.target.value)) {
                        showError(field, errorMessage);
                    } else {
                        hideError(field);
                    }
                }
            });
        }
    });
}

function initializeBirthDateValidation() {
    const birthDateElement = document.getElementById('data_nascimento');
    if (birthDateElement) {
        // Define a data máxima como hoje
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        birthDateElement.setAttribute('max', todayString);
        
        // Calcula idade ao sair do campo
        birthDateElement.addEventListener('blur', function(e) {
            const ageElement = document.getElementById('idade');
            if (ageElement) {
                ageElement.value = calculateAge(e.target.value);
            }
        });
        
        // Atualiza idade enquanto digita (opcional)
        birthDateElement.addEventListener('input', handleDateInput);
    }
}

function handleBirthDateChange(birthDate) {
    const validation = validateBirthDate(birthDate);
    const ageElement = document.getElementById('idade');
    
    if (!validation.isValid) {
        showError('data_nascimento', validation.message);
        if (ageElement) ageElement.value = '';
    } else {
        hideError('data_nascimento');
        if (ageElement) ageElement.value = calculateAge(birthDate);
    }
}

function initializeValidation() {
    const requiredFields = [
        'paciente', 'data_nascimento', 'telefone1', 'cep', 
        'endereco', 'numero', 'bairro', 'cidade', 'estado', 'mae_nome'
    ];

    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('blur', function(e) {
                if (!e.target.value.trim()) {
                    showError(field, 'Este campo é obrigatório');
                } else {
                    hideError(field);
                }
            });
            
            element.addEventListener('input', function(e) {
                if (e.target.value.trim()) {
                    hideError(field);
                }
            });
        }
    });
}

function initializeFormLogic() {
    // Configura os campos condicionais
    setupConditionalField('fez_quimio', 'quimio-fields');
    setupConditionalField('fez_radio', 'radio-fields');
    setupConditionalField('fez_cirurgia', 'cirurgia-fields');
    setupConditionalField('usa_medicamentos', 'medicamentos-fields');
    setupConditionalField('tem_bpc', 'bpc-fields');
    setupConditionalField('estuda', 'escola-fields');
    
    // Configura o campo de outro responsável
    const outroResponsavelCheckbox = document.getElementById('tem_outro_responsavel');
    if (outroResponsavelCheckbox) {
        outroResponsavelCheckbox.addEventListener('change', function() {
            const fields = document.getElementById('outro-responsavel-fields');
            if (fields) {
                fields.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
    
    // Configura os botões de adicionar
    setupAddButtons();
}

function setupConditionalField(radioName, fieldsId) {
    const radios = document.querySelectorAll(`input[name="${radioName}"]`);
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            const fields = document.getElementById(fieldsId);
            if (fields) {
                fields.style.display = this.value === 'sim' ? 'block' : 'none';
            }
        });
    });
}

function setupAddButtons() {
    // Configura o botão de adicionar quimioterapia
    const addQuimioBtn = document.getElementById('add-quimio');
    if (addQuimioBtn) {
        addQuimioBtn.addEventListener('click', function() {
            addDynamicItem('quimio-list', 'quimio-item', ['quimio_data', 'quimio_local']);
        });
    }
    
    // Configura o botão de adicionar radioterapia
    const addRadioBtn = document.getElementById('add-radio');
    if (addRadioBtn) {
        addRadioBtn.addEventListener('click', function() {
            addDynamicItem('radio-list', 'radio-item-form', ['radio_data', 'radio_local']);
        });
    }
    
    // Configura o botão de adicionar cirurgia
    const addCirurgiaBtn = document.getElementById('add-cirurgia');
    if (addCirurgiaBtn) {
        addCirurgiaBtn.addEventListener('click', function() {
            addDynamicItem('cirurgia-list', 'cirurgia-item', ['cirurgia_data', 'cirurgia_local']);
        });
    }
    
    // Configura o botão de adicionar diagnóstico
    const addDiagnosticoBtn = document.getElementById('add-diagnostico');
    if (addDiagnosticoBtn) {
        addDiagnosticoBtn.addEventListener('click', function() {
            addDynamicItem('diagnosticos-list', 'diagnostico-item', ['cid', 'descricao'], 'observacao');
        });
    }
    
    // Configura o botão de adicionar diagnóstico familiar
    const addDiagnosticoFamiliaBtn = document.getElementById('add-diagnostico-familia');
    if (addDiagnosticoFamiliaBtn) {
        addDiagnosticoFamiliaBtn.addEventListener('click', function() {
            addDynamicItem('diagnosticos-familia-list', 'diagnostico-familia-item', 
                         ['familia_cid', 'familia_parentesco', 'familia_descricao'], 'familia_observacao');
        });
    }
    
    // Configura o botão de adicionar medicamento
    const addMedicamentoBtn = document.getElementById('add-medicamento');
    if (addMedicamentoBtn) {
        addMedicamentoBtn.addEventListener('click', function() {
            addDynamicItem('medicamentos-list', 'medicamento-item', 
                         ['medicamento_nome', 'medicamento_dosagem', 'medicamento_frequencia']);
        });
    }
}

function addDynamicItem(listId, itemClass, fieldPrefixes, textareaPrefix = null) {
    const list = document.getElementById(listId);
    if (!list) return;
    
    const items = list.getElementsByClassName(itemClass);
    const newIndex = items.length + 1;
    
    // Clona o último item ou usa o primeiro como modelo
    const template = items.length > 0 ? items[items.length - 1].cloneNode(true) : items[0].cloneNode(true);
    
    // Atualiza os IDs e names dos campos
    fieldPrefixes.forEach(prefix => {
        const field = template.querySelector(`[id^="${prefix}_"]`);
        if (field) {
            const newId = `${prefix}_${newIndex}`;
            field.id = newId;
            field.name = newId;
            field.value = '';
        }
    });
    
    if (textareaPrefix) {
        const textarea = template.querySelector(`[id^="${textareaPrefix}_"]`);
        if (textarea) {
            const newId = `${textareaPrefix}_${newIndex}`;
            textarea.id = newId;
            textarea.name = newId;
            textarea.value = '';
        }
    }
    
    // Adiciona o novo item à lista
    list.appendChild(template);
    
    // Rolagem suave para o novo item
    template.scrollIntoView({ behavior: 'smooth' });
}

// ==================== NAVEGAÇÃO E SEÇÕES ====================

let currentSection = 1;
const totalSections = 7;

function showSection(sectionNumber) {
    // Valida se a seção existe
    if (sectionNumber < 1 || sectionNumber > totalSections) return;
    
    // Esconde todas as seções
    for (let i = 1; i <= totalSections; i++) {
        const section = document.getElementById(`section-${i}`);
        if (section) {
            section.classList.remove('active');
        }
    }
    
    // Mostra a seção atual
    const activeSection = document.getElementById(`section-${sectionNumber}`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // Atualiza indicadores de progresso
    updateProgressIndicator(sectionNumber);
    updateProgressBar(sectionNumber);
    
    // Atualiza a seção atual
    currentSection = sectionNumber;
    
    // Rolagem para o topo
    window.scrollTo(0, 0);
}

function updateProgressIndicator(sectionNumber) {
    for (let i = 1; i <= totalSections; i++) {
        const stepCircle = document.getElementById(`step-${i}`);
        const stepText = stepCircle?.parentElement.querySelector('.step-text');
        
        if (stepCircle && stepText) {
            if (i < sectionNumber) {
                stepCircle.classList.add('completed');
                stepCircle.classList.remove('active');
                stepText.classList.add('completed');
                stepText.classList.remove('active');
            } else if (i === sectionNumber) {
                stepCircle.classList.add('active');
                stepCircle.classList.remove('completed');
                stepText.classList.add('active');
                stepText.classList.remove('completed');
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
    
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    
    if (percentageText) {
        percentageText.textContent = percentage + '%';
    }
}

function initializeNavigation() {
    // Configura os botões "Próximo"
    for (let i = 1; i <= totalSections - 1; i++) {
        const nextBtn = document.getElementById(`btn-next-${i}`);
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (validateCurrentSection(i)) {
                    showSection(i + 1);
                }
            });
        }
    }
    
    // Configura os botões "Anterior"
    for (let i = 2; i <= totalSections; i++) {
        const prevBtn = document.getElementById(`btn-prev-${i}`);
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                showSection(i - 1);
            });
        }
    }
}

// ==================== VALIDAÇÃO DE SEÇÕES ====================

function validateCurrentSection(sectionNumber) {
    let isValid = true;
    
    switch (sectionNumber) {
        case 1:
            isValid = validateSection1();
            break;
            
        case 2:
            isValid = validateSection2();
            break;
            
        case 3:
            isValid = validateSection3();
            break;
            
        case 4:
        case 5:
        case 6:
            // Seções sem validação específica (por enquanto)
            break;
            
        default:
            console.warn(`Validação para seção ${sectionNumber} não implementada`);
    }
    
    return isValid;
}

function validateSection1() {
    let isValid = true;
    
    // Valida nome do paciente
    const nomeElement = document.getElementById('paciente');
    if (!nomeElement.value.trim()) {
        showError('paciente', 'Nome do paciente é obrigatório');
        isValid = false;
    } else {
        hideError('paciente');
    }
    
    // Valida data de nascimento
    const birthDateElement = document.getElementById('data_nascimento');
    if (!birthDateElement.value) {
        showError('data_nascimento', 'Data de nascimento é obrigatória');
        isValid = false;
    } else {
        const validation = validateBirthDate(birthDateElement.value);
        if (!validation.isValid) {
            showError('data_nascimento', validation.message);
            isValid = false;
        } else {
            hideError('data_nascimento');
        }
    }
    
    return isValid;
}

function validateSection2() {
    let isValid = true;
    
    // Valida telefone principal
    const telefone1 = document.getElementById('telefone1');
    if (!telefone1.value.trim()) {
        showError('telefone1', 'Telefone principal é obrigatório');
        isValid = false;
    } else if (!validatePhone(telefone1.value)) {
        showError('telefone1', 'Telefone inválido');
        isValid = false;
    } else {
        hideError('telefone1');
    }
    
    // Valida CEP
    const cep = document.getElementById('cep');
    if (!cep.value.trim()) {
        showError('cep', 'CEP é obrigatório');
        isValid = false;
    } else if (!validateCEP(cep.value)) {
        showError('cep', 'CEP inválido');
        isValid = false;
    } else {
        hideError('cep');
    }
    
    // Valida endereço
    const endereco = document.getElementById('endereco');
    if (!endereco.value.trim()) {
        showError('endereco', 'Endereço é obrigatório');
        isValid = false;
    } else {
        hideError('endereco');
    }
    
    // Valida número
    const numero = document.getElementById('numero');
    if (!numero.value.trim()) {
        showError('numero', 'Número é obrigatório');
        isValid = false;
    } else {
        hideError('numero');
    }
    
    // Valida bairro
    const bairro = document.getElementById('bairro');
    if (!bairro.value.trim()) {
        showError('bairro', 'Bairro é obrigatório');
        isValid = false;
    } else {
        hideError('bairro');
    }
    
    // Valida cidade
    const cidade = document.getElementById('cidade');
    if (!cidade.value.trim()) {
        showError('cidade', 'Cidade é obrigatória');
        isValid = false;
    } else {
        hideError('cidade');
    }
    
    // Valida estado
    const estado = document.getElementById('estado');
    if (!estado.value) {
        showError('estado', 'Estado é obrigatório');
        isValid = false;
    } else {
        hideError('estado');
    }
    
    return isValid;
}

function validateSection3() {
    let isValid = true;
    
    // Valida nome da mãe
    const maeNome = document.getElementById('mae_nome');
    if (!maeNome.value.trim()) {
        showError('mae_nome', 'Nome da mãe é obrigatório');
        isValid = false;
    } else {
        hideError('mae_nome');
    }
    
    // Valida CPF da mãe se preenchido
    const maeCpf = document.getElementById('mae_cpf');
    if (maeCpf.value && !validateCPF(maeCpf.value)) {
        showError('mae_cpf', 'CPF inválido');
        isValid = false;
    } else {
        hideError('mae_cpf');
    }
    
    return isValid;
}

function validateAllSections() {
    let isValid = true;
    
    for (let i = 1; i <= totalSections; i++) {
        if (!validateCurrentSection(i)) {
            isValid = false;
            showSection(i);
            break;
        }
    }
    
    return isValid;
}

// ==================== MANIPULAÇÃO DE FORMULÁRIO ====================

function setupFormSubmission() {
    const form = document.getElementById('cadastro-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateAllSections()) {
                submitForm();
            }
        });
    }
}

async function submitForm() {
    try {
        // Mostra loader ou estado de carregamento
        showLoadingState(true);
        
        // Coleta os dados do formulário
        const formData = collectFormData();
        
        // Envia os dados (simulado aqui)
        const response = await simulateFormSubmission(formData);
        
        if (response.success) {
            showSuccessMessage();
            // Redireciona ou limpa o formulário após sucesso
            setTimeout(() => {
                window.location.href = 'pacientes.html';
            }, 3000);
        } else {
            showSubmissionError(response.message);
        }
    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        showSubmissionError('Erro ao enviar formulário. Por favor, tente novamente.');
    } finally {
        showLoadingState(false);
    }
}

function collectFormData() {
    const form = document.getElementById('cadastro-form');
    if (!form) return {};
    
    const formData = {};
    const elements = form.elements;
    
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.name && element.type !== 'button' && element.type !== 'submit') {
            if (element.type === 'checkbox' || element.type === 'radio') {
                if (element.checked) {
                    formData[element.name] = element.value;
                }
            } else {
                formData[element.name] = element.value;
            }
        }
    }
    
    return formData;
}

async function simulateFormSubmission(formData) {
    // Simula um atraso de rede
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simula uma resposta bem-sucedida
    return {
        success: true,
        message: 'Cadastro realizado com sucesso!',
        data: formData
    };
}

// ==================== FUNÇÕES AUXILIARES ====================

async function searchCEP(cep) {
    try {
        showLoadingState(true, 'Buscando CEP...');
        
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            document.getElementById('endereco').value = data.logradouro || '';
            document.getElementById('bairro').value = data.bairro || '';
            document.getElementById('cidade').value = data.localidade || '';
            document.getElementById('estado').value = data.uf || '';
            
            document.getElementById('numero').focus();
        } else {
            showError('cep', 'CEP não encontrado');
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        showError('cep', 'Erro ao buscar CEP. Por favor, preencha manualmente.');
    } finally {
        showLoadingState(false);
    }
}

function calculateTotalIncome() {
    const salaryFields = ['mae_salario', 'pai_salario', 'outro_salario', 'valor_bpc'];
    let total = 0;
    
    salaryFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && element.value) {
            // Remove R$, pontos e converte vírgula para ponto decimal
            const value = parseFloat(element.value
                .replace(/[^\d,]/g, '')
                .replace(',', '.'));
            
            if (!isNaN(value)) {
                total += value;
            }
        }
    });
    
    const totalElement = document.getElementById('renda_familiar');
    if (totalElement) {
        totalElement.value = formatMoney((total * 100).toString());
    }
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
    
    if (field) {
        field.classList.add('error');
        field.focus();
    }
    
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
    const successMessage = document.createElement('div');
    successMessage.id = 'success-message';
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <span class="material-icons-outlined">check_circle</span>
        <p>Cadastro realizado com sucesso!</p>
    `;
    
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        successMessage.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 300);
    }, 5000);
}

function showSubmissionError(message) {
    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message';
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
        <span class="material-icons-outlined">error</span>
        <p>${message}</p>
    `;
    
    document.body.appendChild(errorMessage);
    
    setTimeout(() => {
        errorMessage.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        errorMessage.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(errorMessage);
        }, 300);
    }, 5000);
}

function showLoadingState(show, message = 'Processando...') {
    const loader = document.getElementById('form-loader');
    const loaderMessage = document.getElementById('loader-message');
    
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
    
    if (loaderMessage) {
        loaderMessage.textContent = message;
    }
}

function showGlobalError() {
    const errorContainer = document.createElement('div');
    errorContainer.id = 'global-error';
    errorContainer.className = 'global-error';
    errorContainer.innerHTML = `
        <h2>Ocorreu um erro</h2>
        <p>Não foi possível carregar o formulário. Por favor, recarregue a página.</p>
        <button onclick="window.location.reload()">Recarregar</button>
    `;
    
    document.body.innerHTML = '';
    document.body.appendChild(errorContainer);
}