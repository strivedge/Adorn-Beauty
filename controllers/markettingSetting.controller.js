const marketingSettingsService = require('../services/markettingSetting.service');

// Create a new marketing setting
exports.create = async (req, res) => {
    try {
        const marketingSetting = await marketingSettingsService.create(req.body);
        // Send success response
        return res.status(200).json({
            status: 200,
            flag: true,
            message: marketingSetting.message,
            data: marketingSetting || null,
        });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message
        return res.status(500).json({
            status: 500,
            flag: false,
            data: null,
            message: e.message
        });
    }
};

// Get all marketing settings
exports.getAll = async (req, res) => {
    try {
        const marketingSettings = await marketingSettingsService.getAll();
        res.status(200).json({
            status: 200,
            flag: true,
            message: marketingSettings.message,
            data: marketingSettings.data || null,
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            flag: false,
            message: 'Failed to retrieve marketing setting data',
            error: error.message
        });
    }
};

// Update a marketing setting by ID
exports.updateById = async (req, res) => {
    try {
        const marketingSetting = await marketingSettingsService.updateById(req.params.id, req.body);
        if (!marketingSetting) {
            res.status(404).json({ message: 'Data not found' });
        } else {
            res.status(200).json({
                status: 200,
                flag: true,
                message: marketingSetting.message,
                data: marketingSetting || null,
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            flag: false,
            message: 'Failed to update Marketing Setting',
            error: error.message
        });
    }
};

// Delete a marketing setting by ID
exports.deleteById = async (req, res) => {
    try {
        await marketingSettingsService.deleteById(req.params.id);
        res.status(200).json({
            status: 200,
            flag: true,
            message: 'Marketing Setting deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            flag: false,
            message: 'Failed to delete Marketing Setting',
            error: error.message
        });
    }
};


exports.checkIsSlugUnique = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    if (!req.body.slug) {
        return res.status(200).json({status: 200, flag: false, message: "slug must be present"})
    }

    var query = {slug: req.body.slug};
    if(req.body._id && req.body._id != 'undefined') {
        query['_id'] = {$nin: req.body._id};
    }

    try {
        var settings = await marketingSettingsService.getSettingSpecific(query);
        if(settings && settings._id) {
            flag = false;
            message = 'slug already exists';
        } else {
            flag = true;
            message = 'slug does not exists';
        }
        // Return the Entity list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: flag, message: message});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}