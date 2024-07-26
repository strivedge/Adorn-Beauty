const Appointment = require('../models/Appointment.model');

// this function return appointment by new customer  or old customer in particular date range
exports.filterAppointmentByCustomerType = async function (query, startDate, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error
    try {
        let sort = {};
        sort[order_name] = order;

        let filteredAppointments = await Appointment.aggregate([{
            $unwind: {
                path: '$client_id'
            }
        }, {
            $group: {
                _id: '$client_id', Repeat: {
                    $sum: {
                        $cond: [{
                            $and: [{$lt: ['$date', new Date(startDate)]}, {$eq: ["$location_id", query.location_id]} //this line is used for location wise users
                            ]
                        }, 1, 0]
                    }
                }, tmp: {
                    $push: '$$ROOT'
                }
            }
        }, {
            $unwind: {
                path: '$tmp'
            }
        }, {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: ['$tmp', {
                        count: '$Repeat'
                    }]
                }
            }
        }, {
            $addFields: {
                isRepeated: {
                    $cond: [{
                        $gte: ['$count', 1]
                    }, 1, 0]
                }, date: {
                    $dateToString: {
                        format: '%Y-%m-%d', date: '$date'
                    }
                }
            }
        }, {
            $match: query
        }, {
            $sort: sort
        }, {
            "$facet": {
                "appointments": [{"$skip": page}, {"$limit": limit}], "pagination": [{"$count": "total"}],
            }
        }]);

        return filteredAppointments[0];
    } catch (e) {
        console.log('e', e)
        throw Error('Error while Paginating Appointments');
    }
}


//this function return appointment by most used service in particular date range

exports.filterAppointmentByMostUsedService = async function (query, page, limit, order_name, order) {

    let sort = {};
    sort[order_name] = order;

    // Try Catch the awaited promise to handle the error
    try {
        //in serviceData variable we get most used service in particular date range
        let serviceData = await Appointment.aggregate([{
            $addFields: {
                date: {
                    $dateToString: {
                        format: '%Y-%m-%d', date: '$date'
                    }
                }
            }
        }, {$match: query}, {
            $unwind: {
                path: '$service_id'
            }
        }, {$sortByCount: '$service_id'}, {$limit: 1}, {
            $addFields: {
                service_id: {
                    $toObjectId: '$_id'
                }
            }
        }, {
            $lookup: {
                from: 'services', localField: 'service_id', foreignField: '_id', as: 'string'
            }
        }, {
            $unwind: {
                path: '$string'
            }
        }, {
            $addFields: {
                service_name: '$string.name'
            }
        }, {
            $project: {
                service_name: 1
            }
        }]);


        if (serviceData && serviceData[0]._id) {
            query.service_id = serviceData[0]._id;
        }

        let filteredAppointments = await Appointment.aggregate([{
            $addFields: {
                date: {
                    $dateToString: {
                        format: '%Y-%m-%d', date: '$date'
                    }
                }
            }
        }, {
            $match: query
        }, {
            $sort: sort
        }, {
            "$facet": {
                "appointments": [{"$skip": page}, {"$limit": limit}], "pagination": [{"$count": "total"}],
            }
        }, {$addFields: {service_name: serviceData[0].service_name}}]);

        return filteredAppointments[0];

    } catch (e) {
        console.log('e', e)
        throw Error('Error while Paginating Appointments');
    }
}



