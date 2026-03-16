namespace ExpenseTracker.Api.DTOs.Dashboard;

public class MonthlyHistoryItemDto
{
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal Balance { get; set; }
}