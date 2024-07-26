var TestService = require('../services/test.service');
var MasterTestService = require('../services/masterTest.service')
var ObjectId = require('mongodb').ObjectID
// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getTests = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : '_id';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    if (searchText) {
        query['$or'] = [
            { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { desc: { $regex: '.*' + searchText + '.*', $options: 'i' } }
        ];
    }

    try {
        var Tests = await TestService.getTests(query, parseInt(page), parseInt(limit), order_name, Number(order))
        // Return the Tests list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Tests, message: "Tests recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getActiveTests = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    if (req.query.status == 1) {
        query['status'] = 1;
    }

    try {
        // console.log("query ",query)
        var Tests = await TestService.getActiveTests(query)
        // Return the Tests list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Tests, message: "Tests recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getTest = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var Test = await TestService.getTest(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Test, message: "Test recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// getting all tests for company copy
exports.getTestsCompanySpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var data = req.body;
    try {
        var location_id = [];
        for (var i = 0; i < data.length; i++) {
            location_id.push(data[i]);
        }
        var query = { location_id: { $in: location_id } };
        var tests = await TestService.getTestsCompanySpecific(query, page, limit)
        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: tests, message: "Services recieved successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getTestsbyLocation = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    // console.log("req Categories ",req.query)
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = { location_id: req.query.location_id };

    // console.log('getTestsbyLocation ',query)
    try {
        var tests = await TestService.getTestsbyLocation(query, page, limit)
        // console.log("tests ",tests)
        // Return the Categories list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: tests, message: "Tests recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createTest = async function (req, res, next) {
    //console.log('req body',req.body)
    try {
        if (!req.body.master_test_id) {
            var getMasterTestId = await TestService.getMasterTestId(req.body)
            req.body.master_test_id = getMasterTestId;
        }
        // Calling the Service function with the new object from the Request Body
        var createdTest = await TestService.createTest(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdTest, message: "Test created successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateTest = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedTest = await TestService.updateTest(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedTest, message: "Test updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeTest = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await TestService.deleteTest(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.importTestDataFromExcel = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var data = req.body.data;
    var location_id = req.body.location_id;
    var ignoreData = [];
    try {

        if (!location_id) {
            return res.status(200).json({
                status: 200, flag: false, data: null, message: 'Location Id must present!'
            })
        }

        if (data && data.length > 0) {
            var sQuery = { location_id: location_id }
            for (var i = 0; i < data.length; i++) {
                if (data[i]._id && data[i].name) {
                    sQuery['$or'] = [{ _id: ObjectId(data[i]._id) }, { name: data[i].name }];
                } else if (data[i].name) {
                    sQuery['name'] = data[i].name
                } else if (data[i]._id) {
                    sQuery['_id'] = ObjectId(data[i]._id)
                }
                if ((data[i].name).trim()) {
                    var tests = await TestService.getSingleTestByName(sQuery) || null;
                    if (!tests) {

                        var mtests = await MasterTestService.getMasterTestsOne({ name: data[i].name }) || [];
                        if (mtests?.length == 0) {
                            var createdMasterTest = await MasterTestService.createMasterTest(data[i])

                            data[i].master_test_id = createdMasterTest ? createdMasterTest._id : '';
                        } else {
                            data[i].master_test_id = mtests[0]._id;
                        }
                        data[i].location_id = location_id;
                        data[i].status = 1;
                        var createdTest = await TestService.createTest(data[i])
                    } else if (tests && tests._id) {
                        data[i]._id = tests._id;
                        var updateData = await TestService.updateTest(data[i])
                    }
                } else {
                    ignoreData.push(data[i])
                }
            }
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: ignoreData, message: "Import Service Test Successfully" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.exportTestDataToExcel = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var location_id = req.query.location_id
    try {
        if (!location_id) {
            return res.status(200).json({
                status: 200, flag: false, data: null, message: 'Location Id must present!'
            })
        }
        var services = await TestService.getExportTests({ status: 1, location_id: location_id }) || [];

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: services, message: "Service Tests Successfully Exported" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

