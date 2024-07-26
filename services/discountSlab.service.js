// Gettign the Newly created Mongoose Model we just created 
var DiscountSlab = require('../models/DiscountSlab.model')
var Service = require('../models/Service.model')

var ImageService = require('./image.service')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the DiscountSlab List
exports.getDiscountSlabs = async function (query, page, limit, order_name, order, serachText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        if (serachText && serachText != '') {
            query['$text'] = { $search: serachText, $language: 'en', $caseSensitive: false };
        }

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

        var DiscountSlabs = await DiscountSlab.aggregate(facetedPipeline);
        // Return the DiscountSlabd list that was retured by the mongoose promise
        return DiscountSlabs;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating DiscountSlabs');
    }
}

exports.getDiscountSlabsOne = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var discountSlabs = await DiscountSlab.find(query)
            .populate({
                path: 'services',
                model: Service,
                select: {
                    _id: 1,
                     _id:1,
                    service_limit: 1,
                    name:1,
                    price:1,
                    actual_price:1,
                    variable_price:1,
                    special_price:1,
                    hide_strike_price: 1, 
                    deposite_type: 1, 
                    deposite: 1, 
                    min_deposite: 1, 
                    is_start_from: 1, 
                    start_from_title: 1, 
                    is_price_range: 1, 
                    max_price: 1, 
                    commission:1,
                    tax:1,
                    duration:1,
                    category_id:1,
                    gender:1,
                    reminder: 1,
                    online_status:1,
                    status:1,
                    test_id:1,
                    old_price:1
                }
            })
            .sort(sorts)

        return discountSlabs || []
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while getting DiscountSlabs")
    }
}

exports.getDiscountSlab = async function (id) {
    try {
        // Find the Data 
        var _details = await DiscountSlab.findOne({ _id: id })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("DiscountSlab not available")
    }
}

// getting all DiscountSlabs for company copy
exports.getDiscountSlabsSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var DiscountSlabs = await DiscountSlab.find(query)

        // Return the Serviced list that was retured by the mongoose promise
        return DiscountSlabs
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Location')
    }
}

exports.createDiscountSlab = async function (discountSlab) {
    if (discountSlab.image) {
        var isImage = await ImageService.saveImage(discountSlab.image, "/images/discount_slab/").then(data => { return data })
        //console.log('Isimage',isImage)
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            discountSlab.image = isImage
        }
    }

    var newDiscountSlab = new DiscountSlab({
        company_id: discountSlab.company_id ? discountSlab.company_id : null,
        location_id: discountSlab.location_id ? discountSlab.location_id : null,
        no_of_points: discountSlab.no_of_points ? discountSlab.no_of_points : 0,
        offer_type: discountSlab.offer_type ? discountSlab.offer_type : "",
        offer_value: discountSlab.offer_value ? discountSlab.offer_value : 0,
        services: discountSlab?.services?.length ? discountSlab.services : null,
        title: discountSlab.title ? discountSlab.title : "",
        desc: discountSlab.desc ? discountSlab.desc : "",
        image: discountSlab.image ? discountSlab.image : "",
        status: discountSlab.status ? discountSlab.status : 1
    })

    try {
        // Saving the DiscountSlab 
        var savedDiscountSlab = await newDiscountSlab.save()
        return savedDiscountSlab
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating DiscountSlab")
    }
}

exports.updateDiscountSlab = async function (discountSlab) {
    try {
        //Find the old DiscountSlab Object by the Id
        var id = discountSlab._id
        var oldDiscountSlab = await DiscountSlab.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the DiscountSlab")
    }

    // If no old DiscountSlab Object exists return false
    if (!oldDiscountSlab) {
        return false
    }

    // Edit the DiscountSlab Object
    if (discountSlab.company_id) {
        oldDiscountSlab.company_id = discountSlab.company_id
    }

    if (discountSlab.location_id) {
        oldDiscountSlab.location_id = discountSlab.location_id
    }

    if (discountSlab.no_of_points) {
        oldDiscountSlab.no_of_points = discountSlab.no_of_points
    }

    if (discountSlab.offer_type) {
        oldDiscountSlab.offer_type = discountSlab.offer_type
    }

    if (discountSlab.offer_value) {
        oldDiscountSlab.offer_value = discountSlab.offer_value
    }

    if (discountSlab.services) {
        oldDiscountSlab.services = discountSlab.services
    }

    if (discountSlab.title) {
        oldDiscountSlab.title = discountSlab.title
    }

    if (discountSlab.desc) {
        oldDiscountSlab.desc = discountSlab.desc
    }

    oldDiscountSlab.status = discountSlab.status ? discountSlab.status : 0

    if (discountSlab.image) {
        var isImage = await ImageService.saveImage(discountSlab.image, "/images/discount_slab/").then(data => { return data })
        //console.log('isImage',isImage)
        if (typeof (isImage) != undefined && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public')
            //Remove Previous User Image 
            try {
                var fs = require('fs')
                var filePath = root_path + "/" + oldDiscountSlab.image
                //console.log('file exists',fs.existsSync(filePath))
                if (oldDiscountSlab.image && fs.existsSync(filePath)) {
                    console.log("\n file exists filePath  >>>>>>", filePath, "\n");
                    fs.unlinkSync(filePath)
                }
            } catch (e) {
                //console.log(e.error)
                console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n")
            }

            // Update User Image
            oldDiscountSlab.image = isImage
        }
    }

    try {
        var savedDiscountSlab = await oldDiscountSlab.save()
        return savedDiscountSlab
    } catch (e) {
        throw Error("And Error occured while updating the DiscountSlab")
    }
}

exports.deleteDiscountSlab = async function (id) {
    // Delete the DiscountSlab
    try {
        var deleted = await DiscountSlab.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("DiscountSlab Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the DiscountSlab")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the DiscountSlab
    try {
        var deleted = await DiscountSlab.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the DiscountSlab")
    }
}