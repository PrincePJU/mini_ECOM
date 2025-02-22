const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET

function setUser(user) {
    return jwt.sign(
        {
            _id: user.id,
            email: user.email,
            role: user.role
        },
        secret,
        { expiresIn: '24h' }  // Token expires in 24 hours
    )
}

function getUser(token) {   
    if(!token) return null
    try {
        const decoded = jwt.verify(token, secret);
        // Check if token is expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return null;
        }
        return decoded; 
    } catch (error) {
        console.error("JWT verification error:", error.message);
        return null; 
    }
}

module.exports={setUser,getUser}