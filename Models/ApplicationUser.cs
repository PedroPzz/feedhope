using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace FeedHope.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        [StringLength(100)]
        [Display(Name = "Nome Completo")]
        public string NomeCompleto { get; set; } = string.Empty;

        [StringLength(20)]
        [Display(Name = "CPF")]
        public string? CPF { get; set; }

        [StringLength(20)]
        [Display(Name = "Telefone")]
        public string? Telefone { get; set; }

        [Display(Name = "Data de Nascimento")]
        [DataType(DataType.Date)]
        public DateTime? DataNascimento { get; set; }

        [StringLength(200)]
        [Display(Name = "Endereço")]
        public string? Endereco { get; set; }

        [StringLength(50)]
        [Display(Name = "Cargo")]
        public string? Cargo { get; set; }

        [Display(Name = "Data de Cadastro")]
        public DateTime DataCadastro { get; set; } = DateTime.Now;

        [Display(Name = "Último Acesso")]
        public DateTime? UltimoAcesso { get; set; }

        [Display(Name = "Ativo")]
        public bool Ativo { get; set; } = true;

        // Relacionamento com empresa (para usuários de empresas)
        [Display(Name = "Empresa")]
        public int? EmpresaId { get; set; }
        public virtual EmpresaModel? Empresa { get; set; }

        // Foto do perfil (opcional)
        [StringLength(500)]
        [Display(Name = "Foto do Perfil")]
        public string? FotoPerfil { get; set; }

        // Preferências do usuário
        [Display(Name = "Receber Notificações por Email")]
        public bool ReceberNotificacoesEmail { get; set; } = true;

        [Display(Name = "Receber Notificações SMS")]
        public bool ReceberNotificacoesSMS { get; set; } = false;

        // Campos de auditoria
        [StringLength(100)]
        public string? CriadoPor { get; set; }

        public DateTime? DataCriacao { get; set; } = DateTime.Now;

        [StringLength(100)]
        public string? ModificadoPor { get; set; }

        public DateTime? DataModificacao { get; set; }
    }
}

