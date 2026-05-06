using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Talentsync.CSharp.Model;

namespace Talentsync.CSharp.Controllers
{
    [ApiController]
    [Route("api/analysis")]
    public class ResumeAnalysisController : ControllerBase
    {
        private readonly NpgsqlConnection db;

        public ResumeAnalysisController(NpgsqlConnection db) =>
            this.db = db;

        [HttpPost]
        public IActionResult Create([FromBody] ResumeAnalysisDto dto)
        {
            const string sql = @"
                WITH ins AS (
                    INSERT INTO resume_analysis (
                        resume_id,
                        vacancy_id,
                        missing_skills,
                        score,
                        recommendations,
                        created_at
                    )
                    VALUES (
                        @ResumeId,
                        @VacancyId,
                        @MissingSkills,
                        @Score,
                        @Recommendations,
                        NOW()
                    )
                    RETURNING id
                )
                SELECT id FROM ins";

            try
            {
                var id = db.QuerySingle<int>(sql, new
                {
                    dto.ResumeId,
                    dto.VacancyId,
                    MissingSkills = dto.MissingSkills == null
                        ? null
                        : string.Join(", ", dto.MissingSkills),
                    dto.Score,
                    dto.Recommendations
                });

                return Ok(new { id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Ошибка сохранения анализа: " + ex.Message });
            }
        }
        //public IActionResult Create([FromBody] ResumeAnalysisDto dto)
        //{
        //    const string sql = @"
        //        INSERT INTO resume_analysis (
        //            resume_id,
        //            vacancy_id,
        //            missing_skills,
        //            score,
        //            recommendations,
        //            created_at
        //        )
        //        VALUES (
        //            @ResumeId,
        //            @VacancyId,
        //            @MissingSkills,
        //            @Score,
        //            @Recommendations,
        //            NOW()
        //        )";

        //    try
        //    {
        //        db.Execute(sql, new
        //        {
        //            dto.ResumeId,
        //            dto.VacancyId,
        //            MissingSkills = dto.MissingSkills == null
        //                ? null
        //                : string.Join(", ", dto.MissingSkills),
        //            dto.Score,
        //            dto.Recommendations
        //        });

        //        return Ok(new { id = db.ExecuteScalar<int>("SELECT currval('resume_analysis_id_seq')") });
        //    }
        //    catch (Exception ex)
        //    {
        //        // Логировать ex.Message
        //        return StatusCode(500, new { error = "Ошибка сохранения анализа: " + ex.Message });
        //    }
        //}
    }
}
