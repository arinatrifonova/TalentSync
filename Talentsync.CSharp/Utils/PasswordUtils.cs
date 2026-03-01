using System.Security.Cryptography;
using System.Text;

namespace Talentsync.CSharp.Utils
{
    public class PasswordUtils
    {
        public static string hashPassword(string password)
        {
            using (var sha = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha.ComputeHash(bytes);
                var sb = new StringBuilder();
                foreach (var b in hash)
                {
                    sb.Append(b.ToString("x2"));
                }
                return sb.ToString();
            }
        }

        public static bool verifyPassword(string password, string storedHash)
        {
            var hashOfInput = hashPassword(password);
            return hashOfInput == storedHash;
        }
    }
}
