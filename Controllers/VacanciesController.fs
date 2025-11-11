namespace TalentSync.Controllers

open System
open System.Net.Http
open System.Threading.Tasks
open Microsoft.AspNetCore.Mvc
open Newtonsoft.Json
open TalentSync.Models

[<ApiController>]
[<Route("api/[controller]")>]
type VacanciesController (httpClientFactory: IHttpClientFactory) =
    inherit ControllerBase()

    let deserializeVacanciesList (json: string) : VacancyList =
        JsonConvert.DeserializeObject<VacancyList>(json)

    let deserializeFullVacancy (json: string) : VacancyFull =
        JsonConvert.DeserializeObject<VacancyFull>(json)

    let serialize (data: obj) : string =
        JsonConvert.SerializeObject(data)

    [<HttpGet>]
    member this.Get([<FromQuery>] query: string) : Task<IActionResult> =
        task {
            if String.IsNullOrWhiteSpace(query) then
                return this.BadRequest("query is required") :> IActionResult
            else
                let client = httpClientFactory.CreateClient()
                client.DefaultRequestHeaders.UserAgent.ParseAdd("TalentSyncApp/1.0")

                // 1 получаем список вакансий
                let listUrl = $"https://api.hh.ru/vacancies?text={Uri.EscapeDataString(query)}&area=113&per_page=20"
                let! listResp = client.GetAsync(listUrl)
                let! listContent = listResp.Content.ReadAsStringAsync()
                let vacanciesList = deserializeVacanciesList listContent

                // 2 для каждой вакансии полный запрос
                let! fullVacancies =
                    vacanciesList.items
                    |> Seq.map (fun v ->
                        let url = $"https://api.hh.ru/vacancies/{v.id}"
                        task {
                            let! resp = client.GetAsync(url)
                            let! content = resp.Content.ReadAsStringAsync()
                            return deserializeFullVacancy content
                        })
                    |> Task.WhenAll

                // 3 отправляем результат фронтенду
                let jsonResult = serialize fullVacancies
                //return this.Content(jsonResult, "application/json; charset=utf-8") :> IActionResult
                return this.Content(jsonResult, "application/json", System.Text.Encoding.UTF8) :> IActionResult

        }























  