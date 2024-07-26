var MasterTestService = require('../services/masterTest.service')
var TestService = require('../services/test.service')
var ObjectId = require('mongodb').ObjectId

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getMasterTests = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    if (searchText) {
        query['$or'] = [{ name: { $regex: '.*' + searchText + '.*', $options: 'i' } }, { desc: { $regex: '.*' + searchText + '.*', $options: 'i' } }];
    }

    try {
        var MasterTests = await MasterTestService.getMasterTests(query, parseInt(page), parseInt(limit), order_name, Number(order))
        // Return the MasterTests list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: MasterTests, message: "Master tests recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getMasterTest = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var masterTest = await MasterTestService.getMasterTest(id)

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterTest, message: "Master test recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createMasterTest = async function (req, res, next) {
    //console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdMasterTest = await MasterTestService.createMasterTest(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdMasterTest, message: "Master test created successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateMasterTest = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedMasterTest = await MasterTestService.updateMasterTest(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedMasterTest, message: "Master test updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMasterTest = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await MasterTestService.deleteMasterTest(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createDefaultMasterTests = async function (req, res, next) {
    try {
        var locationId = req.body?.location_id || ""
        if (!locationId) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: "Location Id must be present!"
            })
        }

        var query = { location_id: locationId, status: 1 }
        var tests = await TestService.getTestsOne(query)

        if (tests && tests?.length) {
            var masterTests = await MasterTestService.getMasterTestsSimple({})
            if (masterTests && masterTests?.length) {
                var masterTestIds = masterTests.map((item) => {
                    return item?._id || ""
                })
                masterTestIds = masterTestIds.filter((x) => x != "")
                await MasterTestService.deleteMultiple({ _id: { $in: masterTestIds } })
            }

            for (let i = 0; i < tests.length; i++) {
                const element = tests[i];
                var createdMasterTest = await MasterTestService.createMasterTest(element)
            }
        }

        var masterTests = await MasterTestService.getMasterTestsSimple({})

        return res.status(200).json({ status: 200, flag: true, data: masterTests, message: "Default tests created successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.exportMasterTestDataToExcel = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var data = await MasterTestService.getExportMasterTests({ status: 1 }) || [];

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: data, message: "Service Tests exported successfully!" });
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.searchMasterTestNames = async function (req, res, next) {
    var searchText = req.query.searchText ? req.query.searchText : '';
  
    if (!searchText) {
      return res.status(200).json({ status: 200, flag: false, message: "Search text must be present!" });
    }
     // Escape special characters in the search text
     var escapedSearchText = escapeRegExp(searchText);
     var query = { name: { $regex: '.*' + escapedSearchText + '.*', $options: 'i' } };
    
    try {
        var matchingNames = await MasterTestService.searchNames(query);
      return res.status(200).json({ status: 200, flag: true, data: matchingNames, message: "Names fetched successfully!" });
    } catch (e) {
      return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
  }
  
// Helper function to escape special characters in the search text
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

