const argon2 = require('argon2');

async function hashPassword(plaintextPassword) {
    if (!plaintextPassword) {
        throw new Error('Password is required');
    }
    try {
        const hash = await argon2.hash(plaintextPassword);

        return hash;
    } catch (err) {
        throw err;
    }
}

module.exports={hashPassword}