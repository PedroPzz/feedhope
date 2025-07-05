using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FeedHope.Models
{
    [Table("Relatorios")]
    public class RelatorioModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O título é obrigatório.")]
        public string Titulo { get; set; } = string.Empty;

        [DataType(DataType.Date)]
        [Display(Name = "Data de Geração")]
        public DateTime DataGeracao { get; set; } = DateTime.Now;
    }
}

