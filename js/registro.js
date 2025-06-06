
// Sistema de navegação entre seções do formulário
class FormNavigation {
    constructor() {
        this.currentSection = 1;
        this.totalSections = 12;
        this.formData = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgress();
        this.updateStepIndicators();
        this.setupConditionalFields();
    }

    setupEventListeners() {
        // Botões de navegação
        for (let i = 1; i <= this.totalSections; i++) {
            // Botão próximo
            const nextBtn = document.getElementById(`btn-next-${i}`);
            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.nextSection());
            }

            // Botão anterior
            const prevBtn = document.getElementById(`btn-prev-${i}`);
            if (prevBtn) {
                prevBtn.addEventListener('click', () => this.prevSection());
            }
        }

        // Botão de submissão
        const submitBtn = document.getElementById('btn-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => this.handleSubmit(e));
        }

        // Formulário
        const form = document.getElementById('cadastro-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    setupConditionalFields() {
        // Campo "outro responsável"
        const temOutroResponsavel = document.getElementById('tem_outro_responsavel');
        const outroResponsavelFields = document.getElementById('outro-responsavel-fields');
        
        if (temOutroResponsavel && outroResponsavelFields) {
            temOutroResponsavel.addEventListener('change', function() {
                outroResponsavelFields.style.display = this.checked ? 'block' : 'none';
            });
        }

        // Campo BPC
        const temBpcSim = document.getElementById('tem_bpc_sim');
        const temBpcNao = document.getElementById('tem_bpc_nao');
        const bpcFields = document.getElementById('bpc-fields');
        
        if (temBpcSim && temBpcNao && bpcFields) {
            [temBpcSim, temBpcNao].forEach(radio => {
                radio.addEventListener('change', function() {
                    bpcFields.style.display = temBpcSim.checked ? 'block' : 'none';
                });
            });
        }

        // Campo escola
        const estudaSim = document.getElementById('estuda_sim');
        const estudaNao = document.getElementById('estuda_nao');
        const escolaFields = document.getElementById('escola-fields');
        
        if (estudaSim && estudaNao && escolaFields) {
            [estudaSim, estudaNao].forEach(radio => {
                radio.addEventListener('change', function() {
                    escolaFields.style.display = estudaSim.checked ? 'block' : 'none';
                });
            });
        }

        // Campos de tratamentos (quimio, radio, cirurgia)
        this.setupTreatmentFields('quimio', 'fez_quimio');
        this.setupTreatmentFields('radio', 'fez_radio');
        this.setupTreatmentFields('cirurgia', 'fez_cirurgia');

        // Campo medicamentos
        const medicamentosSim = document.getElementById('medicamentos_sim');
        const medicamentosNao = document.getElementById('medicamentos_nao');
        const medicamentosFields = document.getElementById('medicamentos-fields');
        
        if (medicamentosSim && medicamentosNao && medicamentosFields) {
            [medicamentosSim, medicamentosNao].forEach(radio => {
                radio.addEventListener('change', function() {
                    medicamentosFields.style.display = medicamentosSim.checked ? 'block' : 'none';
                });
            });
        }

        // Botões para adicionar itens dinâmicos
        this.setupDynamicFields();

        // Cálculo automático da idade
        this.setupAgeCalculation();

        // Cálculo automático da renda familiar
        this.setupFamilyIncomeCalculation();

        // Máscara para campos
        this.setupFieldMasks();
    }

    setupTreatmentFields(treatmentType, radioName) {
        const simRadio = document.querySelector(`input[name="${radioName}"][value="sim"]`);
        const naoRadio = document.querySelector(`input[name="${radioName}"][value="nao"]`);
        const fields = document.getElementById(`${treatmentType}-fields`);
        
        if (simRadio && naoRadio && fields) {
            [simRadio, naoRadio].forEach(radio => {
                radio.addEventListener('change', function() {
                    fields.style.display = simRadio.checked ? 'block' : 'none';
                });
            });
        }
    }

    setupDynamicFields() {
        // Adicionar quimioterapia
        const addQuimioBtn = document.getElementById('add-quimio');
        if (addQuimioBtn) {
            addQuimioBtn.addEventListener('click', () => this.addDynamicField('quimio'));
        }

        // Adicionar radioterapia
        const addRadioBtn = document.getElementById('add-radio');
        if (addRadioBtn) {
            addRadioBtn.addEventListener('click', () => this.addDynamicField('radio'));
        }

        // Adicionar cirurgia
        const addCirurgiaBtn = document.getElementById('add-cirurgia');
        if (addCirurgiaBtn) {
            addCirurgiaBtn.addEventListener('click', () => this.addDynamicField('cirurgia'));
        }

        // Adicionar diagnóstico
        const addDiagnosticoBtn = document.getElementById('add-diagnostico');
        if (addDiagnosticoBtn) {
            addDiagnosticoBtn.addEventListener('click', () => this.addDiagnosticoField());
        }

        // Adicionar medicamento
        const addMedicamentoBtn = document.getElementById('add-medicamento');
        if (addMedicamentoBtn) {
            addMedicamentoBtn.addEventListener('click', () => this.addMedicamentoField());
        }

        // Adicionar diagnóstico familiar
        const addDiagnosticoFamiliaBtn = document.getElementById('add-diagnostico-familia');
        if (addDiagnosticoFamiliaBtn) {
            addDiagnosticoFamiliaBtn.addEventListener('click', () => this.addDiagnosticoFamiliaField());
        }
    }

    setupAgeCalculation() {
        const dataNascimento = document.getElementById('data_nascimento');
        const idadeField = document.getElementById('idade');
        
        if (dataNascimento && idadeField) {
            dataNascimento.addEventListener('change', function() {
                if (this.value) {
                    const birthDate = new Date(this.value);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    
                    idadeField.value = age + ' anos';
                }
            });
        }
    }

    setupFamilyIncomeCalculation() {
        const salaryFields = ['mae_salario', 'pai_salario', 'outro_salario'];
        const rendaFamiliar = document.getElementById('renda_familiar');
        const valorBpc = document.getElementById('valor_bpc');
        
        const calculateIncome = () => {
            let total = 0;
            
            salaryFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && field.value) {
                    const value = parseFloat(field.value.replace(/[^\d,]/g, '').replace(',', '.'));
                    if (!isNaN(value)) {
                        total += value;
                    }
                }
            });
            
            // Adicionar BPC se aplicável
            if (valorBpc && valorBpc.value) {
                const bpcValue = parseFloat(valorBpc.value.replace(/[^\d,]/g, '').replace(',', '.'));
                if (!isNaN(bpcValue)) {
                    total += bpcValue;
                }
            }
            
            if (rendaFamiliar) {
                rendaFamiliar.value = 'R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            }
        };
        
        salaryFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', calculateIncome);
            }
        });
        
        if (valorBpc) {
            valorBpc.addEventListener('input', calculateIncome);
        }
    }

    setupFieldMasks() {
        // Máscara para CPF
        const cpfFields = ['cpf', 'mae_cpf', 'pai_cpf', 'outro_cpf'];
        cpfFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', function() {
                    let value = this.value.replace(/\D/g, '');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    this.value = value;
                });
            }
        });

        // Máscara para telefone
        const phoneFields = ['telefone1', 'telefone2', 'mae_telefone', 'pai_telefone', 'outro_telefone'];
        phoneFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', function() {
                    let value = this.value.replace(/\D/g, '');
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
                    this.value = value;
                });
            }
        });

        // Máscara para CEP
        const cepField = document.getElementById('cep');
        if (cepField) {
            cepField.addEventListener('input', function() {
                let value = this.value.replace(/\D/g, '');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                this.value = value;
            });
        }

        // Máscara para Cartão SUS
        const cartaoSusField = document.getElementById('cartao_sus');
        if (cartaoSusField) {
            cartaoSusField.addEventListener('input', function() {
                let value = this.value.replace(/\D/g, '');
                value = value.replace(/(\d{3})(\d{4})(\d{4})(\d)/, '$1 $2 $3 $4');
                this.value = value;
            });
        }

        // Máscara para salários
        const salaryFields = ['mae_salario', 'pai_salario', 'outro_salario', 'valor_bpc'];
        salaryFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', function() {
                    let value = this.value.replace(/\D/g, '');
                    value = (value / 100).toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                    });
                    this.value = value;
                });
            }
        });
    }

    addDynamicField(type) {
        const container = document.getElementById(`${type}-list`);
        if (!container) return;

        const existingItems = container.querySelectorAll(`.${type}-item, .${type}-item-form`);
        const newIndex = existingItems.length + 1;

        let html = '';
        if (type === 'radio') {
            html = `
                <div class="${type}-item-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="${type}_data_${newIndex}">Data</label>
                            <input type="date" id="${type}_data_${newIndex}" name="${type}_data_${newIndex}" />
                        </div>
                        <div class="form-group full-width">
                            <label for="${type}_local_${newIndex}">Local</label>
                            <input type="text" id="${type}_local_${newIndex}" name="${type}_local_${newIndex}" />
                        </div>
                    </div>
                    <button type="button" class="btn-remove" onclick="this.parentElement.remove()">Remover</button>
                </div>
            `;
        } else {
            html = `
                <div class="${type}-item">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="${type}_data_${newIndex}">Data</label>
                            <input type="date" id="${type}_data_${newIndex}" name="${type}_data_${newIndex}" />
                        </div>
                        <div class="form-group full-width">
                            <label for="${type}_local_${newIndex}">Local</label>
                            <input type="text" id="${type}_local_${newIndex}" name="${type}_local_${newIndex}" />
                        </div>
                    </div>
                    <button type="button" class="btn-remove" onclick="this.parentElement.remove()">Remover</button>
                </div>
            `;
        }

        container.insertAdjacentHTML('beforeend', html);
    }

    addDiagnosticoField() {
        const container = document.getElementById('diagnosticos-list');
        if (!container) return;

        const existingItems = container.querySelectorAll('.diagnostico-item');
        const newIndex = existingItems.length + 1;

        const html = `
            <div class="diagnostico-item">
                <div class="form-row">
                    <div class="form-group">
                        <label for="cid_${newIndex}">CID</label>
                        <input type="text" id="cid_${newIndex}" name="cid_${newIndex}" />
                    </div>
                    <div class="form-group full-width">
                        <label for="descricao_${newIndex}">Descrição</label>
                        <input type="text" id="descricao_${newIndex}" name="descricao_${newIndex}" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group full-width">
                        <label for="observacao_${newIndex}">Observação</label>
                        <textarea id="observacao_${newIndex}" name="observacao_${newIndex}" rows="2"></textarea>
                    </div>
                </div>
                <button type="button" class="btn-remove" onclick="this.parentElement.remove()">Remover</button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', html);
    }

    addMedicamentoField() {
        const container = document.getElementById('medicamentos-list');
        if (!container) return;

        const existingItems = container.querySelectorAll('.medicamento-item');
        const newIndex = existingItems.length + 1;

        const html = `
            <div class="medicamento-item">
                <div class="form-row">
                    <div class="form-group">
                        <label for="medicamento_nome_${newIndex}">Nome do Medicamento</label>
                        <input type="text" id="medicamento_nome_${newIndex}" name="medicamento_nome_${newIndex}" />
                    </div>
                    <div class="form-group">
                        <label for="medicamento_dosagem_${newIndex}">Dosagem</label>
                        <input type="text" id="medicamento_dosagem_${newIndex}" name="medicamento_dosagem_${newIndex}" />
                    </div>
                    <div class="form-group">
                        <label for="medicamento_frequencia_${newIndex}">Frequência</label>
                        <input type="text" id="medicamento_frequencia_${newIndex}" name="medicamento_frequencia_${newIndex}" />
                    </div>
                </div>
                <button type="button" class="btn-remove" onclick="this.parentElement.remove()">Remover</button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', html);
    }

    addDiagnosticoFamiliaField() {
        const container = document.getElementById('diagnosticos-familia-list');
        if (!container) return;

        const existingItems = container.querySelectorAll('.diagnostico-familia-item');
        const newIndex = existingItems.length + 1;

        const html = `
            <div class="diagnostico-familia-item">
                <div class="form-row">
                    <div class="form-group">
                        <label for="familia_cid_${newIndex}">CID</label>
                        <input type="text" id="familia_cid_${newIndex}" name="familia_cid_${newIndex}" />
                    </div>
                    <div class="form-group">
                        <label for="familia_parentesco_${newIndex}">Parentesco</label>
                        <input type="text" id="familia_parentesco_${newIndex}" name="familia_parentesco_${newIndex}" placeholder="Ex: Mãe, Pai, Avó..." />
                    </div>
                    <div class="form-group">
                        <label for="familia_descricao_${newIndex}">Descrição</label>
                        <input type="text" id="familia_descricao_${newIndex}" name="familia_descricao_${newIndex}" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group full-width">
                        <label for="familia_observacao_${newIndex}">Observação</label>
                        <textarea id="familia_observacao_${newIndex}" name="familia_observacao_${newIndex}" rows="2"></textarea>
                    </div>
                </div>
                <button type="button" class="btn-remove" onclick="this.parentElement.remove()">Remover</button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', html);
    }

    nextSection() {
        if (this.currentSection < this.totalSections) {
            this.hideSection(this.currentSection);
            this.currentSection++;
            this.showSection(this.currentSection);
            this.updateProgress();
            this.updateStepIndicators();
            
            // Se chegou na última seção, atualizar o resumo
            if (this.currentSection === this.totalSections) {
                this.updateSummary();
            }
        }
    }

    prevSection() {
        if (this.currentSection > 1) {
            this.hideSection(this.currentSection);
            this.currentSection--;
            this.showSection(this.currentSection);
            this.updateProgress();
            this.updateStepIndicators();
        }
    }

    showSection(sectionNumber) {
        const section = document.getElementById(`section-${sectionNumber}`);
        if (section) {
            section.classList.add('active');
            // Scroll para o topo da seção
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    hideSection(sectionNumber) {
        const section = document.getElementById(`section-${sectionNumber}`);
        if (section) {
            section.classList.remove('active');
        }
    }

    updateProgress() {
        const progressBar = document.getElementById('form-progress');
        const completionPercentage = document.getElementById('completion-percentage');
        
        if (progressBar && completionPercentage) {
            const percentage = Math.round((this.currentSection / this.totalSections) * 100);
            progressBar.style.width = `${percentage}%`;
            completionPercentage.textContent = `${percentage}%`;
        }
    }

    updateStepIndicators() {
        for (let i = 1; i <= this.totalSections; i++) {
            const stepCircle = document.getElementById(`step-${i}`);
            const stepText = stepCircle?.parentElement.querySelector('.step-text');
            
            if (stepCircle && stepText) {
                if (i < this.currentSection) {
                    // Seção completada
                    stepCircle.classList.remove('active');
                    stepCircle.classList.add('completed');
                    stepText.classList.remove('active');
                    stepText.classList.add('completed');
                } else if (i === this.currentSection) {
                    // Seção atual
                    stepCircle.classList.add('active');
                    stepCircle.classList.remove('completed');
                    stepText.classList.add('active');
                    stepText.classList.remove('completed');
                } else {
                    // Seção futura
                    stepCircle.classList.remove('active', 'completed');
                    stepText.classList.remove('active', 'completed');
                }
            }
        }
    }

    updateSummary() {
        // Atualizar o resumo na última seção
        const summaryFields = {
            'summary-paciente': document.getElementById('paciente')?.value || '-',
            'summary-nascimento': document.getElementById('data_nascimento')?.value || '-',
            'summary-cpf': document.getElementById('cpf')?.value || '-',
            'summary-telefone': document.getElementById('telefone1')?.value || '-',
            'summary-endereco': this.getFullAddress(),
            'summary-responsavel': this.getMainResponsible()
        };

        Object.entries(summaryFields).forEach(([elementId, value]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value;
            }
        });
    }

    getFullAddress() {
        const endereco = document.getElementById('endereco')?.value || '';
        const numero = document.getElementById('numero')?.value || '';
        const bairro = document.getElementById('bairro')?.value || '';
        const cidade = document.getElementById('cidade')?.value || '';
        const estado = document.getElementById('estado')?.value || '';

        if (!endereco) return '-';

        return `${endereco}, ${numero} - ${bairro}, ${cidade}/${estado}`;
    }

    getMainResponsible() {
        const maeResponsavel = document.getElementById('mae_responsavel_principal')?.checked;
        const paiResponsavel = document.getElementById('pai_responsavel_principal')?.checked;
        const outroResponsavel = document.getElementById('outro_responsavel_principal')?.checked;

        if (maeResponsavel) {
            return document.getElementById('mae_nome')?.value || 'Mãe';
        } else if (paiResponsavel) {
            return document.getElementById('pai_nome')?.value || 'Pai';
        } else if (outroResponsavel) {
            return document.getElementById('outro_nome')?.value || 'Outro';
        }

        return 'Não informado';
    }

    handleSubmit(e) {
        e.preventDefault();
        
        // Verificar se o checkbox de confirmação está marcado
        const confirmarDados = document.getElementById('confirmar_dados');
        if (!confirmarDados || !confirmarDados.checked) {
            alert('Por favor, confirme que todas as informações estão corretas.');
            return;
        }

        // Simular salvamento
        this.showSuccessMessage();
    }

    showSuccessMessage() {
        const successMessage = document.getElementById('success-message');
        const form = document.getElementById('cadastro-form');
        
        if (successMessage && form) {
            form.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Scroll para a mensagem
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Opcional: redirecionar após alguns segundos
            setTimeout(() => {
                // window.location.href = 'pacientes.html';
            }, 3000);
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    new FormNavigation();
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
  