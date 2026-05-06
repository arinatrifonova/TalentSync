namespace Talentsync.CSharp.Model
{
    public class ResumeDto
    {
        public int? Id { get; set; }
        public int UserId { get; set; }
        public string Profession { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime? BirthDate { get; set; }
        public string Citizenship { get; set; } = string.Empty;
        public string EducationPlace { get; set; } = string.Empty;     
        
        public string Faculty { get; set; } = string.Empty;          
        public string Specialization { get; set; } = string.Empty;     
        public string EducationLevel { get; set; } = string.Empty; 
        public int? GraduationYear { get; set; }   
        public string EmploymentType { get; set; } = string.Empty;       
        public string WorkFormat { get; set; } = string.Empty;          

        public string Skills { get; set; } = string.Empty;
        public string About { get; set; } = string.Empty;
    }
}