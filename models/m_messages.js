let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let messageSchema = new Schema({
    conversation: { type: Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    sender: { type: String, required: true },
    date: { type: String, required: true }
});

module.exports = mongoose.model('Message', messageSchema);
