using System.ComponentModel.DataAnnotations;
using ExpenseTracker.Api.Enums;

namespace ExpenseTracker.Api.DTOs.Transaction;

public class CreateTransactionDto
{
    [Required(ErrorMessage = "La descripción es obligatoria.")]
    [MaxLength(150, ErrorMessage = "La descripción no puede superar los 150 caracteres.")]
    public string Description { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "999999999999999.99", ErrorMessage = "El monto debe ser mayor a 0.")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "La fecha es obligatoria.")]
    public DateTime Date { get; set; }

    [Required(ErrorMessage = "El tipo es obligatorio.")]
    public TransactionType Type { get; set; }

    [MaxLength(500, ErrorMessage = "La nota no puede superar los 500 caracteres.")]
    public string? Notes { get; set; }

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    public int CategoryId { get; set; }
}