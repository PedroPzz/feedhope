using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FeedHope.Models
{
    public class DestinacaoModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O tipo de destinação é obrigatório")]
        [Display(Name = "Tipo de Destinação")]
        [StringLength(100)]
        public string TipoDestinacao { get; set; } = string.Empty; // Refeitório, Uso Agrícola, Compostagem, Doação Direta

        [Required(ErrorMessage = "A descrição é obrigatória")]
        [Display(Name = "Descrição")]
        [StringLength(500, ErrorMessage = "A descrição deve ter no máximo 500 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "A quantidade é obrigatória")]
        [Display(Name = "Quantidade Destinada")]
        [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser maior que zero")]
        public int Quantidade { get; set; }

        [Required(ErrorMessage = "A unidade de medida é obrigatória")]
        [Display(Name = "Unidade de Medida")]
        [StringLength(20)]
        public string UnidadeMedida { get; set; } = string.Empty;

        [Required(ErrorMessage = "A data é obrigatória")]
        [Display(Name = "Data da Destinação")]
        [DataType(DataType.Date)]
        public DateTime Data { get; set; }

        [Display(Name = "Local de Destinação")]
        [StringLength(200)]
        public string? LocalDestinacao { get; set; }

        [Display(Name = "Responsável pela Destinação")]
        [StringLength(150)]
        public string? ResponsavelDestinacao { get; set; }

        [Display(Name = "Beneficiários Estimados")]
        public int? BeneficiariosEstimados { get; set; }

        [Display(Name = "Status")]
        [StringLength(50)]
        public string Status { get; set; } = "Planejada"; // Planejada, Em Andamento, Concluída

        [Display(Name = "Observações")]
        [StringLength(1000)]
        public string? Observacoes { get; set; }

        [Display(Name = "Data de Cadastro")]
        [DataType(DataType.DateTime)]
        public DateTime DataCadastro { get; set; } = DateTime.Now;

        [Display(Name = "Data de Conclusão")]
        [DataType(DataType.DateTime)]
        public DateTime? DataConclusao { get; set; }

        // Relacionamentos
        [Required]
        [Display(Name = "Coleta")]
        public int ColetaId { get; set; }

        [ForeignKey("ColetaId")]
        public ColetaModel? Coleta { get; set; }

        // Propriedades calculadas
        [NotMapped]
        public bool Concluida => Status == "Concluída";

        [NotMapped]
        public bool EmAndamento => Status == "Em Andamento";
    }
}

