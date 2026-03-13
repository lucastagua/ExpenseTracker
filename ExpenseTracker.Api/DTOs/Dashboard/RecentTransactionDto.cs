using ExpenseTracker.Api.Enums;

namespace ExpenseTracker.Api.DTOs.Dashboard;

public class RecentTransactionDto
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public TransactionType Type { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}