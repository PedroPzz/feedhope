using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using FeedHope.Models;

namespace FeedHope.Areas.Identity.Pages.Account
{
    [AllowAnonymous]
    public class RegisterModel : PageModel
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IUserStore<ApplicationUser> _userStore;
        private readonly IUserEmailStore<ApplicationUser> _emailStore;
        private readonly ILogger<RegisterModel> _logger;

        public RegisterModel(
            UserManager<ApplicationUser> userManager,
            IUserStore<ApplicationUser> userStore,
            SignInManager<ApplicationUser> signInManager,
            ILogger<RegisterModel> logger)
        {
            _userManager = userManager;
            _userStore = userStore;
            _emailStore = GetEmailStore();
            _signInManager = signInManager;
            _logger = logger;
        }

        [BindProperty]
        public InputModel Input { get; set; }

        public string ReturnUrl { get; set; }

        public IList<AuthenticationScheme> ExternalLogins { get; set; }

        public class InputModel
        {
            [Required(ErrorMessage = "O campo Nome Completo é obrigatório.")]
            [StringLength(100, ErrorMessage = "O {0} deve ter no máximo {1} caracteres.")]
            [Display(Name = "Nome Completo")]
            public string NomeCompleto { get; set; }

            [Required(ErrorMessage = "O campo Email é obrigatório.")]
            [EmailAddress(ErrorMessage = "O campo Email deve ser um endereço de email válido.")]
            [Display(Name = "Email")]
            public string Email { get; set; }

            [StringLength(20, ErrorMessage = "O {0} deve ter no máximo {1} caracteres.")]
            [Display(Name = "CPF")]
            public string CPF { get; set; }

            [StringLength(20, ErrorMessage = "O {0} deve ter no máximo {1} caracteres.")]
            [Display(Name = "Telefone")]
            public string Telefone { get; set; }

            [StringLength(50, ErrorMessage = "O {0} deve ter no máximo {1} caracteres.")]
            [Display(Name = "Cargo")]
            public string Cargo { get; set; }

            [StringLength(200, ErrorMessage = "O {0} deve ter no máximo {1} caracteres.")]
            [Display(Name = "Endereço")]
            public string Endereco { get; set; }

            [Required(ErrorMessage = "O campo Senha é obrigatório.")]
            [StringLength(100, ErrorMessage = "A {0} deve ter pelo menos {2} e no máximo {1} caracteres.", MinimumLength = 6)]
            [DataType(DataType.Password)]
            [Display(Name = "Senha")]
            public string Password { get; set; }

            [DataType(DataType.Password)]
            [Display(Name = "Confirmar senha")]
            [Compare("Password", ErrorMessage = "A senha e a confirmação de senha não coincidem.")]
            public string ConfirmPassword { get; set; }
        }

        public async Task OnGetAsync(string returnUrl = null)
        {
            ReturnUrl = returnUrl;
            ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();
        }

        public async Task<IActionResult> OnPostAsync(string returnUrl = null)
        {
            returnUrl ??= Url.Content("~/");
            ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();
            
            if (ModelState.IsValid)
            {
                // Verificar se já existe usuário com este email
                var existingUser = await _userManager.FindByEmailAsync(Input.Email);
                if (existingUser != null)
                {
                    ModelState.AddModelError(string.Empty, "Já existe um usuário cadastrado com este email.");
                    return Page();
                }

                // Verificar se já existe usuário com este CPF (se fornecido)
                if (!string.IsNullOrEmpty(Input.CPF))
                {
                    var cpfExists = _userManager.Users.Any(u => u.CPF == Input.CPF);
                    if (cpfExists)
                    {
                        ModelState.AddModelError(nameof(Input.CPF), "Já existe um usuário cadastrado com este CPF.");
                        return Page();
                    }
                }

                var user = CreateUser();

                await _userStore.SetUserNameAsync(user, Input.Email, CancellationToken.None);
                await _emailStore.SetEmailAsync(user, Input.Email, CancellationToken.None);
                
                // Definir propriedades adicionais
                user.NomeCompleto = Input.NomeCompleto;
                user.CPF = Input.CPF;
                user.Telefone = Input.Telefone;
                user.Cargo = Input.Cargo;
                user.Endereco = Input.Endereco;
                user.Ativo = true;
                user.DataCadastro = DateTime.Now;
                user.CriadoPor = "Auto-registro";
                user.DataCriacao = DateTime.Now;

                var result = await _userManager.CreateAsync(user, Input.Password);

                if (result.Succeeded)
                {
                    _logger.LogInformation("Usuário criou uma nova conta com senha.");

                    // Atribuir role padrão (pode ser ajustado conforme necessário)
                    await _userManager.AddToRoleAsync(user, "Empresa");

                    var userId = await _userManager.GetUserIdAsync(user);
                    var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
                    var callbackUrl = Url.Page(
                        "/Account/ConfirmEmail",
                        pageHandler: null,
                        values: new { area = "Identity", userId = userId, code = code, returnUrl = returnUrl },
                        protocol: Request.Scheme);

                    // Por enquanto, confirmar email automaticamente
                    var confirmResult = await _userManager.ConfirmEmailAsync(user, Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code)));
                    
                    if (confirmResult.Succeeded)
                    {
                        await _signInManager.SignInAsync(user, isPersistent: false);
                        return LocalRedirect(returnUrl);
                    }
                }
                
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
            }

            // If we got this far, something failed, redisplay form
            return Page();
        }

        private ApplicationUser CreateUser()
        {
            try
            {
                return Activator.CreateInstance<ApplicationUser>();
            }
            catch
            {
                throw new InvalidOperationException($"Can't create an instance of '{nameof(ApplicationUser)}'. " +
                    $"Ensure that '{nameof(ApplicationUser)}' is not an abstract class and has a parameterless constructor, or alternatively " +
                    $"override the register page in /Areas/Identity/Pages/Account/Register.cshtml");
            }
        }

        private IUserEmailStore<ApplicationUser> GetEmailStore()
        {
            if (!_userManager.SupportsUserEmail)
            {
                throw new NotSupportedException("The default UI requires a user store with email support.");
            }
            return (IUserEmailStore<ApplicationUser>)_userStore;
        }
    }
}

