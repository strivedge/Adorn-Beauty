// Gettign the Newly created Mongoose Model we just created 
var Marketing = require('../models/Marketing.model');
var ImageService = require('./image.service');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Marketings List
exports.getMarketings = async function (query, page, limit, order_name, order, searchText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        if (searchText && searchText != '') {
            query['$text'] = { $search: searchText, $language: 'en', $caseSensitive: false };
        }

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

        var Marketings = await Marketing.aggregate(facetedPipeline);
        // Return the Marketings list that was retured by the mongoose promise
        return Marketings;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Marketings');
    }
}

exports.getMarketing = async function (id) {
    try {
        // Find the Marketing 
        var _details = await Marketing.findOne({ _id: id })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Marketing not available")
    }
}

exports.getSpecificMarketings = async function (query) {
    // console.log('query ',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var Marketing = await Marketing.find(query);
        // Return the Marketing list that was retured by the mongoose promise
        // console.log("Email ",Marketing.contents)
        return Marketing;

    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while finding Marketing');
    }
}

exports.getMarketingSpecific = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // console.log('query ',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var Marketing = await Marketing.findOne(query);
        // Return the Marketing list that was retured by the mongoose promise
        // console.log("Email ",Marketing.contents)
        return Marketing;

    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while finding Marketing');
    }
}

exports.createMarketing = async function (marketing) {

    if (marketing.offer_image) {
        var isImage = await ImageService.saveImage(marketing.offer_image, "/images/marketing/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            marketing.offer_image = isImage;
        }
    }

    var newMarketing = new Marketing({
        location_id: marketing.location_id ? marketing.location_id : '',
        all_customer: marketing.all_customer ? marketing.all_customer : 0,
        customer_arr: marketing.customer_arr ? marketing.customer_arr : [],
        title: marketing.title ? marketing.title : '',
        email_title: marketing.email_title ? marketing.email_title : '',
        email_desc: marketing.email_desc ? marketing.email_desc : '',
        name: marketing.name ? marketing.name : 'marketing_mail.hjs',
        logo: marketing.logo ? marketing.logo : '',
        footer_logo: marketing.footer_logo ? marketing.footer_logo : '',
        offer_image: marketing.offer_image ? marketing.offer_image : '',
        email_template: marketing.email_template ? marketing.email_template : '',
        email_subject: marketing.email_subject ? marketing.email_subject : '',
        sms_text: marketing.sms_text ? marketing.sms_text : '',
        email_notification: marketing.email_notification ? marketing.email_notification : 0,
        sms_notification: marketing.sms_notification ? marketing.sms_notification : 0,
        status: marketing.status ? marketing.status : '',
    });

    try {
        // Saving the Marketing 
        var savedMarketing = await newMarketing.save();
        return savedMarketing;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating Marketing")
    }
}

exports.updateMarketing = async function (marketing) {
    var id = marketing._id
    try {
        //Find the old Marketing Object by the Id
        var oldMarketing = await Marketing.findById(id);
        console.log('oldMarketing', oldMarketing)
    } catch (e) {
        throw Error("Error occured while Finding the Marketing")
    }
    // If no old Marketing Object exists return false
    if (!oldMarketing) {
        return false;
    }
    if (marketing.location_id) {
        oldMarketing.location_id = marketing.location_id;
    }
    if (marketing.email_template) {
        oldMarketing.email_template = marketing.email_template;
    }
    if (marketing.logo) {
        oldMarketing.logo = marketing.logo;
    }
    if (marketing.footer_logo) {
        oldMarketing.footer_logo = marketing.footer_logo;
    }
    if (marketing.offer_image) {
        oldMarketing.offer_image = marketing.offer_image;
    }
    if (marketing.email_subject) {
        oldMarketing.email_subject = marketing.email_subject;
    }
    if (marketing.title) {
        oldMarketing.title = marketing.title;
    }
    if (marketing.email_title) {
        oldMarketing.email_title = marketing.email_title;
    }
    if (marketing.email_desc) {
        oldMarketing.email_desc = marketing.email_desc;
    }
    oldMarketing.all_customer = marketing.all_customer ? marketing.all_customer : 0;
    oldMarketing.customer_arr = marketing.customer_arr ? marketing.customer_arr : [];
    oldMarketing.email_notification = marketing.email_notification ? marketing.email_notification : 0;
    oldMarketing.sms_notification = marketing.sms_notification ? marketing.sms_notification : 0;
    oldMarketing.status = marketing.status ? marketing.status : 0;

    try {
        var savedMarketing = await oldMarketing.save()
        return savedMarketing;
    } catch (e) {
        console.log(e)
        throw Error("And Error occured while updating the Marketing");
    }
}

exports.deleteMarketing = async function (id) {
    // Delete the Marketing
    try {
        var deleted = await Marketing.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Marketing Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Marketing")
    }
}