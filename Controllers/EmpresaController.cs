using FeedHope.Data;
using FeedHope.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace FeedHope.Controllers
{
    public class EmpresaController : Controller
    {
        private readonly ApplicationDbContext _context;

        public EmpresaController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Empresa
        public async Task<IActionResult> Index(string? status, string? tipo, string? searchString)
        {
            var empresasQuery = _context.Empresas.AsQueryable();

            // Filtros
            if (!string.IsNullOrEmpty(status))
            {
                empresasQuery = empresasQuery.Where(e => e.Status == status);
            }

            if (!string.IsNullOrEmpty(tipo))
            {
                empresasQuery = empresasQuery.Where(e => e.Tipo.Contains(tipo));
            }

            if (!string.IsNullOrEmpty(searchString))
            {
                empresasQuery = empresasQuery.Where(e => 
                    e.Nome.Contains(searchString) || 
                    e.CNPJ.Contains(searchString) ||
                    e.Responsavel!.Contains(searchString));
            }

            // Ordenar por data de cadastro (mais recentes primeiro)
            empresasQuery = empresasQuery.OrderByDescending(e => e.DataCadastro);

            var empresas = await empresasQuery.ToListAsync();

            // ViewBags para filtros
            ViewBag.StatusList = new SelectList(new[] { "Ativo", "Inativo", "Suspenso" });
            ViewBag.TiposList = new SelectList(new[] { "Restaurante", "Supermercado", "Padaria", "Hotel", "Lanchonete", "Outro" });
            ViewBag.CurrentStatus = status;
            ViewBag.CurrentTipo = tipo;
            ViewBag.CurrentSearch = searchString;

            return View(empresas);
        }

        // GET: Empresa/Dashboard/5 - Dashboard específico da empresa
        public async Task<IActionResult> Dashboard(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var empresa = await _context.Empresas
                .Include(e => e.Alimentos)
                .Include(e => e.Coletas)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (empresa == null)
            {
                return NotFound();
            }

            // Estatísticas da empresa
            ViewBag.TotalAlimentos = empresa.Alimentos.Count;
            ViewBag.AlimentosDisponiveis = empresa.Alimentos.Count(a => a.Status == "Disponível");
            ViewBag.AlimentosColetados = empresa.Alimentos.Count(a => a.Status == "Coletado");
            ViewBag.TotalColetas = empresa.Coletas.Count;
            ViewBag.ColetasPendentes = empresa.Coletas.Count(c => c.Status == "Pendente");
            ViewBag.ColetasAprovadas = empresa.Coletas.Count(c => c.Status == "Aprovada");

            return View(empresa);
        }

        // GET: Empresa/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var empresa = await _context.Empresas
                .Include(e => e.Alimentos)
                .Include(e => e.Coletas)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (empresa == null)
            {
                return NotFound();
            }

            return View(empresa);
        }

        // GET: Empresa/Create
        public IActionResult Create()
        {
            PopulateViewBags();
            return View(new EmpresaModel());
        }

        // POST: Empresa/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(EmpresaModel empresa)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // Verificar se CNPJ já existe
                    var cnpjExiste = await _context.Empresas.AnyAsync(e => e.CNPJ == empresa.CNPJ);
                    if (cnpjExiste)
                    {
                        ModelState.AddModelError("CNPJ", "Este CNPJ já está cadastrado.");
                        PopulateViewBags();
                        return View(empresa);
                    }

                    empresa.DataCadastro = DateTime.Now;
                    empresa.Status = "Ativo";

                    _context.Add(empresa);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Empresa cadastrada com sucesso!";
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception)
                {
                    ModelState.AddModelError("", "Erro ao cadastrar a empresa. Tente novamente.");
                }
            }

            PopulateViewBags();
            return View(empresa);
        }

        // GET: Empresa/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var empresa = await _context.Empresas.FindAsync(id);
            if (empresa == null)
            {
                return NotFound();
            }

            PopulateViewBags();
            return View(empresa);
        }

        // POST: Empresa/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, EmpresaModel empresa)
        {
            if (id != empresa.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    // Verificar se CNPJ já existe em outra empresa
                    var cnpjExiste = await _context.Empresas.AnyAsync(e => e.CNPJ == empresa.CNPJ && e.Id != empresa.Id);
                    if (cnpjExiste)
                    {
                        ModelState.AddModelError("CNPJ", "Este CNPJ já está cadastrado em outra empresa.");
                        PopulateViewBags();
                        return View(empresa);
                    }

                    _context.Update(empresa);
                    await _context.SaveChangesAsync();
                    
                    TempData["SuccessMessage"] = "Empresa atualizada com sucesso!";
                    return RedirectToAction(nameof(Index));
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!EmpresaExists(empresa.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        ModelState.AddModelError("", "Erro de concorrência. A empresa foi modificada por outro usuário.");
                    }
                }
                catch (Exception)
                {
                    ModelState.AddModelError("", "Erro ao atualizar a empresa. Tente novamente.");
                }
            }

            PopulateViewBags();
            return View(empresa);
        }

        // GET: Empresa/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var empresa = await _context.Empresas
                .Include(e => e.Alimentos)
                .Include(e => e.Coletas)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (empresa == null)
            {
                return NotFound();
            }

            return View(empresa);
        }

        // POST: Empresa/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            try
            {
                var empresa = await _context.Empresas
                    .Include(e => e.Alimentos)
                    .Include(e => e.Coletas)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (empresa != null)
                {
                    // Verificar se a empresa tem alimentos ou coletas
                    if (empresa.Alimentos.Any() || empresa.Coletas.Any())
                    {
                        TempData["ErrorMessage"] = "Não é possível excluir esta empresa pois ela possui alimentos ou coletas cadastradas.";
                        return RedirectToAction(nameof(Index));
                    }

                    _context.Empresas.Remove(empresa);
                    await _context.SaveChangesAsync();
                    TempData["SuccessMessage"] = "Empresa excluída com sucesso!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Empresa não encontrada.";
                }
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Erro ao excluir a empresa. Tente novamente.";
            }

            return RedirectToAction(nameof(Index));
        }

        // POST: Empresa/AlterarStatus/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AlterarStatus(int id, string novoStatus)
        {
            try
            {
                var empresa = await _context.Empresas.FindAsync(id);
                if (empresa != null)
                {
                    empresa.Status = novoStatus;
                    _context.Update(empresa);
                    await _context.SaveChangesAsync();
                    TempData["SuccessMessage"] = $"Status da empresa alterado para {novoStatus}!";
                }
                else
                {
                    TempData["ErrorMessage"] = "Empresa não encontrada.";
                }
            }
            catch (Exception)
            {
                TempData["ErrorMessage"] = "Erro ao alterar o status da empresa.";
            }

            return RedirectToAction(nameof(Index));
        }

        // Método auxiliar para popular ViewBags
        private void PopulateViewBags()
        {
            ViewBag.TiposList = new SelectList(new[] { "Restaurante", "Supermercado", "Padaria", "Hotel", "Lanchonete", "Outro" });
            ViewBag.StatusList = new SelectList(new[] { "Ativo", "Inativo", "Suspenso" });
            ViewBag.EstadosList = new SelectList(new[] { "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO" });
        }

        private bool EmpresaExists(int id)
        {
            return _context.Empresas.Any(e => e.Id == id);
        }
    }
}

