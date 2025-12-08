namespace TalentSync.Utils

open System.Security.Cryptography
open System.Text

module PasswordUtils =
    let hashPassword (password: string) =
        use sha = SHA256.Create()
        password
        |> Encoding.UTF8.GetBytes
        |> sha.ComputeHash
        |> Array.map (fun b -> b.ToString("x2"))
        |> String.concat ""

    let verifyPassword (password: string) (storedHash: string) : bool =
        let hashOfInput = hashPassword password
        hashOfInput = storedHash
