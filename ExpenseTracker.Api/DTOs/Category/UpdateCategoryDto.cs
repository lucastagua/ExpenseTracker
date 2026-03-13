using ExpenseTracker.Api.Enums;

namespace ExpenseTracker.Api.DTOs.Category;

public class UpdateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public CategoryType Type { get; set; }
}