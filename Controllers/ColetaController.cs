using FeedHope.Data;
using FeedHope.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace FeedHope.Controllers
{
    public class ColetaController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ColetaController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Coleta
        public async Task<IActionResult> Index(string? status, string? prioridade, string? searchString)
        {
            var coletasQuery = _context.Coletas.Include(c => c.Empresa).AsQueryable();

            // Filtros
            if (!string.IsNullOrEmpty(status))
            {
                coletasQuery = coletasQuery.Where(c => c.Status == status);
            }

            if (!string.IsNullOrEmpty(prioridade))
            {
                coletasQuery = coletasQuery.Where(c => c.Prioridade == prioridade);
            }

            if (!string.IsNullOrEmpty(searchString))
            {
                coletasQuery = coletasQuery.Where(c => 
                    c.Empresa!.Nome.Contains(searchString) || 
                    c.Endereco.Contains(searchString));
            }

            // Ordenar por prioridade e data de solicitação
            coletasQuery = coletasQuery
                .OrderBy(c => c.Prioridade == "Urgente" ? 1 : c.Prioridade == "Alta" ? 2 : c.Prioridade == "Normal" ? 3 : 4)
                .ThenBy(c => c.DataSolicitacao);

            var coletas = await coletasQuery.ToListAsync();

            // ViewBags para filtros
            ViewBag.StatusList = new SelectList(new[] { "Pendente", "Aprovada", "Em Coleta", "Coletada", "Recusada", "Cancelada" });
            ViewBag.PrioridadeList = new SelectList(new[] { "Baixa", "Normal", "Alta", "Urgente" });
            ViewBag.CurrentStatus = status;
            ViewBag.CurrentPrioridade = prioridade;
            ViewBag.CurrentSearch = searchString;

            return View(coletas);
        }

        // GET: Coleta/Pendentes - Interface UFRA para aprovar/recusar
        public async Task<IActionResult> Pendentes()
        {
            var coletasPendentes = await _context.Coletas
                .Include(c => c.Empresa)
                .Include(c => c.AlimentosColeta)
                    .ThenInclude(ac => ac.Alimento)
                .Where(c => c.Status == "Pendente")
                .OrderBy(c => c.Prioridade == "Urgente" ? 1 : c.Prioridade == "Alta" ? 2 : c.Prioridade == "Normal" ? 3 : 4)
                .ThenBy(c => c.DataSolicitacao)
                .ToListAsync();

            return View(coletasPendentes);
        }

        // GET: Coleta/Logistica - Tela de logística das coletas
        public async Task<IActionResult> Logistica()
        {
            var coletasLogistica = await _context.Coletas
                .Include(c => c.Empresa)
                .Where(c => c.Status == "Aprovada" || c.Status == "Em Coleta")
                .OrderBy(c => c.OrdemColeta ?? int.MaxValue)
                .ThenBy(c => c.DataColeta)
                .ToListAsync();

            return View(coletasLogistica);
        }

        // GET: Coleta/Mapa - Visualização em mapa das coletas
        public async Task<IActionResult> Mapa()
        {
            var coletasComCoordenadas = await _context.Coletas
                .Include(c => c.Empresa)
                .Where(c => (c.Status == "Aprovada" || c.Status == "Em Coleta") && 
                           c.Latitude.HasValue && c.Longitude.HasValue)
                .OrderBy(c => c.OrdemColeta ?? int.MaxValue)
                .ToListAsync();

            return View(coletasComCoordenadas);
        }

        // GET: Coleta/Create
        public async Task<IActionResult> Create()
        {
            await PopulateViewBags();
            return View(new ColetaModel());
        }

        // POST: Coleta/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(ColetaModel coleta)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    coleta.DataSolicitacao = DateTime.Now;
                    coleta.Status = "Pendente";

                    _context.Add(coleta);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Solicitação de coleta enviada com sucesso! Aguarde aprovação da UFRA.";
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception)
                {
                    ModelState.AddModelError("", "Erro ao salvar a solicitação de coleta. Tente novamente.");
                }
            }

            await PopulateViewBags();
            return View(coleta);
        }

        // GET: Coleta/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var coleta = await _context.Coletas
                .Include(c => c.Empresa)
                .Include(c => c.AlimentosColeta)
                    .ThenInclude(ac => ac.Alimento)
                .Include(c => c.Destinacoes)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (coleta == null)
            {
                return NotFound();
            }

            return View(coleta);
        }

        // GET: Coleta/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var coleta = await _context.Coletas.FindAsync(id);
            if (coleta == null)
            {
                return NotFound();
            }

            await PopulateViewBags();
            return View(coleta);
        }

        // POST: Coleta/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, ColetaModel coleta)
        {
            if (id != coleta.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(coleta);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Coleta atualizada com sucesso!";
                    return RedirectToAction(nameof(Index));
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!ColetaExists(coleta.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        ModelState.AddModelError("", "Erro de concorrência. A coleta foi modificada por outro usuário.");
                    }
                }
                catch (Exception)
                {
                    ModelState.AddModelError("", "Erro ao atualizar a coleta. Tente novamente.");
                }
            }

            await PopulateViewBags();
            return View(coleta);
        }

        // POST: Coleta/Aprovar/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Aprovar(int id, string responsavelUFRA, DateTime dataColeta, string? observacoes)
        {
            try
            {
                var coleta = await _context.Coletas.FindAsync(id);
                if (coleta != null && coleta.Status == "Pendente")
                {
                    coleta.Status = "Aprovada";
                    coleta.ResponsavelUFRA = responsavelUFRA;
                    coleta.DataAprovacao = DateTime.Now;
                    coleta.DataColeta = dataColeta;
                    if (!string.IsNullOrEmpty(observacoes))
                    {
                        coleta.Observacoes = observacoes;
                    }

                    _context.Update(coleta);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Coleta aprovada com sucesso!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Coleta não encontrada ou não está pendente.";
                }
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Erro ao aprovar a coleta.";
            }

            return RedirectToAction(nameof(Pendentes));
        }

        // POST: Coleta/Recusar/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Recusar(int id, string motivoRecusa)
        {
            try
            {
                var coleta = await _context.Coletas.FindAsync(id);
                if (coleta != null && coleta.Status == "Pendente")
                {
                    coleta.Status = "Recusada";
                    coleta.MotivoRecusa = motivoRecusa;
                    coleta.DataAprovacao = DateTime.Now;

                    _context.Update(coleta);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Coleta recusada.";
                }
                else
                {
                    TempData["ErrorMessage"] = "Coleta não encontrada ou não está pendente.";
                }
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Erro ao recusar a coleta.";
            }

            return RedirectToAction(nameof(Pendentes));
        }

        // POST: Coleta/IniciarColeta/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> IniciarColeta(int id)
        {
            try
            {
                var coleta = await _context.Coletas.FindAsync(id);
                if (coleta != null && coleta.Status == "Aprovada")
                {
                    coleta.Status = "Em Coleta";
                    coleta.DataInicioColeta = DateTime.Now;

                    _context.Update(coleta);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Coleta iniciada!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Coleta não encontrada ou não está aprovada.";
                }
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Erro ao iniciar a coleta.";
            }

            return RedirectToAction(nameof(Logistica));
        }

        // POST: Coleta/ConcluirColeta/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ConcluirColeta(int id, int quantidadeTotalColetada)
        {
            try
            {
                var coleta = await _context.Coletas.FindAsync(id);
                if (coleta != null && coleta.Status == "Em Coleta")
                {
                    coleta.Status = "Coletada";
                    coleta.DataConclusao = DateTime.Now;
                    coleta.QuantidadeTotalColetada = quantidadeTotalColetada;

                    _context.Update(coleta);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Coleta concluída com sucesso!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Coleta não encontrada ou não está em andamento.";
                }
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Erro ao concluir a coleta.";
            }

            return RedirectToAction(nameof(Logistica));
        }

        // POST: Coleta/DefinirOrdemColeta
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DefinirOrdemColeta(int[] coletaIds)
        {
            try
            {
                for (int i = 0; i < coletaIds.Length; i++)
                {
                    var coleta = await _context.Coletas.FindAsync(coletaIds[i]);
                    if (coleta != null)
                    {
                        coleta.OrdemColeta = i + 1;
                        _context.Update(coleta);
                    }
                }

                await _context.SaveChangesAsync();
                TempData["SuccessMessage"] = "Ordem de coleta definida com sucesso!";
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Erro ao definir a ordem de coleta.";
            }

            return RedirectToAction(nameof(Logistica));
        }

        // GET: Coleta/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var coleta = await _context.Coletas
                .Include(c => c.Empresa)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (coleta == null)
            {
                return NotFound();
            }

            return View(coleta);
        }

        // POST: Coleta/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            try
            {
                var coleta = await _context.Coletas
                    .Include(c => c.AlimentosColeta)
                    .Include(c => c.Destinacoes)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (coleta != null)
                {
                    // Verificar se a coleta pode ser excluída
                    if (coleta.Status == "Em Coleta" || coleta.Status == "Coletada")
                    {
                        TempData["ErrorMessage"] = "Não é possível excluir uma coleta que está em andamento ou foi concluída.";
                        return RedirectToAction(nameof(Index));
                    }

                    _context.Coletas.Remove(coleta);
                    await _context.SaveChangesAsync();
                    TempData["SuccessMessage"] = "Coleta excluída com sucesso!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Coleta não encontrada.";
                }
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Erro ao excluir a coleta. Tente novamente.";
            }

            return RedirectToAction(nameof(Index));
        }

        // Método auxiliar para popular ViewBags
        private async Task PopulateViewBags()
        {
            ViewBag.Empresas = new SelectList(await _context.Empresas.Where(e => e.Status == "Ativo").ToListAsync(), "Id", "Nome");
            ViewBag.StatusList = new SelectList(new[] { "Pendente", "Aprovada", "Em Coleta", "Coletada", "Recusada", "Cancelada" });
            ViewBag.PrioridadeList = new SelectList(new[] { "Baixa", "Normal", "Alta", "Urgente" });
        }

        private bool ColetaExists(int id)
        {
            return _context.Coletas.Any(e => e.Id == id);
        }
    }
}

