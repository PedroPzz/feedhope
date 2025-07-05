// Mapa e Logística - JavaScript
class MapaLogistica {
    
    static map = null;
    static markers = [];
    static directionsService = null;
    static directionsRenderer = null;
    static currentUser = null;
    static alimentosData = [];
    static empresasData = [];
    static filters = {
        categorias: ['frutas', 'verduras', 'paes', 'laticinios', 'carnes', 'outros'],
        prioridade: '',
        dataInicio: '',
        dataFim: '',
        quantidadeMinima: 0
    };
    static trafficLayer = null;
    static showingTraffic = false;
    
    // Coordenadas de Belém, PA (centro da UFRA)
    static centerCoords = { lat: -1.4558, lng: -48.4902 };
    
    static init() {
        this.currentUser = Auth.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = '/Home/Login';
            return;
        }
        
        this.loadData();
        this.initMap();
        this.initControls();
        this.initFilters();
        this.updateStatistics();
        this.renderPontosTable();
    }
    
    static loadData() {
        // Carregar alimentos
        const allAlimentos = JSON.parse(localStorage.getItem('feedhope_alimentos') || '[]');
        this.alimentosData = allAlimentos.filter(a => a.status === 'disponivel');
        
        // Carregar empresas
        this.empresasData = JSON.parse(localStorage.getItem('feedhope_empresas') || '[]');
        
        // Gerar dados de exemplo se necessário
        if (this.alimentosData.length === 0) {
            this.generateSampleData();
        }
    }
    
    static generateSampleData() {
        const sampleAlimentos = [
            {
                id: '1',
                nomeAlimento: 'Maçãs Gala',
                categoria: 'frutas',
                quantidade: 50,
                unidade: 'kg',
                prioridade: 'media',
                status: 'disponivel',
                empresaNome: 'Supermercado Central',
                endereco: 'Av. Presidente Vargas, 1000 - Campina, Belém - PA',
                coordenadas: { lat: -1.4520, lng: -48.4850 },
                dataDisponibilidade: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '2',
                nomeAlimento: 'Pães Franceses',
                categoria: 'paes',
                quantidade: 100,
                unidade: 'unidade',
                prioridade: 'urgente',
                status: 'disponivel',
                empresaNome: 'Padaria do Bairro',
                endereco: 'Rua dos Tamoios, 500 - Batista Campos, Belém - PA',
                coordenadas: { lat: -1.4480, lng: -48.4920 },
                dataDisponibilidade: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '3',
                nomeAlimento: 'Bananas Nanica',
                categoria: 'frutas',
                quantidade: 30,
                unidade: 'kg',
                prioridade: 'alta',
                status: 'disponivel',
                empresaNome: 'Feira do Açaí',
                endereco: 'Av. Nazaré, 800 - Nazaré, Belém - PA',
                coordenadas: { lat: -1.4600, lng: -48.4800 },
                dataDisponibilidade: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '4',
                nomeAlimento: 'Leite Integral',
                categoria: 'laticinios',
                quantidade: 20,
                unidade: 'l',
                prioridade: 'media',
                status: 'disponivel',
                empresaNome: 'Laticínios Paraense',
                endereco: 'Rua Boaventura da Silva, 200 - Reduto, Belém - PA',
                coordenadas: { lat: -1.4650, lng: -48.5000 },
                dataDisponibilidade: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '5',
                nomeAlimento: 'Cenouras',
                categoria: 'verduras',
                quantidade: 25,
                unidade: 'kg',
                prioridade: 'baixa',
                status: 'disponivel',
                empresaNome: 'Hortifruti Amazônia',
                endereco: 'Av. Almirante Barroso, 1500 - Marco, Belém - PA',
                coordenadas: { lat: -1.4400, lng: -48.4750 },
                dataDisponibilidade: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        this.alimentosData = sampleAlimentos;
        
        // Salvar dados de exemplo
        const allAlimentos = JSON.parse(localStorage.getItem('feedhope_alimentos') || '[]');
        allAlimentos.push(...sampleAlimentos);
        localStorage.setItem('feedhope_alimentos', JSON.stringify(allAlimentos));
    }
    
    static initMap() {
        // Inicializar mapa
        this.map = new google.maps.Map(document.getElementById('mapa'), {
            zoom: 12,
            center: this.centerCoords,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        
        // Inicializar serviços de direção
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer({
            draggable: true,
            panel: document.getElementById('rotaInfo')
        });
        this.directionsRenderer.setMap(this.map);
        
        // Adicionar marcador da UFRA (centro de coleta)
        this.addUfraMarker();
        
        // Carregar pontos no mapa
        this.loadMapPoints();
    }
    
    static addUfraMarker() {
        const ufraMarker = new google.maps.Marker({
            position: this.centerCoords,
            map: this.map,
            title: 'UFRA - Centro de Coleta',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="#28a745" stroke="white" stroke-width="2"/>
                        <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">🎓</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(40, 40)
            }
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h6><i class="fas fa-university text-success"></i> UFRA - Centro de Coleta</h6>
                    <p class="mb-1"><strong>Endereço:</strong> Av. Presidente Tancredo Neves, 2501</p>
                    <p class="mb-1"><strong>Bairro:</strong> Terra Firme, Belém - PA</p>
                    <p class="mb-0"><strong>Horário:</strong> 08:00 - 17:00</p>
                </div>
            `
        });
        
        ufraMarker.addListener('click', () => {
            infoWindow.open(this.map, ufraMarker);
        });
    }
    
    static loadMapPoints() {
        // Limpar marcadores existentes
        this.clearMarkers();
        
        const tipoVisualizacao = document.getElementById('tipoVisualizacao').value;
        
        switch (tipoVisualizacao) {
            case 'alimentos':
                this.loadAlimentosMarkers();
                break;
            case 'empresas':
                this.loadEmpresasMarkers();
                break;
            case 'rotas':
                this.loadRotasMarkers();
                break;
            case 'densidade':
                this.loadDensityMap();
                break;
        }
        
        this.updateStatistics();
    }
    
    static loadAlimentosMarkers() {
        const filteredAlimentos = this.getFilteredAlimentos();
        
        filteredAlimentos.forEach(alimento => {
            if (!alimento.coordenadas) return;
            
            const marker = new google.maps.Marker({
                position: alimento.coordenadas,
                map: this.map,
                title: alimento.nomeAlimento,
                icon: this.getAlimentoIcon(alimento)
            });
            
            const infoWindow = new google.maps.InfoWindow({
                content: this.createAlimentoInfoWindow(alimento)
            });
            
            marker.addListener('click', () => {
                infoWindow.open(this.map, marker);
            });
            
            this.markers.push(marker);
        });
    }
    
    static getAlimentoIcon(alimento) {
        const colors = {
            'urgente': '#dc3545',
            'alta': '#fd7e14',
            'media': '#ffc107',
            'baixa': '#28a745'
        };
        
        const color = colors[alimento.prioridade] || '#6c757d';
        
        return {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2"/>
                    <text x="15" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${this.getCategoryEmoji(alimento.categoria)}</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30)
        };
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
    
    static createAlimentoInfoWindow(alimento) {
        const prioridadeBadge = this.getPriorityBadge(alimento.prioridade);
        const dataDisp = new Date(alimento.dataDisponibilidade).toLocaleDateString('pt-BR');
        
        return `
            <div style="padding: 10px; max-width: 300px;">
                <h6><i class="fas fa-apple-alt text-success"></i> ${alimento.nomeAlimento}</h6>
                <p class="mb-1"><strong>Empresa:</strong> ${alimento.empresaNome}</p>
                <p class="mb-1"><strong>Quantidade:</strong> ${alimento.quantidade} ${alimento.unidade}</p>
                <p class="mb-1"><strong>Prioridade:</strong> ${prioridadeBadge}</p>
                <p class="mb-1"><strong>Disponível até:</strong> ${dataDisp}</p>
                <p class="mb-2"><strong>Endereço:</strong> ${alimento.endereco}</p>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-primary" onclick="MapaLogistica.viewAlimentoDetails('${alimento.id}')">
                        Ver Detalhes
                    </button>
                    <button class="btn btn-sm btn-success" onclick="MapaLogistica.addToRoute('${alimento.id}')">
                        Adicionar à Rota
                    </button>
                </div>
            </div>
        `;
    }
    
    static getPriorityBadge(prioridade) {
        const badges = {
            'urgente': '<span class="badge bg-danger">Urgente</span>',
            'alta': '<span class="badge bg-warning">Alta</span>',
            'media': '<span class="badge bg-info">Média</span>',
            'baixa': '<span class="badge bg-success">Baixa</span>'
        };
        return badges[prioridade] || '<span class="badge bg-secondary">-</span>';
    }
    
    static getFilteredAlimentos() {
        return this.alimentosData.filter(alimento => {
            // Filtro por categoria
            if (!this.filters.categorias.includes(alimento.categoria)) {
                return false;
            }
            
            // Filtro por prioridade
            if (this.filters.prioridade && alimento.prioridade !== this.filters.prioridade) {
                return false;
            }
            
            // Filtro por quantidade mínima
            if (alimento.quantidade < this.filters.quantidadeMinima) {
                return false;
            }
            
            // Filtro por data
            if (this.filters.dataInicio || this.filters.dataFim) {
                const dataAlimento = new Date(alimento.dataDisponibilidade);
                
                if (this.filters.dataInicio && dataAlimento < new Date(this.filters.dataInicio)) {
                    return false;
                }
                
                if (this.filters.dataFim && dataAlimento > new Date(this.filters.dataFim)) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    static clearMarkers() {
        this.markers.forEach(marker => {
            marker.setMap(null);
        });
        this.markers = [];
    }
    
    static initControls() {
        // Controle de tipo de visualização
        document.getElementById('tipoVisualizacao').addEventListener('change', () => {
            this.loadMapPoints();
        });
        
        // Controle de raio de coleta
        document.getElementById('raioColeta').addEventListener('change', () => {
            this.updateCollectionRadius();
        });
        
        // Controle de prioridade
        document.getElementById('prioridadeFiltro').addEventListener('change', () => {
            this.filters.prioridade = document.getElementById('prioridadeFiltro').value;
            this.loadMapPoints();
            this.renderPontosTable();
        });
    }
    
    static initFilters() {
        // Sincronizar slider de quantidade
        const slider = document.getElementById('quantidadeMinima');
        const value = document.getElementById('quantidadeMinimaValue');
        
        if (slider && value) {
            slider.addEventListener('input', () => {
                value.value = slider.value;
                this.filters.quantidadeMinima = parseInt(slider.value);
            });
        }
        
        // Definir datas padrão
        const hoje = new Date();
        const umMesDepois = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const dataInicio = document.getElementById('dataInicio');
        const dataFim = document.getElementById('dataFim');
        
        if (dataInicio) dataInicio.value = hoje.toISOString().split('T')[0];
        if (dataFim) dataFim.value = umMesDepois.toISOString().split('T')[0];
    }
    
    static updateStatistics() {
        const filteredAlimentos = this.getFilteredAlimentos();
        const totalPontos = filteredAlimentos.length;
        
        document.getElementById('totalPontos').textContent = totalPontos;
        
        // Calcular distância total estimada
        let distanciaTotal = 0;
        if (filteredAlimentos.length > 1) {
            for (let i = 0; i < filteredAlimentos.length - 1; i++) {
                const dist = this.calculateDistance(
                    filteredAlimentos[i].coordenadas,
                    filteredAlimentos[i + 1].coordenadas
                );
                distanciaTotal += dist;
            }
        }
        
        document.getElementById('distanciaTotal').textContent = distanciaTotal.toFixed(1) + ' km';
    }
    
    static calculateDistance(coord1, coord2) {
        const R = 6371; // Raio da Terra em km
        const dLat = this.toRad(coord2.lat - coord1.lat);
        const dLon = this.toRad(coord2.lng - coord1.lng);
        const lat1 = this.toRad(coord1.lat);
        const lat2 = this.toRad(coord2.lat);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
    
    static toRad(value) {
        return value * Math.PI / 180;
    }
    
    static renderPontosTable() {
        const tbody = document.getElementById('pontosTableBody');
        const filteredAlimentos = this.getFilteredAlimentos();
        
        tbody.innerHTML = '';
        
        if (filteredAlimentos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        <i class="fas fa-map-pin fa-2x mb-2"></i><br>
                        Nenhum ponto encontrado com os filtros aplicados
                    </td>
                </tr>
            `;
            return;
        }
        
        filteredAlimentos.forEach(alimento => {
            const row = this.createPontoRow(alimento);
            tbody.appendChild(row);
        });
    }
    
    static createPontoRow(alimento) {
        const tr = document.createElement('tr');
        
        const distancia = this.calculateDistance(this.centerCoords, alimento.coordenadas);
        const prioridadeBadge = this.getPriorityBadge(alimento.prioridade);
        
        tr.innerHTML = `
            <td>
                <div>
                    <div class="fw-bold">${alimento.empresaNome}</div>
                    <small class="text-muted">${alimento.endereco}</small>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <span class="me-2">${this.getCategoryEmoji(alimento.categoria)}</span>
                    ${alimento.nomeAlimento}
                </div>
            </td>
            <td>${alimento.quantidade} ${alimento.unidade}</td>
            <td>${prioridadeBadge}</td>
            <td>${distancia.toFixed(1)} km</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="MapaLogistica.centerOnPoint('${alimento.id}')" title="Centralizar no Mapa">
                        <i class="fas fa-crosshairs"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="MapaLogistica.viewAlimentoDetails('${alimento.id}')" title="Ver Detalhes">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="MapaLogistica.addToRoute('${alimento.id}')" title="Adicionar à Rota">
                        <i class="fas fa-route"></i>
                    </button>
                </div>
            </td>
        `;
        
        return tr;
    }
    
    static centerOnPoint(alimentoId) {
        const alimento = this.alimentosData.find(a => a.id === alimentoId);
        if (alimento && alimento.coordenadas) {
            this.map.setCenter(alimento.coordenadas);
            this.map.setZoom(15);
        }
    }
    
    static viewAlimentoDetails(alimentoId) {
        const alimento = this.alimentosData.find(a => a.id === alimentoId);
        if (!alimento) return;
        
        const modal = document.getElementById('modalDetalhesPonto');
        const content = document.getElementById('modalDetalhesPontoContent');
        
        const dataDisp = new Date(alimento.dataDisponibilidade).toLocaleDateString('pt-BR');
        const distancia = this.calculateDistance(this.centerCoords, alimento.coordenadas);
        
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Informações do Alimento</h6>
                    <table class="table table-sm">
                        <tr><td><strong>Nome:</strong></td><td>${alimento.nomeAlimento}</td></tr>
                        <tr><td><strong>Categoria:</strong></td><td>${this.getCategoryEmoji(alimento.categoria)} ${alimento.categoria}</td></tr>
                        <tr><td><strong>Quantidade:</strong></td><td>${alimento.quantidade} ${alimento.unidade}</td></tr>
                        <tr><td><strong>Prioridade:</strong></td><td>${this.getPriorityBadge(alimento.prioridade)}</td></tr>
                        <tr><td><strong>Disponível até:</strong></td><td>${dataDisp}</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6>Localização</h6>
                    <table class="table table-sm">
                        <tr><td><strong>Empresa:</strong></td><td>${alimento.empresaNome}</td></tr>
                        <tr><td><strong>Endereço:</strong></td><td>${alimento.endereco}</td></tr>
                        <tr><td><strong>Distância da UFRA:</strong></td><td>${distancia.toFixed(1)} km</td></tr>
                        <tr><td><strong>Tempo estimado:</strong></td><td>${Math.ceil(distancia * 3)} min</td></tr>
                    </table>
                </div>
            </div>
            ${alimento.observacoesColeta ? `
                <div class="mt-3">
                    <h6>Observações para Coleta</h6>
                    <p class="text-muted">${alimento.observacoesColeta}</p>
                </div>
            ` : ''}
        `;
        
        // Configurar botão de navegação
        document.getElementById('btnNavegar').onclick = () => {
            this.navigateToPoint(alimento.coordenadas);
        };
        
        new bootstrap.Modal(modal).show();
    }
    
    static navigateToPoint(coordenadas) {
        // Simular navegação (em produção, abriria Google Maps ou Waze)
        const url = `https://www.google.com/maps/dir/${this.centerCoords.lat},${this.centerCoords.lng}/${coordenadas.lat},${coordenadas.lng}`;
        window.open(url, '_blank');
    }
    
    static addToRoute(alimentoId) {
        // Funcionalidade para adicionar ponto à rota otimizada
        this.showToast('Ponto adicionado à rota de coleta!', 'success');
        // Aqui seria implementada a lógica de otimização de rota
    }
    
    static optimizeRoute() {
        const filteredAlimentos = this.getFilteredAlimentos();
        
        if (filteredAlimentos.length < 2) {
            this.showToast('É necessário ter pelo menos 2 pontos para otimizar a rota.', 'warning');
            return;
        }
        
        // Simular otimização de rota
        this.showToast('Calculando rota otimizada...', 'info');
        
        setTimeout(() => {
            // Ordenar por prioridade e proximidade
            const rotaOtimizada = this.calculateOptimalRoute(filteredAlimentos);
            this.displayOptimizedRoute(rotaOtimizada);
            this.showToast('Rota otimizada calculada com sucesso!', 'success');
        }, 2000);
    }
    
    static calculateOptimalRoute(alimentos) {
        // Algoritmo simples de otimização (nearest neighbor)
        const rota = [];
        let pontoAtual = this.centerCoords;
        let alimentosRestantes = [...alimentos];
        
        while (alimentosRestantes.length > 0) {
            let menorDistancia = Infinity;
            let proximoIndice = 0;
            
            alimentosRestantes.forEach((alimento, index) => {
                const distancia = this.calculateDistance(pontoAtual, alimento.coordenadas);
                if (distancia < menorDistancia) {
                    menorDistancia = distancia;
                    proximoIndice = index;
                }
            });
            
            const proximoAlimento = alimentosRestantes.splice(proximoIndice, 1)[0];
            rota.push(proximoAlimento);
            pontoAtual = proximoAlimento.coordenadas;
        }
        
        return rota;
    }
    
    static displayOptimizedRoute(rota) {
        const rotaInfo = document.getElementById('rotaInfo');
        
        let distanciaTotal = 0;
        let tempoTotal = 0;
        
        // Calcular distância total
        let pontoAnterior = this.centerCoords;
        rota.forEach(alimento => {
            const distancia = this.calculateDistance(pontoAnterior, alimento.coordenadas);
            distanciaTotal += distancia;
            tempoTotal += Math.ceil(distancia * 3); // 3 min por km estimado
            pontoAnterior = alimento.coordenadas;
        });
        
        // Voltar para UFRA
        distanciaTotal += this.calculateDistance(pontoAnterior, this.centerCoords);
        tempoTotal += Math.ceil(this.calculateDistance(pontoAnterior, this.centerCoords) * 3);
        
        rotaInfo.innerHTML = `
            <div class="mb-3">
                <h6><i class="fas fa-route text-success"></i> Rota Otimizada</h6>
                <div class="alert alert-info">
                    <div class="row text-center">
                        <div class="col-6">
                            <strong>${rota.length}</strong><br>
                            <small>Pontos</small>
                        </div>
                        <div class="col-6">
                            <strong>${distanciaTotal.toFixed(1)} km</strong><br>
                            <small>Distância</small>
                        </div>
                    </div>
                    <div class="row text-center mt-2">
                        <div class="col-12">
                            <strong>${Math.ceil(tempoTotal / 60)}h ${tempoTotal % 60}min</strong><br>
                            <small>Tempo Estimado</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="route-steps">
                <div class="step mb-2">
                    <div class="d-flex align-items-center">
                        <div class="step-number bg-success text-white rounded-circle me-2" style="width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                            0
                        </div>
                        <div>
                            <strong>UFRA - Início</strong><br>
                            <small class="text-muted">Ponto de partida</small>
                        </div>
                    </div>
                </div>
                
                ${rota.map((alimento, index) => `
                    <div class="step mb-2">
                        <div class="d-flex align-items-center">
                            <div class="step-number bg-primary text-white rounded-circle me-2" style="width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                                ${index + 1}
                            </div>
                            <div>
                                <strong>${alimento.empresaNome}</strong><br>
                                <small class="text-muted">${alimento.nomeAlimento} - ${this.getPriorityBadge(alimento.prioridade)}</small>
                            </div>
                        </div>
                    </div>
                `).join('')}
                
                <div class="step mb-2">
                    <div class="d-flex align-items-center">
                        <div class="step-number bg-success text-white rounded-circle me-2" style="width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                            <i class="fas fa-home" style="font-size: 10px;"></i>
                        </div>
                        <div>
                            <strong>UFRA - Retorno</strong><br>
                            <small class="text-muted">Fim da coleta</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-3">
                <button class="btn btn-success btn-sm w-100" onclick="MapaLogistica.startNavigation()">
                    <i class="fas fa-play me-1"></i>
                    Iniciar Navegação
                </button>
            </div>
        `;
        
        // Atualizar estatísticas
        document.getElementById('distanciaTotal').textContent = distanciaTotal.toFixed(1) + ' km';
    }
    
    static startNavigation() {
        this.showToast('Navegação iniciada! Siga as instruções da rota otimizada.', 'success');
    }
    
    static centerMap() {
        this.map.setCenter(this.centerCoords);
        this.map.setZoom(12);
    }
    
    static toggleTraffic() {
        const toggleText = document.getElementById('trafficToggleText');
        
        if (this.showingTraffic) {
            // Esconder trânsito (simulado)
            this.showingTraffic = false;
            toggleText.textContent = 'Mostrar Trânsito';
            this.showToast('Camada de trânsito ocultada', 'info');
        } else {
            // Mostrar trânsito (simulado)
            this.showingTraffic = true;
            toggleText.textContent = 'Ocultar Trânsito';
            this.showToast('Camada de trânsito exibida', 'info');
        }
    }
    
    static changeMapType(type) {
        // Simular mudança de tipo de mapa
        this.showToast(`Tipo de mapa alterado para: ${type}`, 'info');
    }
    
    static applyFilters() {
        // Coletar filtros do modal
        this.filters.categorias = [];
        
        ['frutas', 'verduras', 'paes', 'laticinios', 'carnes', 'outros'].forEach(categoria => {
            const checkbox = document.getElementById(`filtro${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`);
            if (checkbox && checkbox.checked) {
                this.filters.categorias.push(categoria);
            }
        });
        
        this.filters.dataInicio = document.getElementById('dataInicio').value;
        this.filters.dataFim = document.getElementById('dataFim').value;
        this.filters.quantidadeMinima = parseInt(document.getElementById('quantidadeMinima').value);
        
        // Aplicar filtros
        this.loadMapPoints();
        this.renderPontosTable();
        
        this.showToast('Filtros aplicados com sucesso!', 'success');
    }
    
    static resetFilters() {
        // Resetar todos os filtros
        this.filters = {
            categorias: ['frutas', 'verduras', 'paes', 'laticinios', 'carnes', 'outros'],
            prioridade: '',
            dataInicio: '',
            dataFim: '',
            quantidadeMinima: 0
        };
        
        // Resetar interface
        ['frutas', 'verduras', 'paes', 'laticinios', 'carnes', 'outros'].forEach(categoria => {
            const checkbox = document.getElementById(`filtro${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`);
            if (checkbox) checkbox.checked = true;
        });
        
        document.getElementById('dataInicio').value = '';
        document.getElementById('dataFim').value = '';
        document.getElementById('quantidadeMinima').value = '0';
        document.getElementById('quantidadeMinimaValue').value = '0';
        document.getElementById('prioridadeFiltro').value = '';
        
        // Aplicar filtros resetados
        this.loadMapPoints();
        this.renderPontosTable();
        
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
window.MapaLogistica = MapaLogistica;

