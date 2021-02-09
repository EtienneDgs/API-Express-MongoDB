const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verify = require('../verifyToken');
const {registerValidation, loginValidation, updateValidation} = require('../validation');
require('dotenv/config');
const blackListedTokens = require('../app.js').blackListedTokens;

//Get all the users
router.get('/list', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (err) {
        res.status(404).send(err)
    }
});

//Registration
router.post('/register', async (req, res) => {
    //Validate Data before make a user
    const {error} = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Check if the user is already in the database
    const emailExist = await User.findOne({email: req.body.email});
    if (emailExist) return res.status(400).send('Email already exists');

    //Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Create a new user
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role,
        date: req.date,
        subscription: req.body.subscription
    });
    try {
        await user.save();
        res.status(200).send({user: user._id})
    } catch (err) {
        res.status(400).send({message: err});
    }
});

//LOGIN
router.post('/login', async (req, res) => {
//Validate Data before make a user
    const {error} = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    //Check if the email exist
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).send('Email or password is wrong');
    //Check is password is correct
    const validPassword = await bcrypt.compareSync(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Email or password is wrong');

    //Create and assign a token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, {expiresIn: '1h'});
    res.header('auth-token', token).send(token);
});

//User data when by request with their token
router.get('/me', verify, async (req, res) => {
    const user = await User.findOne({_id: req.user._id})
    if (!user) return res.status(400).send('User not found');

    res.status(200).send({
        name: user.username,
        email: user.email,
        created_at: user.Date
    });
});

//LOGOUT
router.post('/logout', verify, (req, res) => {
    const jwtToken = req.headers['auth-token'];
    blackListedTokens.push(jwtToken);
    console.log('blacklisted token: ', jwtToken)
    res.status(200).send();
});

//Update a user
router.patch('/:id', verify, async (req, res) => {
    //Validate Data before update a user
    const {error} = updateValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Updating
    const data = req.body;
    const object = {};
    if (data.password) {
        const salt = await bcrypt.genSalt(10);
        object.password = await bcrypt.hash(data.password, salt);
    }

    if (data.username) {
        object.username = data.username;
    }

    if (data.email) {
        object.email = data.email;
    }

    try {
        const updatedUser = await User.updateOne(
            {_id: req.params.id},
            {$set: object}
        );
        res.status(200).send(updatedUser);
    } catch (err) {
        res.status(404).send({message: err});
    }
});

//Delete by his token
router.delete('/:id/goodbye', verify, async (req, res) => {
    try {
        const removedUser = await User.deleteOne({_id: req.params.id});
        res.status(200).send(removedUser);
    } catch (err) {
        res.status(404).send({message: err});
    }
});

//Specific user
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).send(user);
    } catch (err) {
        res.status(404).send(err);
    }
});

//Delete a user
router.delete('/:id', async (req, res) => {
    try {
        const removedUser = await User.deleteOne({_id: req.params.id});
        res.status(200).send(removedUser);
    } catch (err) {
        res.status(404).send({message: err});
    }
});


module.exports = router;