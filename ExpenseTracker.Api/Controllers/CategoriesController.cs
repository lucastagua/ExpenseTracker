using System.Security.Claims;
using ExpenseTracker.Api.Data;
using ExpenseTracker.Api.DTOs.Category;
using ExpenseTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll()
    {
        var userId = GetUserId();

        var categories = await _context.Categories
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Type = c.Type
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetById(int id)
    {
        var userId = GetUserId();

        var category = await _context.Categories
            .Where(c => c.Id == id && c.UserId == userId)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Type = c.Type
            })
            .FirstOrDefaultAsync();

        if (category is null)
        {
            return NotFound("Categoría no encontrada.");
        }

        return Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create(CreateCategoryDto dto)
    {
        var userId = GetUserId();

        var categoryExists = await _context.Categories
            .AnyAsync(c => c.UserId == userId && c.Name == dto.Name);

        if (categoryExists)
        {
            return BadRequest("Ya existe una categoría con ese nombre.");
        }

        var category = new Category
        {
            Name = dto.Name,
            Type = dto.Type,
            UserId = userId
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var response = new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Type = category.Type
        };

        return CreatedAtAction(nameof(GetById), new { id = category.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> Update(int id, UpdateCategoryDto dto)
    {
        var userId = GetUserId();

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category is null)
        {
            return NotFound("Categoría no encontrada.");
        }

        var duplicatedName = await _context.Categories.AnyAsync(c =>
            c.UserId == userId &&
            c.Id != id &&
            c.Name == dto.Name);

        if (duplicatedName)
        {
            return BadRequest("Ya existe otra categoría con ese nombre.");
        }

        category.Name = dto.Name;
        category.Type = dto.Type;

        await _context.SaveChangesAsync();

        var response = new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Type = category.Type
        };

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var userId = GetUserId();

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category is null)
        {
            return NotFound("Categoría no encontrada.");
        }

        var hasTransactions = await _context.Transactions
            .AnyAsync(t => t.CategoryId == id);

        if (hasTransactions)
        {
            return BadRequest("No podés eliminar una categoría que tiene transacciones asociadas.");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException("Token inválido.");
        }

        return int.Parse(userIdClaim);
    }
}