const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchUser');

const JWT_SECRET = 'ImSk'


//ROUTE 1 : Create a user using: POST "/api/auth/createuser" -- No login required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 character').isLength({ min: 5 }),
], async (req, res) => {

    let success = false;
    //If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        //Check whether the user with this email exists already
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ success, error: "Sorry a user with this email already exists" })
        }

        //Hashing & adding Salt to the password inorder to improve the security
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        //Creating a new user, incase one doesn't exists already
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });

        //Passing the user id as JWT payload data
        const data = {
            user: { id: user.id }
        };

        //Generating a unique JWT (JSON Web Token) & sending it
        success = true;
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ success, authtoken });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
})



//ROUTE 2 : Authenticate a user using: POST "/api/auth/login" -- No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {

    let success = false;
    //If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    //De-structuring
    const { email, password } = req.body;
    try {
        //Checking the user credentials, email & password
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Please try to login with correct credentials" })
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to login with correct credentials" })
        }

        //Passing the user id as JWT payload data
        const data = {
            user: { id: user.id }
        };

        //Generating a unique JWT (JSON Web Token) & sending it
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
})


//ROUTE 3 : Get logged in user details using: POST "/api/auth/getuser" -- Login required
router.post('/getuser', fetchuser,  async (req, res) => {
    try {

        var userID = req.user.id;
        const user = await User.findById(userID).select("-password")
        res.send(user);

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
})


module.exports = router