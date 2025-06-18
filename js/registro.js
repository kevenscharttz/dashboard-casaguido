document.addEventListener('DOMContentLoaded', function() {
    initializeValidation();
    initializeFormatting();
    initializeFormLogic();
    initializeBirthDateValidation();
    initializeNavigation();
    showSection(1);
    
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

function validateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1;
    }
    return age;
}

function calculateAge(birthDate) {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    if (age < 1) {
        const months = today.getMonth() - birth.getMonth() + (12 * (today.getFullYear() - birth.getFullYear()));
        return months + (months === 1 ? ' mês' : ' meses');
    }
    
    return age + (age === 1 ? ' ano' : ' anos');
}

function initializeFormatting() {
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

    const birthDateElement = document.getElementById('data_nascimento');
    if (birthDateElement) {
        birthDateElement.addEventListener('change', function(e) {
            const ageElement = document.getElementById('idade');
            if (ageElement) {
                ageElement.value = calculateAge(e.target.value);
            }
            
            const today = new Date();
            const birthDate = new Date(e.target.value);
            if (birthDate > today) {
                showError('data_nascimento', 'Data de nascimento não pode ser futura');
            } else {
                hideError('data_nascimento');
            }
        });
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
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    if (age < 0) return '';
    
    if (age < 1) {
        const months = today.getMonth() - birth.getMonth() + (12 * (today.getFullYear() - birth.getFullYear()));
        if (months < 0) return '';
        return months + (months === 1 ? ' mês' : ' meses');
    }
    
    return age + (age === 1 ? ' ano' : ' anos');
}

function initializeBirthDateValidation() {
    const birthDateElement = document.getElementById('data_nascimento');
    if (birthDateElement) {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        birthDateElement.setAttribute('max', todayString);
        
        birthDateElement.addEventListener('change', function(e) {
            const validation = validateBirthDate(e.target.value);
            
            if (!validation.isValid) {
                showError('data_nascimento', validation.message);
                const ageElement = document.getElementById('idade');
                if (ageElement) {
                    ageElement.value = '';
                }
            } else {
                hideError('data_nascimento');
                const ageElement = document.getElementById('idade');
                if (ageElement) {
                    ageElement.value = calculateAge(e.target.value);
                }
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


function validateSection1() {
    let isValid = true;
    

    const nomeElement = document.getElementById('paciente');
    if (!nomeElement.value.trim()) {
        showError('paciente', 'Nome do paciente é obrigatório');
        isValid = false;
    } else {
        hideError('paciente');
    }

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

document.addEventListener('DOMContentLoaded', function() {
    initializeValidation();
    initializeFormatting();
    initializeFormLogic();
    initializeBirthDateValidation();
    initializeNavigation();
    showSection(1);
    
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


function validateCurrentSection(sectionNumber) {
    let isValid = true;
    
    switch (sectionNumber) {
        case 1:
            isValid = validateSection1();
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

    const numberOnlyFields = ['pessoas_casa', 'comodos', 'quartos'];
    numberOnlyFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }
    });

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

function calculateTotalIncome() {
    const salaryFields = ['mae_salario', 'pai_salario', 'outro_salario', 'valor_bpc'];
    let total = 0;
    
    salaryFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && element.value) {
            const value = parseFloat(element.value.replace(/[^\d,]/g, '').replace(',', '.'));
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
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
    
    if (field) {
        field.classList.remove('error');
    }
    
    if (errorElement) {
        errorElement.style.display = 'none';
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
        }
    });
}

function initializeFormLogic() {
    const quimioRadios = document.querySelectorAll('input[name="fez_quimio"]');
    quimioRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const fields = document.getElementById('quimio-fields');
            if (fields) {
                fields.style.display = this.value === 'sim' ? 'block' : 'none';
            }
        });
    });

    const radioRadios = document.querySelectorAll('input[name="fez_radio"]');
    radioRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const fields = document.getElementById('radio-fields');
            if (fields) {
                fields.style.display = this.value === 'sim' ? 'block' : 'none';
            }
        });
    });

    const cirurgiaRadios = document.querySelectorAll('input[name="fez_cirurgia"]');
    cirurgiaRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const fields = document.getElementById('cirurgia-fields');
            if (fields) {
                fields.style.display = this.value === 'sim' ? 'block' : 'none';
            }
        });
    });

    const medicamentoRadios = document.querySelectorAll('input[name="usa_medicamentos"]');
    medicamentoRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const fields = document.getElementById('medicamentos-fields');
            if (fields) {
                fields.style.display = this.value === 'sim' ? 'block' : 'none';
            }
        });
    });

    const bpcRadios = document.querySelectorAll('input[name="tem_bpc"]');
    bpcRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const fields = document.getElementById('bpc-fields');
            if (fields) {
                fields.style.display = this.value === 'sim' ? 'block' : 'none';
            }
        });
    });

    const escolaRadios = document.querySelectorAll('input[name="estuda"]');
    escolaRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const fields = document.getElementById('escola-fields');
            if (fields) {
                fields.style.display = this.value === 'sim' ? 'block' : 'none';
            }
        });
    });

    const outroResponsavelCheckbox = document.getElementById('tem_outro_responsavel');
    if (outroResponsavelCheckbox) {
        outroResponsavelCheckbox.addEventListener('change', function() {
            const fields = document.getElementById('outro-responsavel-fields');
            if (fields) {
                fields.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
}

// Quimioterapia
const addQuimioBtn = document.getElementById('add-quimio');
if (addQuimioBtn) {
    addQuimioBtn.addEventListener('click', function() {
        const quimioList = document.getElementById('quimio-list');
        if (!quimioList) return;
        const count = quimioList.querySelectorAll('.quimio-item').length + 1;
        const newItem = document.createElement('div');
        newItem.className = 'quimio-item';
        newItem.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="quimio_data_${count}">Data</label>
                    <input type="date" id="quimio_data_${count}" name="quimio_data_${count}" />
                </div>
                <div class="form-group full-width">
                    <label for="quimio_local_${count}">Local</label>
                    <input type="text" id="quimio_local_${count}" name="quimio_local_${count}" />
                </div>
            </div>
        `;
        quimioList.appendChild(newItem);
    });
}
// Radioterapia
const addRadioBtn = document.getElementById('add-radio');
if (addRadioBtn) {
    addRadioBtn.addEventListener('click', function() {
        const radioList = document.getElementById('radio-list');
        if (!radioList) return;
        const count = radioList.querySelectorAll('.radio-item').length + 1;
        const newItem = document.createElement('div');
        newItem.className = 'radio-item';
        newItem.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="radio_data_${count}">Data</label>
                    <input type="date" id="radio_data_${count}" name="radio_data_${count}" />
                </div>
                <div class="form-group full-width">
                    <label for="radio_local_${count}">Local</label>
                    <input type="text" id="radio_local_${count}" name="radio_local_${count}" />
                </div>
            </div>
        `;
        radioList.appendChild(newItem);
    });
}
// Cirurgia
const addCirurgiaBtn = document.getElementById('add-cirurgia');
if (addCirurgiaBtn) {
    addCirurgiaBtn.addEventListener('click', function() {
        const cirurgiaList = document.getElementById('cirurgia-list');
        if (!cirurgiaList) return;
        const count = cirurgiaList.querySelectorAll('.cirurgia-item').length + 1;
        const newItem = document.createElement('div');
        newItem.className = 'cirurgia-item';
        newItem.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="cirurgia_data_${count}">Data</label>
                    <input type="date" id="cirurgia_data_${count}" name="cirurgia_data_${count}" />
                </div>
                <div class="form-group full-width">
                    <label for="cirurgia_tipo_${count}">Tipo</label>
                    <input type="text" id="cirurgia_tipo_${count}" name="cirurgia_tipo_${count}" />
                </div>
            </div>
        `;
        cirurgiaList.appendChild(newItem);
    });
}

// Diagnóstico
const addDiagnosticoBtn = document.getElementById('add-diagnostico');
if (addDiagnosticoBtn) {
    addDiagnosticoBtn.addEventListener('click', function() {
        const diagnosticosList = document.getElementById('diagnosticos-list');
        if (!diagnosticosList) return;
        const count = diagnosticosList.querySelectorAll('.diagnostico-item').length + 1;
        const newItem = document.createElement('div');
        newItem.className = 'diagnostico-item';
        newItem.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="cid_${count}">CID</label>
                    <input type="text" id="cid_${count}" name="cid_${count}" />
                </div>
                <div class="form-group full-width">
                    <label for="descricao_${count}">Descrição</label>
                    <input type="text" id="descricao_${count}" name="descricao_${count}" />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group full-width">
                    <label for="observacao_${count}">Observação</label>
                    <textarea id="observacao_${count}" name="observacao_${count}" rows="2"></textarea>
                </div>
            </div>
        `;
        diagnosticosList.appendChild(newItem);
    });
}

// Medicamento
const addMedicamentoBtn = document.getElementById('add-medicamento');
if (addMedicamentoBtn) {
    addMedicamentoBtn.addEventListener('click', function() {
        const medicamentosList = document.getElementById('medicamentos-list');
        if (!medicamentosList) return;
        const count = medicamentosList.querySelectorAll('.medicamento-item').length + 1;
        const newItem = document.createElement('div');
        newItem.className = 'medicamento-item';
        newItem.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="medicamento_nome_${count}">Nome do Medicamento</label>
                    <input type="text" id="medicamento_nome_${count}" name="medicamento_nome_${count}" />
                </div>
                <div class="form-group">
                    <label for="medicamento_dosagem_${count}">Dosagem</label>
                    <input type="text" id="medicamento_dosagem_${count}" name="medicamento_dosagem_${count}" />
                </div>
                <div class="form-group">
                    <label for="medicamento_frequencia_${count}">Frequência</label>
                    <input type="text" id="medicamento_frequencia_${count}" name="medicamento_frequencia_${count}" />
                </div>
            </div>
        `;
        medicamentosList.appendChild(newItem);
    });
}

// Diagnóstico Familiar
const addDiagnosticoFamiliaBtn = document.getElementById('add-diagnostico-familia');
if (addDiagnosticoFamiliaBtn) {
    addDiagnosticoFamiliaBtn.addEventListener('click', function() {
        const diagnosticosFamiliaList = document.getElementById('diagnosticos-familia-list');
        if (!diagnosticosFamiliaList) return;
        const count = diagnosticosFamiliaList.querySelectorAll('.diagnostico-familia-item').length + 1;
        const newItem = document.createElement('div');
        newItem.className = 'diagnostico-familia-item';
        newItem.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="familia_cid_${count}">CID</label>
                    <input type="text" id="familia_cid_${count}" name="familia_cid_${count}" />
                </div>
                <div class="form-group">
                    <label for="familia_parentesco_${count}">Parentesco</label>
                    <input type="text" id="familia_parentesco_${count}" name="familia_parentesco_${count}" placeholder="Ex: Mãe, Pai, Avó..." />
                </div>
                <div class="form-group">
                    <label for="familia_descricao_${count}">Descrição</label>
                    <input type="text" id="familia_descricao_${count}" name="familia_descricao_${count}" />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group full-width">
                    <label for="familia_observacao_${count}">Observação</label>
                    <textarea id="familia_observacao_${count}" name="familia_observacao_${count}" rows="2"></textarea>
                </div>
            </div>
        `;
        diagnosticosFamiliaList.appendChild(newItem);
    });
}

let currentSection = 1;
const totalSections = 7;

function showSection(sectionNumber) {
    for (let i = 1; i <= totalSections; i++) {
        const section = document.getElementById(`section-${i}`);
        if (section) {
            section.classList.remove('active');
        }
    }
    
    const activeSection = document.getElementById(`section-${sectionNumber}`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
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

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    showSection(1);
    
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

function validateAllSections() {
    let isValid = true;
    
    for (let i = 1; i <= totalSections - 1; i++) {
        if (!validateCurrentSection(i)) {
            isValid = false;
            showSection(i);
            break;
        }
    }
    
    return isValid;
}

function showSuccessMessage() {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
        successMessage.style.display = 'block';
        successMessage.scrollIntoView({ behavior: 'smooth' });
        
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }
}

function goToStep(stepNumber) {
  // Oculta todas as seções
  document.querySelectorAll('.form-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Mostra a seção desejada
  document.getElementById(`section-${stepNumber}`).classList.add('active');
  
  // Atualiza os indicadores visuais
  updateStepIndicators(stepNumber);
  updateProgress();
}