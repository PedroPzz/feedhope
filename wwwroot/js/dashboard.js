// Dashboard - JavaScript
class Dashboard {
    
    static charts = {};
    static currentUser = null;
    static alimentosData = [];
    static notifications = [];
    
    static init() {
        this.currentUser = Auth.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = '/Home/Login';
            return;
        }
        
        this.loadUserData();
        this.loadAlimentosData();
        this.loadNotifications();
        this.initCharts();
        this.initFilters();
        this.updateStatistics();
        this.renderAlimentosTable();
        this.renderNotifications();
        
        // Atualizar dados a cada 5 minutos
        setInterval(() => {
            this.refreshData();
        }, 5 * 60 * 1000);
    }
    
    static loadUserData() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const userNameDisplay = document.getElementById('userNameDisplay');
        
        if (this.currentUser) {
            welcomeMessage.textContent = `Bem-vindo, ${this.currentUser.nome}!`;
            userNameDisplay.textContent = this.currentUser.nome.split(' ')[0];
        }
    }
    
    static loadAlimentosData() {
        const allAlimentos = JSON.parse(localStorage.getItem('feedhope_alimentos') || '[]');
        
        // Filtrar alimentos do usuário atual
        if (this.currentUser.tipoUsuario === 'empresa') {
            this.alimentosData = allAlimentos.filter(a => a.empresaOrigem === this.currentUser.id);
        } else {
            // Para UFRA e outros tipos, mostrar todos
            this.alimentosData = allAlimentos;
        }
        
        // Simular alguns dados se não houver nenhum
        if (this.alimentosData.length === 0) {
            this.generateSampleData();
        }
    }
    
    static generateSampleData() {
        // Não gerar dados fictícios - usar apenas dados reais cadastrados
        this.alimentosData = [];
    }
    
    static loadNotifications() {
        // Gerar notificações baseadas nos dados
        this.notifications = [];
        
        const hoje = new Date();
        
        this.alimentosData.forEach(alimento => {
            const dataDisp = new Date(alimento.dataDisponibilidade);
            const diffDays = Math.ceil((dataDisp - hoje) / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 1 && alimento.status === 'disponivel') {
                this.notifications.push({
                    id: `urgent_${alimento.id}`,
                    type: 'warning',
                    title: 'Alimento próximo ao vencimento',
                    message: `${alimento.nomeAlimento} expira em ${diffDays <= 0 ? 'hoje' : diffDays + ' dia(s)'}`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    action: {
                        text: 'Ver Detalhes',
                        onclick: `Dashboard.viewAlimentoDetails('${alimento.id}')`
                    }
                });
            }
        });
        
        // Adicionar notificações de exemplo
        if (this.notifications.length === 0) {
            this.notifications.push({
                id: 'welcome',
                type: 'info',
                title: 'Bem-vindo ao FeedHope!',
                message: 'Sua conta foi criada com sucesso. Comece cadastrando seus primeiros alimentos.',
                timestamp: new Date().toISOString(),
                read: false
            });
        }
    }
    
    static updateStatistics() {
        const stats = {
            total: this.alimentosData.length,
            pendentes: this.alimentosData.filter(a => a.status === 'disponivel').length,
            coletados: this.alimentosData.filter(a => a.status === 'coletado').length,
            urgentes: this.alimentosData.filter(a => a.prioridade === 'urgente' && a.status === 'disponivel').length
        };
        
        document.getElementById('totalAlimentos').textContent = stats.total;
        document.getElementById('alimentosPendentes').textContent = stats.pendentes;
        document.getElementById('coletasRealizadas').textContent = stats.coletados;
        document.getElementById('alimentosUrgentes').textContent = stats.urgentes;
    }
    
    static initCharts() {
        this.initAlimentosMesChart();
        this.initTiposAlimentosChart();
    }
    
    static initAlimentosMesChart() {
        const ctx = document.getElementById('chartAlimentosMes').getContext('2d');
        
        // Agrupar alimentos por mês
        const monthlyData = this.groupAlimentosByMonth();
        
        this.charts.alimentosMes = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Alimentos Cadastrados',
                    data: monthlyData.data,
                    borderColor: '#38a169',
                    backgroundColor: 'rgba(56, 161, 105, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    static initTiposAlimentosChart() {
        const ctx = document.getElementById('chartTiposAlimentos').getContext('2d');
        
        // Agrupar por categoria
        const categoryData = this.groupAlimentosByCategory();
        
        this.charts.tiposAlimentos = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.data,
                    backgroundColor: [
                        '#38a169', // Verde
                        '#ed8936', // Laranja
                        '#4299e1', // Azul
                        '#e53e3e', // Vermelho
                        '#9f7aea', // Roxo
                        '#38b2ac'  // Teal
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    static groupAlimentosByMonth() {
        const months = {};
        const now = new Date();
        
        // Inicializar últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = date.toISOString().substring(0, 7); // YYYY-MM
            months[key] = 0;
        }
        
        // Contar alimentos por mês
        this.alimentosData.forEach(alimento => {
            const month = alimento.dataCadastro.substring(0, 7);
            if (months.hasOwnProperty(month)) {
                months[month]++;
            }
        });
        
        return {
            labels: Object.keys(months).map(key => {
                const date = new Date(key + '-01');
                return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            }),
            data: Object.values(months)
        };
    }
    
    static groupAlimentosByCategory() {
        const categories = {};
        
        this.alimentosData.forEach(alimento => {
            const cat = alimento.categoria || 'outros';
            categories[cat] = (categories[cat] || 0) + 1;
        });
        
        const categoryNames = {
            'frutas': 'Frutas',
            'verduras': 'Verduras',
            'paes': 'Pães',
            'laticinios': 'Laticínios',
            'carnes': 'Carnes',
            'outros': 'Outros'
        };
        
        return {
            labels: Object.keys(categories).map(key => categoryNames[key] || key),
            data: Object.values(categories)
        };
    }
    
    static initFilters() {
        const filterStatus = document.getElementById('filterStatus');
        const filterCategoria = document.getElementById('filterCategoria');
        
        [filterStatus, filterCategoria].forEach(filter => {
            filter.addEventListener('change', () => {
                this.renderAlimentosTable();
            });
        });
    }
    
    static renderAlimentosTable() {
        const tbody = document.getElementById('alimentosTableBody');
        const filterStatus = document.getElementById('filterStatus').value;
        const filterCategoria = document.getElementById('filterCategoria').value;
        
        let filteredData = this.alimentosData;
        
        if (filterStatus) {
            filteredData = filteredData.filter(a => a.status === filterStatus);
        }
        
        if (filterCategoria) {
            filteredData = filteredData.filter(a => a.categoria === filterCategoria);
        }
        
        tbody.innerHTML = '';
        
        if (filteredData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        <i class="fas fa-inbox fa-2x mb-2"></i><br>
                        Nenhum alimento encontrado
                    </td>
                </tr>
            `;
            return;
        }
        
        filteredData.forEach(alimento => {
            const row = this.createAlimentoRow(alimento);
            tbody.appendChild(row);
        });
    }
    
    static createAlimentoRow(alimento) {
        const tr = document.createElement('tr');
        
        const statusBadge = this.getStatusBadge(alimento.status);
        const prioridadeBadge = this.getPrioridadeBadge(alimento.prioridade);
        const dataCadastro = new Date(alimento.dataCadastro).toLocaleDateString('pt-BR');
        
        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="me-2">
                        ${this.getCategoryIcon(alimento.categoria)}
                    </div>
                    <div>
                        <div class="fw-bold">${alimento.nomeAlimento}</div>
                        <small class="text-muted">${alimento.quantidade} ${alimento.unidade}</small>
                    </div>
                </div>
            </td>
            <td>${this.getCategoryName(alimento.categoria)}</td>
            <td>${alimento.quantidade} ${alimento.unidade}</td>
            <td>${statusBadge}</td>
            <td>${prioridadeBadge}</td>
            <td>${dataCadastro}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info" onclick="Dashboard.viewAlimentoDetails('${alimento.id}')" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="Dashboard.editAlimento('${alimento.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="Dashboard.deleteAlimento('${alimento.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        return tr;
    }
    
    static getStatusBadge(status) {
        const badges = {
            'disponivel': '<span class="badge bg-success">Disponível</span>',
            'coletado': '<span class="badge bg-info">Coletado</span>',
            'expirado': '<span class="badge bg-danger">Expirado</span>'
        };
        return badges[status] || '<span class="badge bg-secondary">Desconhecido</span>';
    }
    
    static getPrioridadeBadge(prioridade) {
        const badges = {
            'baixa': '<span class="badge bg-success">Baixa</span>',
            'media': '<span class="badge bg-warning">Média</span>',
            'alta': '<span class="badge bg-orange">Alta</span>',
            'urgente': '<span class="badge bg-danger">Urgente</span>'
        };
        return badges[prioridade] || '<span class="badge bg-secondary">-</span>';
    }
    
    static getCategoryIcon(categoria) {
        const icons = {
            'frutas': '<i class="fas fa-apple-alt text-success"></i>',
            'verduras': '<i class="fas fa-carrot text-warning"></i>',
            'paes': '<i class="fas fa-bread-slice text-warning"></i>',
            'laticinios': '<i class="fas fa-cheese text-info"></i>',
            'carnes': '<i class="fas fa-drumstick-bite text-danger"></i>',
            'outros': '<i class="fas fa-box text-secondary"></i>'
        };
        return icons[categoria] || icons['outros'];
    }
    
    static getCategoryName(categoria) {
        const names = {
            'frutas': 'Frutas',
            'verduras': 'Verduras',
            'paes': 'Pães',
            'laticinios': 'Laticínios',
            'carnes': 'Carnes',
            'outros': 'Outros'
        };
        return names[categoria] || 'Outros';
    }
    
    static renderNotifications() {
        const container = document.getElementById('notificationsList');
        
        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="fas fa-bell-slash fa-2x mb-2"></i><br>
                    Nenhuma notificação no momento
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        this.notifications.forEach(notification => {
            const div = document.createElement('div');
            div.className = `alert alert-${notification.type} ${notification.read ? 'alert-read' : ''} d-flex align-items-center`;
            
            div.innerHTML = `
                <div class="flex-grow-1">
                    <h6 class="alert-heading mb-1">${notification.title}</h6>
                    <p class="mb-1">${notification.message}</p>
                    <small class="text-muted">${this.formatTimestamp(notification.timestamp)}</small>
                </div>
                <div class="ms-3">
                    ${notification.action ? `<button class="btn btn-sm btn-outline-${notification.type}" onclick="${notification.action.onclick}">${notification.action.text}</button>` : ''}
                    <button class="btn btn-sm btn-outline-secondary ms-1" onclick="Dashboard.markNotificationAsRead('${notification.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(div);
        });
    }
    
    static formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
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
    
    static viewAlimentoDetails(alimentoId) {
        const alimento = this.alimentosData.find(a => a.id === alimentoId);
        if (!alimento) return;
        
        const modal = document.getElementById('modalDetalhesAlimento');
        const content = document.getElementById('modalDetalhesContent');
        
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Informações Básicas</h6>
                    <table class="table table-sm">
                        <tr><td><strong>Nome:</strong></td><td>${alimento.nomeAlimento}</td></tr>
                        <tr><td><strong>Categoria:</strong></td><td>${this.getCategoryName(alimento.categoria)}</td></tr>
                        <tr><td><strong>Quantidade:</strong></td><td>${alimento.quantidade} ${alimento.unidade}</td></tr>
                        <tr><td><strong>Status:</strong></td><td>${this.getStatusBadge(alimento.status)}</td></tr>
                        <tr><td><strong>Prioridade:</strong></td><td>${this.getPrioridadeBadge(alimento.prioridade)}</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6>Datas</h6>
                    <table class="table table-sm">
                        <tr><td><strong>Cadastro:</strong></td><td>${new Date(alimento.dataCadastro).toLocaleDateString('pt-BR')}</td></tr>
                        <tr><td><strong>Disponível até:</strong></td><td>${new Date(alimento.dataDisponibilidade).toLocaleDateString('pt-BR')}</td></tr>
                        ${alimento.dataVencimento ? `<tr><td><strong>Vencimento:</strong></td><td>${new Date(alimento.dataVencimento).toLocaleDateString('pt-BR')}</td></tr>` : ''}
                    </table>
                </div>
            </div>
            ${alimento.observacoesGerais ? `
                <div class="mt-3">
                    <h6>Observações</h6>
                    <p class="text-muted">${alimento.observacoesGerais}</p>
                </div>
            ` : ''}
        `;
        
        document.getElementById('btnEditarAlimento').onclick = () => this.editAlimento(alimentoId);
        
        new bootstrap.Modal(modal).show();
    }
    
    static editAlimento(alimentoId) {
        // Redirecionar para página de edição (seria implementada)
        alert('Funcionalidade de edição será implementada em breve.');
    }
    
    static deleteAlimento(alimentoId) {
        const modal = document.getElementById('modalConfirmarExclusao');
        
        document.getElementById('btnConfirmarExclusao').onclick = () => {
            // Remover do array local
            this.alimentosData = this.alimentosData.filter(a => a.id !== alimentoId);
            
            // Atualizar localStorage
            const allAlimentos = JSON.parse(localStorage.getItem('feedhope_alimentos') || '[]');
            const updatedAlimentos = allAlimentos.filter(a => a.id !== alimentoId);
            localStorage.setItem('feedhope_alimentos', JSON.stringify(updatedAlimentos));
            
            // Atualizar interface
            this.updateStatistics();
            this.renderAlimentosTable();
            this.updateCharts();
            
            bootstrap.Modal.getInstance(modal).hide();
            
            // Mostrar feedback
            this.showToast('Alimento excluído com sucesso!', 'success');
        };
        
        new bootstrap.Modal(modal).show();
    }
    
    static markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.renderNotifications();
        }
    }
    
    static markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.renderNotifications();
    }
    
    static updateCharts() {
        // Atualizar dados dos gráficos
        const monthlyData = this.groupAlimentosByMonth();
        const categoryData = this.groupAlimentosByCategory();
        
        this.charts.alimentosMes.data.labels = monthlyData.labels;
        this.charts.alimentosMes.data.datasets[0].data = monthlyData.data;
        this.charts.alimentosMes.update();
        
        this.charts.tiposAlimentos.data.labels = categoryData.labels;
        this.charts.tiposAlimentos.data.datasets[0].data = categoryData.data;
        this.charts.tiposAlimentos.update();
    }
    
    static refreshData() {
        this.loadAlimentosData();
        this.loadNotifications();
        this.updateStatistics();
        this.renderAlimentosTable();
        this.renderNotifications();
        this.updateCharts();
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
        
        // Adicionar ao container de toasts (criar se não existir)
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

// Funções globais para uso nos templates
function editProfile() {
    alert('Funcionalidade de edição de perfil será implementada em breve.');
}

function viewSettings() {
    alert('Funcionalidade de configurações será implementada em breve.');
}

// Exportar para uso global
window.Dashboard = Dashboard;


    
    // Função para exportar dados para Excel
    static exportToExcel() {
        try {
            const data = this.prepareExportData();
            
            // Criar workbook
            const wb = XLSX.utils.book_new();
            
            // Criar worksheet com dados dos alimentos
            const ws = XLSX.utils.json_to_sheet(data.alimentos);
            XLSX.utils.book_append_sheet(wb, ws, "Alimentos");
            
            // Criar worksheet com estatísticas
            const statsWs = XLSX.utils.json_to_sheet(data.estatisticas);
            XLSX.utils.book_append_sheet(wb, statsWs, "Estatísticas");
            
            // Salvar arquivo
            const fileName = `feedhope_relatorio_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
            
            this.showAlert('Relatório Excel exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar Excel:', error);
            this.showAlert('Erro ao exportar relatório Excel.', 'danger');
        }
    }
    
    // Função para exportar dados para PDF
    static exportToPDF() {
        try {
            const data = this.prepareExportData();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configurar fonte
            doc.setFont('helvetica');
            
            // Título
            doc.setFontSize(20);
            doc.text('FeedHope - Relatório de Alimentos', 20, 30);
            
            // Data do relatório
            doc.setFontSize(12);
            doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
            
            // Estatísticas
            doc.setFontSize(16);
            doc.text('Estatísticas Gerais', 20, 65);
            
            doc.setFontSize(12);
            let yPos = 80;
            data.estatisticas.forEach(stat => {
                doc.text(`${stat.Indicador}: ${stat.Valor}`, 25, yPos);
                yPos += 10;
            });
            
            // Lista de alimentos
            yPos += 20;
            doc.setFontSize(16);
            doc.text('Lista de Alimentos', 20, yPos);
            
            yPos += 15;
            doc.setFontSize(10);
            
            // Cabeçalhos da tabela
            const headers = ['Nome', 'Categoria', 'Quantidade', 'Status', 'Prioridade'];
            let xPos = 20;
            headers.forEach(header => {
                doc.text(header, xPos, yPos);
                xPos += 35;
            });
            
            yPos += 10;
            
            // Dados da tabela
            data.alimentos.forEach(alimento => {
                if (yPos > 270) { // Nova página se necessário
                    doc.addPage();
                    yPos = 30;
                }
                
                xPos = 20;
                doc.text(alimento.Nome.substring(0, 15), xPos, yPos);
                xPos += 35;
                doc.text(alimento.Categoria, xPos, yPos);
                xPos += 35;
                doc.text(alimento.Quantidade, xPos, yPos);
                xPos += 35;
                doc.text(alimento.Status, xPos, yPos);
                xPos += 35;
                doc.text(alimento.Prioridade, xPos, yPos);
                
                yPos += 8;
            });
            
            // Salvar PDF
            const fileName = `feedhope_relatorio_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            this.showAlert('Relatório PDF exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            this.showAlert('Erro ao exportar relatório PDF.', 'danger');
        }
    }
    
    // Preparar dados para exportação
    static prepareExportData() {
        const alimentos = this.alimentosData.map(alimento => ({
            Nome: alimento.nomeAlimento,
            Categoria: this.getCategoryName(alimento.categoria),
            Quantidade: `${alimento.quantidade} ${alimento.unidade}`,
            Status: this.getStatusText(alimento.status),
            Prioridade: this.getPrioridadeText(alimento.prioridade),
            'Data Cadastro': new Date(alimento.dataCadastro).toLocaleDateString('pt-BR'),
            'Data Disponibilidade': alimento.dataDisponibilidade ? 
                new Date(alimento.dataDisponibilidade).toLocaleDateString('pt-BR') : '-'
        }));
        
        const stats = {
            total: this.alimentosData.length,
            disponivel: this.alimentosData.filter(a => a.status === 'disponivel').length,
            coletado: this.alimentosData.filter(a => a.status === 'coletado').length,
            urgente: this.alimentosData.filter(a => a.prioridade === 'urgente').length
        };
        
        const estatisticas = [
            { Indicador: 'Total de Alimentos', Valor: stats.total },
            { Indicador: 'Alimentos Disponíveis', Valor: stats.disponivel },
            { Indicador: 'Alimentos Coletados', Valor: stats.coletado },
            { Indicador: 'Alimentos Urgentes', Valor: stats.urgente }
        ];
        
        return { alimentos, estatisticas };
    }
    
    // Funções auxiliares para texto
    static getStatusText(status) {
        const statusMap = {
            'disponivel': 'Disponível',
            'coletado': 'Coletado',
            'expirado': 'Expirado'
        };
        return statusMap[status] || 'Desconhecido';
    }
    
    static getPrioridadeText(prioridade) {
        const prioridadeMap = {
            'baixa': 'Baixa',
            'media': 'Média',
            'alta': 'Alta',
            'urgente': 'Urgente'
        };
        return prioridadeMap[prioridade] || '-';
    }
    
    // Mostrar alerta
    static showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer') || document.body;
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        alertContainer.appendChild(alertDiv);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }

