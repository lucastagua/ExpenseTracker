using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace ExpenseTracker.Api.Services;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string to, string resetLink);
}

public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public EmailService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task SendPasswordResetEmailAsync(string to, string resetLink)
    {
        var apiKey = _configuration["Email:ApiKey"];
        var from = _configuration["Email:From"];

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("Email API key is missing.");

        if (string.IsNullOrWhiteSpace(from))
            throw new InvalidOperationException("Email sender is missing.");

        var payload = new
        {
            from,
            to = new[] { to },
            subject = "Recuperar contraseña - ExpenseTracker",
            html = $@"
                <h2>Recuperar contraseña</h2>
                <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                <p>Hacé click en el siguiente enlace:</p>
                <p><a href='{resetLink}'>Restablecer contraseña</a></p>
                <p>Este enlace expira en 1 hora.</p>
                <p>Si no solicitaste esto, podés ignorar este email.</p>
            "
        };

        var json = JsonSerializer.Serialize(payload);
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Email send failed: {content}");
        }
    }
}