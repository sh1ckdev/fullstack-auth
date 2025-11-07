const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema ({
    username: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    roles: { type: [String], default: ['user'] },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
    yandexId: { type: String, unique: true, sparse: true, default: null },
    avatarUrl: { type: String, default: null },
    lastLoginProvider: { type: String, enum: ['local', 'yandex'], default: 'local' }
})

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;