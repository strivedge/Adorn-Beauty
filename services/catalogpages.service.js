const CataloguePagesModel = require('../models/Catalogpages.model')
const CatalogeContentModel = require("../models/catalouge.model")
const serviceModel = require("../models/Service.model")
const CategoryModel = require("../models/Category.model")
const LocationModel = require("../models/Location.model")
const ImageService = require("../services/image.service")
var fs = require('fs');

// exports.create = async function (data) {
//     try {
//         let newCatalogPage = new CataloguePagesModel({
//             title: data.title ? data.title : '',
//             content: Array.isArray(data.content) ? data.content : [],
//             location_id: data.location_id ? data.location_id : '',
//             status: data.status ? data.status : false,
//             soft_delete: false
//         })
//         return await newCatalogPage.save();
//     }

//     catch (error) {
//         console.log('>>>>: helper/index.js : isValidJson -> error', error)
//     }
// }

exports.create = async function (data) {
    try {
        let itemArr = data.resultArray;

        for (let item of itemArr) {
            let { image } = item;
            let isImage = await ImageService.saveImage(image, "/images/catalogue/").then(data => {
                return data;
            });
            if (typeof (isImage) !== 'undefined' && isImage !== null && isImage !== '') {
                // Update the image property of the current item
                item.image = isImage;
            }
        }

        let newCatalogPage = new CataloguePagesModel({
            pageTitle: data.pageTitle ? data.pageTitle : '',
            content: Array.isArray(itemArr) ? itemArr : [],
            location_id: data.location_id ? data.location_id : '',
            // status: data.status ? data.status : false,
            soft_delete: false
        })
        return await newCatalogPage.save();
    }

    catch (error) {
        console.log('>>>>: helper/index.js : isValidJson -> error', error)
    }
}


exports.update = async function (updateCatalogPageData, resultArray) {
    console.log(updateCatalogPageData._id)
    try {
        const oldContent = await CataloguePagesModel.findById(updateCatalogPageData._id).lean();
        const itemArr = resultArray;

        for (const item of itemArr) {
            const { image } = item;
            if (image) {
                const root_path = require("path").resolve("public");
                console.log("root_path", root_path);
                fs.mkdir(root_path + "/images/catalogue/", (err) => {
                    if (err) {
                        // Handle error if needed
                    }
                });

                const isImage = await ImageService.saveImage(image, "/images/catalogue/").then((data) => {
                    return data;
                });
                console.log(isImage, 'Is Image')

                if (isImage) {
                    for (const oldItem of oldContent.content) {
                        if (oldItem.image === isImage) {
                            console.log(oldItem.image, oldItem.image === image)
                            try {
                                const filePath = root_path + "/" + oldItem.image;
                                fs.unlinkSync(filePath);
                            } catch (e) {
                                console.log("Error removing image:", e);
                            }
                            oldItem.image = isImage;
                            break; // No need to continue iterating over oldContent.content once the image is updated
                        }
                        item.image = isImage
                    }
                }
            }
        }
        console.log(itemArr, 'itemArr')
        if (Array.isArray(itemArr)) {
            updateCatalogPageData.content = itemArr;
        }
        if (updateCatalogPageData.pageTitle) {
            updateCatalogPageData.pageTitle = updateCatalogPageData.pageTitle;
        }
        if (updateCatalogPageData.status === true || updateCatalogPageData.status === false) {
            updateCatalogPageData.status = updateCatalogPageData.status
        }
        if (updateCatalogPageData.soft_delete != null) {
            updateCatalogPageData.soft_delete = updateCatalogPageData.soft_delete;
        }

        return await CataloguePagesModel.findByIdAndUpdate(updateCatalogPageData._id, updateCatalogPageData, { new: true }).lean()
    } catch (e) {
        console.log('error in update content', e)
        throw Error('Error while updating content')
    }
}


exports.getCatalogePages = async function (query, limit, skip) {
    try {
        let sort_field = 'createdAt'
        var sorts = {}
        if (sort_field) {
            sorts['createdAt'] = -1
        }
        return await CataloguePagesModel.find(query).skip(skip)
            .limit(limit).sort(sorts)
            .lean();
    } catch (e) {
        console.log('error in get Cataloge Pages service', e.message)
        throw Error('Error while getting Cataloge Pages')
    }
}

exports.getCatalogePagesFront = async function (query, limit, skip) {
    try {
        return await CataloguePagesModel.find(query).populate({
            path: 'content',
            populate: [
                { path: 'service', model: serviceModel, select: 'name price' },
                // { path: 'category', model: CategoryModel, select: 'name' }
            ]
        }).skip(skip)
            .limit(limit)
            .lean();
    } catch (e) {
        console.log('error in get Cataloge Pages service', e.message)
        throw Error('Error while getting Cataloge Pages')
    }
}


exports.getPagesCount = async function (query) {
    try {
        return CataloguePagesModel.count(query)
    } catch (e) {
        console.log('error in get Pages count service', e)
        throw Error('Error while getting Pages count')
    }
}



exports.getCatalogePage = async function (id) {
    try {
        // Find the Data 
        var _details = await CataloguePagesModel.findOne({ _id: id }).populate({
            path: 'content',
            populate: [
                { path: 'service', model: serviceModel, select: 'name price' },
                // { path: 'category', model: CategoryModel, select: 'name' }
            ]
        });

        return _details || null
    } catch (e) {
        return null
        // return a Error message describing the reason     
        //throw Error("Service not available");
    }
}

exports.softDelete = async function (id) {
    try {
        return await CataloguePagesModel.findByIdAndUpdate(id, { soft_delete: true }, { new: true }).lean()
    } catch (e) {
        console.log('error in soft delete Content service', e)
        throw Error('Error while soft delete Content')
    }
}
