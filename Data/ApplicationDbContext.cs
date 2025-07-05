using FeedHope.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FeedHope.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets para as entidades do sistema
        public DbSet<EmpresaModel> Empresas { get; set; }
        public DbSet<AlimentoModel> Alimentos { get; set; }
        public DbSet<ColetaModel> Coletas { get; set; }
        public DbSet<DestinacaoModel> Destinacoes { get; set; }
        public DbSet<RelatorioModel> Relatorios { get; set; }
        public DbSet<AlimentoColetaModel> AlimentosColeta { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configurações das entidades
            ConfigureEmpresa(builder);
            ConfigureAlimento(builder);
            ConfigureColeta(builder);
            ConfigureDestinacao(builder);
            ConfigureAlimentoColeta(builder);
            ConfigureIdentity(builder);
        }

        private void ConfigureEmpresa(ModelBuilder builder)
        {
            builder.Entity<EmpresaModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);
                entity.Property(e => e.CNPJ).HasMaxLength(18);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Contato).HasMaxLength(20);
                entity.Property(e => e.Endereco).HasMaxLength(300);
                entity.Property(e => e.Tipo).HasMaxLength(50);
                entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Ativo");
                
                entity.HasIndex(e => e.CNPJ).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
            });
        }

        private void ConfigureAlimento(ModelBuilder builder)
        {
            builder.Entity<AlimentoModel>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.Property(a => a.Descricao).IsRequired().HasMaxLength(200);
                entity.Property(a => a.Tipo).HasMaxLength(50);
                entity.Property(a => a.UnidadeMedida).HasMaxLength(20);
                entity.Property(a => a.Status).HasMaxLength(20).HasDefaultValue("Disponível");
                entity.Property(a => a.Observacoes).HasMaxLength(500);
                
                entity.HasOne(a => a.Empresa)
                      .WithMany(e => e.Alimentos)
                      .HasForeignKey(a => a.EmpresaId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private void ConfigureColeta(ModelBuilder builder)
        {
            builder.Entity<ColetaModel>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Endereco).IsRequired().HasMaxLength(300);
                entity.Property(c => c.Status).HasMaxLength(20).HasDefaultValue("Pendente");
                entity.Property(c => c.Prioridade).HasMaxLength(20).HasDefaultValue("Normal");
                entity.Property(c => c.ResponsavelUFRA).HasMaxLength(100);
                entity.Property(c => c.MotivoRecusa).HasMaxLength(500);
                entity.Property(c => c.Observacoes).HasMaxLength(500);
                
                entity.HasOne(c => c.Empresa)
                      .WithMany(e => e.Coletas)
                      .HasForeignKey(c => c.EmpresaId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private void ConfigureDestinacao(ModelBuilder builder)
        {
            builder.Entity<DestinacaoModel>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.Property(d => d.TipoDestinacao).IsRequired().HasMaxLength(50);
                entity.Property(d => d.Descricao).IsRequired().HasMaxLength(500);
                entity.Property(d => d.UnidadeMedida).HasMaxLength(20);
                entity.Property(d => d.LocalDestinacao).HasMaxLength(200);
                entity.Property(d => d.ResponsavelDestinacao).HasMaxLength(100);
                entity.Property(d => d.Status).HasMaxLength(20).HasDefaultValue("Planejada");
                
                entity.HasOne(d => d.Coleta)
                      .WithMany(c => c.Destinacoes)
                      .HasForeignKey(d => d.ColetaId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private void ConfigureAlimentoColeta(ModelBuilder builder)
        {
            builder.Entity<AlimentoColetaModel>(entity =>
            {
                entity.HasKey(ac => ac.Id);
                
                entity.HasOne(ac => ac.Alimento)
                      .WithMany()
                      .HasForeignKey(ac => ac.AlimentoId)
                      .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(ac => ac.Coleta)
                      .WithMany(c => c.AlimentosColeta)
                      .HasForeignKey(ac => ac.ColetaId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private void ConfigureIdentity(ModelBuilder builder)
        {
            // Configurações do Identity
            builder.Entity<ApplicationUser>(entity =>
            {
                entity.Property(u => u.NomeCompleto).IsRequired().HasMaxLength(100);
                entity.Property(u => u.CPF).HasMaxLength(20);
                entity.Property(u => u.Telefone).HasMaxLength(20);
                entity.Property(u => u.Endereco).HasMaxLength(200);
                entity.Property(u => u.Cargo).HasMaxLength(50);
                entity.Property(u => u.FotoPerfil).HasMaxLength(500);
                
                entity.HasOne(u => u.Empresa)
                      .WithMany()
                      .HasForeignKey(u => u.EmpresaId)
                      .OnDelete(DeleteBehavior.SetNull);
                
                entity.HasIndex(u => u.CPF).IsUnique();
            });

            // Personalizar nomes das tabelas do Identity
            builder.Entity<ApplicationUser>().ToTable("Usuarios");
            builder.Entity<IdentityRole>().ToTable("Perfis");
            builder.Entity<IdentityUserRole<string>>().ToTable("UsuarioPerfis");
            builder.Entity<IdentityUserClaim<string>>().ToTable("UsuarioClaims");
            builder.Entity<IdentityUserLogin<string>>().ToTable("UsuarioLogins");
            builder.Entity<IdentityRoleClaim<string>>().ToTable("PerfilClaims");
            builder.Entity<IdentityUserToken<string>>().ToTable("UsuarioTokens");
        }
    }
}

