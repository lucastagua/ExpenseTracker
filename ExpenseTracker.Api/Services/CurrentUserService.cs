using System.Security.Claims;
using ExpenseTracker.Api.Interfaces;

namespace ExpenseTracker.Api.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int UserId
    {
        get
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                throw new UnauthorizedAccessException("Token inválido o usuario no autenticado.");
            }

            return int.Parse(userIdClaim);
        }
    }

    public string? UserEmail =>
        _httpContextAccessor.HttpContext?.User
            .FindFirst(ClaimTypes.Email)?.Value;

    public string? UserName =>
        _httpContextAccessor.HttpContext?.User
            .FindFirst(ClaimTypes.Name)?.Value;
}