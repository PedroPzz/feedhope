using System.ComponentModel.DataAnnotations;

namespace FeedHope.Models
{
    public class EmpresaModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome da empresa é obrigatório")]
        [Display(Name = "Nome da Empresa")]
        [StringLength(200, ErrorMessage = "O nome deve ter no máximo 200 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O CNPJ é obrigatório")]
        [Display(Name = "CNPJ")]
        [StringLength(18, ErrorMessage = "O CNPJ deve ter no máximo 18 caracteres")]
        public string CNPJ { get; set; } = string.Empty;

        [Required(ErrorMessage = "O tipo da empresa é obrigatório")]
        [Display(Name = "Tipo da Empresa")]
        [StringLength(100, ErrorMessage = "O tipo deve ter no máximo 100 caracteres")]
        public string Tipo { get; set; } = string.Empty; // Restaurante, Supermercado, Padaria, etc.

        [Required(ErrorMessage = "O endereço é obrigatório")]
        [Display(Name = "Endereço")]
        [StringLength(300, ErrorMessage = "O endereço deve ter no máximo 300 caracteres")]
        public string Endereco { get; set; } = string.Empty;

        [Display(Name = "CEP")]
        [StringLength(9, ErrorMessage = "O CEP deve ter no máximo 9 caracteres")]
        public string? CEP { get; set; }

        [Display(Name = "Cidade")]
        [StringLength(100, ErrorMessage = "A cidade deve ter no máximo 100 caracteres")]
        public string? Cidade { get; set; }

        [Display(Name = "Estado")]
        [StringLength(2, ErrorMessage = "O estado deve ter 2 caracteres")]
        public string? Estado { get; set; }

        [Required(ErrorMessage = "O contato é obrigatório")]
        [Display(Name = "Telefone de Contato")]
        [StringLength(20, ErrorMessage = "O contato deve ter no máximo 20 caracteres")]
        public string Contato { get; set; } = string.Empty;

        [Display(Name = "E-mail")]
        [EmailAddress(ErrorMessage = "E-mail inválido")]
        [StringLength(150, ErrorMessage = "O e-mail deve ter no máximo 150 caracteres")]
        public string? Email { get; set; }

        [Display(Name = "Responsável")]
        [StringLength(150, ErrorMessage = "O nome do responsável deve ter no máximo 150 caracteres")]
        public string? Responsavel { get; set; }

        [Display(Name = "Data de Cadastro")]
        [DataType(DataType.DateTime)]
        public DateTime DataCadastro { get; set; } = DateTime.Now;

        [Display(Name = "Status")]
        [StringLength(50)]
        public string Status { get; set; } = "Ativo"; // Ativo, Inativo, Suspenso

        [Display(Name = "Observações")]
        [StringLength(1000, ErrorMessage = "As observações devem ter no máximo 1000 caracteres")]
        public string? Observacoes { get; set; }

        // Relacionamentos
        public ICollection<AlimentoModel> Alimentos { get; set; } = new List<AlimentoModel>();
        public ICollection<ColetaModel> Coletas { get; set; } = new List<ColetaModel>();
    }
}

