export enum Messages {
    Auth_UserNotFoundWithUsername = 'A megadott email címhez nem található felhasználó.',
    Auth_PasswordWrong = 'A megadott jelszó helytelen.',
    Auth_SuccessfulLogin = 'Sikeres bejelentkezés.',

    Auth_Register_Successful = 'Sikeres regisztráció.',
    Auth_Register_EmailAlreadyInUse = 'A megadott email cím már használatban van.',
    Auth_Register_InvalidEmail = 'Érvénytelen email cím.',
    Auth_Register_InvalidName = 'Érvénytelen név.',
    Auth_Register_WeakPassword = 'A jelszó túl gyenge. Legalább 8 karakter hosszúnak kell lennie és tartalmaznia kell nagybetűt, kisbetűt, számot és egy speciális karaktert.',
    Auth_Register_ServerError = 'Hiba történt a regisztráció során.',
}