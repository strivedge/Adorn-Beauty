// Gettign the Newly created Mongoose Model we just created 
var ServiceTypeGroup = require('../models/ServiceTypeGroup.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the ServiceTypeGroup List
exports.getServiceTypeGroups = async function (query, page, limit, order_name, order, serachText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort['category_id'] = -1;
        sort[order_name] = order;


        if(serachText && serachText != ''){
            query['$text'] = { $search: serachText, $language:'en',$caseSensitive:false};
        }

        const facetedPipeline = [
         { $match: query },
         { $sort : sort, },
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

        var ServiceTypeGroups = await ServiceTypeGroup.aggregate(facetedPipeline);
        // Return the ServiceTypeGroupd list that was retured by the mongoose promise
        return ServiceTypeGroups;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating ServiceTypeGroups');
    }
}

exports.getActiveServiceTypeGroups = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var ServiceTypeGroups = await ServiceTypeGroup.find(query)
        // Return the ServiceTypeGroupd list that was retured by the mongoose promise
        return ServiceTypeGroups;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding ServiceTypeGroups');
    }
}

exports.getServiceTypeGroupsSpecific = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // console.log('query',query)
    // Try Catch the awaited promise to handle the error 
    try {
         var ServiceTypeGroups = await ServiceTypeGroup.find(query).select({_id:1,name:1,desc:1,status:1,menu_order:1,category_id:1});
        // Return the Serviced list that was retured by the mongoose promise
        return ServiceTypeGroups;
    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating ServiceTypeGroups');
    }
}

exports.getServiceTypeGroupsbyLocation = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // console.log('query',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var ServiceTypeGroups = await ServiceTypeGroup.find(query).sort({menu_order: 1});
        // Return the Serviced list that was retured by the mongoose promise
        return ServiceTypeGroups;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating ServiceTypeGroups');
    }
}

// getting all type for company copy
exports.getTypesCompanySpecific = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // console.log('query',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var ServiceTypeGroup = await ServiceTypeGroup.find(query);
        // Return the Serviced list that was retured by the mongoose promise
        return ServiceTypeGroup;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating ServiceTypeGroups');
    }
}

exports.getServiceTypeGroup = async function (id) {
    try {
        // Find the Data 
        var _details = await ServiceTypeGroup.findOne({
            _id: id
        });
        if(_details._id) {
            return _details;
        } else {
            throw Error("ServiceTypeGroup not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("ServiceTypeGroup not available");
    }
}

exports.createServiceTypeGroup = async function (serviceTypeGroup) {
    var newServiceTypeGroup = new ServiceTypeGroup({
        location_id: serviceTypeGroup.location_id ? serviceTypeGroup.location_id : "",
        category_id: serviceTypeGroup.category_id ? serviceTypeGroup.category_id : "",
        name: serviceTypeGroup.name ? serviceTypeGroup.name : "",
        desc: serviceTypeGroup.desc ? serviceTypeGroup.desc : "",
        status: serviceTypeGroup.status ? serviceTypeGroup.status : 0,
        menu_order: serviceTypeGroup.menu_order ? serviceTypeGroup.menu_order : 0,  

    })

    try {
        // Saving the ServiceTypeGroup 
        var savedServiceTypeGroup = await newServiceTypeGroup.save();
        return savedServiceTypeGroup;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating ServiceTypeGroup")
    }
}

exports.updateServiceTypeGroup = async function (serviceTypeGroup) {
    var id = serviceTypeGroup._id
    try {
        //Find the old ServiceTypeGroup Object by the Id
        var oldServiceTypeGroup = await ServiceTypeGroup.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the ServiceTypeGroup")
    }
    // If no old ServiceTypeGroup Object exists return false
    if (!oldServiceTypeGroup) {
        return false;
    }

    //Edit the ServiceTypeGroup Object
    if(serviceTypeGroup.name){
        oldServiceTypeGroup.name = serviceTypeGroup.name;
    }

    if(serviceTypeGroup.location_id){
        oldServiceTypeGroup.location_id = serviceTypeGroup.location_id;
    }
     if(serviceTypeGroup.category_id){
        oldServiceTypeGroup.category_id = serviceTypeGroup.category_id;
    }
   
    oldServiceTypeGroup.desc = serviceTypeGroup.desc ? serviceTypeGroup.desc : "";

    oldServiceTypeGroup.status = serviceTypeGroup.status ? serviceTypeGroup.status : 0;
    oldServiceTypeGroup.menu_order = serviceTypeGroup.menu_order ? serviceTypeGroup.menu_order : 0;

    try {
        var savedServiceTypeGroup = await oldServiceTypeGroup.save()
        return savedServiceTypeGroup;
    } catch (e) {
        throw Error("And Error occured while updating the ServiceTypeGroup");
    }
}

exports.deleteServiceTypeGroup = async function (id) {
    // Delete the ServiceTypeGroup
    try {
        var deleted = await ServiceTypeGroup.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("ServiceTypeGroup Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the ServiceTypeGroup")
    }
}

// This is only for getting ServiceTypeGroup by location id with ServiceTypeGroup name
exports.getServiceTypeGroupByNameLocation = async function (query) {
    try {
        // Find the Data 
        var _details = await ServiceTypeGroup.findOne(query)
            .select({_id:1,name:1,gender:1,desc:1,before_procedure:1,after_procedure:1});
        
        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("ServiceTypeGroup not available");
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await ServiceTypeGroup.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the ServiceTypeGroup")
    }
}