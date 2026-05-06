using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Talentsync.CSharp.Model;
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
            try
            {
                return JsonConvert.DeserializeObject<VacancyList>(json);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Ошибка десериализации VacancyList: " + ex.Message);
                return new VacancyList();
            }
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
        public async Task<IActionResult> Get()
        {
            var mockPath = Path.Combine(Directory.GetCurrentDirectory(), "vacancies.mock.json");
            var mock = await System.IO.File.ReadAllTextAsync(mockPath);
            return Content(mock, "application/json", Encoding.UTF8);
            //if (string.IsNullOrWhiteSpace(query))
            //    return BadRequest("query is required");

            //var client = _httpClientFactory.CreateClient();
            //client.DefaultRequestHeaders.UserAgent.ParseAdd("TalentSyncApp");

            //var listUrl = $"https://api.hh.ru/vacancies?text={Uri.EscapeDataString(query)}&area=113&per_page=20";
            //var listResp = await client.GetAsync(listUrl);

            //var listContent = await listResp.Content.ReadAsStringAsync();

            //// 1. если HH вернул 403 или другой неполадочный статус
            //if (!listResp.IsSuccessStatusCode)
            //{
            //    Console.WriteLine($"HH error: {listResp.StatusCode}\n{listContent}");
            //    return StatusCode(500, $"Ошибка HH API: {listResp.StatusCode}, тип: {listContent}");
            //}

            //VacancyList vacanciesList;
            //try
            //{
            //    vacanciesList = JsonConvert.DeserializeObject<VacancyList>(listContent);
            //}
            //catch (Exception ex)
            //{
            //    Console.WriteLine($"Ошибка десериализации VacancyList: {ex.Message}\n{listContent}");
            //    return Ok(new VacancyFull[0]);
            //}

            //// 2. если нет вакансий или ошибка маппинга
            //if (vacanciesList == null || vacanciesList.Items == null || vacanciesList.Items.Length == 0)
            //{
            //    return Ok(new VacancyFull[0]);
            //}

            //// 3. полный запрос к каждой вакансии
            //var fullVacanciesTasks = vacanciesList.Items.Select(async v =>
            //{
            //    var url = $"https://api.hh.ru/vacancies/{v.Id}";
            //    var resp = await client.GetAsync(url);

            //    if (!resp.IsSuccessStatusCode || resp.Content == null)
            //    {
            //        return (VacancyFull)null;
            //    }

            //    var content = await resp.Content.ReadAsStringAsync();
            //    try
            //    {
            //        return JsonConvert.DeserializeObject<VacancyFull>(content);
            //    }
            //    catch
            //    {
            //        return (VacancyFull)null;
            //    }
            //});

            //var fullVacancies = await Task.WhenAll(fullVacanciesTasks);
            //fullVacancies = fullVacancies.Where(x => x != null).ToArray();

            //var jsonResult = JsonConvert.SerializeObject(fullVacancies);
            //return Content(jsonResult, "application/json", Encoding.UTF8);
        }
    }
}