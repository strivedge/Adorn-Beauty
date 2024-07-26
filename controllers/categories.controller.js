var CategoryService = require('../services/category.service')
var LocationService = require('../services/location.service')
var ServiceService = require('../services/service.service')
var QuestionService = require('../services/question.service')
var QuestionGroupService = require('../services/questionGroup.service')
var MasterCategoryService = require('../services/masterCategory.service')

const { isObjEmpty, isValidJson } = require('../helper')

const excelJS = require("exceljs");
var fs = require('fs');
var ObjectId = require('mongodb').ObjectID

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getCategories = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.query.page ? req.query.page : 0 //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000
        var order_name = req.query.order_name ? req.query.order_name : 'menu_order'
        var order = req.query.order ? req.query.order : '1'

        var query = { status: 1 }
        if (req.query.status) {
            query['status'] = 1
        }

        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
        }

        if (req.query.searchText && req.query.searchText != 'undefined') {
            query['$or'] = [
                { name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
                { gender: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }
            ]
        }

        var categories = await CategoryService.getCategories(query, parseInt(page), parseInt(limit), order_name, Number(order))

        // Return the Categories list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: categories, message: "Categories recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCategorySpecific = async function (req, res, next) {
    try {
        var query = {}
        if (req.query.status) {
            query['status'] = 1
            query['online_status'] = 1
        }

        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
        }

        // console.log("getCategorySpecific ",query)
        var category = await CategoryService.getActiveCategories(query)
        // Return the Category list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: category, message: "Categories recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getActiveCategories = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = { status: 1 };
    // if (req.query.status) {
    //     query['status' ] = 1;
    // }
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.gender && req.query.gender != 'undefined') {
        query['$or'] = [{ gender: { $eq: req.query.gender.toLowerCase() } }, { gender: { $eq: 'unisex' } }];
    }
    if (req.query.online_status && req.query.online_status == 1) {
        query['online_status'] = 1;
    }
    //console.log('getActiveCategories',query)
    try {
        var Categorys = await CategoryService.getActiveCategories(query)
        // Return the Categorys list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Categorys, message: "Categories recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCategoriesSpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        //query = {company_id: req.query.company_id,status: 1};
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        //query = {location_id: req.query.location_id,status: 1};
        query['location_id'] = req.query.location_id;
    }
    if (req.query.category_id && req.query.category_id != 'undefined') {
        query['category_id'] = req.query.category_id;
    }

    // console.log('getServiceSpecific',query)
    try {
        var Services = await CategoryService.getCategoriesSpecific(query, page, limit)
        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Services, message: "Services recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// getting all type for company copy
exports.getTypesCompanySpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    // var query = { company_id: req.query.company_id };
    var data = req.body;
    try {
        var location_id = [];
        for (var i = 0; i < data.length; i++) {
            location_id.push(data[i]);
        }
        var query = { location_id: { $in: location_id } };
        var categories = await CategoryService.getTypesCompanySpecific(query, page, limit)
        // console.log("categories len ",categories.length)
        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: categories, message: "Services recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCategoriesbyLocation = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    // console.log("req Categories ",req.query)
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = { location_id: req.query.location_id };

    // console.log('getServiceSpecific ',query)
    try {
        var categories = await CategoryService.getCategoriesbyLocation(query, page, limit)
        // console.log("categories ",categories)
        // Return the Categories list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: categories, message: "Categories recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCategory = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id

        var Category = await CategoryService.getCategory(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Category, message: "Category recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCategoryViewQuestion = async function (req, res, next) {
    try {
        if (!req.query.category_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Service type id must be present" })
        }

        var query = {}
        var gquery = {}
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id
            gquery['company_id'] = req.query.company_id
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
            gquery['location_id'] = req.query.location_id
        }

        if (req.query.category_id && req.query.category_id != 'undefined') {
            query['category_id'] = { $in: req.query.category_id }
            gquery['category_id'] = { $in: req.query.category_id }
        }

        if (req.query.status && req.query.status != 'undefined') {
            query['status'] = parseInt(req.query.status)
        }
        // console.log("getCategoryViewQuestion ",query)
        var categoryData = []
        var category = await CategoryService.getCategory(req.query.category_id)
        var groups = await QuestionService.getQuestionDisctict('que_group_id', gquery)
        for (var i = 0; i < groups.length; i++) {
            query['que_group_id'] = groups[i]
            var questions = await QuestionService.getQuestionsSpecific(query)
            if (questions && questions.length) {
                var bgroup_data = { _id: "", name: "", description: "" }
                if (groups[i]) {
                    var groupData = await QuestionGroupService.getQuestionGroupSpecific({ _id: groups[i] })
                    if (groupData.length) {
                        bgroup_data._id = groupData[0]._id
                        bgroup_data.name = groupData[0].name
                        bgroup_data.description = groupData[0].description
                    }
                }

                var data = { group_data: bgroup_data, q_data: questions }
                categoryData.push(data)
            }
        }

        // Return the Category Question list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: category, questions: categoryData, message: "Category question recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createCategory = async function (req, res, next) {
    try {
        if (!req.body.master_category_id) {
            var getMasterCategoryId = await CategoryService.getMasterCategoryId(req.body)
            req.body.master_category_id = getMasterCategoryId;
        }
        // Calling the Service function with the new object from the Request Body
        var createdCategory = await CategoryService.createCategory(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdCategory, message: "Category created successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateCategory = async function (req, res, next) {
    try {
        // Id is necessary for the update
        if (!req.body._id) {
            return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
        }

        var updatedCategory = await CategoryService.updateCategory(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedCategory, message: "Category Updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeCategory = async function (req, res, next) {
    try {
        var id = req.params.id
        if (!id) {
            return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
        }

        var deleted = await CategoryService.deleteCategory(id)
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMultipleCategory = async function (req, res, next) {

    var ids = req.body.ids;
    if (ids.length == 0) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var query = {
            _id: { $in: req.body.ids }
        };

        var deleted = await CategoryService.updateManyCategoriesStatus(query)

        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        console.log(e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for getting branches Service Type
exports.getServiceTypes = async function (req, res, next) {
    try {
        var branch_name = req.params.location
        var service_type = req.params.service_type
        if (!branch_name) {
            return res.status(200).json({ status: 200, flag: true, message: "Branch must be present!" })
        }

        if (!service_type) {
            return res.status(200).json({ status: 200, flag: true, message: "Service must be present!" })
        }

        // console.log("Branch Name ",branch_name," Service Type ",service_type)
        var lname = branch_name.replace(/[-]+/g, " ").toLowerCase()
        lname = lname.replace(/[$]+/g, "(").toLowerCase()
        lname = lname.replace(/[&]+/g, ")").toLowerCase()
        lname = lname.replace(/[_]+/g, "/").toLowerCase()
        // console.log("lname ",lname)

        var location = await LocationService.getLocationCompanySpecific({ status: 1 })
        loc_ind = location.findIndex(x => x.name.toLowerCase() === lname)
        // console.log("Location ",location.length)
        // console.log("sub_ind ",location[loc_ind])
        if (loc_ind != -1) {
            if (location[loc_ind] && location[loc_ind]._id) {
                var sname = service_type.replace(/[-]+/g, " ").toLowerCase()
                sname = sname.replace(/[_]+/g, "/").toLowerCase()
                var squery = { location_id: location[loc_ind]._id, name: { '$regex': sname, '$options': 'i' } }
                // console.log("squery ",squery);
                var category = await CategoryService.getCategoryByNameLocation(squery)
                if (category && category.gender) {
                    category.gender = category.gender.charAt(0).toUpperCase() + category.gender.slice(1)
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: category, message: "Services recieved successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.searchCategoryService = async function (req, res, next) {
    try {
        var location_id = req.query.location_id
        var category = req.query.category
        if (!location_id || !category) {
            return res.status(200).json({ status: 200, flag: false, message: "Location Id and category must be present!" })
        }

        var query = { status: 1 }
        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
        }

        if (req.query.category && req.query.category != 'undefined') {
            query['name'] = { '$regex': category.replace(/[-]+/g, " ").toLowerCase(), '$options': 'i' }
        }

        var categoryData = { category: null, services: [] }
        var category = await CategoryService.getCategoryByNameLocation(query)
        if (category && category._id) {
            categoryData.category = category

            var service = await ServiceService.getSortServicesbyLocation({ location_id: location_id, category_id: category._id, status: 1 })
            if (service && service.length) {
                categoryData.services = service
            }
        }

        res.status(200).send({ status: 200, flag: true, data: categoryData, message: "Category received successfully... " })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for dropdown
exports.getCategoriesDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : 'menu_order'
        var order = req.query?.order ? req.query.order : '1'
        var search = req.query?.searchText ? req.query.searchText : ""
        var onlineStatus = req.query?.online_status || 0

        var query = {}
        var existQuery = {}
        if (req.query?.status == "active") {
            query['status'] = 1
        }

        if (onlineStatus == 1) {
            query['online_status'] = 1
        }

        if (req.query?.company_id) {
            query['company_id'] = req.query.company_id
        }

        if (req.query?.location_id) {
            query['location_id'] = req.query.location_id
        }

        if (req.query?.gender) {
            query['gender'] = { $in: [req.query.gender.toLowerCase(), 'unisex'] }
        }

        if (req.query?.id) {
            query['_id'] = req.query.id
        }

        if (req.query?.ids && isValidJson(req.query.ids)) {
            var ids = JSON.parse(req.query.ids)
            query['_id'] = { $nin: ids }
            existQuery['_id'] = { $in: ids }
        }

        if (search) {
            query['$or'] = [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { gender: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        }

        var existCategories = []
        if (!isObjEmpty(existQuery)) {
            existCategories = await CategoryService.getCategoriesDropdown(existQuery, orderName, order) || []
        }

        var categories = await CategoryService.getCategoriesDropdown(query, orderName, order) || []
        categories = existCategories.concat(categories) || []

        return res.status(200).send({ status: 200, flag: true, data: categories, message: "Categories dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

exports.importCategoryDataFromExcel = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var data = req.body.data;
    var location_id = req.body.location_id
    var ignoreData = [];
    try {
        if (!location_id) {
            return res.status(200).json({
                status: 200, flag: false, data: null, message: 'Localtion Id required'
            })
        }
        var genderArr = ['male', 'female', 'unisex'];
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

                if ((data[i].name).trim() && data[i].gender && genderArr.includes(data[i].gender.toLowerCase())) {
                    var category = await CategoryService.checkCategoryExist(sQuery) || null;
                    if (!category) {

                        var mcat = await MasterCategoryService.getMasterCategoriesOne({ name: data[i].name }) || [];
                        if (mcat?.length == 0) {
                            data[i].status = 1;
                            var createdMasterCat = await MasterCategoryService.createMasterCategory(data[i])

                            data[i].master_category_id = createdMasterCat ? createdMasterCat._id : '';
                        } else {
                            data[i].master_category_id = mcat[0]._id;
                        }

                        data[i].location_id = location_id;
                        data[i].status = 1;
                        data[i].show_to_mobile_app = 1;
                        var createdData = await CategoryService.createCategory(data[i])
                    } else if (category && category._id) {
                        data[i]._id = category._id;
                        var updateData = await CategoryService.updateCategory(data[i])
                    }
                } else {
                    ignoreData.push(data[i])

                }
            }
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: data, ignoreData: ignoreData, message: "Import Category Successfully" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}


exports.exportCategoryDataToExcel = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var location_id = req.body.location_id
    var cat_ids = req.body.cat_ids ?? [];
    var searchText = req.body.searchText ?? '';
    try {

        if (!location_id) {
            return res.status(200).json({
                status: 200, flag: false, data: null, message: 'Localtion Id required'
            })
        }
        var query = { status: 1, location_id: location_id };

        if (cat_ids && cat_ids.length > 0) {
            query['_id'] = { $in: cat_ids }
        }

        if (searchText) {
            query['$or'] = [
                { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { gender: { $regex: '.*' + searchText + '.*', $options: 'i' } }
            ]
        }

        var categories = await CategoryService.getExportCategories(query) || [];

        // const workbook = new excelJS.Workbook(); 
        // const worksheet = workbook.addWorksheet("category");

        // // Define columns in the worksheet 
        // worksheet.columns = [ 
        //     { header: "Name", key: "name", width: 15 }, 
        //     { header: "Gender", key: "gender", width: 10 }, 
        //     { header: "desc", key: "desc", width: 25 }, 
        //     { header: "Before Procedure", key: "before_procedure", width: 15 }, 
        // ];

        // // Add data to the worksheet 
        // categories.forEach(cat => { worksheet.addRow(cat); });
        // var file_name = new Date().getTime()+'.xlsx'
        // var file_path = 'public/export/category/category-'+file_name;

        // var mkDir = await fs.promises.mkdir('public/export/category', { recursive: true })

        // await workbook.xlsx.writeFile(file_path);

        // var full_path = process.env?.API_URL+'/'+file_path

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: categories, message: "Categories Successfully Exported" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}