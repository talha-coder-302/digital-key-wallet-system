const User = require(`${__models}/users`);
const { responseHandler } = require(`${__utils}/responseHandler`)
exports.isUserExist = async (req,res,next)=>{
    let userExist = await User.findOne({email:req.body.email});
    if(userExist){
        res.json({success:true,message:"User Already Exist",data:userExist});
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    if (req?.user?.role == 'Admin') {
        return next(); // User is an admin, proceed to the next middleware
    }
    return responseHandler.validationError(res, "Access denied, admin privileges required.");
};