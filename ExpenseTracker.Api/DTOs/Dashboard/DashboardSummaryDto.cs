namespace ExpenseTracker.Api.DTOs.Dashboard;

public class DashboardSummaryDto
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal Balance { get; set; }
    public int TransactionsCount { get; set; }

    public List<CategoryTotalDto> ExpensesByCategory { get; set; } = new();
    public List<CategoryTotalDto> IncomeByCategory { get; set; } = new();
    public List<RecentTransactionDto> RecentTransactions { get; set; } = new();
}