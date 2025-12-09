export function validatePassword(password: string): boolean {
    // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    return re.test(password);
}

export function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validateName(username: string): boolean {
    // Alphanumeric characters, 3-16 characters long
    const re = /^[a-zA-Z0-9]{3,16}$/;
    return re.test(username);
}