using ExpenseTracker.Api.Enums;

namespace ExpenseTracker.Api.DTOs.Category;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public CategoryType Type { get; set; }
}