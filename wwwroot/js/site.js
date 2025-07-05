// ===== FEEDHOPE - JAVASCRIPT PRINCIPAL =====

$(document).ready(function() {
    // Inicializar funcionalidades
    initializeAlerts();
    initializeFormValidation();
    initializeDataTables();
    initializeTooltips();
    initializeAnimations();
    initializeCharts();
    initializeFilters();
    
    console.log('FeedHope - Sistema inicializado com sucesso!');
});

// ===== GERENCIAMENTO DE ALERTAS =====
function initializeAlerts() {
    // Auto-dismiss alerts após 5 segundos
    setTimeout(function() {
        $('.alert').fadeOut('slow');
    }, 5000);
    
    // Limpar formulário quando houver sucesso
    if ($('.alert-success').length) {
        $('.alert-success').closest('form').trigger('reset');
    }
    
    // Animação para novos alertas
    $('.alert').addClass('animate__animated animate__fadeInDown');
}

// ===== VALIDAÇÃO DE FORMULÁRIOS =====
function initializeFormValidation() {
    // Validação em tempo real
    $('input, select, textarea').on('blur', function() {
        validateField($(this));
    });
    
    // Validação antes do submit
    $('form').on('submit', function(e) {
        let isValid = true;
        $(this).find('input[required], select[required], textarea[required]').each(function() {
            if (!validateField($(this))) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            showAlert('Por favor, corrija os erros no formulário.', 'danger');
        } else {
            // Mostrar loading no botão de submit
            const submitBtn = $(this).find('button[type="submit"]');
            submitBtn.prop('disabled', true);
            submitBtn.html('<span class="loading-spinner me-2"></span>Processando...');
        }
    });
}

function validateField(field) {
    const value = field.val().trim();
    const fieldName = field.attr('name');
    let isValid = true;
    let message = '';
    
    // Remover classes de validação anteriores
    field.removeClass('is-valid is-invalid');
    field.next('.invalid-feedback').remove();
    
    // Verificar se é obrigatório
    if (field.prop('required') && !value) {
        isValid = false;
        message = 'Este campo é obrigatório.';
    }
    
    // Validações específicas
    if (value) {
        switch (field.attr('type')) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    message = 'Digite um e-mail válido.';
                }
                break;
                
            case 'date':
                const selectedDate = new Date(value);
                const today = new Date();
                if (fieldName && fieldName.includes('Validade') && selectedDate <= today) {
                    isValid = false;
                    message = 'A data deve ser futura.';
                }
                break;
                
            case 'number':
                if (parseFloat(value) <= 0) {
                    isValid = false;
                    message = 'O valor deve ser maior que zero.';
                }
                break;
        }
        
        // Validação de CNPJ
        if (fieldName === 'CNPJ' && !validateCNPJ(value)) {
            isValid = false;
            message = 'CNPJ inválido.';
        }
    }
    
    // Aplicar classes de validação
    if (isValid) {
        field.addClass('is-valid');
    } else {
        field.addClass('is-invalid');
        field.after(`<div class="invalid-feedback">${message}</div>`);
    }
    
    return isValid;
}

function validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Eliminar CNPJs inválidos conhecidos
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validar DVs
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

// ===== DATATABLES =====
function initializeDataTables() {
    if ($.fn.DataTable) {
        $('.data-table').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
            },
            responsive: true,
            pageLength: 25,
            order: [[0, 'desc']],
            columnDefs: [
                { orderable: false, targets: 'no-sort' }
            ]
        });
    }
}

// ===== TOOLTIPS E POPOVERS =====
function initializeTooltips() {
    // Inicializar tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();
    
    // Inicializar popovers
    $('[data-bs-toggle="popover"]').popover();
    
    // Adicionar tooltips automáticos para botões de ação
    $('.btn-sm').each(function() {
        if (!$(this).attr('title') && !$(this).attr('data-bs-original-title')) {
            const text = $(this).text().trim() || $(this).find('i').attr('class');
            if (text) {
                $(this).attr('title', text).tooltip();
            }
        }
    });
}

// ===== ANIMAÇÕES =====
function initializeAnimations() {
    // Animação de entrada para cards
    $('.card').addClass('fade-in-up');
    
    // Animação de hover para botões
    $('.btn').hover(
        function() {
            $(this).addClass('animate__animated animate__pulse');
        },
        function() {
            $(this).removeClass('animate__animated animate__pulse');
        }
    );
    
    // Scroll suave para âncoras
    $('a[href^="#"]').on('click', function(event) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 100
            }, 1000);
        }
    });
}

// ===== GRÁFICOS =====
function initializeCharts() {
    // Configuração padrão para Chart.js
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.color = '#333';
        Chart.defaults.plugins.legend.position = 'bottom';
    }
}

// ===== FILTROS =====
function initializeFilters() {
    // Filtro em tempo real para tabelas
    $('#searchInput').on('keyup', function() {
        const value = $(this).val().toLowerCase();
        $('.filterable-table tbody tr').filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
    
    // Filtros de status
    $('.status-filter').on('change', function() {
        const status = $(this).val();
        const table = $(this).data('table');
        
        if (status === '') {
            $(`${table} tbody tr`).show();
        } else {
            $(`${table} tbody tr`).hide();
            $(`${table} tbody tr[data-status="${status}"]`).show();
        }
    });
}

// ===== FUNÇÕES UTILITÁRIAS =====
function showAlert(message, type = 'info', duration = 5000) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show animate__animated animate__fadeInDown" role="alert">
            <i class="fas fa-${getAlertIcon(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        </div>
    `;
    
    $('.container-fluid').prepend(alertHtml);
    
    setTimeout(function() {
        $('.alert').first().fadeOut('slow', function() {
            $(this).remove();
        });
    }, duration);
}

function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle',
        'danger': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// ===== MÁSCARAS DE INPUT =====
function applyMasks() {
    // Máscara para CNPJ
    $('.cnpj-mask').mask('00.000.000/0000-00');
    
    // Máscara para telefone
    $('.phone-mask').mask('(00) 00000-0000');
    
    // Máscara para CEP
    $('.cep-mask').mask('00000-000');
}

// ===== CONFIRMAÇÕES =====
function confirmDelete(message = 'Tem certeza que deseja excluir este item?') {
    return confirm(message);
}

$('.delete-confirm').on('click', function(e) {
    if (!confirmDelete()) {
        e.preventDefault();
    }
});

// ===== LOADING STATES =====
function showLoading(element) {
    const $element = $(element);
    $element.prop('disabled', true);
    $element.html('<span class="loading-spinner me-2"></span>Carregando...');
}

function hideLoading(element, originalText) {
    const $element = $(element);
    $element.prop('disabled', false);
    $element.html(originalText);
}

// ===== AJAX HELPERS =====
function makeAjaxRequest(url, method = 'GET', data = null) {
    return $.ajax({
        url: url,
        method: method,
        data: data,
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        }
    });
}

// ===== EXPORT FUNCTIONS =====
function exportToCSV(tableId, filename = 'dados.csv') {
    const table = document.getElementById(tableId);
    const rows = Array.from(table.querySelectorAll('tr'));
    
    const csvContent = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => `"${cell.textContent.trim()}"`).join(',');
    }).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ===== THEME TOGGLE (FUTURO) =====
function toggleTheme() {
    // Implementação futura para modo escuro
    console.log('Toggle theme - funcionalidade futura');
}

// ===== NOTIFICAÇÕES =====
function showNotification(title, message, type = 'info') {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '/favicon.png'
        });
    }
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ===== INICIALIZAÇÃO FINAL =====
$(window).on('load', function() {
    // Aplicar máscaras se a biblioteca estiver disponível
    if ($.fn.mask) {
        applyMasks();
    }
    
    // Solicitar permissão para notificações
    requestNotificationPermission();
    
    // Remover loading inicial se existir
    $('.initial-loading').fadeOut();
});

// ===== TRATAMENTO DE ERROS GLOBAIS =====
window.addEventListener('error', function(e) {
    console.error('Erro JavaScript:', e.error);
    // Em produção, enviar erro para serviço de monitoramento
});

// ===== PERFORMANCE MONITORING =====
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Tempo de carregamento:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
        }, 0);
    });
}

