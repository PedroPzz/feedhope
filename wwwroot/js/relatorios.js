// Relatórios e Análises - JavaScript
class Relatorios {
    
    static currentUser = null;
    static alimentosData = [];
    static empresasData = [];
    static charts = {};
    static filters = {
        periodo: 30,
        dataInicio: null,
        dataFim: null,
        empresas: [],
        categorias: ['frutas', 'verduras', 'paes', 'laticinios', 'carnes', 'outros'],
        status: ['disponivel', 'coletado'],
        quantidadeMin: 0,
        quantidadeMax: 1000
    };
    
    static init() {
        this.currentUser = Auth.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = '/Home/Login';
            return;
        }
        
        this.loadData();
        this.initControls();
        this.initCharts();
        this.generateReport();
    }
    
    static loadData() {
        // Carregar dados dos alimentos
        this.alimentosData = JSON.parse(localStorage.getItem('feedhope_alimentos') || '[]');
        
        // Carregar dados das empresas
        this.empresasData = JSON.parse(localStorage.getItem('feedhope_empresas') || '[]');
        
        // Gerar dados de exemplo se necessário
        if (this.alimentosData.length === 0) {
            this.generateSampleData();
        }
        
        // Enriquecer dados com informações calculadas
        this.enrichData();
    }
    
    static generateSampleData() {
        const hoje = new Date();
        const sampleData = [];
        
        // Gerar dados dos últimos 30 dias
        for (let i = 30; i >= 0; i--) {
            const data = new Date(hoje.getTime() - i * 24 * 60 * 60 * 1000);
            const numAlimentos = Math.floor(Math.random() * 10) + 1;
            
            for (let j = 0; j < numAlimentos; j++) {
                const categorias = ['frutas', 'verduras', 'paes', 'laticinios', 'carnes', 'outros'];
                const empresas = ['Supermercado Central', 'Padaria do Bairro', 'Feira do Açaí', 'Laticínios Paraense', 'Hortifruti Amazônia'];
                const alimentos = {
                    'frutas': ['Maçãs', 'Bananas', 'Laranjas', 'Uvas', 'Mamão'],
                    'verduras': ['Cenouras', 'Alface', 'Tomates', 'Cebolas', 'Batatas'],
                    'paes': ['Pão Francês', 'Pão de Forma', 'Pão Doce', 'Baguete', 'Pão Integral'],
                    'laticinios': ['Leite', 'Queijo', 'Iogurte', 'Manteiga', 'Requeijão'],
                    'carnes': ['Frango', 'Carne Bovina', 'Peixe', 'Suíno', 'Linguiça'],
                    'outros': ['Arroz', 'Feijão', 'Macarrão', 'Óleo', 'Açúcar']
                };
                
                const categoria = categorias[Math.floor(Math.random() * categorias.length)];
                const empresa = empresas[Math.floor(Math.random() * empresas.length)];
                const nomeAlimento = alimentos[categoria][Math.floor(Math.random() * alimentos[categoria].length)];
                const quantidade = Math.floor(Math.random() * 100) + 1;
                const status = Math.random() > 0.3 ? 'coletado' : 'disponivel';
                
                sampleData.push({
                    id: `sample_${i}_${j}`,
                    nomeAlimento: nomeAlimento,
                    categoria: categoria,
                    quantidade: quantidade,
                    unidade: categoria === 'laticinios' ? 'l' : 'kg',
                    empresaNome: empresa,
                    status: status,
                    dataCadastro: data.toISOString(),
                    dataColeta: status === 'coletado' ? new Date(data.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : null,
                    prioridade: ['baixa', 'media', 'alta', 'urgente'][Math.floor(Math.random() * 4)]
                });
            }
        }
        
        this.alimentosData = sampleData;
        
        // Salvar dados de exemplo
        const existingData = JSON.parse(localStorage.getItem('feedhope_alimentos') || '[]');
        const combinedData = [...existingData, ...sampleData];
        localStorage.setItem('feedhope_alimentos', JSON.stringify(combinedData));
    }
    
    static enrichData() {
        // Adicionar cálculos de impacto ambiental
        this.alimentosData.forEach(alimento => {
            // Calcular CO2 evitado baseado na categoria e quantidade
            const co2Factors = {
                'frutas': 0.5,      // kg CO2 por kg
                'verduras': 0.3,
                'paes': 1.2,
                'laticinios': 2.5,
                'carnes': 15.0,
                'outros': 0.8
            };
            
            alimento.co2Evitado = (alimento.quantidade * (co2Factors[alimento.categoria] || 1.0)).toFixed(2);
            
            // Adicionar valor nutricional estimado
            const valorNutricional = {
                'frutas': 60,       // kcal por 100g
                'verduras': 25,
                'paes': 250,
                'laticinios': 150,
                'carnes': 200,
                'outros': 350
            };
            
            alimento.valorNutricional = Math.round(alimento.quantidade * 10 * (valorNutricional[alimento.categoria] || 100) / 100);
        });
    }
    
    static initControls() {
        // Controle de período
        document.getElementById('periodoRelatorio').addEventListener('change', (e) => {
            const value = e.target.value;
            const customRange = document.getElementById('customDateRange');
            const customRangeEnd = document.getElementById('customDateRangeEnd');
            
            if (value === 'custom') {
                customRange.style.display = 'block';
                customRangeEnd.style.display = 'block';
                this.filters.periodo = null;
            } else {
                customRange.style.display = 'none';
                customRangeEnd.style.display = 'none';
                this.filters.periodo = parseInt(value);
                this.filters.dataInicio = null;
                this.filters.dataFim = null;
            }
        });
        
        // Controle de tipo de relatório
        document.getElementById('tipoRelatorio').addEventListener('change', () => {
            this.generateReport();
        });
        
        // Controles de data personalizada
        document.getElementById('dataInicio')?.addEventListener('change', (e) => {
            this.filters.dataInicio = e.target.value;
        });
        
        document.getElementById('dataFim')?.addEventListener('change', (e) => {
            this.filters.dataFim = e.target.value;
        });
        
        // Carregar opções de empresas no filtro
        this.loadEmpresasFilter();
    }
    
    static loadEmpresasFilter() {
        const select = document.getElementById('filtroEmpresas');
        if (!select) return;
        
        const empresasUnicas = [...new Set(this.alimentosData.map(a => a.empresaNome))];
        
        select.innerHTML = '';
        empresasUnicas.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa;
            option.textContent = empresa;
            option.selected = true;
            select.appendChild(option);
        });
        
        this.filters.empresas = empresasUnicas;
    }
    
    static initCharts() {
        // Configurações padrão do Chart.js
        Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.color = '#666';
        
        // Inicializar gráficos
        this.initEvolucaoChart();
        this.initCategoriasChart();
        this.initTopEmpresasChart();
        this.initPrioridadesChart();
    }
    
    static initEvolucaoChart() {
        const ctx = document.getElementById('chartEvolucao').getContext('2d');
        
        this.charts.evolucao = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Alimentos Cadastrados',
                    data: [],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    }
    
    static initCategoriasChart() {
        const ctx = document.getElementById('chartCategorias').getContext('2d');
        
        this.charts.categorias = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
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
    
    static initTopEmpresasChart() {
        const ctx = document.getElementById('chartTopEmpresas').getContext('2d');
        
        this.charts.topEmpresas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Quantidade de Alimentos',
                    data: [],
                    backgroundColor: '#17a2b8',
                    borderColor: '#138496',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    static initPrioridadesChart() {
        const ctx = document.getElementById('chartPrioridades').getContext('2d');
        
        this.charts.prioridades = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Baixa', 'Média', 'Alta', 'Urgente'],
                datasets: [{
                    label: 'Quantidade',
                    data: [],
                    backgroundColor: ['#28a745', '#ffc107', '#fd7e14', '#dc3545']
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
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    static getFilteredData() {
        let filtered = [...this.alimentosData];
        
        // Filtro por período
        if (this.filters.periodo) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - this.filters.periodo);
            filtered = filtered.filter(a => new Date(a.dataCadastro) >= cutoffDate);
        } else if (this.filters.dataInicio && this.filters.dataFim) {
            const inicio = new Date(this.filters.dataInicio);
            const fim = new Date(this.filters.dataFim);
            filtered = filtered.filter(a => {
                const data = new Date(a.dataCadastro);
                return data >= inicio && data <= fim;
            });
        }
        
        // Filtro por empresas
        if (this.filters.empresas.length > 0) {
            filtered = filtered.filter(a => this.filters.empresas.includes(a.empresaNome));
        }
        
        // Filtro por categorias
        filtered = filtered.filter(a => this.filters.categorias.includes(a.categoria));
        
        // Filtro por status
        filtered = filtered.filter(a => this.filters.status.includes(a.status));
        
        // Filtro por quantidade
        filtered = filtered.filter(a => 
            a.quantidade >= this.filters.quantidadeMin && 
            a.quantidade <= this.filters.quantidadeMax
        );
        
        return filtered;
    }
    
    static generateReport() {
        const filteredData = this.getFilteredData();
        
        this.updateKPIs(filteredData);
        this.updateEvolucaoChart(filteredData);
        this.updateCategoriasChart(filteredData);
        this.updateTopEmpresasChart(filteredData);
        this.updatePrioridadesChart(filteredData);
        this.updateImpactoAmbiental(filteredData);
        this.updateDataTable(filteredData);
    }
    
    static updateKPIs(data) {
        // Total de alimentos
        const totalAlimentos = data.length;
        document.getElementById('kpiTotalAlimentos').textContent = totalAlimentos;
        
        // Peso total
        const pesoTotal = data.reduce((sum, a) => sum + a.quantidade, 0);
        document.getElementById('kpiPesoTotal').textContent = pesoTotal.toFixed(1);
        
        // Coletas realizadas
        const coletas = data.filter(a => a.status === 'coletado').length;
        document.getElementById('kpiColetas').textContent = coletas;
        
        // CO2 evitado
        const co2Total = data.reduce((sum, a) => sum + parseFloat(a.co2Evitado || 0), 0);
        document.getElementById('kpiCO2Evitado').textContent = co2Total.toFixed(1);
        
        // Calcular tendências (comparar com período anterior)
        this.calculateTrends(data);
    }
    
    static calculateTrends(currentData) {
        // Simular cálculo de tendências
        const trends = {
            alimentos: Math.floor(Math.random() * 20) + 5,
            peso: Math.floor(Math.random() * 15) + 3,
            coletas: Math.floor(Math.random() * 25) + 8,
            co2: Math.floor(Math.random() * 30) + 10
        };
        
        document.getElementById('kpiTotalAlimentosTrend').textContent = `+${trends.alimentos}%`;
        document.getElementById('kpiPesoTotalTrend').textContent = `+${trends.peso}%`;
        document.getElementById('kpiColetasTrend').textContent = `+${trends.coletas}%`;
        document.getElementById('kpiCO2EvitadoTrend').textContent = `+${trends.co2}%`;
    }
    
    static updateEvolucaoChart(data) {
        // Agrupar dados por data
        const groupedData = {};
        
        data.forEach(alimento => {
            const date = new Date(alimento.dataCadastro).toLocaleDateString('pt-BR');
            if (!groupedData[date]) {
                groupedData[date] = { count: 0, peso: 0, coletas: 0 };
            }
            groupedData[date].count++;
            groupedData[date].peso += alimento.quantidade;
            if (alimento.status === 'coletado') {
                groupedData[date].coletas++;
            }
        });
        
        const sortedDates = Object.keys(groupedData).sort((a, b) => 
            new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-'))
        );
        
        const currentMetric = this.getCurrentTimeChartMetric();
        const values = sortedDates.map(date => groupedData[date][currentMetric]);
        
        this.charts.evolucao.data.labels = sortedDates;
        this.charts.evolucao.data.datasets[0].data = values;
        this.charts.evolucao.update();
    }
    
    static getCurrentTimeChartMetric() {
        // Determinar métrica atual baseada no botão ativo
        const activeButton = document.querySelector('.btn-group .btn.active');
        if (activeButton) {
            const text = activeButton.textContent.toLowerCase();
            if (text.includes('peso')) return 'peso';
            if (text.includes('coletas')) return 'coletas';
        }
        return 'count';
    }
    
    static updateCategoriasChart(data) {
        const categoryCounts = {};
        
        data.forEach(alimento => {
            categoryCounts[alimento.categoria] = (categoryCounts[alimento.categoria] || 0) + 1;
        });
        
        const labels = Object.keys(categoryCounts);
        const values = Object.values(categoryCounts);
        
        this.charts.categorias.data.labels = labels.map(cat => 
            cat.charAt(0).toUpperCase() + cat.slice(1)
        );
        this.charts.categorias.data.datasets[0].data = values;
        this.charts.categorias.update();
    }
    
    static updateTopEmpresasChart(data) {
        const empresaCounts = {};
        
        data.forEach(alimento => {
            empresaCounts[alimento.empresaNome] = (empresaCounts[alimento.empresaNome] || 0) + 1;
        });
        
        // Ordenar e pegar top 10
        const sortedEmpresas = Object.entries(empresaCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        const labels = sortedEmpresas.map(([nome]) => nome);
        const values = sortedEmpresas.map(([,count]) => count);
        
        this.charts.topEmpresas.data.labels = labels;
        this.charts.topEmpresas.data.datasets[0].data = values;
        this.charts.topEmpresas.update();
    }
    
    static updatePrioridadesChart(data) {
        const prioridadeCounts = {
            'baixa': 0,
            'media': 0,
            'alta': 0,
            'urgente': 0
        };
        
        data.forEach(alimento => {
            if (prioridadeCounts.hasOwnProperty(alimento.prioridade)) {
                prioridadeCounts[alimento.prioridade]++;
            }
        });
        
        this.charts.prioridades.data.datasets[0].data = Object.values(prioridadeCounts);
        this.charts.prioridades.update();
    }
    
    static updateImpactoAmbiental(data) {
        const co2Total = data.reduce((sum, a) => sum + parseFloat(a.co2Evitado || 0), 0);
        
        // Atualizar display principal
        document.getElementById('impactoCO2').textContent = co2Total.toFixed(0);
        
        // Calcular equivalências
        const arvores = Math.round(co2Total / 22); // 1 árvore absorve ~22kg CO2/ano
        const carroKm = Math.round(co2Total / 0.12); // ~0.12kg CO2/km
        const lampadaHoras = Math.round(co2Total / 0.0006); // ~0.0006kg CO2/hora
        
        document.getElementById('equivalenteArvores').textContent = `${arvores} árvores plantadas`;
        document.getElementById('equivalenteCarro').textContent = `${carroKm} km de carro`;
        document.getElementById('equivalenteLampada').textContent = `${lampadaHoras} horas de lâmpada`;
        
        // Atualizar progresso da meta
        const metaMensal = 1000;
        const progresso = Math.min((co2Total / metaMensal) * 100, 100);
        document.getElementById('progressoMeta').style.width = `${progresso}%`;
    }
    
    static updateDataTable(data) {
        const tbody = document.getElementById('tabelaDadosBody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        <i class="fas fa-chart-bar fa-2x mb-2"></i><br>
                        Nenhum dado encontrado com os filtros aplicados
                    </td>
                </tr>
            `;
            return;
        }
        
        // Ordenar por data mais recente
        const sortedData = data.sort((a, b) => new Date(b.dataCadastro) - new Date(a.dataCadastro));
        
        // Mostrar apenas os primeiros 50 registros
        sortedData.slice(0, 50).forEach(alimento => {
            const row = this.createDataTableRow(alimento);
            tbody.appendChild(row);
        });
        
        if (data.length > 50) {
            const moreRow = document.createElement('tr');
            moreRow.innerHTML = `
                <td colspan="7" class="text-center py-2 text-muted">
                    <small>Mostrando 50 de ${data.length} registros. Use os filtros para refinar os resultados.</small>
                </td>
            `;
            tbody.appendChild(moreRow);
        }
    }
    
    static createDataTableRow(alimento) {
        const tr = document.createElement('tr');
        
        const dataCadastro = new Date(alimento.dataCadastro).toLocaleDateString('pt-BR');
        const statusBadge = this.getStatusBadge(alimento.status);
        const co2 = parseFloat(alimento.co2Evitado || 0).toFixed(1);
        
        tr.innerHTML = `
            <td>${dataCadastro}</td>
            <td>${alimento.empresaNome}</td>
            <td>${alimento.nomeAlimento}</td>
            <td>
                <span class="badge bg-light text-dark">
                    ${this.getCategoryEmoji(alimento.categoria)} ${alimento.categoria}
                </span>
            </td>
            <td>${alimento.quantidade} ${alimento.unidade}</td>
            <td>${statusBadge}</td>
            <td>${co2} kg</td>
        `;
        
        return tr;
    }
    
    static getStatusBadge(status) {
        const badges = {
            'disponivel': '<span class="badge bg-success">Disponível</span>',
            'coletado': '<span class="badge bg-info">Coletado</span>',
            'expirado': '<span class="badge bg-danger">Expirado</span>'
        };
        return badges[status] || '<span class="badge bg-secondary">-</span>';
    }
    
    static getCategoryEmoji(categoria) {
        const emojis = {
            'frutas': '🍎',
            'verduras': '🥕',
            'paes': '🍞',
            'laticinios': '🧀',
            'carnes': '🥩',
            'outros': '📦'
        };
        return emojis[categoria] || '📦';
    }
    
    static changeTimeChart(metric) {
        // Atualizar botões ativos
        document.querySelectorAll('.btn-group .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Atualizar label do gráfico
        const labels = {
            'alimentos': 'Alimentos Cadastrados',
            'peso': 'Peso Total (kg)',
            'coletas': 'Coletas Realizadas'
        };
        
        this.charts.evolucao.data.datasets[0].label = labels[metric];
        
        // Regenerar dados
        const filteredData = this.getFilteredData();
        this.updateEvolucaoChart(filteredData);
    }
    
    static refreshData() {
        this.showToast('Atualizando dados...', 'info');
        
        // Simular atualização
        setTimeout(() => {
            this.loadData();
            this.generateReport();
            this.showToast('Dados atualizados com sucesso!', 'success');
        }, 1500);
    }
    
    static exportReport() {
        this.showToast('Preparando relatório para exportação...', 'info');
        
        // Simular exportação
        setTimeout(() => {
            const filteredData = this.getFilteredData();
            const reportData = this.generateReportData(filteredData);
            
            // Criar e baixar arquivo JSON (simulação)
            const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `feedhope-relatorio-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showToast('Relatório exportado com sucesso!', 'success');
        }, 2000);
    }
    
    static generateReportData(data) {
        return {
            metadata: {
                geradoEm: new Date().toISOString(),
                usuario: this.currentUser.nome,
                periodo: this.filters.periodo ? `Últimos ${this.filters.periodo} dias` : 'Personalizado',
                totalRegistros: data.length
            },
            kpis: {
                totalAlimentos: data.length,
                pesoTotal: data.reduce((sum, a) => sum + a.quantidade, 0),
                coletasRealizadas: data.filter(a => a.status === 'coletado').length,
                co2Evitado: data.reduce((sum, a) => sum + parseFloat(a.co2Evitado || 0), 0)
            },
            dados: data
        };
    }
    
    static exportTable(format) {
        const filteredData = this.getFilteredData();
        
        switch (format) {
            case 'csv':
                this.exportToCSV(filteredData);
                break;
            case 'excel':
                this.showToast('Exportação para Excel não implementada nesta versão de demonstração', 'warning');
                break;
            case 'pdf':
                this.showToast('Exportação para PDF não implementada nesta versão de demonstração', 'warning');
                break;
        }
    }
    
    static exportToCSV(data) {
        const headers = ['Data', 'Empresa', 'Alimento', 'Categoria', 'Quantidade', 'Status', 'CO2 Evitado'];
        const csvContent = [
            headers.join(','),
            ...data.map(alimento => [
                new Date(alimento.dataCadastro).toLocaleDateString('pt-BR'),
                `"${alimento.empresaNome}"`,
                `"${alimento.nomeAlimento}"`,
                alimento.categoria,
                `${alimento.quantidade} ${alimento.unidade}`,
                alimento.status,
                `${alimento.co2Evitado} kg`
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedhope-dados-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Dados exportados para CSV!', 'success');
    }
    
    static applyFilters() {
        // Coletar filtros do modal
        const empresasSelect = document.getElementById('filtroEmpresas');
        this.filters.empresas = Array.from(empresasSelect.selectedOptions).map(option => option.value);
        
        // Categorias
        this.filters.categorias = [];
        ['frutas', 'verduras', 'paes', 'laticinios', 'carnes', 'outros'].forEach(categoria => {
            const checkbox = document.getElementById(`filtro${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`);
            if (checkbox && checkbox.checked) {
                this.filters.categorias.push(categoria);
            }
        });
        
        // Status
        this.filters.status = [];
        ['disponivel', 'coletado', 'expirado'].forEach(status => {
            const checkbox = document.getElementById(`filtro${status.charAt(0).toUpperCase() + status.slice(1)}`);
            if (checkbox && checkbox.checked) {
                this.filters.status.push(status);
            }
        });
        
        // Quantidade
        this.filters.quantidadeMin = parseInt(document.getElementById('quantidadeMin').value) || 0;
        this.filters.quantidadeMax = parseInt(document.getElementById('quantidadeMax').value) || 1000;
        
        // Regenerar relatório
        this.generateReport();
        this.showToast('Filtros aplicados com sucesso!', 'success');
    }
    
    static resetFilters() {
        // Resetar filtros
        this.filters = {
            periodo: 30,
            dataInicio: null,
            dataFim: null,
            empresas: [...new Set(this.alimentosData.map(a => a.empresaNome))],
            categorias: ['frutas', 'verduras', 'paes', 'laticinios', 'carnes', 'outros'],
            status: ['disponivel', 'coletado'],
            quantidadeMin: 0,
            quantidadeMax: 1000
        };
        
        // Resetar interface
        document.getElementById('periodoRelatorio').value = '30';
        document.getElementById('quantidadeMin').value = '0';
        document.getElementById('quantidadeMax').value = '1000';
        
        // Resetar checkboxes
        document.querySelectorAll('#modalFiltros input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = !checkbox.id.includes('Expirado');
        });
        
        // Resetar select de empresas
        const empresasSelect = document.getElementById('filtroEmpresas');
        Array.from(empresasSelect.options).forEach(option => {
            option.selected = true;
        });
        
        // Regenerar relatório
        this.generateReport();
        this.showToast('Filtros resetados!', 'info');
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
window.Relatorios = Relatorios;

