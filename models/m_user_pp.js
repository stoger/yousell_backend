let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let userSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});

userSchema.statics.validatePassword = (password) => {
    console.log(this.password === password);
    return true;
}

let userSchemaFinal = mongoose.model('User', userSchema, 'users');

module.exports = userSchemaFinal;