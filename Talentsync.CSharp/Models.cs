using Newtonsoft.Json;

namespace Talentsync.CSharp.Models
{
    public class Vacancy
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("employer")]
        public Employer Employer { get; set; }

        [JsonProperty("alternate_url")]
        public string AlternateUrl { get; set; }
    }

    public class Employer
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }
    }

    public class VacancyFull
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("employer")]
        public Employer Employer { get; set; }

        [JsonProperty("alternate_url")]
        public string AlternateUrl { get; set; }
    }

    public class VacancyList
    {
        [JsonProperty("items")]
        public Vacancy[] Items { get; set; }
    }
}
