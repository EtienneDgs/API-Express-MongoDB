const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');

module.exports.blackListedTokens = [];


//Import Routes
const authRoute = require('./routes/auth');

//Middlewares
app.use(cors());
app.use(express.json());
//Routes
app.use('/api/user', authRoute);

//ROUTES
app.get('/', (req, res) => {
    res.send('We are on home')
});


//Connect to DB
mongoose.connect(process.env.DB_CONNECTION,
    {useNewUrlParser: true, useUnifiedTopology: true},
    () => console.log('connected to DB'));

//Server
app.listen(3000);
