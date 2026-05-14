namespace Talentsync.CSharp.Model
{
    public class FavoriteVacancyDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public long VacancyId { get; set; }
        public string VacancyName { get; set; } = string.Empty;
        public string VacancyDescription { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
