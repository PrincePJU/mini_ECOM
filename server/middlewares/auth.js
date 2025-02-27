const {getUser}= require('../services/auth')

function checkForAuthentication(req, res, next) {
    const tokenCookie = req.cookies?.token; // Extract the token from cookies
    // req.user = null; // Default the user to null
    
    if (!tokenCookie) {
        return next(); // If no token, proceed to the next middleware
    }

    try {
        const user = getUser(tokenCookie); // Validate and decode the token
        req.user = user || null; // Assign the user if valid, else null
    } catch (error) {
        console.error('Authentication error:', error.message); // Log the error
        req.user = null; // Ensure the user is null if an error occurs
    }
    next(); // Continue to the next middleware
}

function restrictTo(roles=[]) {
    return function(req,res,next){
        
        if (!req.user) return res.status(401).json({message:"User not set"})
        if (!roles.includes(req.user.role)) return res.end('Unauthorized')
        next()
    }
}

module.exports={
    restrictTo,
    checkForAuthentication
}