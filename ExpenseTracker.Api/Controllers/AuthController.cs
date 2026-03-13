using ExpenseTracker.Api.Data;
using ExpenseTracker.Api.DTOs;
using ExpenseTracker.Api.Enums;
using ExpenseTracker.Api.Interfaces;
using ExpenseTracker.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;

    public AuthController(
        ApplicationDbContext context,
        ITokenService tokenService,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
    {
        var emailExists = await _context.Users.AnyAsync(u => u.Email == registerDto.Email);

        if (emailExists)
        {
            return BadRequest("Ya existe un usuario con ese email.");
        }

        await using var dbTransaction = await _context.Database.BeginTransactionAsync();

        var user = new User
        {
            Name = registerDto.Name,
            Email = registerDto.Email,
            PasswordHash = _passwordHasher.Hash(registerDto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var defaultCategories = new List<Category>
        {
            new Category { Name = "Sueldo", Type = CategoryType.Income, UserId = user.Id },
            new Category { Name = "Freelance", Type = CategoryType.Income, UserId = user.Id },
            new Category { Name = "Comida", Type = CategoryType.Expense, UserId = user.Id },
            new Category { Name = "Transporte", Type = CategoryType.Expense, UserId = user.Id },
            new Category { Name = "Servicios", Type = CategoryType.Expense, UserId = user.Id },
            new Category { Name = "Compras", Type = CategoryType.Expense, UserId = user.Id }
        };

        _context.Categories.AddRange(defaultCategories);
        await _context.SaveChangesAsync();

        await dbTransaction.CommitAsync();

        var token = _tokenService.CreateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Name = user.Name,
            Email = user.Email
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

        if (user is null)
        {
            return Unauthorized("Email o contraseña incorrectos.");
        }

        var isPasswordValid = _passwordHasher.Verify(loginDto.Password, user.PasswordHash);

        if (!isPasswordValid)
        {
            return Unauthorized("Email o contraseña incorrectos.");
        }

        var token = _tokenService.CreateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Name = user.Name,
            Email = user.Email
        });
    }
}