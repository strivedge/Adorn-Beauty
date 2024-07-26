// Gettign the Newly created Mongoose Model we just created 
var Package = require('../models/Package.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Packages List
exports.getPackages = async function (query, page, limit, order_name, order) {
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
        ]

        var packages = await Package.aggregate(facetedPipeline);

        // Return the Discounts list that was retured by the mongoose promise
        return packages
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Packages')
    }
}

exports.getPackagesCount = async function (query = {}) {
    try {
        var packages = await Package.find(query).count();

        return packages;
    } catch (e) {
        throw Error('Error while Counting Packages');
    }
}

exports.getPackagesOne = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1);
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var packages = await Package.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit);

        return packages;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Packages');
    }
}

exports.getActivePackages = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var packages = await Package.find(query).select('_id').select('name').select('retail_price').select('note_for_therapist');

        // Return the Discounts list that was retured by the mongoose promise
        return packages;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Packages');
    }
}

exports.getPackage = async function (id) {
    try {
        // Find the Package 
        var _details = await Package.findOne({ _id: id });
        if (_details._id) {
            return _details;
        } else {
            return 0;
        }
    } catch (e) {
        // return a Error message describing the reason     
        //throw Error("Package not available")
        return 0;
    }
}

exports.getPackageOne = async function (query = {}) {
    try {
        // Find the Package 
        var package = await Package.findOne(query);

        return package || null;
    } catch (e) {
        // return a Error message describing the reason
        // throw Error("Package not available")
        return null;
    }
}

exports.createPackage = async function (package) {
    var newPackage = new Package({
        company_id: package.company_id ? package.company_id : "",
        location_id: package.location_id ? package.location_id : "",
        group_services: package.group_services ? package.group_services : "",
        name: package.name ? package.name : "",
        gender: package.gender ? package.gender : "",
        retail_price: package.retail_price ? package.retail_price : 0,
        note_for_therapist: package.note_for_therapist ? package.note_for_therapist : "",
        description: package.description ? package.description : "",
        no_of_days: package.no_of_days ? package.no_of_days : 0,
        is_sale_online: package.is_sale_online ? package.is_sale_online : 0,
        status: package.status ? package.status : 0
    });

    try {
        // Saving the Package 
        var savedPackage = await newPackage.save();
        return savedPackage;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Package");
    }
}

exports.updatePackage = async function (package) {
    try {
        var id = package._id;
        //Find the old Package Object by the Id
        var oldPackage = await Package.findById(id);
        // console.log('oldPackage ', oldPackage)
    } catch (e) {
        throw Error("Error occured while Finding the Package");
    }

    // If no old Package Object exists return false
    if (!oldPackage) { return false; }

    // Edit the Package Object
    if (package.company_id) {
        oldPackage.company_id = package.company_id;
    }

    if (package.location_id) {
        oldPackage.location_id = package.location_id;
    }

    if (package.name) {
        oldPackage.name = package.name;
    }

    if (package.gender) {
        oldPackage.gender = package.gender;
    }

    if (package.retail_price) {
        oldPackage.retail_price = package.retail_price;
    }

    if (package.note_for_therapist || package.note_for_therapist == "") {
        oldPackage.note_for_therapist = package.note_for_therapist ? package.note_for_therapist : "";
    }

    if (package.description || package.description == "") {
        oldPackage.description = package.description ? package.description : "";
    }

    if (package.group_services) {
        oldPackage.group_services = package.group_services;
    }

    if (package.no_of_days) {
        oldPackage.no_of_days = package.no_of_days ? package.no_of_days : 0;
    }

    if (package.is_sale_online || package.is_sale_online == 0) {
        oldPackage.is_sale_online = package.is_sale_online ? package.is_sale_online : 0;
    }

    if (package.status || package.status == 0) {
        oldPackage.status = package.status ? package.status : 0;
    }

    try {
        var savedPackage = await oldPackage.save();
        return savedPackage;
    } catch (e) {
        throw Error("And Error occured while updating the Package");
    }
}

exports.deletePackage = async function (id) {
    // Delete the Package
    try {
        var deleted = await Package.remove({ _id: id });
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Package Could not be deleted");
        }

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Package");
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await Package.remove(query);

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Package");
    }
}

// This is only for dropdown
exports.getPackagesDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var packages = await Package.find(query)
            .sort(sorts);

        return packages || [];
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown packages');
    }
}

exports.getPackagesIds = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var packages = await Package.find(query)
            .select("_id")
            .sort(sorts);

        if (packages && packages.length) {
            packages = packages.map((x) => x?._id?.toString() || "");
        }

        return packages || [];
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown packages');
    }
}
