// Gettign the Newly created Mongoose Model we just created 
var AppVersion = require('../models/AppVersion.model');
var ImageService = require('./image.service');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the AppVersion List
exports.getAppVersions = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    console.log(options)
    // Try Catch the awaited promise to handle the error 
    try {
        var appVersions = await AppVersion.paginate(query, options)
        // Return the AppVersion list that was retured by the mongoose promise
        return appVersions;

    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating AppVersions');
    }
}

exports.getAppVersion = async function (id) {
    try {
        // Find the AppVersion 
        var _details = await AppVersion.findOne({
            _id: id
        });
        if (_details._id) {
            return _details;
        } else {
            throw Error("AppVersion not available");
        }

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("AppVersion not available");
    }

}

exports.createAppVersion = async function (appVersion) {
    if (appVersion.logo) {
        var isImage = await ImageService.saveImage(appVersion.logo, "/images/appVersions/logo/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            appVersion.logo = isImage;
        }
    }

    var newAppVersion = new AppVersion({
        android_version: appVersion.android_version ? appVersion.android_version : "",
        ios_version: appVersion.ios_version ? appVersion.ios_version : "",
        android_url: appVersion.android_url ? appVersion.android_url : "",
        ios_url: appVersion.ios_url ? appVersion.ios_url : "",
        main_url: appVersion.main_url ? appVersion.main_url : "",
        maintenance: appVersion.maintenance ? appVersion.maintenance : 0,
        limit: appVersion.limit ? appVersion.limit : "",
        logo: appVersion.logo ? appVersion.logo : "",
    })

    try {
        // Saving the AppVersion 
        var savedAppVersion = await newAppVersion.save();
        return savedAppVersion;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating AppVersion")
    }
}

exports.updateAppVersion = async function (appVersion) {
    var id = appVersion._id
    // console.log("Id ",id)
    try {
        //Find the old AppVersion Object by the Id
        var oldAppVersion = await AppVersion.findById(id);
        // console.log('oldAppVersion ',oldAppVersion)
    } catch (e) {
        throw Error("Error occured while Finding the AppVersion")
    }
    // If no old AppVersion Object exists return false
    if (!oldAppVersion) {
        return false;
    }

    //Edit the AppVersion Object
    if (appVersion.android_version) {
        oldAppVersion.android_version = appVersion.android_version;
    }

    if (appVersion.ios_version) {
        oldAppVersion.ios_version = appVersion.ios_version;
    }

    if (appVersion.android_url) {
        oldAppVersion.android_url = appVersion.android_url;
    }

    if (appVersion.ios_url) {
        oldAppVersion.ios_url = appVersion.ios_url;
    }

    if (appVersion.main_url) {
        oldAppVersion.main_url = appVersion.main_url;
    }

    oldAppVersion.maintenance = appVersion.maintenance ? appVersion.maintenance : 0;

    if (appVersion.limit) {
        oldAppVersion.limit = appVersion.limit;
    }

    if (appVersion.logo) {
        var isImage = await ImageService.saveImage(appVersion.logo, "/images/appVersions/logo/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public');
            //console.log("\n App logo Info >>>>>>", isImage, "\n");

            //Remove Previous App Logo 
            try {
                var fs = require('fs');
                var filePath = root_path + "/" + oldAppVersion.logo;
                //console.log("\n filePath >>>>>>", filePath, "\n");
                fs.unlinkSync(filePath);
            } catch (e) {
                console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n");
            }
            //Update App Logo
            oldAppVersion.logo = isImage;
        }
    }

    try {
        var savedAppVersion = await oldAppVersion.save()
        return savedAppVersion;
    } catch (e) {
        throw Error("And Error occured while updating the AppVersion");
    }
}

exports.deleteAppVersion = async function (id) {
    // Delete the AppVersion
    try {
        var deleted = await AppVersion.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("AppVersion Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the AppVersion")
    }
}