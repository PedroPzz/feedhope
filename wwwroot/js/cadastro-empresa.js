// Cadastro de Empresa - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos do formulário
    const form = document.getElementById('cadastroEmpresaForm');
    const btnCadastrar = document.getElementById('btnCadastrar');
    const alertContainer = document.getElementById('alert-container');
    
    // Máscaras para campos
    initMasks();
    
    // Validação em tempo real
    initRealTimeValidation();
    
    // Busca CEP
    initCepSearch();
    
    // Submit do formulário
    form.addEventListener('submit', handleFormSubmit);
    
    // Inicializar máscaras
    function initMasks() {
        // Máscara CNPJ
        const cnpjInput = document.getElementById('cnpj');
        cnpjInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
            e.target.value = value;
        });
        
        // Máscara CEP
        const cepInput = document.getElementById('cep');
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
        
        // Máscara Telefone
        const telefoneInput = document.getElementById('telefone');
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
            e.target.value = value;
        });
        
        // Máscara Celular
        const celularInput = document.getElementById('celular');
        celularInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
    }
    
    // Validação em tempo real
    function initRealTimeValidation() {
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
        
        // Validação especial para checkboxes de tipos de alimentos
        const tiposAlimentos = form.querySelectorAll('input[name="tiposAlimentos"]');
        tiposAlimentos.forEach(checkbox => {
            checkbox.addEventListener('change', validateTiposAlimentos);
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
            case 'cnpj':
                isValid = validateCNPJ(value);
                break;
            case 'cep':
                isValid = validateCEP(value);
                break;
            case 'email':
                isValid = validateEmail(value);
                break;
            case 'telefone':
                isValid = validatePhone(value);
                break;
            case 'aceitaTermos':
                isValid = field.checked;
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
    
    // Validar tipos de alimentos (pelo menos um deve ser selecionado)
    function validateTiposAlimentos() {
        const checkboxes = form.querySelectorAll('input[name="tiposAlimentos"]');
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
    
    // Validação CNPJ
    function validateCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]+/g, '');
        
        if (cnpj.length !== 14) return false;
        
        // Elimina CNPJs inválidos conhecidos
        if (/^(\d)\1+$/.test(cnpj)) return false;
        
        // Valida DVs
        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0)) return false;
        
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        return resultado == digitos.charAt(1);
    }
    
    // Validação CEP
    function validateCEP(cep) {
        return /^[0-9]{5}-?[0-9]{3}$/.test(cep);
    }
    
    // Validação Email
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // Validação Telefone
    function validatePhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10;
    }
    
    // Busca CEP
    function initCepSearch() {
        const cepInput = document.getElementById('cep');
        
        cepInput.addEventListener('blur', function() {
            const cep = this.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                searchCEP(cep);
            }
        });
    }
    
    // Buscar CEP na API
    async function searchCEP(cep) {
        try {
            showLoading('Buscando CEP...');
            
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('endereco').value = data.logradouro || '';
                document.getElementById('bairro').value = data.bairro || '';
                document.getElementById('cidade').value = data.localidade || '';
                document.getElementById('estado').value = data.uf || '';
                
                // Focar no campo número
                document.getElementById('numero').focus();
                
                showAlert('CEP encontrado com sucesso!', 'success');
            } else {
                showAlert('CEP não encontrado.', 'warning');
            }
        } catch (error) {
            showAlert('Erro ao buscar CEP. Verifique sua conexão.', 'danger');
        } finally {
            hideLoading();
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
        
        // Validar tipos de alimentos
        if (!validateTiposAlimentos()) {
            isFormValid = false;
        }
        
        if (!isFormValid) {
            showAlert('Por favor, corrija os erros no formulário.', 'danger');
            return;
        }
        
        // Simular envio (aqui seria a integração com backend)
        await simulateFormSubmission();
    }
    
    // Simular envio do formulário
    async function simulateFormSubmission() {
        try {
            showLoading('Cadastrando empresa...');
            btnCadastrar.disabled = true;
            
            // Coletar dados do formulário
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Coletar tipos de alimentos selecionados
            const tiposAlimentos = Array.from(form.querySelectorAll('input[name="tiposAlimentos"]:checked'))
                .map(cb => cb.value);
            data.tiposAlimentos = tiposAlimentos;
            
            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Salvar no localStorage (simulando persistência)
            saveToLocalStorage(data);
            
            // Mostrar modal de sucesso
            const modal = new bootstrap.Modal(document.getElementById('modalSucesso'));
            modal.show();
            
        } catch (error) {
            showAlert('Erro ao cadastrar empresa. Tente novamente.', 'danger');
        } finally {
            hideLoading();
            btnCadastrar.disabled = false;
        }
    }
    
    // Salvar no localStorage
    function saveToLocalStorage(data) {
        const empresas = JSON.parse(localStorage.getItem('feedhope_empresas') || '[]');
        
        // Adicionar ID único e timestamp
        data.id = Date.now().toString();
        data.dataCadastro = new Date().toISOString();
        data.status = 'pendente';
        
        empresas.push(data);
        localStorage.setItem('feedhope_empresas', JSON.stringify(empresas));
        
        console.log('Empresa cadastrada:', data);
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
            Cadastrar Empresa
        `;
    }
});

// Função para limpar formulário
function clearForm() {
    const form = document.getElementById('cadastroEmpresaForm');
    form.reset();
    
    // Remover classes de validação
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
    });
    
    // Limpar alertas
    document.getElementById('alert-container').innerHTML = '';
}

// Função para pré-preencher formulário (para testes)
function preencherFormularioTeste() {
    document.getElementById('nomeEmpresa').value = 'Supermercado Verde Ltda';
    document.getElementById('cnpj').value = '12.345.678/0001-90';
    document.getElementById('tipoEmpresa').value = 'supermercado';
    document.getElementById('porte').value = 'media';
    document.getElementById('cep').value = '66000-000';
    document.getElementById('endereco').value = 'Rua das Flores';
    document.getElementById('numero').value = '123';
    document.getElementById('bairro').value = 'Centro';
    document.getElementById('cidade').value = 'Belém';
    document.getElementById('estado').value = 'PA';
    document.getElementById('nomeResponsavel').value = 'João Silva';
    document.getElementById('cargoResponsavel').value = 'Gerente';
    document.getElementById('telefone').value = '(91) 3333-4444';
    document.getElementById('email').value = 'joao@supermercadoverde.com';
    document.getElementById('volumeMedio').value = '101-500';
    document.getElementById('frutas').checked = true;
    document.getElementById('verduras').checked = true;
    document.getElementById('aceitaTermos').checked = true;
}

