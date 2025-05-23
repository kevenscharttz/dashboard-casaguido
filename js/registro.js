/ Sistema de Validações para Formulário de Registro - GUIDO
class GuidoFormValidator {
    constructor() {
        this.currentSection = 1;
        this.totalSections = 12;
        this.formData = {};
        this.validators = {};
        this.counters = {
            quimio: 1,
            radio: 1,
            cirurgia: 1,
            diagnostico: 1,
            medicamento: 1,
            diagnosticoFamilia: 1
        };
        
        this.init();
    }

    init() {
        this.setupValidators();
        this.setupEventListeners();
        this.setupMasks();
        this.updateProgress();
    }

    // Configuração de validadores
    setupValidators() {
        this.validators = {
            required: (value) => value && value.trim() !== '',
            cpf: (value) => this.validateCPF(value),
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            phone: (value) => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value),
            cep: (value) => /^\d{5}-\d{3}$/.test(value),
            sus: (value) => /^\d{3}\s\d{4}\s\d{4}\s\d{4}$/.test(value),
            date: (value) => {
                if (!value) return false;
                const date = new Date(value);
                return date instanceof Date && !isNaN(date);
            },
            minAge: (value, minAge = 0) => {
                if (!value) return false;
                const birthDate = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                return age >= minAge;
            },
            maxAge: (value, maxAge = 150) => {
                if (!value) return false;
                const birthDate = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                return age <= maxAge;
            }
        };
    }

    // Configuração de máscaras
    setupMasks() {
        // Máscara para CPF
        this.setupMask('#cpf, #mae_cpf, #pai_cpf, #outro_cpf', '000.000.000-00');
        
        // Máscara para telefone
        this.setupMask('#telefone1, #telefone2, #mae_telefone, #pai_telefone, #outro_telefone', '(00) 00000-0000');
        
        // Máscara para CEP
        this.setupMask('#cep', '00000-000');
        
        // Máscara para Cartão SUS
        this.setupMask('#cartao_sus', '000 0000 0000 0000');
        
        // Máscara para valores monetários
        this.setupMoneyMask('#mae_salario, #pai_salario, #outro_salario, #renda_familiar, #valor_bpc');
    }

    setupMask(selector, pattern) {
        document.querySelectorAll(selector).forEach(input => {
            input.addEventListener('input', (e) => {
                this.applyMask(e.target, pattern);
            });
        });
    }

    setupMoneyMask(selector) {
        document.querySelectorAll(selector).forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value) {
                    value = (parseInt(value) / 100).toFixed(2);
                    value = 'R$ ' + value.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                    e.target.value = value;
                }
            });
        });
    }

    applyMask(input, pattern) {
        let value = input.value.replace(/\D/g, '');
        let maskedValue = '';
        let valueIndex = 0;

        for (let i = 0; i < pattern.length && valueIndex < value.length; i++) {
            if (pattern[i] === '0') {
                maskedValue += value[valueIndex];
                valueIndex++;
            } else {
                maskedValue += pattern[i];
            }
        }

        input.value = maskedValue;
    }

    // Configuração de event listeners
    setupEventListeners() {
        // Navegação entre seções
        for (let i = 1; i <= this.totalSections; i++) {
            const nextBtn = document.getElementById(`btn-next-${i}`);
            const prevBtn = document.getElementById(`btn-prev-${i}`);
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.nextSection(i));
            }
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => this.prevSection(i));
            }
        }

        // Submissão do formulário
        const form = document.getElementById('cadastro-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Cálculo automático da idade
        const dataNascimento = document.getElementById('data_nascimento');
        if (dataNascimento) {
            dataNascimento.addEventListener('change', () => this.calculateAge());
        }

        // Busca de CEP
        const cep = document.getElementById('cep');
        if (cep) {
            cep.addEventListener('blur', () => this.searchCEP());
        }

        // Validação em tempo real
        this.setupRealTimeValidation();

        // Checkboxes condicionais
        this.setupConditionalFields();

        // Botões de adicionar itens
        this.setupAddButtons();

        // Cálculo da renda familiar
        this.setupIncomeCalculation();
    }

    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }

    setupConditionalFields() {
        // BPC
        const bpcRadios = document.querySelectorAll('input[name="tem_bpc"]');
        bpcRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const bpcFields = document.getElementById('bpc-fields');
                if (radio.value === 'sim' && radio.checked) {
                    bpcFields.style.display = 'block';
                } else if (radio.value === 'nao' && radio.checked) {
                    bpcFields.style.display = 'none';
                }
            });
        });

        // Escola
        const estudaRadios = document.querySelectorAll('input[name="estuda"]');
        estudaRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const escolaFields = document.getElementById('escola-fields');
                if (radio.value === 'sim' && radio.checked) {
                    escolaFields.style.display = 'block';
                } else if (radio.value === 'nao' && radio.checked) {
                    escolaFields.style.display = 'none';
                }
            });
        });

        // Quimioterapia
        const quimioRadios = document.querySelectorAll('input[name="fez_quimio"]');
        quimioRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const quimioFields = document.getElementById('quimio-fields');
                if (radio.value === 'sim' && radio.checked) {
                    quimioFields.style.display = 'block';
                } else if (radio.value === 'nao' && radio.checked) {
                    quimioFields.style.display = 'none';
                }
            });
        });

        // Radioterapia
        const radioRadios = document.querySelectorAll('input[name="fez_radio"]');
        radioRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const radioFields = document.getElementById('radio-fields');
                if (radio.value === 'sim' && radio.checked) {
                    radioFields.style.display = 'block';
                } else if (radio.value === 'nao' && radio.checked) {
                    radioFields.style.display = 'none';
                }
            });
        });

        // Cirurgia
        const cirurgiaRadios = document.querySelectorAll('input[name="fez_cirurgia"]');
        cirurgiaRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const cirurgiaFields = document.getElementById('cirurgia-fields');
                if (radio.value === 'sim' && radio.checked) {
                    cirurgiaFields.style.display = 'block';
                } else if (radio.value === 'nao' && radio.checked) {
                    cirurgiaFields.style.display = 'none';
                }
            });
        });

        // Medicamentos
        const medicamentosRadios = document.querySelectorAll('input[name="usa_medicamentos"]');
        medicamentosRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const medicamentosFields = document.getElementById('medicamentos-fields');
                if (radio.value === 'sim' && radio.checked) {
                    medicamentosFields.style.display = 'block';
                } else if (radio.value === 'nao' && radio.checked) {
                    medicamentosFields.style.display = 'none';
                }
            });
        });

        // Outro responsável
        const outroResponsavel = document.getElementById('tem_outro_responsavel');
        if (outroResponsavel) {
            outroResponsavel.addEventListener('change', () => {
                const fields = document.getElementById('outro-responsavel-fields');
                if (outroResponsavel.checked) {
                    fields.style.display = 'block';
                } else {
                    fields.style.display = 'none';
                }
            });
        }
    }

    setupAddButtons() {
        // Adicionar quimioterapia
        const addQuimio = document.getElementById('add-quimio');
        if (addQuimio) {
            addQuimio.addEventListener('click', () => this.addQuimioField());
        }

        // Adicionar radioterapia  
        const addRadio = document.getElementById('add-radio');
        if (addRadio) {
            addRadio.addEventListener('click', () => this.addRadioField());
        }

        // Adicionar cirurgia
        const addCirurgia = document.getElementById('add-cirurgia');
        if (addCirurgia) {
            addCirurgia.addEventListener('click', () => this.addCirurgiaField());
        }

        // Adicionar diagnóstico
        const addDiagnostico = document.getElementById('add-diagnostico');
        if (addDiagnostico) {
            addDiagnostico.addEventListener('click', () => this.addDiagnosticoField());
        }

        // Adicionar medicamento
        const addMedicamento = document.getElementById('add-medicamento');
        if (addMedicamento) {
            addMedicamento.addEventListener('click', () => this.addMedicamentoField());
        }

        // Adicionar diagnóstico familiar
        const addDiagnosticoFamilia = document.getElementById('add-diagnostico-familia');
        if (addDiagnosticoFamilia) {
            addDiagnosticoFamilia.addEventListener('click', () => this.addDiagnosticoFamiliaField());
        }
    }

    setupIncomeCalculation() {
        const salaryFields = ['#mae_salario', '#pai_salario', '#outro_salario', '#valor_bpc'];
        salaryFields.forEach(field => {
            const element = document.querySelector(field);
            if (element) {
                element.addEventListener('input', () => this.calculateFamilyIncome());
            }
        });
    }

    // Validação de CPF
    validateCPF(cpf) {
        if (!cpf) return false;
        
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validação do primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let digit1 = 11 - (sum % 11);
        if (digit1 === 10 || digit1 === 11) digit1 = 0;
        if (digit1 !== parseInt(cpf.charAt(9))) return false;
        
        // Validação do segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        let digit2 = 11 - (sum % 11);
        if (digit2 === 10 || digit2 === 11) digit2 = 0;
        if (digit2 !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }

    // Validação de campo individual
    validateField(field) {
        const value = field.value;
        const fieldName = field.name || field.id;
        let isValid = true;
        let errorMessage = '';

        // Campos obrigatórios
        if (field.hasAttribute('required') && !this.validators.required(value)) {
            isValid = false;
            errorMessage = 'Este campo é obrigatório';
        }

        // Validações específicas
        if (value && isValid) {
            if (fieldName.includes('cpf') && !this.validators.cpf(value)) {
                isValid = false;
                errorMessage = 'CPF inválido';
            }
            
            if (fieldName.includes('telefone') && !this.validators.phone(value)) {
                isValid = false;
                errorMessage = 'Telefone inválido';
            }
            
            if (fieldName === 'cep' && !this.validators.cep(value)) {
                isValid = false;
                errorMessage = 'CEP inválido';
            }
            
            if (fieldName === 'cartao_sus' && value && !this.validators.sus(value)) {
                isValid = false;
                errorMessage = 'Cartão SUS inválido';
            }
            
            if (fieldName === 'data_nascimento') {
                if (!this.validators.date(value)) {
                    isValid = false;
                    errorMessage = 'Data inválida';
                } else if (!this.validators.maxAge(value, 25)) {
                    isValid = false;
                    errorMessage = 'Idade deve ser até 25 anos';
                }
            }
        }

        this.showFieldError(field, isValid, errorMessage);
        return isValid;
    }

    // Validação de seção
    validateSection(sectionNumber) {
        const section = document.getElementById(`section-${sectionNumber}`);
        if (!section) return true;

        const requiredFields = section.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Validações específicas por seção
        switch (sectionNumber) {
            case 1:
                isValid = this.validateSection1() && isValid;
                break;
            case 2:
                isValid = this.validateSection2() && isValid;
                break;
            case 3:
                isValid = this.validateSection3() && isValid;
                break;
            case 12:
                isValid = this.validateSection12() && isValid;
                break;
        }

        return isValid;
    }

    validateSection1() {
        const paciente = document.getElementById('paciente');
        const dataNascimento = document.getElementById('data_nascimento');
        let isValid = true;

        // Validar nome do paciente (mínimo 2 palavras)
        if (paciente.value.trim().split(' ').length < 2) {
            this.showFieldError(paciente, false, 'Informe o nome completo');
            isValid = false;
        }

        // Validar idade
        if (dataNascimento.value) {
            const age = this.calculateAgeFromDate(dataNascimento.value);
            if (age > 25) {
                this.showFieldError(dataNascimento, false, 'Paciente deve ter até 25 anos');
                isValid = false;
            }
        }

        return isValid;
    }

    validateSection2() {
        // Verificar se pelo menos um telefone foi informado
        const telefone1 = document.getElementById('telefone1');
        const telefone2 = document.getElementById('telefone2');
        
        if (!telefone1.value && !telefone2.value) {
            this.showFieldError(telefone1, false, 'Informe pelo menos um telefone');
            return false;
        }

        return true;
    }

    validateSection3() {
        // Verificar se ao menos um responsável foi marcado como principal
        const maeResponsavel = document.getElementById('mae_responsavel_principal');
        const paiResponsavel = document.getElementById('pai_responsavel_principal');
        const outroResponsavel = document.getElementById('outro_responsavel_principal');

        if (!maeResponsavel.checked && !paiResponsavel.checked && !outroResponsavel.checked) {
            this.showError('É necessário definir um responsável principal');
            return false;
        }

        return true;
    }

    validateSection12() {
        const confirmar = document.getElementById('confirmar_dados');
        if (!confirmar.checked) {
            this.showFieldError(confirmar, false, 'É necessário confirmar os dados');
            return false;
        }
        return true;
    }

    // Mostrar erro do campo
    showFieldError(field, isValid, message) {
        const errorElement = document.getElementById(`${field.id}-error`) || 
                           document.getElementById(`${field.name}-error`);
        
        if (isValid) {
            field.classList.remove('error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        } else {
            field.classList.add('error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        }
    }

    clearError(field) {
        field.classList.remove('error');
        const errorElement = document.getElementById(`${field.id}-error`) || 
                           document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    showError(message) {
        // Criar ou atualizar mensagem de erro geral
        let errorDiv = document.querySelector('.general-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'general-error';
            errorDiv.style.cssText = `
                background: #fee;
                border: 1px solid #fcc;
                color: #c33;
                padding: 10px;
                border-radius: 4px;
                margin: 10px 0;
            `;
            const currentSection = document.getElementById(`section-${this.currentSection}`);
            currentSection.insertBefore(errorDiv, currentSection.querySelector('.button-row'));
        }
        errorDiv.textContent = message;
    }

    clearGeneralError() {
        const errorDiv = document.querySelector('.general-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Navegação
    nextSection(currentSection) {
        if (this.validateSection(currentSection)) {
            this.clearGeneralError();
            this.currentSection = currentSection + 1;
            this.showSection(this.currentSection);
            this.updateProgress();
            this.updateStepIndicator();
        }
    }

    prevSection(currentSection) {
        this.currentSection = currentSection - 1;
        this.showSection(this.currentSection);
        this.updateProgress();
        this.updateStepIndicator();
    }

    showSection(sectionNumber) {
        // Ocultar todas as seções
        for (let i = 1; i <= this.totalSections; i++) {
            const section = document.getElementById(`section-${i}`);
            if (section) {
                section.classList.remove('active');
            }
        }

        // Mostrar seção atual
        const currentSection = document.getElementById(`section-${sectionNumber}`);
        if (currentSection) {
            currentSection.classList.add('active');
        }

        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateProgress() {
        const progress = (this.currentSection / this.totalSections) * 100;
        const progressBar = document.getElementById('form-progress');
        const progressText = document.getElementById('completion-percentage');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}%`;
        }
    }

    updateStepIndicator() {
        for (let i = 1; i <= this.totalSections; i++) {
            const stepCircle = document.getElementById(`step-${i}`);
            const stepText = stepCircle?.nextElementSibling;
            
            if (stepCircle && stepText) {
                if (i < this.currentSection) {
                    stepCircle.classList.add('completed');
                    stepCircle.classList.remove('active');
                    stepText.classList.add('completed');
                    stepText.classList.remove('active');
                } else if (i === this.currentSection) {
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

    // Cálculo da idade
    calculateAge() {
        const dataNascimento = document.getElementById('data_nascimento');
        const idadeField = document.getElementById('idade');
        
        if (dataNascimento.value && idadeField) {
            const age = this.calculateAgeFromDate(dataNascimento.value);
            idadeField.value = `${age} anos`;
        }
    }

    calculateAgeFromDate(dateString) {
        const birthDate = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    // Busca CEP
    async searchCEP() {
        const cepInput = document.getElementById('cep');
        const cep = cepInput.value.replace(/\D/g, '');
        
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                
                if (!data.erro) {
                    document.getElementById('endereco').value = data.logradouro || '';
                    document.getElementById('bairro').value = data.bairro || '';
                    document.getElementById('cidade').value = data.localidade || '';
                    document.getElementById('estado').value = data.uf || '';
                    
                    // Focar no número
                    document.getElementById('numero').focus();
                } else {
                    this.showFieldError(cepInput, false, 'CEP não encontrado');
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
    }

    // Cálculo da renda familiar
    calculateFamilyIncome() {
        const fields = ['mae_salario', 'pai_salario', 'outro_salario', 'valor_bpc'];
        let total = 0;

        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && field.value) {
                const value = field.value.replace(/[R$\s.,]/g, '').replace(',', '.');
                const numValue = parseFloat(value) || 0;
                total += numValue / 100; // Dividir por 100 porque a máscara multiplica por 100
            }
        });

        const rendaFamiliar = document.getElementById('renda_familiar');
        if (rendaFamiliar) {
            rendaFamiliar.value = `R$ ${total.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}`;
        }
    }

    // Adicionar campos dinâmicos
    addQuimioField() {
        this.counters.quimio++;
        const container = document.getElementById('quimio-list');
        const newItem = this.createQuimioField(this.counters.quimio);
        container.appendChild(newItem);
    }

    createQuimioField(index) {
        const div = document.createElement('div');
        div.className = 'quimio-item';
        div.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="quimio_data_${index}">Data</label>
                    <input type="date" id="quimio_data_${index}" name="quimio_data_${index}" />
                </div>
                <div class="form-group full-width">
                    <label for="quimio_local_${index}">Local</label>
                    <input type="text" id="quimio_local_${index}" name="quimio_local_${index}" />
                </div>
                <button type="button" class="btn-remove" onclick="this.parentElement.parentElement.remove()">
                    Remover
                </button>
            </div>
        `;
        return div;
    }

    addRadioField() {
        this.counters.radio++;
        const container = document.getElementById('radio-list');
        const newItem = this.createRadioField(this.counters.radio);
        container.appendChild(newItem);
    }

    createRadioField(index) {
        const div = document.createElement('div');
        div.className = 'radio-item-form';
        div.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="radio_data_${index}">Data</label>
                    <input type="date" id="radio_data_${index}" name="radio_data_${index}" />
                </div>
                <div class="form-group full-width">
                    <label for="radio_local_${index}">Local</label>
                    <input type="text" id="radio_local_${index}" name="radio_local_${index}" />
                </div>
                <button type="button" class="btn-remove" onclick="this.parentElement.parentElement.remove()">
                    Remover
                </button>
            </div>
        `;
        return div;
    }

    addCirurgiaField() {
        this.counters.cirurgia++;
        const container = document.getElementById('cirurgia-list');
        const newItem = this.createCirurgiaField(this.counters.cirurgia);
        container.appendChild(newItem);
    }

    createCirurgiaField(index) {
        const div = document.createElement('div');
        div.className = 'cirurgia-item';
        div.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="cirurgia_data_${index}">Data</label>
                    <input type="date" id="cirurgia_data_${index}" name="cirurgia_data_${index}" />
                </div>
                <div class="form-group full-width">
                    <label for="cirurgia_local_${index}">Local</label>
                    <input type="text" id="cirurgia_local_${index}" name="cirurgia_local_${index}" />
                </div>
                <button type="button" class="btn-remove" onclick="this.parentElement.parentElement.remove()">
                    Remover
                </button>
            </div>
        `;
        return div;
    }

    addDiagnosticoField() {
        this.counters.diagnostico++;
        const container = document.getElementById('diagnosticos-list');
        const newItem = this.createDiagnosticoField(this.counters.diagnostico);
        container.appendChild(newItem);
    }

    createDiagnosticoField(index) {
        const div = document.createElement('div');
        div.className = 'diagnostico-item';
        div.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="cid_${index}">CID</label>
                    <input type="text" id="cid_${index}" name="cid_${index}" />
                </div>
                <div class="form-group full-width">
                    <label for="descricao_${index}">Descrição</label>
                    <input type="text" id="descricao_${index}" name="descricao_${index}" />
                </div>
                <button type="button" class="btn-remove" onclick="this.parentElement.parentElement.remove()">
                    Remover
                </button>
            </div>
            <div class="form-row">
                <div class="form-group full-width">
                    <label for="observacao_${index}">
