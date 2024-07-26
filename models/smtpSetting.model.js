// Import Mongoose
const mongoose = require('mongoose');

// Define a schema for the WhatsApp API key data
const smtpSettingSchema = new mongoose.Schema({
    from: { type: String, required: true },
    host: { type: String,  required: true},
    port: { type: Number,  required: true},
    username: { type: String,  required: true},
    password: { type: String,  required: true},
    smtp_limit: { type: Number,  required: true},
}, {
    timestamps: true // This will add createdAt and updatedAt fields
});

// Create a model using the schema
const SMTPSetting = mongoose.model('SMTPSetting', smtpSettingSchema);

module.exports = SMTPSetting;
