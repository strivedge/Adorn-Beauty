// Import the WhatsappApiKey model
const WhatsappApiKey = require('../models/whatsappApiKey.model');

// Service methods to interact with the database
const WhatsappApiKeyService = {
    // Create a new WhatsApp API key entry
    createApiKey: async (_id, whatsappSetting) => {
        try {
            // Create a new WhatsappApiKey object
            const apiKeyData = new WhatsappApiKey({
                companyId: _id,
                whatsappAPIKEYData: whatsappSetting
            });

            // Save the data to the database
            const savedData = await apiKeyData.save();

            // Return the saved data
            return savedData;
        } catch (error) {
            throw new Error(`Failed to create WhatsApp API key: ${error.message}`);
        }
    },


    getAllWhatsAppAPIKeys: async (companyId) => {
        try {
            const apiKeys = await WhatsappApiKey.find({ companyId });
            return {
                status: 200,
                message: 'WhatsApp API keys retrieved successfully',
                data: apiKeys
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Failed to retrieve WhatsApp API keys',
                error: error.message
            };
        }
    },


    findByIdAndUpdate: async (companyId, update) => {
        try {
            // Check if the document with the provided company ID exists
            const existingAPIKey = await WhatsappApiKey.findOne({ companyId });
            if (!existingAPIKey) {
                return {
                    status: 404,
                    message: 'WhatsApp API key not found for the provided company ID'
                };
            }
            // Update each individual whatsapp_setting subdocument or add a new one if _id is not provided
            for (const setting of update.whatsapp_setting) {
                const { _id, apiKey, mobileNumber,comment } = setting;
                if (_id) {
                    // Find the corresponding subdocument by _id
                    const subdoc = existingAPIKey.whatsappAPIKEYData.find(data => data._id.toString() === _id);
                    if (subdoc) {
                        // Update the subdocument fields
                        subdoc.apiKey = apiKey;
                        subdoc.mobileNumber = mobileNumber;
                        subdoc.comment = comment;
                        subdoc.status = 1;
                    } else {
                        // If _id is provided but not found, return an error
                        return {
                            status: 404,
                            message: `WhatsApp API key with _id ${_id} not found for the provided company ID`
                        };
                    }
                } else {
                    // If _id is not provided, create a new subdocument
                    existingAPIKey.whatsappAPIKEYData.push({ apiKey, mobileNumber, comment });
                }
            }

            // Save the updated document
            const updatedAPIKey = await existingAPIKey.save();
            return {
                status: 200,
                message: 'WhatsApp API key updated successfully',
                data: updatedAPIKey
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Failed to update WhatsApp API key',
                error: error.message
            };
        }
    },




    findByIdAndDelete: async (id) => {
        try {
            // Check if the document with the provided ID exists
            const existingAPIKey = await WhatsappApiKey.findOne({ "whatsappAPIKEYData._id": id });
            if (!existingAPIKey) {
                return {
                    status: 404,
                    message: 'WhatsApp API key not found'
                };
            }

            // Check if there is only one item in the whatsappAPIKEYData array
            if (existingAPIKey.whatsappAPIKEYData.length === 1) {
                // Remove the entire document since there is only one item in the array
                await WhatsappApiKey.findByIdAndDelete(existingAPIKey._id);
                return {
                    status: 200,
                    message: 'WhatsApp API key deleted successfully'
                };
            } else {
                // Delete the document from the array using $pull
                existingAPIKey.whatsappAPIKEYData.pull({ _id: id });

                // Save the updated document
                await existingAPIKey.save();

                return {
                    status: 200,
                    message: 'WhatsApp API key deleted successfully'
                };
            }
        } catch (error) {
            return {
                status: 500,
                message: 'Failed to delete WhatsApp API key',
                error: error.message
            };
        }
    }


};

module.exports = WhatsappApiKeyService;


