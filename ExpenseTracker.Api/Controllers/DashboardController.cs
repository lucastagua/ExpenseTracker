using ExpenseTracker.Api.Data;
using ExpenseTracker.Api.DTOs.Dashboard;
using ExpenseTracker.Api.Enums;
using ExpenseTracker.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace ExpenseTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DashboardController(
        ApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
    {
        var userId = _currentUserService.UserId;

        var transactionsQuery = _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId);

        var totalIncome = await transactionsQuery
            .Where(t => t.Type == TransactionType.Income)
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        var totalExpense = await transactionsQuery
            .Where(t => t.Type == TransactionType.Expense)
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        var transactionsCount = await transactionsQuery.CountAsync();

        var expensesByCategory = await transactionsQuery
            .Where(t => t.Type == TransactionType.Expense)
            .GroupBy(t => new { t.CategoryId, t.Category.Name })
            .Select(g => new CategoryTotalDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                Total = g.Sum(t => t.Amount)
            })
            .OrderByDescending(x => x.Total)
            .ToListAsync();

        var incomeByCategory = await transactionsQuery
            .Where(t => t.Type == TransactionType.Income)
            .GroupBy(t => new { t.CategoryId, t.Category.Name })
            .Select(g => new CategoryTotalDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                Total = g.Sum(t => t.Amount)
            })
            .OrderByDescending(x => x.Total)
            .ToListAsync();

        var recentTransactions = await transactionsQuery
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Id)
            .Take(5)
            .Select(t => new RecentTransactionDto
            {
                Id = t.Id,
                Description = t.Description,
                Amount = t.Amount,
                Date = t.Date,
                Type = t.Type,
                CategoryName = t.Category.Name
            })
            .ToListAsync();

        var response = new DashboardSummaryDto
        {
            TotalIncome = totalIncome,
            TotalExpense = totalExpense,
            Balance = totalIncome - totalExpense,
            TransactionsCount = transactionsCount,
            ExpensesByCategory = expensesByCategory,
            IncomeByCategory = incomeByCategory,
            RecentTransactions = recentTransactions
        };

        return Ok(response);
    }

    [HttpGet("monthly-summary")]
    public async Task<ActionResult<MonthlySummaryDto>> GetMonthlySummary([FromQuery] int year, [FromQuery] int month)
    {
        if (year < 2000 || year > 2100)
        {
            return BadRequest("El año es inválido.");
        }

        if (month < 1 || month > 12)
        {
            return BadRequest("El mes es inválido.");
        }

        var userId = _currentUserService.UserId;

        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);

        var monthlyTransactionsQuery = _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.Date >= startDate && t.Date < endDate);

        var totalIncome = await monthlyTransactionsQuery
            .Where(t => t.Type == TransactionType.Income)
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        var totalExpense = await monthlyTransactionsQuery
            .Where(t => t.Type == TransactionType.Expense)
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        var expensesByCategory = await monthlyTransactionsQuery
            .Where(t => t.Type == TransactionType.Expense)
            .GroupBy(t => new { t.CategoryId, t.Category.Name })
            .Select(g => new CategoryTotalDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                Total = g.Sum(t => t.Amount)
            })
            .OrderByDescending(x => x.Total)
            .ToListAsync();

        var incomeByCategory = await monthlyTransactionsQuery
            .Where(t => t.Type == TransactionType.Income)
            .GroupBy(t => new { t.CategoryId, t.Category.Name })
            .Select(g => new CategoryTotalDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                Total = g.Sum(t => t.Amount)
            })
            .OrderByDescending(x => x.Total)
            .ToListAsync();

        var transactions = await monthlyTransactionsQuery
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Id)
            .Select(t => new RecentTransactionDto
            {
                Id = t.Id,
                Description = t.Description,
                Amount = t.Amount,
                Date = t.Date,
                Type = t.Type,
                CategoryName = t.Category.Name
            })
            .ToListAsync();

        var response = new MonthlySummaryDto
        {
            Year = year,
            Month = month,
            TotalIncome = totalIncome,
            TotalExpense = totalExpense,
            Balance = totalIncome - totalExpense,
            ExpensesByCategory = expensesByCategory,
            IncomeByCategory = incomeByCategory,
            Transactions = transactions
        };

        return Ok(response);
    }

    [HttpGet("monthly-history")]
    public async Task<ActionResult<IEnumerable<MonthlyHistoryItemDto>>> GetMonthlyHistory([FromQuery] int year)
    {
        if (year < 2000 || year > 2100)
        {
            return BadRequest("El año es inválido.");
        }

        var userId = _currentUserService.UserId;

        var startDate = new DateTime(year, 1, 1);
        var endDate = startDate.AddYears(1);

        var groupedData = await _context.Transactions
            .Where(t => t.UserId == userId && t.Date >= startDate && t.Date < endDate)
            .GroupBy(t => t.Date.Month)
            .Select(g => new
            {
                Month = g.Key,
                TotalIncome = g.Where(t => t.Type == TransactionType.Income)
                    .Sum(t => (decimal?)t.Amount) ?? 0,
                TotalExpense = g.Where(t => t.Type == TransactionType.Expense)
                    .Sum(t => (decimal?)t.Amount) ?? 0
            })
            .ToListAsync();

        var result = Enumerable.Range(1, 12)
            .Select(month =>
            {
                var monthData = groupedData.FirstOrDefault(x => x.Month == month);

                var totalIncome = monthData?.TotalIncome ?? 0;
                var totalExpense = monthData?.TotalExpense ?? 0;

                return new MonthlyHistoryItemDto
                {
                    Month = month,
                    MonthName = new DateTime(year, month, 1)
                        .ToString("MMMM", new CultureInfo("es-AR")),
                    TotalIncome = totalIncome,
                    TotalExpense = totalExpense,
                    Balance = totalIncome - totalExpense
                };
            })
            .ToList();

        return Ok(result);
    }
}