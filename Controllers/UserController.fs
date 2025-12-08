namespace TalentSync.Controllers

open Microsoft.AspNetCore.Mvc
open Npgsql
open Dapper
open TalentSync.Utils
open TalentSync.Models

[<ApiController>]
[<Route("api/[controller]")>]
type UserController (db: NpgsqlConnection) =
    inherit ControllerBase()

    [<HttpPost("register")>]
    member this.Register([<FromBody>] user: UserRegisterDto) : IActionResult =
        if System.String.IsNullOrWhiteSpace(user.Password) || user.Password.Length < 6 then
            this.BadRequest("Пароль должен быть не менее 6 символов") :> IActionResult
        else
            let sql = """
                INSERT INTO users (last_name, first_name, telephone_number, email, password_hash)
                VALUES (@LastName, @FirstName, @Telephone_number, @Email, @PasswordHash)
                RETURNING id
            """
            let passwordHash = PasswordUtils.hashPassword user.Password

            let parameters = 
                dict [
                    "LastName", box user.LastName
                    "FirstName", box user.FirstName
                    "Telephone_number", box user.Telephone_number
                    "Email", box user.Email
                    "PasswordHash", box passwordHash
                ]

            try
                let newUserId = db.QuerySingle<int>(sql, parameters)
                this.Ok({ id = newUserId; message = "Пользователь зарегистрирован" }) :> IActionResult
            with ex ->
                this.BadRequest({ error = ex.Message }) :> IActionResult

    [<HttpGet("{id}")>]
    member this.GetUser(id: int) : IActionResult =
        let sql = "SELECT id, last_name, first_name, telephone_number, email FROM users WHERE id = @id"
        let user = db.QueryFirstOrDefault(sql, dict [ "id", box id ])
        if obj.ReferenceEquals(user, null) then
            this.NotFound() :> IActionResult
        else
            this.Ok(user) :> IActionResult

    [<HttpPost("logout")>]
    member this.Logout() : IActionResult =
        this.Response.Cookies.Delete("userId")
        this.Ok("Выход выполнен успешно") :> IActionResult

    // редактирвание профиля
    [<HttpPut("{id}")>]
    member this.UpdateUser(id: int, [<FromBody>] updatedUser: UserRegisterDto) : IActionResult =
        let sql = """
            UPDATE users
            SET last_name = @LastName,
                first_name = @FirstName,
                telephone_number = @Telephone_number,
                email = @Email
            WHERE id = @Id
        """

        let parameters =
            dict [
                "LastName", box updatedUser.LastName
                "FirstName", box updatedUser.FirstName
                "Telephone_number", box updatedUser.Telephone_number
                "Email", box updatedUser.Email
                "Id", box id
            ]

        try
            let affectedRows = db.Execute(sql, parameters)
            if affectedRows = 1 then
                this.Ok("Профиль обновлен") :> IActionResult
            else
                this.NotFound({ error = "Пользователь не найден" }) :> IActionResult
        with ex ->
            this.BadRequest({ error = ex.Message }) :> IActionResult


    [<HttpPost("login")>]
    member this.Login([<FromBody>] login: UserLoginDto) : IActionResult =
        let sql = "SELECT id, password_hash FROM users WHERE email = @Email"

        let parameters = dict [ "Email", box login.Email ]

        let user = db.QueryFirstOrDefault<UserLoginDb>(sql, parameters)

        if obj.ReferenceEquals(user, null) then
            this.Unauthorized() :> IActionResult
        else
            if PasswordUtils.verifyPassword login.Password user.password_hash then
                this.Ok({|
                    id = user.id
                    message = "Успешный вход"
                |}) :> IActionResult
            else
                this.Unauthorized() :> IActionResult



