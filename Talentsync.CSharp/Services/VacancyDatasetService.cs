using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;
using Talentsync.CSharp.Model;

namespace Talentsync.CSharp.Services
{
    public class VacancyDatasetService
    {
        public List<VacancyCsvDto> Load(string path)
        {
            using var reader = new StreamReader(path);

            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                Delimiter = ";",
                HeaderValidated = null,
                MissingFieldFound = null
            };

            using var csv = new CsvReader(reader, config);
            csv.Context.RegisterClassMap<VacancyCsvMap>();

            return csv.GetRecords<VacancyCsvDto>().ToList();
        }
    }
}
