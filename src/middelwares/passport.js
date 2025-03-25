const passport = require('passport'); 

passport.serializeUser((user , done) => { 
	done(null , user); 
}) 
passport.deserializeUser(function(user, done) { 
	done(null, user); 
}); 

exports.isAuthorized = (roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
        return next();
    } else {
        return responseHandler.unauthorized(res);
    }
};