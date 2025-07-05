using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FeedHope.Models
{
    public class AlimentoModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O tipo do alimento é obrigatório")]
        [Display(Name = "Tipo do Alimento")]
        [StringLength(100, ErrorMessage = "O tipo deve ter no máximo 100 caracteres")]
        public string Tipo { get; set; } = string.Empty;

        [Required(ErrorMessage = "A descrição é obrigatória")]
        [Display(Name = "Descrição")]
        [StringLength(500, ErrorMessage = "A descrição deve ter no máximo 500 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "A quantidade é obrigatória")]
        [Display(Name = "Quantidade")]
        [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser maior que zero")]
        public int Quantidade { get; set; }

        [Required(ErrorMessage = "A unidade de medida é obrigatória")]
        [Display(Name = "Unidade de Medida")]
        [StringLength(20, ErrorMessage = "A unidade deve ter no máximo 20 caracteres")]
        public string UnidadeMedida { get; set; } = string.Empty; // kg, litros, unidades, etc.

        [Required(ErrorMessage = "A data de validade é obrigatória")]
        [Display(Name = "Data de Validade")]
        [DataType(DataType.Date)]
        public DateTime Validade { get; set; }

        [Display(Name = "Data de Cadastro")]
        [DataType(DataType.DateTime)]
        public DateTime DataCadastro { get; set; } = DateTime.Now;

        [Display(Name = "Status")]
        [StringLength(50)]
        public string Status { get; set; } = "Disponível"; // Disponível, Coletado, Expirado

        [Display(Name = "Observações")]
        [StringLength(1000, ErrorMessage = "As observações devem ter no máximo 1000 caracteres")]
        public string? Observacoes { get; set; }

        [Required]
        [Display(Name = "Empresa")]
        public int EmpresaId { get; set; }

        [ForeignKey("EmpresaId")]
        public EmpresaModel? Empresa { get; set; }

        // Propriedade calculada para verificar se está próximo do vencimento
        [NotMapped]
        public bool ProximoVencimento => Validade <= DateTime.Now.AddDays(3);

        // Propriedade calculada para verificar se está vencido
        [NotMapped]
        public bool Vencido => Validade < DateTime.Now;
    }
}

