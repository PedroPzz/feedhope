// Central de Notificações - JavaScript
class NotificationCenter {
    
    static notifications = [];
    static settings = {};
    static currentUser = null;
    static filters = {
        tipo: '',
        status: '',
        periodo: ''
    };
    
    static init() {
        this.currentUser = Auth.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = '/Home/Login';
            return;
        }
        
        this.loadSettings();
        this.loadNotifications();
        this.initFilters();
        this.updateStatistics();
        this.renderNotifications();
        
        // Verificar novas notificações a cada 30 segundos
        setInterval(() => {
            this.checkForNewNotifications();
        }, 30000);
        
        // Solicitar permissão para notificações push
        this.requestNotificationPermission();
    }
    
    static loadSettings() {
        const defaultSettings = {
            email: {
                alimentos: true,
                vencimento: true,
                coletas: true,
                relatorios: false,
                frequencia: 'diario',
                horario: '09:00'
            },
            push: {
                urgentes: true,
                coletas: true,
                lembretes: false
            },
            filtros: {
                distancia: false,
                raioKm: 10,
                categorias: false,
                categoriasEscolhidas: []
            }
        };
        
        this.settings = JSON.parse(localStorage.getItem('feedhope_notification_settings') || JSON.stringify(defaultSettings));
    }
    
    static loadNotifications() {
        // Carregar notificações do localStorage
        const stored = JSON.parse(localStorage.getItem('feedhope_notifications') || '[]');
        
        // Gerar notificações baseadas nos dados atuais
        const generated = this.generateNotifications();
        
        // Combinar e remover duplicatas
        const combined = [...stored, ...generated];
        this.notifications = this.removeDuplicates(combined);
        
        // Ordenar por timestamp (mais recentes primeiro)
        this.notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Salvar de volta
        this.saveNotifications();
    }
    
    static generateNotifications() {
        const notifications = [];
        const alimentos = JSON.parse(localStorage.getItem('feedhope_alimentos') || '[]');
        const hoje = new Date();
        
        // Filtrar alimentos do usuário se for empresa
        let userAlimentos = alimentos;
        if (this.currentUser.tipoUsuario === 'empresa') {
            userAlimentos = alimentos.filter(a => a.empresaOrigem === this.currentUser.id);
        }
        
        userAlimentos.forEach(alimento => {
            const dataDisp = new Date(alimento.dataDisponibilidade);
            const diffDays = Math.ceil((dataDisp - hoje) / (1000 * 60 * 60 * 24));
            
            // Notificação de vencimento próximo
            if (diffDays <= 1 && alimento.status === 'disponivel') {
                notifications.push({
                    id: `vencimento_${alimento.id}_${hoje.toDateString()}`,
                    type: diffDays <= 0 ? 'danger' : 'warning',
                    category: 'vencimento',
                    title: diffDays <= 0 ? 'Alimento vencido!' : 'Alimento próximo ao vencimento',
                    message: `${alimento.nomeAlimento} ${diffDays <= 0 ? 'venceu hoje' : 'vence em ' + diffDays + ' dia(s)'}`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    priority: diffDays <= 0 ? 'high' : 'medium',
                    data: {
                        alimentoId: alimento.id,
                        tipo: 'vencimento'
                    },
                    actions: [
                        {
                            text: 'Ver Alimento',
                            action: 'viewAlimento',
                            params: { id: alimento.id }
                        }
                    ]
                });
            }
            
            // Notificação de novo cadastro (últimas 24h)
            const cadastroDate = new Date(alimento.dataCadastro);
            const diffHours = (hoje - cadastroDate) / (1000 * 60 * 60);
            
            if (diffHours <= 24 && this.currentUser.tipoUsuario !== 'empresa') {
                notifications.push({
                    id: `novo_alimento_${alimento.id}`,
                    type: 'info',
                    category: 'novo_alimento',
                    title: 'Novo alimento disponível',
                    message: `${alimento.nomeAlimento} foi cadastrado e está disponível para coleta`,
                    timestamp: alimento.dataCadastro,
                    read: false,
                    priority: 'low',
                    data: {
                        alimentoId: alimento.id,
                        tipo: 'novo_alimento'
                    },
                    actions: [
                        {
                            text: 'Ver Detalhes',
                            action: 'viewAlimento',
                            params: { id: alimento.id }
                        }
                    ]
                });
            }
        });
        
        // Notificações de sistema
        if (this.notifications.length === 0) {
            notifications.push({
                id: 'welcome_' + this.currentUser.id,
                type: 'success',
                category: 'sistema',
                title: 'Bem-vindo ao FeedHope!',
                message: 'Sua conta foi configurada com sucesso. Explore as funcionalidades da plataforma.',
                timestamp: new Date().toISOString(),
                read: false,
                priority: 'low',
                data: {
                    tipo: 'welcome'
                }
            });
        }
        
        return notifications;
    }
    
    static removeDuplicates(notifications) {
        const seen = new Set();
        return notifications.filter(notification => {
            if (seen.has(notification.id)) {
                return false;
            }
            seen.add(notification.id);
            return true;
        });
    }
    
    static saveNotifications() {
        localStorage.setItem('feedhope_notifications', JSON.stringify(this.notifications));
    }
    
    static initFilters() {
        const filterTipo = document.getElementById('filterTipo');
        const filterStatus = document.getElementById('filterStatus');
        const filterPeriodo = document.getElementById('filterPeriodo');
        
        [filterTipo, filterStatus, filterPeriodo].forEach(filter => {
            filter.addEventListener('change', () => {
                this.applyFilters();
            });
        });
    }
    
    static applyFilters() {
        this.filters.tipo = document.getElementById('filterTipo').value;
        this.filters.status = document.getElementById('filterStatus').value;
        this.filters.periodo = document.getElementById('filterPeriodo').value;
        
        this.renderNotifications();
    }
    
    static resetFilters() {
        document.getElementById('filterTipo').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterPeriodo').value = '';
        
        this.filters = { tipo: '', status: '', periodo: '' };
        this.renderNotifications();
    }
    
    static getFilteredNotifications() {
        let filtered = [...this.notifications];
        
        // Filtro por tipo
        if (this.filters.tipo) {
            filtered = filtered.filter(n => n.type === this.filters.tipo);
        }
        
        // Filtro por status
        if (this.filters.status) {
            if (this.filters.status === 'read') {
                filtered = filtered.filter(n => n.read);
            } else if (this.filters.status === 'unread') {
                filtered = filtered.filter(n => !n.read);
            }
        }
        
        // Filtro por período
        if (this.filters.periodo) {
            const now = new Date();
            filtered = filtered.filter(n => {
                const notificationDate = new Date(n.timestamp);
                
                switch (this.filters.periodo) {
                    case 'today':
                        return notificationDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return notificationDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return notificationDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        
        return filtered;
    }
    
    static updateStatistics() {
        const total = this.notifications.length;
        const naoLidas = this.notifications.filter(n => !n.read).length;
        const urgentes = this.notifications.filter(n => n.priority === 'high').length;
        
        const hoje = new Date();
        const hojeCount = this.notifications.filter(n => {
            const notificationDate = new Date(n.timestamp);
            return notificationDate.toDateString() === hoje.toDateString();
        }).length;
        
        document.getElementById('totalNotificacoes').textContent = total;
        document.getElementById('naoLidas').textContent = naoLidas;
        document.getElementById('urgentes').textContent = urgentes;
        document.getElementById('hoje').textContent = hojeCount;
    }
    
    static renderNotifications() {
        const container = document.getElementById('notificationsList');
        const filtered = this.getFilteredNotifications();
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-bell-slash fa-3x mb-3"></i>
                    <h5>Nenhuma notificação encontrada</h5>
                    <p>Não há notificações que correspondam aos filtros selecionados.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        filtered.forEach(notification => {
            const element = this.createNotificationElement(notification);
            container.appendChild(element);
        });
    }
    
    static createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = `notification-item border-bottom p-3 ${notification.read ? 'read' : 'unread'}`;
        div.style.cursor = 'pointer';
        
        const typeIcon = this.getTypeIcon(notification.type);
        const priorityBadge = this.getPriorityBadge(notification.priority);
        const timeAgo = this.getTimeAgo(notification.timestamp);
        
        div.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="flex-shrink-0 me-3">
                    <div class="notification-icon bg-${notification.type} text-white rounded-circle d-flex align-items-center justify-content-center" 
                         style="width: 40px; height: 40px;">
                        ${typeIcon}
                    </div>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <h6 class="mb-0 ${notification.read ? 'text-muted' : 'text-dark'}">${notification.title}</h6>
                        <div class="d-flex align-items-center gap-2">
                            ${priorityBadge}
                            <small class="text-muted">${timeAgo}</small>
                        </div>
                    </div>
                    <p class="mb-2 ${notification.read ? 'text-muted' : 'text-secondary'}">${notification.message}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="notification-actions">
                            ${notification.actions ? notification.actions.map(action => 
                                `<button class="btn btn-sm btn-outline-${notification.type} me-2" 
                                         onclick="NotificationCenter.executeAction('${action.action}', ${JSON.stringify(action.params || {})})">
                                    ${action.text}
                                </button>`
                            ).join('') : ''}
                        </div>
                        <div class="notification-controls">
                            ${!notification.read ? 
                                `<button class="btn btn-sm btn-outline-secondary me-1" 
                                         onclick="NotificationCenter.markAsRead('${notification.id}')" title="Marcar como lida">
                                    <i class="fas fa-check"></i>
                                </button>` : ''
                            }
                            <button class="btn btn-sm btn-outline-info me-1" 
                                    onclick="NotificationCenter.viewDetails('${notification.id}')" title="Ver detalhes">
                                <i class="fas fa-info-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" 
                                    onclick="NotificationCenter.deleteNotification('${notification.id}')" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar evento de clique para marcar como lida
        div.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                this.markAsRead(notification.id);
            }
        });
        
        return div;
    }
    
    static getTypeIcon(type) {
        const icons = {
            info: '<i class="fas fa-info-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            success: '<i class="fas fa-check-circle"></i>',
            danger: '<i class="fas fa-exclamation-circle"></i>'
        };
        return icons[type] || icons.info;
    }
    
    static getPriorityBadge(priority) {
        const badges = {
            high: '<span class="badge bg-danger">Alta</span>',
            medium: '<span class="badge bg-warning">Média</span>',
            low: '<span class="badge bg-info">Baixa</span>'
        };
        return badges[priority] || '';
    }
    
    static getTimeAgo(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `${diffMins} min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays} dias atrás`;
        
        return date.toLocaleDateString('pt-BR');
    }
    
    static markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateStatistics();
            this.renderNotifications();
        }
    }
    
    static markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateStatistics();
        this.renderNotifications();
        this.showToast('Todas as notificações foram marcadas como lidas', 'success');
    }
    
    static deleteNotification(notificationId) {
        if (confirm('Tem certeza que deseja excluir esta notificação?')) {
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
            this.saveNotifications();
            this.updateStatistics();
            this.renderNotifications();
            this.showToast('Notificação excluída', 'info');
        }
    }
    
    static clearAll() {
        if (confirm('Tem certeza que deseja excluir todas as notificações?')) {
            this.notifications = [];
            this.saveNotifications();
            this.updateStatistics();
            this.renderNotifications();
            this.showToast('Todas as notificações foram excluídas', 'info');
        }
    }
    
    static viewDetails(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;
        
        const modal = document.getElementById('modalDetalhesNotificacao');
        const content = document.getElementById('modalDetalhesNotificacaoContent');
        const actionBtn = document.getElementById('btnAcaoNotificacao');
        
        content.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="d-flex align-items-center mb-3">
                        <div class="notification-icon bg-${notification.type} text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                             style="width: 50px; height: 50px;">
                            ${this.getTypeIcon(notification.type)}
                        </div>
                        <div>
                            <h5 class="mb-1">${notification.title}</h5>
                            <small class="text-muted">${this.getTimeAgo(notification.timestamp)}</small>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <h6>Mensagem</h6>
                        <p>${notification.message}</p>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Tipo</h6>
                            <span class="badge bg-${notification.type}">${notification.type.toUpperCase()}</span>
                        </div>
                        <div class="col-md-6">
                            <h6>Prioridade</h6>
                            ${this.getPriorityBadge(notification.priority)}
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <h6>Data e Hora</h6>
                        <p>${new Date(notification.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                    
                    ${notification.data ? `
                        <div class="mt-3">
                            <h6>Dados Adicionais</h6>
                            <pre class="bg-light p-2 rounded"><code>${JSON.stringify(notification.data, null, 2)}</code></pre>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Configurar botão de ação se houver
        if (notification.actions && notification.actions.length > 0) {
            actionBtn.style.display = 'block';
            actionBtn.textContent = notification.actions[0].text;
            actionBtn.onclick = () => {
                this.executeAction(notification.actions[0].action, notification.actions[0].params || {});
                bootstrap.Modal.getInstance(modal).hide();
            };
        } else {
            actionBtn.style.display = 'none';
        }
        
        // Marcar como lida ao visualizar
        this.markAsRead(notificationId);
        
        new bootstrap.Modal(modal).show();
    }
    
    static executeAction(action, params) {
        switch (action) {
            case 'viewAlimento':
                if (params.id) {
                    // Redirecionar para detalhes do alimento
                    window.location.href = `/Home/Dashboard#alimento-${params.id}`;
                }
                break;
            case 'viewDashboard':
                window.location.href = '/Home/Dashboard';
                break;
            case 'viewRelatorios':
                window.location.href = '/Home/Relatorios';
                break;
            default:
                console.log('Ação não implementada:', action, params);
        }
    }
    
    static saveSettings() {
        // Coletar configurações do modal
        this.settings.email.alimentos = document.getElementById('emailAlimentos').checked;
        this.settings.email.vencimento = document.getElementById('emailVencimento').checked;
        this.settings.email.coletas = document.getElementById('emailColetas').checked;
        this.settings.email.relatorios = document.getElementById('emailRelatorios').checked;
        this.settings.email.frequencia = document.getElementById('frequenciaEmail').value;
        this.settings.email.horario = document.getElementById('horarioEmail').value;
        
        this.settings.push.urgentes = document.getElementById('pushUrgentes').checked;
        this.settings.push.coletas = document.getElementById('pushColetas').checked;
        this.settings.push.lembretes = document.getElementById('pushLembretes').checked;
        
        this.settings.filtros.distancia = document.getElementById('filtroDistancia').checked;
        this.settings.filtros.categorias = document.getElementById('filtroCategorias').checked;
        
        // Salvar no localStorage
        localStorage.setItem('feedhope_notification_settings', JSON.stringify(this.settings));
        
        // Fechar modal
        bootstrap.Modal.getInstance(document.getElementById('modalConfiguracoes')).hide();
        
        this.showToast('Configurações salvas com sucesso!', 'success');
    }
    
    static checkForNewNotifications() {
        const newNotifications = this.generateNotifications();
        const existingIds = this.notifications.map(n => n.id);
        const reallyNew = newNotifications.filter(n => !existingIds.includes(n.id));
        
        if (reallyNew.length > 0) {
            this.notifications.unshift(...reallyNew);
            this.saveNotifications();
            this.updateStatistics();
            this.renderNotifications();
            
            // Mostrar notificação push se permitido
            reallyNew.forEach(notification => {
                if (notification.priority === 'high' && this.settings.push.urgentes) {
                    this.showPushNotification(notification);
                }
            });
        }
    }
    
    static requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showToast('Notificações push ativadas!', 'success');
                }
            });
        }
    }
    
    static showPushNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/images/leaf-icon.png',
                badge: '/images/leaf-icon.png',
                tag: notification.id
            });
        }
    }
    
    static showToast(message, type = 'info') {
        // Criar toast notification
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        // Adicionar ao container de toasts
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            container.style.zIndex = '1055';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        // Mostrar toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remover após esconder
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

// Exportar para uso global
window.NotificationCenter = NotificationCenter;

