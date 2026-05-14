using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Talentsync.CSharp.Model;
using Dapper;
using System.Text;

namespace Talentsync.CSharp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResumeController : ControllerBase
    {
        private readonly NpgsqlConnection db;

        public ResumeController(NpgsqlConnection db)
        {
            this.db = db;
        }

        // /api/resume (POST) — добавить резюме
        [HttpPost]
        public IActionResult CreateResume([FromBody] ResumeDto resume)
        {
            if (resume == null)
                return BadRequest("Отсутствуют данные резюме");

            // Проверка, что пользователь существует
            var userExists = db.QuerySingleOrDefault<int?>(
                "SELECT id FROM users WHERE id = @UserId",
                new { UserId = resume.UserId }
            );

            if (!userExists.HasValue)
                return BadRequest("Пользователь не существует");

            const string sql = @"
                INSERT INTO resume (
                    user_id,
                    profession,
                    full_name,
                    phone,
                    email,
                    birth_date,
                    citizenship,
                    education_place,
                    faculty,
                    specialization,
                    education_level,
                    graduation_year,
                    employment_type,
                    work_format,
                    skills,
                    about,
                    created_at
                )
                VALUES (
                    @UserId,
                    @Profession,
                    @FullName,
                    @Phone,
                    @Email,
                    @BirthDate,
                    @Citizenship,
                    @EducationPlace,
                    @Faculty,
                    @Specialization,
                    @EducationLevel,
                    @GraduationYear,
                    @EmploymentType,
                    @WorkFormat,
                    @Skills,
                    @About,
                    NOW()
                )
                RETURNING id";

            try
            {
                int newResumeId = db.QuerySingle<int>(sql, new
                {
                    resume.UserId,
                    resume.Profession,
                    resume.FullName,
                    resume.Phone,
                    resume.Email,
                    resume.BirthDate,
                    resume.Citizenship,
                    resume.EducationPlace,
                    resume.Faculty,
                    resume.Specialization,
                    resume.EducationLevel,
                    resume.GraduationYear,
                    resume.EmploymentType,
                    resume.WorkFormat,
                    resume.Skills,
                    resume.About
                });

                var response = new
                {
                    id = newResumeId,
                    message = "Резюме добавлено"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // /api/resume?userId=123 — получить резюме пользователя
        //[HttpGet]
        //public IActionResult GetResume([FromQuery] int userId)
        //{
        //    const string sql = @"
        //        SELECT
        //            id,
        //            user_id,
        //            profession,
        //            full_name,
        //            phone,
        //            email,
        //            birth_date,
        //            citizenship,
        //            education_place,
        //            education_speciality,
        //            skills,
        //            about,
        //            created_at
        //        FROM resume
        //        WHERE user_id = @UserId";

        //    var resume = db.QueryFirstOrDefault<ResumeDto>(sql, new { UserId = userId });

        //    if (resume == null)
        //        return NotFound("Резюме не найдено");

        //    return Ok(resume);
        //}

        [HttpGet]
        public IActionResult GetResumes([FromQuery] int userId)
        {
            const string sql = @"
                SELECT
                    id,
                    user_id,
                    profession,
                    full_name,
                    phone,
                    email,
                    birth_date,
                    citizenship,
                    education_place,
                    faculty,
                    specialization,
                    education_level,
                    graduation_year,
                    employment_type,
                    work_format,
                    skills,
                    about,
                    created_at
                FROM resume
                WHERE user_id = @UserId
                ORDER BY created_at DESC";

            var resumes = db.Query<ResumeDto>(sql, new { UserId = userId }).ToList();

            if (resumes.Count == 0)
                return NotFound("Резюме не найдено");

            return Ok(resumes);
        }

        // /api/resume/{id} (PUT) — обновить резюме
        [HttpPut("{id}")]
        public IActionResult UpdateResume(int id, [FromBody] ResumeDto resume)
        {
            if (resume == null)
                return BadRequest("Отсутствуют данные резюме");

            const string sql = @"
            UPDATE resume
            SET
                profession = @Profession,
                full_name = @FullName,
                phone = @Phone,
                email = @Email,
                birth_date = @BirthDate,
                citizenship = @Citizenship,
                education_place = @EducationPlace,
                faculty = @Faculty,
                specialization = @Specialization,
                education_level = @EducationLevel,
                graduation_year = @GraduationYear,
                employment_type = @EmploymentType,
                work_format = @WorkFormat,
                skills = @Skills,
                about = @About
            WHERE id = @Id";

            try
            {
                int affected = db.Execute(sql, new
                {
                    Id = id,
                    resume.Profession,
                    resume.FullName,
                    resume.Phone,
                    resume.Email,
                    resume.BirthDate,
                    resume.Citizenship,
                    resume.EducationPlace,
                    resume.Faculty,
                    resume.Specialization,
                    resume.EducationLevel,
                    resume.GraduationYear,
                    resume.EmploymentType,
                    resume.WorkFormat,
                    resume.Skills,
                    resume.About
                });

                if (affected == 0)
                    return NotFound("Резюме не найдено");

                return Ok("Резюме обновлено");
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpGet("{id}/text")]
        public IActionResult GetResumeText(int id)
        {
            const string sql = @"
                SELECT
                    profession,
                    full_name,
                    phone,
                    email,
                    citizenship,
                    education_place,
                    education_speciality,
                    skills,
                    about
                FROM resume
                WHERE id = @Id";

            var resume = db.QuerySingleOrDefault<ResumeDto>(sql, new { Id = id });

            if (resume == null)
                return NotFound();

            var text = $@"
                Профессия: {resume.Profession ?? ""}
                ФИО: {resume.FullName ?? ""}
                Телефон: {resume.Phone ?? ""}
                Email: {resume.Email ?? ""}
                Гражданство: {resume.Citizenship ?? ""}
                Учебное заведение: {resume.EducationPlace ?? ""}
                Навыки: {resume.Skills ?? ""}
                О себе: {resume.About ?? ""}
            ".Trim();

            return Content(text, "text/plain", Encoding.UTF8);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteResume(int id)
        {
            const string sql = "DELETE FROM resume WHERE id = @Id";
            int affected = db.Execute(sql, new { Id = id });

            if (affected == 0)
                return NotFound("Резюме не найдено");

            return Ok("Резюме удалено");
        }
    }
}
