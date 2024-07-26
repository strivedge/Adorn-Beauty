var jwt = require('jsonwebtoken')
var dateFormat = require('dateformat')
var ObjectId = require('mongodb').ObjectId

var CustomerService = require('../services/customer.service')
var PermissionService = require('../services/permission.service')
var ServiceService = require('../services/service.service')
var LocationService = require('../services/location.service')
var AppointmentService = require('../services/appointment.service')
var CustomerPackageService = require('../services/customerpackage.service')
var CustomerUsagePackageService = require('../services/customerUsagePackageService.service')
var CustomerRewardService = require('../services/customerReward.service')
var SendEmailSmsService = require('../services/sendEmailSms.service')

var CustomerLoyaltyCardService = require('../services/customerLoyaltyCard.service')
var CustomerLoyaltyCardLogService = require('../services/customerLoyaltyCardLog.service')
var DiscountService = require('../services/discount.service')
var ConsultantFormService = require('../services/consultantForm.service')
var AppliedDiscountService = require('../services/appliedDiscount.service')
var EmailLogService = require('../services/emailLog.service')
var UserDeviceTokenService = require('../services/userDeviceToken.service');

const {
    isObjEmpty,
    isValidJson,
    getRandPswd,
    get4DigitCode,
    getMaskedEmail,
    getMaskedString,
    getDateAddMonths,
    generateUniqueId,
    increaseDateDays,
    isArrayContainingObject
} = require('../helper')


// Saving the context of this module inside the _the variable
_this = this

exports.userlocation_idstringToArray = async function (req, res, next) {
    try {
        var query = { is_customer: 1 };
        var users = await CustomerService.getClients(query);
        for (var i = 0; i < users.length; i++) {
            if (users[i].location_id) {
                //users[i].location_ids = [users[i].location_id];

                //console.log('users[i].location_ids',users[i].location_ids)

                //var updatedUser = await CustomerService.updateCustomer(users[i]);

                // console.log('updatedUser',updatedUser)
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: users, message: "Successfully Merge Users" });
    } catch (e) {
        console.log('e', e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getTestRedundantUsers = async function (req, res, next) {
    try {
        var users = await CustomerService.getTestRedundantCustomers();

        var emails = users.map(s => s.email);
        emails = emails.filter(n => n)

        var dupliUsers = await CustomerService.getCustomerAllData({ email: { $in: emails } });

        var mobile_users = await CustomerService.getTestRedundantCustomersMobile();

        return res.status(200).json({ status: 200, flag: true, dataCount: users.length, mobile_usersCount: mobile_users.length, emails: emails, data: users, mobile_users: mobile_users, message: "Successfully Merge Users" });
    } catch (e) {
        console.log('e', e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomerRewards = async function (req, res, next) {
    try {
        var query = { updatedAt: { $gte: '2023-10-30' }, createdAt: { $lte: '2023-10-30' } };

        var cust_ids = [];

        var ids = cust_ids.map(c => c.replace_id);
        query['customer_id'] = { $in: cust_ids };
        //var cust_ids = ["60eecff74fb92ec2d85f566a"]

        //var cust_reward = await CustomerRewardService.getCustomerRewardsSpecific(query);

        //var cust_reward = await CustomerRewardService.updateManyClientLocation(query);
        // for (var c = 0; c < cust_ids.length; c++) {
        //     query['customer_id'] = cust_ids[c];
        //     query['deleted'] = 1;

        //     var cust_reward = await CustomerRewardService.getCustomerRewardsSpecific(query);

        //     var last_reward_query = { customer_id: cust_ids[c],updatedAt:{$lt:'2023-10-30'},deleted:{$ne:1}};

        //     var last_reward = await CustomerRewardService.getCustomerLastRewards(last_reward_query);

        //     var last_total_points = 0;
        //     if (last_reward.length > 0) {
        //         last_total_points = last_reward[0].total_points;
        //     }
        //     var total_points = 0;
        //     for (var i = 0; i < cust_reward.length; i++) {


        //         if(cust_reward[i].action == 'gain'){
        //             total_points = parseFloat(last_total_points) + parseFloat(cust_reward[i].gain_points);
        //         }else{
        //             total_points = parseFloat(last_total_points) - parseFloat(cust_reward[i].redeem_points);
        //         }


        //         var reward_data = {
        //             location_id: cust_reward[i].location_id,
        //             customer_id: cust_reward[i].customer_id,
        //             appoitment_id:cust_reward[i].appoitment_id,
        //             amount: cust_reward[i].amount,
        //             gain_points: cust_reward[i].gain_points,
        //             redeem_points: cust_reward[i].redeem_points,
        //             total_points: total_points.toFixed(2),
        //             date: cust_reward[i].date,
        //             action:cust_reward[i].action,
        //             added_by: cust_reward[i].added_by,
        //         }
        //         var create_cust_reward = await CustomerRewardService.createCustomerReward(reward_data);

        //         if(create_cust_reward){
        //             last_total_points = total_points;
        //             await CustomerRewardService.deleteMultiple({_id:ObjectId(cust_reward[i]._id)})
        //         }


        //     }
        //     //var cust_reward = await CustomerRewardService.deleteMultiple(query);

        // }

        return res.status(200).json({ status: 200, flag: true, dataCount: 0, last_reward: {}, data: ids, message: "Successfully Merge Users" });
    } catch (e) {
        console.log('e', e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.replceBookingUser = async function (req, res, next) {
    try {
        var del_users =
            [
                {
                    "replace_id": "6126992adff6a86d86321d4e",
                    "deleted_users": [
                        "62fa4871298f6a0f8c8a006f"
                    ]
                },
            ];
        var del_users = [];
        var all_appointments = [];
        var all_packages = [];
        var all_consultant = [];
        var all_rewards = [];
        var all_dis = [];
        for (var i = 0; i < del_users.length; i++) {
            if (del_users[i].deleted_users && del_users[i].deleted_users.length > 0) {

                var uId = del_users[i].deleted_users

                var query2 = { is_customer: 1, _id: { $in: uId } };

                var dup_users = await CustomerService.getCustomerSpecific(query2);

                var existingUser = { is_customer: 1, _id: ObjectId(del_users[i].replace_id) };

                var existing_users = await CustomerService.getCustomerSpecific(existingUser);

                if (dup_users && dup_users.length > 0) {
                    var locs = dup_users.map(s => s.location_ids)

                    if (existing_users && existing_users.length > 0) {
                        locs.push(existing_users[0].location_ids)
                    }
                    var locArr = Array.prototype.concat(...locs);
                    locArr = locArr.filter((item, pos) => locArr.indexOf(item) === pos)
                    console.log('locArr', locArr)

                    var data = {
                        _id: del_users[i].replace_id,
                        status: 1,
                        is_customer: 1,
                        location_update: 1,
                        location_ids: locArr
                    };
                    var updatedUser = await CustomerService.updateCustomer(data);
                }
            }

            var query = { client_id: { $elemMatch: { $in: del_users[i].deleted_users } } };
            var appointments = await AppointmentService.getSelectedAppointmentSpecific(query);
            if (appointments.length > 0) {
                //console.log('appointments',appointments[0].location_id)
                all_appointments.push(appointments);
                var client_id = [del_users[i].replace_id];
                //console.log('query',query)
                //console.log('del_users.deleted_users',del_users[i].deleted_users)
                //console.log('client_id',client_id)
                var appointments = await AppointmentService.updateManyAppointmentClient(query, client_id);
            }

            var pkg_query = { customer_id: { $in: del_users[i].deleted_users } };
            var packages = await CustomerPackageService.getCustomerPackageSpecific(pkg_query)
            if (packages.length > 0) {
                all_packages.push(packages);
                //console.log('packages',packages[0].location_id)
                var packages = await CustomerPackageService.updateManyPackagesClient(pkg_query, del_users[i].replace_id);

                var package_usage = await CustomerUsagePackageService.updateManyPackagesClient(pkg_query, del_users[i].replace_id);
                //console.log('packages',packages)
            }

            var loylaty_cards = await CustomerLoyaltyCardService.getCustomerLoyaltyCardsSpecific(pkg_query)
            if (loylaty_cards.length > 0) {
                var loylaty_cards = await CustomerLoyaltyCardService.updateManyLoyaltyCardClient(pkg_query, del_users[i].replace_id);

                var loylaty_card_log = await CustomerLoyaltyCardLogService.updateManyPackagesClient(pkg_query, del_users[i].replace_id);
                //console.log('loylaty_cards',loylaty_cards)
            }

            var query2 = { client_id: { $elemMatch: { $in: del_users[i].deleted_users } } };
            var data = await ConsultantFormService.getActiveConsultantForms(query2)
            //console.log(data)
            if (data.length > 0) {
                //console.log('ConsultantFormService',data[0].location_id)
                all_consultant.push(data);
                //console.log(data.length )
                //console.log(del_users[i].deleted_users )
                var c_id = [del_users[i].replace_id]
                var update_data = await ConsultantFormService.updateManyAppointmentClient(query2, c_id);
                //console.log('update_data',update_data)
                var que_type = await ConsultantServiceTypeQuestionService.updateManyClientData(pkg_query, del_users[i].replace_id);
                //console.log('packages',packages)
            }

            var rew_query = { customer_id: { $in: del_users[i].deleted_users } };
            var rewards = await CustomerRewardService.getCustomerRewardsSpecific(rew_query)
            if (rewards.length > 0) {
                all_rewards.push(rewards);
                //console.log('rewards',rewards[0].location_id)
                var rewards = await CustomerRewardService.updateManyPackagesClient(rew_query, del_users[i].replace_id);

            }

            var dis_query = { user_id: { $in: del_users[i].deleted_users } };
            var dis_data = await AppliedDiscountService.getAppliedDiscountSpecific(dis_query)
            if (dis_data.length > 0) {
                all_dis.push(dis_data);
                //console.log('dis_data',dis_data[0].location_id)
                var dis = await AppliedDiscountService.updateManyDiscountClient(dis_query, del_users[i].replace_id);
            }

            var query3 = { is_customer: 1, _id: { $in: del_users[i].deleted_users } };
            var deleted = await CustomerService.deleteMultiple(query3);
        }

        return res.status(200).json({ status: 200, flag: true, all_appointments: all_appointments, all_packages: all_packages, all_consultant: all_consultant, all_rewards: all_rewards, all_discount: all_dis, message: "Successfully Merge Users" });
    } catch (e) {
        console.log('e', e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}
//Merge duplicate user in all location

exports.userMergeByEmailMobile = async function (req, res, next) {
    try {
        var email_del_users = [];
        var mobile_del_users = [];

        var query = { is_customer: 1, email: { $ne: '' } };
        //var users = await CustomerService.getCustomerAllData(query);

        var dupliUsers = await CustomerService.getTestRedundantCustomers(); //get duplicate email

        var emails = dupliUsers.map(s => s.email);

        emails = emails.filter(n => n)

        var users = await CustomerService.getCustomerAllData({ is_customer: 1, email: { $in: emails } });


        for (var i = 0; i < users.length; i++) {
            var query2 = { is_customer: 1, email: users[i].email, _id: { $ne: ObjectId(users[i]._id) } };

            var dup_user = await CustomerService.getCustomerAllData(query2);
            if (dup_user?.length > 0) {
                users[i].name = users[i].name ? users[i].name : dup_user[0].name;
                users[i].first_name = users[i].first_name ? users[i].first_name : dup_user[0].first_name;
                users[i].last_name = users[i].last_name ? users[i].last_name : dup_user[0].last_name;
                users[i].email = users[i].email ? users[i].email : dup_user[0].email;
                users[i].mobile = users[i].mobile ? users[i].mobile : dup_user[0].mobile;
                users[i].gender = users[i].gender ? users[i].gender : dup_user[0].gender;
                users[i].dob = users[i].dob ? users[i].dob : dup_user[0].dob;
                users[i].anniversary_date = users[i].anniversary_date ? users[i].anniversary_date : dup_user[0].anniversary_date;
                users[i].customer_heart = users[i].customer_heart ? users[i].customer_heart : dup_user[0].customer_heart;
                users[i].customer_icon = users[i].customer_icon ? users[i].customer_icon : dup_user[0].customer_icon;
                users[i].customer_badge = users[i].customer_badge ? users[i].customer_badge : dup_user[0].customer_badge;
                users[i].email_notification = users[i].email_notification ? users[i].email_notification : dup_user[0].email_notification;
                users[i].sms_notification = users[i].sms_notification ? users[i].sms_notification : dup_user[0].sms_notification;

                users[i].session_email_notification = users[i].session_email_notification ? users[i].session_email_notification : dup_user[0].session_email_notification;

                users[i].session_sms_notification = users[i].session_sms_notification ? users[i].session_sms_notification : dup_user[0].session_sms_notification;

                var data = {
                    _id: users[i]._id,
                    name: users[i].name,
                    first_name: users[i].first_name,
                    last_name: users[i].last_name,
                    mobile: users[i].mobile,
                    email: users[i].email,
                    gender: users[i].gender,
                    dob: users[i].dob,
                    anniversary_date: users[i].anniversary_date,
                    customer_heart: users[i].customer_heart,
                    customer_icon: users[i].customer_icon,
                    customer_badge: users[i].customer_badge,
                    email_notification: users[i].email_notification,
                    sms_notification: users[i].sms_notification,
                    status: 1,
                    is_customer: 1,
                    location_id: dup_user[0].location_ids[0]
                };

                var updatedUser = await CustomerService.updateCustomer(data);
                if (updatedUser) {
                    var d_user = dup_user.map(s => s._id);
                    if (d_user.length > 0) {
                        var obj = { replace_id: users[i]._id, deleted_users: d_user };
                        email_del_users.push(obj);
                    }
                    //console.log('query2',query2)
                    //console.log('email users[i]',users[i])

                    //console.log('updatedUser',updatedUser)
                    var updateDupli = await CustomerService.updateManyStatus(query2);
                    var query3 = { is_customer: 1, email: users[i].email, _id: { $ne: ObjectId(users[i]._id) }, status: 0 };
                    //console.log('email deleted query3',query3)
                    var deleted = await CustomerService.deleteMultiple(query3);
                    //console.log('deleted',deleted)
                }
            }
        }

        var query = { is_customer: 1, mobile: { $ne: '' } };
        var users = await CustomerService.getCustomerAllData(query);

        var dupliUsers = await CustomerService.getTestRedundantCustomersMobile(); //get duplicate mobile

        var mobile = dupliUsers.map(s => s.mobile);
        mobile = mobile.filter(n => n)

        var users = await CustomerService.getCustomerAllData({ is_customer: 1, mobile: { $in: mobile } });

        for (var i = 0; i < users.length; i++) {
            var query2 = { is_customer: 1, mobile: users[i].mobile, _id: { $ne: ObjectId(users[i]._id) } };

            var dup_user = await CustomerService.getCustomerAllData(query2);
            if (dup_user?.length > 0) {
                users[i].name = users[i].name ? users[i].name : dup_user[0].name;
                users[i].first_name = users[i].first_name ? users[i].first_name : dup_user[0].first_name;
                users[i].last_name = users[i].last_name ? users[i].last_name : dup_user[0].last_name;
                users[i].email = users[i].email ? users[i].email : dup_user[0].email;
                users[i].mobile = users[i].mobile ? users[i].mobile : dup_user[0].mobile;
                users[i].gender = users[i].gender ? users[i].gender : dup_user[0].gender;
                users[i].dob = users[i].dob ? users[i].dob : dup_user[0].dob;
                users[i].anniversary_date = users[i].anniversary_date ? users[i].anniversary_date : dup_user[0].anniversary_date;
                users[i].customer_heart = users[i].customer_heart ? users[i].customer_heart : dup_user[0].customer_heart;
                users[i].customer_icon = users[i].customer_icon ? users[i].customer_icon : dup_user[0].customer_icon;
                users[i].customer_badge = users[i].customer_badge ? users[i].customer_badge : dup_user[0].customer_badge;
                users[i].email_notification = users[i].email_notification ? users[i].email_notification : dup_user[0].email_notification;
                users[i].sms_notification = users[i].sms_notification ? users[i].sms_notification : dup_user[0].sms_notification;

                users[i].session_email_notification = users[i].session_email_notification ? users[i].session_email_notification : dup_user[0].session_email_notification;

                users[i].session_sms_notification = users[i].session_sms_notification ? users[i].session_sms_notification : dup_user[0].session_sms_notification;

                var data = {
                    _id: users[i]._id,
                    name: users[i].name,
                    first_name: users[i].first_name,
                    last_name: users[i].last_name,
                    mobile: users[i].mobile,
                    email: users[i].email,
                    gender: users[i].gender,
                    dob: users[i].dob,
                    anniversary_date: users[i].anniversary_date,
                    customer_heart: users[i].customer_heart,
                    customer_icon: users[i].customer_icon,
                    customer_badge: users[i].customer_badge,
                    email_notification: users[i].email_notification,
                    sms_notification: users[i].sms_notification,
                    session_email_notification: users[i].session_email_notification,
                    session_sms_notification: users[i].session_sms_notification,
                    status: 1,
                    is_customer: 1,
                    location_id: dup_user[0].location_id
                };

                var updatedUser = await CustomerService.updateCustomer(data);
                if (updatedUser) {

                    var d_user = dup_user.map(s => s._id);
                    if (d_user.length > 0) {
                        var obj = { replace_id: users[i]._id, deleted_users: d_user };
                        email_del_users.push(obj);
                    }
                    // console.log('mobile query2',query2)
                    // console.log('mobile users[i]',users[i])

                    //console.log('mobile updatedUser',updatedUser)
                    //console.log('deleted query2',query2)
                    var updateDupli = await CustomerService.updateManyStatus(query2);
                    var query3 = { is_customer: 1, mobile: users[i].mobile, _id: { $ne: ObjectId(users[i]._id) }, status: 0 };
                    //console.log('mobile deleted query3',query3)
                    var deleted = await CustomerService.deleteMultiple(query3);
                    //console.log('mobile deleted',deleted)
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: users.length, email_del_users: email_del_users, mobile_del_users: mobile_del_users, message: "Successfully Merge Users" });
    } catch (e) {
        console.log('e', e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

//Merge duplicate user in same location
exports.userAutoMerge = async function (req, res, next) {
    try {
        var email_del_users = [];
        var mobile_del_users = [];

        var location_ids = await LocationService.getActiveLocations({ status: 1 })
        for (var l = 0; l < location_ids.length; l++) {
            var query = { location_id: location_ids[l]._id, is_customer: 1, email: { $ne: '' } };
            var users = await CustomerService.getClients(query);

            for (var i = 0; i < users.length; i++) {
                var query2 = { location_id: location_ids[l]._id, is_customer: 1, email: users[i].email, _id: { $ne: ObjectId(users[i]._id) } };

                var dup_user = await CustomerService.getClients(query2);
                if (dup_user?.length > 0) {
                    users[i].name = users[i].name ? users[i].name : dup_user[0].name;
                    users[i].first_name = users[i].first_name ? users[i].first_name : dup_user[0].first_name;
                    users[i].last_name = users[i].last_name ? users[i].last_name : dup_user[0].last_name;
                    users[i].email = users[i].email ? users[i].email : dup_user[0].email;
                    users[i].mobile = users[i].mobile ? users[i].mobile : dup_user[0].mobile;
                    users[i].gender = users[i].gender ? users[i].gender : dup_user[0].gender;
                    users[i].dob = users[i].dob ? users[i].dob : dup_user[0].dob;
                    users[i].anniversary_date = users[i].anniversary_date ? users[i].anniversary_date : dup_user[0].anniversary_date;
                    users[i].customer_heart = users[i].customer_heart ? users[i].customer_heart : dup_user[0].customer_heart;
                    users[i].customer_icon = users[i].customer_icon ? users[i].customer_icon : dup_user[0].customer_icon;
                    users[i].customer_badge = users[i].customer_badge ? users[i].customer_badge : dup_user[0].customer_badge;
                    users[i].email_notification = users[i].email_notification ? users[i].email_notification : dup_user[0].email_notification;
                    users[i].sms_notification = users[i].sms_notification ? users[i].sms_notification : dup_user[0].sms_notification;

                    var data = {
                        _id: users[i]._id,
                        name: users[i].name,
                        first_name: users[i].first_name,
                        last_name: users[i].last_name,
                        mobile: users[i].mobile,
                        email: users[i].email,
                        gender: users[i].gender,
                        dob: users[i].dob,
                        anniversary_date: users[i].anniversary_date,
                        customer_heart: users[i].customer_heart,
                        customer_icon: users[i].customer_icon,
                        customer_badge: users[i].customer_badge,
                        email_notification: users[i].email_notification,
                        sms_notification: users[i].sms_notification,
                        status: 1,
                        is_customer: 1,
                    };
                    var updatedUser = await CustomerService.updateCustomer(data);
                    if (updatedUser) {
                        var d_user = dup_user.map(s => s._id);
                        if (d_user.length > 0) {
                            var obj = { replace_id: users[i]._id, deleted_users: d_user, location_id: location_ids[l]._id };
                            email_del_users.push(obj);
                            //await replceBookingUser(obj,location_ids[l]._id)
                        }
                        //console.log('query2',query2)
                        //console.log('email users[i]',users[i])
                        //console.log('email dup_user',dup_user)

                        //console.log('updatedUser',updatedUser)
                        var updateDupli = await CustomerService.updateManyStatus(query2);
                        var query3 = { location_id: location_ids[l]._id, is_customer: 1, email: users[i].email, _id: { $ne: ObjectId(users[i]._id) }, status: 0 };
                        //console.log('email deleted query3',query3)
                        //var deleted = await CustomerService.deleteMultiple(query3);
                        //console.log('deleted',deleted)
                    }
                }
            }

            var query = { location_id: location_ids[l]._id, is_customer: 1, mobile: { $ne: '' } };
            var users = await CustomerService.getClients(query);

            for (var i = 0; i < users.length; i++) {
                var query2 = { location_id: location_ids[l]._id, is_customer: 1, mobile: users[i].mobile, _id: { $ne: ObjectId(users[i]._id) } };

                var dup_user = await CustomerService.getClients(query2);
                if (dup_user?.length > 0) {
                    users[i].name = users[i].name ? users[i].name : dup_user[0].name;
                    users[i].first_name = users[i].first_name ? users[i].first_name : dup_user[0].first_name;
                    users[i].last_name = users[i].last_name ? users[i].last_name : dup_user[0].last_name;
                    users[i].email = users[i].email ? users[i].email : dup_user[0].email;
                    users[i].mobile = users[i].mobile ? users[i].mobile : dup_user[0].mobile;
                    users[i].gender = users[i].gender ? users[i].gender : dup_user[0].gender;
                    users[i].dob = users[i].dob ? users[i].dob : dup_user[0].dob;
                    users[i].anniversary_date = users[i].anniversary_date ? users[i].anniversary_date : dup_user[0].anniversary_date;
                    users[i].customer_heart = users[i].customer_heart ? users[i].customer_heart : dup_user[0].customer_heart;
                    users[i].customer_icon = users[i].customer_icon ? users[i].customer_icon : dup_user[0].customer_icon;
                    users[i].customer_badge = users[i].customer_badge ? users[i].customer_badge : dup_user[0].customer_badge;
                    users[i].email_notification = users[i].email_notification ? users[i].email_notification : dup_user[0].email_notification;
                    users[i].sms_notification = users[i].sms_notification ? users[i].sms_notification : dup_user[0].sms_notification;

                    var data = {
                        _id: users[i]._id,
                        name: users[i].name,
                        first_name: users[i].first_name,
                        last_name: users[i].last_name,
                        mobile: users[i].mobile,
                        email: users[i].email,
                        gender: users[i].gender,
                        dob: users[i].dob,
                        anniversary_date: users[i].anniversary_date,
                        customer_heart: users[i].customer_heart,
                        customer_icon: users[i].customer_icon,
                        customer_badge: users[i].customer_badge,
                        email_notification: users[i].email_notification,
                        sms_notification: users[i].sms_notification,
                        status: 1,
                        is_customer: 1,
                    };
                    var updatedUser = await CustomerService.updateCustomer(data);
                    if (updatedUser) {

                        var d_user = dup_user.map(s => s._id);
                        if (d_user.length > 0) {
                            var obj = { replace_id: users[i]._id, deleted_users: d_user, location_id: location_ids[l]._id };
                            email_del_users.push(obj);
                            //await replceBookingUser(obj,location_ids[l]._id);
                        }
                        //console.log('mobile query2',query2)
                        //console.log('mobile users[i]',users[i])
                        //console.log('mobile dup_user',dup_user)

                        //console.log('mobile updatedUser',updatedUser)
                        //console.log('deleted query2',query2)
                        var updateDupli = await CustomerService.updateManyStatus(query2);
                        var query3 = { location_id: location_ids[l]._id, is_customer: 1, mobile: users[i].mobile, _id: { $ne: ObjectId(users[i]._id) }, status: 0 };
                        //console.log('mobile deleted query3',query3)
                        //var deleted = await CustomerService.deleteMultiple(query3);
                        //console.log('mobile deleted',deleted)
                    }
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, location_ids: location_ids, data: users, email_del_users: email_del_users, mobile_del_users: mobile_del_users, message: "Successfully Merge Users" });
    } catch (e) {
        console.log('e', e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getSpecificCustomer = async function (req, res, next) {
    try {
        var query = { status: 1 };
        var app_query = {};
        var ser_query = {};
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;

        if (req.body.company_id) {
            query['company_ids'] = ObjectId(req.body.company_id);
        }

        if (req.query.customer_icon && req.query.company_id) {
            query['customer_icons'] = { $elemMatch: { icon: req.query.customer_icon, company_id: req.query.company_id } };
        }

        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_ids'] = ObjectId(req.body.location_id);
        }
        if (start_date && !end_date) {
            app_query['date'] = { $gte: start_date };
        }
        if (!start_date && end_date) {
            app_query['date'] = { $lte: end_date };
        }
        if (start_date && end_date && (req.body.service_id.length == 0 || req.body.unused_service_id.length == 0)) {
            app_query['$and'] = [{ date: { $gte: start_date } }, { date: { $lte: end_date } }];
        }
        if (req.body.category_id && req.body.service_id.length == 0) {
            ser_query['category_id'] = req.body.category_id;
            var ser_data = await ServiceService.getServiceSpecific(ser_query);
            req.body.service_id = ser_data.map(s => s._id.toString());
        }

        if (req.body.unused_category_id && req.body.unused_service_id.length == 0) {
            ser_query['category_id'] = req.body.unused_category_id;
            var ser_data = await ServiceService.getServiceSpecific(ser_query);
            req.body.unused_service_id = ser_data.map(s => s._id.toString());
        }

        if (req.body.service_id && req.body.service_id.length > 0 && req.body.unused_service_id.length == 0) {
            app_query['service_id'] = { $elemMatch: { $in: req.body.service_id } };
        }
        if (req.body.unused_service_id && req.body.unused_service_id.length > 0 && req.body.service_id.length == 0) {
            app_query['service_id'] = { $elemMatch: { $nin: req.body.unused_service_id } };
        }

        if (req.body.service_id && req.body.unused_service_id && req.body.service_id.length > 0 && req.body.unused_service_id.length > 0) {
            app_query['$and'] = [{ service_id: { $elemMatch: { $in: req.body.service_id } } }, { service_id: { $elemMatch: { $nin: req.body.service_id } } }];

            if (start_date && end_date) {
                app_query['$and'] = [{ date: { $gte: start_date } }, { date: { $lte: end_date } }, { service_id: { $elemMatch: { $in: req.body.service_id } } }, { service_id: { $elemMatch: { $nin: req.body.service_id } } }];
            }
        }

        var appointments = [];
        if (req.body.service_id || req.body.unused_service_id || (start_date && end_date)) {
            //console.log('app_query',app_query)
            appointments = await AppointmentService.getSelectedAppointmentSpecific(app_query);
            var cust_arr = [];
            if (appointments.length > 0) {
                cust_arr = appointments.map(a => a.client_id);
                var resultArray = Array.prototype.concat.apply([], cust_arr);
                const unique_ids = Array.from(new Set(resultArray)); //get all unique data 

                query['_id'] = { $in: unique_ids };
            }
        }
        var Users = await CustomerService.getClients(query)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Users, appointments: appointments, message: "Successfully Users Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// Async Controller function to get the To do List
exports.getCustomers123 = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.query.page ? req.query.page : 0 //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt'
        var order = req.query.order ? req.query.order : '-1'
        var searchText = req.query.searchText ? req.query.searchText : ''

        var query = { status: 1 }
        if (req.query.company_id) {
            query['company_ids'] = ObjectId(req.query.company_id);
        }

        if (req.query.customer_icon && req.query.company_id) {
            query['customer_icons'] = { $elemMatch: { icon: req.query.customer_icon, company_id: req.query.company_id } };
        }

        if (req.query.location_id && !req.query.searchText) {
            query['location_ids'] = ObjectId(req.query.location_id);
        }

        if (req.query.searchText) {
            if (req.query.location_id) {
                query['$and'] = [
                    { $or: [{ name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { email: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { mobile: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }] },
                    {
                        $or: [
                            { location_ids: { $elemMatch: { $eq: req.query.location_id } } }
                        ]
                    }
                ]
            } else {
                query['$or'] = [
                    { name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
                    { email: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
                    { mobile: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }
                ]
            }
        }

        var users = await CustomerService.getAllCustomers(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText)

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Users, message: "Successfully Users Recieved" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getClients = async function (req, res, next) {
    try {
        //console.log('getClients',req.query)
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.query.page ? req.query.page : 0
        var limit = req.query.limit ? req.query.limit : 1000;
        var query = { status: 1 };

        if (req.query?.id) {
            query['_id'] = req.query.id
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_ids'] = { $elemMatch: { $eq: req.query.location_id } };
        }

        if (req.query.searchText) {
            query['$or'] = [{ name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { email: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { mobile: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }];
        }

        var Users = await CustomerService.getClients(query, page, limit)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Users, message: "Successfully Users Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.checkIsEmailUnique = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var email = req.body.email;
        var location_id = req.body.location_id;
        var query = { email: email };
        if (!req.body.user_id && location_id && location_id != undefined) {
            query['location_ids'] = ObjectId(location_id.toString());
        }

        if (req.body.user_id) {
            query['_id'] = { $ne: ObjectId(req.body.user_id) };
        }

        var user = await CustomerService.getCustomerbyLocation(query);
        if (user && (!user.status || user.is_blocked)) {
            return res.status(200).json({ status: 200, is_suspended: 1, flag: false, data: null, user_id: user._id, message: "This account is suspended" })
        }

        if (user && user._id) {
            flag = false;
            message = 'Email already exists';
        } else {
            flag = true;
            message = 'Email does not exists';
        }
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: flag, data: null, message: message });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        //return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.checkIsEmailAndMobileUnique = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var email = req.query.email;
        var mobile = req.query.mobile;
        var location_id = req.query.location_id;
        var eQuery = { email: email };
        var mQuery = { mobile: mobile };

        var emailUser = await CustomerService.getCustomerbyLocation(eQuery);
        var mobileUser = await CustomerService.getCustomerbyLocation(mQuery);
        if (emailUser && mobileUser && emailUser._id.toString() != mobileUser._id.toString()) {
            flag = false;
            message = 'Email or mobile already exists';
        } else {
            flag = true;
            message = 'Email or mobile does not exists';
        }
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: flag, emailUser: emailUser, mobileUser: mobileUser, message: message });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        //return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.checkIsMobileUnique = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var mobile = req.query.mobile;
        var location_id = req.query.location_id;
        var query = { mobile: mobile };
        if (!req.query.user_id && location_id && location_id != undefined) {
            query['location_ids'] = ObjectId(location_id);
        }
        if (req.query.user_id) {
            query['_id'] = { $ne: ObjectId(req.query.user_id) };
        }
        var User = await CustomerService.getCustomerbyLocation(query);

        if ((User && (!User.status || User.is_blocked))) {
            return res.status(200).json({ status: 200, is_suspended: 1, flag: false, data: null, user_id: User._id, message: "This account is suspended" })
        }

        if (User && User._id) {
            flag = false;
            message = 'Mobile already exists';
        } else {
            flag = true;
            message = 'Mobile does not exists';
        }
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: flag, data: null, message: message });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        //return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.checkCustomerByEmailMobile = async function (req, res, next) {
    try {
        var email = req.query.email;
        var location_id = req.query.location_id;
        if (!email && !req.query.mobile) {
            return res.status(200).json({ status: 200, flag: false, message: "Email or Mobile must be present" })
        }

        // var is_email_exist = 0;
        // var is_mobile_exist = 0;
        // var e_msg = '';
        // var m_msg = '';
        // if(email){
        //     var email_query = {is_customer:{$ne:1},status:1,email:email};
        //     var email_user = await CustomerService.getCustomerbyLocation(email_query);
        //     if(email_user){
        //         is_email_exist = 1;
        //         e_msg = "Email already exists";
        //     }
        // }
        // if(req.query.mobile){
        //     var mobile_query = {is_customer:{$ne:1},status:1,mobile:req.query.mobile};

        //     var mobile_user = await CustomerService.getCustomerbyLocation(mobile_query);
        //     if(mobile_user){
        //         is_mobile_exist = 1;
        //         m_msg = "Mobile already exists";
        //     }
        // }

        // console.log('email_query',email_query)
        // console.log('mobile_query',mobile_query)
        // console.log('email_user',email_user)
        // console.log('mobile_user',mobile_user)

        // if((email_user && email_user._id) || (mobile_user && mobile_user._id)) {
        //     return res.status(200).json({status: 200, flag: false, is_email_exist:is_email_exist,is_mobile_exist:is_mobile_exist,data: [],email_user:email_user,mobile_user:mobile_user,e_msg:e_msg,m_msg:m_msg, message: "Email or Mobile already exists"});
        // }else{
        var user = [];
        if (email) {
            var query = { email: email };

            user = await CustomerService.getCustomerByQuery(query);
        }

        //console.log("User ",user)
        if (user.length == 0 && req.query.mobile) {
            var query2 = { mobile: req.query.mobile };
            user = await CustomerService.getCustomerByQuery(query2);
        }
        //console.log("User2 ",user)

        //console.log("\n User\n\n",User);
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: user, message: "Successfully User Recieved" });
        //}
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomerByEmail = async function (req, res, next) {
    try {
        var email = req.body.email
        var query = { email: email }
        var query2 = { mobile: req.body.mobile }

        var user = await CustomerService.getCustomerByQuery(query)
        if (user?.length == 0 && req.body?.mobile) {
            var user = await CustomerService.getCustomerByQuery(query2)
        }
        var company_id = null;
        if (req.body.location_id) {
            var location = await LocationService.getLocation(req.body.location_id)
            if (location && location.company_id) {
                company_id = location.company_id
            }
        }

        if (user?.length == 0) {
            var query = { location_id: req.body.location_id, company_id: company_id, name: req.body.name, email: email, mobile: req.body.mobile, gender: req.body.gender, status: 1, is_blocked: 0, email_notification: 1, sms_notification: 1, session_email_notification: 1, session_sms_notification: 1, customer_icon: 'rose' }

            var user = await CustomerService.createCustomer(query)
        } else {
            if (user.email == req.body.email && user.mobile) {
                req.body.mobile = null;
            } else if (user.mobile == req.body.mobile && user.email) {
                req.body.email == null;
            }

            var query = { _id: user[0]._id, location_id: req.body.location_id, company_id: company_id, name: req.body.name, email: email, mobile: req.body.mobile, gender: req.body.gender, status: 1, is_blocked: 0 }

            var user = await CustomerService.updateCustomer(query)
        }

        token1 = jwt.sign({
            id: user._id,
            customer_id: user._id,
            role_id: user?.role_id || ""
        }, process.env.SECRET, {
            expiresIn: 604800 // expires in 7 days
        })

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            token: token1,
            status: 200,
            flag: true,
            data: user,
            message: "User recieved successfully!"
        })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCustomers = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.query.page ? req.query.page : 0; //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000;
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
        var order = req.query.order ? req.query.order : '-1';
        var serachText = req.query.serachText ? req.query.serachText : '';

        var query = { status: 1 };

        if (req.query.company_id) {
            query['company_ids'] = ObjectId(req.query.company_id);
        }
        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_ids'] = ObjectId(req.query.location_id);
        }
        if (req.query.customer_icon && req.query.company_id) {
            query['customer_icons'] = { $elemMatch: { icon: req.query.customer_icon, company_id: req.query.company_id } };
        }

        if (req.query.searchText && req.query.searchText != 'undefined') {

            query['$or'] = [{ name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { gender: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { email: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { mobile: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }];

        }

        var users = await CustomerService.getCustomers(query, parseInt(page), parseInt(limit), order_name, Number(order), serachText);

        var users_data = users[0].data;
        if (req.query.company_id) {
            var company_id = req.query.company_id;
            for (var i = 0; i < users_data.length; i++) {

                var i_ind = -1;
                if (company_id && users_data[i].customer_icons) {
                    i_ind = users_data[i].customer_icons.findIndex(x => x.company_id == company_id)
                }
                if (i_ind > -1) {
                    users_data[i].customer_icon = users_data[i]?.customer_icons[i_ind]?.icon;
                }
            }
            users[0].data = users_data;

        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: users, message: "Successfully Users Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getActiveCustomers = async function (req, res, next) {
    try {
        // console.log('getActiveCustomers',req.query)
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.query.page ? req.query.page : 1
        var limit = req.query.limit ? req.query.limit : 1000;
        var query = { status: 1 };
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id;
        }
        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_ids'] = { $elemMatch: { $eq: req.query.location_id } };
        }

        var users = await CustomerService.getActiveCustomers(query, page, limit)
        for (var i = 0; i < users.length; i++) {
            users[i].name = users[i].name + " - " + users[i].mobile
        }
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: users, message: "Successfully Users Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomerDataForExport = async function (req, res, next) {
    try {
        var query = { status: 1 };
        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_ids'] = { $elemMatch: { $eq: req.query.location_id } };
        }

        if (req.query.customer_icon && req.query.company_id) {
            query['customer_icons'] = { $elemMatch: { icon: req.query.customer_icon, company_id: req.query.company_id } };
        }

        query['email_notification'] = 1;
        query['sms_notification'] = 1;
        query['session_sms_notification'] = 1;
        query['session_email_notification'] = 1;
        var users = await CustomerService.getCustomerDataForExport(query);
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: users, message: "Successfully Users Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// this function for consultant form
exports.getActiveCustomerConsultant = async function (req, res, next) {
    try {
        // console.log('getActiveCustomers',req.query)
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.query.page ? req.query.page : 1
        var limit = req.query.limit ? req.query.limit : 1000;
        var query = { status: 1 };
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id;
        }
        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_ids'] = { $elemMatch: { $eq: req.query.location_id } };
        }

        var users = await CustomerService.getActiveCustomers(query, page, limit)
        for (var i = 0; i < users.length; i++) {
            users[i].name = users[i].name + " - " + users[i].email + " - " + users[i].mobile;
        }
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: users, message: "Successfully Users Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomerbyId = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var user = await CustomerService.getCustomer(id)
        // Return the User list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: user, message: "Succesfully User Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomerNotification = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var user = await CustomerService.getCustomerNotification({ _id: id })
        // Return the User list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: user, message: "Succesfully User Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomer = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id
        var User = await CustomerService.getCustomer(id)

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: User, message: "User recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createCustomer = async function (req, res, next) {
    try {
        var email = req.body.email
        var mobile = req.body.mobile;
        var type = req.body?.type || "";
        var is_customer = req.body.is_customer

        // if (!email) {
        //     return res.status(200).json({ status: 200, flag: false, message: "Email must be present" })
        // }

        var query2 = {}
        if (email && mobile) {
            query2['$or'] = [{ email: email }, { mobile: mobile }]
        } else if (email && !mobile) {
            query2['email'] = email
        } else if (!email && mobile) {
            query2['mobile'] = mobile
        }

        var user = await CustomerService.checkCustomerExist(query2)
        if (user && user._id) {
            if ((!user.status || user.is_blocked) && type == "customer") {
                return res.status(200).json({ status: 200, flag: false, data: null, message: "Your account is suspended, To recover your account, please reset password" })
            }

            req.body._id = user._id
            if (is_customer == 1) {
                // Update User
                req.body.status = 1;
                req.body.is_blocked = 0;
                if (user.email == req.body.email && user.mobile) {
                    req.body.mobile = null;
                } else if (user.mobile == req.body.mobile && user.email) {
                    req.body.email == null;
                }
                if (req.body.location_id) {
                    var location = await LocationService.getLocation(req.body.location_id)
                    if (location && location.company_id) {
                        req.body.company_id = location.company_id
                    }
                }
                var updatedUser = await CustomerService.updateCustomer(req.body)

                var expiresIn = 8640000 // expires in 100 days
                token1 = jwt.sign({
                    id: user._id,
                    customer_id: user._id,
                    role_id: user?.role_id || ""
                }, process.env.SECRET, { expiresIn: expiresIn })

                return res.status(200).json({
                    status: 200,
                    flag: true,
                    new_user: false,
                    data: updatedUser,
                    token: token1,
                    message: "User created successfully!"
                })
            } else {
                return res.status(200).json({ status: 200, flag: false, data: User, message: "Email already exists" })
            }
        } else {
            req.body.is_customer = 1
            if (req.body.location_id) {
                req.body.location_ids = [req.body.location_id]

                var location = await LocationService.getLocation(req.body.location_id)
                if (location && location.company_id) {
                    req.body.company_ids = [location.company_id]
                }
            }

            // console.log('req.body', req.body)
            var createdUser = await CustomerService.createCustomer(req.body);

            // CustomerService.verifyWhatsAppAccount(req.body.mobile, createdUser._id);

            var expiresIn = 86400 // expires in 24 hours
            token1 = jwt.sign({
                id: createdUser._id,
                customer_id: createdUser._id,
                role_id: createdUser?.role_id || ""
            }, process.env.SECRET, { expiresIn: expiresIn })

            return res.status(200).json({
                token: token1,
                flag: true,
                new_user: true,
                data: createdUser,
                message: "User created successfully!"
            })
        }
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

const sendUnsubscibeEmail = async function (data) {
    try {
        var toMail = {}
        toMail['site_url'] = process.env?.API_URL || ""
        toMail['link_url'] = process.env?.SITE_URL || ""

        var to = data?.email || ""
        var name = data?.name || ""
        var html = ""

        //var customer = await CustomerService.getCustomer(data?._id)

        toMail['client_id'] = data?._id
        toMail['client_name'] = name
        toMail['data'] = data
        toMail['session_email_notification'] = data.session_email_notification ? 'Subscribed' : 'Unsubscribed'
        toMail['birthday_email_notification'] = data.birthday_email_notification ? 'Subscribed' : 'Unsubscribed'
        toMail['marketing_email_notification'] = data.marketing_email_notification ? 'Subscribed' : 'Unsubscribed'
        toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + data?._id

        if (data.email && data.email != '' && (data.birthday_email_notification || data.session_email_notification || data.marketing_email_notification)) {
            var subject = "Unsubscribed Successfully ";
            var temFile = "unsubscribe.hjs";
            html = "";

            var sendEmail = await SendEmailSmsService.sendMailAwait(to, name, subject, temFile, html, toMail, 'marketing')

            var emailData = {
                company_id: '',
                location_id: '',
                client_id: data?._id,
                subject: subject,
                name: name,
                type: "single",
                file_type: "unsubscribe",
                temp_file: temFile,
                html: '',
                data: toMail,
                date: Date(),
                to_email: to,
                status: "sent",
                response: null,
                response_status: 'sent',
                till_date: Date()
            }

            if (sendEmail && sendEmail?.status) {
                emailData.response = sendEmail.response;
                emailData.response_status = sendEmail.status;
                emailData.status = sendEmail.status;
            }

            var eLog = EmailLogService.createEmailLog(emailData)
        }

        return null;
    } catch (e) {
        console.log(e)
        return null
    }
}

exports.updateCustomerNotification = async function (req, res, next) {
    try {
        // Id is necessary for the update
        var id = req.body?._id || ""
        if (!id) {
            return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
        }

        if (id) {
            var updatedUser = await CustomerService.updateCustomer(req.body);

            sendUnsubscibeEmail(updatedUser);
        }

        return res.status(200).json({ status: 200, flag: true, data: updatedUser, message: "User updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateCustomer = async function (req, res, next) {
    try {
        // Id is necessary for the update
        var id = req.body?._id || ""
        if (!id) {
            return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
        }
        var customerRole = process.env?.CUSTOMER_ROLE || "607d8af0841e37283cdbec4c"

        var email = req.body?.email || ""
        var mobile = req.body?.mobile || ""

        req.body.is_customer = 1
        req.body.customer_heart = req.body.black_heart ? "black_heart" : "normal"
        var user = await CustomerService.getCustomer(req.body._id)
        if (user) {

            // Check if we need to update the location_id
            if (req.body.location_id && req.body.status == 0) {
                // Remove the location_id from the user's locations array
                user.location_ids = user.location_ids.filter(locationId => locationId != req.body.location_id);
                req.body.location_ids = user.location_ids;
            }
            // Update the user with the new details
            var updatedUser = await CustomerService.updateCustomer(req.body);
        } else if (req.body._id && req.body.password) {
            var updatedUser = await CustomerService.updateCustomer({ _id: req.body._id, password: req.body.password });
        }

        return res.status(200).json({ status: 200, flag: true, data: updatedUser, message: "User updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// block multiple users
exports.blockCustomers = async function (req, res, next) {
    try {
        let users = req.body.users;
        let query = { _id: { $in: users } };
        let update = { is_blocked: 1 };
        if (users.length > 0) {
            let updatedUser = await CustomerService.updateMultipleUsers(query, update);
        }

        return res.status(200).json({ status: 200, flag: true, message: "Successfully Updated User" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.recoverCustomerAccount = async function (req, res, next) {
    try {
        let user_id = req.params.id;
        let updatedUser;
        if (user_id) {
            let update = { _id: user_id, is_blocked: 0, status: 1 };
            updatedUser = await CustomerService.updateCustomer(update);
        } else {
            return res.status(200).json({ status: 200, flag: false, message: "User Id must be present" })
        }

        return res.status(200).json({ status: 200, flag: true, data: updatedUser, message: "Successfully User Deleted" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.softDeleteUser = async function (req, res, next) {
    try {
        let user_id = req.params.id;
        let device_token = req.query.device_token;

        if (user_id) {
            let update = { _id: user_id, is_blocked: 1, status: 0 };
            let updatedUser = await CustomerService.updateCustomer(update);

            if (device_token) {
                var query = { user_id: user_id, device_token: device_token };
                await UserDeviceTokenService.deleteMultiple(query);
            }
        } else {
            return res.status(200).json({ status: 200, flag: false, message: "User Id must be present" })
        }

        return res.status(200).json({ status: 200, flag: true, message: "Successfully User Deleted" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

function stringGen(yourNumber) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < yourNumber; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

exports.forgotPassword = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body.email) {
        return res.status(200).json({ status: 200, flag: false, message: "Email must be present" })
    }

    // console.log('req body ',req.body)
    try {
        var query = { email: req.body.email };
        var user = await CustomerService.getCustomerbyLocation(query);
        if (user) {
            user.password = stringGen(6);
            user.forgot_password = 1;
            var updatedUser = await CustomerService.updateCustomer(user);

            var toMail = {};
            toMail['password'] = user.password;
            toMail['email'] = req.body.email;
            toMail['client_name'] = user.name;

            var to = req.body.email;
            var name = user.name;
            var subject = "Forgot Password";
            var temFile = "forgot_password.hjs";

            html = "";

            var sendEmail = await SendEmailSmsService.sendMailAwait(to, name, subject, temFile, html, toMail, 'transaction')

            var emailData = {
                company_id: location.company_id,
                location_id: location._id,
                client_id: '',
                subject: subject,
                name: name,
                type: "single",
                file_type: "forgot_password",
                temp_file: temFile,
                html: '',
                data: toMail,
                date: Date(),
                to_email: to,
                status: "initial",
                response: null,
                response_status: '',
            }

            if (sendEmail && sendEmail?.status) {
                emailData.response = sendEmail.response;
                emailData.response_status = sendEmail.status;
                emailData.status = sendEmail.status;
            }

            var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
            var tillDate = increaseDateDays(new Date, days)
            if (tillDate) {
                emailData.till_date = tillDate
            }

            var eLog = EmailLogService.createEmailLog(emailData)

            return res.status(200).json({ status: 200, flag: true, data: updatedUser._id, message: "Login detail sent successfully to your Email address" })

        } else {
            return res.status(200).json({ status: 200, flag: false, message: "No User Found" })
        }
    } catch (e) {
        console.log('err:', e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCustomerPermission = async function (req, res, next) {
    // Role Id is necessary 
    var roleId = req.body?.role_id || "";
    if (!roleId) {
        return res.status(200).json({ status: 200, flag: false, message: "Role Id be present" })
    }

    try {
        // Calling the Service function with the new object from the Request Body
        if (roleId && roleId != '') {
            var query = { role_id: roleId };
            var permission = await PermissionService.getPermissionss(query);

        }

        return res.status(200).json({ status: 200, flag: true, data: permission, subscription: subscription, message: "Successfully received permission" })
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.loginCustomer = async function (req, res, next) {
    // Req.Body contains the form submit values.
    try {
        if (req.body.email) {
            req.body.email = req.body.email.toLowerCase()
        }

        var user = {
            email: req.body.email,
            status: 1
        }

        // Calling the Service function with the new object from the Request Body
        var loginUser = await CustomerService.loginCustomer(user, req.body.password)
        var token1 = jwt.sign({
            id: loginUser._id,
            customer_id: loginUser._id,
            role_id: loginUser?.role_id || ""
        }, process.env.SECRET, {
            expiresIn: 604800 // expires in 7 days
        })

        if (loginUser._id && req.body.device_token) {
            var user_data = { _id: loginUser._id, device_token: req.body.device_token }
            var updatedUser = await CustomerService.updateCustomer(user_data)
        }

        if (loginUser && loginUser._id) {
            loginUser = await CustomerService.getCustomer(loginUser._id)
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: loginUser,
            token: token1,
            message: "Login successfully!"
        })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "Invalid username or password" })
    }
}

exports.customerLogin = async function (req, res, next) {
    try {
        var email = req.body?.email || "";
        var mobile = req.body?.mobile || "";
        var locationId = req.body?.location_id || "";
        var device_token = req.body.device_token || '';
        var device_type = req.body.device_type || '';

        var message = "";
        var required = false
        if (!email && !mobile) {
            required = true;
            message = "Email or mobile any one must present!";
        }

        if (mobile && email) {
            required = true;
            message = "Email or mobile any one must present!";
        }

        if (required) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                message: message
            })
        }

        var query = {}
        if (email) {
            email = email.toLowerCase();
            query['email'] = email;
        }

        if (mobile) { query['mobile'] = mobile }

        if (locationId) {
            query["location_ids"] = { location_ids: { $elemMatch: { $eq: req.body.location_id } } };
        }

        // console.log('query', query)
        // Calling the Service function with the new object from the Request Body
        var loginUser = await CustomerService.loginCustomer(query, req.body?.password || "")
        if (loginUser && (!loginUser.status || loginUser.is_blocked)) {
            return res.status(200).json({ status: 200, flag: false, data: null, message: "Your account is suspended, To recover your account, please reset password!" })
        }

        if (loginUser && loginUser._id && req.body.device_token) {
            var user_data = { _id: loginUser._id, device_token: req.body.device_token };
            var updatedUser = await CustomerService.updateCustomer(user_data);
        }

        var token1 = '';
        if (loginUser && loginUser._id) {
            token1 = jwt.sign({
                id: loginUser._id,
                customer_id: loginUser._id,
                role_id: loginUser?.role_id || ""
            }, process.env.SECRET, {
                expiresIn: 604800 // expires in 7 days
            })

            loginUser = await CustomerService.getCustomer(loginUser._id);
            // console.log('device_token', device_token)

            if (device_token) {
                var query = { device_token: device_token };
                await UserDeviceTokenService.inactiveMultipleStatus(query);
                await UserDeviceTokenService.inactiveMultipleStatus({ user_id: loginUser._id });

                var exitstQuery = { user_id: loginUser._id, device_token: device_token };

                var updateData = {
                    user_id: ObjectId(loginUser._id),
                    device_token: device_token,
                    device_type: device_type,
                    app_type: 'customer',
                    status: 1
                }

                var tok = await UserDeviceTokenService.addOrUpdateData(exitstQuery, updateData);
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: loginUser,
            token: token1,
            message: "Logged in successfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "Invalid user credentials!" })
    }
}

exports.recoverCustomerAccount = async function (req, res, next) {
    try {
        let user_id = req.params.id;
        let updatedUser;
        if (user_id) {
            let update = { _id: user_id, is_blocked: 0, status: 1 };
            updatedUser = await CustomerService.updateCustomer(update);
        } else {
            return res.status(200).json({ status: 200, flag: false, message: "User Id must be present!" })
        }

        return res.status(200).json({ status: 200, flag: true, data: updatedUser, message: "User recovered successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeCustomer = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await CustomerService.deleteCustomer(id);

        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for customer dropdown
exports.getCustomersDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : 'name';
        var order = req.query?.order ? req.query.order : '1';
        var search = req.query?.searchText ? req.query.searchText : "";

        var query = {};
        var existQuery = {};
        if (req.query?.status == "active") { query['status'] = 1 }
        if (req.query?.company_id) { query['company_ids'] = ObjectId(req.query.company_id) }
        if (req.query?.location_id) { query['location_ids'] = ObjectId(req.query.location_id) }
        if (req.query?.id) { query['_id'] = req.query.id }

        if (req.query?.ids && isValidJson(req.query.ids)) {
            var ids = JSON.parse(req.query.ids);
            query['_id'] = { $nin: ids };
            existQuery['_id'] = { $in: ids };
        }

        if (search) {
            query['$or'] = [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } },
                { mobile: { $regex: '.*' + search + '.*', $options: 'i' } }
            ];
        }

        var existUsers = []
        if (!isObjEmpty(existQuery)) {
            existUsers = await CustomerService.getCustomersDropdown(existQuery, orderName, order) || [];
        }

        var users = await CustomerService.getCustomersDropdown(query, orderName, order) || []
        users = existUsers.concat(users) || [];

        return res.status(200).send({ status: 200, flag: true, data: users, message: "Customers dropdown received successfully..." })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

/* Customer */
exports.createCustomerUser = async function (req, res, next) {
    try {
        var companyId = req.body?.company_id || "";
        var company = req.body?.company || "";
        var email = req.body?.email || "";
        var mobile = req.body?.mobile || "";
        var password = req.body?.password || "";
        var locationId = req.body?.location_id || "";
        var device_token = req.body.device_token || '';
        var device_type = req.body.device_type || '';

        if (!email) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                token: "",
                message: "Email must be present!"
            })
        }

        var query = {};
        var message = "Something went wrong!";
        if (email && mobile) {
            query['$or'] = [{ email: email }, { mobile: mobile }];
            message = "Email or mobile already exist!";
        } else if (email && !mobile) {
            query['email'] = email;
            message = "Email already exist!";
        } else if (!email && mobile) {
            query['mobile'] = mobile;
            message = "Mobile already exist!";
        }

        req.body.role_id = process.env?.CUSTOMER_ROLE || "";
        req.body.is_customer = 1;

        var user = await CustomerService.checkCustomerExist(query)
        if (user?._id && (!user?.status || user?.is_blocked)) {
            return res.status(200).json({ status: 200, flag: false, data: null, message: "Your account is suspended, To recover your account, please reset password!" })
        }

        if (user && user._id) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                token: null,
                message: message
            })
        } else {
            password = password ? password : getRandPswd()
            req.body.password = password;

            if (locationId) {
                var location = await locationsService.getLocationOne({ _id: locationId });
                if (location?.company_id && location.company_id?._id) {
                    companyId = location.company_id._id;
                    req.body.company_id = location.company_id._id;
                    req.body.location_ids = [locationId];
                    req.body.location_id = locationId;
                }
            }

            if (companyId) {
                req.body.company_id = companyId;
                req.body.company_ids = [companyId];
            }

            var html = ""
            var subject = "Welcome to" + company;
            var temFile = "customer_created_info.hjs";

            var toMail = {}
            toMail['site_url'] = process.env?.API_URL || "";
            toMail['link_url'] = process.env?.SITE_URL || "";


            var token = null;
            var createdUser = await CustomerService.createCustomer(req.body) || null;
            if (createdUser && createdUser._id) {
                toMail['name'] = createdUser.name;
                toMail['email'] = createdUser.email;
                toMail['mobile'] = createdUser?.mobile || "";
                toMail['password'] = password;

                if (device_token) {
                    var data = {
                        user_id: ObjectId(createdUser._id),
                        device_token: device_token,
                        device_type: device_type,
                        app_type: 'customer',
                        status: 1
                    }

                    await UserDeviceTokenService.createUserDeviceToken(data);
                }

                var sendEmail = await SendEmailSmsService.sendMailAwait(createdUser.email, createdUser.name, subject, temFile, html, toMail, 'transaction');

                var expiresIn = 86400 // expires in 24 hours
                token = jwt.sign({
                    id: createdUser._id,
                    customer_id: createdUser._id,
                    role_id: createdUser?.role_id || ""
                }, process.env.SECRET, { expiresIn: expiresIn })
            }

            return res.status(200).json({
                status: 200,
                flag: true,
                data: createdUser || null,
                token: token,
                message: "Customer created successfully!"
            })
        }
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            data: null,
            token: null,
            message: e.message
        })
    }
}
/* /Customer */

exports.resetPassword = async function (req, res, next) {
    try {
        var data = null;
        var message = "";

        var type = req.body?.type || "";
        var email = req.body?.email || "";
        var mobile = req.body?.mobile || "";

        var required = false
        if (!email && !mobile) {
            required = true;
            message = "Email or mobile any one must present!";
        }

        if (mobile && email) {
            required = true;
            message = "Email or mobile any one must present!";
        }

        if (required) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                message: message
            })
        }

        var existQuery = {};
        if (type == "customer") { existQuery['is_customer'] = 1; }
        if (email) { existQuery['email'] = email; }
        if (mobile) { existQuery['mobile'] = mobile; }

        var user = await CustomerService.checkCustomerExist(existQuery);
        if (user && user._id) {
            var code = get4DigitCode();
            var resetToken = generateUniqueId();
            user = await CustomerService.updateCustomer({ _id: user._id, reset_token: resetToken, code: code });

            data = { reset_token: user.reset_token, name: user.name, email: user?.email || "", mobile: user?.mobile || "" };

            var html = "";
            var subject = "Reset password requested";
            var temFile = "reset_password.hjs";

            var toMail = {}
            toMail['site_url'] = process.env?.API_URL || "";
            toMail['link_url'] = process.env?.SITE_URL || "";

            toMail['name'] = user.name;
            toMail['email'] = user.email;
            toMail['code'] = code;

            if (user?.email) {
                var sendEmail = await SendEmailSmsService.sendMailAwait(user.email, user.name, subject, temFile, html, toMail, 'transaction');
            }

            return res.status(200).json({
                status: 200,
                flag: true,
                data: data || null,
                message: "Reset password code sent to email successfully!"
            })
        } else {
            if (email) {
                message = "Check your email you are not registered!";
            }

            if (mobile) {
                message = "Check your mobile number you are not registered!";
            }

            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                message: message
            })
        }
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            data: null,
            message: e.message
        })
    }
}

exports.verifyResetCode = async function (req, res, next) {
    try {
        var resetToken = req.body?.reset_token || "";
        var code = req.body?.code || "";

        var required = false;
        var data = null;
        var flag = false;
        var message = "Reset code not valid!";

        if (!resetToken) {
            required = true;
            message = "Reset token must be present!";
        } else if (!code) {
            required = true;
            message = "Code must be present!";
        }

        if (required) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                message: message
            })
        }

        var user = await CustomerService.checkCustomerExist({ reset_token: resetToken });
        if (user && user._id) {
            if (user?.code == code) {
                flag = true;
                data = { reset_token: user.reset_token, name: user.name, email: user?.email || "", mobile: user?.mobile || "" };
                message = "Reset token and code verified successfully!";
            }
        } else {
            flag = false;
            message = "Reset token is not valid!";
        }

        return res.status(200).json({
            status: 200,
            flag: flag,
            data: data || null,
            message: message
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            data: null,
            message: e.message
        })
    }
}

exports.resetChangePassword = async function (req, res, next) {
    try {
        var resetToken = req.body?.reset_token || "";
        var password = req.body?.password || "";

        var required = false;
        var data = null;
        var flag = false;
        var message = "Something went wrong!";

        if (!resetToken) {
            required = true;
            message = "Reset token must be present!";
        } else if (!password) {
            required = true;
            message = "Password must be present!";
        }

        if (required) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                message: message
            })
        }

        var user = await CustomerService.checkCustomerExist({ reset_token: resetToken });
        if (user && user._id) {
            var updateUser = await CustomerService.updateCustomer({
                _id: user._id,
                code: "",
                reset_token: "",
                password: password,
                status: 1,
                is_blocked: 0
            })
            if (updateUser && updateUser._id) {
                flag = true
                data = { _id: updateUser._id, name: updateUser.name, email: updateUser?.email || "", mobile: updateUser?.mobile || "" }
                message = "Password reset successfully!"
            }
        } else {
            var flag = false
            var message = "Reset token is not valid!"
        }

        return res.status(200).json({
            status: 200,
            flag: flag,
            data: data || null,
            message: message
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            data: null,
            message: e.message
        })
    }
}

exports.changePassword = async function (req, res, next) {
    try {
        var id = req.body?._id || "";
        var password = req.body?.password || "";
        var oldPassword = req.body?.old_password || "";

        var required = false;
        var data = null;
        var flag = false;
        var message = "Invalid old password!";

        if (!id) {
            required = true;
            message = "Id must be present!";
        } else if (!password) {
            required = true;
            message = "Password must be present!";
        } else if (!oldPassword) {
            required = true;
            message = "Old password must be present!";
        }

        if (required) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                message: message
            })
        }

        var user = await CustomerService.checkCustomerPassword(req.body);
        if (user && user._id) {
            req.body.forgot_password = 0;
            var updatedUser = await CustomerService.updateCustomer(req.body);
            updatedUser = await CustomerService.getCustomer(updatedUser._id);

            flag = true;
            data = updatedUser;
            message = "Password changed successfully!";
        } else {
            flag = false;
            message = "Invalid old password!";
        }

        return res.status(200).json({
            status: 200,
            flag: flag,
            data: data || null,
            message: message
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            data: null,
            message: e.message
        })
    }
}

exports.getExistEmail = async function (req, res, next) {
    try {
        var id = req.query?.id || "";
        var email = req.query?.email || "";

        var validation = false;
        var data = null;
        var flag = false;
        var message = "Email available!";

        if (!email) {
            validation = true;
            message = "Email must be present!";
        }

        if (validation) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                message: message
            })
        }

        var query = { email: email };
        if (id) { query['_id'] = { $ne: id } }

        var user = await CustomerService.checkCustomerExist(query);
        if (user && user._id) {
            flag = true;
            message = "Email registered with another account!";
            data = {
                _id: user._id,
                name: user.name,
                email: user?.email || "",
                mobile: user?.mobile || "",
                gender: user?.gender || "",
                dob: user?.dob || ""
            }
        }

        return res.status(200).json({
            status: 200,
            flag: flag,
            data: data || null,
            message: message
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            data: null,
            message: e.message
        })
    }
}

exports.getCheckExistEmail = async function (req, res, next) {
    try {
        var id = req.query?.id || "";
        var email = req.query?.email || "";

        var validation = false;
        var data = null;
        var flag = false;
        var message = "Email available!";

        if (!email) {
            validation = true;
            message = "Email must be present!";
        }

        if (validation) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                message: message
            })
        }

        var query = { email: email };
        if (id) { query['_id'] = { $ne: id } }

        var user = await CustomerService.checkCustomerExist(query);
        if (user && user._id) {
            flag = true;
            message = "Email registered with another account!";
            data = {
                _id: user._id,
                name: getMaskedString(user.name),
                email: user?.email || "",
                mobile: getMaskedString(user?.mobile) || "",
                gender: user?.gender || "",
                dob: user?.dob || ""
            }
        }

        return res.status(200).json({
            status: 200,
            flag: flag,
            data: data || null,
            message: message
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            data: null,
            message: e.message
        })
    }
}

exports.getExistMobile = async function (req, res, next) {
    try {
        var id = req.query?.id || "";
        var mobile = req.query?.mobile || "";

        var validation = false;
        var data = null;
        var flag = false;
        var message = "Mobile number available!";

        if (!mobile) {
            validation = true;
            message = "Mobile number must be present!";
        }

        if (validation) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                message: message
            })
        }

        var query = { mobile: mobile };
        if (id) { query['_id'] = { $ne: id } }

        var user = await CustomerService.checkCustomerExist(query);
        if (user && user._id) {
            flag = true;
            message = "Mobile number registered with another account!";
            data = {
                _id: user._id,
                name: user.name,
                email: user?.email || "",
                mobile: user?.mobile || "",
                gender: user?.gender || "",
                dob: user?.dob || ""
            }
        }

        return res.status(200).json({
            status: 200,
            flag: flag,
            data: data || null,
            message: message
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            data: null,
            message: e.message
        })
    }
}

exports.getCheckExistMobile = async function (req, res, next) {
    try {
        var id = req.query?.id || "";
        var mobile = req.query?.mobile || "";

        var validation = false;
        var data = null;
        var flag = false;
        var message = "Mobile number available!";

        if (!mobile) {
            validation = true;
            message = "Mobile number must be present!";
        }

        if (validation) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                message: message
            })
        }

        var query = { mobile: mobile };
        if (id) { query['_id'] = { $ne: id } }

        var user = await CustomerService.checkCustomerExist(query);
        if (user && user._id) {
            flag = true;
            message = "Mobile number registered with another account!";
            data = {
                _id: user._id,
                name: getMaskedString(user.name),
                email: getMaskedEmail(user?.email || ""),
                mobile: user?.mobile || "",
                gender: user?.gender || "",
                dob: user?.dob || ""
            }
        }

        return res.status(200).json({
            status: 200,
            flag: flag,
            data: data || null,
            message: message
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            data: null,
            message: e.message
        })
    }
}

const createCustomerUserWithPassword = async function (item = null) {
    try {
        var data = null;
        var message = "Something went wrong while creating user!";
        if (item && !isObjEmpty(item)) {
            item.role_id = process.env?.CUSTOMER_ROLE || "";
            item.is_customer = 1;

            var password = item?.password || getRandPswd();
            item.password = password;

            if (item?.company_id && !item?.company_ids) {
                item.company_ids = item.company_id;
            }

            var createdUser = await CustomerService.createCustomer(item) || null;
            if (createdUser && createdUser._id) {
                data = createdUser;
                message = "";

                var html = "";
                var subject = "Welcome to " + item?.company;
                var temFile = "customer_created_info.hjs";

                var toMail = {};
                toMail['site_url'] = process.env?.API_URL || "";
                toMail['link_url'] = process.env?.SITE_URL || "";

                toMail['name'] = createdUser.name;
                toMail['email'] = createdUser.email;
                toMail['mobile'] = createdUser?.mobile || "";
                toMail['password'] = password;
                toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + createdUser._id;

                var sendEmail = await SendEmailSmsService.sendMailAwait(createdUser.email, createdUser.name, subject, temFile, html, toMail, 'transaction');

                var emailData = {
                    company_id: "",
                    location_id: item?.location_id || "",
                    client_id: createdUser._id,
                    subject: subject,
                    name: createdUser.name,
                    type: "single",
                    file_type: "customer_created_info",
                    temp_file: temFile,
                    html: '',
                    data: toMail,
                    date: Date(),
                    to_email: createdUser.email,
                    status: "initial",
                    response: null,
                    response_status: ''
                }

                if (sendEmail && sendEmail?.status) {
                    emailData.response = sendEmail.response;
                    emailData.response_status = sendEmail.status;
                    emailData.status = sendEmail.status;
                }

                var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
                var tillDate = increaseDateDays(new Date, days);
                if (tillDate) { emailData.till_date = tillDate }

                var eLog = EmailLogService.createEmailLog(emailData);
            }
        }

        return { message: message, data: data || null }
    } catch (e) {
        return { message: e.message, data: null }
    }
}

exports.getCreateCustomerToken = async function (req, res, next) {
    try {
        var id = req.body?.id || "";
        var email = req.body?.email || "";
        var mobile = req.body?.mobile || "";
        var companyId = req.body?.company_id || "";
        var locationId = req.body?.location_id || "";

        var validation = false;
        var data = null;
        var token = null;
        var flag = false;
        var message = "";

        if (!email) {
            validation = true;
            message = "Email must be present!";
        } else if (!mobile) {
            validation = true;
            message = "Mobile number must be present!";
        }

        if (validation) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                message: message
            });
        }

        if (locationId) {
            var location = await LocationService.getLocationOne({ _id: locationId });
            if (location?.company_id && location.company_id?._id) {
                companyId = location.company_id._id;
                req.body.company_id = location.company_id._id;
            }
        }

        if (email?.toLowerCase()) { email = email.toLowerCase(); }

        var query = { $or: [{ email: email }, { mobile: mobile }] };
        var user = await CustomerService.checkCustomerExist(query);
        if (user?._id && (!user?.status || user?.is_blocked)) {
            return res.status(200).json({ status: 200, flag: false, data: null, message: "Your account is suspended, To recover your account, please reset password!" });
        }

        if (user && user._id && !id) {
            flag = true;
            message = "User already exist!";

            if (user?.email == "" || user?.mobile == "") {
                if (user?.mobile == "" && mobile && !mobile.includes('*')) {
                    var existQuery = { mobile: mobile };
                    existQuery['_id'] = { $ne: user._id };
                    var mobileExist = await CustomerService.checkCustomerExist(existQuery);
                    if (mobileExist && mobileExist?._id) {
                        return res.status(200).json({ status: 200, flag: false, data: null, message: "Mobile number linked with another account!" })
                    } else {
                        await CustomerService.updateCustomer({
                            _id: user._id,
                            mobile: mobile
                        })
                    }
                }

                if (user?.email == "" && email && !email.includes('*')) {
                    var existQuery = { email: email };
                    existQuery['_id'] = { $ne: user._id };
                    var emailExist = await CustomerService.checkCustomerExist(existQuery);
                    if (emailExist && emailExist?._id) {
                        return res.status(200).json({ status: 200, flag: false, data: null, message: "Email address linked with another account!" })
                    } else {
                        await CustomerService.updateCustomer({
                            _id: user._id,
                            email: email
                        })
                    }
                }
            }

            user = await CustomerService.getCustomer(user._id);
        } else if (id) {
            user = await CustomerService.getCustomer(id);
            if (user?.email == "" || user?.mobile == "") {
                if (user?.mobile == "" && mobile && !mobile.includes('*')) {
                    var existQuery = { mobile: mobile };
                    existQuery['_id'] = { $ne: user._id };
                    var mobileExist = await CustomerService.checkCustomerExist(existQuery);
                    if (mobileExist && mobileExist?._id) {
                        return res.status(200).json({
                            status: 200,
                            flag: false,
                            data: null,
                            message: "Mobile number linked with another account!"
                        })
                    } else {
                        await CustomerService.updateCustomer({
                            _id: user._id,
                            mobile: mobile
                        })
                    }
                }

                if (user?.email == "" && email && !email.includes('*')) {
                    var existQuery = { email: email };
                    existQuery['_id'] = { $ne: user._id };
                    var emailExist = await CustomerService.checkCustomerExist(existQuery);
                    if (emailExist && emailExist?._id) {
                        return res.status(200).json({
                            status: 200,
                            flag: false,
                            data: null,
                            message: "Email address linked with another account!"
                        })
                    } else {
                        await CustomerService.updateCustomer({
                            _id: user._id,
                            email: email
                        })
                    }
                }

                user = await CustomerService.getCustomer(id);
            }

            if (user && user._id) {
                flag = true
                message = "User received successfully!"
            }
        } else {
            if (email.includes('*') || mobile.includes('*')) {
                return res.status(200).json({ status: 200, flag: false, data: null, message: "Please enter valid format inputs!" })
            }

            var createdUser = await createCustomerUserWithPassword({
                company_id: companyId,
                location_id: locationId,
                email: email,
                mobile: mobile,
                name: req.body?.name || "",
                gender: req.body?.gender || ""
            })
            if (createdUser?.data && createdUser?.data?._id) {
                user = createdUser.data;
                user = await CustomerService.getCustomer(createdUser.data._id);
                message = "User created successfully!";
            } else {
                message = createdUser?.message || "";
            }

            flag = true;
        }

        if (user && user._id) {
            id = user._id;
            data = user;
        }

        if (id) {
            var expiresIn = 86400 // expires in 24 hours
            token = jwt.sign({
                id: id,
                customer_id: id,
                role_id: data?.role_id || ""
            }, process.env.SECRET, { expiresIn: expiresIn })
        }

        return res.status(200).json({
            status: 200,
            flag: flag,
            token: token,
            data: data || null,
            message: message
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            token: null,
            data: null,
            message: e.message
        })
    }
}

exports.getCreateMultipleCustomerToken = async function (req, res, next) {
    try {
        var companyId = req.body?.company_id || "";
        var locationId = req.body?.location_id || "";
        var id = req.body?._id || "";
        var email = req.body?.email || "";
        var mobile = req.body?.mobile || "";
        var users = req.body?.users || [];

        var throwError = false;
        var data = null;
        var usersData = [];
        var token = null;
        var flag = false;
        var message = "Something went wrong!";

        if (!email) {
            throwError = true;
            message = "Email must be present!";
        } else if (!mobile) {
            throwError = true;
            message = "Mobile number must be present!";
        }

        if (users?.length && !isArrayContainingObject(users, "email")) {
            throwError = true;
            message = "Users array must be valid format data!";
        }

        if (throwError) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                message: message
            });
        }

        if (locationId) {
            var location = await LocationService.getLocationOne({ _id: locationId });
            if (location?.company_id && location.company_id?._id) {
                companyId = location.company_id._id;
                req.body.company_id = location.company_id._id;
            }
        }

        if (email?.toLowerCase()) { email = email.toLowerCase(); }

        var query = { $or: [{ email: email }, { mobile: mobile }] };
        var user = await CustomerService.checkCustomerExist(query);
        if (user && user._id && !id) {
            flag = true;
            message = "User already exist!";
        } else if (id) {
            user = await CustomerService.getCustomer(id);
            if (user && user._id) {
                flag = true;
                message = "User received successfully!";
            }
        } else {
            var createdUser = await createCustomerUserWithPassword({
                company_id: companyId,
                location_id: locationId,
                email: email,
                mobile: mobile,
                name: req.body?.name || "",
                gender: req.body?.gender || ""
            })
            if (createdUser?.data && createdUser?.data?._id) {
                user = createdUser.data;
                user = await CustomerService.getCustomer(createdUser.data._id);
                message = "User created successfully!";
            } else {
                message = createdUser?.message || "";
            }

            flag = true;
        }

        if (user && user._id) {
            id = user._id;
            data = user;
        }

        if (users && users.length) {
            for (let i = 0; i < users.length; i++) {
                var itemId = users[i]?._id || "";
                var item = users[i];
                var email = item?.email || "";
                var mobile = item?.mobile || "";
                if (email?.toLowerCase()) { email = email.toLowerCase(); }

                if (locationId) {
                    item.location_id = locationId;
                    item.company_id = companyId;
                }

                if (itemId) {
                    var user = await CustomerService.getCustomer(itemId);
                    if (user && user._id) { usersData.push(user) }
                } else {
                    var query = { $or: [{ email: email }, { mobile: mobile }] };
                    var user = await CustomerService.checkCustomerExist(query);
                    if (user && user._id) {
                        usersData.push(user);
                    } else {
                        var createdUser = await createCustomerUserWithPassword(item) || null;
                        if (createdUser?.data && createdUser.data?._id) {
                            var userItem = await CustomerService.getCustomer(createdUser.data._id);
                            usersData.push(userItem);
                        } else {
                            message = createdUser?.message || "";
                        }
                    }
                }
            }
        }

        if (id) {
            var expiresIn = 86400 // expires in 24 hours
            token = jwt.sign({
                id: id,
                customer_id: id,
                role_id: data?.role_id || ""
            }, process.env.SECRET, { expiresIn: expiresIn })
        }

        return res.status(200).json({
            status: 200,
            flag: flag,
            token: token,
            data: data || null,
            usersData: usersData || [],
            message: message
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            token: null,
            data: null,
            message: e.message
        })
    }
}

exports.sendTestEmail = async function (req, res, next) {
    try {
        var to_name = req.query?.name || "Tester";
        var to_email = req.query?.email || "";
        var bcc = ""
        var subject = "Testing email";
        var temFile = "testemail.hjs";
        var html = ""
        var data = { name: to_name, email: to_email };

        var flag = false;
        var message = "Something went wrong!";

        if (to_email) {
            var createdMail = await SendEmailSmsService.sendMail(to_email, to_name, subject, temFile, html, data);

            flag = true;
            message = "Testing email sent successfully!";
            // await HelperService.sendEmail(to_email, to_name, bcc, subject, temFile, data);
        }

        return res.status(200).json({
            status: 200,
            flag: flag,
            message: message
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            message: e.message
        })
    }
}

exports.customerAccountDetail = async function (req, res, next) {
    try {
        var user_id = req.params?.id || "";
        var locationId = req.query?.location_id || "";
        var company_id = req.query?.company_id || "";
        var todayDate = new Date();
        var date = dateFormat(todayDate, "yyyy-mm-dd");
        var prev3MnthDate = getDateAddMonths(null, -3, "YYYY-MM-DD");

        if (!user_id) {
            return res.status(200).json({ status: 200, flag: false, data: null, message: "Customer id must be present!" })
        }

        var query = { customer_id: user_id, status: 1 };
        var custPkgQuery = { customer_id: user_id, status: 1 };
        var discountQuery = { customer_id: user_id, status: 1, show_to_customer: 1 };
        var offerQuery = { customer_arr: user_id, status: 1, show_to_customer: 1 };
        if (locationId) {
            query.location_id = locationId;
            custPkgQuery.location_id = locationId;
            discountQuery.location_id = locationId;
            offerQuery.location_id = locationId;
            if (!company_id) {
                var location = await LocationService.getLocation(locationId);
                company_id = location?.company_id || "";
            }
        }

        query['$or'] = [
            { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
            { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
        ];

        custPkgQuery.start_date = { $lte: date };
        custPkgQuery.end_date = { $gte: prev3MnthDate };

        discountQuery['$or'] = [
            { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
            { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
        ];

        offerQuery['$or'] = [
            { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
            { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
        ];

        var rewards = await CustomerRewardService.getCustomerLastRewardData({ customer_id: user_id, company_id: company_id });
        var reward_points = 0;
        if (rewards && rewards.total_points) {
            reward_points = rewards.total_points;
        }

        var packages = await CustomerPackageService.getCustomerPackageCount(custPkgQuery);
        var loylaty_cards = await CustomerLoyaltyCardService.getCustomerLoyaltyCardCount(query);
        var discounts = await DiscountService.getDiscountsCount(discountQuery);
        var offers = await DiscountService.getDiscountsCount(offerQuery);

        var data = {
            rewards: reward_points,
            packages: packages,
            loylaty_cards: loylaty_cards,
            discounts: discounts,
            offers: offers
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: data,
            message: "Successfully received user account details"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            message: e.message
        })
    }
}

exports.valueStringToArray = async function (req, res, next) {
    try {
        var query = { $or: [{ customer_icons: null }, { customer_icon: "" }] };
        var customer = await CustomerService.getClients(query);
        for (var i = 0; i < customer.length; i++) {

            if (!customer[i].customer_icons || customer[i]?.customer_icons[0].icon == '') {

                var gcQuery = { client_id: { $elemMatch: { $eq: customer[i]._id.toString() } }, booking_status: { $nin: ['cancel', 'no_shows'] } }
                var clientBooking = await AppointmentService.getAppointmentSpecific(gcQuery)

                console.log(clientBooking?.length)

                if (clientBooking?.length == 1) {
                    customer[i].customer_icon = 'rose';
                } else if (clientBooking?.length == 2) {
                    customer[i].customer_icon = 'bouquet';
                }

                if (customer[i].customer_badges) {
                    customer[i].customer_badges = [{
                        company_id: "60ba73c1e0f95f94d2c2e368",
                        badge: customer[i].customer_badge ?? ""
                    }];
                }
                if (customer[i].customer_icon) {
                    console.log(customer[i]._id, customer[i].customer_icon)
                    customer[i].customer_icons = [{
                        company_id: "60ba73c1e0f95f94d2c2e368",
                        icon: customer[i].customer_icon ?? ""
                    }];

                    var updatedUser = await CustomerService.updateCustomer(customer[i]);
                }
            }

        }

        return res.status(200).json({ status: 200, flag: true, data: customer, message: "Successfully Merge Users" });
    } catch (e) {
        console.log('e', e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}