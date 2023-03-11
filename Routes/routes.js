const express = require('express');
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middlewares/fetchUser')
require('dotenv').config();

const jwt_secret = process.env.JWT_SECRET;


//ROUTE 1 : Creating a User using :POST /api/auth/create_user    without using authentication
router.post('/create_user', [body('name').isLength({ min: 5 }),
body('email').isEmail(),
body('password', "minimum password length is 8").isLength({ min: 8 })], async (req, res) => {
    try {
        
        //validationResult returns an object with the value as array of object eg. {"errors":[msg:"error"]}..... so validating the request is important    
        const errors = validationResult(req);
        //if  our errors variable is not empty then we are sending a bad request
        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }
        // else we are going to check our database for the email whether it already exists or not..... if not we are creating a new user from our request.body

        //User.findOne returns a promise and when resolved gives the data

        const user = await User.findOne({ email: req.body.email });
        //if our user variable is empty we are gonna create our user else we are gonna send a bad request
        if (user) {
            return res.status(400).json({ success:false,error: "Email already exists" });
        }



        //generating salt to be added to our passed before hashing.... it returns a promise
        const salt = await bcryptjs.genSalt(10);

        //hashing our password using bcryptjs.hash() method and thus storing it in our database..... it returns a promise
        const securePassword = await bcryptjs.hash(req.body.password, salt);

        //Data for authToken that is to be sent as a response of successful authentication

            //User.create returns a promise and when resolved gives us the data..... here we are using the .then and .catch syntax to work with promise
            User.create({
                name: req.body.name,
                email: req.body.email,
                password: securePassword
            }).then((user) => {
                const { id } = user;
                const data = { user: { id } };
                //signing jwt with our secret stored in env file...... sign is not a async function thus there is no need to await the function 
                const jwt_sign_data = jwt.sign(data, jwt_secret);
                // console.log(jwt_secret);
                // console.log(jwt_sign_data);
                // console.log(data.user.id);
                //sending web token as a response to the clients request and storing it in the clients req header
                
                res.status(200).json({ success:true, "authToken": jwt_sign_data });
            });
    }
    catch (error) {
        res.status(500).json({success:false, error: "There are errors" });
        console.error(error.message);
    }


});

//ROUTE 2 : Authenticating a User using :POST /api/auth/login logging user with email and password after authenticating
router.post('/login', [body('email', 'Enter correct email').isEmail(),
body('password', 'password cannot be blank').notEmpty()], async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json(errors);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ success: false, "error": "provide correct credentials" })
    }
    comparingPassword = await bcryptjs.compare(password, user.password);
    if (!comparingPassword) {
        return res.status(400).json({success:false,  "error": "provide correct credentials" });
    }
    const data = {
        user: {
            id: user.id
        }
    }
    const jwt_sign_data = jwt.sign(data, jwt_secret);
    console.log(jwt_sign_data);
    console.log(data.user.id);
    
    res.status(200).json({success:true,  "authToken": jwt_sign_data })


});

//ROUTE 3 : Fetching user details from the database
router.get('/getuser', fetchuser, async (req, res) => {
    try {
        const user_id = req.user_id;
        const user = await User.findById(user_id).select("-password");
        res.status(200).json(user);


    } catch (error) {
        res.status(500).json({success,  error: "Internal Server Error" });
        console.error(error.message);
    }
})



module.exports = router;