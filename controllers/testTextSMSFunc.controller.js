const { sendWhatsAppTextTestMessage,sendSMSTestMessage } = require('../services/testTextSMSFunc.service');
var WhatsAppLog = require('../models/WhatsAppLog.model')

const sendWhatsAppMessageTest = async (req, res) => {
    var mobile = "8264273308"
    var client_id = null;
    const logId = '651fcc986cb4d67f0a60bf36';
    const log = await WhatsAppLog.findOne({ _id: logId });
    var message = log.content;
    const formattedMessage = message.replace(/\\n/g, '\n');
    const locationId = '-=-=-=-='; // Static location ID for testing

    console.log(log,"log",message,"msg");
    // if (!mobile || !client_id || !message) {
    //     return res.status(400).send({ error: 'Missing required fields: mobile, client_id, and message' });
    // }

    try {
        const response = await sendWhatsAppTextTestMessage({
            PhoneNumber: mobile,
            Message: formattedMessage
        }, locationId, client_id, 'direct');
        console.log(response,"response");
        if (response) {
            res.status(200).send({ success: true, data: response });
        } else {
            res.status(500).send({ success: false, error: 'Failed to send WhatsApp message' });
        }
    } catch (error) {
        console.log(error,"error");
        console.error('Error sending WhatsApp message:', error);
        res.status(500).send({ success: false, error: 'Failed to send WhatsApp message' });
    }
};

const sendSMSTest = async (req, res) => {
    var mobile = "+918264273308";
    var client_id = null;
    const logId = '651fcc986cb4d67f0a60bf36';

    try {
        const log = await WhatsAppLog.findOne({ _id: logId });

        var message = log.content;
        const formattedMessage = message.replace(/\\n/g, '\n');
        const locationId = 'static-location-id'; // Static location ID for testing

        console.log(log, "log", message, "msg",formattedMessage,"formattedMessage");

        try {
            const response = await sendSMSTestMessage({
                PhoneNumber: mobile,
                Message: formattedMessage
            }, locationId, client_id, 'direct');

            console.log(response, "response");

            if (response) {
                res.status(200).send({ success: true, data: response });
            } else {
                res.status(500).send({ success: false, error: 'Failed to send SMS message' });
            }
        } catch (error) {
            console.log(error, "error");
            console.error('Error sending SMS message:', error);
            res.status(500).send({ success: false, error: 'Failed to send SMS message' });
        }
    } catch (error) {
        console.error('Error fetching log:', error);
        res.status(500).send({ success: false, error: 'Failed to fetch log' });
    }
};

module.exports = {
    sendWhatsAppMessageTest,
    sendSMSTest
};
