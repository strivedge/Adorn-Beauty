// Gettign the Newly created Mongoose Model we just created 
var QuickContactTemplate = require('../models/QuickContactTemplate.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the QuickContactTemplate List
exports.getQuickContactTemplates = async function (query, page, limit,order_name,order,searchText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        // if(searchText && searchText != '') {
        //     query['$text'] = { $search: searchText, $language:'en',$caseSensitive:false};
        // }

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
        
        var QuickContactTemplates = await QuickContactTemplate.aggregate(facetedPipeline);
        // Return the QuickContactTemplated list that was retured by the mongoose promise
        return QuickContactTemplates;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating QuickContactTemplates');
    }
}

exports.getActiveQuickContactTemplates = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var QuickContactTemplates = await QuickContactTemplate.find(query)
        // Return the QuickContactTemplated list that was retured by the mongoose promise
        return QuickContactTemplates;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding QuickContactTemplates');
    }
}

exports.getQuickContactTemplate = async function (id) {
    try {
        // Find the Data 
        var _details = await QuickContactTemplate.findOne({
            _id: id
        });
        if(_details._id) {
            return _details;
        } else {
            throw Error("QuickContactTemplate not available");
        }
        
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("QuickContactTemplate not available");
    }
}

// getting all QuickContactTemplates for company copy
exports.getQuickContactTemplatesCompanySpecific = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // console.log('query',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var QuickContactTemplates = await QuickContactTemplate.find(query);
        // Return the Serviced list that was retured by the mongoose promise
        return QuickContactTemplates;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating QuickContactTemplate');
    }
}

exports.getQuickContactTemplatesbyLocation = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // console.log('query ',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var QuickContactTemplates = await QuickContactTemplate.find(query);
        // Return the QuickContactTemplates list that was retured by the mongoose promise
        return QuickContactTemplates;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating QuickContactTemplate');
    }
}


exports.createQuickContactTemplate = async function (quickContactTemplate) {
    var newQuickContactTemplate = new QuickContactTemplate({
        company_id: quickContactTemplate.company_id ? quickContactTemplate.company_id : "",
        location_id: quickContactTemplate.location_id ? quickContactTemplate.location_id : "",
        name: quickContactTemplate.name ? quickContactTemplate.name : "",
        desc: quickContactTemplate.desc ? quickContactTemplate.desc : "",
        status: quickContactTemplate.status ? quickContactTemplate.status : 0  
    })

    try {
        // Saving the QuickContactTemplate 
        var savedQuickContactTemplate = await newQuickContactTemplate.save();
        return savedQuickContactTemplate;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating QuickContactTemplate")
    }
}

exports.updateQuickContactTemplate = async function (quickContactTemplate) {
    var id = quickContactTemplate._id
    try {
        //Find the old QuickContactTemplate Object by the Id
        var oldQuickContactTemplate = await QuickContactTemplate.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the QuickContactTemplate")
    }
    // If no old QuickContactTemplate Object exists return false
    if (!oldQuickContactTemplate) {
        return false;
    }

    //Edit the QuickContactTemplate Object
    if(quickContactTemplate.name) {
        oldQuickContactTemplate.name = quickContactTemplate.name
    }

    if(quickContactTemplate.company_id) {
        oldQuickContactTemplate.company_id = quickContactTemplate.company_id;
    }
    if(quickContactTemplate.location_id) {
        oldQuickContactTemplate.location_id = quickContactTemplate.location_id;
    }
   
    oldQuickContactTemplate.desc = quickContactTemplate.desc ? quickContactTemplate.desc : "";
    oldQuickContactTemplate.status = quickContactTemplate.status ? quickContactTemplate.status : 0;


    try {
        var savedQuickContactTemplate = await oldQuickContactTemplate.save()
        return savedQuickContactTemplate;
    } catch (e) {
        throw Error("And Error occured while updating the QuickContactTemplate");
    }
}

exports.deleteQuickContactTemplate = async function (id) {
    // Delete the QuickContactTemplate
    try {
        var deleted = await QuickContactTemplate.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("QuickContactTemplate Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the QuickContactTemplate")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await QuickContactTemplate.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the QuickContactTemplate")
    }
}