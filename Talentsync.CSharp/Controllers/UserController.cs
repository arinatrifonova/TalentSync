using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Dapper;
using Talentsync.CSharp.Models;
using Talentsync.CSharp.Utils;
using System;
using System.Collections.Generic;
using Talentsync.CSharp.Model;
using Talentsync.CSharp.Utils;

namespace Talentsync.CSharp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly NpgsqlConnection db;

        public UserController(NpgsqlConnection db)
        {
            this.db = db;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] UserRegisterDto user)
        {
            if (string.IsNullOrWhiteSpace(user.Password) || user.Password.Length < 6)
            {
                return BadRequest("Пароль должен быть не менее 6 символов");
            }

            var sql = @"
                INSERT INTO users (last_name, first_name, telephone_number, email, password_hash)
                VALUES (@LastName, @FirstName, @Telephone_number, @Email, @PasswordHash)
                RETURNING id
            ";

            var passwordHash = PasswordUtils.hashPassword(user.Password);

            var parameters = new
            {
                LastName = user.LastName,
                FirstName = user.FirstName,
                Telephone_number = user.Telephone_number,
                Email = user.Email,
                PasswordHash = passwordHash
            };

            try
            {
                int newUserId = db.QuerySingle<int>(sql, parameters);
                var response = new RegisterResponse
                {
                    id = newUserId,
                    message = "Пользователь зарегистрирован"
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                var error = new ErrorResponse { error = ex.Message };
                return BadRequest(error);
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetUser(int id)
        {
            var sql = "SELECT id, last_name, first_name, telephone_number, email FROM users WHERE id = @id";
            var user = db.QueryFirstOrDefault(sql, new { id });

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("userId");
            return Ok("Выход выполнен успешно");
        }

        [HttpPut("{id}")]
        public IActionResult UpdateUser(int id, [FromBody] UserRegisterDto updatedUser)
        {
            var sql = @"
                UPDATE users
                SET last_name = @LastName,
                    first_name = @FirstName,
                    telephone_number = @Telephone_number,
                    email = @Email
                WHERE id = @Id
            ";

            var parameters = new
            {
                LastName = updatedUser.LastName,
                FirstName = updatedUser.FirstName,
                Telephone_number = updatedUser.Telephone_number,
                Email = updatedUser.Email,
                Id = id
            };

            try
            {
                int affectedRows = db.Execute(sql, parameters);
                if (affectedRows == 1)
                {
                    return Ok("Профиль обновлен");
                }
                else
                {
                    return NotFound(new ErrorResponse { error = "Пользователь не найден" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new ErrorResponse { error = ex.Message });
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginDto login)
        {
            var sql = "SELECT id, password_hash FROM users WHERE email = @Email";
            var parameters = new { Email = login.Email };

            var user = db.QueryFirstOrDefault<UserLoginDb>(sql, parameters);

            if (user == null)
            {
                return Unauthorized();
            }

            if (PasswordUtils.verifyPassword(login.Password, user.password_hash))
            {
                var response = new RegisterResponse
                {
                    id = user.id,
                    message = "Успешный вход"
                };
                return Ok(response);
            }
            else
            {
                return Unauthorized();
            }
        }
    }
}
