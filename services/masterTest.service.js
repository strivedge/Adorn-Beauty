// Gettign the Newly created Mongoose Model we just created 
var MasterTest = require('../models/MasterTest.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the MasterTest List
exports.getMasterTests = async function (query, page, limit, order_name, order) {
    // Options setup for the mongoose paginate
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
            }
        ];

        var masterTests = await MasterTest.aggregate(facetedPipeline);

        // Return the MasterTestd list that was retured by the mongoose promise
        return masterTests;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterTests');
    }
}

exports.getMasterTestsOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterTests = await MasterTest.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterTests
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterTests')
    }
}

exports.getMasterTestsSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterTests = await MasterTest.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterTests
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterTests')
    }
}

exports.getMasterTest = async function (id) {
    try {
        // Find the Data 
        var _details = await MasterTest.findOne({ _id: id });

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        //throw Error("MasterTest not available");
        return null;
    }
}

exports.getExportMasterTests = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var masterTests = await MasterTest.find(query)
            .select('name desc');

        // Return the Categoryd list that was retured by the mongoose promise
        return masterTests;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding MasterTests');
    }
}

exports.createMultipleMasterTests = async function (data) {
    try {
        // Find the Data 
        var _details = await MasterTest.insertMany(data);
        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterTest");
    }
}

exports.createMasterTest = async function (masterTest) {
    var newMasterTest = new MasterTest({
        name: masterTest.name ? masterTest.name : "",
        desc: masterTest.desc ? masterTest.desc : "",
        status: masterTest.status ? masterTest.status : 0
    })

    try {
        // Saving the MasterTest 
        var savedMasterTest = await newMasterTest.save();
        return savedMasterTest;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterTest")
    }
}

exports.updateMasterTest = async function (masterTest) {
    var id = masterTest._id
    try {
        //Find the old MasterTest Object by the Id
        var oldMasterTest = await MasterTest.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the MasterTest")
    }

    // If no old MasterTest Object exists return false
    if (!oldMasterTest) { return false; }

    //Edit the MasterTest Object
    if (masterTest.name) {
        oldMasterTest.name = masterTest.name
    }

    if (masterTest.desc || masterTest.desc == "") {
        oldMasterTest.desc = masterTest.desc ? masterTest.desc : "";
    }

    if (masterTest.status || masterTest.status == 0) {
        oldMasterTest.status = masterTest.status ? masterTest.status : 0;
    }

    try {
        var savedMasterTest = await oldMasterTest.save()
        return savedMasterTest;
    } catch (e) {
        throw Error("And Error occured while updating the MasterTest");
    }
}

exports.deleteMasterTest = async function (id) {
    // Delete the MasterTest
    try {
        var deleted = await MasterTest.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("MasterTest Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterTest")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await MasterTest.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterTest")
    }
}

exports.searchNames = async function (query) {
    try {
        // Fetch matching names from the database
        let names = await MasterTest.find(query, { name: 1 }); // Limit to 10 results for example
        return names;
    } catch (e) {
        // Handle the error
        throw Error('Error while searching names: ' + e.message);
    }
}