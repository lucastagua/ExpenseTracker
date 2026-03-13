using System.ComponentModel.DataAnnotations;
using ExpenseTracker.Api.Enums;

namespace ExpenseTracker.Api.DTOs.Category;

public class CreateCategoryDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [MaxLength(100, ErrorMessage = "El nombre no puede superar los 100 caracteres.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tipo es obligatorio.")]
    public CategoryType Type { get; set; }
}