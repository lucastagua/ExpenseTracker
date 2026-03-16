using ExpenseTracker.Api.Enums;

namespace ExpenseTracker.Api.DTOs.Transaction;

public class TransactionQueryParamsDto
{
    public TransactionType? Type { get; set; }
    public int? CategoryId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}