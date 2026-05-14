using CsvHelper.Configuration;

namespace Talentsync.CSharp.Model
{
    public class VacancyCsvMap : ClassMap<VacancyCsvDto>
    {
        public VacancyCsvMap()
        {
            Map(x => x.Id).Index(0);
            Map(x => x.Title).Index(2);
            Map(x => x.Salary).Index(3);
            Map(x => x.Experience).Index(4);
            Map(x => x.JobType).Index(5);
            Map(x => x.Description).Index(6);
            Map(x => x.KeySkills).Index(7);
            Map(x => x.Company).Index(8);
            Map(x => x.Location).Index(9);
            Map(x => x.DateOfPost).Index(10);
        }
    }
}