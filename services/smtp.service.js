// Import the WhatsappApiKey model
const SMTPSettingModel = require('../models/smtpSetting.model');

// Service methods to interact with the database
const SMTPSettingService = {
    // Create a new WhatsApp API key entry
    createSMTPSetting: async (smtpDataArray) => {
        try {
            const results = [];
            const existingUsernames = [];

            // Iterate over each item in the smtpDataArray
            for (let smtpData of smtpDataArray) {
                // Check if the username already exists
                const existingEntry = await SMTPSettingModel.findOne({ username: smtpData.username });

                if (existingEntry) {
                    // If the username exists, add a message to the results array
                    existingUsernames.push(smtpData.username);
                    continue; // Skip to the next item in the array
                }

                // Create a new SMTPSettingModel object
                const apiKeyData = new SMTPSettingModel({
                    from: smtpData.from,
                    host: smtpData.host,
                    port: smtpData.port,
                    username: smtpData.username,
                    password: smtpData.password,
                    smtp_limit: smtpData.smtp_limit,
                });

                // Save the data to the database
                const savedData = await apiKeyData.save();
                results.push(savedData);
            }

            // Return the saved data and list of existing usernames
            return {
                savedData: results,
                message: existingUsernames.length
                    ? `The following usernames already exist and were not inserted: ${existingUsernames.join(', ')}`
                    : 'All entries were inserted successfully'
            };
        } catch (error) {
            throw new Error(`Failed to SMTP Settings: ${error.message}`);
        }
    },



    getSMTPSettings: async () => {
        try {
            const apiKeys = await SMTPSettingModel.find();
            return {
                status: 200,
                message: 'SMTP Settings data retrieved successfully',
                data: apiKeys
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Failed to retrieve SMTP Settings data',
                error: error.message
            };
        }
    },


    findByIdAndUpdate: async (updateDataArray) => {
        try {
            const bulkUpdateOperations = [];
    
            // Iterate over each update data
            let existingData;   
            for (const updateData of updateDataArray) {
                // Check if the document with the provided company ID exists
                let existingAPIKey = await SMTPSettingModel.findOne({ _id: updateData._id });
                // If the document doesn't exist, create a new one
                if (!existingAPIKey) {
                    // Create a new document
                    const apiKeyData = new SMTPSettingModel({
                        from: updateData.from,
                        host: updateData.host,
                        port: updateData.port,
                        username: updateData.username,
                        password: updateData.password,
                        smtp_limit: updateData.smtp_limit,
                    });
                    
                    // Save the data to the database
                    const savedData = await apiKeyData.save();
                    existingAPIKey = savedData; // Set the _id field
                }
    
                const { from, host, port, username, password, smtp_limit } = updateData;
    
              
                // Set the fields with update data
                existingAPIKey.from = from;
                existingAPIKey.host = host;
                existingAPIKey.port = port;
                existingAPIKey.username = username;
                existingAPIKey.password = password;
                existingAPIKey.smtp_limit = smtp_limit;
    
                // Push the update operation to the bulk operations array
                bulkUpdateOperations.push({
                    replaceOne: {
                        filter: { _id: existingAPIKey._id },
                        replacement: existingAPIKey,
                        upsert: true // Create a new document if not found
                    }
                });
            }
    
            // Perform bulk update
            const bulkUpdateResult = await SMTPSettingModel.bulkWrite(bulkUpdateOperations);
    
            return {
                status: 200,
                message: 'SMTP settings updated successfully',
                data: bulkUpdateResult
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Failed to update SMTP settings',
                error: error.message
            };
        }
    },
    




    findByIdAndDelete: async (_id) => {
        try {
                await SMTPSettingModel.findByIdAndDelete(_id);
                return {
                    status: 200,
                    message: 'SMTP data deleted successfully'
                };
        } catch (error) {
            return {
                status: 500,
                message: 'Failed to delete SMTP data',
                error: error.message
            };
        }
    }

};

module.exports = SMTPSettingService;


