using ExpenseTracker.Api.Data;
using ExpenseTracker.Api.Dtos.Auth;
using ExpenseTracker.Api.DTOs;
using ExpenseTracker.Api.DTOs.Auth;
using ExpenseTracker.Api.Enums;
using ExpenseTracker.Api.Interfaces;
using ExpenseTracker.Api.Models;
using ExpenseTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
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
    private readonly ICurrentUserService _currentUserService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AuthController(
        ApplicationDbContext context,
        ITokenService tokenService,
        IPasswordHasher passwordHasher,
        ICurrentUserService currentUserService,
        IEmailService emailService,
        IConfiguration configuration
        )
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _currentUserService = currentUserService;
        _emailService = emailService;
        _configuration = configuration;
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

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<CurrentUserDto>> Me()
    {
        var userId = _currentUserService.UserId;

        var user = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new CurrentUserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email
            })
            .FirstOrDefaultAsync();

        if (user is null)
        {
            return NotFound("Usuario no encontrado.");
        }

        return Ok(user);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
    ForgotPasswordDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == dto.Email);

        if (user != null)
        {
            user.PasswordResetToken = Guid.NewGuid().ToString();
            user.PasswordResetTokenExpires = DateTime.UtcNow.AddHours(1);

            await _context.SaveChangesAsync();

            var frontendUrl = _configuration["Email:FrontendUrl"];
            var resetLink = $"{frontendUrl}/reset-password/{user.PasswordResetToken}";

            await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink);
        }

        return Ok(new
        {
            message =
                "Se ha enviado un enlace de restablecimiento de contraseña si el email existe."
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
    ResetPasswordDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x =>
                x.PasswordResetToken == dto.Token);

        if (user == null)
        {
            return BadRequest(new
            {
                message = "Token inválido."
            });
        }

        if (user.PasswordResetTokenExpires < DateTime.UtcNow)
        {
            return BadRequest(new
            {
                message = "Token expirado."
            });
        }

        user.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

        user.PasswordResetToken = null;
        user.PasswordResetTokenExpires = null;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Contraseña actualizada."
        });
    }
}