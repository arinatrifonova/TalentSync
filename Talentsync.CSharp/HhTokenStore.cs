namespace Talentsync.CSharp
{
    public class HhTokenStore
    {
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public DateTimeOffset? ExpiresAt { get; set; }
    }
}
