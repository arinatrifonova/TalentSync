using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Net.Http.Headers;
using System.Text;

namespace Talentsync.CSharp.Controllers
{
    [ApiController]
    [Route("api/hh")]
    public class HhAuthController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly HhOAuthOptions _options;
        private readonly HhTokenStore _tokenStore;

        public HhAuthController(
            IHttpClientFactory httpClientFactory,
            IOptions<HhOAuthOptions> options,
            HhTokenStore tokenStore)
        {
            _httpClientFactory = httpClientFactory;
            _options = options.Value;
            _tokenStore = tokenStore;
        }

        [HttpGet("login")]
        public IActionResult Login()
        {
            Console.WriteLine("CLIENT_ID: " + _options.ClientId);
            Console.WriteLine("TOKEN = " + (_tokenStore.AccessToken ?? "NULL"));
            Console.WriteLine("EXPIRES = " + (_tokenStore.ExpiresAt?.ToString("O") ?? "NULL"));
            var url =
                $"https://hh.ru/oauth/authorize" +
                $"?response_type=code" +
                $"&client_id={Uri.EscapeDataString(_options.ClientId)}" +
                $"&redirect_uri={Uri.EscapeDataString(_options.RedirectUri)}";

            return Redirect(url);
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback([FromQuery] string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                return BadRequest("Code is required");

            var client = _httpClientFactory.CreateClient();

            var form = new Dictionary<string, string>
            {
                ["grant_type"] = "authorization_code",
                ["client_id"] = _options.ClientId,
                ["client_secret"] = _options.ClientSecret,
                ["code"] = code,
                ["redirect_uri"] = _options.RedirectUri
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://hh.ru/oauth/token")
            {
                Content = new FormUrlEncodedContent(form)
            };

            request.Headers.UserAgent.ParseAdd("TalentSyncApp");

            var response = await client.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, json);

            var token = JsonConvert.DeserializeObject<HhTokenResponse>(json);

            _tokenStore.AccessToken = token?.AccessToken;
            _tokenStore.RefreshToken = token?.RefreshToken;
            _tokenStore.ExpiresAt = token?.ExpiresIn > 0
                ? DateTimeOffset.UtcNow.AddSeconds(token.ExpiresIn)
                : null;

            Console.WriteLine("TOKEN SAVED = " + _tokenStore.AccessToken);

            return Ok(new
            {
                message = "HH token saved",
                access_token = _tokenStore.AccessToken,
                expires_at = _tokenStore.ExpiresAt
            });
        }
    }

    public class HhTokenResponse
    {
        [JsonProperty("access_token")]
        public string AccessToken { get; set; } = "";

        [JsonProperty("refresh_token")]
        public string RefreshToken { get; set; } = "";

        [JsonProperty("token_type")]
        public string TokenType { get; set; } = "";

        [JsonProperty("expires_in")]
        public int ExpiresIn { get; set; }
    }
}