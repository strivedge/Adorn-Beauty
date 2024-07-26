// Gettign the Newly created Mongoose Model we just created 
var Test = require('../models/Test.model');
var MasterTest = require('../models/MasterTest.model');
var MasterTestService = require('../services/masterTest.service')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Test List
exports.getTests = async function (query, page, limit, order_name, order) {
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

        var Tests = await Test.aggregate(facetedPipeline);
        // Return the Testd list that was retured by the mongoose promise
        return Tests;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Tests');
    }
}

exports.getTestsOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var tests = await Test.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return tests
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Tests')
    }
}

exports.getActiveTests = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Tests = await Test.find(query)

        // Return the Testd list that was retured by the mongoose promise
        return Tests;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding Tests');
    }
}

exports.getDistinctTests = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var _details = await Test.aggregate([
            { $match: query },
            { "$sort": { "updatedAt": -1 } },
            {
                $group: {
                    "_id": "$name",
                    gender: { $first: '$gender' },
                    desc: { $first: '$desc' },
                }
            },
        ]);

        return _details;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Finding Tests');
    }
}

exports.getTest = async function (id) {
    try {
        // Find the Data 
        var _details = await Test.findOne({ _id: id });
        if (_details._id) {
            return _details;
        } else {
            return {};
        }

    } catch (e) {
        return {};
        // return a Error message describing the reason     
        //throw Error("Test not available");
    }
}

// getting all tests for company copy
exports.getTestsCompanySpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var tests = await Test.find(query);
        // Return the Serviced list that was retured by the mongoose promise
        return tests;

    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Test');
    }
}

exports.getTestsbyLocation = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var tests = await Test.find(query);

        // Return the Tests list that was retured by the mongoose promise
        return tests;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Test');
    }
}

exports.getSingleTestByName = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var tests = await Test.findOne(query);

        // Return the Tests list that was retured by the mongoose promise
        return tests;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Test');
    }
}

exports.getExportTests = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var tests = await Test.find(query).select('name desc');

        // Return the Categoryd list that was retured by the mongoose promise
        return tests;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding Categories');
    }
}

exports.getAllActiveTests = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var tests = await Test.find(query, { _id: 0 });

        // Return the Categoryd list that was retured by the mongoose promise
        return tests;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding Categories');
    }
}

exports.createMultipleTests = async function (data) {
    try {
        // Find the Data 
        var _details = await Test.insertMany(data);
        return _details;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating Test");
    }
}

exports.getMasterTestId = async function (test) {
    try {
        // Check if the test exists in the master_tests collection by name
        const existingTest = await MasterTest.findOne({ name: test.name });
        // If the test already exists, return its _id
        if (existingTest) {
            return existingTest._id;
        } else {
            var createdMasterTest = await MasterTestService.createMasterTest(test)
            // Return the _id of the newly created test
            return createdMasterTest._id;
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master test:", error);
        throw error;
    }
}

exports.createTest = async function (test) {
    var newTest = new Test({
        company_id: test.company_id ? test.company_id : "",
        location_id: test.location_id ? test.location_id : "",
        master_test_id: test.master_test_id ? test.master_test_id : null,
        name: test.name ? test.name : "",
        desc: test.desc ? test.desc : "",
        status: test.status ? test.status : 0
    })

    try {
        // Saving the Test 
        var savedTest = await newTest.save();
        return savedTest;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Test")
    }
}

exports.updateTest = async function (test) {
    var id = test._id
    try {
        //Find the old Test Object by the Id
        var oldTest = await Test.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Test")
    }

    // If no old Test Object exists return false
    if (!oldTest) { return false; }

    // Edit the Test Object
    if (test.company_id) {
        oldTest.company_id = test.company_id;
    }

    if (test.location_id) {
        oldTest.location_id = test.location_id;
    }

    if (test.master_test_id) {
        oldTest.master_test_id = test.master_test_id;
    }

    if (test.name) {
        oldTest.name = test.name
    }

    if (test.desc || test.desc == "") {
        oldTest.desc = test.desc ? test.desc : "";
    }

    if (test.status || test.status == 0) {
        oldTest.status = test.status ? test.status : 0;
    }

    try {
        var savedTest = await oldTest.save()
        return savedTest;
    } catch (e) {
        throw Error("And Error occured while updating the Test");
    }
}

exports.deleteTest = async function (id) {
    // Delete the Test
    try {
        var deleted = await Test.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Test Could not be deleted")
        }

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Test")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await Test.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Test")
    }
}