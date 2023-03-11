const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwt_secret = process.env.JWT_SECRET;

const fetchUser = (req,res,next)=>{
    const auth_token = req.header('auth_token');
    
    if(!auth_token){
       return  res.status(401).json({"error": "Access Denied"});
    }
    try{
        //here data is nothing but the payload which we attached to the authtoken when we signed it with our secret
        const data = jwt.verify(auth_token,jwt_secret);
        // data = {user:{id}}
        
        req.user_id = data.user.id;
        next();
    }
    catch(error){
        res.status(401).json({"error": "Access Denied"});
    }
    
    
}
module.exports = fetchUser;