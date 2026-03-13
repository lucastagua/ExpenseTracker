namespace ExpenseTracker.Api.Interfaces;

public interface ICurrentUserService
{
    int UserId { get; }
    string? UserEmail { get; }
    string? UserName { get; }
}