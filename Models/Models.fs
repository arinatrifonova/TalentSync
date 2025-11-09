namespace TalentSync.Models

open System
open Newtonsoft.Json

type Employer = {
    [<JsonProperty("id")>]
    id: string

    [<JsonProperty("name")>]
    name: string
}

type Vacancy = {
    [<JsonProperty("id")>]
    id: string

    [<JsonProperty("name")>]
    name: string

    [<JsonProperty("employer")>]
    employer: Employer

    [<JsonProperty("alternate_url")>]
    alternate_url: string
}

type VacancyList = {
    [<JsonProperty("items")>]
    items: Vacancy[]
}

type VacancyFull = {
    [<JsonProperty("id")>]
    id: string

    [<JsonProperty("name")>]
    name: string

    [<JsonProperty("description")>]
    description: string

    [<JsonProperty("employer")>]
    employer: Employer

    [<JsonProperty("alternate_url")>]
    alternate_url: string
}
