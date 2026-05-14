using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Text;
using Talentsync.CSharp.Model;
using Talentsync.CSharp.Services;

namespace Talentsync.CSharp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VacanciesController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly VacancyDatasetService _datasetService;

        public VacanciesController(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            VacancyDatasetService datasetService)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _datasetService = datasetService;
        }

        [HttpGet]
        public IActionResult Get([FromQuery] string? query = "developer")
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "Data", "vacancies.csv");

            var data = _datasetService.Load(path);

            Console.WriteLine($"TOTAL: {data.Count}");
            Console.WriteLine($"FIRST: {data.FirstOrDefault()?.Title}");

            if (!string.IsNullOrWhiteSpace(query))
            {
                data = data
                    .Where(v =>
                        v.Title.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                        v.Description.Contains(query, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            return Ok(data);
        }

        [HttpGet("dataset")]
        public IActionResult GetDataset()
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "Data", "vacancies.csv");

            var data = _datasetService.Load(path);

            return Ok(data);
        }

        [HttpPost("semantic-search")]
        public async Task<IActionResult> SemanticSearch([FromBody] SearchRequestDto request)
        {
            var client = _httpClientFactory.CreateClient();

            var response = await client.PostAsJsonAsync(
                "http://127.0.0.1:8000/search",
                request
            );

            var json = await response.Content.ReadAsStringAsync();

            return Content(json, "application/json");
        }
    }
}