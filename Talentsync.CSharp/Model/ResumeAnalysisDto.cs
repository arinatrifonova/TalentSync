namespace Talentsync.CSharp.Model
{
    public class ResumeAnalysisDto
    {
        public int ResumeId { get; set; }
        public string VacancyId { get; set; }
        public double Score { get; set; }
        public List<string> MissingSkills { get; set; }
        public string Recommendations { get; set; }
    }
}
