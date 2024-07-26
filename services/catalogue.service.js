const CatalogueModel = require('../models/catalouge.model')
const ImageService = require('../services/image.service')
const ServicesModel = require('../models/Service.model')
var fs = require('fs');

exports.create = async function (query) {
    try {
        if (Array.isArray(query.images) && query.images.length > 0) {
            let images = [];
            for (let i = 0; i < query.images.length; i++) {
                let isImage = await ImageService.saveImage(query.images[i], "/images/catalogue/").then(data => {
                    return data;
                })
                if (typeof (isImage) != 'undefined' && isImage != null && isImage !== '') {
                    images.push(isImage);
                }
            }
            query.images = images;
        }
        let newContent = new CatalogueModel({
            images: Array.isArray(query.images) ? query.images : [],
            title: query.title ? query.title : '',
            services: Array.isArray(query.services) ? query.services : '',
            location_id: query.location_id ? query.location_id : '',
            soft_delete: false
        })
        return await newContent.save();
    }

    catch (error) {
        console.log('>>>>: helper/index.js : isValidJson -> error', error)
    }
}


exports.update = async function (contentData) {
    try {
        let id = contentData._id;
        let data = {};
        let oldContent = await CatalogueModel.findById(id).lean();
        let oldImages = oldContent.images;
        if (Array.isArray(contentData.images) && contentData.images.length === 0) {
            data.images = [];
            for (let i = 0; i < oldImages.length; i++) {
                let root_path = require('path').resolve('public');
                let filePath = root_path + "/" + oldImages[i];
                fs.unlinkSync(filePath);
            }
        }
        if (Array.isArray(contentData.images) && contentData.images.length > 0) {
            let repeatedImages = [];
            let images = [];
            for (let i = 0; i < contentData.images.length; i++) {
                let isRepeated = oldImages.some((item) => item === contentData.images[i]);
                if (isRepeated) {
                    repeatedImages.push(contentData.images[i]);
                } else {
                    let isImage = await ImageService.saveImage(contentData.images[i], "/images/catalogue/").then(data => {
                        return data;
                    })
                    if (typeof (isImage) != 'undefined' && isImage != null && isImage !== '') {
                        images.push(isImage);
                    }
                }
            }
            //unlink non repeated images
            for (let i = 0; i < oldImages.length; i++) {
                let isRepeated = repeatedImages.some((item) => item === oldImages[i]);
                if (!isRepeated) {
                    let root_path = require('path').resolve('public');
                    let filePath = root_path + "/" + oldImages[i];
                    fs.unlinkSync(filePath);
                }
            }
            data.images = [...repeatedImages, ...images];
        }
        if (Array.isArray(contentData.services)) {
            data.services = contentData.services;
        }
        if (contentData.location_id) {
            data.location_id = contentData.location_id;
        }
        if (contentData.title) {
            data.title = contentData.title;
        }
        if (contentData.soft_delete != null) {
            data.soft_delete = contentData.soft_delete;
        }
        return await CatalogueModel.findByIdAndUpdate(id, data, { new: true }).lean()
    } catch (e) {
        console.log('error in update content', e)
        throw Error('Error while updating content')
    }
}

exports.getContents = async function (query, limit, skip) {
    console.log(query)
    try {
        return await CatalogueModel.find(query).populate({
            path: 'services',
            model: ServicesModel,
            select: {
                company_id: 1, // organization-id
                location_id: 1, // branch-id
                category_id: 1,
                test_id: 1,
                name: 1,
                desc: 1,
                duration: 1,
                gender: 1,
                reminder: 1,
                price: 1,
                special_price: 1,
                commission: 1,
                tax: 1,
                service_limit: 1, // Consultation Fee
                online_status: 1,
                menu_order: 1,
                price_list_status: 1,
                service_type_group_id: 1,
                old_price: 1,
                category_name: 1,
            }
        }).skip(skip)
            .limit(limit)
            .lean();
    } catch (e) {
        console.log('error in get content service', e.message)
        throw Error('Error while getting contents')
    }
}

exports.getContentsCount = async function (query) {
    try {
        return CatalogueModel.count(query)
    } catch (e) {
        console.log('error in get Contents count service', e)
        throw Error('Error while getting Contents count')
    }
}

exports.getContent = async function (id) {
    try {
        // Find the Data 
        var _details = await CatalogueModel.findOne({ _id: id }).populate({
            path: 'services',
            model: ServicesModel,
            select: {
                company_id: 1, // organization-id
                location_id: 1, // branch-id
                category_id: 1,
                test_id: 1,
                name: 1,
                desc: 1,
                duration: 1,
                gender: 1,
                reminder: 1,
                price: 1,
                special_price: 1,
                commission: 1,
                tax: 1,
                service_limit: 1, // Consultation Fee
                online_status: 1,
                menu_order: 1,
                price_list_status: 1,
                service_type_group_id: 1,
                old_price: 1,
                category_name: 1,
            }
        })

        return _details || null
    } catch (e) {
        return null
        // return a Error message describing the reason     
        //throw Error("Service not available");
    }
}


exports.softDelete = async function (id) {
    try {
        return await CatalogueModel.findByIdAndUpdate(id, {soft_delete: true}, {new: true}).lean()
    }catch (e) {
        console.log('error in soft delete Content service', e)
        throw Error('Error while soft delete Content')
    }
}
