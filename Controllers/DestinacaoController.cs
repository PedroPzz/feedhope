using FeedHope.Data;
using FeedHope.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace FeedHope.Controllers
{
    public class DestinacaoController : Controller
    {
        private readonly ApplicationDbContext _context;

        public DestinacaoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Destinacao
        public async Task<IActionResult> Index(string? tipoDestinacao, string? status, string? searchString)
        {
            var destinacoesQuery = _context.Destinacoes
                .Include(d => d.Coleta)
                    .ThenInclude(c => c!.Empresa)
                .AsQueryable();

            // Filtros
            if (!string.IsNullOrEmpty(tipoDestinacao))
            {
                destinacoesQuery = destinacoesQuery.Where(d => d.TipoDestinacao == tipoDestinacao);
            }

            if (!string.IsNullOrEmpty(status))
            {
                destinacoesQuery = destinacoesQuery.Where(d => d.Status == status);
            }

            if (!string.IsNullOrEmpty(searchString))
            {
                destinacoesQuery = destinacoesQuery.Where(d => 
                    d.Descricao.Contains(searchString) || 
                    d.LocalDestinacao!.Contains(searchString) ||
                    d.ResponsavelDestinacao!.Contains(searchString));
            }

            // Ordenar por data de cadastro (mais recentes primeiro)
            destinacoesQuery = destinacoesQuery.OrderByDescending(d => d.DataCadastro);

            var destinacoes = await destinacoesQuery.ToListAsync();

            // ViewBags para filtros
            ViewBag.TipoDestinacaoList = new SelectList(new[] { "Refeitório", "Uso Agrícola", "Compostagem", "Doação Direta", "Ração Animal", "Outro" });
            ViewBag.StatusList = new SelectList(new[] { "Planejada", "Em Andamento", "Concluída" });
            ViewBag.CurrentTipoDestinacao = tipoDestinacao;
            ViewBag.CurrentStatus = status;
            ViewBag.CurrentSearch = searchString;

            return View(destinacoes);
        }

        // GET: Destinacao/Dashboard - Dashboard com estatísticas
        public async Task<IActionResult> Dashboard()
        {
            var totalDestinacoes = await _context.Destinacoes.CountAsync();
            var destinacoesConcluidas = await _context.Destinacoes.CountAsync(d => d.Status == "Concluída");
            var destinacoesEmAndamento = await _context.Destinacoes.CountAsync(d => d.Status == "Em Andamento");
            var totalBeneficiarios = await _context.Destinacoes
                .Where(d => d.Status == "Concluída" && d.BeneficiariosEstimados.HasValue)
                .SumAsync(d => d.BeneficiariosEstimados!.Value);

            // Estatísticas por tipo de destinação
            var estatisticasPorTipo = await _context.Destinacoes
                .Where(d => d.Status == "Concluída")
                .GroupBy(d => d.TipoDestinacao)
                .Select(g => new { Tipo = g.Key, Quantidade = g.Sum(d => d.Quantidade) })
                .ToListAsync();

            ViewBag.TotalDestinacoes = totalDestinacoes;
            ViewBag.DestinacoesConcluidas = destinacoesConcluidas;
            ViewBag.DestinacoesEmAndamento = destinacoesEmAndamento;
            ViewBag.TotalBeneficiarios = totalBeneficiarios;
            ViewBag.EstatisticasPorTipo = estatisticasPorTipo;

            return View();
        }

        // GET: Destinacao/PorColeta/5 - Destinações de uma coleta específica
        public async Task<IActionResult> PorColeta(int coletaId)
        {
            var coleta = await _context.Coletas
                .Include(c => c.Empresa)
                .Include(c => c.Destinacoes)
                .FirstOrDefaultAsync(c => c.Id == coletaId);

            if (coleta == null)
            {
                return NotFound();
            }

            return View(coleta);
        }

        // GET: Destinacao/Create
        public async Task<IActionResult> Create(int? coletaId)
        {
            await PopulateViewBags(coletaId);
            var destinacao = new DestinacaoModel();
            if (coletaId.HasValue)
            {
                destinacao.ColetaId = coletaId.Value;
            }
            return View(destinacao);
        }

        // POST: Destinacao/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(DestinacaoModel destinacao)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // Verificar se a coleta existe e está coletada
                    var coleta = await _context.Coletas.FindAsync(destinacao.ColetaId);
                    if (coleta == null)
                    {
                        ModelState.AddModelError("ColetaId", "Coleta não encontrada.");
                        await PopulateViewBags();
                        return View(destinacao);
                    }

                    if (coleta.Status != "Coletada")
                    {
                        ModelState.AddModelError("ColetaId", "Só é possível criar destinações para coletas já realizadas.");
                        await PopulateViewBags();
                        return View(destinacao);
                    }

                    destinacao.DataCadastro = DateTime.Now;
                    destinacao.Status = "Planejada";

                    _context.Add(destinacao);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Destinação cadastrada com sucesso!";
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception)
                {
                    ModelState.AddModelError("", "Erro ao salvar a destinação. Tente novamente.");
                }
            }

            await PopulateViewBags();
            return View(destinacao);
        }

        // GET: Destinacao/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var destinacao = await _context.Destinacoes
                .Include(d => d.Coleta)
                    .ThenInclude(c => c!.Empresa)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (destinacao == null)
            {
                return NotFound();
            }

            return View(destinacao);
        }

        // GET: Destinacao/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var destinacao = await _context.Destinacoes.FindAsync(id);
            if (destinacao == null)
            {
                return NotFound();
            }

            await PopulateViewBags();
            return View(destinacao);
        }

        // POST: Destinacao/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, DestinacaoModel destinacao)
        {
            if (id != destinacao.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(destinacao);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Destinação atualizada com sucesso!";
                    return RedirectToAction(nameof(Index));
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!DestinacaoExists(destinacao.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        ModelState.AddModelError("", "Erro de concorrência. A destinação foi modificada por outro usuário.");
                    }
                }
                catch (Exception)
                {
                    ModelState.AddModelError("", "Erro ao atualizar a destinação. Tente novamente.");
                }
            }

            await PopulateViewBags();
            return View(destinacao);
        }

        // POST: Destinacao/IniciarDestinacao/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> IniciarDestinacao(int id)
        {
            try
            {
                var destinacao = await _context.Destinacoes.FindAsync(id);
                if (destinacao != null && destinacao.Status == "Planejada")
                {
                    destinacao.Status = "Em Andamento";
                    _context.Update(destinacao);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Destinação iniciada!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Destinação não encontrada ou não está planejada.";
                }
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Erro ao iniciar a destinação.";
            }

            return RedirectToAction(nameof(Index));
        }

        // POST: Destinacao/ConcluirDestinacao/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ConcluirDestinacao(int id, int? beneficiariosReais)
        {
            try
            {
                var destinacao = await _context.Destinacoes.FindAsync(id);
                if (destinacao != null && destinacao.Status == "Em Andamento")
                {
                    destinacao.Status = "Concluída";
                    destinacao.DataConclusao = DateTime.Now;
                    if (beneficiariosReais.HasValue)
                    {
                        destinacao.BeneficiariosEstimados = beneficiariosReais.Value;
                    }

                    _context.Update(destinacao);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Destinação concluída com sucesso!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Destinação não encontrada ou não está em andamento.";
                }
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Erro ao concluir a destinação.";
            }

            return RedirectToAction(nameof(Index));
        }

        // GET: Destinacao/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var destinacao = await _context.Destinacoes
                .Include(d => d.Coleta)
                    .ThenInclude(c => c!.Empresa)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (destinacao == null)
            {
                return NotFound();
            }

            return View(destinacao);
        }

        // POST: Destinacao/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            try
            {
                var destinacao = await _context.Destinacoes.FindAsync(id);
                if (destinacao != null)
                {
                    // Verificar se a destinação pode ser excluída
                    if (destinacao.Status == "Concluída")
                    {
                        TempData["ErrorMessage"] = "Não é possível excluir uma destinação já concluída.";
                        return RedirectToAction(nameof(Index));
                    }

                    _context.Destinacoes.Remove(destinacao);
                    await _context.SaveChangesAsync();
                    TempData["SuccessMessage"] = "Destinação excluída com sucesso!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Destinação não encontrada.";
                }
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Erro ao excluir a destinação. Tente novamente.";
            }

            return RedirectToAction(nameof(Index));
        }

        // Método auxiliar para popular ViewBags
        private async Task PopulateViewBags(int? coletaIdSelecionada = null)
        {
            var coletasColetadas = await _context.Coletas
                .Include(c => c.Empresa)
                .Where(c => c.Status == "Coletada")
                .Select(c => new { c.Id, Nome = $"{c.Empresa!.Nome} - {c.DataColeta:dd/MM/yyyy}" })
                .ToListAsync();

            ViewBag.Coletas = new SelectList(coletasColetadas, "Id", "Nome", coletaIdSelecionada);
            ViewBag.TipoDestinacaoList = new SelectList(new[] { "Refeitório", "Uso Agrícola", "Compostagem", "Doação Direta", "Ração Animal", "Outro" });
            ViewBag.StatusList = new SelectList(new[] { "Planejada", "Em Andamento", "Concluída" });
            ViewBag.UnidadesMedida = new SelectList(new[] { "kg", "litros", "unidades", "caixas", "pacotes" });
        }

        private bool DestinacaoExists(int id)
        {
            return _context.Destinacoes.Any(e => e.Id == id);
        }
    }
}

