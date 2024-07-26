// Gettign the Newly created Mongoose Model we just created 
var User = require('../models/User.model')
var BlockTime = require('../models/BlockTime.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the BlockTime List
exports.getBlockTimes = async function (query, page, limit, order_name, order, searchText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        // if(searchText && searchText != '') {
        //     query['$text'] = { $search: searchText, $language:'en',$caseSensitive: false};
        // }

        const facetedPipeline = [
            {
                $addFields: {
                    start_date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$start_date'
                        }
                    },
                    end_date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$end_date'
                        }
                    }
                }
            },
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

        var BlockTimes = await BlockTime.aggregate(facetedPipeline);
        // Return the BlockTimed list that was retured by the mongoose promise
        return BlockTimes;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating BlockTimes');
    }
}

exports.getBlockTimesOne = async function (query = {}) {
    try {
        // Find the Data 
        var blockTimes = await BlockTime.find(query)
            .populate({
                path: 'employee_id',
                model: User,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1
                }
            })

        return blockTimes || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while getting blockTimes")
    }
}

exports.getBlockSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var BlockTimes = await BlockTime.aggregate([
            {
                $addFields: {
                    start_date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$start_date'
                        }
                    },
                    end_date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$end_date'
                        }
                    }
                }
            },
            { $match: query }
        ])

        // Return the Serviced list that was retured by the mongoose promise
        return BlockTimes
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating BlockTimes')
    }
}

exports.getBlockTime = async function (id) {
    try {
        // Find the Data 
        var _details = await BlockTime.findOne({
            _id: id
        })
            .populate({
                path: 'employee_id',
                model: User,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1
                }
            })

        if (_details._id) {
            return _details
        } else {
            throw Error("BlockTime not available")
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("BlockTime not available")
    }
}

exports.getBlockTimeOne = async function (query = {}) {
    try {
        // Find the Data 
        var blockTime = await BlockTime.findOne(query)
            .populate({
                path: 'employee_id',
                model: User,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1
                }
            })

        return blockTime || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("BlockTime not available")
    }
}

exports.createBlockTime = async function (blockTime) {
    if (blockTime.employee_all == true) {
        blockTime.employee_all = 1;
    } else {
        blockTime.employee_all = 0;
    }
    var newBlockTime = new BlockTime({
        company_id: blockTime.company_id ? blockTime.company_id : "",
        location_id: blockTime.location_id ? blockTime.location_id : "",
        employee_id: blockTime.employee_id ? blockTime.employee_id : [],
        employee_all: blockTime.employee_all ? blockTime.employee_all : 0,
        desc: blockTime.desc ? blockTime.desc : "",
        repeat: blockTime.repeat ? blockTime.repeat : "",
        alternate_day: blockTime.alternate_day ? blockTime.alternate_day : [],
        every_week: blockTime.every_week ? blockTime.every_week : [],
        start_time: blockTime.start_time ? blockTime.start_time : "",
        end_time: blockTime.end_time ? blockTime.end_time : "",
        start_date: blockTime.start_date ? blockTime.start_date : "",
        end_date: blockTime.end_date ? blockTime.end_date : "",
        end: blockTime.end ? blockTime.end : "",
        status: blockTime.status ? blockTime.status : 1
    })

    try {
        // Saving the BlockTime 
        var savedBlockTime = await newBlockTime.save();
        return savedBlockTime;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating BlockTime")
    }
}

exports.updateBlockTime = async function (blockTime) {
    var id = blockTime._id
    try {
        //Find the old BlockTime Object by the Id
        var oldBlockTime = await BlockTime.findById(id);
        // console.log('OldBlockTime ',oldBlockTime)
    } catch (e) {
        throw Error("Error occured while Finding the BlockTime")
    }
    // If no old BlockTime Object exists return false
    if (!oldBlockTime) {
        return false;
    }
    oldBlockTime.status = blockTime.status ? blockTime.status : 0;
    //Edit the BlockTime Object
    oldBlockTime.name = blockTime.name

    if (blockTime.employee_all == true) {
        oldBlockTime.employee_all = 1;
    } else {
        oldBlockTime.employee_all = 0;
    }
    if (blockTime.company_id) {
        oldBlockTime.company_id = blockTime.company_id;
    }
    if (blockTime.location_id) {
        oldBlockTime.location_id = blockTime.location_id;
    }
    if (blockTime.employee_id) {
        oldBlockTime.employee_id = blockTime.employee_id;
    }
    if (blockTime.desc) {
        oldBlockTime.desc = blockTime.desc;
    }
    if (blockTime.repeat) {
        oldBlockTime.repeat = blockTime.repeat;
    }
    if (blockTime.alternate_day) {
        oldBlockTime.alternate_day = blockTime.alternate_day;
    }
    if (blockTime.every_week) {
        oldBlockTime.every_week = blockTime.every_week;
    }
    if (blockTime.start_time) {
        oldBlockTime.start_time = blockTime.start_time;
    }
    if (blockTime.end_time) {
        oldBlockTime.end_time = blockTime.end_time;
    }
    if (blockTime.start_date) {
        oldBlockTime.start_date = blockTime.start_date;
    }
    if (blockTime.end_date) {
        oldBlockTime.end_date = blockTime.end_date;
    }
    if (blockTime.end) {
        oldBlockTime.end = blockTime.end;
    }

    try {
        var savedBlockTime = await oldBlockTime.save()
        return savedBlockTime;
    } catch (e) {
        throw Error("And Error occured while updating the BlockTime");
    }
}

exports.updateBlocksEmployee = async function (blockTime) {
    var id = blockTime._id
    try {
        //Find the old BlockTime Object by the Id
        var oldBlockTime = await BlockTime.findById(id);
        // console.log('OldBlockTime ',oldBlockTime)
    } catch (e) {
        throw Error("Error occured while Finding the BlockTime")
    }
    // If no old BlockTime Object exists return false
    if (!oldBlockTime) {
        return false;
    }

    if (blockTime.employee_id) {
        oldBlockTime.employee_id = blockTime.employee_id;
    }

    if (blockTime.employee_all == true) {
        oldBlockTime.employee_all = 1;
    } else {
        oldBlockTime.employee_all = 0;
    }

    try {
        var savedBlockTime = await oldBlockTime.save()
        return savedBlockTime;
    } catch (e) {
        throw Error("And Error occured while updating the BlockTime");
    }
}

exports.deleteBlockTime = async function (id) {
    // Delete the BlockTime
    try {
        var deleted = await BlockTime.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("BlockTime Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the BlockTime")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await BlockTime.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the BlockTime")
    }
}