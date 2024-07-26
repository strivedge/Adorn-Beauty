var CustomerRewardService = require('../services/customerReward.service');
var UserService = require('../services/user.service');
var CustomerService = require('../services/customer.service')
var LocationService = require('../services/location.service')
var ObjectId = require('mongodb').ObjectId

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getCustomerRewards = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 0; //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000;
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
        var order = req.query.order ? req.query.order : -1;
        var serachText = req.query.serachText ? req.query.serachText : '';

        var query = {};

        if (req.query.company_id) {
            query['company_id'] = req.query.company_id;
        }

        if (req.query.customer_id && req.query.customer_id != 'undefined') {
            query['customer_id'] = req.query.customer_id;
        }

        if (req.query.searchText && req.query.searchText != 'undefined') {
            query['$or'] = [{ action: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { added_by: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }];
        }

        var customerRewards = await CustomerRewardService.getCustomerRewards(query, parseInt(page), parseInt(limit), order_name, Number(order), serachText);

        var user_data = {};

        if (req.query.customer_id && req.query.customer_id != 'undefined') {
            user_data = await CustomerService.getCustomer(req.query.customer_id);
        }

        // Return the CustomerRewards list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customerRewards, user_data: user_data, message: "Successfully CustomerRewards Recieved" });
    } catch (e) {
        // console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getClientCustomerRewards = async function (req, res, next) {
    try {
        var page = Number(req.query?.page) || 1
        var limit = Number(req.query?.limit) || 0
        var sortBy = req.query?.sortBy || '_id'
        var sortOrder = req.query.sortOrder && JSON.parse(req.query.sortOrder) ? '1' : '-1'
        var pageIndex = 0
        var startIndex = 0
        var endIndex = 0

        var customerId = req.query?.customer_id || ""
        var locationId = req.query?.location_id || ""
        var search = req.query?.searchText || ""

        if (!customerId) {
            return res.status(200).json({ status: 200, flag: false, data: [], message: "Customer Id must be present!" })
        }

        var query = {}

        if (req.query.company_id) {
            query['company_id'] = req.query.company_id;
        }

        if (locationId) {
            query['location_id'] = locationId
        }

        if (customerId) {
            query['customer_id'] = customerId
        }

        if (search) {
            if (!isNaN(search)) {
                query['$or'] = [
                    { amount: { $gte: Number(search), $exists: true } },
                    { gain_points: { $gte: Number(search), $exists: true } },
                    { redeem_points: { $gte: Number(search), $exists: true } },
                    { total_points: { $gte: Number(search), $exists: true } }
                ]
            } else {
                query['$or'] = [
                    { action: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { added_by: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            }
        }

        var count = await CustomerRewardService.getCustomerRewardsCount(query)
        var customerRewards = await CustomerRewardService.getCustomerRewardsOne(query, Number(page), Number(limit), sortBy, Number(sortOrder))
        if (!customerRewards || !customerRewards?.length) {
            if (Number(req.query?.page) && Number(req.query.page) > 0) {
                page = 1
                customerRewards = await CustomerRewardService.getCustomerRewardsOne(query, Number(page), Number(limit), sortBy, Number(sortOrder))
            }
        }

        if (customerRewards && customerRewards.length) {
            pageIndex = Number(page - 1)
            startIndex = (pageIndex * limit) + 1
            endIndex = Math.min(startIndex - 1 + limit, count)
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: customerRewards,
            pages: limit ? Math.ceil(count / limit) : 0,
            total: count,
            pageIndex: pageIndex,
            startIndex: startIndex,
            endIndex: endIndex,
            message: "Customer rewards recieved successfully!"
        })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getSpecificCustomerRewards = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    // console.log("getActiveCustomerRewards ",req.query)
    var query = {};
    if (req.query.location_id && req.query.location_id != 'undefined') {
        //query['location_id'] = req.query.location_id;
    }

    try {
        // console.log("query ",query)
        var CustomerRewards = await CustomerRewardService.getSpecificCustomerRewards(query)
        // Return the CustomerRewards list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: CustomerRewards, message: "Successfully CustomerRewards Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomerReward = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var CustomerRewards = await CustomerRewardService.getCustomerReward(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: CustomerRewards, message: "Successfully CustomerRewards Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}


exports.createCustomerRewards = async function (req, res, next) {

    try {
        var company_id = req.body.company_id ?? '';
        if(!company_id && req.body.location_id){
            var location = await LocationService.getLocation(req.body.location_id);
            company_id = location?.company_id;
        }
        var last_reward_query = { customer_id: req.body.customer_id,company_id: company_id };

        var last_reward = await CustomerRewardService.getCustomerLastRewards(last_reward_query);
        var last_total_points = 0;
        if (last_reward.length > 0) {
            last_total_points = last_reward[0].total_points;
        }
        if (req.body.action == 'gain') {
            var total_points = parseFloat(last_total_points) + parseFloat(req.body.gain_points);
        } else {
            var total_points = parseFloat(last_total_points) - parseFloat(req.body.redeem_points);
        }
        var gain_points = req.body.gain_points ? req.body.gain_points : 0;
        var redeem_points = req.body.redeem_points ? req.body.redeem_points : 0;

        var reward_data = {
            company_id: company_id,
            location_id: req.body.location_id,
            customer_id: req.body.customer_id,
            gain_points: parseFloat(gain_points).toFixed(2),
            redeem_points: parseFloat(redeem_points).toFixed(2),
            total_points: total_points.toFixed(2),
            date: Date(),
            action: req.body.action,
            added_by: req.body.added_by,
            added_user_id: req.body.added_user_id,
        }
        //console.log('reward_data',reward_data);
        var createdCustomerRewards = await CustomerRewardService.createCustomerReward(reward_data);

        return res.status(200).json({ status: 200, flag: true, data: createdCustomerRewards, message: "Successfully Upadated CustomerRewards" })
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "CustomerRewards Upadate was Unsuccesfull" })
    }

}


exports.removeCustomerRewards = async function (req, res, next) {

    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }
    try {
        var deleted = await CustomerRewardService.deleteCustomerRewards(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.setCustomerRewardsByPoints = async function (req, res, next) {
   
    try {
        var query = {date: { $gt: '2024-03-18'}}; 

        var customerRewards = await CustomerRewardService.getSpecificCustomerRewards(query)

        var reward_data = [];

        var date = new Date('2024-03-18T00:00:00.000Z')
        
        // for (var i = 0; i < customerRewards.length; i++) {
            
        //     var totRewards = await CustomerRewardService.getCustomerAllLastRewards({customer_id: customerRewards[i].customer_id, date: { $gte: new Date("2024-03-18T00:00:00.000Z")}});
           
        //     console.log(totRewards.length)
        //     if(totRewards && totRewards.length > 0){
        //         reward_data.push(customerRewards[i]);
        //     }
        // }

        var cust_rew = [];
        // reward_data.length

        // for (var i = 0; i < reward_data.length; i++) {
        //     // var r_query = { customer_id:  reward_data[i].customer_id, date: {  $lte: '2024-03-18' } }
        //     // var secLastReward = await CustomerRewardService.getCustomerRewardsSortByDate(r_query)

        //     //var rew_date = Date(secLastReward[0].createdAt); 

        //     var r_query = { customer_id:  reward_data[i].customer_id }
        //     var lastRewards = await CustomerRewardService.getCustomerRewardsSortByDate(r_query)

        //     if(lastRewards && lastRewards.length > 1){

        //         var secLastReward = lastRewards[1]
        //         var lastReward = lastRewards[0]

        //         // console.log('secLastReward',secLastReward)
        //         // console.log('lastReward',lastReward);

        //         var curSecPoints = 0;
        //         var curLastPoints = 0;

        //         secPoints = secLastReward.total_points
        //         lastPoints = lastReward.total_points
            
        //         //console.log( secLastReward._id,lastReward._id,)

        //         if(lastReward._id != secLastReward._id){

        //             if(lastReward.action == 'gain'){

        //                 //console.log('secPoints',secPoints,'lastReward.gain_points',lastReward.gain_points, secPoints + lastReward.gain_points)

        //                 curLastPoints = secPoints + lastReward.gain_points

        //             }else if(lastReward.action == 'redeem'){

        //                 curLastPoints = secPoints - lastReward.redeem_points
        //             }

        //                 // console.log('lastPoints',lastPoints)
        //                 // console.log('curLastPoints',curLastPoints)
        //             if(lastPoints != curLastPoints){
        //                 cust_rew.push(reward_data[i])

        //                 // console.log('secLastReward',secLastReward)
        //                 // console.log('lastReward',lastReward)

        //                //console.log('secPoints',secPoints,'curLastPoints',curLastPoints,lastReward._id)

        //                 var updateLastReward = await CustomerRewardService.updateRecordById({_id: ObjectId(lastReward._id)}, {total_points: curLastPoints})

        //             }
        //         }
        //     }
           
        // }
        // Return the CustomerRewards list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true,reward_data_length: reward_data.length, cust_rew_length: cust_rew.length, cust_rew: cust_rew, reward_data:reward_data, data: customerRewards.length, message: "Successfully CustomerRewards Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}





