using ExpenseTracker.Api.Enums;

namespace ExpenseTracker.Api.DTOs.Category;

public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public CategoryType Type { get; set; }
}