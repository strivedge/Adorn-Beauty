// Gettign the Newly created Mongoose Model we just created 
var OfferEmailTemplate = require('../models/OfferEmailTemplate.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the OfferEmailTemplates List
exports.getOfferEmailTemplates = async function (query, page, limit, order_name, order, searchText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        if(searchText && searchText != ''){
            query['$text'] = { $search: searchText, $language:'en',$caseSensitive:false};
        }

        const facetedPipeline = [
         { $match: query },
         { $sort : sort },
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
        
        var offerEmailTemplates = await OfferEmailTemplate.aggregate(facetedPipeline);
        // Return the OfferEmailTemplates list that was retured by the mongoose promise
        return offerEmailTemplates;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating OfferEmailTemplates');
    }
}

exports.getOfferEmailTemplate = async function (id) {
    try {
        // Find the OfferEmailTemplate 
        var _details = await OfferEmailTemplate.findOne({
            _id: id
        });

        if(_details._id) {
            return _details;
        } else {
            throw Error("OfferEmailTemplate not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("OfferEmailTemplate not available");
    }
}

exports.getSpecificOfferEmailTemplates = async function (query) {
    // console.log('query ',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var offerEmailTemplate = await OfferEmailTemplate.find(query);
        // Return the OfferEmailTemplate list that was retured by the mongoose promise
        // console.log("Email ",OfferEmailTemplate.contents)
        return offerEmailTemplate;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while finding OfferEmailTemplate');
    }
}

exports.getOfferEmailTemplateSpecific = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // console.log('query ',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var offerEmailTemplate = await OfferEmailTemplate.findOne(query);
        // Return the OfferEmailTemplate list that was retured by the mongoose promise
        // console.log("Email ",OfferEmailTemplate.contents)
        return offerEmailTemplate;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while finding OfferEmailTemplate');
    }
}

exports.createOfferEmailTemplate = async function (offerEmailTemplate) {
    var newOfferEmailTemplate = new OfferEmailTemplate({
        location_id: offerEmailTemplate.location_id ? offerEmailTemplate.location_id: '',
        name: offerEmailTemplate.name ? offerEmailTemplate.name: 'offer_mail.hjs',
        title: offerEmailTemplate.title ? offerEmailTemplate.title: '',
        type: offerEmailTemplate.type ? offerEmailTemplate.type: 'client_offer',
        subject: offerEmailTemplate.subject ? offerEmailTemplate.subject: '',
        contents: offerEmailTemplate.contents ? offerEmailTemplate.contents: '',
        status: offerEmailTemplate.status ? offerEmailTemplate.status: '',
    })

    try {
        // Saving the OfferEmailTemplate 
        var savedOfferEmailTemplate = await newOfferEmailTemplate.save();
        return savedOfferEmailTemplate;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating OfferEmailTemplate")
    }
}

exports.updateOfferEmailTemplate = async function (offerEmailTemplate) {
    var id = offerEmailTemplate._id
    try {
        //Find the old OfferEmailTemplate Object by the Id
        var oldOfferEmailTemplate = await OfferEmailTemplate.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the OfferEmailTemplate")
    }
    // If no old OfferEmailTemplate Object exists return false
    if (!oldOfferEmailTemplate) {
        return false;
    }

    if(offerEmailTemplate.location_id) {
        oldOfferEmailTemplate.location_id = offerEmailTemplate.location_id;
    }
    if(offerEmailTemplate.title){
        oldOfferEmailTemplate.title = offerEmailTemplate.title;
    }

    if(offerEmailTemplate.subject) {
        oldOfferEmailTemplate.subject = offerEmailTemplate.subject;
    }

    if(offerEmailTemplate.contents) {
        oldOfferEmailTemplate.contents = offerEmailTemplate.contents;
    }
    oldOfferEmailTemplate.status = offerEmailTemplate.status ? offerEmailTemplate.status: 0;

    try {
        var savedOfferEmailTemplate = await oldOfferEmailTemplate.save()
        return savedOfferEmailTemplate;
    } catch (e) {
        throw Error("And Error occured while updating the OfferEmailTemplate");
    }
}

exports.deleteOfferEmailTemplate = async function (id) {
    // Delete the OfferEmailTemplate
    try {
        var deleted = await OfferEmailTemplate.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("OfferEmailTemplate Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the OfferEmailTemplate")
    }
}