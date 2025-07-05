using FeedHope.Data;
using FeedHope.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MySql.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Configurar Entity Framework com SQLite
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"), ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

// Configurar ASP.NET Core Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Configurações de senha
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
    options.Password.RequiredUniqueChars = 1;

    // Configurações de lockout
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    // Configurações de usuário
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
    options.User.RequireUniqueEmail = true;

    // Configurações de confirmação
    options.SignIn.RequireConfirmedEmail = false;
    options.SignIn.RequireConfirmedPhoneNumber = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders()
.AddDefaultUI();

// Configurar políticas de autorização
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("EmpresaOnly", policy => policy.RequireRole("Empresa"));
    options.AddPolicy("ColetorOnly", policy => policy.RequireRole("Coletor"));
    options.AddPolicy("UFRAOnly", policy => policy.RequireRole("UFRA"));
    options.AddPolicy("EmpresaOrUFRA", policy => policy.RequireRole("Empresa", "UFRA"));
    options.AddPolicy("ColetorOrUFRA", policy => policy.RequireRole("Coletor", "UFRA"));
    options.AddPolicy("AdminOrUFRA", policy => policy.RequireRole("Admin", "UFRA"));
});

// Configurar cookies
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Identity/Account/Login";
    options.LogoutPath = "/Identity/Account/Logout";
    options.AccessDeniedPath = "/Identity/Account/AccessDenied";
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = true;
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});

// Adicionar serviços MVC
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

// Configurar logging
builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddConsole();
    logging.AddDebug();
});

// Configurar CORS (se necessário)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configurar pipeline de requisições
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCors();

// Configurar autenticação e autorização
app.UseAuthentication();
app.UseAuthorization();

// Configurar rotas
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapRazorPages();

// Inicializar banco de dados
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        
        // Aplicar migrações pendentes
        context.Database.Migrate();
        
        // Inicializar dados se necessário
        await InitializeDatabase(context, userManager, roleManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Erro ao inicializar o banco de dados.");
    }
}

app.Run();

// Método para inicializar dados do banco
static async Task InitializeDatabase(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
{
    // Verificar se os perfis existem, se não, criar
    string[] roles = { "Admin", "Empresa", "Coletor", "UFRA" };
    
    foreach (string role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
    
    // Verificar se o usuário admin existe, se não, criar
    var adminEmail = "admin@feedhope.ufra.edu.br";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    
    if (adminUser == null)
    {
        adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            NomeCompleto = "Administrador do Sistema",
            Cargo = "Administrador",
            EmailConfirmed = true,
            Ativo = true,
            DataCadastro = DateTime.Now,
            CriadoPor = "Sistema",
            DataCriacao = DateTime.Now
        };
        
        var result = await userManager.CreateAsync(adminUser, "Admin@123");
        
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
    
    // Verificar se o usuário UFRA existe, se não, criar
    var ufraEmail = "ufra@feedhope.ufra.edu.br";
    var ufraUser = await userManager.FindByEmailAsync(ufraEmail);
    
    if (ufraUser == null)
    {
        ufraUser = new ApplicationUser
        {
            UserName = ufraEmail,
            Email = ufraEmail,
            NomeCompleto = "Coordenador UFRA",
            Cargo = "Coordenador",
            EmailConfirmed = true,
            Ativo = true,
            DataCadastro = DateTime.Now,
            CriadoPor = "Sistema",
            DataCriacao = DateTime.Now
        };
        
        var result = await userManager.CreateAsync(ufraUser, "UFRA@123");
        
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(ufraUser, "UFRA");
        }
    }
}

