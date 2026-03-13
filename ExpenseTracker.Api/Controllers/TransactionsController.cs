using ExpenseTracker.Api.Data;
using ExpenseTracker.Api.DTOs.Transaction;
using ExpenseTracker.Api.Interfaces;
using ExpenseTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public TransactionsController(
        ApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionDto>>> GetAll([FromQuery] TransactionQueryParamsDto query)
    {
        var userId = _currentUserService.UserId;

        var transactionsQuery = _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId)
            .AsQueryable();

        if (query.Type.HasValue)
        {
            transactionsQuery = transactionsQuery.Where(t => t.Type == query.Type.Value);
        }

        if (query.CategoryId.HasValue)
        {
            transactionsQuery = transactionsQuery.Where(t => t.CategoryId == query.CategoryId.Value);
        }

        if (query.FromDate.HasValue)
        {
            var fromDate = query.FromDate.Value.Date;
            transactionsQuery = transactionsQuery.Where(t => t.Date >= fromDate);
        }

        if (query.ToDate.HasValue)
        {
            var toDate = query.ToDate.Value.Date.AddDays(1).AddTicks(-1);
            transactionsQuery = transactionsQuery.Where(t => t.Date <= toDate);
        }

        var transactions = await transactionsQuery
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Id)
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                Description = t.Description,
                Amount = t.Amount,
                Date = t.Date,
                Type = t.Type,
                Notes = t.Notes,
                CategoryId = t.CategoryId,
                CategoryName = t.Category.Name
            })
            .ToListAsync();

        return Ok(transactions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetById(int id)
    {
        var userId = _currentUserService.UserId;

        var transaction = await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.Id == id && t.UserId == userId)
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                Description = t.Description,
                Amount = t.Amount,
                Date = t.Date,
                Type = t.Type,
                Notes = t.Notes,
                CategoryId = t.CategoryId,
                CategoryName = t.Category.Name
            })
            .FirstOrDefaultAsync();

        if (transaction is null)
        {
            return NotFound("Transacción no encontrada.");
        }

        return Ok(transaction);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create(CreateTransactionDto dto)
    {
        var userId = _currentUserService.UserId;

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == dto.CategoryId && c.UserId == userId);

        if (category is null)
        {
            return BadRequest("La categoría no existe o no pertenece al usuario.");
        }

        if ((int)category.Type != (int)dto.Type)
        {
            return BadRequest("El tipo de la categoría no coincide con el tipo de la transacción.");
        }

        var transaction = new Transaction
        {
            Description = dto.Description,
            Amount = dto.Amount,
            Date = dto.Date,
            Type = dto.Type,
            Notes = dto.Notes,
            CategoryId = dto.CategoryId,
            UserId = userId
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        var response = new TransactionDto
        {
            Id = transaction.Id,
            Description = transaction.Description,
            Amount = transaction.Amount,
            Date = transaction.Date,
            Type = transaction.Type,
            Notes = transaction.Notes,
            CategoryId = category.Id,
            CategoryName = category.Name
        };

        return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionDto>> Update(int id, UpdateTransactionDto dto)
    {
        var userId = _currentUserService.UserId;

        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (transaction is null)
        {
            return NotFound("Transacción no encontrada.");
        }

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == dto.CategoryId && c.UserId == userId);

        if (category is null)
        {
            return BadRequest("La categoría no existe o no pertenece al usuario.");
        }

        if ((int)category.Type != (int)dto.Type)
        {
            return BadRequest("El tipo de la categoría no coincide con el tipo de la transacción.");
        }

        transaction.Description = dto.Description;
        transaction.Amount = dto.Amount;
        transaction.Date = dto.Date;
        transaction.Type = dto.Type;
        transaction.Notes = dto.Notes;
        transaction.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync();

        var response = new TransactionDto
        {
            Id = transaction.Id,
            Description = transaction.Description,
            Amount = transaction.Amount,
            Date = transaction.Date,
            Type = transaction.Type,
            Notes = transaction.Notes,
            CategoryId = category.Id,
            CategoryName = category.Name
        };

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var userId = _currentUserService.UserId;

        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (transaction is null)
        {
            return NotFound("Transacción no encontrada.");
        }

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}