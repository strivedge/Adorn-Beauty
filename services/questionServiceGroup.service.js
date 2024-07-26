// Gettign the Newly created Mongoose Model we just created 
var QuestionServiceGroup = require('../models/QuestionServiceGroup.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the QuestionServiceGroups List
exports.getQuestionServiceGroups = async function (query, page, limit,order_name,order,searchText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        // if(searchText && searchText != ''){
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

        var questionServiceGroups = await QuestionServiceGroup.aggregate(facetedPipeline);
        // Return the QuestionServiceGroups list that was retured by the mongoose promise
        return questionServiceGroups;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating QuestionServiceGroups');
    }
}

exports.getQuestionServiceGroup = async function (id) {
    try {
        // Find the QuestionServiceGroup 
        var _details = await QuestionServiceGroup.findOne({
            _id: id
        });
        if(_details._id) {
            return _details;
        } else {
            throw Error("QuestionServiceGroup not available");
        }   
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("QuestionServiceGroup not available");
    }
}

exports.getQuestionServiceGroupId = async function (id) {
    try {
        // Find the QuestionServiceGroup 
        var _details = await QuestionServiceGroup.findOne({
            _id: id
        });
       
        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("QuestionServiceGroup not available");
    }
}

exports.getQuestionServiceGroupName = async function (location_id, name) {
    try {
        // Find the QuestionServiceGroup 
        var _details = await QuestionServiceGroup.findOne({
            location_id: location_id,
            name: name
        }).sort({ createdAt: -1 });
        
        return _details; 
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("QuestionServiceGroup not available");
    }
}

exports.getQuestionServiceGroupSpecific = async function (query) {
    try {
        var questionServiceGroup = await QuestionServiceGroup.find(query);
        return questionServiceGroup;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("QuestionServiceGroup not available");
    }
}

exports.createQuestionServiceGroup = async function (questionServiceGroup) {
    var newQuestionServiceGroup = new QuestionServiceGroup({
        company_id: questionServiceGroup.company_id ? questionServiceGroup.company_id : "",
        location_id: questionServiceGroup.location_id ? questionServiceGroup.location_id : "",
        name: questionServiceGroup.name ? questionServiceGroup.name : "",
        description: questionServiceGroup.description ? questionServiceGroup.description : "",
        status: questionServiceGroup.status ? questionServiceGroup.status : 0
    })

    try {
        // Saving the QuestionServiceGroup
        var savedQuestionServiceGroup = await newQuestionServiceGroup.save();
        return savedQuestionServiceGroup;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating QuestionServiceGroup")
    }
}

exports.updateQuestionServiceGroup = async function (questionServiceGroup) {
    var id = questionServiceGroup._id
    try {
        //Find the old QuestionServiceGroup Object by the Id
        var oldQuestionServiceGroup = await QuestionServiceGroup.findById(id);
        // console.log('oldQuestionServiceGroup ',oldQuestionServiceGroup)
    } catch (e) {
        throw Error("Error occured while Finding the QuestionServiceGroup")
    }
    // If no old QuestionServiceGroup Object exists return false
    if (!oldQuestionServiceGroup) {
        return false;
    }

    //Edit the QuestionServiceGroup Object
    if(questionServiceGroup.company_id) {
        oldQuestionServiceGroup.company_id = questionServiceGroup.company_id;
    }

    if(questionServiceGroup.location_id) {
        oldQuestionServiceGroup.location_id = questionServiceGroup.location_id;
    }

    if(questionServiceGroup.name) {
        oldQuestionServiceGroup.name = questionServiceGroup.name;
    }

    
    oldQuestionServiceGroup.description = questionServiceGroup.description ? questionServiceGroup.description : "";
    oldQuestionServiceGroup.status = questionServiceGroup.status ? questionServiceGroup.status : 0;

    try {
        var savedQuestionServiceGroup = await oldQuestionServiceGroup.save()
        return savedQuestionServiceGroup;
    } catch (e) {
        throw Error("And Error occured while updating the QuestionServiceGroup");
    }
}

exports.deleteQuestionServiceGroup = async function (id) {
    // Delete the QuestionServiceGroup
    try {
        var deleted = await QuestionServiceGroup.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("QuestionServiceGroup Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the QuestionServiceGroup")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await QuestionServiceGroup.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the QuestionServiceGroup")
    }
}