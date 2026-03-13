using System.Net;
using System.Text.Json;
using ExpenseTracker.Api.DTOs.Common;

namespace ExpenseTracker.Api.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Acceso no autorizado.");

            await HandleExceptionAsync(
                context,
                HttpStatusCode.Unauthorized,
                "No autorizado.",
                ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Recurso no encontrado.");

            await HandleExceptionAsync(
                context,
                HttpStatusCode.NotFound,
                "Recurso no encontrado.",
                ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado.");

            await HandleExceptionAsync(
                context,
                HttpStatusCode.InternalServerError,
                "Ocurrió un error interno en el servidor.",
                _environment.IsDevelopment() ? ex.Message : null);
        }
    }

    private static async Task HandleExceptionAsync(
        HttpContext context,
        HttpStatusCode statusCode,
        string message,
        string? details = null)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new ErrorResponseDto
        {
            StatusCode = (int)statusCode,
            Message = message,
            Details = details
        };

        var json = JsonSerializer.Serialize(response);

        await context.Response.WriteAsync(json);
    }
}