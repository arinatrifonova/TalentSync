using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Talentsync.CSharp.Models;

namespace Talentsync.CSharp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VacanciesController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public VacanciesController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        // JSON сериализация десериализация
        private VacancyList DeserializeVacanciesList(string json)
        {
            return JsonConvert.DeserializeObject<VacancyList>(json);
        }

        private VacancyFull DeserializeFullVacancy(string json)
        {
            return JsonConvert.DeserializeObject<VacancyFull>(json);
        }

        private string Serialize(object data)
        {
            return JsonConvert.SerializeObject(data);
        }

        // GET /api/vacancies?query=
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("query is required");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.UserAgent.ParseAdd("TalentSyncApp/1.0");

            // 1️. Получаем список вакансий
            var listUrl = $"https://api.hh.ru/vacancies?text={Uri.EscapeDataString(query)}&area=113&per_page=20";
            var listResp = await client.GetAsync(listUrl);
            var listContent = await listResp.Content.ReadAsStringAsync();
            var vacanciesList = DeserializeVacanciesList(listContent);

            // 2️. Для каждой вакансии делаем отдельный запрос
            var fullVacanciesTasks = vacanciesList.Items.Select(async v =>
            {
                var url = $"https://api.hh.ru/vacancies/{v.Id}";
                var resp = await client.GetAsync(url);
                var content = await resp.Content.ReadAsStringAsync();
                return DeserializeFullVacancy(content);
            });

            var fullVacancies = await Task.WhenAll(fullVacanciesTasks);

            // 3️. Отправляем результат фронтенду
            var jsonResult = Serialize(fullVacancies);
            return Content(jsonResult, "application/json", Encoding.UTF8);
        }
    }
}
