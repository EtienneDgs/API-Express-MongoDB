const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        max: 200
    },
    email: {
        type: String,
        required: true,
        min: 5
    },
    password: {
        type: String,
        required: true,
        min: 5
    },
    Role: {
        type: String,
        default : 'user'
    },
    Date: {
        type: Date,
        default: Date.now
    },
    Subcription: {
        type: String,
        default: 'free'
    }

    // Services:
})

module.exports = mongoose.model('Users', userSchema);