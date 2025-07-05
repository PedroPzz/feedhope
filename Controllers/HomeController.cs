using System.Diagnostics;
using FeedHope.Models;
using Microsoft.AspNetCore.Mvc;

namespace FeedHope.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Sobre()
        {
            return View();
        }

        // Autenticação
        public IActionResult Login()
        {
            return View();
        }

        public IActionResult Registro()
        {
            return View();
        }

        // Formulários de Cadastro
        public IActionResult CadastroEmpresa()
        {
            return View();
        }

        public IActionResult CadastroAlimento()
        {
            return View();
        }

        // Dashboard e Análises
        public IActionResult Dashboard()
        {
            return View();
        }

        public IActionResult Relatorios()
        {
            return View();
        }

        // Sistema de Notificações
        public IActionResult Notificacoes()
        {
            return View();
        }

        // Mapas e Logística
        public IActionResult Mapas()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
