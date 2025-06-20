// SUBSTITUA a função DOMContentLoaded existente por esta:

document.addEventListener('DOMContentLoaded', function() {
    initializeValidation();
    initializeFormatting();
    initializeFormLogic();
    initializeBirthDateValidation();
    initializeNavigation();
    initializeResponsavelPrincipal();
    initializeSidebar(); // <-- ESTA LINHA É NOVA
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
    
    // Normalizar datas para comparação
    today.setHours(0, 0, 0, 0);
    birth.setHours(0, 0, 0, 0);
    
    // Verificar se a data é válida
    if (isNaN(birth.getTime())) {
        return { isValid: false, message: 'Data inválida' };
    }
    
    // Verificar se não é uma data futura
    if (birth > today) {
        return { isValid: false, message: 'Data de nascimento não pode ser no futuro' };
    }
    
    // Calcular idade
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    // Verificar se a idade não excede 20 anos
    if (age > 20) {
        return { isValid: false, message: 'Idade não pode ser superior a 20 anos' };
    }
    
    // Verificar idade mínima realista (não pode ser muito antiga)
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 150);
    if (birth < maxAge) {
        return { isValid: false, message: 'Data de nascimento muito antiga' };
    }
    
    return { isValid: true, message: '' };
}

function calculateAge(birthDate) {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    // Verificar se a data é válida
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

function initializeBirthDateValidation() {
    const birthDateElement = document.getElementById('data_nascimento');
    if (birthDateElement) {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        
        // Definir data máxima como hoje
        birthDateElement.setAttribute('max', todayString);
        
        // Definir data mínima para limitar a 20 anos
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 20);
        const minDateString = minDate.toISOString().split('T')[0];
        birthDateElement.setAttribute('min', minDateString);
        
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
        'endereco', 'numero', 'bairro', 'cidade', 'estado'
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
    const conditionalFields = [
        { name: 'fez_quimio', target: 'quimio-fields' },
        { name: 'fez_radio', target: 'radio-fields' },
        { name: 'fez_cirurgia', target: 'cirurgia-fields' },
        { name: 'usa_medicamentos', target: 'medicamentos-fields' },
        { name: 'tem_bpc', target: 'bpc-fields' },
        { name: 'estuda', target: 'escola-fields' }
    ];

    conditionalFields.forEach(fieldConfig => {
        const radios = document.querySelectorAll(`input[name="${fieldConfig.name}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', function() {
                const fields = document.getElementById(fieldConfig.target);
                if (fields) {
                    fields.style.display = this.value === 'sim' ? 'block' : 'none';
                }
            });
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

    // Inicializar botões de adicionar
    initializeAddButtons();
}

// Permitir apenas um responsável principal selecionado
function initializeResponsavelPrincipal() {
    const maeCheckbox = document.getElementById('mae_responsavel_principal');
    const paiCheckbox = document.getElementById('pai_responsavel_principal');
    const outroCheckbox = document.getElementById('outro_responsavel_principal');
    const maeNome = document.getElementById('mae_nome');
    const paiNome = document.getElementById('pai_nome');
    const outroNome = document.getElementById('outro_nome');

    function validateResponsavelField(checkbox, input, fieldId, msg) {
        if (checkbox && input) {
            if (checkbox.checked && !input.value.trim()) {
                showError(fieldId, msg);
            } else {
                hideError(fieldId);
            }
        }
    }

    // Helper para atualizar obrigatoriedade
    function updateRequired() {
        if (maeCheckbox && maeNome) {
            if (maeCheckbox.checked) {
                maeNome.setAttribute('required', 'required');
            } else {
                maeNome.removeAttribute('required');
            }
        }
        if (paiCheckbox && paiNome) {
            if (paiCheckbox.checked) {
                paiNome.setAttribute('required', 'required');
            } else {
                paiNome.removeAttribute('required');
            }
        }
        if (outroCheckbox && outroNome) {
            if (outroCheckbox.checked) {
                outroNome.setAttribute('required', 'required');
            } else {
                outroNome.removeAttribute('required');
            }
        }
    }

    // Permitir apenas um selecionado
    const checkboxes = [maeCheckbox, paiCheckbox, outroCheckbox].filter(Boolean);
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                checkboxes.forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });
            }
            updateRequired();
            // Validação dinâmica ao marcar/desmarcar
            validateResponsavelField(maeCheckbox, maeNome, 'mae_nome', 'Por favor, informe o nome da mãe (responsável principal)');
            validateResponsavelField(paiCheckbox, paiNome, 'pai_nome', 'Por favor, informe o nome do pai (responsável principal)');
            validateResponsavelField(outroCheckbox, outroNome, 'outro_nome', 'Por favor, informe o nome do outro responsável (responsável principal)');
        });
    });

    // Atualizar obrigatoriedade ao carregar
    updateRequired();

    // Validação customizada ao sair do campo
    if (maeNome && maeCheckbox) {
        maeNome.addEventListener('blur', function() {
            validateResponsavelField(maeCheckbox, maeNome, 'mae_nome', 'Por favor, informe o nome da mãe (responsável principal)');
        });
        maeNome.addEventListener('input', function() {
            validateResponsavelField(maeCheckbox, maeNome, 'mae_nome', 'Por favor, informe o nome da mãe (responsável principal)');
        });
    }
    if (paiNome && paiCheckbox) {
        paiNome.addEventListener('blur', function() {
            validateResponsavelField(paiCheckbox, paiNome, 'pai_nome', 'Por favor, informe o nome do pai (responsável principal)');
        });
        paiNome.addEventListener('input', function() {
            validateResponsavelField(paiCheckbox, paiNome, 'pai_nome', 'Por favor, informe o nome do pai (responsável principal)');
        });
    }
    if (outroNome && outroCheckbox) {
        outroNome.addEventListener('blur', function() {
            validateResponsavelField(outroCheckbox, outroNome, 'outro_nome', 'Por favor, informe o nome do outro responsável (responsável principal)');
        });
        outroNome.addEventListener('input', function() {
            validateResponsavelField(outroCheckbox, outroNome, 'outro_nome', 'Por favor, informe o nome do outro responsável (responsável principal)');
        });
    }
}

function initializeAddButtons() {
    const addButtons = [
        { id: 'add-quimio', listId: 'quimio-list', className: 'quimio-item', template: createQuimioTemplate },
        { id: 'add-radio', listId: 'radio-list', className: 'radio-item', template: createRadioTemplate },
        { id: 'add-cirurgia', listId: 'cirurgia-list', className: 'cirurgia-item', template: createCirurgiaTemplate },
        { id: 'add-diagnostico', listId: 'diagnosticos-list', className: 'diagnostico-item', template: createDiagnosticoTemplate },
        { id: 'add-medicamento', listId: 'medicamentos-list', className: 'medicamento-item', template: createMedicamentoTemplate },
        { id: 'add-diagnostico-familia', listId: 'diagnosticos-familia-list', className: 'diagnostico-familia-item', template: createDiagnosticoFamiliaTemplate }
    ];

    addButtons.forEach(buttonConfig => {
        const button = document.getElementById(buttonConfig.id);
        if (button) {
            button.addEventListener('click', function() {
                const list = document.getElementById(buttonConfig.listId);
                if (!list) return;
                
                const count = list.querySelectorAll(`.${buttonConfig.className}`).length + 1;
                const newItem = document.createElement('div');
                newItem.className = buttonConfig.className;
                newItem.innerHTML = buttonConfig.template(count);
                list.appendChild(newItem);
            });
        }
    });
}

// Templates para os itens dinâmicos
function createQuimioTemplate(count) {
    return `
        <div class="form-row">
            <div class="form-group full-width">
              <label for="quimio_profissional_${count}">Profissional</label>
              <input type="text" id="quimio_profissional_${count}" name="quimio_profissional_${count}" />
            </div>
            <div class="form-group full-width">
                <label for="quimio_local_${count}">Local</label>
                <input type="text" id="quimio_local_${count}" name="quimio_local_${count}" />
            </div>
            <div class="form-group">
                <label for="quimio_data_${count}">Data</label>
                <input type="date" id="quimio_data_${count}" name="quimio_data_${count}" />
            </div>
        </div>
    `;
}

function createRadioTemplate(count) {
    return `
        <div class="form-row">
            <div class="form-group full-width">
              <label for="radio_profissional_${count}">Profissional</label>
              <input type="text" id="radio_profissional_${count}" name="radio_profissional_${count}" />
            </div>
            <div class="form-group full-width">
                <label for="radio_local_${count}">Local</label>
                <input type="text" id="radio_local_${count}" name="radio_local_${count}" />
            </div>
            <div class="form-group">
                <label for="radio_data_${count}">Data</label>
                <input type="date" id="radio_data_${count}" name="radio_data_${count}" />
            </div>
        </div>
    `;
}

function createCirurgiaTemplate(count) {
    return `
        <div class="form-row">
            <div class="form-group full-width">
                <label for="cirurgia_profissional_${count}">Profissional</label>
                <input type="text" id="cirurgia_profissional_${count}" name="cirurgia_profissional_${count}" />
            </div>
            <div class="form-group">
                <label for="cirurgia_data_${count}">Data</label>
                <input type="date" id="cirurgia_data_${count}" name="cirurgia_data_${count}" />
            </div>
            <div class="form-group full-width">
                <label for="cirurgia_tipo_${count}">Tipo</label>
                <input type="text" id="cirurgia_tipo_${count}" name="cirurgia_tipo_${count}" />
            </div>
            <div class="form-group" style="align-self: flex-end;">
                <button type="button" class="delete-item-btn" title="Excluir item">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        </div>
    `;
}

function createDiagnosticoTemplate(count) {
    return `
        <div class="form-row">
            <div class="form-group">
                <label for="nome_${count}">Nome</label>
                <input type="text" id="nome_${count}" name="nome_${count}" />
            </div>
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
}

function createMedicamentoTemplate(count) {
    return `
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
}

function createDiagnosticoFamiliaTemplate(count) {
    return `
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
}

// Navegação e controle de seções
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
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(`section-${stepNumber}`).classList.add('active');
    
    updateProgressIndicator(stepNumber);
    updateProgressBar(stepNumber);
}

function validateCurrentSection(sectionNumber) {
    // Defina os campos obrigatórios de cada seção
    const requiredFieldsBySection = {
        1: ['paciente', 'data_nascimento'],
        2: ['telefone1'],
        3: [] // Validação customizada para responsável principal
    };

    let isValid = true;
    const fields = requiredFieldsBySection[sectionNumber] || [];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && !element.value.trim()) {
            showError(field, 'Este campo é obrigatório');
            isValid = false;
        } else {
            hideError(field);
        }
    });

    // Validação customizada para responsável principal na seção 3
    if (sectionNumber === 3) {
        // Limpa todos os erros antes
        hideError('mae_nome');
        hideError('pai_nome');
        hideError('outro_nome');
        const maeCheckbox = document.getElementById('mae_responsavel_principal');
        const paiCheckbox = document.getElementById('pai_responsavel_principal');
        const outroCheckbox = document.getElementById('outro_responsavel_principal');
        const maeNome = document.getElementById('mae_nome');
        const paiNome = document.getElementById('pai_nome');
        const outroNome = document.getElementById('outro_nome');
        if (maeCheckbox && maeCheckbox.checked) {
            if (maeNome && !maeNome.value.trim()) {
                showError('mae_nome', 'Por favor, informe o nome da mãe (responsável principal)');
                isValid = false;
            }
        }
        if (paiCheckbox && paiCheckbox.checked) {
            if (paiNome && !paiNome.value.trim()) {
                showError('pai_nome', 'Por favor, informe o nome do pai (responsável principal)');
                isValid = false;
            }
        }
        if (outroCheckbox && outroCheckbox.checked) {
            if (outroNome && !outroNome.value.trim()) {
                showError('outro_nome', 'Por favor, informe o nome do outro responsável (responsável principal)');
                isValid = false;
            }
        }
    }
    return isValid;
}

// ADICIONE ESTE CÓDIGO NO FINAL DO SEU ARQUIVO registro.js

// Função para controlar o sidebar
function initializeSidebar() {
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.querySelector('.menu-icon');
    let isSidebarOpen = false;

    // Função para abrir/fechar sidebar
    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
        body.classList.toggle('sidebar-open', isSidebarOpen);
        
        if (menuButton) {
            menuButton.setAttribute('aria-expanded', isSidebarOpen);
        }
    }

    // Event listener para o botão do menu
    if (menuButton) {
        menuButton.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleSidebar();
        });

        menuButton.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleSidebar();
            }
        });
    }

    // Fechar sidebar ao clicar fora
    document.addEventListener('click', function(event) {
        if (!sidebar) return;
        
        const clickedInsideSidebar = sidebar.contains(event.target);
        const clickedMenuButton = event.target.closest('.menu-icon');

        if (isSidebarOpen && !clickedInsideSidebar && !clickedMenuButton) {
            isSidebarOpen = false;
            body.classList.remove('sidebar-open');
            
            if (menuButton) {
                menuButton.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // Fechar sidebar com tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && isSidebarOpen) {
            isSidebarOpen = false;
            body.classList.remove('sidebar-open');
            
            if (menuButton) {
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.focus();
            }
        }
    });
}