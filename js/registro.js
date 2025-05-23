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
<label for="observacao_${index}">Observação</label>
                    <textarea id="observacao_${index}" name="observacao_${index}" rows="2"></textarea>
                </div>
            </div>
        `;
        return div;
    }

    addMedicamentoField() {
        this.counters.medicamento++;
        const container = document.getElementById('medicamentos-list');
        const newItem = this.createMedicamentoField(this.counters.medicamento);
        container.appendChild(newItem);
    }

    createMedicamentoField(index) {
        const div = document.createElement('div');
        div.className = 'medicamento-item';
        div.innerHTML = `
            <div class="form-row">
                <div class="form-group full-width">
                    <label for="medicamento_nome_${index}">Nome do Medicamento</label>
                    <input type="text" id="medicamento_nome_${index}" name="medicamento_nome_${index}" />
                </div>
                <div class="form-group">
                    <label for="medicamento_dosagem_${index}">Dosagem</label>
                    <input type="text" id="medicamento_dosagem_${index}" name="medicamento_dosagem_${index}" />
                </div>
                <button type="button" class="btn-remove" onclick="this.parentElement.parentElement.remove()">
                    Remover
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="medicamento_frequencia_${index}">Frequência</label>
                    <select id="medicamento_frequencia_${index}" name="medicamento_frequencia_${index}">
                        <option value="">Selecione...</option>
                        <option value="1x_dia">1x ao dia</option>
                        <option value="2x_dia">2x ao dia</option>
                        <option value="3x_dia">3x ao dia</option>
                        <option value="4x_dia">4x ao dia</option>
                        <option value="12_12h">De 12 em 12 horas</option>
                        <option value="8_8h">De 8 em 8 horas</option>
                        <option value="6_6h">De 6 em 6 horas</option>
                        <option value="quando_necessario">Quando necessário</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>
                <div class="form-group full-width">
                    <label for="medicamento_observacao_${index}">Observação</label>
                    <textarea id="medicamento_observacao_${index}" name="medicamento_observacao_${index}" rows="2"></textarea>
                </div>
            </div>
        `;
        return div;
    }

    addDiagnosticoFamiliaField() {
        this.counters.diagnosticoFamilia++;
        const container = document.getElementById('diagnosticos-familia-list');
        const newItem = this.createDiagnosticoFamiliaField(this.counters.diagnosticoFamilia);
        container.appendChild(newItem);
    }

    createDiagnosticoFamiliaField(index) {
        const div = document.createElement('div');
        div.className = 'diagnostico-familia-item';
        div.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="familia_parentesco_${index}">Parentesco</label>
                    <select id="familia_parentesco_${index}" name="familia_parentesco_${index}">
                        <option value="">Selecione...</option>
                        <option value="mae">Mãe</option>
                        <option value="pai">Pai</option>
                        <option value="irmao">Irmão(ã)</option>
                        <option value="avo_paterno">Avô Paterno</option>
                        <option value="avo_materna">Avó Materna</option>
                        <option value="avo_paterno">Avô Paterno</option>
                        <option value="avo_materna">Avó Paterna</option>
                        <option value="tio_paterno">Tio Paterno</option>
                        <option value="tia_paterna">Tia Paterna</option>
                        <option value="tio_materno">Tio Materno</option>
                        <option value="tia_materna">Tia Materna</option>
                        <option value="primo">Primo(a)</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="familia_cid_${index}">CID</label>
                    <input type="text" id="familia_cid_${index}" name="familia_cid_${index}" />
                </div>
                <div class="form-group full-width">
                    <label for="familia_descricao_${index}">Descrição</label>
                    <input type="text" id="familia_descricao_${index}" name="familia_descricao_${index}" />
                </div>
                <button type="button" class="btn-remove" onclick="this.parentElement.parentElement.remove()">
                    Remover
                </button>
            </div>
        `;
        return div;
    }

    // Coleta de dados do formulário
    collectFormData() {
        this.formData = {};
        const form = document.getElementById('cadastro-form');
        const formData = new FormData(form);
        
        for (let [key, value] of formData.entries()) {
            this.formData[key] = value;
        }

        // Coletar dados dos campos dinâmicos
        this.collectDynamicData();
        
        return this.formData;
    }

    collectDynamicData() {
        // Quimioterapias
        this.formData.quimioterapias = [];
        for (let i = 1; i <= this.counters.quimio; i++) {
            const dataField = document.getElementById(`quimio_data_${i}`);
            const localField = document.getElementById(`quimio_local_${i}`);
            
            if (dataField && localField && (dataField.value || localField.value)) {
                this.formData.quimioterapias.push({
                    data: dataField.value,
                    local: localField.value
                });
            }
        }

        // Radioterapias
        this.formData.radioterapias = [];
        for (let i = 1; i <= this.counters.radio; i++) {
            const dataField = document.getElementById(`radio_data_${i}`);
            const localField = document.getElementById(`radio_local_${i}`);
            
            if (dataField && localField && (dataField.value || localField.value)) {
                this.formData.radioterapias.push({
                    data: dataField.value,
                    local: localField.value
                });
            }
        }

        // Cirurgias
        this.formData.cirurgias = [];
        for (let i = 1; i <= this.counters.cirurgia; i++) {
            const dataField = document.getElementById(`cirurgia_data_${i}`);
            const localField = document.getElementById(`cirurgia_local_${i}`);
            
            if (dataField && localField && (dataField.value || localField.value)) {
                this.formData.cirurgias.push({
                    data: dataField.value,
                    local: localField.value
                });
            }
        }

        // Diagnósticos
        this.formData.diagnosticos = [];
        for (let i = 1; i <= this.counters.diagnostico; i++) {
            const cidField = document.getElementById(`cid_${i}`);
            const descricaoField = document.getElementById(`descricao_${i}`);
            const observacaoField = document.getElementById(`observacao_${i}`);
            
            if (cidField && descricaoField && (cidField.value || descricaoField.value)) {
                this.formData.diagnosticos.push({
                    cid: cidField.value,
                    descricao: descricaoField.value,
                    observacao: observacaoField ? observacaoField.value : ''
                });
            }
        }

        // Medicamentos
        this.formData.medicamentos = [];
        for (let i = 1; i <= this.counters.medicamento; i++) {
            const nomeField = document.getElementById(`medicamento_nome_${i}`);
            const dosagemField = document.getElementById(`medicamento_dosagem_${i}`);
            const frequenciaField = document.getElementById(`medicamento_frequencia_${i}`);
            const observacaoField = document.getElementById(`medicamento_observacao_${i}`);
            
            if (nomeField && nomeField.value) {
                this.formData.medicamentos.push({
                    nome: nomeField.value,
                    dosagem: dosagemField ? dosagemField.value : '',
                    frequencia: frequenciaField ? frequenciaField.value : '',
                    observacao: observacaoField ? observacaoField.value : ''
                });
            }
        }

        // Diagnósticos familiares
        this.formData.diagnosticosFamilia = [];
        for (let i = 1; i <= this.counters.diagnosticoFamilia; i++) {
            const parentescoField = document.getElementById(`familia_parentesco_${i}`);
            const cidField = document.getElementById(`familia_cid_${i}`);
            const descricaoField = document.getElementById(`familia_descricao_${i}`);
            
            if (parentescoField && cidField && descricaoField && 
                (parentescoField.value || cidField.value || descricaoField.value)) {
                this.formData.diagnosticosFamilia.push({
                    parentesco: parentescoField.value,
                    cid: cidField.value,
                    descricao: descricaoField.value
                });
            }
        }
    }

    // Submissão do formulário
    async handleSubmit(event) {
        event.preventDefault();
        
        // Validar todas as seções
        let allValid = true;
        for (let i = 1; i <= this.totalSections; i++) {
            if (!this.validateSection(i)) {
                allValid = false;
                // Ir para a primeira seção com erro
                if (this.currentSection !== i) {
                    this.currentSection = i;
                    this.showSection(i);
                    this.updateProgress();
                    this.updateStepIndicator();
                }
                break;
            }
        }

        if (!allValid) {
            this.showError('Por favor, corrija os erros antes de continuar.');
            return;
        }

        // Coletar dados
        const formData = this.collectFormData();
        
        // Mostrar loading
        this.showLoading(true);
        
        try {
            // Enviar dados para o servidor
            const response = await this.submitData(formData);
            
            if (response.success) {
                this.showSuccess('Cadastro realizado com sucesso!');
                // Redirecionar ou limpar formulário
                setTimeout(() => {
                    this.resetForm();
                }, 2000);
            } else {
                this.showError(response.message || 'Erro ao salvar os dados. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro no envio:', error);
            this.showError('Erro de conexão. Verifique sua internet e tente novamente.');
        } finally {
            this.showLoading(false);
        }
    }

    async submitData(formData) {
        const response = await fetch('/api/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        return await response.json();
    }

    showLoading(show) {
        let loadingDiv = document.getElementById('loading-overlay');
        
        if (show) {
            if (!loadingDiv) {
                loadingDiv = document.createElement('div');
                loadingDiv.id = 'loading-overlay';
                loadingDiv.innerHTML = `
                    <div class="loading-content">
                        <div class="spinner"></div>
                        <p>Salvando dados...</p>
                    </div>
                `;
                loadingDiv.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                `;
                document.body.appendChild(loadingDiv);
            }
            loadingDiv.style.display = 'flex';
        } else if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <p>${message}</p>
            </div>
        `;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 400px;
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    resetForm() {
        document.getElementById('cadastro-form').reset();
        this.currentSection = 1;
        this.showSection(1);
        this.updateProgress();
        this.updateStepIndicator();
        this.clearAllErrors();
        
        // Resetar contadores
        this.counters = {
            quimio: 1,
            radio: 1,
            cirurgia: 1,
            diagnostico: 1,
            medicamento: 1,
            diagnosticoFamilia: 1
        };
        
        // Limpar campos dinâmicos
        this.clearDynamicFields();
    }

    clearAllErrors() {
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
        
        document.querySelectorAll('[id$="-error"]').forEach(el => {
            el.style.display = 'none';
        });
        
        this.clearGeneralError();
    }

    clearDynamicFields() {
        const containers = [
            'quimio-list',
            'radio-list', 
            'cirurgia-list',
            'diagnosticos-list',
            'medicamentos-list',
            'diagnosticos-familia-list'
        ];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                // Manter apenas o primeiro item de cada tipo
                const items = container.children;
                for (let i = items.length - 1; i > 0; i--) {
                    items[i].remove();
                }
            }
        });
    }

    // Método para salvar progresso (opcional)
    saveProgress() {
        const progressData = {
            currentSection: this.currentSection,
            formData: this.collectFormData(),
            timestamp: new Date().toISOString()
        };
        
        // Salvar no sessionStorage (se disponível)
        try {
            sessionStorage.setItem('guido_progress', JSON.stringify(progressData));
        } catch (error) {
            console.warn('Não foi possível salvar o progresso:', error);
        }
    }

    // Método para carregar progresso salvo (opcional)
    loadProgress() {
        try {
            const savedProgress = sessionStorage.getItem('guido_progress');
            if (savedProgress) {
                const progressData = JSON.parse(savedProgress);
                
                // Verificar se o progresso não é muito antigo (ex: 1 hora)
                const savedTime = new Date(progressData.timestamp);
                const now = new Date();
                const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 1) {
                    // Restaurar dados do formulário
                    this.restoreFormData(progressData.formData);
                    
                    // Restaurar seção atual
                    this.currentSection = progressData.currentSection;
                    this.showSection(this.currentSection);
                    this.updateProgress();
                    this.updateStepIndicator();
                    
                    return true;
                }
            }
        } catch (error) {
            console.warn('Erro ao carregar progresso salvo:', error);
        }
        
        return false;
    }

    restoreFormData(formData) {
        Object.entries(formData).forEach(([key, value]) => {
            const field = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox' || field.type === 'radio') {
                    field.checked = value === field.value;
                } else {
                    field.value = value;
                }
            }
        });
    }

    // Método público para inicializar o validador
    static init() {
        return new GuidoFormValidator();
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.guidoValidator = GuidoFormValidator.init();
});

// Salvar progresso periodicamente
setInterval(() => {
    if (window.guidoValidator) {
        window.guidoValidator.saveProgress();
    }
}, 30000); // A cada 30 segundos
