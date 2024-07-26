const SMTPSettingService =  require('../services/smtp.service');

exports.CreateSMTPSetting = async function (req, res, next) {
    try {
        // Extract data from the request body
        const smtpDataArray = req.body.smtp_setting;

        // Check if the request body is an array
        if (!Array.isArray(smtpDataArray)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid data format. Expected an array of SMTP settings.',
                data: null
            });
        }

        // Create new SMTP settings entries using the service
        const result = await SMTPSettingService.createSMTPSetting(smtpDataArray);

        // Send success response
        return res.status(200).json({
            status: 200,
            message: result.message,
            data: result.savedData || null,
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



exports.UpdateSMTPSetting = async function (req, res, next) {
    try {
        const  smtpDataArray  = req.body.smtp_setting;
        const updatedAPIKey = await SMTPSettingService.findByIdAndUpdate(smtpDataArray);
        res.status(200).json({
            status: 200,
            message: 'SMTP Setting data updated successfully',
            data: updatedAPIKey
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Failed to update SMTP Setting data',
            error: error.message
        });
    }
};

exports.GetSMTPSettingData = async function (req, res, next) {
    try {
        const apiKeys = await SMTPSettingService.getSMTPSettings(); // Assuming WhatsAppAPIKey is your Mongoose model
        res.status(200).json({
            status: 200,
            message: 'SMTP Setting data retrieved successfully',
            data: apiKeys
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Failed to retrieve SMTP Setting Data',
            error: error.message
        });
    }
};

exports.DeleteSMTPSetting = async function (req, res, next) {
    try {
        const _id = req.params.id;
        let deletedData = await SMTPSettingService.findByIdAndDelete(_id);
        res.status(200).json({
            status: 200,
            message: 'SMTP Setting deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Failed to delete SMTP Setting',
            error: error.message
        });
    }
};