// Gettign the Newly created Mongoose Model we just created 
var ConsultantServiceTypeQuestion = require('../models/ConsultantServiceTypeQuestion.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the ConsultantServiceTypeQuestions List
exports.getConsultantServiceTypeQuestions = async function (query, page, limit, order_name, order, searchText) {
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

        var consultantServiceTypeQuestions = await ConsultantServiceTypeQuestion.aggregate(facetedPipeline);
        // Return the ConsultantServiceTypeQuestions list that was retured by the mongoose promise
        return consultantServiceTypeQuestions;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating ConsultantServiceTypeQuestions');
    }
}

exports.getConsultantServiceTypeQuestionSpecific = async function (query) {
    // Options setup for the mongoose paginate
    // Try Catch the awaited promise to handle the error 
    try {
        var consultantServiceTypeQuestion = await ConsultantServiceTypeQuestion.find(query).sort({ createdAt: -1 });
        // Return the Serviced list that was retured by the mongoose promise
        return consultantServiceTypeQuestion;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating ConsultantServiceTypeQuestion');
    }
}

exports.updateManyClientData = async function (query,customer_id) {
    try {
        // Find the Data and replace booking status
        var consultantServiceTypeQuestion = await ConsultantServiceTypeQuestion.updateMany(query, {$set: {customer_id: customer_id}})

        return consultantServiceTypeQuestion;
        
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("consultantServiceTypeQuestion not available");
    }

}



exports.getManuallyDistServiceTypeQuestion = async function (query) {
    console.log("getManuallyDistServiceTypeQuestion ",query);
    try {
        var sort = {};
        sort['createdAt'] = -1;

        // const facetedPipeline = [
        //     { $distinct: 'category_id' },
        //     { $match: query },
        //     { $sort : sort },
        // ];
        // query['$sort'] = {'createdAt': -1};

        // var consultantServiceTypeQuestions = await ConsultantServiceTypeQuestion.aggregate(facetedPipeline);
        // var consultantServiceTypeQuestions = await ConsultantServiceTypeQuestion.find(query);
        var consultantServiceTypeQuestions = await ConsultantServiceTypeQuestion.distinct('category_id', query);
        console.log("getManuallyDistServiceTypeQuestion ",consultantServiceTypeQuestions);

        return consultantServiceTypeQuestions;

    } catch (e) {
        console.log("Error ",e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating ConsultantServiceTypeQuestion');
    }
}

exports.getConsultantServiceTypeQuestion = async function (id) {
    try {
        // Find the Data 
        var _details = await ConsultantServiceTypeQuestion.findOne({
            _id: id
        });
        if(_details._id) {
            return _details;
        } else {
            throw Error("ConsultantServiceTypeQuestion not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("ConsultantServiceTypeQuestion not available");
    }
}

exports.getConsultantServiceTypeQuestionUnique = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var consultantServiceTypeQuestion = await ConsultantServiceTypeQuestion.findOne(query).sort({ createdAt: -1 });
        // Return the ConsultantServiceTypeQuestion list that was retured by the mongoose promise
        return consultantServiceTypeQuestion;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding ConsultantServiceTypeQuestion');
    }
}

exports.createConsultantServiceTypeQuestion = async function (consultantServiceTypeQuestion) {
    var newConsultantServiceTypeQuestion = new ConsultantServiceTypeQuestion({
        company_id: consultantServiceTypeQuestion.company_id ? consultantServiceTypeQuestion.company_id : "",
        location_id: consultantServiceTypeQuestion.location_id ? consultantServiceTypeQuestion.location_id : "",
        customer_id: consultantServiceTypeQuestion.customer_id ? consultantServiceTypeQuestion.customer_id : "",
        category_id: consultantServiceTypeQuestion.category_id ? consultantServiceTypeQuestion.category_id : ""
    })

    try {
        // Saving the ConsultantServiceTypeQuestion
        var savedConsultantServiceTypeQuestion = await newConsultantServiceTypeQuestion.save();
        return savedConsultantServiceTypeQuestion;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating ConsultantServiceTypeQuestion")
    }
}

exports.updateConsultantServiceTypeQuestion = async function (consultantServiceTypeQuestion) {
    var id = consultantServiceTypeQuestion._id
    try {
        //Find the old ConsultantServiceTypeQuestion Object by the Id
        var oldConsultantServiceTypeQuestion = await ConsultantServiceTypeQuestion.findById(id);
        // console.log('OldConsultantServiceTypeQuestion ',oldConsultantServiceTypeQuestion)
    } catch (e) {
        throw Error("Error occured while Finding the ConsultantServiceTypeQuestion")
    }
    // If no old ConsultantServiceTypeQuestion Object exists return false
    if (!oldConsultantServiceTypeQuestion) {
        return false;
    }

    //Edit the ConsultantServiceTypeQuestion Object
    if(consultantServiceTypeQuestion.company_id) {
        oldConsultantServiceTypeQuestion.company_id = consultantServiceTypeQuestion.company_id;
    }

    if(consultantServiceTypeQuestion.location_id) {
        oldConsultantServiceTypeQuestion.location_id = consultantServiceTypeQuestion.location_id;
    }

    if(consultantServiceTypeQuestion.customer_id) {
        oldConsultantServiceTypeQuestion.customer_id = consultantServiceTypeQuestion.customer_id;
    }

    if(consultantServiceTypeQuestion.category_id) {
        oldConsultantServiceTypeQuestion.category_id = consultantServiceTypeQuestion.category_id;
    }

    try {
        var savedConsultantServiceTypeQuestion = await oldConsultantServiceTypeQuestion.save()
        return savedConsultantServiceTypeQuestion;
    } catch (e) {
        throw Error("And Error occured while updating the ConsultantServiceTypeQuestion");
    }
}

exports.deleteConsultantServiceTypeQuestion = async function (id) {
    // Delete the ConsultantServiceTypeQuestion
    try {
        var deleted = await ConsultantServiceTypeQuestion.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("ConsultantServiceTypeQuestion Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the ConsultantServiceTypeQuestion")
    }
}