namespace ExpenseTracker.Api.DTOs.Dashboard;

public class CategoryTotalDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal Total { get; set; }
}