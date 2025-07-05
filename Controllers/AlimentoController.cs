using FeedHope.Data;
using FeedHope.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace FeedHope.Controllers
{
    public class AlimentoController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AlimentoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Alimento
        public async Task<IActionResult> Index(string? status, string? empresa, string? searchString)
        {
            var alimentosQuery = _context.Alimentos.Include(a => a.Empresa).AsQueryable();

            // Filtros
            if (!string.IsNullOrEmpty(status))
            {
                alimentosQuery = alimentosQuery.Where(a => a.Status == status);
            }

            if (!string.IsNullOrEmpty(empresa))
            {
                alimentosQuery = alimentosQuery.Where(a => a.Empresa!.Nome.Contains(empresa));
            }

            if (!string.IsNullOrEmpty(searchString))
            {
                alimentosQuery = alimentosQuery.Where(a => 
                    a.Tipo.Contains(searchString) || 
                    a.Descricao.Contains(searchString));
            }

            // Ordenar por data de cadastro (mais recentes primeiro)
            alimentosQuery = alimentosQuery.OrderByDescending(a => a.DataCadastro);

            var alimentos = await alimentosQuery.ToListAsync();

            // ViewBags para filtros
            ViewBag.StatusList = new SelectList(new[] { "Disponível", "Coletado", "Expirado" });
            ViewBag.EmpresasList = new SelectList(await _context.Empresas.ToListAsync(), "Nome", "Nome");
            ViewBag.CurrentStatus = status;
            ViewBag.CurrentEmpresa = empresa;
            ViewBag.CurrentSearch = searchString;

            return View(alimentos);
        }

        // GET: Alimento/Disponiveis - Alimentos disponíveis para coleta
        public async Task<IActionResult> Disponiveis()
        {
            var alimentosDisponiveis = await _context.Alimentos
                .Include(a => a.Empresa)
                .Where(a => a.Status == "Disponível" && a.Validade > DateTime.Now)
                .OrderBy(a => a.Validade) // Ordenar por validade (mais próximos do vencimento primeiro)
                .ToListAsync();

            return View(alimentosDisponiveis);
        }

        // GET: Alimento/ProximosVencimento - Alimentos próximos do vencimento
        public async Task<IActionResult> ProximosVencimento()
        {
            var dataLimite = DateTime.Now.AddDays(3);
            var alimentosProximosVencimento = await _context.Alimentos
                .Include(a => a.Empresa)
                .Where(a => a.Status == "Disponível" && a.Validade <= dataLimite && a.Validade > DateTime.Now)
                .OrderBy(a => a.Validade)
                .ToListAsync();

            return View(alimentosProximosVencimento);
        }

        // GET: Alimento/Create
        public async Task<IActionResult> Create()
        {
            await PopulateViewBags();
            return View(new AlimentoModel());
        }

        // POST: Alimento/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(AlimentoModel alimento)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // Verificar se a data de validade não é no passado
                    if (alimento.Validade <= DateTime.Now)
                    {
                        ModelState.AddModelError("Validade", "A data de validade deve ser futura.");
                        await PopulateViewBags();
                        return View(alimento);
                    }

                    alimento.DataCadastro = DateTime.Now;
                    alimento.Status = "Disponível";

                    _context.Add(alimento);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Alimento cadastrado com sucesso!";
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", $"Erro ao salvar o alimento: {ex.Message}");
                }
            }

            await PopulateViewBags();
            return View(alimento);
        }

        // GET: Alimento/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var alimento = await _context.Alimentos
                .Include(a => a.Empresa)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (alimento == null)
            {
                return NotFound();
            }

            return View(alimento);
        }

        // GET: Alimento/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var alimento = await _context.Alimentos.FindAsync(id);
            if (alimento == null)
            {
                return NotFound();
            }

            await PopulateViewBags();
            return View(alimento);
        }

        // POST: Alimento/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, AlimentoModel alimento)
        {
            if (id != alimento.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    // Verificar se a data de validade não é no passado (apenas para alimentos ainda disponíveis)
                    if (alimento.Status == "Disponível" && alimento.Validade <= DateTime.Now)
                    {
                        ModelState.AddModelError("Validade", "A data de validade deve ser futura para alimentos disponíveis.");
                        await PopulateViewBags();
                        return View(alimento);
                    }

                    _context.Update(alimento);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Alimento atualizado com sucesso!";
                    return RedirectToAction(nameof(Index));
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!AlimentoExists(alimento.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        ModelState.AddModelError("", "Erro de concorrência. O alimento foi modificado por outro usuário.");
                    }
                }
                catch (Exception)
                {
                    ModelState.AddModelError("", "Erro ao atualizar o alimento. Tente novamente.");
                }
            }

            await PopulateViewBags();
            return View(alimento);
        }

        // GET: Alimento/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var alimento = await _context.Alimentos
                .Include(a => a.Empresa)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (alimento == null)
            {
                return NotFound();
            }

            return View(alimento);
        }

        // POST: Alimento/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            try
            {
                var alimento = await _context.Alimentos.FindAsync(id);
                if (alimento != null)
                {
                    // Verificar se o alimento não está em nenhuma coleta
                    var temColeta = await _context.AlimentosColeta.AnyAsync(ac => ac.AlimentoId == id);
                    if (temColeta)
                    {
                        TempData["ErrorMessage"] = "Não é possível excluir este alimento pois ele está vinculado a uma coleta.";
                        return RedirectToAction(nameof(Index));
                    }

                    _context.Alimentos.Remove(alimento);
                    await _context.SaveChangesAsync();
                    TempData["SuccessMessage"] = "Alimento excluído com sucesso!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Alimento não encontrado.";
                }
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Erro ao excluir o alimento. Tente novamente.";
            }

            return RedirectToAction(nameof(Index));
        }

        // POST: Alimento/MarcarComoColetado/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MarcarComoColetado(int id)
        {
            try
            {
                var alimento = await _context.Alimentos.FindAsync(id);
                if (alimento != null)
                {
                    alimento.Status = "Coletado";
                    _context.Update(alimento);
                    await _context.SaveChangesAsync();
                    TempData["SuccessMessage"] = "Alimento marcado como coletado!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Alimento não encontrado.";
                }
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Erro ao atualizar o status do alimento.";
            }

            return RedirectToAction(nameof(Index));
        }

        // Método auxiliar para popular ViewBags
        private async Task PopulateViewBags()
        {
            ViewBag.Empresas = new SelectList(await _context.Empresas.ToListAsync(), "Id", "Nome");
            ViewBag.UnidadesMedida = new SelectList(new[] { "kg", "litros", "unidades", "caixas", "pacotes" });
            ViewBag.StatusList = new SelectList(new[] { "Disponível", "Coletado", "Expirado" });
        }

        private bool AlimentoExists(int id)
        {
            return _context.Alimentos.Any(e => e.Id == id);
        }
    }
}

