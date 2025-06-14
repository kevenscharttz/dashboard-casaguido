// Sistema de Validações para o Formulário de Registro GUIDO
class FormValidator {
    constructor() {
        this.errors = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupRealTimeValidation();
    }

    setupEventListeners() {
        // Validação em tempo real
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldError(field));
        });

        // Validação de CPF em tempo real
        document.querySelectorAll('input[name*="cpf"]').forEach(field => {
            field.addEventListener('input', (e) => this.formatCPF(e.target));
        });

        // Validação de telefone em tempo real
        document.querySelectorAll('input[type="tel"]').forEach(field => {
            field.addEventListener('input', (e) => this.formatPhone(e.target));
        });

        // Validação de CEP em tempo real
        const cepField = document.getElementById('cep');
        if (cepField) {
            cepField.addEventListener('input', (e) => this.formatCEP(e.target));
            cepField.addEventListener('blur', () => this.validateCEP(cepField.value));
        }

        // Validação de Cartão SUS em tempo real
        const cartaoSusField = document.getElementById('cartao_sus');
        if (cartaoSusField) {
            cartaoSusField.addEventListener('input', (e) => this.formatCartaoSUS(e.target));
        }

        // Cálculo automático de idade
        const dataNascimento = document.getElementById('data_nascimento');
        if (dataNascimento) {
            dataNascimento.addEventListener('change', () => this.calculateAge());
        }

        // Validação de data de nascimento
        if (dataNascimento) {
            dataNascimento.addEventListener('blur', () => this.validateBirthDate(dataNascimento));
        }

        // Mostrar/ocultar campos condicionais
        this.setupConditionalFields();
    }

    setupRealTimeValidation() {
        // Validação específica para campos obrigatórios
        document.querySelectorAll('input[required], select[required]').forEach(field => {
            field.addEventListener('blur', () => this.validateRequired(field));
        });
    }

    setupConditionalFields() {
        // Campos de quimioterapia
        document.querySelectorAll('input[name="fez_quimio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const quimioFields = document.getElementById('quimio-fields');
                if (radio.value === 'sim' && radio.checked) {
                    quimioFields.style.display = 'block';
                } else if (radio.value === 'nao' && radio.checked) {
                    quimioFields.style.display = 'none';
                }
            });
        });

        // Campos de radioterapia
        document.querySelectorAll('input[name="fez_radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const radioFields = document.getElementById('radio-fields');
                if (radio.value === 'sim' && radio.checked) {
                    radioFields.style.display = 'block';
                } else if (radio.value === 'nao' && radio.checked) {
                    radioFields.style.display = 'none';
                }
            });
        });

        // Campos de cirurgia
        document.querySelectorAll('input[name="fez_cirurgia"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const cirurgiaFields = document.getElementById('cirurgia-fields');
                if (radio.value === 'sim' && radio.checked) {
                    cirurgiaFields.style.display = 'block';
                } else if (radio.value === 'nao' && radio.checked) {
                    cirurgiaFields.style.display = 'none';
                }
            });
        });

        // Campos de medicamentos
        document.querySelectorAll('input[name="usa_medicamentos"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const medicamentosFields = document.getElementById('medicamentos-fields');
                if (radio.value === 'sim' && radio.checked) {
                    medicamentosFields.style.display = 'block';
                } else if (radio.value === 'nao' && radio.checked) {
                    medicamentosFields.style.display = 'none';
                }
            });
        });

        // Campos de BPC
        document.querySelectorAll('input[name="tem_bpc"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const bpcFields = document.getElementById('bpc-fields');
                if (radio.value === 'sim' && radio.checked) {
                    bpcFields.style.display = 'block';
                } else if (radio.value === 'nao' && radio.checked) {
                    bpcFields.style.display = 'none';
                }
            });
        });

        // Campos de estudo
        document.querySelectorAll('input[name="estuda"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const escolaFields = document.getElementById('escola-fields');
                if (radio.value === 'sim' && radio.checked) {
                    escolaFields.style.display = 'block';
                } else if (radio.value === 'nao' && radio.checked) {
                    escolaFields.style.display = 'none';
                }
            });
        });

        // Campos de outro responsável
        const outroResponsavel = document.getElementById('tem_outro_responsavel');
        if (outroResponsavel) {
            outroResponsavel.addEventListener('change', () => {
                const outroFields = document.getElementById('outro-responsavel-fields');
                if (outroResponsavel.checked) {
                    outroFields.style.display = 'block';
                } else {
                    outroFields.style.display = 'none';
                }
            });
        }
    }

    // Validação de campo individual
    validateField(field) {
        const fieldName = field.name || field.id;
        const value = field.value.trim();

        // Limpar erro anterior
        this.clearFieldError(field);

        // Validações específicas por tipo de campo
        switch (fieldName) {
            case 'paciente':
            case 'mae_nome':
                return this.validateFullName(field);
            
            case 'data_nascimento':
                return this.validateBirthDate(field);
            
            case 'cpf':
            case 'mae_cpf':
            case 'pai_cpf':
            case 'outro_cpf':
                return this.validateCPF(field);
            
            case 'cartao_sus':
                return this.validateCartaoSUS(field);
            
            case 'telefone1':
            case 'telefone2':
            case 'mae_telefone':
            case 'pai_telefone':
            case 'outro_telefone':
                return this.validatePhone(field);
            
            case 'cep':
                return this.validateCEP(field.value);
            
            case 'email':
                return this.validateEmail(field);
            
            default:
                if (field.hasAttribute('required')) {
                    return this.validateRequired(field);
                }
                return true;
        }
    }

    // Validação de nome completo
    validateFullName(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.id;

        if (!value) {
            this.showFieldError(field, 'Este campo é obrigatório');
            return false;
        }

        if (value.length < 3) {
            this.showFieldError(field, 'Nome deve ter pelo menos 3 caracteres');
            return false;
        }

        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
            this.showFieldError(field, 'Nome deve conter apenas letras');
            return false;
        }

        const words = value.split(' ').filter(word => word.length > 0);
        if (fieldName === 'paciente' && words.length < 2) {
            this.showFieldError(field, 'Informe o nome completo');
            return false;
        }

        return true;
    }

    // Validação de data de nascimento
    validateBirthDate(field) {
        const value = field.value;

        if (!value) {
            this.showFieldError(field, 'Data de nascimento é obrigatória');
            return false;
        }

        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (birthDate > today) {
            this.showFieldError(field, 'Data de nascimento não pode ser futura');
            return false;
        }

        if (age > 150 || (age === 150 && monthDiff > 0)) {
            this.showFieldError(field, 'Data de nascimento inválida');
            return false;
        }

        return true;
    }

    // Validação de CPF
    validateCPF(field) {
        const value = field.value.replace(/\D/g, '');

        if (!value) {
            // CPF não é obrigatório para todos os campos
            return true;
        }

        if (value.length !== 11) {
            this.showFieldError(field, 'CPF deve ter 11 dígitos');
            return false;
        }

        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(value)) {
            this.showFieldError(field, 'CPF inválido');
            return false;
        }

        // Validação do algoritmo do CPF
        if (!this.isValidCPF(value)) {
            this.showFieldError(field, 'CPF inválido');
            return false;
        }

        return true;
    }

    // Algoritmo de validação do CPF
    isValidCPF(cpf) {
        let sum = 0;
        let remainder;

        // Primeiro dígito verificador
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        // Segundo dígito verificador
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    // Validação de Cartão SUS
    validateCartaoSUS(field) {
        const value = field.value.replace(/\D/g, '');

        if (!value) {
            return true; // Cartão SUS não é obrigatório
        }

        if (value.length !== 15) {
            this.showFieldError(field, 'Cartão SUS deve ter 15 dígitos');
            return false;
        }

        return true;
    }

    // Validação de telefone
    validatePhone(field) {
        const value = field.value.replace(/\D/g, '');
        const isRequired = field.hasAttribute('required');

        if (!value && isRequired) {
            this.showFieldError(field, 'Telefone é obrigatório');
            return false;
        }

        if (value && (value.length < 10 || value.length > 11)) {
            this.showFieldError(field, 'Telefone deve ter 10 ou 11 dígitos');
            return false;
        }

        return true;
    }

    // Validação de CEP
    async validateCEP(cep) {
        const cepField = document.getElementById('cep');
        const cleanCep = cep.replace(/\D/g, '');

        if (!cleanCep) {
            this.showFieldError(cepField, 'CEP é obrigatório');
            return false;
        }

        if (cleanCep.length !== 8) {
            this.showFieldError(cepField, 'CEP deve ter 8 dígitos');
            return false;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (data.erro) {
                this.showFieldError(cepField, 'CEP não encontrado');
                return false;
            }

            // Preencher campos automaticamente
            this.fillAddressFields(data);
            return true;
        } catch (error) {
            console.error('Erro ao validar CEP:', error);
            return true; // Não bloquear se houver erro na API
        }
    }

    // Preencher campos de endereço automaticamente
    fillAddressFields(data) {
        const enderecoField = document.getElementById('endereco');
        const bairroField = document.getElementById('bairro');
        const cidadeField = document.getElementById('cidade');
        const estadoField = document.getElementById('estado');

        if (enderecoField && data.logradouro) {
            enderecoField.value = data.logradouro;
        }
        if (bairroField && data.bairro) {
            bairroField.value = data.bairro;
        }
        if (cidadeField && data.localidade) {
            cidadeField.value = data.localidade;
        }
        if (estadoField && data.uf) {
            estadoField.value = data.uf;
        }
    }

    // Validação de email
    validateEmail(field) {
        const value = field.value.trim();

        if (!value && field.hasAttribute('required')) {
            this.showFieldError(field, 'Email é obrigatório');
            return false;
        }

        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            this.showFieldError(field, 'Email inválido');
            return false;
        }

        return true;
    }

    // Validação de campo obrigatório
    validateRequired(field) {
        const value = field.value.trim();

        if (!value) {
            const label = field.previousElementSibling?.textContent || 'Este campo';
            this.showFieldError(field, `${label} é obrigatório`);
            return false;
        }

        return true;
    }

    // Validação de seção
    validateSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return true;

        let isValid = true;
        const fields = section.querySelectorAll('input, select, textarea');

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Validação completa do formulário
    validateForm() {
        let isValid = true;
        const allFields = document.querySelectorAll('#cadastro-form input, #cadastro-form select, #cadastro-form textarea');

        allFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Validações específicas adicionais
        if (!this.validateResponsiblePerson()) {
            isValid = false;
        }

        if (!this.validateConfirmation()) {
            isValid = false;
        }

        return isValid;
    }

    // Validar se pelo menos um responsável foi marcado como principal
    validateResponsiblePerson() {
        const maeResponsavel = document.getElementById('mae_responsavel_principal');
        const paiResponsavel = document.getElementById('pai_responsavel_principal');
        const outroResponsavel = document.getElementById('outro_responsavel_principal');

        const hasResponsible = (maeResponsavel && maeResponsavel.checked) ||
                             (paiResponsavel && paiResponsavel.checked) ||
                             (outroResponsavel && outroResponsavel.checked);

        if (!hasResponsible) {
            alert('É necessário marcar pelo menos um responsável como principal.');
            return false;
        }

        return true;
    }

    // Validar confirmação final
    validateConfirmation() {
        const confirmarDados = document.getElementById('confirmar_dados');
        
        if (!confirmarDados || !confirmarDados.checked) {
            this.showFieldError(confirmarDados, 'É necessário confirmar os dados');
            return false;
        }

        return true;
    }

    // Mostrar erro no campo
    showFieldError(field, message) {
        const errorElement = document.getElementById(`${field.id}-error`) || 
                           document.getElementById(`${field.name}-error`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        field.classList.add('error');
        this.errors[field.id || field.name] = message;
    }

    // Limpar erro do campo
    clearFieldError(field) {
        const errorElement = document.getElementById(`${field.id}-error`) || 
                           document.getElementById(`${field.name}-error`);
        
        if (errorElement) {
            errorElement.style.display = 'none';
        }

        field.classList.remove('error');
        delete this.errors[field.id || field.name];
    }

    // Formatação de CPF
    formatCPF(field) {
        let value = field.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        field.value = value;
    }

    // Formatação de telefone
    formatPhone(field) {
        let value = field.value.replace(/\D/g, '');
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        field.value = value;
    }

    // Formatação de CEP
    formatCEP(field) {
        let value = field.value.replace(/\D/g, '');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        field.value = value;
    }

    // Formatação de Cartão SUS
    formatCartaoSUS(field) {
        let value = field.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1 $2');
        value = value.replace(/(\d{4})(\d)/, '$1 $2');
        value = value.replace(/(\d{4})(\d)/, '$1 $2');
        field.value = value;
    }

    // Cálculo automático de idade
    calculateAge() {
        const birthDateField = document.getElementById('data_nascimento');
        const ageField = document.getElementById('idade');

        if (!birthDateField.value || !ageField) return;

        const birthDate = new Date(birthDateField.value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        ageField.value = age >= 0 ? `${age} anos` : '';
    }

    // Verificar se há erros
    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    // Obter lista de erros
    getErrors() {
        return this.errors;
    }

    // Limpar todos os erros
    clearAllErrors() {
        this.errors = {};
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
    }
}

// Inicializar o sistema de validações quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    window.formValidator = new FormValidator();
    
    // Integrar com o sistema de navegação entre seções
    setupSectionNavigation();
    
    // Integrar com o envio do formulário
    setupFormSubmission();
});

// Configurar navegação entre seções com validação
function setupSectionNavigation() {
    // Botões "Próximo"
    document.querySelectorAll('[id^="btn-next-"]').forEach(button => {
        button.addEventListener('click', function() {
            const sectionNumber = this.id.split('-')[2];
            const currentSection = `section-${sectionNumber}`;
            
            if (window.formValidator.validateSection(currentSection)) {
                // Navegar para próxima seção
                navigateToSection(parseInt(sectionNumber) + 1);
            } else {
                // Focar no primeiro campo com erro
                const firstError = document.querySelector(`#${currentSection} .error`);
                if (firstError) {
                    firstError.focus();
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });
}

// Configurar envio do formulário com validação
function setupFormSubmission() {
    const form = document.getElementById('cadastro-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (window.formValidator.validateForm()) {
                // Formulário válido, enviar dados
                submitForm();
            } else {
                // Mostrar erros e focar no primeiro campo com erro
                const firstError = document.querySelector('.error');
                if (firstError) {
                    firstError.focus();
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                alert('Por favor, corrija os erros antes de enviar o formulário.');
            }
        });
    }
}

// Função para navegar entre seções (deve ser implementada no seu arquivo principal)
function navigateToSection(sectionNumber) {
    // Esta função deve ser implementada no seu arquivo principal de registro.js
    console.log(`Navegando para seção ${sectionNumber}`);
}

// Função para enviar o formulário (deve ser implementada no seu arquivo principal)
function submitForm() {
    // Esta função deve ser implementada no seu arquivo principal de registro.js
    console.log('Enviando formulário...');
}

// Exportar para uso global
window.FormValidator = FormValidator;