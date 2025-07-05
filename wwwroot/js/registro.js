// Registro de Usuário - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    const form = document.getElementById('registroForm');
    const btnRegistrar = document.getElementById('btnRegistrar');
    
    // Inicializar funcionalidades
    initMasks();
    initPasswordValidation();
    initConditionalFields();
    initFormValidation();
    
    // Submit do formulário
    form.addEventListener('submit', handleFormSubmit);
    
    // Máscaras para campos
    function initMasks() {
        // Máscara CPF
        const cpfInput = document.getElementById('cpf');
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
        
        // Máscara Telefone
        const telefoneInput = document.getElementById('telefone');
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
    }
    
    // Validação de senha
    function initPasswordValidation() {
        const senhaInput = document.getElementById('senha');
        const confirmarSenhaInput = document.getElementById('confirmarSenha');
        const strengthBar = document.getElementById('passwordStrengthBar');
        const strengthText = document.getElementById('passwordStrengthText');
        const toggleSenha = document.getElementById('toggleSenha');
        const toggleConfirmarSenha = document.getElementById('toggleConfirmarSenha');
        
        // Toggle visibilidade da senha
        toggleSenha.addEventListener('click', function() {
            togglePasswordVisibility(senhaInput, this);
        });
        
        toggleConfirmarSenha.addEventListener('click', function() {
            togglePasswordVisibility(confirmarSenhaInput, this);
        });
        
        // Validação de força da senha
        senhaInput.addEventListener('input', function() {
            const strength = calculatePasswordStrength(this.value);
            updatePasswordStrengthIndicator(strength, strengthBar, strengthText);
            validatePasswordMatch();
        });
        
        // Validação de confirmação de senha
        confirmarSenhaInput.addEventListener('input', validatePasswordMatch);
        
        function validatePasswordMatch() {
            const senha = senhaInput.value;
            const confirmarSenha = confirmarSenhaInput.value;
            
            if (confirmarSenha && senha !== confirmarSenha) {
                confirmarSenhaInput.classList.add('is-invalid');
                confirmarSenhaInput.classList.remove('is-valid');
            } else if (confirmarSenha) {
                confirmarSenhaInput.classList.remove('is-invalid');
                confirmarSenhaInput.classList.add('is-valid');
            }
        }
    }
    
    // Campos condicionais baseados no tipo de usuário
    function initConditionalFields() {
        const tipoUsuarioSelect = document.getElementById('tipoUsuario');
        const camposEmpresa = document.getElementById('camposEmpresa');
        const camposUfra = document.getElementById('camposUfra');
        
        tipoUsuarioSelect.addEventListener('change', function() {
            const tipo = this.value;
            
            // Esconder todos os campos condicionais
            camposEmpresa.classList.add('d-none');
            camposUfra.classList.add('d-none');
            
            // Mostrar campos específicos
            if (tipo === 'empresa') {
                camposEmpresa.classList.remove('d-none');
                document.getElementById('nomeEmpresa').required = true;
                document.getElementById('cargo').required = true;
            } else if (tipo === 'ufra') {
                camposUfra.classList.remove('d-none');
                document.getElementById('vinculo').required = true;
            } else {
                // Remover required dos campos condicionais
                document.getElementById('nomeEmpresa').required = false;
                document.getElementById('cargo').required = false;
                document.getElementById('vinculo').required = false;
            }
        });
    }
    
    // Validação do formulário
    function initFormValidation() {
        const inputs = form.querySelectorAll('input, select');
        
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
            case 'nome':
                isValid = value.length >= 2;
                break;
            case 'cpf':
                isValid = Auth.isValidCPF(value);
                break;
            case 'email':
                isValid = Auth.isValidEmail(value);
                break;
            case 'telefone':
                const cleaned = value.replace(/\D/g, '');
                isValid = cleaned.length >= 10;
                break;
            case 'senha':
                isValid = value.length >= 8;
                break;
            case 'confirmarSenha':
                const senha = document.getElementById('senha').value;
                isValid = value === senha && value.length >= 8;
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
    
    // Submit do formulário
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validar todos os campos
        const inputs = form.querySelectorAll('input, select');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            showAlert('Por favor, corrija os erros no formulário.', 'danger');
            return;
        }
        
        // Coletar dados do formulário
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());
        
        // Ajustar campos booleanos
        userData.receberNotificacoes = formData.get('receberNotificacoes') === 'on';
        userData.aceitaTermos = formData.get('aceitaTermos') === 'on';
        
        // Remover confirmação de senha
        delete userData.confirmarSenha;
        
        // Simular registro
        await simulateRegistration(userData);
    }
    
    // Simular registro
    async function simulateRegistration(userData) {
        try {
            showLoading('Criando conta...');
            btnRegistrar.disabled = true;
            
            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Registrar usuário
            const result = await Auth.register(userData);
            
            if (result.success) {
                // Mostrar modal de sucesso
                const modal = new bootstrap.Modal(document.getElementById('modalSucesso'));
                modal.show();
            } else {
                showAlert(result.error, 'danger');
            }
            
        } catch (error) {
            showAlert('Erro ao criar conta. Tente novamente.', 'danger');
        } finally {
            hideLoading();
            btnRegistrar.disabled = false;
        }
    }
    
    // Funções utilitárias
    function togglePasswordVisibility(input, button) {
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
    
    function calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score += 20;
        if (password.length >= 12) score += 10;
        if (/[a-z]/.test(password)) score += 20;
        if (/[A-Z]/.test(password)) score += 20;
        if (/[0-9]/.test(password)) score += 20;
        if (/[^A-Za-z0-9]/.test(password)) score += 10;
        
        return Math.min(score, 100);
    }
    
    function updatePasswordStrengthIndicator(strength, bar, text) {
        bar.style.width = strength + '%';
        
        if (strength < 30) {
            bar.className = 'progress-bar bg-danger';
            text.textContent = 'Senha fraca';
            text.className = 'form-text text-danger';
        } else if (strength < 60) {
            bar.className = 'progress-bar bg-warning';
            text.textContent = 'Senha média';
            text.className = 'form-text text-warning';
        } else if (strength < 80) {
            bar.className = 'progress-bar bg-info';
            text.textContent = 'Senha boa';
            text.className = 'form-text text-info';
        } else {
            bar.className = 'progress-bar bg-success';
            text.textContent = 'Senha forte';
            text.className = 'form-text text-success';
        }
    }
    
    function showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alert-container');
        if (!alertContainer) return;
        
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
    
    function getAlertIcon(type) {
        const icons = {
            success: 'check-circle',
            danger: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    function showLoading(message = 'Carregando...') {
        btnRegistrar.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            ${message}
        `;
    }
    
    function hideLoading() {
        btnRegistrar.innerHTML = `
            <i class="fas fa-user-plus me-2"></i>
            Criar Conta
        `;
    }
});

// Função para pré-preencher formulário (para testes)
function preencherFormularioTeste() {
    document.getElementById('nome').value = 'João Silva Santos';
    document.getElementById('cpf').value = '123.456.789-00';
    document.getElementById('email').value = 'joao@exemplo.com';
    document.getElementById('telefone').value = '(91) 99999-8888';
    document.getElementById('tipoUsuario').value = 'empresa';
    
    // Disparar evento change para mostrar campos condicionais
    document.getElementById('tipoUsuario').dispatchEvent(new Event('change'));
    
    setTimeout(() => {
        document.getElementById('nomeEmpresa').value = 'Empresa Teste Ltda';
        document.getElementById('cargo').value = 'Gerente';
    }, 100);
    
    document.getElementById('senha').value = 'MinhaSenh@123';
    document.getElementById('confirmarSenha').value = 'MinhaSenh@123';
    document.getElementById('aceitaTermos').checked = true;
    document.getElementById('receberNotificacoes').checked = true;
}

