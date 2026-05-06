namespace Talentsync.CSharp.Model
{
    public class VacancyDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }  
        public EmployerDto Employer { get; set; }
        public SalaryDto Salary { get; set; }
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
