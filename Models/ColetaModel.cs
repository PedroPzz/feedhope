using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FeedHope.Models
{
    public class ColetaModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "A empresa é obrigatória")]
        [Display(Name = "Empresa")]
        public int EmpresaId { get; set; }

        [Required(ErrorMessage = "A data de coleta é obrigatória")]
        [Display(Name = "Data de Coleta")]
        [DataType(DataType.DateTime)]
        public DateTime DataColeta { get; set; }

        [Display(Name = "Data de Solicitação")]
        [DataType(DataType.DateTime)]
        public DateTime DataSolicitacao { get; set; } = DateTime.Now;

        [Required(ErrorMessage = "O endereço de coleta é obrigatório")]
        [Display(Name = "Endereço de Coleta")]
        [StringLength(300, ErrorMessage = "O endereço deve ter no máximo 300 caracteres")]
        public string Endereco { get; set; } = string.Empty;

        [Display(Name = "Coordenadas (Latitude)")]
        public double? Latitude { get; set; }

        [Display(Name = "Coordenadas (Longitude)")]
        public double? Longitude { get; set; }

        [Required(ErrorMessage = "O status é obrigatório")]
        [Display(Name = "Status")]
        [StringLength(50)]
        public string Status { get; set; } = "Pendente"; // Pendente, Aprovada, Em Coleta, Coletada, Recusada, Cancelada

        [Display(Name = "Prioridade")]
        [StringLength(20)]
        public string Prioridade { get; set; } = "Normal"; // Baixa, Normal, Alta, Urgente

        [Display(Name = "Observações")]
        [StringLength(1000, ErrorMessage = "As observações devem ter no máximo 1000 caracteres")]
        public string? Observacoes { get; set; }

        [Display(Name = "Responsável UFRA")]
        [StringLength(150)]
        public string? ResponsavelUFRA { get; set; }

        [Display(Name = "Data de Aprovação")]
        [DataType(DataType.DateTime)]
        public DateTime? DataAprovacao { get; set; }

        [Display(Name = "Data de Início da Coleta")]
        [DataType(DataType.DateTime)]
        public DateTime? DataInicioColeta { get; set; }

        [Display(Name = "Data de Conclusão")]
        [DataType(DataType.DateTime)]
        public DateTime? DataConclusao { get; set; }

        [Display(Name = "Motivo da Recusa")]
        [StringLength(500)]
        public string? MotivoRecusa { get; set; }

        [Display(Name = "Quantidade Total Coletada")]
        public int? QuantidadeTotalColetada { get; set; }

        [Display(Name = "Ordem de Coleta")]
        public int? OrdemColeta { get; set; }

        // Relacionamentos
        [ForeignKey("EmpresaId")]
        public EmpresaModel? Empresa { get; set; }

        public ICollection<AlimentoColetaModel> AlimentosColeta { get; set; } = new List<AlimentoColetaModel>();
        public ICollection<DestinacaoModel> Destinacoes { get; set; } = new List<DestinacaoModel>();

        // Propriedades calculadas
        [NotMapped]
        public bool PodeSerAprovada => Status == "Pendente";

        [NotMapped]
        public bool PodeSerRecusada => Status == "Pendente";

        [NotMapped]
        public bool EmAndamento => Status == "Em Coleta";

        [NotMapped]
        public bool Concluida => Status == "Coletada";
    }
}

