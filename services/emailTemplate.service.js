// Gettign the Newly created Mongoose Model we just created 
var EmailTemplate = require('../models/EmailTemplate.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the EmailTemplates List
exports.getEmailTemplates = async function (query, page, limit, order_name, order, searchText) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        const facetedPipeline = [
            { $match: query },
            { $sort: sort },
            {
                "$facet": {
                    "data": [
                        { "$skip": page },
                        { "$limit": limit }
                    ],
                    "pagination": [
                        { "$count": "total" }
                    ]
                }
            },
        ];

        var emailTemplates = await EmailTemplate.aggregate(facetedPipeline);
        // Return the EmailTemplates list that was retured by the mongoose promise
        return emailTemplates;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating EmailTemplates');
    }
}

exports.getEmailTemplatesOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var emailTemplates = await EmailTemplate.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return emailTemplates
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating EmailTemplates')
    }
}

exports.getEmailTemplatesSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var emailTemplates = await EmailTemplate.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return emailTemplates
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating EmailTemplates')
    }
}

exports.getEmailTemplate = async function (id) {
    try {
        // Find the EmailTemplate 
        var _details = await EmailTemplate.findOne({ _id: id });

        if (_details._id) {
            return _details;
        } else {
            throw Error("EmailTemplate not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("EmailTemplate not available");
    }
}

exports.getAllEmailTemplates = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var emailTemplate = await EmailTemplate.find(query);
        // Return the EmailTemplate list that was retured by the mongoose promise
        // console.log("Email ",emailTemplate.contents)
        return emailTemplate;

    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while finding EmailTemplate');
    }
}

exports.getEmailTemplateSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var emailTemplate = await EmailTemplate.findOne(query);

        // Return the EmailTemplate list that was retured by the mongoose promise
        return emailTemplate;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while finding EmailTemplate');
    }
}

exports.createEmailTemplate = async function (emailTemplate) {
    var newEmailTemplate = new EmailTemplate({
        company_id: emailTemplate.company_id ? emailTemplate.company_id : '',
        location_id: emailTemplate.location_id ? emailTemplate.location_id : '',
        master_email_template_id: emailTemplate.master_email_template_id ? emailTemplate.master_email_template_id : null,
        name: emailTemplate.name ? emailTemplate.name : '',
        type: emailTemplate.type ? emailTemplate.type : '',
        contents: emailTemplate.contents ? emailTemplate.contents : '',
        title: emailTemplate.title ? emailTemplate.title : '',
        desc: emailTemplate.desc ? emailTemplate.desc : '', String,
    })

    try {
        // Saving the EmailTemplate 
        var savedEmailTemplate = await newEmailTemplate.save();
        return savedEmailTemplate;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating EmailTemplate")
    }
}

exports.updateEmailTemplate = async function (emailTemplate) {
    var id = emailTemplate._id
    try {
        //Find the old EmailTemplate Object by the Id
        var oldEmailTemplate = await EmailTemplate.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the EmailTemplate")
    }

    // If no old EmailTemplate Object exists return false
    if (!oldEmailTemplate) { return false; }

    if (emailTemplate.company_id) {
        oldEmailTemplate.company_id = emailTemplate.company_id;
    }

    if (emailTemplate.location_id) {
        oldEmailTemplate.location_id = emailTemplate.location_id;
    }

    if (emailTemplate.master_email_template_id) {
        oldEmailTemplate.master_email_template_id = emailTemplate.master_email_template_id;
    }

    if (emailTemplate.name) {
        oldEmailTemplate.name = emailTemplate.name;
    }

    if (emailTemplate.type) {
        oldEmailTemplate.type = emailTemplate.type;
    }

    if (emailTemplate.contents) {
        oldEmailTemplate.contents = emailTemplate.contents;
    }

    if (emailTemplate.title) {
        oldEmailTemplate.title = emailTemplate.title;
    }

    if (emailTemplate.desc) {
        oldEmailTemplate.desc = emailTemplate.desc;
    }

    try {
        var savedEmailTemplate = await oldEmailTemplate.save()
        return savedEmailTemplate;
    } catch (e) {
        throw Error("And Error occured while updating the EmailTemplate");
    }
}

exports.deleteEmailTemplate = async function (id) {
    // Delete the EmailTemplate
    try {
        var deleted = await EmailTemplate.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("EmailTemplate Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the EmailTemplate")
    }
}