   document.addEventListener("DOMContentLoaded", function () {
        // Variáveis para controle do formulário
        const sections = document.querySelectorAll(".form-section");
        const steps = document.querySelectorAll(".step-circle");
        const progress = document.getElementById("form-progress");
        const percentageText = document.getElementById("completion-percentage");
        let currentSection = 1;
        const totalSections = sections.length;

        // Preencher a data atual no campo de data de cadastro
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];
        document.getElementById("data_cadastro").value = formattedDate;

        // Funções para navegação entre seções
        function showSection(sectionNumber) {
          // Esconder todas as seções
          sections.forEach((section) => {
            section.classList.remove("active");
          });

          // Mostrar a seção atual
          document.getElementById(`section-${sectionNumber}`).classList.add("active");

          // Atualizar os indicadores de etapa
          updateSteps(sectionNumber);

          // Atualizar a barra de progresso
          updateProgress(sectionNumber);

          // Rolar para o topo da página
          window.scrollTo({ top: 0, behavior: "smooth" });
        }

        function updateSteps(currentStep) {
          // Atualizar os estilos dos passos
          steps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove("active", "completed");
            document.querySelectorAll(".step-text")[index].classList.remove("active");

            if (stepNumber === currentStep) {
              step.classList.add("active");
              document.querySelectorAll(".step-text")[index].classList.add("active");
            } else if (stepNumber < currentStep) {
              step.classList.add("completed");
              step.textContent = "✓";
            } else {
              step.textContent = stepNumber;
            }
          });
        }

        function updateProgress(currentStep) {
          // Calcular o progresso
          const progressPercentage = ((currentStep - 1) / (totalSections - 1)) * 100;
          progress.style.width = progressPercentage + "%";
          percentageText.textContent = Math.round(progressPercentage) + "%";
        }

        // Navegação para a seção seguinte
        function goToNextSection() {
          if (validateCurrentSection()) {
            if (currentSection < totalSections) {
              currentSection++;
              showSection(currentSection);
            }
          }
        }

        // Navegação para a seção anterior
        function goToPreviousSection() {
          if (currentSection > 1) {
            currentSection--;
            showSection(currentSection);
          }
        }

        // Validação da seção atual
        function validateCurrentSection() {
          // Lógica de validação para cada seção
          switch (currentSection) {
            case 1:
              return validateSection1();
            case 2:
              return validateSection2();
            case 3:
              return true; // Seção 3 não tem campos obrigatórios
            case 4:
              return validateSection4();
            case 5:
              return validateSection5();
            default:
              return true;
          }
        }

        // Funções de validação para cada seção
        function validateSection1() {
          let isValid = true;

          // Validar nome do paciente
          const paciente = document.getElementById("paciente");
          if (!paciente.value.trim()) {
            showError(paciente, "paciente-error");
            isValid = false;
          } else {
            hideError(paciente, "paciente-error");
          }

          // Validar data de nascimento
          const dataNascimento = document.getElementById("data_nascimento");
          if (!dataNascimento.value) {
            showError(dataNascimento, "data_nascimento-error");
            isValid = false;
          } else {
            hideError(dataNascimento, "data_nascimento-error");
          }

          // Validar nome da mãe
          const mae = document.getElementById("mae");
          if (!mae.value.trim()) {
            showError(mae, "mae-error");
            isValid = false;
          } else {
            hideError(mae, "mae-error");
          }

          return isValid;
        }

        function validateSection2() {
          let isValid = true;

          // Validar telefone principal
          const telefone1 = document.getElementById("telefone1");
          if (!telefone1.value.trim()) {
            showError(telefone1, "telefone1-error");
            isValid = false;
          } else {
            hideError(telefone1, "telefone1-error");
          }

          // Validar CEP
          const cep = document.getElementById("cep");
          if (!cep.value.trim()) {
            showError(cep, "cep-error");
            isValid = false;
          } else {
            hideError(cep, "cep-error");
          }

          // Validar endereço
          const endereco = document.getElementById("endereco");
          if (!endereco.value.trim()) {
            showError(endereco, "endereco-error");
            isValid = false;
          } else {
            hideError(endereco, "endereco-error");
          }

          // Validar número
          const numero = document.getElementById("numero");
          if (!numero.value.trim()) {
            showError(numero, "numero-error");
            isValid = false;
          } else {
            hideError(numero, "numero-error");
          }

          // Validar bairro
          const bairro = document.getElementById("bairro");
          if (!bairro.value.trim()) {
            showError(bairro, "bairro-error");
            isValid = false;
          } else {
            hideError(bairro, "bairro-error");
          }

          // Validar cidade
          const cidade = document.getElementById("cidade");
          if (!cidade.value.trim()) {
            showError(cidade, "cidade-error");
            isValid = false;
          } else {
            hideError(cidade, "cidade-error");
          }

          // Validar estado
          const estado = document.getElementById("estado");
          if (!estado.value) {
            showError(estado, "estado-error");
            isValid = false;
          } else {
            hideError(estado, "estado-error");
          }

          return isValid;
        }

        function validateSection4() {
          let isValid = true;

          // Validar diagnóstico
          const diagnostico = document.getElementById("diagnostico");
          if (!diagnostico.value.trim()) {
            showError(diagnostico, "diagnostico-error");
            isValid = false;
          } else {
            hideError(diagnostico, "diagnostico-error");
          }

          // Validar hospital de tratamento
          const hospitalTratamento = document.getElementById("hospital_tratamento");
          if (!hospitalTratamento.value.trim()) {
            showError(hospitalTratamento, "hospital_tratamento-error");
            isValid = false;
          } else {
            hideError(hospitalTratamento, "hospital_tratamento-error");
          }

          return isValid;
        }

        function validateSection5() {
          let isValid = true;

          // Validar consentimento
          const consentimento = document.getElementById("consentimento");
          if (!consentimento.checked) {
            showError(consentimento, "consentimento-error");
            isValid = false;
          } else {
            hideError(consentimento, "consentimento-error");
          }

          // Validar responsável pelo cadastro
          const responsavelCadastro = document.getElementById("responsavel_cadastro");
          if (!responsavelCadastro.value.trim()) {
            showError(responsavelCadastro, "responsavel_cadastro-error");
            isValid = false;
          } else {
            hideError(responsavelCadastro, "responsavel_cadastro-error");
          }

          return isValid;
        }

        // Funções auxiliares para exibir e ocultar mensagens de erro
        function showError(element, errorId) {
          element.classList.add("error");
          document.getElementById(errorId).classList.add("visible");
        }

        function hideError(element, errorId) {
          element.classList.remove("error");
          document.getElementById(errorId).classList.remove("visible");
        }

        // Evento de cálculo de idade baseado na data de nascimento
        document.getElementById("data_nascimento").addEventListener("change", function () {
          const dataNascimento = new Date(this.value);
          const hoje = new Date();
          let idade = hoje.getFullYear() - dataNascimento.getFullYear();
          const m = hoje.getMonth() - dataNascimento.getMonth();
          
          if (m < 0 || (m === 0 && hoje.getDate() < dataNascimento.getDate())) {
            idade--;
          }
          
          document.getElementById("idade").value = idade;
        });

        // Eventos para mostrar/ocultar campos adicionais
        document.getElementById("estado_civil").addEventListener("change", function () {
          const outroContainer = document.getElementById("outro_estado_civil_container");
          if (this.value === "outro") {
            outroContainer.style.display = "block";
          } else {
            outroContainer.style.display = "none";
          }
        });

        document.getElementById("situacao_profissional").addEventListener("change", function () {
          const outroContainer = document.getElementById("outro_situacao_profissional_container");
          if (this.value === "outro") {
            outroContainer.style.display = "block";
          } else {
            outroContainer.style.display = "none";
          }
        });

        // Eventos para tratamentos médicos
        document.getElementById("quimioterapia").addEventListener("change", function () {
          const detalhesContainer = document.getElementById("quimio_detalhes_container");
          if (this.value === "sim") {
            detalhesContainer.style.display = "block";
          } else {
            detalhesContainer.style.display = "none";
          }
        });

        document.getElementById("radioterapia").addEventListener("change", function () {
          const detalhesContainer = document.getElementById("radio_detalhes_container");
          if (this.value === "sim") {
            detalhesContainer.style.display = "block";
          } else {
            detalhesContainer.style.display = "none";
          }
        });

        document.getElementById("cirurgia").addEventListener("change", function () {
          const detalhesContainer = document.getElementById("cirurgia_detalhes_container");
          if (this.value === "sim") {
            detalhesContainer.style.display = "block";
          } else {
            detalhesContainer.style.display = "none";
          }
        });

        document.getElementById("transplante").addEventListener("change", function () {
          const detalhesContainer = document.getElementById("transplante_detalhes_container");
          if (this.value === "sim" || this.value === "aguardando") {
            detalhesContainer.style.display = "block";
          } else {
            detalhesContainer.style.display = "none";
          }
        });

        // Evento para checkbox de outros apoios
        document.getElementById("apoio_outro").addEventListener("change", function () {
          const outroContainer = document.getElementById("outro_apoio_container");
          if (this.checked) {
            outroContainer.style.display = "block";
          } else {
            outroContainer.style.display = "none";
          }
        });

        // Evento para checkbox de outros encaminhamentos
        document.getElementById("enc_outro").addEventListener("change", function () {
          const outroContainer = document.getElementById("outro_enc_container");
          if (this.checked) {
            outroContainer.style.display = "block";
          } else {
            outroContainer.style.display = "none";
          }
        });

        // Calcular renda familiar total
        function calcularRendaFamiliar() {
          const salario = parseFloat(document.getElementById("salario").value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
          const outrasRendas = parseFloat(document.getElementById("outras_rendas").value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
          const rendaTotal = salario + outrasRendas;
          
          document.getElementById("renda_familiar").value = rendaTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });
        }

        document.getElementById("salario").addEventListener("input", function() {
          formatarMoeda(this);
          calcularRendaFamiliar();
        });

        document.getElementById("outras_rendas").addEventListener("input", function() {
          formatarMoeda(this);
          calcularRendaFamiliar();
        });

        // Formatação de campos
        function formatarMoeda(campo) {
          let valor = campo.value.replace(/\D/g, "");
          valor = (parseFloat(valor) / 100).toFixed(2);
          valor = valor.replace(".", ",");
          valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
          campo.value = "R$ " + valor;
        }

        function formatarCPF(campo) {
          let valor = campo.value.replace(/\D/g, "");
          valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
          valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
          valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
          campo.value = valor;
        }

        function formatarTelefone(campo) {
          let valor = campo.value.replace(/\D/g, "");
          if (valor.length > 10) {
            valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
          } else {
            valor = valor.replace(/^(\d{2})(\d{4})(\d{4}).*/, "($1) $2-$3");
          }
          campo.value = valor;
        }

        function formatarCEP(campo) {
          let valor = campo.value.replace(/\D/g, "");
          valor = valor.replace(/^(\d{5})(\d{3}).*/, "$1-$2");
          campo.value = valor;
        }

        function formatarCartaoSUS(campo) {
          let valor = campo.value.replace(/\D/g, "");
          valor = valor.replace(/^(\d{3})(\d{4})(\d{4})(\d{4}).*/, "$1 $2 $3 $4");
          campo.value = valor;
        }

        // Aplicar formatações nos campos
        document.getElementById("cpf").addEventListener("input", function() {
          formatarCPF(this);
        });

        document.getElementById("telefone1").addEventListener("input", function() {
          formatarTelefone(this);
        });

        document.getElementById("telefone2").addEventListener("input", function() {
          formatarTelefone(this);
        });

        document.getElementById("cep").addEventListener("input", function() {
          formatarCEP(this);
        });

        document.getElementById("cartao_sus").addEventListener("input", function() {
          formatarCartaoSUS(this);
        });

        // Eventos de navegação
        document.getElementById("btn-next-1").addEventListener("click", goToNextSection);
        document.getElementById("btn-next-2").addEventListener("click", goToNextSection);
        document.getElementById("btn-next-3").addEventListener("click", goToNextSection);
        document.getElementById("btn-next-4").addEventListener("click", goToNextSection);

        document.getElementById("btn-prev-2").addEventListener("click", goToPreviousSection);
        document.getElementById("btn-prev-3").addEventListener("click", goToPreviousSection);
        document.getElementById("btn-prev-4").addEventListener("click", goToPreviousSection);
        document.getElementById("btn-prev-5").addEventListener("click", goToPreviousSection);

        // Envio do formulário
        document.getElementById("cadastro-form").addEventListener("submit", function (e) {
          e.preventDefault();
          
          if (validateSection5()) {
            // Aqui seria implementada a lógica para enviar os dados para o servidor
            // Por enquanto, apenas exibimos uma mensagem de sucesso
            document.getElementById("success-message").style.display = "block";
            window.scrollTo({ top: 0, behavior: "smooth" });
            
            // Simular redirecionamento após alguns segundos
            setTimeout(function() {
              alert("Cadastro realizado com sucesso! Em um sistema real, você seria redirecionado para a página inicial.");
            }, 3000);
          }
        });

        // Inicialização
        showSection(1);
      });