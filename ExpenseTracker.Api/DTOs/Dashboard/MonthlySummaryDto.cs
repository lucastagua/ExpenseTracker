namespace ExpenseTracker.Api.DTOs.Dashboard;

public class MonthlySummaryDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal Balance { get; set; }
    public List<CategoryTotalDto> ExpensesByCategory { get; set; } = new();
    public List<CategoryTotalDto> IncomeByCategory { get; set; } = new();
    public List<RecentTransactionDto> Transactions { get; set; } = new();
}