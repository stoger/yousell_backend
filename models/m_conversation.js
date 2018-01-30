let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let conversationSchema = new Schema({
   conversation_between: [{ type: String, required: true, limit: 2 }],
});

module.exports = mongoose.model('Conversation', conversationSchema);