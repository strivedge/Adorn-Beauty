// Import Mongoose
const mongoose = require('mongoose');

// Define a schema for the WhatsApp API key data
const whatsappApiKeySchema = new mongoose.Schema({
    companyId: {
        type: String,
        required: true
    },
    whatsappAPIKEYData: [{
        apiKey: {
            type: String,
            required: true
        },
        mobileNumber: {
            type: String,
            required: true
        },
        comment: {
            type: String,
        },
        status: { type: Number, default: 1 } 
    }]
});

// Create a model using the schema
const WhatsappApiKey = mongoose.model('WhatsappApiKey', whatsappApiKeySchema);

module.exports = WhatsappApiKey;
