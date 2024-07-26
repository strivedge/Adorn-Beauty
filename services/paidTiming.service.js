const PaidTimingModel = require('../models/PaidTimings.model');
const moment = require('moment');
//create
exports.create = async function (data) {
    try {
        let newData = new PaidTimingModel({
            date: data.date ? data.date : null,
            location_id: data.location_id ? data.location_id : null,
            slots: data.slots ? data.slots : [],
        })
        return await newData.save()
    } catch (e) {
        console.log("e ", e)
        throw Error('Error while creating paid timing')
    }
}
//create many
exports.createMany = async function (data) {
    try {
        return await PaidTimingModel.insertMany(data)
    } catch (e) {
        console.log("e ", e)
        throw Error('Error while creating paid timing')
    }
}
//find by query
exports.findOne = async function (query) {
    try {
        return PaidTimingModel.findOne(query).lean();

    }catch (e) {
        console.log("e ", e)
        throw Error('Error while finding paid timing')
    }
}
//findMany
exports.findMany = async function (query) {
    try {
        return PaidTimingModel.find(query).lean();
    }catch (e) {
        console.log("e ", e)
        throw Error('Error while finding paid timing')
    }
}
//update
exports.update = async function (updateData) {
    try {
        let query = {
            date: updateData.date,
            location_id: updateData.location_id
        }
        let data={};
        if (updateData.slots) {
            data.slots = updateData.slots
        }
        return PaidTimingModel.findOneAndUpdate(query, data, {new: true});
    }catch (e) {
        console.log("e ", e)
        throw Error('Error while updating paid timing')
    }
}

//delete many
exports.deleteMany = async function (query) {
    try {
        return PaidTimingModel.deleteMany(query);

    }catch (e) {
        console.log("e ", e)
        throw Error('Error while deleting paid timing')
    }
}


