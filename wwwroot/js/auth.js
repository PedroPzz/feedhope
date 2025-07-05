// Sistema de Autenticação - FeedHope
class Auth {
    
    static STORAGE_KEY = 'feedhope_auth';
    static SESSION_KEY = 'feedhope_session';
    
    // Verificar se usuário está logado
    static isLoggedIn() {
        const session = this.getSession();
        if (!session) return false;
        
        // Verificar se a sessão não expirou
        const now = new Date().getTime();
        if (now > session.expiresAt) {
            this.logout();
            return false;
        }
        
        return true;
    }
    
    // Obter sessão atual
    static getSession() {
        try {
            const session = localStorage.getItem(this.SESSION_KEY);
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('Erro ao obter sessão:', error);
            return null;
        }
    }
    
    // Obter usuário atual
    static getCurrentUser() {
        const session = this.getSession();
        return session ? session.user : null;
    }
    
    // Fazer login
    static async login(email, senha, lembrarMe = false) {
        try {
            // Simular validação de credenciais
            const user = await this.validateCredentials(email, senha);
            
            if (!user) {
                throw new Error('E-mail ou senha incorretos');
            }
            
            // Criar sessão
            const sessionDuration = lembrarMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 dias ou 1 dia
            const session = {
                user: user,
                loginTime: new Date().getTime(),
                expiresAt: new Date().getTime() + sessionDuration,
                rememberMe: lembrarMe
            };
            
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            
            // Registrar login
            this.logActivity('login', { userId: user.id, email: user.email });
            
            return { success: true, user: user };
            
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Validar credenciais (simulação)
    static async validateCredentials(email, senha) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Buscar usuários cadastrados
        const users = JSON.parse(localStorage.getItem('feedhope_users') || '[]');
        
        // Procurar usuário por email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            return null;
        }
        
        // Verificar senha (em produção seria hash)
        if (user.senha !== senha) {
            return null;
        }
        
        // Remover senha do objeto retornado
        const { senha: _, ...userWithoutPassword } = user;
        
        return userWithoutPassword;
    }
    
    // Registrar usuário
    static async register(userData) {
        try {
            // Validar dados
            const validation = this.validateUserData(userData);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            // Verificar se email já existe
            const users = JSON.parse(localStorage.getItem('feedhope_users') || '[]');
            const emailExists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
            
            if (emailExists) {
                throw new Error('Este e-mail já está cadastrado');
            }
            
            // Criar novo usuário
            const newUser = {
                id: Date.now().toString(),
                ...userData,
                dataCadastro: new Date().toISOString(),
                status: 'ativo',
                emailVerificado: false,
                ultimoLogin: null
            };
            
            // Salvar usuário
            users.push(newUser);
            localStorage.setItem('feedhope_users', JSON.stringify(users));
            
            // Registrar atividade
            this.logActivity('register', { userId: newUser.id, email: newUser.email });
            
            return { success: true, user: newUser };
            
        } catch (error) {
            console.error('Erro no registro:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Validar dados do usuário
    static validateUserData(userData) {
        if (!userData.nome || userData.nome.trim().length < 2) {
            return { valid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
        }
        
        if (!userData.email || !this.isValidEmail(userData.email)) {
            return { valid: false, error: 'E-mail inválido' };
        }
        
        if (!userData.senha || userData.senha.length < 8) {
            return { valid: false, error: 'Senha deve ter pelo menos 8 caracteres' };
        }
        
        if (!userData.cpf || !this.isValidCPF(userData.cpf)) {
            return { valid: false, error: 'CPF inválido' };
        }
        
        if (!userData.tipoUsuario) {
            return { valid: false, error: 'Tipo de usuário é obrigatório' };
        }
        
        return { valid: true };
    }
    
    // Validar email
    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // Validar CPF
    static isValidCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
            return false;
        }
        
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        
        let resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;
        
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        
        resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        
        return resto === parseInt(cpf.charAt(10));
    }
    
    // Fazer logout
    static logout() {
        const session = this.getSession();
        
        if (session) {
            this.logActivity('logout', { userId: session.user.id });
        }
        
        localStorage.removeItem(this.SESSION_KEY);
        
        // Redirecionar para página de login
        if (typeof window !== 'undefined') {
            window.location.href = '/Home/Login';
        }
    }
    
    // Recuperar senha
    static async recoverPassword(email) {
        try {
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const users = JSON.parse(localStorage.getItem('feedhope_users') || '[]');
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (!user) {
                throw new Error('E-mail não encontrado');
            }
            
            // Simular envio de email
            console.log(`Email de recuperação enviado para: ${email}`);
            
            this.logActivity('password_recovery', { email: email });
            
            return { success: true, message: 'Instruções enviadas para seu e-mail' };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Atualizar último login
    static updateLastLogin() {
        const session = this.getSession();
        if (!session) return;
        
        const users = JSON.parse(localStorage.getItem('feedhope_users') || '[]');
        const userIndex = users.findIndex(u => u.id === session.user.id);
        
        if (userIndex !== -1) {
            users[userIndex].ultimoLogin = new Date().toISOString();
            localStorage.setItem('feedhope_users', JSON.stringify(users));
        }
    }
    
    // Registrar atividade
    static logActivity(action, data = {}) {
        const activities = JSON.parse(localStorage.getItem('feedhope_activities') || '[]');
        
        const activity = {
            id: Date.now().toString(),
            action: action,
            timestamp: new Date().toISOString(),
            data: data,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
        };
        
        activities.push(activity);
        
        // Manter apenas os últimos 1000 registros
        if (activities.length > 1000) {
            activities.splice(0, activities.length - 1000);
        }
        
        localStorage.setItem('feedhope_activities', JSON.stringify(activities));
    }
    
    // Verificar permissões
    static hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        const permissions = {
            'empresa': ['cadastrar_alimento', 'ver_coletas', 'dashboard_empresa'],
            'ufra': ['ver_todos_alimentos', 'gerenciar_coletas', 'dashboard_admin', 'relatorios'],
            'voluntario': ['ver_alimentos', 'dashboard_basico'],
            'parceiro': ['ver_alimentos', 'dashboard_basico']
        };
        
        const userPermissions = permissions[user.tipoUsuario] || [];
        return userPermissions.includes(permission);
    }
    
    // Obter estatísticas do usuário
    static getUserStats() {
        const user = this.getCurrentUser();
        if (!user) return null;
        
        const activities = JSON.parse(localStorage.getItem('feedhope_activities') || '[]');
        const userActivities = activities.filter(a => a.data.userId === user.id);
        
        const alimentos = JSON.parse(localStorage.getItem('feedhope_alimentos') || '[]');
        const userAlimentos = alimentos.filter(a => a.empresaOrigem === user.id);
        
        return {
            totalLogins: userActivities.filter(a => a.action === 'login').length,
            alimentosCadastrados: userAlimentos.length,
            ultimoLogin: user.ultimoLogin,
            dataCadastro: user.dataCadastro
        };
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    
    // Verificar se está na página de login
    if (document.getElementById('loginForm')) {
        initLoginForm();
    }
    
    // Atualizar último login se estiver logado
    if (Auth.isLoggedIn()) {
        Auth.updateLastLogin();
    }
    
    // Adicionar listener para logout em todos os botões de logout
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            Auth.logout();
        });
    });
});

// Inicializar formulário de login
function initLoginForm() {
    const form = document.getElementById('loginForm');
    const btnLogin = document.getElementById('btnLogin');
    const toggleSenha = document.getElementById('toggleSenha');
    const linkEsqueceuSenha = document.getElementById('linkEsqueceuSenha');
    
    // Toggle senha
    if (toggleSenha) {
        toggleSenha.addEventListener('click', function() {
            const senhaInput = document.getElementById('senha');
            const icon = this.querySelector('i');
            
            if (senhaInput.type === 'password') {
                senhaInput.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                senhaInput.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    }
    
    // Link esqueceu senha
    if (linkEsqueceuSenha) {
        linkEsqueceuSenha.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = new bootstrap.Modal(document.getElementById('modalRecuperarSenha'));
            modal.show();
        });
    }
    
    // Submit do formulário
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const email = formData.get('email');
            const senha = formData.get('senha');
            const lembrarMe = formData.get('lembrarMe') === 'on';
            
            // Validação básica
            if (!email || !senha) {
                showAlert('Por favor, preencha todos os campos.', 'danger');
                return;
            }
            
            // Mostrar loading
            showLoading(btnLogin, 'Entrando...');
            
            try {
                const result = await Auth.login(email, senha, lembrarMe);
                
                if (result.success) {
                    showAlert('Login realizado com sucesso!', 'success');
                    
                    // Redirecionar após 1 segundo
                    setTimeout(() => {
                        window.location.href = '/Home/Dashboard';
                    }, 1000);
                } else {
                    showAlert(result.error, 'danger');
                }
                
            } catch (error) {
                showAlert('Erro ao fazer login. Tente novamente.', 'danger');
            } finally {
                hideLoading(btnLogin, '<i class="fas fa-sign-in-alt me-2"></i>Entrar');
            }
        });
    }
    
    // Recuperação de senha
    const btnEnviarRecuperacao = document.getElementById('btnEnviarRecuperacao');
    if (btnEnviarRecuperacao) {
        btnEnviarRecuperacao.addEventListener('click', async function() {
            const email = document.getElementById('emailRecuperacao').value;
            
            if (!email) {
                alert('Por favor, informe seu e-mail.');
                return;
            }
            
            showLoading(this, 'Enviando...');
            
            try {
                const result = await Auth.recoverPassword(email);
                
                if (result.success) {
                    alert(result.message);
                    bootstrap.Modal.getInstance(document.getElementById('modalRecuperarSenha')).hide();
                } else {
                    alert(result.error);
                }
                
            } catch (error) {
                alert('Erro ao enviar e-mail. Tente novamente.');
            } finally {
                hideLoading(this, '<i class="fas fa-paper-plane me-2"></i>Enviar');
            }
        });
    }
}

// Funções utilitárias
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

function showLoading(button, text) {
    button.disabled = true;
    button.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        ${text}
    `;
}

function hideLoading(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
}

// Exportar para uso global
window.Auth = Auth;

