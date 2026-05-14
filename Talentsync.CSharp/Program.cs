using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Npgsql;
using Talentsync.CSharp;
using Talentsync.CSharp.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddControllers();
builder.Services.AddHttpClient();

builder.Services.Configure<HhOAuthOptions>(builder.Configuration.GetSection("Hh"));
builder.Services.AddSingleton<HhTokenStore>();

// Swagger для проверки
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// PostgreSQL (один коннекшн на приложение)
builder.Services.AddTransient<NpgsqlConnection>(_ =>
{
    var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
    return new NpgsqlConnection(connStr);
});

builder.Services.AddSingleton<VacancyDatasetService>();

var app = builder.Build();

// Swagger только в Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware
app.UseCors("AllowAll");
app.UseHttpsRedirection();
//app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();

app.Run();

public class HhOAuthOptions
{
    public string ClientId { get; set; } = "";
    public string ClientSecret { get; set; } = "";
    public string RedirectUri { get; set; } = "";
}

//public class HhTokenStore
//{
//    public string? AccessToken { get; set; }
//    public string? RefreshToken { get; set; }
//    public DateTimeOffset? ExpiresAt { get; set; }
//}