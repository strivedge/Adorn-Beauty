const PaidTimingService = require('../services/paidTiming.service');
const moment = require('moment');

//create
exports.create = async function (req, res, next) {
    try {
        if (!req.body.location_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Location id is required" });
        }
        if (!req.body['repeat']) {
            return res.status(200).json({ status: 200, flag: false, message: "Repeat is required" });
        }
        if (!req.body.start_date) {
            return res.status(200).json({ status: 200, flag: false, message: "Start date is required" });
        }

        let location_id = req.body.location_id;

        if (req.body['repeat'] === 'no-repeat') {
            let start_date = req.body.start_date;
            let date = moment(start_date).format('YYYY-MM-DD');
            let query = {
                date: date,
                location_id: location_id
            }
            await PaidTimingService.deleteMany(query);
            let data = {
                date: date,
                location_id: location_id,
                slots: req.body.slots
            }
            let paidTiming = await PaidTimingService.create(data);
            return res.status(200).json({ status: 200, flag: true, data: paidTiming, message: "Successfully created" });
        }
        let start_date = req.body.start_date;
        let formattedStartDate = moment(start_date).format('YYYY-MM-DD');
        let end_date = null;
        let formattedEndDate = null;
        if (req.body.end_date) {
            end_date = req.body.end_date;
            formattedEndDate = moment(end_date).format('YYYY-MM-DD');
        } else {
            formattedEndDate = moment(start_date).add(1, 'year').format('YYYY-MM-DD');
        }
        if (req.body['repeat'] === 'weekly') {
            let dates = findDates(formattedStartDate, formattedEndDate, 'week');
            let data = [];
            //delete all date
            let query = {
                date: { $in: dates },
                location_id: location_id
            }
            await PaidTimingService.deleteMany(query);
            for (let i = 0; i < dates.length; i++) {
                data.push({
                    date: dates[i],
                    location_id: location_id,
                    slots: req.body.slots
                })
            }
            let paidTiming = await PaidTimingService.createMany(data);
            return res.status(200).json({ status: 200, flag: true, data: paidTiming, message: "Successfully created" });
        }
        if (req.body['repeat'] === 'daily') {
            let dates = findDates(formattedStartDate, formattedEndDate, 'day');
            let data = [];
            let query = {
                date: { $in: dates },
                location_id: location_id
            }
            await PaidTimingService.deleteMany(query);
            for (let i = 0; i < dates.length; i++) {
                data.push({
                    date: dates[i],
                    location_id: location_id,
                    slots: req.body.slots
                })
            }
            let paidTiming = await PaidTimingService.createMany(data);
            return res.status(200).json({ status: 200, flag: true, data: paidTiming, message: "Successfully created" });

        }


    } catch (e) {
        console.log("e ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

//function to find date between two dates with repeat type
function findDates(startDate, endDate, repeatType) {
    let dates = [];
    let currentDate = moment(startDate);
    let formattedEndDate = moment(endDate);
    while (currentDate <= formattedEndDate) {
        dates.push(currentDate.format('YYYY-MM-DD'));
        currentDate = moment(currentDate).add(1, repeatType);
    }
    return dates;
}

// let startDate = '2020-05-01';
// let endDate = '2021-05-01';
// let repeatType = 'week';
// let dates = findDates(startDate, endDate, repeatType);
// console.log("dates ", dates)
//
// function addTimeToDate(date, time) {
//     let formattedDate = moment(date).format('YYYY-MM-DD');
//     let formattedTime = moment(time, 'hh:mm ').format('hh:mm a');
//     let dateTime = moment(formattedDate + ' ' + formattedTime)
//     return dateTime;
// }
// let date = '2020-05-01';
// let time = '00:00';
// let dateTime = addTimeToDate(date, time);
// console.log("dateTime ",new Date( dateTime))
// console.log("dateTime ",new Date(  moment(date, 'YYYY-MM-DD')))

//create function which convert 00:00 to minutes
function convertTimeToMinutes(time) {
    let formattedTime = moment(time, 'hh:mm')

    let minutes = formattedTime.minutes() + formattedTime.hours() * 60;
    return minutes;
}
let time = '23:15';
let minutes = convertTimeToMinutes(time);


//findPaidTiming
exports.findPaidTiming = async function (req, res, next) {
    try {
        let location_id = req.query.location_id;
        let date = req.query.date;
        if (!location_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Location id is required" });
        }
        if (!date) {
            return res.status(200).json({ status: 200, flag: false, message: "Date is required" });
        }
        let query = {
            location_id: location_id,
            date: date
        }
        let paidTiming = await PaidTimingService.findOne(query);
        return res.status(200).json({ status: 200, flag: true, data: paidTiming, message: "Successfully found" });
    } catch (e) {
        console.log("e ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}


exports.checkPaidTiming = async function (req, res, next) {
    try {
        let date = req.query?.date || "";
        let location_id = req.query?.location_id || "";
        let start_time = req.query?.start_time || "";
        let end_time = req.query?.end_time || "";
        if (!date) {
            return res.status(200).json({ status: 200, flag: false, message: "Date is required!" })
        }

        date = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
        if (!date) {
            return res.status(200).json({ status: 200, flag: false, message: "Date is invalid!" })
        }

        if (!location_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Location id is required!" })
        }

        if (!start_time) {
            return res.status(200).json({ status: 200, flag: false, message: "Start time is required!" })
        }

        if (!end_time) {
            return res.status(200).json({ status: 200, flag: false, message: "End time is required!" })
        }

        let possibleSlots = findSlotsBetweenTwoSlots(start_time, end_time)
        let query = {
            date: date,
            location_id: location_id
        }
        let slotsData = await PaidTimingService.findOne(query);
        if (!slotsData) {
            return res.status(200).json({ status: 200, flag: false, message: "No slots found" });
        }

        let slots = []
        if (slotsData['slots'] && slotsData['slots']?.length > 0) {
            slots = slotsData['slots'];
        }

        for (let i = 0; i < slots.length; i++) {
            let slot = slots[i];
            let slotStartTime = slot['start_time'];
            let slotEndTime = slot['end_time'];
            let slotStartTimeInMinutes = convertTimeToMinutes(slotStartTime);
            let slotEndTimeInMinutes = convertTimeToMinutes(slotEndTime);
            // let startTimeInMinutes = convertTimeToMinutes(start_time);
            // let endTimeInMinutes = convertTimeToMinutes(end_time);
            // if((startTimeInMinutes>=slotStartTimeInMinutes && startTimeInMinutes<=slotEndTimeInMinutes) || (endTimeInMinutes>=slotStartTimeInMinutes && endTimeInMinutes<=slotEndTimeInMinutes)){
            //     return res.status(200).json({status: 200, flag: true, message: "Selected slots are in paid hours"});
            // }
            let isAvailable = possibleSlots.some(x => convertTimeToMinutes(x) >= slotStartTimeInMinutes && convertTimeToMinutes(x) < slotEndTimeInMinutes)
            if (isAvailable) {
                return res.status(200).json({
                    status: 200,
                    flag: true,
                    message: "Selected slots are in paid hours!"
                })
            }
        }

        return res.status(200).json({
            status: 200,
            flag: false,
            message: "Selected slots are not in paid hours!"
        })
    } catch (e) {
        console.log("e ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}


function findSlotsBetweenTwoSlots(startTime, endTime) {
    let slots = [];
    let currentTime = moment(startTime, 'hh:mm');
    let formattedEndTime = moment(endTime, 'hh:mm');
    while (currentTime < formattedEndTime) {
        slots.push(currentTime.format('HH:mm'));
        currentTime = moment(currentTime).add(15, 'minutes');
    }
    return slots;
}
