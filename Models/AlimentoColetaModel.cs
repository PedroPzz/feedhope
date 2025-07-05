using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FeedHope.Models
{
    public class AlimentoColetaModel
    {
        public int Id { get; set; }

        [Required]
        [Display(Name = "Alimento")]
        public int AlimentoId { get; set; }

        [Required]
        [Display(Name = "Coleta")]
        public int ColetaId { get; set; }

        [Required(ErrorMessage = "A quantidade coletada é obrigatória")]
        [Display(Name = "Quantidade Coletada")]
        [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser maior que zero")]
        public int QuantidadeColetada { get; set; }

        [Display(Name = "Estado do Alimento")]
        [StringLength(100)]
        public string? EstadoAlimento { get; set; } // Bom, Regular, Próximo ao vencimento

        [Display(Name = "Observações")]
        [StringLength(500)]
        public string? Observacoes { get; set; }

        [Display(Name = "Data da Coleta")]
        [DataType(DataType.DateTime)]
        public DateTime DataColeta { get; set; } = DateTime.Now;

        // Relacionamentos
        [ForeignKey("AlimentoId")]
        public AlimentoModel? Alimento { get; set; }

        [ForeignKey("ColetaId")]
        public ColetaModel? Coleta { get; set; }
    }
}

