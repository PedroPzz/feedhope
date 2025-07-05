// Cadastro de Alimento - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos do formulário
    const form = document.getElementById('cadastroAlimentoForm');
    const btnCadastrar = document.getElementById('btnCadastrar');
    const alertContainer = document.getElementById('alert-container');
    
    // Inicializar funcionalidades
    initFormValidation();
    loadEmpresas();
    initDateValidation();
    initPriorityCalculation();
    
    // Submit do formulário
    form.addEventListener('submit', handleFormSubmit);
    
    // Validação do formulário
    function initFormValidation() {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    validateField(this);
                }
            });
        });
        
        // Validação especial para checkboxes de uso recomendado
        const usoRecomendado = form.querySelectorAll('input[name="usoRecomendado"]');
        usoRecomendado.forEach(checkbox => {
            checkbox.addEventListener('change', validateUsoRecomendado);
        });
    }
    
    // Carregar empresas cadastradas
    function loadEmpresas() {
        const empresaSelect = document.getElementById('empresaOrigem');
        const empresas = JSON.parse(localStorage.getItem('feedhope_empresas') || '[]');
        
        // Limpar opções existentes (exceto a primeira)
        empresaSelect.innerHTML = '<option value="">Selecione a empresa</option>';
        
        if (empresas.length === 0) {
            empresaSelect.innerHTML += '<option value="" disabled>Nenhuma empresa cadastrada - Cadastre uma empresa primeiro</option>';
            // Adicionar link para cadastro de empresa
            const linkCadastro = document.createElement('div');
            linkCadastro.className = 'mt-2';
            linkCadastro.innerHTML = '<small class="text-muted">Não encontrou sua empresa? <a href="/Home/CadastroEmpresa" class="text-primary">Cadastre aqui</a></small>';
            empresaSelect.parentNode.appendChild(linkCadastro);
            return;
        }
        
        // Filtrar apenas empresas ativas/aprovadas
        const empresasAtivas = empresas.filter(empresa => 
            empresa.status === 'ativa' || empresa.status === 'aprovada' || !empresa.status
        );
        
        if (empresasAtivas.length === 0) {
            empresaSelect.innerHTML += '<option value="" disabled>Nenhuma empresa ativa encontrada</option>';
            return;
        }
        
        empresasAtivas.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.nomeEmpresa || empresa.nome;
            empresaSelect.appendChild(option);
        });
    }
    
    // Validação de datas
    function initDateValidation() {
        const dataProducao = document.getElementById('dataProducao');
        const dataVencimento = document.getElementById('dataVencimento');
        const dataDisponibilidade = document.getElementById('dataDisponibilidade');
        
        // Definir data mínima para disponibilidade (hoje)
        const hoje = new Date().toISOString().split('T')[0];
        dataDisponibilidade.min = hoje;
        
        // Validar sequência de datas
        [dataProducao, dataVencimento, dataDisponibilidade].forEach(input => {
            input.addEventListener('change', validateDates);
        });
    }
    
    // Cálculo automático de prioridade
    function initPriorityCalculation() {
        const dataVencimento = document.getElementById('dataVencimento');
        const dataDisponibilidade = document.getElementById('dataDisponibilidade');
        const prioridade = document.getElementById('prioridade');
        
        [dataVencimento, dataDisponibilidade].forEach(input => {
            input.addEventListener('change', calculatePriority);
        });
    }
    
    // Validar campo individual
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        
        // Validação básica de campos obrigatórios
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }
        
        // Validações específicas
        switch (field.id) {
            case 'quantidade':
                isValid = value > 0;
                break;
            case 'dataDisponibilidade':
                const hoje = new Date();
                const dataDisp = new Date(value);
                isValid = dataDisp >= hoje;
                break;
        }
        
        // Aplicar classes de validação
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }
        
        return isValid;
    }
    
    // Validar uso recomendado
    function validateUsoRecomendado() {
        const checkboxes = form.querySelectorAll('input[name="usoRecomendado"]');
        const isValid = Array.from(checkboxes).some(cb => cb.checked);
        
        checkboxes.forEach(cb => {
            if (isValid) {
                cb.classList.remove('is-invalid');
                cb.classList.add('is-valid');
            } else {
                cb.classList.remove('is-valid');
                cb.classList.add('is-invalid');
            }
        });
        
        return isValid;
    }
    
    // Validar sequência de datas
    function validateDates() {
        const dataProducao = document.getElementById('dataProducao');
        const dataVencimento = document.getElementById('dataVencimento');
        const dataDisponibilidade = document.getElementById('dataDisponibilidade');
        
        const producao = new Date(dataProducao.value);
        const vencimento = new Date(dataVencimento.value);
        const disponibilidade = new Date(dataDisponibilidade.value);
        
        let isValid = true;
        
        // Validar se produção é anterior ao vencimento
        if (dataProducao.value && dataVencimento.value && producao >= vencimento) {
            dataVencimento.classList.add('is-invalid');
            showAlert('Data de vencimento deve ser posterior à data de produção.', 'warning');
            isValid = false;
        }
        
        // Validar se disponibilidade não é muito posterior ao vencimento
        if (dataVencimento.value && dataDisponibilidade.value) {
            const diffDays = (disponibilidade - vencimento) / (1000 * 60 * 60 * 24);
            if (diffDays > 7) {
                showAlert('Alimento não deve ficar disponível muito tempo após o vencimento.', 'warning');
            }
        }
        
        return isValid;
    }
    
    // Calcular prioridade automaticamente
    function calculatePriority() {
        const dataVencimento = document.getElementById('dataVencimento');
        const dataDisponibilidade = document.getElementById('dataDisponibilidade');
        const prioridade = document.getElementById('prioridade');
        
        if (!dataVencimento.value && !dataDisponibilidade.value) return;
        
        const hoje = new Date();
        let dataReferencia = new Date();
        
        if (dataVencimento.value) {
            dataReferencia = new Date(dataVencimento.value);
        } else if (dataDisponibilidade.value) {
            dataReferencia = new Date(dataDisponibilidade.value);
        }
        
        const diffDays = Math.ceil((dataReferencia - hoje) / (1000 * 60 * 60 * 24));
        
        let prioridadeSugerida = '';
        if (diffDays <= 1) {
            prioridadeSugerida = 'urgente';
        } else if (diffDays <= 3) {
            prioridadeSugerida = 'alta';
        } else if (diffDays <= 7) {
            prioridadeSugerida = 'media';
        } else {
            prioridadeSugerida = 'baixa';
        }
        
        if (prioridade.value === '') {
            prioridade.value = prioridadeSugerida;
            prioridade.classList.add('is-valid');
        }
    }
    
    // Submit do formulário
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validar todos os campos
        const inputs = form.querySelectorAll('input, select, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });
        
        // Validar uso recomendado
        if (!validateUsoRecomendado()) {
            isFormValid = false;
        }
        
        if (!isFormValid) {
            showAlert('Por favor, corrija os erros no formulário.', 'danger');
            return;
        }
        
        // Simular envio
        await simulateFormSubmission();
    }
    
    // Simular envio do formulário
    async function simulateFormSubmission() {
        try {
            showLoading('Cadastrando alimento...');
            btnCadastrar.disabled = true;
            
            // Coletar dados do formulário
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Coletar usos recomendados selecionados
            const usoRecomendado = Array.from(form.querySelectorAll('input[name="usoRecomendado"]:checked'))
                .map(cb => cb.value);
            data.usoRecomendado = usoRecomendado;
            
            // Buscar dados da empresa
            const empresas = JSON.parse(localStorage.getItem('feedhope_empresas') || '[]');
            const empresa = empresas.find(e => e.id === data.empresaOrigem);
            if (empresa) {
                data.empresaNome = empresa.nomeEmpresa;
                data.empresaEndereco = `${empresa.endereco}, ${empresa.numero} - ${empresa.bairro}, ${empresa.cidade}/${empresa.estado}`;
            }
            
            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Salvar no localStorage
            saveToLocalStorage(data);
            
            // Mostrar modal de sucesso
            const modal = new bootstrap.Modal(document.getElementById('modalSucesso'));
            modal.show();
            
        } catch (error) {
            showAlert('Erro ao cadastrar alimento. Tente novamente.', 'danger');
        } finally {
            hideLoading();
            btnCadastrar.disabled = false;
        }
    }
    
    // Salvar no localStorage
    function saveToLocalStorage(data) {
        const alimentos = JSON.parse(localStorage.getItem('feedhope_alimentos') || '[]');
        
        // Adicionar ID único e timestamp
        data.id = Date.now().toString();
        data.dataCadastro = new Date().toISOString();
        data.status = 'disponivel';
        
        alimentos.push(data);
        localStorage.setItem('feedhope_alimentos', JSON.stringify(alimentos));
        
        console.log('Alimento cadastrado:', data);
    }
    
    // Mostrar alerta
    function showAlert(message, type = 'info') {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${getAlertIcon(type)} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alertContainer.innerHTML = alertHtml;
        alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Ícone do alerta
    function getAlertIcon(type) {
        const icons = {
            success: 'check-circle',
            danger: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    // Mostrar loading
    function showLoading(message = 'Carregando...') {
        btnCadastrar.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            ${message}
        `;
    }
    
    // Esconder loading
    function hideLoading() {
        btnCadastrar.innerHTML = `
            <i class="fas fa-save me-2"></i>
            Cadastrar Alimento
        `;
    }
});

// Função para limpar formulário
function clearForm() {
    const form = document.getElementById('cadastroAlimentoForm');
    form.reset();
    
    // Remover classes de validação
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
    });
    
    // Limpar alertas
    document.getElementById('alert-container').innerHTML = '';
    
    // Recarregar empresas
    loadEmpresas();
}

// Função para pré-preencher formulário (para testes)
function preencherFormularioTeste() {
    document.getElementById('nomeAlimento').value = 'Maçãs Gala';
    document.getElementById('categoria').value = 'frutas';
    document.getElementById('quantidade').value = '50';
    document.getElementById('unidade').value = 'kg';
    document.getElementById('estadoAlimento').value = 'bom';
    
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    const vencimento = new Date(hoje);
    vencimento.setDate(hoje.getDate() + 5);
    
    document.getElementById('dataDisponibilidade').value = amanha.toISOString().split('T')[0];
    document.getElementById('dataVencimento').value = vencimento.toISOString().split('T')[0];
    
    document.getElementById('temperatura').value = 'refrigerado';
    document.getElementById('embalagem').value = 'caixa';
    document.getElementById('prioridade').value = 'media';
    
    document.getElementById('consumo_humano').checked = true;
    document.getElementById('alimentacao_animal').checked = true;
}

