const WhatsappApiKeyService = require('../services/whatsAppApiKey.service');

exports.CreateWhatsAppApiKey = async function (req, res, next) {
    try {
        // Extract data from the request body
        const { _id, whatsapp_setting } = req.body;

        // Create a new WhatsApp API key entry using the service
        const savedData = await WhatsappApiKeyService.createApiKey(_id, whatsapp_setting);

        // Send success response
        return res.status(200).json({
            status: 200,
            message: 'WhatsApp Api Key saved successfully',
            data: savedData || null,
        });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message
        return res.status(500).json({
            status: 500,
            data: null,
            message: e.message
        });
    }
};


exports.UpdateWhatsAppApiKey = async function (req, res, next) {
    try {
        const { id } = req.params;
        const update = req.body;
        const updatedAPIKey = await WhatsappApiKeyService.findByIdAndUpdate(id, update, { new: true });
        res.status(200).json({
            status: 200,
            message: 'WhatsApp API key updated successfully',
            data: updatedAPIKey
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Failed to update WhatsApp API key',
            error: error.message
        });
    }
};

exports.GetWhatsAppApiKey = async function (req, res, next) {
    try {
        const { id } = req.params;
        const apiKeys = await WhatsappApiKeyService.getAllWhatsAppAPIKeys(id); // Assuming WhatsAppAPIKey is your Mongoose model
        res.status(200).json({
            status: 200,
            message: 'WhatsApp API keys retrieved successfully',
            data: apiKeys
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Failed to retrieve WhatsApp API keys',
            error: error.message
        });
    }
};

exports.DeleteWhatsAppApiKey = async function (req, res, next) {
    try {
        const { id } = req.params;
        await WhatsappApiKeyService.findByIdAndDelete(id);
        res.status(200).json({
            status: 200,
            message: 'WhatsApp API key deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Failed to delete WhatsApp API key',
            error: error.message
        });
    }
};