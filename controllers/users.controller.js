var jwt = require('jsonwebtoken')
var dateFormat = require('dateformat')
var ObjectId = require('mongodb').ObjectId

var UserService = require('../services/user.service')
var PermissionService = require('../services/permission.service')
var ServiceService = require('../services/service.service')
var CategoryService = require('../services/category.service')
var CompanyService = require('../services/company.service')
var LocationService = require('../services/location.service')
var EmployeeTimingService = require('../services/employeeTiming.service')
var BuySubscriptionService = require('../services/buySubscription.service')
var AppointmentService = require('../services/appointment.service')
var CustomerPackageService = require('../services/customerpackage.service')
var CustomerUsagePackageService = require('../services/customerUsagePackageService.service')
var CustomerRewardService = require('../services/customerReward.service')
var SendEmailSmsService = require('../services/sendEmailSms.service')

var CustomerLoyaltyCardService = require('../services/customerLoyaltyCard.service')
var CustomerLoyaltyCardLogService = require('../services/customerLoyaltyCardLog.service')
var DiscountService = require('../services/discount.service')
var ConsultantFormService = require('../services/consultantForm.service')
var ConsultantServiceTypeQuestionService = require('../services/consultantServiceTypeQuestion.service')

var EmployeeNumberLog = require('../services/employeeNumberLog.service')
var EmployeeFilterLog = require('../services/employeeFilterLog.service')
var AppliedDiscountService = require('../services/appliedDiscount.service')
var EmailLogService = require('../services/emailLog.service')
var UserDeviceTokenService = require('../services/userDeviceToken.service');

const {
    isObjEmpty,
    isValidJson,
    getRandPswd,
    get4DigitCode,
    generateUniqueId,
    increaseDateDays,
    isArrayContainingObject
} = require('../helper')

const { getTodayTiming, getAvailableEmployee, checkAppListRefData, setAppListTableData, updateAppListTableData, generateTableTimeSlotNew, setAppointmentsListRefData } = require('../common')

// Saving the context of this module inside the _the variable
_this = this

var systemType = process.env?.SYSTEM_TYPE || ""
var superAdminRole = process.env?.SUPER_ADMIN_ROLE || "607d8aeb841e37283cdbec4b"
var orgAdminRole = process.env?.ORG_ADMIN_ROLE || "6088fe1f7dd5d402081167ee"
var branchAdminRole = process.env?.BRANCH_ADMIN_ROLE || "608185683cf3b528a090b5ad"
var employeeRole = process.env?.EMPLOYEE_ROLE || "608d1cd0558f442514a5a8ad"
var customerRole = process.env?.CUSTOMER_ROLE || "607d8af0841e37283cdbec4c"

//process.env.SECRET = 'supersecret'

exports.connectDB = async function (req, res, next) {
    try {
        return res.status(200).json({ status: 200, flag: true, data: {}, message: "Successfully connect to Database" });
    } catch (e) {
        console.log('e', e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.userLocationStringToArray = async function (req, res, next) {
    try {

        var query = { is_customer: 1 };
        var users = await UserService.getClients(query);
        for (var i = 0; i < users.length; i++) {
            if (users[i].location_id) {
                //users[i].locations = [users[i].location_id];

                //console.log('users[i].locations',users[i].locations)

                //var updatedUser = await UserService.updateUser(users[i]);

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
        var users = await UserService.getTestRedundantUsers();
        var emails = users.map(s => s.email);
        emails = emails.filter(n => n)
        var dupliUsers = await UserService.getUserAllData({ email: { $in: emails } });
        var mobile_users = await UserService.getTestRedundantUsersMobile();

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

                var dup_users = await UserService.getUserSpecific(query2);

                var existingUser = { is_customer: 1, _id: ObjectId(del_users[i].replace_id) };

                var existing_users = await UserService.getUserSpecific(existingUser);

                if (dup_users && dup_users.length > 0) {

                    var locs = dup_users.map(s => s.locations)

                    if (existing_users && existing_users.length > 0) {
                        locs.push(existing_users[0].locations)
                    }
                    var locArr = Array.prototype.concat(...locs);
                    locArr = locArr.filter((item, pos) => locArr.indexOf(item) === pos)
                    console.log('locArr', locArr)

                    var data = {
                        _id: del_users[i].replace_id,
                        status: 1,
                        is_customer: 1,
                        location_update: 1,
                        locations: locArr
                    };
                    var updatedUser = await UserService.updateUser(data);
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
            var deleted = await UserService.deleteMultiple(query3);

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
        //var users = await UserService.getUserAllData(query);
        var dupliUsers = await UserService.getTestRedundantUsers(); //get duplicate email

        var emails = dupliUsers.map(s => s.email);
        emails = emails.filter(n => n)
        var users = await UserService.getUserAllData({ is_customer: 1, email: { $in: emails } });
        for (var i = 0; i < users.length; i++) {
            var query2 = { is_customer: 1, email: users[i].email, _id: { $ne: ObjectId(users[i]._id) } };

            var dup_user = await UserService.getUserAllData(query2);
            if (dup_user.length > 0) {
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
                    location_id: dup_user[0].locations[0]
                };

                var updatedUser = await UserService.updateUser(data);
                if (updatedUser) {
                    var d_user = dup_user.map(s => s._id);
                    if (d_user.length > 0) {
                        var obj = { replace_id: users[i]._id, deleted_users: d_user };
                        email_del_users.push(obj);
                    }
                    //console.log('query2',query2)
                    //console.log('email users[i]',users[i])

                    //console.log('updatedUser',updatedUser)
                    var updateDupli = await UserService.updateManyStatus(query2);
                    var query3 = { is_customer: 1, email: users[i].email, _id: { $ne: ObjectId(users[i]._id) }, status: 0 };
                    //console.log('email deleted query3',query3)
                    var deleted = await UserService.deleteMultiple(query3);
                    //console.log('deleted',deleted)
                }
            }
        }

        var query = { is_customer: 1, mobile: { $ne: '' } };
        var users = await UserService.getUserAllData(query);

        var dupliUsers = await UserService.getTestRedundantUsersMobile(); //get duplicate mobile
        var mobile = dupliUsers.map(s => s.mobile);
        mobile = mobile.filter(n => n)
        var users = await UserService.getUserAllData({ is_customer: 1, mobile: { $in: mobile } });
        for (var i = 0; i < users.length; i++) {
            var query2 = { is_customer: 1, mobile: users[i].mobile, _id: { $ne: ObjectId(users[i]._id) } };

            var dup_user = await UserService.getUserAllData(query2);
            if (dup_user && dup_user.length > 0) {
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
                var updatedUser = await UserService.updateUser(data);
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
                    var updateDupli = await UserService.updateManyStatus(query2);
                    var query3 = { is_customer: 1, mobile: users[i].mobile, _id: { $ne: ObjectId(users[i]._id) }, status: 0 };
                    //console.log('mobile deleted query3',query3)
                    var deleted = await UserService.deleteMultiple(query3);
                    //console.log('mobile deleted',deleted)
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: users.length, email_del_users: email_del_users, mobile_del_users: mobile_del_users, message: "Users merge successfully!" });
    } catch (e) {
        console.log('e', e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.userMergeByEmailMobileBK = async function (req, res, next) {
    try {
        var email_del_users = [];
        var mobile_del_users = [];

        var query = { is_customer: 1, email: { $ne: '' } };
        var users = await UserService.getUserAllData(query);
        for (var i = 0; i < users.length; i++) {
            var query2 = { is_customer: 1, email: users[i].email, _id: { $ne: ObjectId(users[i]._id) } };

            var dup_user = await UserService.getUserAllData(query2);
            if (dup_user && dup_user.length > 0) {
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
                    location_id: dup_user[0].locations[0]
                };

                var updatedUser = await UserService.updateUser(data);
                if (updatedUser) {
                    var d_user = dup_user.map(s => s._id);
                    if (d_user.length > 0) {
                        var obj = { replace_id: users[i]._id, deleted_users: d_user };
                        email_del_users.push(obj);
                    }
                    //console.log('query2',query2)
                    //console.log('email users[i]',users[i])

                    //console.log('updatedUser',updatedUser)
                    var updateDupli = await UserService.updateManyStatus(query2);
                    var query3 = { is_customer: 1, email: users[i].email, _id: { $ne: ObjectId(users[i]._id) }, status: 0 };
                    //console.log('email deleted query3',query3)
                    var deleted = await UserService.deleteMultiple(query3);
                    //console.log('deleted',deleted)
                }
            }
        }

        var query = { is_customer: 1, mobile: { $ne: '' } };
        var users = await UserService.getUserAllData(query);
        for (var i = 0; i < users.length; i++) {
            var query2 = { is_customer: 1, mobile: users[i].mobile, _id: { $ne: ObjectId(users[i]._id) } };

            var dup_user = await UserService.getUserAllData(query2);
            if (dup_user && dup_user.length > 0) {
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
                var updatedUser = await UserService.updateUser(data);
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
                    var updateDupli = await UserService.updateManyStatus(query2);
                    var query3 = { is_customer: 1, mobile: users[i].mobile, _id: { $ne: ObjectId(users[i]._id) }, status: 0 };
                    //console.log('mobile deleted query3',query3)
                    var deleted = await UserService.deleteMultiple(query3);
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

        var locations = await LocationService.getActiveLocations({ status: 1 })
        for (var l = 0; l < locations.length; l++) {
            var query = { location_id: locations[l]._id, is_customer: 1, email: { $ne: '' } };
            var users = await UserService.getClients(query);
            for (var i = 0; i < users.length; i++) {
                var query2 = { location_id: locations[l]._id, is_customer: 1, email: users[i].email, _id: { $ne: ObjectId(users[i]._id) } };

                var dup_user = await UserService.getClients(query2);
                if (dup_user && dup_user.length > 0) {
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
                    var updatedUser = await UserService.updateUser(data);
                    if (updatedUser) {
                        var d_user = dup_user.map(s => s._id);
                        if (d_user.length > 0) {
                            var obj = { replace_id: users[i]._id, deleted_users: d_user, location_id: locations[l]._id };
                            email_del_users.push(obj);
                            //await replceBookingUser(obj,locations[l]._id)
                        }
                        //console.log('query2',query2)
                        //console.log('email users[i]',users[i])
                        //console.log('email dup_user',dup_user)

                        //console.log('updatedUser',updatedUser)
                        var updateDupli = await UserService.updateManyStatus(query2);
                        var query3 = { location_id: locations[l]._id, is_customer: 1, email: users[i].email, _id: { $ne: ObjectId(users[i]._id) }, status: 0 };
                        //console.log('email deleted query3',query3)
                        //var deleted = await UserService.deleteMultiple(query3);
                        //console.log('deleted',deleted)
                    }
                }
            }

            var query = { location_id: locations[l]._id, is_customer: 1, mobile: { $ne: '' } };
            var users = await UserService.getClients(query);
            for (var i = 0; i < users.length; i++) {
                var query2 = { location_id: locations[l]._id, is_customer: 1, mobile: users[i].mobile, _id: { $ne: ObjectId(users[i]._id) } };

                var dup_user = await UserService.getClients(query2);
                if (dup_user && dup_user.length > 0) {
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
                    var updatedUser = await UserService.updateUser(data);
                    if (updatedUser) {
                        var d_user = dup_user.map(s => s._id);
                        if (d_user.length > 0) {
                            var obj = { replace_id: users[i]._id, deleted_users: d_user, location_id: locations[l]._id };
                            email_del_users.push(obj);
                            //await replceBookingUser(obj,locations[l]._id);
                        }
                        //console.log('mobile query2',query2)
                        //console.log('mobile users[i]',users[i])
                        //console.log('mobile dup_user',dup_user)

                        //console.log('mobile updatedUser',updatedUser)
                        //console.log('deleted query2',query2)
                        var updateDupli = await UserService.updateManyStatus(query2);
                        var query3 = { location_id: locations[l]._id, is_customer: 1, mobile: users[i].mobile, _id: { $ne: ObjectId(users[i]._id) }, status: 0 };
                        //console.log('mobile deleted query3',query3)
                        //var deleted = await UserService.deleteMultiple(query3);
                        //console.log('mobile deleted',deleted)
                    }
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, locations: locations, data: users, email_del_users: email_del_users, mobile_del_users: mobile_del_users, message: "Successfully Merge Users" });
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
        if (req.body.location_id && req.body.location_id != 'undefined') {
            //query['location_id'] = req.body.location_id;
            query['locations'] = { $elemMatch: { $eq: req.body.location_id } };
            app_query['location_id'] = req.body.location_id;
        }

        if (req.body.is_customer) {
            query['is_customer'] = 1;
        }

        if (req.body.customer_icon) {
            query['customer_icon'] = req.body.customer_icon;
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

        //console.log('getClients query',query)
        var Users = await UserService.getClients(query)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Users, appointments: appointments, message: "Successfully Users Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getFakeUserToken = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    //console.log('getFakeUserToken')
    try {
        token1 = jwt.sign({
            id: '6083ece98e9b6f15ccbf836c'
        }, process.env.SECRET, {
            expiresIn: 604800 // expires in 24 hours
        });

        return res.status(200).json({ status: 200, flag: true, token: token1, data: {}, message: "Successfully User Token Recieved" });
    } catch (e) {
        console.log('e', e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// Async Controller function to get the To do List
exports.getUsers = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.query.page ? req.query.page : 0; //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000;
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
        var order = req.query.order ? req.query.order : '-1';
        var searchText = req.query.searchText ? req.query.searchText : '';
        var userId = req?.userId || "";
        var roleId = req?.roleId || "";

        var query = { status: 1 };
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id;
        }

        if (req.query.location_id && req.query.location_id != 'undefined' && !searchText) {
            //query['location_id'] = req.query.location_id;
            query['$or'] = [
                { location_id: req.query.location_id },
                { locations: { $elemMatch: { $eq: req.query.location_id } } }
            ];
        }

        if (searchText) {
            if (req.query.location_id && req.query.location_id != 'undefined') {
                query['$and'] = [{
                    $or: [
                        { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                        { email: { $regex: '.*' + searchText + '.*', $options: 'i' } }
                    ]
                }, {
                    $or: [
                        { location_id: req.query.location_id },
                        { locations: { $elemMatch: { $eq: req.query.location_id } } }
                    ]
                }];
            } else {
                query['$or'] = [
                    { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                    { email: { $regex: '.*' + searchText + '.*', $options: 'i' } }
                ];
            }
        }

        if (req.query.is_customer == 1) {
            query['is_customer'] = 1;
        } else {
            query['is_customer'] = { $ne: 1 };
        }

        //if (systemType == "general") {
        if (roleId == superAdminRole) {
            query['role_id'] = { $nin: [superAdminRole, employeeRole, customerRole] };
        } else if (roleId == orgAdminRole) {
            query['role_id'] = { $nin: [superAdminRole, orgAdminRole, employeeRole, customerRole] };
        } else if (roleId == branchAdminRole) {
            query['role_id'] = { $nin: [superAdminRole, orgAdminRole, branchAdminRole, employeeRole, customerRole] };
        } else if ((roleId && (roleId != superAdminRole)) || !roleId) {
            query['role_id'] = { $nin: [superAdminRole, orgAdminRole, branchAdminRole, employeeRole, customerRole] };
        }

        // }

        if (userId) { query['_id'] = { $ne: ObjectId(userId) }; }

        // console.log('query', query)
        var Users = await UserService.getAllUsers(query, parseInt(page), parseInt(limit), order_name, Number(order))
        if (Users[0]?.data && Users[0].data?.length > 0) {
            for (var i = 0; i < Users[0].data.length; i++) {
                var loc = Users[0].data[i].locations ? Users[0].data[i].locations : []
                if (loc && loc.length > 0) {
                    var q = { status: 1, _id: { $in: loc } }
                    var Locations = await LocationService.getLocationSpecific(q)
                    Users[0].data[i].locations = Locations
                }
            }
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Users, message: "Users recieved successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
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

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['locations'] = { $elemMatch: { $eq: req.query.location_id } };
        }
        if (req.query.is_user) {
            query['is_customer'] = 1;
        }

        if (req.query.searchText) {
            query['$or'] = [{ name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { email: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { mobile: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }];
        }

        var Users = await UserService.getClients(query, page, limit)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Users, message: "Users recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getEmployees = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var query = { status: 1 };
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id;
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            //query['location_id'] = req.query.location_id;
            query['$or'] = [
                { location_id: req.query.location_id },
                { locations: { $elemMatch: { $eq: req.query.location_id } } }
            ];
        }

        if (req.query.is_user) {
            query['is_customer'] = 1;
        }

        if (req.query.employee_id) {
            query['_id'] = ObjectId(req.query.employee_id);
        }

        if (req.query.is_employee) {
            query['is_employee'] = 1;
        }

        // console.log('getEmployees query',query)
        var users = await UserService.getEmployees(query)
        // console.log('getEmployees',users.length)
        for (var i = 0; i < users.length; i++) {
            var services = users[i].services;
            // console.log('services',services)
            var q = { _id: { $in: services } };
            if (req.query.status) {
                q['status'] = 1;
            }
            if (req.query.online_status) {
                q['online_status'] = 1;
            }
            if (req.query.gender) {
                //q['gender'] = req.query.gender;
                q['$or'] = [{ gender: { $eq: req.query.gender } }, { gender: { $eq: 'unisex' } }];
            }
            // console.log('getEmployees q',q)

            var service = await CategoryService.getCategoriesSpecific(q); // for replace service name
            users[i].services = service; //replace service name
            // console.log('res Service',service)
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: users, message: "Users recieved successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getEmployeesListing = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        // console.log("getEmployeesListing ",req.query)
        var page = req.query.page ? req.query.page : 0; //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000;
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
        var order = req.query.order ? req.query.order : '-1';
        var searchText = req.query.searchText ? req.query.searchText : '';
        var userId = req?.userId || "";

        var query = { status: 1 };
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id;
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id;
        }

        if (userId) {
            query['_id'] = { $ne: ObjectId(userId) };
        }

        if (req.query.employee_id) {
            query['_id'] = ObjectId(req.query.employee_id);
        }

        if (req.query.is_employee) {
            query['is_employee'] = 1;
        }

        if (searchText) {
            query['$or'] = [
                { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { gender: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { email: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { mobile: { $regex: '.*' + searchText + '.*', $options: 'i' } }
            ];
        }

        // console.log('getEmployeesListing query',query)
        var users = await UserService.getEmployeesListing(query, parseInt(page), parseInt(limit), order_name, Number(order))
        //console.log('getEmployees',users[0].data[0])
        var user = users[0].data;
        var pagination = users[0].pagination;
        for (var i = 0; i < user.length; i++) {
            var services = user[i].services;
            // console.log('services',services)
            var q = { _id: { $in: services } };
            //q['status']= 1;
            //q['online_status']=1;
            if (req.query.gender) {
                //q['$or'] = [ { gender: { $eq: req.query.gender } }, { gender: { $eq: 'unisex' } } ];
            }
            // console.log('getEmployees q',q)

            var service = await CategoryService.getCategoriesSpecific(q); // for replace service name
            user[i].services = service; //replace service name
            // console.log('res Service',service)
        }

        users[0].data = user;
        users[0].pagination = pagination;
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: users, message: "Users recieved successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getAvailableEmployees = async function (req, res, next) {
    try {
        var query = { status: 1 }
        var allEmpQuery = { status: 1 }

        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_id'] = req.body.location_id
            allEmpQuery['location_id'] = req.body.location_id
        }

        if (req.body.employees && req.body.employees.length > 0) {
            query['_id'] = { $nin: req.body.employees }
            allEmpQuery['_id'] = { $nin: req.body.employees }
        }

        if (req.body.is_employee == 1) {
            query['is_employee'] = 1
            allEmpQuery['is_employee'] = 1
        }

        if (req.body.is_available == 1) {
            query['status'] = 1
            allEmpQuery['status'] = 1
        }

        if (req.body.employee_id && req.body.employee_id != 'undefined') {
            query['_id'] = req.body.employee_id.toString()
        }

        var filter_employees = req.body.filter_employees ? req.body.filter_employees : []

        date = req.body.date
        var dateObj = new Date(date)
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }) // get day name
        weekday = weekday?.toLowerCase() || ""
        var close_day = false
        var close_day_name = ''

        var location = await LocationService.getLocation(req.body.location_id)
        if (location?.group_close_days && location?.group_close_days.length > 0) {
            var ind = location?.group_close_days.findIndex(x => date >= dateFormat(x.close_day_start_date, "yyyy-mm-dd") && date <= dateFormat(x.close_day_end_date, "yyyy-mm-dd"))
            if (ind != -1) {
                close_day = true
                close_day_name = location?.group_close_days[ind].close_day_name
            }
        }

        var fquery = { location_id: req.body.location_id, date: req.body.date }
        var getFilterData = await EmployeeFilterLog.getEmployeeFilterLogsSpecific(fquery)
        if (getFilterData.length > 0) {
            var eQuery = { _id: { $in: getFilterData[0].employee_ids } }
            var emp = await UserService.getAvilEmployees(eQuery)
            filter_employees = getFilterData[0].employee_ids
            getFilterData[0].employee_ids = emp // with name
            req.body.order_by = "user_order"
        }

        var on_leave_emp = [];
        if (req.body.is_available == 1 && !close_day) {
            var off_day_emp = await EmployeeTimingService.getEmployeeAllTimings({
                location_id: req.body.location_id,
                day: weekday,
                //days_off:{$eq:1},
                $or: [
                    { $and: [{ repeat: { $eq: 'weekly' } }, { end_repeat: { $eq: 'ongoing' } }, { date: { $lte: date } }] },
                    { $and: [{ repeat: { $eq: '' } }, { date: { $eq: date } }] },
                    { $and: [{ end_repeat: { $eq: 'date' } }, { date: { $lte: date } }, { repeat_specific_date: { $gte: date } }] }
                ]
            })

            var result_emp = []
            var off_day_emp_arr = []
            var off_day_emp_filter = []

            var result_emp = off_day_emp.reduce((unique, o) => {
                if (!unique.some(obj => obj.employee_id === o.employee_id)) {
                    unique.push(o)
                }

                return unique
            }, [])

            off_day_emp = result_emp

            if (off_day_emp.length > 0) {
                off_day_emp_arr = off_day_emp.map(s => s.employee_id)
            }

            for (var oemp = 0; oemp < off_day_emp_arr.length; oemp++) {
                var em_id = off_day_emp[oemp].employee_id;
                var pri_ind = off_day_emp.findIndex(x => x.employee_id == em_id)
                if (pri_ind > -1) {
                    if (off_day_emp[pri_ind].days_off == 1) {
                        off_day_emp_filter.push(off_day_emp[pri_ind])
                    }
                }
            }

            if (off_day_emp_filter.length > 0) {
                on_leave_emp = off_day_emp_filter.map(s => s.employee_id)
            }

            if (on_leave_emp.length > 0) {
                if (req.body.employees && req.body.employees.length > 0) {
                    on_leave_emp = on_leave_emp.concat(req.body.employees)
                }

                allEmpQuery['_id'] = { $nin: on_leave_emp }
                if (filter_employees && filter_employees.length > 0) {
                    query['$and'] = [{ _id: { $in: filter_employees } }, { _id: { $nin: on_leave_emp } }]
                } else {
                    query['_id'] = { $nin: on_leave_emp }
                }
            } else {
                if (filter_employees && filter_employees.length > 0) {
                    query['_id'] = { $in: filter_employees }
                }
            }
        }

        var users = []
        var allEmp = []
        var order_by = req.body?.order_by ? req.body.order_by : ''
        if (!close_day) {
            allEmp = await UserService.getAvilEmployees(allEmpQuery)
            users = await UserService.getAvilEmployees(query, order_by)
            for (var i = 0; i < users.length; i++) {
                var query = { location_id: req.body.location_id, employee_id: users[i]._id.toString(), date: req.body.date }
                var getData = await EmployeeNumberLog.getEmployeeNumberLogsSpecific(query)
                let e_ind = result_emp.findIndex(x => x.employee_id == users[i]._id)
                if (e_ind != -1 && result_emp[e_ind].shift_end_time != "00:00") {
                    users[i].shift_start_time = result_emp[e_ind].shift_start_time
                    users[i].shift_end_time = result_emp[e_ind].shift_end_time
                    users[i].sec_shift_start_time = result_emp[e_ind].sec_shift_start_time
                    users[i].sec_shift_end_time = result_emp[e_ind].sec_shift_end_time
                }

                if (getData.length > 0) {
                    users[i].user_order = getData[0].user_order
                } else {
                    users[i].user_order = 0
                }
            }

            users.sort((a, b) => parseInt(a.user_order) - parseInt(b.user_order))
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, off_day_emp: off_day_emp, data: users, all_emp: allEmp, close_day: close_day, filter_data: getFilterData, result_emp: result_emp, close_day_name: close_day_name, message: "Users recieved successfully!" });
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.checkIsEmailUnique = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var email = req.body.email;
        var location_id = req.body.location_id;
        // console.log('email',email)
        var query = { email: email };
        if (location_id && location_id != undefined) {
            query['$or'] = [
                { location_id: location_id },
                { locations: { $elemMatch: { $eq: location_id } } }
            ];
        }
        // if (req.body.is_customer == 1) {
        //     query['is_customer'] = 1;
        // } else {
        //     query['is_customer'] = { $ne: 1 };
        // }
        if (req.body.user_id) {
            query['_id'] = { $ne: ObjectId(req.body.user_id) };
        }
        var User = await UserService.getUserbyLocation(query);

        if (User && (!User.status || User.is_blocked)) {
            return res.status(200).json({ status: 200, is_suspended: 1, flag: false, data: null, user_id: User._id, message: "This account is suspended" })
        }

        if (User && User._id) {
            flag = false;
            message = 'Email already exists';
        } else {
            flag = true;
            message = 'Email does not exists';
        }
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: flag, data: User, message: message });
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
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

        if (req.query.is_customer == 1) {
            eQuery['is_customer'] = 1;
            mQuery['is_customer'] = 1;
        } else {
            eQuery['is_customer'] = { $ne: 1 };
            mQuery['is_customer'] = { $ne: 1 };
        }

        // console.log('eQuery', eQuery)
        // console.log('mQuery', mQuery)
        var emailUser = await UserService.getUserbyLocation(eQuery);
        var mobileUser = await UserService.getUserbyLocation(mQuery);
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
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.checkIsMobileUnique = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var mobile = req.query.mobile;
        var location_id = req.query.location_id;
        // console.log('mobile',mobile)
        var query = { mobile: mobile };
        if (location_id && location_id != undefined) {
            query['$or'] = [
                { location_id: location_id },
                { locations: { $elemMatch: { $eq: location_id } } }
            ];
        }
        if (req.query.is_customer == 1) {
            query['is_customer'] = 1;
        } else {
            query['is_customer'] = { $ne: 1 };
        }
        //console.log('query',query)
        var User = await UserService.getUserbyLocation(query);

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
        return res.status(200).json({ status: 200, flag: flag, data: User, message: message });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.checkCustomerByEmailMobile = async function (req, res, next) {
    try {
        var email = req.query.email;
        var location_id = req.query.location_id;
        if (!email && !req.query.mobile) {
            return res.status(200).json({ status: 200, flag: false, message: "Email or Mobile must be present!" })
        }

        // var is_email_exist = 0;
        // var is_mobile_exist = 0;
        // var e_msg = '';
        // var m_msg = '';
        // if(email){
        //     var email_query = {is_customer:{$ne:1},status:1,email:email};
        //     var email_user = await UserService.getUserbyLocation(email_query);
        //     if(email_user){
        //         is_email_exist = 1;
        //         e_msg = "Email already exists";
        //     }
        // }
        // if(req.query.mobile){
        //     var mobile_query = {is_customer:{$ne:1},status:1,mobile:req.query.mobile};

        //     var mobile_user = await UserService.getUserbyLocation(mobile_query);
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
            var query = { email: email, is_customer: 1 };
            // if(location_id){
            //     query['locations'] = {$elemMatch: {$eq:location_id}};
            // }
            // console.log('email query ', query)
            user = await UserService.getCustomerbyEmail(query);
        }

        //console.log("User ",user)
        if (user.length == 0 && req.query.mobile) {
            var query2 = { mobile: req.query.mobile, is_customer: 1 };
            // if(location_id){
            //     query2['locations'] = {$elemMatch: {$eq:location_id}};
            // }
            // console.log('mobile query ', query2)
            user = await UserService.getCustomerbyEmail(query2);
        }
        //console.log("User2 ",user)

        //console.log("\n User\n\n",User);
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: user, message: "User recieved successfully!" });
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
        var query = { email: email, is_customer: 1, is_super_admin: { $ne: 1 } }
        var query2 = { mobile: req.body.mobile, is_customer: 1, is_super_admin: { $ne: 1 } }

        var user = await UserService.getCustomerbyEmail(query)
        if (user?.length == 0 && req.body?.mobile) {
            var user = await UserService.getCustomerbyEmail(query2)
        }

        if (user?.length == 0) {
            var query = { location_id: req.body.location_id, name: req.body.name, email: email, mobile: req.body.mobile, gender: req.body.gender, status: 1, is_blocked: 0, is_customer: 1, email_notification: 1, sms_notification: 1, session_email_notification: 1, session_sms_notification: 1, customer_icon: 'rose' }
            var user = await UserService.createUser(query)
        } else {
            var query = { _id: user[0]._id, location_id: req.body.location_id, name: req.body.name, email: email, mobile: req.body.mobile, gender: req.body.gender, status: 1, is_blocked: 0, is_customer: 1, email_notification: user[0].email_notification, sms_notification: user[0].sms_notification, session_email_notification: 1, session_sms_notification: 1 }

            var user = await UserService.updateUser(query)
        }

        token1 = jwt.sign({
            id: user._id,
            company_id: user?.company_id || "",
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

exports.getEmployeeSpecific = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.query.page ? req.query.page : 1
        var limit = req.query.limit ? req.query.limit : 1000;
        var query = { status: 1 };
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id;
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id;
        }

        if (req.query.is_employee) {
            query['is_employee'] = 1;
        }

        if (req.query.employee_id) {
            query['_id'] = req.query.employee_id.toString();
        }
        // console.log('getEmployees query',query)
        var users = await UserService.getEmployeeSpecific(query, page, limit)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: users, message: "Users recieved successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
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
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id;
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            //query['location_id'] = req.query.location_id;
            query['locations'] = { $elemMatch: { $eq: req.query.location_id } };
        }

        if (req.query.is_customer) {
            query['is_customer'] = 1;
        }

        if (req.query.customer_icon) {
            query['customer_icon'] = req.query.customer_icon;
        }

        if (req.query.searchText && req.query.searchText != 'undefined') {
            query['$or'] = [
                { name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
                { gender: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
                { email: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
                { mobile: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }
            ];
        }

        var users = await UserService.getCustomers(query, parseInt(page), parseInt(limit), order_name, Number(order), serachText);
        var users_data = users[0].data;
        for (var i = 0; i < users_data.length; i++) {
            if (users_data[i].updated_by) {
                var user = await UserService.getUser(users_data[i].updated_by)
                users_data[i].updated_by = user.name;
            }
        }

        users[0].data = users_data;
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: users, message: "Users recieved successfully!" });
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getActiveCustomers = async function (req, res, next) {
    try {
        // console.log('getActiveCustomers',req.query)
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var query = { status: 1 };
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id;
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            //query['location_id'] = req.query.location_id;
            query['locations'] = { $elemMatch: { $eq: req.query.location_id } };
        }

        if (req.query.is_customer) {
            // query = {role_id: process.env?.CUSTOMER_ROLE || "",status: 1}; //user role id
            query['is_customer'] = 1
        }

        // console.log('getActiveCustomers query',query)
        var users = await UserService.getActiveCustomers(query)
        for (var i = 0; i < users.length; i++) {
            users[i].name = users[i].name + " - " + users[i].mobile
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: users, message: "Users recieved successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomerDataForExport = async function (req, res, next) {
    try {
        var query = { status: 1 };
        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['locations'] = { $elemMatch: { $eq: req.query.location_id } };
        }
        if (req.query.is_customer) {
            query['is_customer'] = 1;
        }
        query['email_notification'] = 1;
        query['sms_notification'] = 1;
        query['session_sms_notification'] = 1;
        query['session_email_notification'] = 1;
        var users = await UserService.getCustomerDataForExport(query);
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: users, message: "Users recieved successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
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
            //query['location_id'] = req.query.location_id;
            query['locations'] = { $elemMatch: { $eq: req.query.location_id } };
        }
        if (req.query.is_customer) {
            // query = {role_id: process.env?.CUSTOMER_ROLE || "", status: 1}; //user role id
            query['is_customer'] = 1
        }
        // console.log('getActiveCustomers query',query)
        var users = await UserService.getActiveCustomers(query, page, limit)
        for (var i = 0; i < users.length; i++) {
            users[i].name = users[i].name + " - " + users[i].email + " - " + users[i].mobile;
        }
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: users, message: "Users recieved successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getActiveEmployees = async function (req, res, next) {
    try {
        // console.log('getActiveEmployees',req.query)
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.query.page ? req.query.page : 1
        var limit = req.query.limit ? req.query.limit : 1000;
        var query = { status: 1 };
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id;
        }
        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id;
        }
        if (req.query.is_employee) {
            query['is_employee'] = 1;
        }
        if (req.body.is_employee == 1) {
            query['status'] = 1;
        }
        // console.log('getActiveEmployees query',query)
        var Users = await UserService.getActiveEmployees(query)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Users, message: "Users received successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getUserbyId = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var user = await UserService.getUser(id)
        // Return the User list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: user, message: "User recieved succesfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getUserNotification = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var user = await UserService.getUserNotification({ _id: id })
        // Return the User list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: user, message: "User recieved succesfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getUser = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id
        var User = await UserService.getUser(id)

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: User, message: "User recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createMultipleEmployee = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        var employees = req.body.employees;
        if (employees && employees.length > 0) {

            var categories = await CategoryService.getActiveCategories({ location_id: req.body.location_id });
            var catArr = categories.map(c => c._id.toString())

            for (var i = 0; i < employees.length; i++) {
                var query = { email: employees[i].email, is_super_admin: { $ne: 1 } }
                var user = await UserService.checkUserExist(query);

                if (!user) {
                    employees[i].is_employee = 1;
                    employees[i].role_id = employeeRole;
                    employees[i].company_id = req.body.company_id;
                    employees[i].location_id = req.body.location_id;
                    employees[i].online_status = 0;
                    employees[i].status = 0;
                    employees[i].services = catArr;
                    var createdUser = await UserService.createUser(employees[i]);
                }
            }

            if (req.body.location_id) {
                var date = dateFormat(new Date(), "yyyy-mm-dd")
                var params = { location_id: req.body.location_id, start_date: date, type: 'emp_timing' };
                var refData = setAppointmentsListRefData(params);
            }

            var location = await LocationService.getLocation(req.body.location_id);

            if (location.setup_steps < 5) {
                var updatedLocation = await LocationService.updateLocationfields({ _id: req.body.location_id }, { setup_steps: 5 })
            }

        }
        return res.status(200).json({
            flag: true,
            new_user: true,
            data: null,
            message: "User created successfully!"
        })
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createUser = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        var email = req.body.email
        var mobile = req.body.mobile;
        var type = req.body?.type || "";
        var is_employee = req.body.is_employee
        var is_customer = req.body.is_customer

        if ((!email && (!is_employee)) && !is_customer) {
            return res.status(200).json({ status: 200, flag: false, message: "Email must be present" })
        }

        var query = { email: email, is_super_admin: { $ne: 1 } }
        if (!is_customer) {
            var User = await UserService.checkUserExist(query)
        } else {
            var query2 = { is_customer: 1, is_super_admin: { $ne: 1 } }
            if (email && mobile) {
                query2['$or'] = [{ email: email }, { mobile: mobile }]
            } else if (email && !mobile) {
                query2['email'] = email
            } else if (!email && mobile) {
                query2['mobile'] = mobile
            }

            var User = await UserService.checkUserExist(query2)
        }

        if (User && User._id) {
            if ((!User.status || User.is_blocked) && type == "customer") {
                return res.status(200).json({ status: 200, flag: false, data: null, message: "Your account is suspended, To recover your account, please reset password" })
            }

            req.body._id = User._id
            if (is_customer == 1) {
                // Update User
                req.body.status = 1;
                req.body.is_blocked = 0;
                var updatedUser = await UserService.updateUser(req.body)

                var expiresIn = 8640000 // expires in 100 days
                token1 = jwt.sign({
                    id: User._id,
                    company_id: User?.company_id || "",
                    role_id: User?.role_id || ""
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
                return res.status(200).json({
                    status: 200,
                    flag: false,
                    data: User,
                    message: "Email already exists!"
                })
            }
        } else {
            if (req.body._id == "607d8aeb841e37283cdbec4b") { //super admin
                req.body.company_id = ''
                req.body.location_id = ''
            }

            if (req.body?.location_id && req.body.role_id == orgAdminRole) {
                var location = await LocationService.getLocation(req.body.location_id)
                if (location && location?.company_id) {
                    req.body.company_id = location.company_id;
                    req.body.location_id = '';
                }
            }

            if (!req.body.company_id && req.body?.location_id || (req.body.role_id == branchAdminRole)) {
                var location = await LocationService.getLocation(req.body.location_id)
                req.body.company_id = location?.company_id;
            }

            if (req.body.role_id == employeeRole) {
                req.body.is_employee = 1;
            }

            if (req.body.role_id == customerRole) {
                req.body.is_customer = 1
                if (req.body.location_id) {
                    req.body.locations = [req.body.location_id]
                    req.body.location_id = ''
                }
            }

            // Create User           
            var createdUser = await UserService.createUser(req.body);


            if (req.body.is_employee == 1) {
                var date = dateFormat(new Date(), "yyyy-mm-dd")
                var params = { location_id: req.body.location_id, start_date: date, type: 'emp_timing' };
                var refData = setAppointmentsListRefData(params);
            }

            var expiresIn = 86400 // expires in 24 hours
            token1 = jwt.sign({
                id: createdUser._id,
                company_id: createdUser?.company_id || "",
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

exports.updateUser = async function (req, res, next) {
    try {
        // Id is necessary for the update
        var id = req.body?._id || ""
        if (!id) {
            return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
        }

        var email = req.body?.email || ""
        var mobile = req.body?.mobile || ""
        // var throwError = false
        // var message = "Something went wrong!"
        // if (email) {
        //     var query = { _id: { $ne: id }, email: email }
        //     var user = await UserService.checkUserExist(query)
        //     if (user && user._id) {
        //         throwError = true
        //         message = "Email already exist!"
        //     }
        // }

        // if (mobile) {
        //     var query = { _id: { $ne: id }, mobile: mobile }
        //     var user = await UserService.checkUserExist(query)
        //     if (user && user._id) {
        //         throwError = true
        //         message = "Mobile number already exist!"
        //     }
        // }

        // if (throwError) {
        //     return res.status(200).json({
        //         status: 200,
        //         flag: false,
        //         message: message
        //     })
        // }

        // console.log('req body ',req.body)

        if (req.body?.role_id == orgAdminRole) {
            var location = await LocationService.getLocation(req.body.location_id)
            if (location && location?.company_id) {
                req.body.company_id = location.company_id
                req.body.location_id = ''
            }
        }

        if (req.body?.role_id == branchAdminRole) {
            var location = await LocationService.getLocation(req.body.location_id)
            req.body.company_id = location?.company_id
        }

        if (req.body?.role_id == employeeRole) {
            req.body.is_employee = 1
        }

        if (req.body?.role_id == customerRole) {
            req.body.is_customer = 1
        }

        req.body.customer_heart = req.body.black_heart ? "black_heart" : "normal"
        var User = await UserService.getUser(req.body._id)
        if (User && User.is_super_admin != 1) {
            var updatedUser = await UserService.updateUser(req.body)
        } else if (req.body._id && req.body.password) {
            var updatedUser = await UserService.updateUser({ _id: req.body._id, password: req.body.password })
        }

        if (updatedUser.is_employee == 1) {
            var date = dateFormat(new Date(), "yyyy-mm-dd")
            var params = { location_id: updatedUser.location_id, start_date: date, type: 'emp_timing' };
            var refData = setAppointmentsListRefData(params);

            if (updatedUser.status == 0) {
                var empList = await UserService.getEmployees({ status: 1, is_employee: 1, location_id: updatedUser?.location_id }) || [];
                if (!empList || empList?.length == 0) {
                    var updatedLocation = await LocationService.updateLocationfields({ _id: req.body.location_id }, { setup_steps: 2 })
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: updatedUser, message: "User updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// block multiple users
exports.blockUsers = async function (req, res, next) {
    try {
        let users = req.body.users;
        let query = { _id: { $in: users } };
        let update = { is_blocked: 1 };
        if (users.length > 0) {
            let updatedUser = await UserService.updateMultipleUsers(query, update);
        }

        return res.status(200).json({ status: 200, flag: true, message: "Successfully Updated User" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.recoverUserAccount = async function (req, res, next) {
    try {
        let user_id = req.params.id;
        let updatedUser;
        if (user_id) {
            let update = { _id: user_id, is_blocked: 0, status: 1 };
            updatedUser = await UserService.updateUser(update);
        } else {
            return res.status(200).json({ status: 200, flag: false, message: "User Id must be present!" })
        }

        return res.status(200).json({ status: 200, flag: true, data: updatedUser, message: "User deleted successfully!" })
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
            let updatedUser = await UserService.updateUser(update);
            if (device_token) {
                var query = { user_id: user_id, device_token: device_token };
                await UserDeviceTokenService.deleteMultiple(query);
            }
        } else {
            return res.status(200).json({ status: 200, flag: false, message: "User Id must be present!" })
        }

        return res.status(200).json({ status: 200, flag: true, message: "User deleted successfully!" })
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
        var query = { email: req.body.email, is_super_admin: { $ne: 1 } };
        if (req.body.is_customer) {
            query['is_customer'] = req.body.is_customer;
        } else {
            query['is_customer'] = { $ne: 1 };
        }

        var user = await UserService.getUserbyLocation(query);
        if (user && user.is_super_admin != 1) {
            user.password = stringGen(6);
            user.forgot_password = 1;
            var updatedUser = await UserService.updateUser(user);

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
                company_id: '',
                location_id: '',
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

exports.loginUser = async function (req, res, next) {
    // Req.Body contains the form submit values.
    try {
        if (req.body.email) {
            req.body.email = req.body.email.toLowerCase()
        }

        var user = {
            email: req.body.email,
            status: 1
        }

        if (req.body.is_customer == 1) {
            user['is_customer'] = 1
        } else {
            user['is_customer'] = { $ne: 1 }
        }

        // console.log('user', user)
        // Calling the Service function with the new object from the Request Body
        var loginUser = await UserService.loginUser(user, req.body.password)
        var token1 = jwt.sign({
            id: loginUser._id,
            company_id: loginUser?.company_id || "",
            role_id: loginUser?.role_id || ""
        }, process.env.SECRET, {
            expiresIn: 604800 // expires in 7 days
        })

        if (loginUser._id && req.body.device_token && loginUser.is_super_admin != 1) {
            var user_data = { _id: loginUser._id, device_token: req.body.device_token }
            var updatedUser = await UserService.updateUser(user_data)
        }

        if (loginUser && loginUser._id) {
            loginUser = await UserService.getUser(loginUser._id)
        }

        if (loginUser.role_id && loginUser.role_id != '') {
            var query = { role_id: loginUser.role_id }
            if (systemType == "general" && loginUser?.company_id) {
                query.company_id = loginUser.company_id;
            }

            var permission = await PermissionService.getPermissionss(query);
            // console.log('permission', permission);
            if (permission && permission?.length) {
                loginUser.permission = permission
            }
        }

        if (loginUser.company_id && loginUser.company_id != '') {
            var company = await CompanyService.getCompany(loginUser.company_id)
            if (company.domain && company.domain != '') {
                loginUser.domain = company.domain
            }
        }

        var subscription = { subscription_id: { module: [] } }
        var company_id = loginUser.company_id
        var location_id = loginUser.location_id
        if (loginUser.locations?.length > 0) {
            location_id = loginUser.locations[0]
        }

        if (location_id) {
            var location = await LocationService.getLocation(location_id)
            company_id = location?.company_id
        }

        if (company_id) {
            var TodayDate = dateFormat(new Date(), "yyyy-mm-dd")
            var subsQuery = {
                company_id: ObjectId(company_id.toString()),
                status: 1,
                // $and: [{ start_date: { $lte: TodayDate } }, { end_date: { $gte: TodayDate } }]
            }

            subsQuery['$or'] = [
                { $and: [{ start_date: { $lte: TodayDate } }, { end_date: { $gte: TodayDate } }] },
                { $and: [{ start_date: { $lte: TodayDate } }, { end_date: { $in: ["", null] } }] },
                { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
            ]

            //console.log('subsQuery',subsQuery)
            var subscription_data = await BuySubscriptionService.getSubscriptionPackCompany(subsQuery);
            if (subscription_data) {
                subscription = subscription_data
            }
        }
        //console.log('subscription',subscription)
        loginUser.subscription = subscription

        return res.status(200).json({
            status: 200,
            flag: true,
            data: loginUser,
            token: token1,
            message: "Logged in successfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "Invalid username or password" })
    }
}

exports.customerLogin = async function (req, res, next) {
    try {
        var email = req.body?.email || ""
        var mobile = req.body?.mobile || ""
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

        var query = {
            is_customer: 1
        }

        if (email) {
            email = email.toLowerCase()
            query['email'] = email
        }

        if (mobile) {
            query['mobile'] = mobile
        }

        if (locationId) {
            query["$or"] = [
                { location_id: req.body.location_id },
                { locations: { $elemMatch: { $eq: req.body.location_id } } }
            ]
        }

        // Calling the Service function with the new object from the Request Body
        var loginUser = await UserService.loginUser(query, req.body?.password || "")
        if (loginUser && (!loginUser.status || loginUser.is_blocked)) {
            return res.status(200).json({ status: 200, flag: false, data: null, message: "Your account is suspended, To recover your account, please reset password" })
        }

        if (loginUser && loginUser._id && req.body.device_token && loginUser.is_super_admin != 1) {
            var user_data = { _id: loginUser._id, device_token: req.body.device_token }
            var updatedUser = await UserService.updateUser(user_data)
        }

        var token1 = '';

        if (loginUser && loginUser._id) {
            token1 = jwt.sign({
                id: loginUser._id,
                company_id: loginUser?.company_id || "",
                role_id: loginUser?.role_id || ""
            }, process.env.SECRET, {
                expiresIn: 604800 // expires in 7 days
            })

            loginUser = await UserService.getUser(loginUser._id);
            if (device_token) {
                var query = { device_token: device_token };
                await UserDeviceTokenService.inactiveMultipleStatus(query);
                await UserDeviceTokenService.inactiveMultipleStatus({ user_id: loginUser._id });

                var exitstQuery = { user_id: loginUser._id, device_token: device_token };

                var updateData = {
                    user_id: ObjectId(loginUser._id),
                    device_token: device_token,
                    device_type: device_type,
                    app_type: 'admin',
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
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "Invalid user credentials!" })
    }
}

exports.getCompanySubscriptions = async function (req, res, next) {
    try {
        var subdomain = req.query.subdomain;
        var company_id = req.query.company_id;
        var total_location = 0;
        // Calling the Service function with the new object from the Request Body
        var com_query = {}
        if (company_id) {
            com_query['_id'] = ObjectId(company_id);
        } else if (subdomain && subdomain != '') {
            com_query['domain'] = subdomain;
        }
        if ((subdomain && subdomain != '') || company_id) {
            var subscription = { subscription_id: { module: [] } };
            var company = await CompanyService.getComanyByDomain(com_query);
            if (company) {
                company_id = company._id.toString()
                var loc_query = { company_id: company_id, soft_delete: { $ne: true } }
                var locations = await LocationService.getLocationSpecific(loc_query)
                total_location = locations.length;
            }

            if (company_id) {
                var TodayDate = dateFormat(new Date(), "yyyy-mm-dd");
                var subsQuery = {
                    company_id: ObjectId(company_id.toString()),
                    status: 1,
                    // $and: [{ start_date: { $lte: TodayDate } }, { end_date: { $gte: TodayDate } }]
                }

                subsQuery['$or'] = [
                    { $and: [{ start_date: { $lte: TodayDate } }, { end_date: { $gte: TodayDate } }] },
                    { $and: [{ start_date: { $lte: TodayDate } }, { end_date: { $in: ["", null] } }] },
                    { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
                ]
                var subscription_data = await BuySubscriptionService.getSubscriptionPackCompany(subsQuery);
                if (subscription_data) {
                    subscription = subscription_data;
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, total_location: total_location, data: subscription, subscription: subscription, message: "Subscription received successfully!" })
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getUserPermission = async function (req, res, next) {
    // Role Id is necessary 
    if (!req.body.role_id) {
        return res.status(200).json({ status: 200, flag: false, message: "Role Id be present!" })
    }

    try {
        // Calling the Service function with the new object from the Request Body
        var company_id = '';
        var location_id = '';
        var role_id = req.body.role_id;
        var userId = req.body.user_id;
        if (role_id) {
            if (userId) {
                var user = await UserService.getUser(userId);
                if (user && user?._id) {
                    company_id = user?.company_id;
                    location_id = user?.location_id;
                    if (user?.locations?.length > 0) {
                        location_id = user.locations[0];
                    }
                }
            }

            var query = { role_id: role_id };
            if (systemType == "general" && company_id) {
                query.company_id = company_id;
            }

            var permission = await PermissionService.getPermissionss(query);
            // console.log('permission >>>> ', permission, query);
            var subscription = { subscription_id: { module: [] } };

            if (location_id) {
                var location = await LocationService.getLocation(location_id);
                company_id = location?.company_id;
            }
            //console.log('company_id',company_id)

            if (company_id) {
                var TodayDate = dateFormat(new Date(), "yyyy-mm-dd");
                var subsQuery = {
                    company_id: ObjectId(company_id.toString()),
                    status: 1,
                    // $and: [{ start_date: { $lte: TodayDate } }, { end_date: { $gte: TodayDate } }]
                };

                subsQuery['$or'] = [
                    { $and: [{ start_date: { $lte: TodayDate } }, { end_date: { $gte: TodayDate } }] },
                    { $and: [{ start_date: { $lte: TodayDate } }, { end_date: { $in: ["", null] } }] },
                    { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
                ]

                var subscription_data = await BuySubscriptionService.getSubscriptionPackCompany(subsQuery);
                if (subscription_data) {
                    subscription = subscription_data;
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: permission, subscription: subscription, message: "Permissions received successfully!" })
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeUser = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }
    try {
        var user = await UserService.getUser(id);

        var deleted = await UserService.deleteUser(id);

        if (user && user.is_employee == 1) {
            var date = dateFormat(new Date(), "yyyy-mm-dd")
            var params = { location_id: user.location_id, start_date: date, type: 'emp_timing' };
            var refData = setAppointmentsListRefData(params);

            var deleted = await EmployeeTimingService.deleteTimingByEmployee(user._id.toString());

        }

        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

async function getAvailableEmployeesList(params) {
    try {
        var query = { status: 1 }
        var allEmpQuery = { status: 1 }

        if (params.location_id && params.location_id != 'undefined') {
            query['location_id'] = params.location_id
            allEmpQuery['location_id'] = params.location_id
        }

        if (params.employees && params.employees.length > 0) {
            query['_id'] = { $nin: params.employees }
            allEmpQuery['_id'] = { $nin: params.employees }
        }

        if (params.is_employee == 1) {
            query['is_employee'] = 1
            allEmpQuery['is_employee'] = 1
        }

        if (params.is_available == 1) {
            query['status'] = 1
            allEmpQuery['status'] = 1
        }

        if (params.employee_id && params.employee_id != 'undefined') {
            query['_id'] = params.employee_id.toString()
        }

        var filter_employees = params.filter_employees ? params.filter_employees : []

        date = params.date
        var dateObj = new Date(date)
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }) // get day name
        weekday = weekday?.toLowerCase() || ""
        var close_day = false
        var close_day_name = ''

        var location = await LocationService.getLocation(params.location_id)
        if (location?.group_close_days && location?.group_close_days.length > 0) {
            var ind = location?.group_close_days.findIndex(x => date >= dateFormat(x.close_day_start_date, "yyyy-mm-dd") && date <= dateFormat(x.close_day_end_date, "yyyy-mm-dd"))
            if (ind != -1) {
                close_day = true
                close_day_name = location?.group_close_days[ind].close_day_name
            }
        }

        var fquery = { location_id: params.location_id, date: params.date }
        var getFilterData = await EmployeeFilterLog.getEmployeeFilterLogsSpecific(fquery)
        if (getFilterData.length > 0) {
            var eQuery = { _id: { $in: getFilterData[0].employee_ids } }
            var emp = await UserService.getAvilEmployees(eQuery)
            filter_employees = getFilterData[0].employee_ids
            getFilterData[0].employee_ids = emp // with name
            params.order_by = "user_order"
        }

        var on_leave_emp = [];
        if (params.is_available == 1 && !close_day) {
            var off_day_emp = await EmployeeTimingService.getEmployeeAllTimings({
                location_id: params.location_id,
                day: weekday,
                //days_off:{$eq:1},
                $or: [
                    { $and: [{ repeat: { $eq: 'weekly' } }, { end_repeat: { $eq: 'ongoing' } }, { date: { $lte: date } }] },
                    { $and: [{ repeat: { $eq: '' } }, { date: { $eq: date } }] },
                    { $and: [{ end_repeat: { $eq: 'date' } }, { date: { $lte: date } }, { repeat_specific_date: { $gte: date } }] }
                ]
            })

            var result_emp = []
            var off_day_emp_arr = []
            var off_day_emp_filter = []

            var result_emp = off_day_emp.reduce((unique, o) => {
                if (!unique.some(obj => obj.employee_id === o.employee_id)) {
                    unique.push(o)
                }

                return unique
            }, [])

            off_day_emp = result_emp

            if (off_day_emp.length > 0) {
                off_day_emp_arr = off_day_emp.map(s => s.employee_id)
            }

            for (var oemp = 0; oemp < off_day_emp_arr.length; oemp++) {
                var em_id = off_day_emp[oemp].employee_id;
                var pri_ind = off_day_emp.findIndex(x => x.employee_id == em_id)
                if (pri_ind > -1) {
                    if (off_day_emp[pri_ind].days_off == 1) {
                        off_day_emp_filter.push(off_day_emp[pri_ind])
                    }
                }
            }

            if (off_day_emp_filter.length > 0) {
                on_leave_emp = off_day_emp_filter.map(s => s.employee_id)
            }
            if (on_leave_emp.length > 0) {
                if (params.employees && params.employees.length > 0) {
                    on_leave_emp = on_leave_emp.concat(params.employees)
                }

                allEmpQuery['_id'] = { $nin: on_leave_emp }
                if (filter_employees && filter_employees.length > 0) {
                    query['$and'] = [{ _id: { $in: filter_employees } }, { _id: { $nin: on_leave_emp } }]
                } else {
                    query['_id'] = { $nin: on_leave_emp }
                }
            } else {
                if (filter_employees && filter_employees.length > 0) {
                    query['_id'] = { $in: filter_employees }
                }
            }
        }

        var users = []
        var allEmp = []
        var order_by = params?.order_by ? params.order_by : ''
        if (!close_day) {
            allEmp = await UserService.getAvilEmployees(allEmpQuery)
            users = await UserService.getAvilEmployees(query, order_by)
            for (var i = 0; i < users.length; i++) {
                var query = { location_id: params.location_id, employee_id: users[i]._id.toString(), date: params.date }
                var getData = await EmployeeNumberLog.getEmployeeNumberLogsSpecific(query)
                let e_ind = result_emp.findIndex(x => x.employee_id == users[i]._id)
                if (e_ind != -1 && result_emp[e_ind].shift_end_time != "00:00") {
                    users[i].shift_start_time = result_emp[e_ind].shift_start_time
                    users[i].shift_end_time = result_emp[e_ind].shift_end_time
                    users[i].sec_shift_start_time = result_emp[e_ind].sec_shift_start_time
                    users[i].sec_shift_end_time = result_emp[e_ind].sec_shift_end_time
                }

                if (getData.length > 0) {
                    users[i].user_order = getData[0].user_order
                } else {
                    users[i].user_order = 0
                }
            }

            users.sort((a, b) => parseInt(a.user_order) - parseInt(b.user_order))
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return { off_day_emp: off_day_emp, data: users, all_emp: allEmp, close_day: close_day, filter_data: getFilterData, result_emp: result_emp, close_day_name: close_day_name };
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return null;
    }
}


exports.createEmployeeNumberLog = async function (req, res, next) {
    try {
        var tableData = [];
        var empData = [];

        var query = { location_id: req.body.location_id, employee_id: req.body.employee_id, date: req.body.date };
        var getData = await EmployeeNumberLog.getEmployeeNumberLogsSpecific(query);
        //console.log('getData',getData)

        if (getData.length > 0) {
            var updateData = await EmployeeNumberLog.updateData(query, req.body.user_order)
        } else {
            var updateData = await EmployeeNumberLog.createEmployeeNumberLog(req.body)
        }
        if (req.body.date) {
            req.body.date = dateFormat(new Date(req.body.date), "yyyy-mm-dd");
            var params = { location_id: req.body.location_id, employee_id: '', date: req.body.date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1, type: 'booking' };

            var refData = await updateAppListTableData(params);

            tableData = await generateTableTimeSlotNew(refData, params);

            empData = await getAvailableEmployeesList(req.body)

            if (req.body.login_employee_id) {
                refData.employee = refData.employee.filter(function (el) {
                    return el._id == req.body.login_employee_id;
                });

                if (tableData && tableData.length > 0) {
                    for (let t = 0; t < tableData.length; t++) {
                        tableData[t].data = tableData[t].data.filter(x => x.employee_id == req.body.login_employee_id);
                    }
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, today_timing: refData.today_timing, data: tableData, allEmployees: refData.employee, refData: refData, empData: empData, message: "Successfully Created EmployeeNumberLog" })
    } catch (e) {
        console.log('e', e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createEmployeeFilterLog = async function (req, res, next) {
    try {
        var query = { location_id: req.body.location_id, date: req.body.date };
        var getData = await EmployeeFilterLog.getEmployeeFilterLogsSpecific(query);

        if (getData.length > 0) {
            req.body._id = getData[0]._id;
            var updateData = await EmployeeFilterLog.updatePackage(req.body)
        } else {
            var updateData = await EmployeeFilterLog.createEmployeeFilterLog(req.body)
        }

        return res.status(200).json({ status: 200, flag: true, data: updateData, message: "EmployeeNumberLog created successfully!" })
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for employee dropdown
exports.getEmployeesDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : "name";
        var order = req.query?.order ? req.query.order : "1";
        var search = req.query?.searchText ? req.query.searchText : "";

        var query = { is_employee: 1 };
        var existQuery = {};
        if (req.query?.status == "active") {
            query.status = 1;
        }

        if (req.query?.company_id) {
            query.company_id = req.query.company_id;
        }

        if (req.query?.location_id) {
            query.location_id = req.query.location_id;
        }

        if (req.query?.id) {
            query._id = req.query.id;
        }

        if (req.query?.ids && isValidJson(req.query.ids)) {
            var ids = JSON.parse(req.query.ids);
            query._id = { $nin: ids };
            //existQuery['_id'] = { $in: ids };
        }

        if (search) {
            query['$or'] = [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } }
            ];

            if (req.query?.ids && isValidJson(req.query.ids)) {
                var ids = JSON.parse(req.query.ids);
                //query['_id'] = { $nin: ids };
                existQuery._id = { $in: ids };
            }
        }

        var existUsers = [];
        if (!isObjEmpty(existQuery)) {
            existUsers = await UserService.getUsersDropdown(existQuery, orderName, order) || [];
        }

        var users = await UserService.getUsersDropdown(query, orderName, order) || [];
        users = existUsers.concat(users) || [];

        return res.status(200).send({ status: 200, flag: true, data: users, message: "Employees dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

// This is only for customer dropdown
exports.getCustomersDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : "name";
        var order = req.query?.order ? req.query.order : "1";
        var search = req.query?.searchText ? req.query.searchText : "";

        var query = { is_customer: 1 };
        var existQuery = {};
        if (req.query?.status == "active") {
            query.status = 1;
        }

        if (req.query?.company_id) {
            query.company_id = req.query.company_id;
        }

        if (req.query?.location_id) {
            query.locations = { $in: [req.query.location_id] };
        }

        if (req.query?.id) {
            query._id = req.query.id;
        }

        if (req.query?.ids && isValidJson(req.query.ids)) {
            var ids = JSON.parse(req.query.ids);
            query._id = { $nin: ids };
            existQuery._id = { $in: ids };
        }

        if (search) {
            query['$or'] = [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } },
                { mobile: { $regex: '.*' + search + '.*', $options: 'i' } }
            ];
        }

        var existUsers = [];
        if (!isObjEmpty(existQuery)) {
            existUsers = await UserService.getUsersDropdown(existQuery, orderName, order) || [];
        }

        var users = await UserService.getUsersDropdown(query, orderName, order) || [];
        users = existUsers.concat(users) || [];

        return res.status(200).send({ status: 200, flag: true, data: users, message: "Customers dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

/* Customer */
exports.createCustomerUser = async function (req, res, next) {
    try {
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
        var message = "Something went wrong";
        if (email && mobile) {
            query['$or'] = [{ email: email }, { mobile: mobile }];
            message = "Email or mobile already exist!";
        } else if (email && !mobile) {
            query.email = email;
            message = "Email already exist!";
        } else if (!email && mobile) {
            query.mobile = mobile;
            message = "Mobile already exist!";
        }

        req.body.role_id = process.env?.CUSTOMER_ROLE || "";
        req.body.is_customer = 1;

        var user = await UserService.checkUserExist(query);
        if (user?._id && (!user?.status || user?.is_blocked)) {
            return res.status(200).json({ status: 200, flag: false, data: null, message: "Your account is suspended, To recover your account, please reset password" })
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
                var location = await LocationService.getLocationOne({ _id: locationId });
                if (location?.company_id && location?.company_id?._id) {
                    req.body.company_id = location?.company_id._id;
                    req.body.locations = [locationId];
                    req.body.location_id = locationId;
                }
            }

            var html = ""
            var subject = "Welcome to " + req.body.company;
            var temFile = "customer_created_info.hjs";

            var toMail = {}
            toMail['site_url'] = process.env?.API_URL || "";
            toMail['link_url'] = process.env?.SITE_URL || "";


            var token = null;
            var createdUser = await UserService.createUser(req.body) || null;
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
                        app_type: 'admin',
                        status: 1
                    }
                    await UserDeviceTokenService.createUserDeviceToken(data);
                }

                var sendEmail = await SendEmailSmsService.sendMailAwait(createdUser.email, createdUser.name, subject, temFile, html, toMail, 'transaction', locationId, req.body.company_id);

                // var emailData = {
                //     company_id: location.company_id ? location.company_id._id : "",
                //     location_id: locationId,
                //     client_id: createdUser._id,
                //     subject: subject,
                //     name: createdUser.name,
                //     type: "single",
                //     file_type: "forgot_password",
                //     temp_file: temFile,
                //     html: '',
                //     data: toMail,
                //     date: Date(),
                //     to_email: createdUser.email,
                //     status: "initial",
                //     response: null,
                //     response_status: '',
                // }

                // if (sendEmail && sendEmail?.status) {
                //     emailData.response = sendEmail.response;
                //     emailData.response_status = sendEmail.status;
                //     emailData.status = sendEmail.status;
                // }

                // var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
                // var tillDate = increaseDateDays(new Date, days)
                // if (tillDate) {
                //     emailData.till_date = tillDate
                // }

                // var eLog = EmailLogService.createEmailLog(emailData)


                var expiresIn = 86400 // expires in 24 hours
                token = jwt.sign({
                    id: createdUser._id,
                    company_id: createdUser.company_id,
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
        if (type == "customer") {
            existQuery.is_customer = 1;
        }

        if (email) {
            existQuery.email = email;
        }

        if (mobile) {
            existQuery.mobile = mobile;
        }

        var user = await UserService.checkUserExist(existQuery);
        if (user && user._id) {
            var code = get4DigitCode();
            var resetToken = generateUniqueId();
            user = await UserService.updateUser({ _id: user._id, reset_token: resetToken, code: code });

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

                // var emailData = {
                //     company_id: "",
                //     location_id: req.body.location_id,
                //     client_id: user._id,
                //     subject: subject,
                //     name: user.name,
                //     type: "single",
                //     file_type: "reset_password",
                //     temp_file: temFile,
                //     html: '',
                //     data: toMail,
                //     date: Date(),
                //     to_email: user.email,
                //     status: "initial",
                //     response: null,
                //     response_status: '',
                // }

                // if (sendEmail && sendEmail?.status) {
                //     emailData.response = sendEmail.response;
                //     emailData.response_status = sendEmail.status;
                //     emailData.status = sendEmail.status;
                // }

                // var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
                // var tillDate = increaseDateDays(new Date, days)
                // if (tillDate) {
                //     emailData.till_date = tillDate
                // }

                // var eLog = EmailLogService.createEmailLog(emailData)
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

        var user = await UserService.checkUserExist({ reset_token: resetToken });
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

        var user = await UserService.checkUserExist({ reset_token: resetToken });
        if (user && user._id) {
            var updateUser = await UserService.updateUser({
                _id: user._id,
                code: "",
                reset_token: "",
                password: password,
                status: 1,
                is_blocked: 0
            })
            if (updateUser && updateUser._id) {
                flag = true;
                data = { _id: updateUser._id, name: updateUser.name, email: updateUser?.email || "", mobile: updateUser?.mobile || "" };
                message = "Password reset successfully!";
            }
        } else {
            var flag = false;
            var message = "Reset token is not valid!";
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

        var user = await UserService.checkUserPassword(req.body);
        if (user && user._id) {
            if (user.is_super_admin != 1) {
                req.body.forgot_password = 0;
                var updatedUser = await UserService.updateUser(req.body);
                updatedUser = await UserService.getUser(updatedUser._id);

                flag = true;
                data = updatedUser;
                message = "Password changed successfully!";
            } else {
                flag = false;
                message = "No User Found!";
            }
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
        if (id) {
            query._id = { $ne: id };
        }

        var user = await UserService.checkUserExist(query);
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
        if (id) {
            query._id = { $ne: id };
        }

        var user = await UserService.checkUserExist(query);
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

const createCustomerUserWithPassword = async function (item = null) {
    try {
        var data = null;
        var message = "Something went wrong while creating user!";
        if (item && !isObjEmpty(item)) {
            item.role_id = process.env?.CUSTOMER_ROLE || "";
            item.is_customer = 1;

            var password = item?.password || getRandPswd();
            item.password = password;

            var createdUser = await UserService.createUser(item) || null;
            if (createdUser && createdUser._id) {
                data = createdUser;
                message = "";

                var html = "";
                var subject = "Welcome to " + req.body.company;
                var temFile = "customer_created_info.hjs";

                var toMail = {};
                toMail['site_url'] = process.env?.API_URL || "";
                toMail['link_url'] = process.env?.SITE_URL || "";

                toMail['name'] = createdUser.name;
                toMail['email'] = createdUser.email;
                toMail['mobile'] = createdUser?.mobile || "";
                toMail['password'] = password;

                var sendEmail = await SendEmailSmsService.sendMailAwait(createdUser.email, createdUser.name, subject, temFile, html, toMail, 'transaction', item?.location_id);

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
                    response_status: '',
                }

                if (sendEmail && sendEmail?.status) {
                    emailData.response = sendEmail.response;
                    emailData.response_status = sendEmail.status;
                    emailData.status = sendEmail.status;
                }

                var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                var tillDate = increaseDateDays(new Date, days);
                if (tillDate) { emailData.till_date = tillDate; }

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
            })
        }

        if (locationId) {
            var location = await LocationService.getLocationOne({ _id: locationId });
            if (location?.company_id && location.company_id?._id) {
                companyId = location.company_id._id;
                req.body.company_id = location.company_id._id;
            }
        }

        var query = { $or: [{ email: email }, { mobile: mobile }] };

        var user = await UserService.checkUserExist(query);
        if (user?._id && (!user?.status || user?.is_blocked)) {
            return res.status(200).json({ status: 200, flag: false, data: null, message: "Your account is suspended, To recover your account, please reset password" })
        }

        if (user && user._id && !id) {
            flag = true;
            message = "User already exist!";
        } else if (id) {
            user = await UserService.getUser(id);
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
                company_id: data?.company_id || "",
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
            })
        }

        if (locationId) {
            var location = await LocationService.getLocationOne({ _id: locationId });
            if (location?.company_id && location.company_id?._id) {
                companyId = location.company_id._id;
                req.body.company_id = location.company_id._id;
            }
        }

        var query = { $or: [{ email: email }, { mobile: mobile }] };
        var user = await UserService.checkUserExist(query);
        if (user && user._id && !id) {
            flag = true;
            message = "User already exist!";
        } else if (id) {
            user = await UserService.getUser(id);
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
                var email = item?.email;
                var mobile = item?.mobile;
                if (locationId) {
                    item.location_id = locationId;
                    item.company_id = companyId;
                }

                if (itemId) {
                    var user = await UserService.getUser(itemId);
                    if (user && user._id) {
                        usersData.push(user);
                    }
                } else {
                    var query = { $or: [{ email: email }, { mobile: mobile }] };
                    var user = await UserService.checkUserExist(query);
                    if (user && user._id) {
                        usersData.push(user);
                    } else {
                        var createdUser = await createCustomerUserWithPassword(item) || null;
                        if (createdUser?.data && createdUser.data?._id) {
                            usersData.push(createdUser?.data);
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
                company_id: data?.company_id || "",
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
        var bcc = "";
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
        var user_id = req.params?.id;
        var locationId = req.query?.location_id || "";
        var today_date = new Date();
        var date = dateFormat(today_date, "yyyy-mm-dd");

        if (!user_id) {
            return res.status(200).json({ status: 200, flag: false, data: null, message: "Customer id must be present!" })
        }
        var query = { customer_id: user_id, status: 1 };

        if (locationId) {
            query['location_id'] = locationId;
        }

        query['$or'] = [
            { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
            { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
        ];

        var rewards = await CustomerRewardService.getCustomerLastRewardData({ customer_id: user_id });
        var reward_points = 0;
        if (rewards && rewards.total_points) {
            reward_points = rewards.total_points;
        }

        var packages = await CustomerPackageService.getCustomerPackageCount(query);

        var loylaty_cards = await CustomerLoyaltyCardService.getCustomerLoyaltyCardCount(query);

        var discounts = await DiscountService.getDiscountsCount(query);

        var offer_query = { customer_arr: user_id, status: 1 };

        offer_query['$or'] = [
            { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
            { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
        ];

        var offers = await DiscountService.getDiscountsCount(offer_query);

        var data = { rewards: reward_points, packages: packages, loylaty_cards: loylaty_cards, discounts: discounts, offers: offers };

        return res.status(200).json({
            status: 200,
            flag: true,
            data: data,
            message: "Successfully received user account details"
        })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            message: e.message
        })
    }
}
