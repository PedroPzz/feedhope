using FeedHope.Data;
using FeedHope.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FeedHope.Controllers
{
    public class RelatorioController : Controller
    {
        private readonly ApplicationDbContext _context;

        public RelatorioController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Relatorio - Dashboard principal de relatórios
        public async Task<IActionResult> Index()
        {
            // Estatísticas gerais
            var totalEmpresas = await _context.Empresas.CountAsync();
            var empresasAtivas = await _context.Empresas.CountAsync(e => e.Status == "Ativo");
            var totalAlimentos = await _context.Alimentos.CountAsync();
            var alimentosDisponiveis = await _context.Alimentos.CountAsync(a => a.Status == "Disponível");
            var totalColetas = await _context.Coletas.CountAsync();
            var coletasConcluidas = await _context.Coletas.CountAsync(c => c.Status == "Coletada");
            var totalDestinacoes = await _context.Destinacoes.CountAsync();
            var destinacoesConcluidas = await _context.Destinacoes.CountAsync(d => d.Status == "Concluída");

            // Quantidade total coletada
            var quantidadeTotalColetada = await _context.Coletas
                .Where(c => c.Status == "Coletada" && c.QuantidadeTotalColetada.HasValue)
                .SumAsync(c => c.QuantidadeTotalColetada!.Value);

            // Beneficiários atendidos
            var totalBeneficiarios = await _context.Destinacoes
                .Where(d => d.Status == "Concluída" && d.BeneficiariosEstimados.HasValue)
                .SumAsync(d => d.BeneficiariosEstimados!.Value);

            ViewBag.TotalEmpresas = totalEmpresas;
            ViewBag.EmpresasAtivas = empresasAtivas;
            ViewBag.TotalAlimentos = totalAlimentos;
            ViewBag.AlimentosDisponiveis = alimentosDisponiveis;
            ViewBag.TotalColetas = totalColetas;
            ViewBag.ColetasConcluidas = coletasConcluidas;
            ViewBag.TotalDestinacoes = totalDestinacoes;
            ViewBag.DestinacoesConcluidas = destinacoesConcluidas;
            ViewBag.QuantidadeTotalColetada = quantidadeTotalColetada;
            ViewBag.TotalBeneficiarios = totalBeneficiarios;

            return View();
        }

        // GET: Relatorio/ImpactoAmbiental
        public async Task<IActionResult> ImpactoAmbiental()
        {
            // Calcular impacto ambiental baseado na quantidade coletada
            var quantidadeTotalColetada = await _context.Coletas
                .Where(c => c.Status == "Coletada" && c.QuantidadeTotalColetada.HasValue)
                .SumAsync(c => c.QuantidadeTotalColetada!.Value);

            // Estimativas de impacto ambiental
            var co2Evitado = quantidadeTotalColetada * 2.5; // kg de CO2 evitado por kg de alimento
            var aguaEconomizada = quantidadeTotalColetada * 1000; // litros de água economizada
            var energiaEconomizada = quantidadeTotalColetada * 3.3; // kWh economizada

            // Dados por mês para gráficos
            var dadosPorMes = await _context.Coletas
                .Where(c => c.Status == "Coletada" && c.DataConclusao.HasValue)
                .GroupBy(c => new { c.DataConclusao!.Value.Year, c.DataConclusao!.Value.Month })
                .Select(g => new
                {
                    Ano = g.Key.Year,
                    Mes = g.Key.Month,
                    Quantidade = g.Sum(c => c.QuantidadeTotalColetada ?? 0),
                    NumeroColetas = g.Count()
                })
                .OrderBy(x => x.Ano).ThenBy(x => x.Mes)
                .ToListAsync();

            ViewBag.QuantidadeTotalColetada = quantidadeTotalColetada;
            ViewBag.CO2Evitado = co2Evitado;
            ViewBag.AguaEconomizada = aguaEconomizada;
            ViewBag.EnergiaEconomizada = energiaEconomizada;
            ViewBag.DadosPorMes = dadosPorMes;

            return View();
        }

        // GET: Relatorio/QuantidadeColetada
        public async Task<IActionResult> QuantidadeColetada(DateTime? dataInicio, DateTime? dataFim)
        {
            // Definir período padrão (últimos 6 meses)
            if (!dataInicio.HasValue)
                dataInicio = DateTime.Now.AddMonths(-6);
            if (!dataFim.HasValue)
                dataFim = DateTime.Now;

            // Dados de coletas no período
            var coletasQuery = _context.Coletas
                .Include(c => c.Empresa)
                .Where(c => c.Status == "Coletada" && 
                           c.DataConclusao.HasValue &&
                           c.DataConclusao >= dataInicio && 
                           c.DataConclusao <= dataFim);

            var coletas = await coletasQuery.ToListAsync();

            // Estatísticas por empresa
            var estatisticasPorEmpresa = await coletasQuery
                .GroupBy(c => new { c.EmpresaId, c.Empresa!.Nome })
                .Select(g => new
                {
                    EmpresaId = g.Key.EmpresaId,
                    NomeEmpresa = g.Key.Nome,
                    TotalColetas = g.Count(),
                    QuantidadeTotal = g.Sum(c => c.QuantidadeTotalColetada ?? 0)
                })
                .OrderByDescending(x => x.QuantidadeTotal)
                .ToListAsync();

            // Dados por tipo de alimento
            var alimentosPorTipo = await _context.AlimentosColeta
                .Include(ac => ac.Alimento)
                .Include(ac => ac.Coleta)
                .Where(ac => ac.Coleta!.Status == "Coletada" &&
                            ac.Coleta.DataConclusao.HasValue &&
                            ac.Coleta.DataConclusao >= dataInicio &&
                            ac.Coleta.DataConclusao <= dataFim)
                .GroupBy(ac => ac.Alimento!.Tipo)
                .Select(g => new
                {
                    TipoAlimento = g.Key,
                    QuantidadeTotal = g.Sum(ac => ac.QuantidadeColetada)
                })
                .OrderByDescending(x => x.QuantidadeTotal)
                .ToListAsync();

            ViewBag.DataInicio = dataInicio;
            ViewBag.DataFim = dataFim;
            ViewBag.Coletas = coletas;
            ViewBag.EstatisticasPorEmpresa = estatisticasPorEmpresa;
            ViewBag.AlimentosPorTipo = alimentosPorTipo;
            ViewBag.QuantidadeTotal = coletas.Sum(c => c.QuantidadeTotalColetada ?? 0);

            return View();
        }

        // GET: Relatorio/FormasUso
        public async Task<IActionResult> FormasUso()
        {
            // Estatísticas por tipo de destinação
            var destinacoesPorTipo = await _context.Destinacoes
                .Where(d => d.Status == "Concluída")
                .GroupBy(d => d.TipoDestinacao)
                .Select(g => new
                {
                    TipoDestinacao = g.Key,
                    Quantidade = g.Sum(d => d.Quantidade),
                    NumeroDestinacoes = g.Count(),
                    BeneficiariosAtendidos = g.Sum(d => d.BeneficiariosEstimados ?? 0)
                })
                .OrderByDescending(x => x.Quantidade)
                .ToListAsync();

            // Destinações mais recentes
            var destinacoesRecentes = await _context.Destinacoes
                .Include(d => d.Coleta)
                    .ThenInclude(c => c!.Empresa)
                .Where(d => d.Status == "Concluída")
                .OrderByDescending(d => d.DataConclusao)
                .Take(10)
                .ToListAsync();

            // Eficiência por tipo (quantidade por destinação)
            var eficienciaPorTipo = destinacoesPorTipo
                .Select(d => new
                {
                    d.TipoDestinacao,
                    QuantidadeMedia = d.NumeroDestinacoes > 0 ? (double)d.Quantidade / d.NumeroDestinacoes : 0,
                    BeneficiariosPorDestinacao = d.NumeroDestinacoes > 0 ? (double)d.BeneficiariosAtendidos / d.NumeroDestinacoes : 0
                })
                .OrderByDescending(x => x.QuantidadeMedia)
                .ToList();

            ViewBag.DestinacoesPorTipo = destinacoesPorTipo;
            ViewBag.DestinacoesRecentes = destinacoesRecentes;
            ViewBag.EficienciaPorTipo = eficienciaPorTipo;
            ViewBag.TotalBeneficiarios = destinacoesPorTipo.Sum(d => d.BeneficiariosAtendidos);

            return View();
        }

        // GET: Relatorio/Empresas
        public async Task<IActionResult> Empresas()
        {
            // Ranking de empresas por quantidade doada
            var rankingEmpresas = await _context.Empresas
                .Include(e => e.Coletas)
                .Select(e => new
                {
                    e.Id,
                    e.Nome,
                    e.Tipo,
                    e.Status,
                    TotalColetas = e.Coletas.Count(c => c.Status == "Coletada"),
                    QuantidadeTotal = e.Coletas
                        .Where(c => c.Status == "Coletada")
                        .Sum(c => c.QuantidadeTotalColetada ?? 0),
                    UltimaColeta = e.Coletas
                        .Where(c => c.Status == "Coletada")
                        .Max(c => c.DataConclusao)
                })
                .Where(e => e.TotalColetas > 0)
                .OrderByDescending(e => e.QuantidadeTotal)
                .ToListAsync();

            // Estatísticas por tipo de empresa
            var estatisticasPorTipo = await _context.Empresas
                .GroupBy(e => e.Tipo)
                .Select(g => new
                {
                    TipoEmpresa = g.Key,
                    NumeroEmpresas = g.Count(),
                    EmpresasAtivas = g.Count(e => e.Status == "Ativo"),
                    TotalColetas = g.SelectMany(e => e.Coletas).Count(c => c.Status == "Coletada"),
                    QuantidadeTotal = g.SelectMany(e => e.Coletas)
                        .Where(c => c.Status == "Coletada")
                        .Sum(c => c.QuantidadeTotalColetada ?? 0)
                })
                .OrderByDescending(x => x.QuantidadeTotal)
                .ToListAsync();

            ViewBag.RankingEmpresas = rankingEmpresas;
            ViewBag.EstatisticasPorTipo = estatisticasPorTipo;

            return View();
        }

        // GET: Relatorio/Mensal
        public async Task<IActionResult> Mensal(int? ano, int? mes)
        {
            // Definir período padrão (mês atual)
            if (!ano.HasValue)
                ano = DateTime.Now.Year;
            if (!mes.HasValue)
                mes = DateTime.Now.Month;

            var dataInicio = new DateTime(ano.Value, mes.Value, 1);
            var dataFim = dataInicio.AddMonths(1).AddDays(-1);

            // Estatísticas do mês
            var coletasDoMes = await _context.Coletas
                .Include(c => c.Empresa)
                .Where(c => c.DataConclusao.HasValue &&
                           c.DataConclusao >= dataInicio &&
                           c.DataConclusao <= dataFim &&
                           c.Status == "Coletada")
                .ToListAsync();

            var destinacoesDoMes = await _context.Destinacoes
                .Include(d => d.Coleta)
                    .ThenInclude(c => c!.Empresa)
                .Where(d => d.DataConclusao.HasValue &&
                           d.DataConclusao >= dataInicio &&
                           d.DataConclusao <= dataFim &&
                           d.Status == "Concluída")
                .ToListAsync();

            // Comparação com mês anterior
            var mesAnteriorInicio = dataInicio.AddMonths(-1);
            var mesAnteriorFim = mesAnteriorInicio.AddMonths(1).AddDays(-1);

            var coletasMesAnterior = await _context.Coletas
                .Where(c => c.DataConclusao.HasValue &&
                           c.DataConclusao >= mesAnteriorInicio &&
                           c.DataConclusao <= mesAnteriorFim &&
                           c.Status == "Coletada")
                .CountAsync();

            var quantidadeMesAnterior = await _context.Coletas
                .Where(c => c.DataConclusao.HasValue &&
                           c.DataConclusao >= mesAnteriorInicio &&
                           c.DataConclusao <= mesAnteriorFim &&
                           c.Status == "Coletada")
                .SumAsync(c => c.QuantidadeTotalColetada ?? 0);

            ViewBag.Ano = ano;
            ViewBag.Mes = mes;
            ViewBag.DataInicio = dataInicio;
            ViewBag.DataFim = dataFim;
            ViewBag.ColetasDoMes = coletasDoMes;
            ViewBag.DestinacoesDoMes = destinacoesDoMes;
            ViewBag.ColetasMesAnterior = coletasMesAnterior;
            ViewBag.QuantidadeMesAnterior = quantidadeMesAnterior;
            ViewBag.QuantidadeDoMes = coletasDoMes.Sum(c => c.QuantidadeTotalColetada ?? 0);
            ViewBag.BeneficiariosDoMes = destinacoesDoMes.Sum(d => d.BeneficiariosEstimados ?? 0);

            return View();
        }

        // GET: Relatorio/ExportarDados
        public async Task<IActionResult> ExportarDados(string tipo, DateTime? dataInicio, DateTime? dataFim)
        {
            // Definir período padrão se não especificado
            if (!dataInicio.HasValue)
                dataInicio = DateTime.Now.AddMonths(-3);
            if (!dataFim.HasValue)
                dataFim = DateTime.Now;

            switch (tipo?.ToLower())
            {
                case "coletas":
                    return await ExportarColetas(dataInicio.Value, dataFim.Value);
                case "destinacoes":
                    return await ExportarDestinacoes(dataInicio.Value, dataFim.Value);
                case "empresas":
                    return await ExportarEmpresas();
                default:
                    return await ExportarResumo(dataInicio.Value, dataFim.Value);
            }
        }

        private async Task<IActionResult> ExportarColetas(DateTime dataInicio, DateTime dataFim)
        {
            var coletas = await _context.Coletas
                .Include(c => c.Empresa)
                .Where(c => c.DataConclusao.HasValue &&
                           c.DataConclusao >= dataInicio &&
                           c.DataConclusao <= dataFim &&
                           c.Status == "Coletada")
                .Select(c => new
                {
                    c.Id,
                    Empresa = c.Empresa!.Nome,
                    DataColeta = c.DataColeta,
                    DataConclusao = c.DataConclusao,
                    Endereco = c.Endereco,
                    QuantidadeColetada = c.QuantidadeTotalColetada,
                    ResponsavelUFRA = c.ResponsavelUFRA,
                    Observacoes = c.Observacoes
                })
                .ToListAsync();

            return Json(coletas);
        }

        private async Task<IActionResult> ExportarDestinacoes(DateTime dataInicio, DateTime dataFim)
        {
            var destinacoes = await _context.Destinacoes
                .Include(d => d.Coleta)
                    .ThenInclude(c => c!.Empresa)
                .Where(d => d.DataConclusao.HasValue &&
                           d.DataConclusao >= dataInicio &&
                           d.DataConclusao <= dataFim &&
                           d.Status == "Concluída")
                .Select(d => new
                {
                    d.Id,
                    TipoDestinacao = d.TipoDestinacao,
                    Descricao = d.Descricao,
                    Quantidade = d.Quantidade,
                    UnidadeMedida = d.UnidadeMedida,
                    LocalDestinacao = d.LocalDestinacao,
                    BeneficiariosEstimados = d.BeneficiariosEstimados,
                    DataConclusao = d.DataConclusao,
                    EmpresaOrigem = d.Coleta!.Empresa!.Nome
                })
                .ToListAsync();

            return Json(destinacoes);
        }

        private async Task<IActionResult> ExportarEmpresas()
        {
            var empresas = await _context.Empresas
                .Select(e => new
                {
                    e.Id,
                    e.Nome,
                    e.CNPJ,
                    e.Tipo,
                    e.Endereco,
                    e.Contato,
                    e.Email,
                    e.Status,
                    TotalColetas = e.Coletas.Count(c => c.Status == "Coletada"),
                    QuantidadeTotal = e.Coletas
                        .Where(c => c.Status == "Coletada")
                        .Sum(c => c.QuantidadeTotalColetada ?? 0)
                })
                .ToListAsync();

            return Json(empresas);
        }

        private async Task<IActionResult> ExportarResumo(DateTime dataInicio, DateTime dataFim)
        {
            var resumo = new
            {
                Periodo = new { DataInicio = dataInicio, DataFim = dataFim },
                TotalColetas = await _context.Coletas
                    .CountAsync(c => c.DataConclusao.HasValue &&
                                c.DataConclusao >= dataInicio &&
                                c.DataConclusao <= dataFim &&
                                c.Status == "Coletada"),
                QuantidadeTotal = await _context.Coletas
                    .Where(c => c.DataConclusao.HasValue &&
                               c.DataConclusao >= dataInicio &&
                               c.DataConclusao <= dataFim &&
                               c.Status == "Coletada")
                    .SumAsync(c => c.QuantidadeTotalColetada ?? 0),
                TotalDestinacoes = await _context.Destinacoes
                    .CountAsync(d => d.DataConclusao.HasValue &&
                                d.DataConclusao >= dataInicio &&
                                d.DataConclusao <= dataFim &&
                                d.Status == "Concluída"),
                TotalBeneficiarios = await _context.Destinacoes
                    .Where(d => d.DataConclusao.HasValue &&
                               d.DataConclusao >= dataInicio &&
                               d.DataConclusao <= dataFim &&
                               d.Status == "Concluída")
                    .SumAsync(d => d.BeneficiariosEstimados ?? 0)
            };

            return Json(resumo);
        }
    }
}

