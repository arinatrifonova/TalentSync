using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Talentsync.CSharp.Model;
using Talentsync.CSharp.Models;

namespace Talentsync.CSharp.Controllers
{
    [ApiController]
    [Route("api/favorite_vacancies")]
    public class FavoriteVacanciesController : ControllerBase
    {
        private readonly NpgsqlConnection db;

        public FavoriteVacanciesController(NpgsqlConnection db) =>
            this.db = db;

        [HttpPost]
        public IActionResult Add([FromBody] FavoriteVacancyDto dto)
        {
            const string sql = @"
                INSERT INTO favorite_vacancies (
                    user_id,
                    vacancy_id,
                    vacancy_name,
                    vacancy_description,
                    created_at
                )
                VALUES (
                    @UserId,
                    @VacancyId,
                    @VacancyName,
                    @VacancyDescription,
                    NOW()
                )
                ON CONFLICT (user_id, vacancy_id)
                DO UPDATE SET
                    vacancy_name = EXCLUDED.vacancy_name
                RETURNING id";

            try
            {
                var id = db.QuerySingleOrDefault<long?>(sql, dto);
                // если есть, вернём id; если нет (уже есть), вернём 200 без id
                return Ok(new { id = id });  // id может быть null
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Ошибка добавления вакансии: " + ex.Message });
            }
        }


        [HttpDelete("{vacancyId}")]
        public IActionResult Remove(int userId, long vacancyId)
        {
            const string sql = @"
            DELETE FROM favorite_vacancies
            WHERE user_id = @UserId AND vacancy_id = @VacancyId";
            db.Execute(sql, new { UserId = userId, VacancyId = vacancyId });
            return Ok();
        }

        [HttpGet]
        public IActionResult GetForUser([FromQuery] int userId)
        {
            const string sql = @"
                SELECT
                    vacancy_id AS id,
                    vacancy_name AS title,
                    created_at
                FROM favorite_vacancies
                WHERE user_id = @UserId
                ORDER BY created_at DESC";

            var rows = db.Query(sql, new
            {
                UserId = userId
            });

            return Ok(rows);
        }

    }
}
