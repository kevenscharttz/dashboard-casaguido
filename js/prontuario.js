// prontuario.js
// Script para carregar e preencher dinamicamente o prontuário do paciente

document.addEventListener('DOMContentLoaded', function() {
    // Função utilitária para obter parâmetros da URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Função para preencher campo ou "não informado"
    function fillField(selector, value, formatter) {
        const el = document.querySelector(selector);
        if (!el) return;
        if (value === undefined || value === null || value === "") {
            el.textContent = 'não informado';
        } else {
            el.textContent = formatter ? formatter(value) : value;
        }
    }

    // Função para preencher campos de link (telefone, etc)
    function fillLink(selector, value, formatter) {
        const el = document.querySelector(selector);
        if (!el) return;
        if (!value) {
            el.textContent = 'não informado';
            el.removeAttribute('href');
        } else {
            el.textContent = formatter ? formatter(value) : value;
            el.href = 'tel:' + value;
        }
    }

    // Função para preencher HTML (listas, artigos, etc)
    function fillHTML(selector, html) {
        const el = document.querySelector(selector);
        if (el) el.innerHTML = html || '<p>não informado</p>';
    }

    // Função para calcular idade
    function calcularIdade(dataNasc) {
        if (!dataNasc) return 'não informado';
        const nasc = new Date(dataNasc);
        const hoje = new Date();
        let anos = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) anos--;
        if (anos < 1) {
            let meses = (hoje.getFullYear() - nasc.getFullYear()) * 12 + (hoje.getMonth() - nasc.getMonth());
            if (hoje.getDate() < nasc.getDate()) meses--;
            meses = Math.max(meses, 0);
            return meses + (meses === 1 ? ' mês' : ' meses');
        } else {
            return anos + (anos === 1 ? ' ano' : ' anos');
        }
    }

    // Obter ID do paciente da URL
    const prontuarioId = getQueryParam('id');
    if (!prontuarioId) {
        alert('ID do paciente não informado na URL.');
        return;
    }

    // Buscar dados do paciente no backend
    fetch(`/paciente/${prontuarioId}`)
        .then(res => res.json())
        .then(data => {
            // Avatar
            const avatar = (data.nome_pcte || '').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || 'NI';
            fillField('.patient-avatar', avatar);
            fillField('#patient-name', data.nome_pcte);
            fillField('#patient-id', data.id_pcte ? `Prontuário: ${data.id_pcte}` : null);
            fillField('#patient-age', data.data_nasc_pcte ? calcularIdade(data.data_nasc_pcte) : null);
            fillField('#patient-cpf', data.cpf_pcte);
            fillField('#birth-date', data.data_nasc_pcte ? new Date(data.data_nasc_pcte).toLocaleDateString('pt-BR') : null);
            fillField('#sus-card', data.cns_pcte);
            fillHTML('#address', data.endereco ? `<address>${data.endereco}</address>` : null);
            fillLink('#phone a', data.tel_pcte);

            // Familiares (exemplo: mãe, pai, outro)
            let familiaresHTML = '';
            if (data.responsavel) {
                if (data.responsavel.mae_nome) {
                    familiaresHTML += `<article class="family-member"><h4>Mãe</h4><dl><dt>Nome:</dt><dd>${data.responsavel.mae_nome}</dd><dt>Telefone:</dt><dd>${data.responsavel.mae_telefone || 'não informado'}</dd><dt>Responsável principal:</dt><dd>${data.responsavel.mae_responsavel_principal ? 'Sim' : 'Não'}</dd></dl></article>`;
                }
                if (data.responsavel.pai_nome) {
                    familiaresHTML += `<article class="family-member"><h4>Pai</h4><dl><dt>Nome:</dt><dd>${data.responsavel.pai_nome}</dd><dt>Telefone:</dt><dd>${data.responsavel.pai_telefone || 'não informado'}</dd><dt>Responsável principal:</dt><dd>${data.responsavel.pai_responsavel_principal ? 'Sim' : 'Não'}</dd></dl></article>`;
                }
                if (data.responsavel.outro_nome) {
                    familiaresHTML += `<article class="family-member"><h4>${data.responsavel.outro_parentesco || 'Outro'}</h4><dl><dt>Nome:</dt><dd>${data.responsavel.outro_nome}</dd><dt>Telefone:</dt><dd>${data.responsavel.outro_telefone || 'não informado'}</dd><dt>Responsável principal:</dt><dd>${data.responsavel.outro_responsavel_principal ? 'Sim' : 'Não'}</dd></dl></article>`;
                }
            }
            fillHTML('.family-grid', familiaresHTML || '<p>não informado</p>');

            // Diagnóstico principal
            fillField('.diagnosis-badge', data.diagnosticos?.nome?.[0]);
            fillField('.diagnosis-details-item:nth-child(1) dd', data.diagnosticos?.cid?.[0]);
            fillField('.diagnosis-details-item:nth-child(2) dd', data.status || 'não informado');
            fillField('.diagnosis-details-item:nth-child(3) dd', data.ultimo_atendimento ? new Date(data.ultimo_atendimento).toLocaleDateString('pt-BR') : null);

            // Tratamentos (quimio, radio, cirurgia)
            let tratamentosHTML = '';
            if (data.quimio && data.quimio.tipo?.length) {
                data.quimio.tipo.forEach((tipo, i) => {
                    tratamentosHTML += `<article class="treatment-item"><header class="treatment-header"><time class="treatment-date">Data de início: ${data.quimio.inicio[i] || 'não informado'}</time><h4>${tipo || 'Quimioterapia'}</h4></header><div class="treatment-details"><p><strong>Local:</strong> ${data.quimio.local[i] || 'não informado'}</p><p><strong>Observações:</strong> ${data.quimio.observacoes?.[i] || 'não informado'}</p></div></article>`;
                });
            }
            if (data.radio && data.radio.tipo?.length) {
                data.radio.tipo.forEach((tipo, i) => {
                    tratamentosHTML += `<article class="treatment-item"><header class="treatment-header"><time class="treatment-date">Data de início: ${data.radio.inicio[i] || 'não informado'}</time><h4>${tipo || 'Radioterapia'}</h4></header><div class="treatment-details"><p><strong>Local:</strong> ${data.radio.local[i] || 'não informado'}</p><p><strong>Observações:</strong> ${data.radio.observacoes?.[i] || 'não informado'}</p></div></article>`;
                });
            }
            if (data.cirurgia && data.cirurgia.tipo?.length) {
                data.cirurgia.tipo.forEach((tipo, i) => {
                    tratamentosHTML += `<article class="treatment-item"><header class="treatment-header"><time class="treatment-date">Data de início: ${data.cirurgia.inicio[i] || 'não informado'}</time><h4>${tipo || 'Cirurgia'}</h4></header><div class="treatment-details"><p><strong>Local:</strong> ${data.cirurgia.local[i] || 'não informado'}</p><p><strong>Observações:</strong> ${data.cirurgia.observacoes?.[i] || 'não informado'}</p></div></article>`;
                });
            }
            fillHTML('.treatment-content', tratamentosHTML || '<p>não informado</p>');

            // Histórico de saúde
            fillField('.health-history dd:nth-child(2)', data.condicoes || 'não informado');
            let medicamentosHTML = '';
            if (data.medicamentos && data.medicamentos.nome?.length) {
                medicamentosHTML = data.medicamentos.nome.map((m, i) => `<li>${m} ${data.medicamentos.dosagem?.[i] || ''} ${data.medicamentos.frequencia?.[i] || ''}</li>`).join('');
            }
            fillHTML('.health-history dd:nth-child(4) ul', medicamentosHTML || '<li>não informado</li>');
            fillField('.health-history dd:nth-child(6)', data.ubs_municipio || 'não informado');
            fillField('.health-history dd:nth-child(8)', data.historico_familiar || 'não informado');

            // Situação socioeconômica
            fillField('.socioeconomic-info dd:nth-child(2)', data.renda_familiar || 'não informado');
            fillField('.socioeconomic-info dd:nth-child(4)', data.valor_bpc ? `Sim - R$ ${data.valor_bpc}` : 'não informado');
            fillField('.socioeconomic-info dd:nth-child(6)', data.instituicao_ensino || 'não informado');
            fillField('.socioeconomic-info dd:nth-child(8)', data.situacao_habitacional || 'não informado');
        })
        .catch(err => {
            alert('Erro ao buscar dados do paciente.');
        });

    // Botão fechar: volta para a tela anterior ou pacientes
    const btnClose = document.querySelector('.btn-close');
    if (btnClose) {
        btnClose.addEventListener('click', function() {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'pacientes.html';
            }
        });
    }

    // Botão imprimir: imprime apenas o prontuário
    const btnPrint = document.querySelector('.btn-print');
    if (btnPrint) {
        btnPrint.addEventListener('click', function() {
            window.print();
        });
    }

    // Botão exportar PDF: usa print com dica
    const btnPdf = document.querySelector('.btn-pdf');
    if (btnPdf) {
        btnPdf.addEventListener('click', function() {
            alert('Para exportar como PDF, selecione "Salvar como PDF" na janela de impressão.');
            window.print();
        });
    }
});
