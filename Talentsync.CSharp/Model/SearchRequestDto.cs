namespace Talentsync.CSharp.Model
{
    public class SearchRequestDto
    {
        public string ResumeText { get; set; }

        public int Limit { get; set; } = 10;
    }
}