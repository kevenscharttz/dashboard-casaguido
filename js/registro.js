// SUBSTITUA a função DOMContentLoaded existente por esta:

document.addEventListener('DOMContentLoaded', async function() {
        // — Pré-carrega dados para edição
    const urlParams = new URLSearchParams(window.location.search);
    const pacienteId = urlParams.get('id');
    if (pacienteId) {
      try {
        const resp = await fetch(`/paciente/${pacienteId}`);
        if (!resp.ok) throw new Error('Paciente não encontrado');
        const dados = await resp.json();
        preencherFormularioPaciente(dados);
      } catch (err) {
        console.error(err);
        alert('Não foi possível carregar os dados para edição.');
      }
    }

initializeValidation();
    initializeFormatting();
    initializeFormLogic();
    initializeBirthDateValidation();
    initializeNavigation();
    initializeResponsavelPrincipal();
    initializeSidebar();
    showSection(1);

    const form = document.getElementById('cadastro-form');

    // --- Adicionado: Submeter ao clicar no botão da última sessão ---
    const finalizarBtn = document.getElementById('finalizar-btn');
    if (finalizarBtn && form) {
        finalizarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        });
    }
    // --- Fim do trecho adicionado ---

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (validateAllSections()) {
                function getArrayFromInputs(name) {
                    return Array.from(document.getElementsByName(name)).map(el => el.value);
                }

                const quimio = {
                    id_quimio: getArrayFromInputs('quimio_id[]'),
                    profissional: getArrayFromInputs('quimio_profissional[]'),
                    crm: getArrayFromInputs('quimio_crm[]'),
                    local: getArrayFromInputs('quimio_local[]'),
                    inicio: getArrayFromInputs('quimio_inicio[]'),
                    fim: getArrayFromInputs('quimio_fim[]')
                };

                const radio = {
                    id_radio: getArrayFromInputs('radio_id[]'),
                    profissional: getArrayFromInputs('radio_profissional[]'),
                    crm: getArrayFromInputs('radio_crm[]'),
                    local: getArrayFromInputs('radio_local[]'),
                    inicio: getArrayFromInputs('radio_inicio[]'),
                    fim: getArrayFromInputs('radio_fim[]')
                };

                const cirurgia = {
                    id_cirurgia: getArrayFromInputs('cirurgia_id[]'),
                    profissional: getArrayFromInputs('cirurgia_profissional[]'),
                    crm: getArrayFromInputs('cirurgia_crm[]'),
                    inicio: getArrayFromInputs('cirurgia_inicio[]'),
                    fim: getArrayFromInputs('cirurgia_fim[]'),
                    tipo: getArrayFromInputs('cirurgia_tipo[]'),
                    local: getArrayFromInputs('cirurgia_local[]')
                };

                const medicamentos = {
                    id_medicamento: getArrayFromInputs('medicamento_id[]'),
                    nome: getArrayFromInputs('medicamento_nome[]'),
                    dosagem: getArrayFromInputs('medicamento_dosagem[]'),
                    frequencia: getArrayFromInputs('medicamento_frequencia[]'),
                    observacao: getArrayFromInputs('medicamento_observacao[]')
                };

                const diagnosticos = {
                    id_pcte_diag: getArrayFromInputs('pcte_diag_id[]'),
                    nome: getArrayFromInputs('nome[]'),
                    cid: getArrayFromInputs('cid[]'),
                    descricao: getArrayFromInputs('descricao[]'),
                    observacao: getArrayFromInputs('observacao[]')
                };

                const diagnosticosFamiliares = {
                    id_resp_diag: getArrayFromInputs('id_resp_diag[]'),
                    nome: getArrayFromInputs('familia[]'),
                    cid: getArrayFromInputs('familia_cid[]'),
                    parentesco: getArrayFromInputs('familia_parentesco[]'),
                    descricao: getArrayFromInputs('familia_descricao[]'),
                    observacao: getArrayFromInputs('familia_observacao[]')
                };

                const formData = new FormData(form);
                const dados = Object.fromEntries(formData.entries());

                dados.quimio = quimio;
                dados.radio = radio;
                dados.cirurgia = cirurgia;
                dados.medicamentos = medicamentos;
                dados.diagnosticos = diagnosticos;
                dados.diagnosticosFamiliares = diagnosticosFamiliares;

                const urlParams = new URLSearchParams(window.location.search);
                const pacienteId = urlParams.get('id');
                const url = pacienteId ? `/paciente/${pacienteId}` : '/paciente';
                const method = pacienteId ? 'PUT' : 'POST';

                try {
                    const resp = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dados)
                    });
                    if (!resp.ok) throw new Error('Erro ao salvar');
                    window.location.href = '/pacientes.html';
                } catch (err) {
                    alert('Erro ao salvar os dados.');
                }
            }
        });
    }});

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
        totalElement.value = formatMoney((total).toString());
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
        'paciente', 'data_nascimento', 'telefone1', 'cpf'
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

    // Sempre mostrar os campos de quimio, radio, cirurgia e medicamentos
    const quimioFields = document.getElementById('quimio-fields');
    if (quimioFields) quimioFields.style.display = 'block';
    const radioFields = document.getElementById('radio-fields');
    if (radioFields) radioFields.style.display = 'block';
    const cirurgiaFields = document.getElementById('cirurgia-fields');
    if (cirurgiaFields) cirurgiaFields.style.display = 'block';
    const medicamentosFields = document.getElementById('medicamentos-fields');
    if (medicamentosFields) medicamentosFields.style.display = 'block';

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
        { id: 'add-radio', listId: 'radio-list', className: 'radio-item-form', template: createRadioTemplate},
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
                // Corrige o índice para quimio, radio, cirurgia
                if (buttonConfig.id === 'add-quimio') {
                    window.quimioIndex = (typeof window.quimioIndex === 'number' ? window.quimioIndex : 0) + 1;
                }
                if (buttonConfig.id === 'add-radio') {
                    window.radioIndex = (typeof window.radioIndex === 'number' ? window.radioIndex : 0) + 1;
                }
                if (buttonConfig.id === 'add-cirurgia') {
                    window.cirurgiaIndex = (typeof window.cirurgiaIndex === 'number' ? window.cirurgiaIndex : 0) + 1;
                }
                const wrapper = document.createElement('div');
                wrapper.style.position = 'relative';
                wrapper.innerHTML = buttonConfig.template({});
                // Sempre mostra o botão de exclusão para todos os cards
                const removeBtn = wrapper.querySelector('button[class*="remove"]');
                if (removeBtn) {
                    removeBtn.style.display = '';
                }
                list.appendChild(wrapper);
            });
        }
    });
}

(function injectFocusStyle() {
    const style = document.createElement('style');
    style.textContent = `
        .btn-diagnostico-remove:focus,
        .btn-medicamentos-remove:focus,
        .btn-quimio-remove:focus, 
        .btn-radio-remove:focus,
        .btn-cirurgia-remove:focus,
        .btn-familia-remove:focus {
            outline: 2px solid red;
            outline-offset: 2px;
        }

        .btn-diagnostico-remove:active,
        .btn-medicamentos-remove:active,
        .btn-quimio-remove:active, 
        .btn-radio-remove:active,
        .btn-cirurgia-remove:active,
        .btn-familia-remove:active {
            transform: scale(0.8); 
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.3);
        }
    `;
    document.head.appendChild(style);
})();

// --- Corrige sobreposição dos botões de remover nos cards dinâmicos ---
(function injectCardSpacingStyle() {
    const style = document.createElement('style');
    style.textContent = `
        .quimio-item,
        .radio-item-form,
        .cirurgia-item,
        .diagnostico-item,
        .medicamento-item {
            margin-bottom: 32px !important;
            padding-top: 8px;
            padding-bottom: 8px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
            position: relative;
            min-height: 60px;
        }
        .radio-item-form > .btn-radio-remove,
        .cirurgia-item > .btn-cirurgia-remove,
        .quimio-item > .btn-quimio-remove,
        .diagnostico-item > .btn-diagnostico-remove,
        .medicamento-item > .btn-medicamentos-remove {
            position: absolute;
            top: 5px;
            right: 20px;
            z-index: 2;
        }
        /* Garante que o botão não saia do card e não sobreponha outros cards */
        .radio-item-form,
        .cirurgia-item {
            overflow: visible;
        }
    `;
    document.head.appendChild(style);
})();

// --- Controle de índices dinâmicos para cards ---
let quimioIndex = 0;
let radioIndex = 0;
let cirurgiaIndex = 0;

function createQuimioTemplate(values = {}) {
    quimioIndex++;
    return `
        <div class="quimio-item" style="position:relative;">
            <input type="hidden" name="quimio_id[]" value="${values.id_quimio || ''}" />
            <button type="button" class="btn-quimio-remove" data-quimio-index="${quimioIndex}" style="position:absolute;top:5px;right:20px;background:transparent;border:none;cursor:pointer;padding:0;border-radius:50%;z-index:2;">
                <img src="../img/cancelar.png" alt="Remover">
            </button>
            <div class="form-row">
                <div class="form-group">
                    <label>Nome do profissional</label>
                    <input type="text" name="quimio_profissional[]" value="${values.profissional || ''}" />
                </div>
                <div class="form-group">
                    <label>CRM</label>
                    <input type="text" name="quimio_crm[]" value="${values.crm || ''}" />
                </div>
                <div class="form-group">
                    <label>Local</label>
                    <input type="text" name="quimio_local[]" value="${values.local || ''}" />
                </div>
                <div class="form-group">
                    <label>Data de Início</label>
                    <input type="date" name="quimio_inicio[]" value="${values.inicio || ''}" />
                </div>
                <div class="form-group">
                    <label>Data de Finalização</label>
                    <input type="date" name="quimio_fim[]" value="${values.fim || ''}" />
                </div>
            </div>
        </div>
    `;
}


// NOVOS TEMPLATES UNIFICADOS COM MARGIN ENTRE CARDS
function createRadioTemplate(values = {}) {
    // Só incrementa o índice ao adicionar novo, não ao preencher existente
    if (!values || Object.keys(values).length === 0) radioIndex++;
    return `
        <div class="radio-item-form" style="position:relative; margin-bottom: 24px;">
            <input type="hidden" name="radio_id[]" value="${values.id_radio || ''}" />
            <button type="button" class="btn-radio-remove" style="position:absolute;top:5px;right:20px;background:transparent;border:none;cursor:pointer;padding:0;border-radius:50%;z-index:2;">
                <img src="../img/cancelar.png" alt="Remover">
            </button>
            <div class="form-row">
                <div class="form-group">
                    <label>Nome do profissional</label>
                    <input type="text" name="radio_profissional[]" value="${values.profissional || ''}" />
                </div>
                <div class="form-group">
                    <label>CRM</label>
                    <input type="text" name="radio_crm[]" value="${values.crm || ''}" />
                </div>
                <div class="form-group">
                    <label>Local</label>
                    <input type="text" name="radio_local[]" value="${values.local || ''}" />
                </div>
                <div class="form-group">
                    <label>Data de Início</label>
                    <input type="date" name="radio_inicio[]" value="${values.inicio || ''}" />
                </div>
                <div class="form-group">
                    <label>Data de Finalização</label>
                    <input type="date" name="radio_fim[]" value="${values.fim || ''}" />
                </div>
            </div>
        </div>
    `;
}

function createCirurgiaTemplate(values = {}) {
    // Só incrementa o índice ao adicionar novo, não ao preencher existente
    if (!values || Object.keys(values).length === 0) cirurgiaIndex++;
    return `
        <div class="cirurgia-item" style="position:relative; margin-bottom: 24px;">
            <input type="hidden" name="cirurgia_id[]" value="${values.id_cirurgia || ''}" />
            <button type="button" class="btn-cirurgia-remove" style="position:absolute;top:5px;right:20px;background:transparent;border:none;cursor:pointer;padding:0;border-radius:50%;z-index:2;">
                <img src="../img/cancelar.png" alt="Remover">
            </button>
            <div class="form-row">
                <div class="form-group">
                    <label>Nome do profissional</label>
                    <input type="text" name="cirurgia_profissional[]" value="${values.profissional || ''}" />
                </div>
                <div class="form-group">
                    <label>CRM</label>
                    <input type="text" name="cirurgia_crm[]" value="${values.crm || ''}" />
                </div>
                <div class="form-group">
                    <label>Data de início</label>
                    <input type="date" name="cirurgia_inicio[]" value="${values.inicio || ''}" />
                </div>
                <div class="form-group">
                    <label>Data de finalização</label>
                    <input type="date" name="cirurgia_fim[]" value="${values.fim || ''}" />
                </div>
                <div class="form-group">
                    <label>Tipo</label>
                    <input type="text" name="cirurgia_tipo[]" value="${values.tipo || ''}" />
                </div>
                <div class="form-group">
                    <label>Local</label>
                    <input type="text" name="cirurgia_local[]" value="${values.local || ''}" />
                </div>
            </div>
        </div>
    `;
}

function createMedicamentoTemplate(values = {}) {
    return `
        <div class="medicamento-item" style="position:relative;">
            <input type="hidden" name="medicamento_id[]" value="${values.id_medicamento || ''}" />
            <button type="button" class="btn-medicamentos-remove" style="position:absolute;top:5px;right:20px;background:transparent;border:none;cursor:pointer;padding:0;border-radius:50%;z-index:2;">
                <img src="../img/cancelar.png" alt="Remover">
            </button>
            <div class="form-row">
                <div class="form-group">
                    <label>Nome do Medicamento</label>
                    <input type="text" name="medicamento_nome[]" value="${values.nome || ''}" />
                </div>
                <div class="form-group">
                    <label>Dosagem</label>
                    <input type="text" name="medicamento_dosagem[]" value="${values.dosagem || ''}" />
                </div>
                <div class="form-group">
                    <label>Frequência</label>
                    <input type="text" name="medicamento_frequencia[]" value="${values.frequencia || ''}" />
                </div>
                <div class="form-group full-width">
                    <label>Observação</label>
                    <textarea name="medicamento_observacao[]">${values.observacao || ''}</textarea>
                </div>
            </div>
        </div>
    `;
}

function createDiagnosticoTemplate(values = {}) {
    return `
        <div class="diagnostico-item" style="position:relative;">
            <input type="hidden" name="pcte_diag_id[]" value="${values.id_pcte_diag || ''}" />
            <button type="button" class="btn-diagnostico-remove" style="position:absolute;top:5px;right:20px;background:transparent;border:none;cursor:pointer;padding:0;border-radius:50%;z-index:2;">
                <img src="../img/cancelar.png" alt="Remover">
            </button>
            <div class="form-row">
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" name="nome[]" value="${values.nome || ''}" />
                </div>
                <div class="form-group">
                    <label>CID</label>
                    <input type="text" name="cid[]" value="${values.cid || ''}" />
                </div>
                <div class="form-group full-width">
                    <label>Descrição</label>
                    <input type="text" name="descricao[]" value="${values.descricao || ''}" />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group full-width">
                    <label>Observação</label>
                    <textarea name="observacao[]">${values.observacao || ''}</textarea>
                </div>
            </div>
        </div>
    `;
}

function createDiagnosticoFamiliaTemplate() {
    return `
        <input type=\"hidden\" name=\"id_resp_diag[]\" value=\"\" />
        <button type="button" class="btn-familia-remove" style="position:absolute;top:5px;right:20px;background:transparent;border:none;cursor:pointer;padding:0;border-radius:50%;" onclick="this.parentElement.remove()">
            <img src="../img/cancelar.png" alt="Remover">
        </button>
        <div class="diagnostico-familia-item">
            <div class="form-row">
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" name="familia[]" />
                </div>
                <div class="form-group">
                    <label>CID</label>
                    <input type="text" name="familia_cid[]" />
                </div>
                <div class="form-group">
                    <label>Parentesco</label>
                    <input type="text" name="familia_parentesco[]" placeholder="Ex: Mãe, Pai, Avó..." />
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <input type="text" name="familia_descricao[]" />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group full-width">
                    <label>Observação</label>
                    <textarea name="familia_observacao[]" rows="2"></textarea>
                </div>
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
    const requiredFieldsBySection = {
        1: ['paciente', 'data_nascimento', 'cpf'],
        2: ['telefone1'],
        3: []
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

// Função para remover cards dinâmicos
function initializeRemoveCardButtons() {
    document.addEventListener('click', function(event) {
        // Botões de remover dinâmicos começam com "btn-" e terminam com "-remove-N"
        const btn = event.target.closest('button[class^="btn-"][class*="-remove-"]');
        if (btn && btn.parentElement) {
            // Remove o container relativo do botão (que é o wrapper do card)
            btn.parentElement.remove();
        }
    });
}

function getQuimioData() {
  const profissionais = Array.from(document.getElementsByName('quimio_profissional[]')).map(el => el.value);
  const crms = Array.from(document.getElementsByName('quimio_crm[]')).map(el => el.value);
  const locais = Array.from(document.getElementsByName('quimio_local[]')).map(el => el.value);
  const inicios = Array.from(document.getElementsByName('quimio_inicio[]')).map(el => el.value);
  const fins = Array.from(document.getElementsByName('quimio_fim[]')).map(el => el.value);

  return {
    profissional: profissionais,
    crm: crms,
    local: locais,
    inicio: inicios,
    fim: fins
  };
}

// Função para preencher o formulário
function preencherFormularioPaciente(dados) {
  if (!dados) return;

  // Campos simples
  document.getElementById('paciente').value = dados.nome_pcte || '';
  document.getElementById('data_nascimento').value = dados.data_nasc_pcte ? dados.data_nasc_pcte.substr(0,10) : '';
  document.getElementById('cpf').value = dados.cpf_pcte || '';
  document.getElementById('cartao_sus').value = dados.cns_pcte || '';
  document.getElementById('rg').value = dados.rg_pcte || '';
  document.getElementById('telefone1').value = dados.tel_pcte || '';
  document.getElementById('telefone2').value = dados.cel_pcte || '';
  document.getElementById('contato_emergencia').value = dados.contato_emergencia || '';
  // Adicione outros campos simples conforme necessário...

  // -------- CAMPOS DINÂMICOS --------

  // Helper para limpar listas
  function limparLista(id) {
    const list = document.getElementById(id);
    if (list) list.innerHTML = '';
  }

// Helper para adicionar e preencher cards dinâmicos com índice e valores
  function preencherLista(id, templateFunc, valores, nomesCampos) {
    limparLista(id);
    const list = document.getElementById(id);
    if (!list || !valores || !Array.isArray(valores) || valores.length === 0) return;
    valores.forEach((item, idx) => {
      // Cria um wrapper para facilitar a manipulação do DOM
      const wrapper = document.createElement('div');
      wrapper.innerHTML = templateFunc(item);
      // Adiciona evento de exclusão para o botão deste card
      const removeBtn = wrapper.querySelector('button[class*="remove"]');
      if (removeBtn) {
        removeBtn.dataset.cardIndex = idx;
        removeBtn.addEventListener('click', function (e) {
          e.preventDefault();
          // Descobre o tipo do card e o id salvo (se houver)
          let idField = null;
          let apiRoute = null;
          if (wrapper.querySelector('input[name="quimio_id[]"]')) {
            idField = wrapper.querySelector('input[name="quimio_id[]"]').value;
            apiRoute = '/api/quimio/';
          } else if (wrapper.querySelector('input[name="radio_id[]"]')) {
            idField = wrapper.querySelector('input[name="radio_id[]"]').value;
            apiRoute = '/api/radio/';
          } else if (wrapper.querySelector('input[name="cirurgia_id[]"]')) {
            idField = wrapper.querySelector('input[name="cirurgia_id[]"]').value;
            apiRoute = '/api/cirurgia/';
          } else if (wrapper.querySelector('input[name="pcte_diag_id[]"]')) {
            idField = wrapper.querySelector('input[name="pcte_diag_id[]"]').value;
            apiRoute = '/api/diagnostico/';
          } else if (wrapper.querySelector('input[name="id_resp_diag[]"]')) {
            idField = wrapper.querySelector('input[name="id_resp_diag[]"]').value;
            apiRoute = '/api/diagnostico-familia/';
          } else if (wrapper.querySelector('input[name="medicamento_id[]"]')) {
            idField = wrapper.querySelector('input[name="medicamento_id[]"]').value;
            apiRoute = '/api/medicamento/';
          }
          if (idField && apiRoute) {
            fetch(apiRoute + idField, { method: 'DELETE' })
              .then(() => wrapper.remove())
              .catch(() => wrapper.remove());
          } else {
            wrapper.remove();
          }
        });
      }
      list.appendChild(wrapper);
    });
  }

  // QUIMIOTERAPIA
  if (dados.quimio && Array.isArray(dados.quimio.profissional)) {
  quimioIndex = 0;
  const quimioValores = dados.quimio.profissional.map((_, i) => ({
    profissional: dados.quimio.profissional[i],
    crm: dados.quimio.crm[i],
    local: dados.quimio.local[i],
    inicio: dados.quimio.inicio[i],
    fim: dados.quimio.fim[i],
    id_quimio: dados.quimio.id_quimio ? dados.quimio.id_quimio[i] : ''
  })).filter(item => item.profissional || item.crm || item.local || item.inicio || item.fim || item.id_quimio);
  preencherLista('quimio-list', createQuimioTemplate, quimioValores, [
    'quimio_profissional', 'quimio_crm', 'quimio_local', 'quimio_inicio', 'quimio_fim', 'id_quimio'
  ]);
}

  // RADIOTERAPIA
  if (dados.radio && Array.isArray(dados.radio.profissional)) {
  radioIndex = 0;
  const radioValores = dados.radio.profissional.map((_, i) => ({
    id_radio: dados.radio.id_radio ? dados.radio.id_radio[i] : '',
    profissional: dados.radio.profissional[i],
    crm: dados.radio.crm[i],
    local: dados.radio.local[i],
    inicio: dados.radio.inicio[i],
    fim: dados.radio.fim[i]
  })).filter(item => item.profissional || item.crm || item.local || item.inicio || item.fim || item.id_radio);
  preencherLista('radio-list', createRadioTemplate, radioValores, [
    'id_radio', 'radio_profissional', 'radio_crm', 'radio_local', 'radio_inicio', 'radio_fim'
  ]);
}

  // CIRURGIA
  if (dados.cirurgia && Array.isArray(dados.cirurgia.profissional)) {
  cirurgiaIndex = 0;
  const cirurgiaValores = dados.cirurgia.profissional.map((_, i) => ({
    id_cirurgia: dados.cirurgia.id_cirurgia ? dados.cirurgia.id_cirurgia[i] : '',
    profissional: dados.cirurgia.profissional[i],
    crm: dados.cirurgia.crm[i],
    inicio: dados.cirurgia.inicio[i],
    fim: dados.cirurgia.fim[i],
    tipo: dados.cirurgia.tipo[i],
    local: dados.cirurgia.local[i]
  })).filter(item => item.profissional || item.crm || item.inicio || item.fim || item.tipo || item.local || item.id_cirurgia);
  preencherLista('cirurgia-list', createCirurgiaTemplate, cirurgiaValores, [
    'id_cirurgia', 'cirurgia_profissional', 'cirurgia_crm', 'cirurgia_inicio', 'cirurgia_fim', 'cirurgia_tipo', 'cirurgia_local'
  ]);
}

  // MEDICAMENTOS
  if (dados.medicamentos && Array.isArray(dados.medicamentos.nome)) {
  const medicamentosValores = dados.medicamentos.nome.map((_, i) => ({
    id_medicamento: dados.medicamentos.id_medicamento ? dados.medicamentos.id_medicamento[i] : '',
    nome: dados.medicamentos.nome[i],
    dosagem: dados.medicamentos.dosagem[i],
    frequencia: dados.medicamentos.frequencia[i],
    observacao: dados.medicamentos.observacao[i]
  })).filter(item => item.nome || item.dosagem || item.frequencia || item.observacao || item.id_medicamento);
  preencherLista('medicamentos-list', createMedicamentoTemplate, medicamentosValores, [
    'id_medicamento', 'medicamento_nome', 'medicamento_dosagem', 'medicamento_frequencia', 'medicamento_observacao'
  ]);
}

  // DIAGNÓSTICOS
  if (dados.diagnosticos && Array.isArray(dados.diagnosticos.nome)) {
  const diagnosticosValores = dados.diagnosticos.nome.map((_, i) => ({
    id_pcte_diag: dados.diagnosticos.id_pcte_diag ? dados.diagnosticos.id_pcte_diag[i] : '',
    nome: dados.diagnosticos.nome[i],
    cid: dados.diagnosticos.cid[i],
    descricao: dados.diagnosticos.descricao[i],
    observacao: dados.diagnosticos.observacao[i]
  })).filter(item => item.nome || item.cid || item.descricao || item.observacao || item.id_pcte_diag);
  preencherLista('diagnosticos-list', createDiagnosticoTemplate, diagnosticosValores, [
    'id_pcte_diag', 'nome', 'cid', 'descricao', 'observacao'
  ]);
}

  // DIAGNÓSTICOS FAMILIARES
  if (dados.diagnosticosFamiliares && Array.isArray(dados.diagnosticosFamiliares.nome)) {
  const familiaValores = dados.diagnosticosFamiliares.nome.map((_, i) => ({
    id_resp_diag: dados.diagnosticosFamiliares.id_resp_diag ? dados.diagnosticosFamiliares.id_resp_diag[i] : '',
    familia: dados.diagnosticosFamiliares.nome[i],
    familia_cid: dados.diagnosticosFamiliares.cid[i],
    familia_parentesco: dados.diagnosticosFamiliares.parentesco[i],
    familia_descricao: dados.diagnosticosFamiliares.descricao[i],
    familia_observacao: dados.diagnosticosFamiliares.observacao[i]
  })).filter(item => item.familia || item.familia_cid || item.familia_parentesco || item.familia_descricao || item.familia_observacao || item.id_resp_diag);
  preencherLista('diagnosticos-familia-list', createDiagnosticoFamiliaTemplate, familiaValores, [
    'id_resp_diag', 'familia', 'familia_cid', 'familia_parentesco', 'familia_descricao', 'familia_observacao'
  ]);
}
}

// Buscar paciente por ID (completo para edição)
router.get('/paciente/:id', async (req, res) => {
  try {
    const paciente = await db.getPacientePorId(req.params.id);
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    res.json(paciente); // Retorna o objeto direto, sem aninhar
  } catch (err) {
    console.error('Erro ao buscar paciente:', err);
    res.status(500).json({ error: 'Erro ao buscar paciente', details: err.message });
  }
});
