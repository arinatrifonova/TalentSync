namespace Talentsync.CSharp.Model
{
    public class FavoriteVacancyDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string VacancyId { get; set; } = string.Empty;
        public string VacancyName { get; set; } = string.Empty;
        public string VacancyDescription { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
