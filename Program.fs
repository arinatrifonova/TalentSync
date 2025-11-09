namespace TalentSync
#nowarn "20"
open System
open System.Collections.Generic
open System.IO
open System.Linq
open System.Threading.Tasks
open Microsoft.AspNetCore
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.AspNetCore.HttpsPolicy
open Microsoft.Extensions.Configuration
open Microsoft.Extensions.DependencyInjection
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.Logging

module Program =

    [<EntryPoint>]
    let main args =
        let builder = WebApplication.CreateBuilder(args)

        // обязательно регистрируем контроллеры и http client
        builder.Services.AddControllers() |> ignore
        builder.Services.AddHttpClient() |> ignore

        // опционально: swagger для проверки
        builder.Services.AddEndpointsApiExplorer() |> ignore
        builder.Services.AddSwaggerGen() |> ignore

        builder.Services.AddCors(fun options ->
            options.AddPolicy("AllowAll", fun builder ->
                builder.AllowAnyOrigin()
                       .AllowAnyMethod()
                       .AllowAnyHeader() |> ignore
            )
        ) |> ignore



        let app = builder.Build()

        if app.Environment.IsDevelopment() then
            app.UseSwagger() |> ignore
            app.UseSwaggerUI() |> ignore


        app.UseCors("AllowAll")
        app.UseHttpsRedirection() |> ignore
        app.UseAuthorization() |> ignore
        app.MapControllers() |> ignore
        app.Run()

        0

//module Program =
//    let exitCode = 0

//    [<EntryPoint>]
//    let main args =

//        let builder = WebApplication.CreateBuilder(args)

//        builder.Services.AddControllers()

//        let app = builder.Build()

//        app.UseHttpsRedirection()

//        app.UseAuthorization()
//        app.MapControllers()

//        app.Run()

//        exitCode
