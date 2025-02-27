const passwordStrengthRegex = {
    minLength: 8,
    hasUpperCase: /[A-Z]/,
    hasLowerCase: /[a-z]/,
    hasNumbers: /\d/,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
};

function validatePassword(password) {
    const errors = [];
    
    if (password.length < passwordStrengthRegex.minLength) {
        errors.push(`Password must be at least ${passwordStrengthRegex.minLength} characters long`);
    }
    if (!passwordStrengthRegex.hasUpperCase.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!passwordStrengthRegex.hasLowerCase.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!passwordStrengthRegex.hasNumbers.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!passwordStrengthRegex.hasSpecialChar.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function comparePasswords(password, confirmPassword) {
    return password === confirmPassword;
}

module.exports = {
    validatePassword,
    comparePasswords
};
