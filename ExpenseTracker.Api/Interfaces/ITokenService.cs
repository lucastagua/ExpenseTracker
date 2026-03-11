using ExpenseTracker.Api.Models;

namespace ExpenseTracker.Api.Interfaces;

public interface ITokenService
{
    string CreateToken(User user);
}