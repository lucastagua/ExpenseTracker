using ExpenseTracker.Api.Enums;

namespace ExpenseTracker.Api.DTOs.Transaction;

public class TransactionDto
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public TransactionType Type { get; set; }
    public string? Notes { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}