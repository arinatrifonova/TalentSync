namespace Talentsync.CSharp.Model
{
    public class VacancyDto
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Company { get; set; }
        public string Location { get; set; }
        public string SalaryText { get; set; }
    }

    public class EmployerDto
    {
        public string Name { get; set; }
    }

    public class SalaryDto
    {
        public int? From { get; set; }

        public int? To { get; set; }

        public string Currency { get; set; }
    }
}