using ExpenseTracker.Api.Data;
using ExpenseTracker.Api.DTOs.Dashboard;
using ExpenseTracker.Api.Enums;
using ExpenseTracker.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
}