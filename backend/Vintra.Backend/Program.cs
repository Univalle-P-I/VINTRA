
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors();

app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        status = "ok",
        service = "vintra-backend"
    });
});

app.MapGet("/health/db", async (ILogger<Program> logger) =>
{
    try
    {
        var dbPort = int.TryParse(
            Environment.GetEnvironmentVariable("DB_PORT"),
            out var port)
            ? port
            : 5432;

        var connectionString = new NpgsqlConnectionStringBuilder
        {
            Host = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost",
            Port = dbPort,
            Database = Environment.GetEnvironmentVariable("DB_NAME") ?? "vintra",
            Username = Environment.GetEnvironmentVariable("DB_USER") ?? "vintra_user",
            Password = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? ""
        }.ConnectionString;

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        await using var command =
            new NpgsqlCommand("SELECT NOW()", connection);

        var currentTime = await command.ExecuteScalarAsync();

        return Results.Ok(new
        {
            status = "ok",
            database = "connected",
            time = currentTime
        });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error conectando a PostgreSQL");

        return Results.Json(
            new
            {
                status = "error",
                database = "disconnected"
            },
            statusCode: 500);
    }
});

app.Run();
