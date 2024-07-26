const MarketingSetting = require('../models/markettingSetting.model');

// Create a new marketing setting
exports.create = async (data) => {
    try {
        const marketingSetting = new MarketingSetting(data);
        await marketingSetting.save();
        return {
            status: 200,
            message: 'Marketting Settings created successfully',
            data: marketingSetting
        };
    } catch (error) {
        return {
            status: 500,
            message: 'Failed to create Marketting Settings',
            error: error.message
        };
    }
};

// Get all marketing settings
exports.getAll = async () => {
    try {
        const marketingSettings = await MarketingSetting.find();
        return {
            status: 200,
            message: 'Marketting Settings data retrieved successfully',
            data: marketingSettings
        };
    } catch (error) {
        return {
            status: 500,
            message: 'Failed to retrieve Marketting Settings data',
            error: error.message
        };
    }
};

// Update a marketing setting by ID
exports.updateById = async (id, data) => {
    try {
        const marketingSetting = await MarketingSetting.findByIdAndUpdate(id, data, { new: true });
        return {
            status: 200,
            message: 'Marketting Settings data updated successfully',
            data: marketingSetting
        };
    } catch (error) {
        return {
            status: 500,
            message: 'Failed to update Marketting Settings data',
            error: error.message
        };
    }
};

// Delete a marketing setting by ID
exports.deleteById = async (id) => {
    try {
        await MarketingSetting.findByIdAndDelete(id);
        return {
            status: 200,
            message: 'Marketting setting data deleted successfully'
        };
    } catch (error) {
        return {
            status: 500,
            message: 'Failed to delete Marketting setting data',
            error: error.message
        };
    }
};

exports.getSettingSpecific = async function(query) {
    try {
        // Find the Entity 
        var _details = await MarketingSetting.findOne(query).sort({createdAt: -1});
        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("setting not available");
    }
}