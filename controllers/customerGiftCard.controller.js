var cron = require('node-cron');
var ObjectId = require('mongodb').ObjectId;

var CompanyService = require('../services/company.service');
var CustomerGiftCardService = require('../services/customerGiftCard.service');
var CustomerService = require('../services/customer.service');
var EmailLogService = require('../services/emailLog.service');
var LocationService = require('../services/location.service');
var SendEmailSmsService = require('../services/sendEmailSms.service');
var GiftCardTransactionService = require('../services/giftCardTransaction.service');

var GiftVoucherHTMLService = require('../services/giftVoucherHtml.service');

const fs = require('fs');
var path = require('path');
var rootPath = require('path').resolve('public');
const nodeHtmlToImage = require('node-html-to-image');

const {
    isObjEmpty,
    formatDate,
    getFileNamePath,
    getPrefixNumber,
    getDecimalFormat,
    getDateAddMonths,
    increaseDateDays,
    checkIsBeforeDate,
    getCapitalizeString,
    getGiftCardBalance,
    generateRanAlphaNumString,
    debitCustomerGiftCardBalance,
    creditCustomerGiftCardBalance
} = require('../helper');

// Saving the context of this module inside the _the variable
_this = this;

var superAdminRole = process.env?.SUPER_ADMIN_ROLE || "607d8aeb841e37283cdbec4b"
var orgAdminRole = process.env?.ORG_ADMIN_ROLE || "6088fe1f7dd5d402081167ee"

var newGiftCardValidDays = process.env?.CUSTOMER_GIFT_CARD_VALID_DAYS || 365;
var prefixNumLen = 5;
var prefixIdNum = "00000";
var dirName = "gift_card_voucher";

// Async Controller function to get the To do List
exports.getCustomerGiftCards = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 0; //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000;
        var order_name = req.query.order_name ? req.query.order_name : "createdAt";
        var order = req.query.order ? req.query.order : "-1";
        var searchText = req.query?.searchText ? req.query.searchText : "";

        // var roleId = req?.roleId || "";
        var companyId = req.query?.company_id || "";
        var locationId = req.query?.location_id || "";

        var query = {};
        if (companyId) {
            query.company_id = ObjectId(companyId);
        }

        if (locationId) {
            query.created_location_id = ObjectId(locationId);
            // if (roleId && (roleId == superAdminRole || roleId == orgAdminRole)) {
            //     query.location_id = { $in: [null, ObjectId(locationId)] }
            // }
        }

        if (req.query?.customer_id) {
            query.customer_id = ObjectId(req.query.customer_id);
        }

        if (req.query.gift_card_id) {
            query.gift_card_id = ObjectId(req.query.gift_card_id);
        }

        if (req.query.status == 1) {
            query.status = 1;
        }

        if (searchText) {
            query['$or'] = [
                { gift_code: { $regex: '.*' + searchText + '.*', $options: 'i' } }
            ];
        }

        var customerGiftCards = await CustomerGiftCardService.getCustomerGiftCards(query, parseInt(page), parseInt(limit), order_name, Number(order));

        // Return the Customer Gift Cards list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: customerGiftCards,
            message: "Customer gift cards received successfully!"
        });
    } catch (error) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: error.message });
    }
}

exports.getCustomerGiftCardsOne = async function (req, res, next) {
    try {
        var page = Number(req.query?.page) || 1;
        var limit = Number(req.query?.limit) || 0;
        var sortBy = req.query?.sortBy || '_id';
        var sortOrder = req.query.sortOrder && JSON.parse(req.query.sortOrder) ? '1' : '-1';
        var pageIndex = 0;
        var startIndex = 0;
        var endIndex = 0;

        var companyId = req.query?.company_id || "";
        var locationId = req.query?.location_id || "";
        var customerId = req.query?.customer_id || "";
        var search = req.query?.searchText || "";

        var throwError = false;
        var message = "Something went wrong!";

        if (!companyId) {
            throwError = true;
            message = "Company Id must be present!";
        } else if (!locationId) {
            throwError = true;
            message = "Location Id must be present!";
        } else if (!customerId) {
            throwError = true;
            message = "Customer Id must be present!";
        }

        if (throwError) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: [],
                message: message
            });
        }

        var query = {};
        if (companyId) { query.company_id = companyId; }
        // if (locationId) { query.location_id = { $in: [locationId, null] }; }
        if (locationId) { query.created_location_id = locationId; }

        if (customerId) { query.customer_id = customerId; }

        if (search) {
            query['$or'] = [
                { sr_no: { $regex: '.*' + search + '.*', $options: 'i' } },
                { gift_code: { $regex: '.*' + search + '.*', $options: 'i' } }
            ];
        }

        var count = await CustomerGiftCardService.getCustomerGiftCardsCount(query);
        var customerGiftCards = await CustomerGiftCardService.getCustomerGiftCardList(query, Number(page), Number(limit), sortBy, Number(sortOrder));
        if (!customerGiftCards || !customerGiftCards?.length) {
            if (Number(req.query?.page) && Number(req.query.page) > 0) {
                page = 1;
                customerGiftCards = await CustomerGiftCardService.getCustomerGiftCardList(query, Number(page), Number(limit), sortBy, Number(sortOrder));
            }
        }

        if (customerGiftCards && customerGiftCards.length) {
            pageIndex = Number(page - 1);
            startIndex = (pageIndex * limit) + 1;
            endIndex = Math.min(startIndex - 1 + limit, count);
        }

        // Return the Customer Gift Cards list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: customerGiftCards,
            pages: limit ? Math.ceil(count / limit) : 0,
            total: count,
            pageIndex: pageIndex,
            startIndex: startIndex,
            endIndex: endIndex,
            message: "Customer gift cards received successfully!"
        });
    } catch (error) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: error.message });
    }
}

exports.getCustomerGiftCard = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var customerGiftCard = await CustomerGiftCardService.getGiftCard(id);

        // Return the Customer Gift Card with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: customerGiftCard,
            message: "Customer gift card received successfully!"
        });
    } catch (error) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: error.message });
    }
}

exports.getCustomerGiftCardDetail = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var customerId = req.query?.customer_id || "";

        var flag = false;
        var message = "Customer gift card not found!";
        var transactions = [];

        var query = { _id: id };
        if (customerId) { query.customer_id = customerId; }

        var customerGiftCard = await CustomerGiftCardService.getGiftCardOne(query) || null;
        if (customerGiftCard && customerGiftCard?._id) {
            flag = true;
            message = "Customer gift card received successfully!";

            var tranQuery = { customer_gift_card_id: id };
            if (customerId) { tranQuery.customer_id = customerId; }
            // transaction history last record comes first
            transactions = await GiftCardTransactionService.getGiftCardTransactionsOne(tranQuery, 1, 0, "_id", "-1");
        }

        // Return the Customer Gift Card with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag,
            data: customerGiftCard,
            transactions,
            message
        });
    } catch (error) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: error.message });
    }
}

exports.createCustomerGiftCard = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var companyId = req.body?.company_id || "";
        var locationId = req.body?.location_id || "";
        var type = req.body?.type || "";
        var amount = req.body?.amount || 0;
        var uptoMonths = req.body?.upto_months || "";
        var billingAddress = req.body?.billing_address || null;
        var shippingAddress = req.body?.shipping_address || null;
        var transactionId = req.body?.transaction_id || null;
        var deliveryCharge = req.body?.delivery_charge || 0;
        var buyerCustomerId = req.body?.buyer_customer_id || "";
        var createdLocationId = req.body?.created_location_id || "";

        var validation = false;
        var message = "Something went wrong!";

        if (!companyId) {
            validation = true;
            message = "Company Id must be present!";
        } else if (!type) {
            validation = true;
            message = "Type must be present!";
        } else if (!amount) {
            validation = true;
            message = "Amount must be present!";
        } else if (!billingAddress || isObjEmpty(billingAddress)) {
            // validation = true;
            message = "Billing address must be present!";
        } else if (!shippingAddress || isObjEmpty(shippingAddress)) {
            // validation = true;
            message = "Shipping address must be present!";
        }

        if (validation) {
            return res.status(200).json({ status: 200, flag: false, message: message });
        }

        if (!fs.existsSync(rootPath + `/images/${dirName}`)) {
            fs.mkdirSync(rootPath + `/images/${dirName}`, { recursive: true });
        }

        var lastRQuery = {};
        var newPrefix = "";
        var giftCardSettingLevel = "company";
        if (locationId) {
            var location = await LocationService.getLocation(locationId);
            if (location && location?.company_id) { companyId = location?.company_id; }
            // lastRQuery.location_id = locationId;
        }

        if (companyId) {
            req.body.company_id = companyId;
            var company = await CompanyService.getCompany(companyId);
            if (company && company?._id) {
                giftCardSettingLevel = company?.gift_card_setting_level || "company";
                if (!deliveryCharge) { deliveryCharge = company?.gift_card_delivery_charge || 0; }

                newPrefix = company?.prefix || "";
            }

            lastRQuery.company_id = companyId;
        }

        if (createdLocationId) {
            var location = await LocationService.getLocation(createdLocationId);
            if (location && location?._id) {
                if (giftCardSettingLevel == "location") {
                    if (!deliveryCharge && location?.gift_card_delivery_charge) {
                        deliveryCharge = location.gift_card_delivery_charge;
                    }

                    if (location?.prefix) { newPrefix = location.prefix; }
                }
            }
        }

        req.body.status = 1;
        var giftCode = generateRanAlphaNumString(8);
        var existCode = true;
        while (existCode) {
            var codeExists = await CustomerGiftCardService.getGiftCardSpecific({ gift_code: giftCode });
            if (codeExists && codeExists?.length) {
                giftCode = generateRanAlphaNumString(8);
            } else {
                existCode = false;
            }
        }

        req.body.gift_code = giftCode;

        var lastPrefixId = prefixIdNum;
        var lastRecord = await CustomerGiftCardService.getGiftCardOne(lastRQuery, "_id", -1);
        if (lastRecord && lastRecord?._id) {
            lastPrefixId = lastRecord?.sr_no || prefixIdNum;
        }

        newPrefix = getCapitalizeString(newPrefix);
        var prefixId = getPrefixNumber(lastPrefixId, prefixNumLen, newPrefix);
        if (prefixId) { req.body.sr_no = prefixId; }

        if (transactionId) { req.body.payment_mode = "paypal"; }

        req.body.start_date = formatDate(null, "YYYY-MM-DD");
        if (uptoMonths) {
            req.body.end_date = getDateAddMonths(null, uptoMonths, "YYYY-MM-DD");
        } else {
            req.body.upto_months = 12;
            req.body.end_date = increaseDateDays(null, newGiftCardValidDays, "YYYY-MM-DD");
        }

        if (type == "digital") { req.body.delivery_charge = 0; }
        if (type == "physical") { req.body.delivery_charge = deliveryCharge; }

        var blngFirstName = billingAddress?.first_name || "";
        var blngLastName = billingAddress?.last_name || "";
        var blngName = blngFirstName + " " + blngLastName;
        var blngEmail = billingAddress?.email || "";
        var blngMobile = billingAddress?.mobile || "";
        req.body.billing_address.name = blngName;

        var shpngFirstName = shippingAddress?.first_name || "";
        var shpngLastName = shippingAddress?.last_name || "";
        var shpngName = shpngFirstName + " " + shpngLastName;
        req.body.shipping_address.name = shpngName;

        var query = {};
        if (blngEmail && blngMobile) {
            query['$or'] = [{ email: blngEmail }, { mobile: blngMobile }];
        } else if (blngEmail && !blngMobile) {
            query.email = blngEmail;
        } else if (!blngEmail && blngMobile) {
            query.mobile = blngMobile;
        }

        if (!isObjEmpty(query) && !buyerCustomerId) {
            var customer = await CustomerService.checkCustomerExist(query);
            if (customer && customer?._id) { req.body.buyer_customer_id = customer._id; }
        }

        // console.log("createCustomerGiftCard >>> ", req.body);
        var createdGiftCard = await CustomerGiftCardService.createCustomerGiftCard(req.body);
        if (createdGiftCard && createdGiftCard?._id) {
            var giftCardData = await CustomerGiftCardService.getGiftCardDetail({ _id: createdGiftCard._id });
            var voucherHTML = await GiftVoucherHTMLService.generateVoucher(giftCardData);
            if (voucherHTML) {
                var imgName = `img-${createdGiftCard._id}.jpeg`;
                var imagePath = `images/${dirName}/${imgName}`;
                var highImgOutput = await nodeHtmlToImage({
                    output: rootPath + "/" + imagePath,
                    type: "jpeg",
                    quality: 150,
                    html: voucherHTML,
                    waitUntil: "domcontentloaded",
                    timeout: 1200000,
                    puppeteerArgs: {
                        waitUntil: "domcontentloaded",
                        timeout: 0,
                        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--headless', '--no-zygote', '--disable-gpu'],
                        headless: true,
                        ignoreHTTPSErrors: true,
                        cacheDirectory: path.join(path.resolve('./'), '.cache', 'puppeteer')
                    }
                }).then((ress) => {
                    console.log('The voucher image was created successfully!')
                    return ress;
                })

                var updatedGiftCard = await CustomerGiftCardService.updateCustomerGiftCard({
                    _id: createdGiftCard._id,
                    image: imagePath
                });
                if (updatedGiftCard && updatedGiftCard?._id) {
                    createdGiftCard = updatedGiftCard;
                }
            }

            giftCardData = await CustomerGiftCardService.getGiftCardDetail({ _id: createdGiftCard._id });
            await sendGiftVoucherMail(req.body, giftCardData);
            // console.log("voucherHTML >>> ", voucherHTML);
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: createdGiftCard,
            message: "Customer gift card created successfully!"
        });
    } catch (error) {
        console.log("createCustomerGiftCard catch >>> ", error);
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: error.message });
    }
}

exports.updateCustomerGiftCard = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" });
    }

    try {
        var amount = req.body?.amount || 0;
        var extensionCharge = req.body?.extension_charge || 0;
        // if (req.body?.location_id) {
        //     var location = await LocationService.getLocation(req.body.location_id);
        //     if (location && location?.company_id) {
        //         req.body.company_id = location?.company_id;
        //     }
        // }

        if (extensionCharge && amount) {
            var remaining = parseFloat(amount) - parseFloat(extensionCharge);
            req.body.remaining = parseFloat(remaining) || 0;
        }

        if (req.body?.extension_months) {
            req.body.extension_date = formatDate(null, "YYYY-MM-DD");
            req.body.end_date = getDateAddMonths(null, req.body.extension_months, "YYYY-MM-DD");
        }

        var updatedGiftCard = await CustomerGiftCardService.updateCustomerGiftCard(req.body);
        if (updatedGiftCard && updatedGiftCard?._id) {
            var companyId = updatedGiftCard?.company_id || "";
            var locationId = updatedGiftCard?.location_id || "";
            var customerId = updatedGiftCard?.customer_id || "";

            var giftCardData = await CustomerGiftCardService.getGiftCardDetail({ _id: updatedGiftCard._id });
            if (req.body?.extension_months) {
                var voucherHTML = await GiftVoucherHTMLService.generateVoucher(giftCardData);
                if (voucherHTML) {
                    var imgName = `img-${updatedGiftCard._id}.jpeg`;
                    var imagePath = `images/${dirName}/${imgName}`;
                    var highImgOutput = await nodeHtmlToImage({
                        output: rootPath + "/" + imagePath,
                        type: "jpeg",
                        quality: 150,
                        html: voucherHTML,
                        waitUntil: "domcontentloaded",
                        timeout: 1200000,
                        puppeteerArgs: {
                            waitUntil: "domcontentloaded",
                            timeout: 0,
                            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--headless', '--no-zygote', '--disable-gpu'],
                            headless: true,
                            ignoreHTTPSErrors: true,
                            cacheDirectory: path.join(path.resolve('./'), '.cache', 'puppeteer')
                        }
                    }).then((ress) => {
                        console.log('The voucher image was created successfully!')
                        return ress;
                    });
                }

                await GiftCardTransactionService.createGiftCardTransaction({
                    company_id: companyId,
                    location_id: locationId,
                    customer_gift_card_id: giftCardData._id,
                    customer_id: customerId,
                    date: new Date(),
                    action: "debit",
                    amount: extensionCharge,
                    total_amount: giftCardData?.remaining || 0,
                    description: `Gift card extended - ${giftCard.gift_code}`
                });
                await sendGiftVoucherMail(req.body, giftCardData);
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: updatedGiftCard,
            message: "Customer gift card updated successfully!"
        });
    } catch (error) {
        return res.status(200).json({ status: 200, flag: false, message: error.message });
    }
}

exports.removeCustomerGiftCard = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var deleted = await CustomerGiftCardService.deleteCustomerGiftCard(id);
        return res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (error) {
        return res.status(200).json({ status: 200, flag: false, message: error.message })
    }
}

// Currently used wordpress side
exports.getCompanyGiftCardDetails = async function (req, res, next) {
    try {
        var companyId = req.query?.company_id || "";
        var locationId = req.query?.location_id || "";

        var validation = false;
        var message = "Something went wrong!";

        if (!companyId) {
            validation = true;
            message = "Company Id must be present!";
        }

        if (validation) {
            return res.status(200).json({ status: 200, flag: false, message: message });
        }

        var companyData = null;
        var location = null;
        var locationsData = [];
        var settingLevel = "";

        var company = await CompanyService.getCompany(companyId);
        if (company && company?._id) {
            var locations = await LocationService.getLocationsOneHidden({ company_id: company._id, status: 1 });

            companyData = {
                _id: company._id,
                name: company?.name || "",
                image: company?.image || "",
                currency: company?.currency || "",
                gift_card_delivery_charge: company?.gift_card_delivery_charge || "",
                paypal_client_id: company?.paypal_client_id || "",
                payment_source: "company"
            }

            settingLevel = company?.gift_card_setting_level || "company";
            if (company?.gift_card_setting_level == "location" && locations?.length) {
                locations.map((item) => {
                    var locationItem = {
                        _id: item._id,
                        name: item?.name || "",
                        gift_card_delivery_charge: item?.gift_card_delivery_charge || "",
                        paypal_client_id: item?.paypal_client_id || "",
                        payment_source: settingLevel
                    }

                    if (!item?.paypal_client_id) {
                        locationItem.payment_source = "company";
                    }

                    locationsData.push(locationItem);
                });
            }
        }

        if (locationId && locationsData?.length) {
            var locData = locationsData.find((x) => x._id == locationId);
            if (locData && locData?._id) {
                location = {
                    _id: locData._id,
                    name: locData?.name || "",
                    gift_card_delivery_charge: locData?.gift_card_delivery_charge || "",
                    paypal_client_id: locData?.paypal_client_id || "",
                    payment_source: settingLevel
                }

                if (!locData?.paypal_client_id) {
                    location.payment_source = "company";
                }
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: companyData,
            location,
            locations: locationsData,
            setting_level: settingLevel,
            message: "Gift card setting details received successfully!"
        });
    } catch (error) {
        console.log("getCompanyGiftCardDetails catch >>> ", error);
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: error.message });
    }
}

async function sendGiftVoucherMail(params, giftCard = null) {
    try {
        if (giftCard && giftCard?._id && params?.company_id) {
            var company = await CompanyService.getCompany(params.company_id);
            var location = null;
            var todayDate = formatDate(null, "YYYY-MM-DD");
            var bcc = "";
            var companyWebsite = "";

            if (company?.email) { bcc = company.email; }
            if (company?.contact_link) { companyWebsite = company.contact_link; }

            if (giftCard?.created_location_id) {
                var createdLocationId = giftCard?.created_location_id?._id || giftCard.created_location_id;
                location = await LocationService.getLocationOne({ _id: createdLocationId });
            }

            if (location && location?._id && location?.email) {
                bcc = location.email;
            }

            var amount = parseFloat(giftCard?.amount || 0);
            var deliveryCharge = parseFloat(giftCard?.delivery_charge || 0);
            var total = amount + deliveryCharge;
            total = getDecimalFormat(total);

            var serviceNames = "";
            if (giftCard?.service_ids && giftCard.service_ids?.length) {
                var serNames = giftCard.service_ids.map((item) => {
                    return item?.name || ""
                });

                if (serNames && serNames?.length) { serviceNames = serNames.join(", "); }
            }

            var toMail = {
                site_url: process.env.API_URL,
                link_url: process.env.SITE_URL,
                front_url: process.env.FRONT_URL,
                company_name: company?.name || "",
                company_website: companyWebsite,
                company_logo: company?.image || "",
                location_name: location?.name || "",
                location_contact: location?.contact_number || "",
                currency: company?.currency?.symbol || "£",
                data: giftCard,
                date: todayDate || "",
                type: giftCard?.type || "",
                amount: amount,
                total: total,
                sr_no: giftCard?.sr_no || "",
                voucher_image: giftCard?.image || "",
                end_date: giftCard?.end_date || "",
                old_end_date: giftCard?.old_end_date || "",
                extension_date: giftCard?.extension_date || "",
                gift_code: giftCard?.gift_code || "",
                start_date: giftCard?.start_date || "",
                delivery_charge: deliveryCharge,
                billing_address: giftCard?.billing_address || null,
                shipping_address: giftCard?.shipping_address || null,
                transaction_id: giftCard?.transaction_id || null,
                remaining: giftCard?.remaining || 0,
                extension_charge: giftCard?.extension_charge || 0,
                service_names: serviceNames,
                deliverable: giftCard?.type == "physical" || false,
                bcc: bcc
            };

            var to = giftCard?.billing_address?.email || ""
            var name = giftCard?.billing_address?.name || ""
            var subject = "Gift voucher purchased at " + company?.name;
            if (location?.name) { subject += ` ${location.name}`; }

            var temFile = "gift_voucher.hjs";
            html = "";

            // console.log("sendGiftVoucherMail >>> ", toMail, to);
            if (giftCard?.billing_address && giftCard.billing_address?.email) {
                var file_path = "";
                var file_name = "";
                if (giftCard?.image) {
                    file_path = '/public/' + giftCard?.image;
                    file_name = getFileNamePath(giftCard.image);
                }

                var sendEmail = await SendEmailSmsService.sendSmsLogMail(to, name, subject, temFile, html, toMail, file_path, file_name, 'transaction', giftCard?.location_id, company?._id);

                var emailData = {
                    company_id: company?._id,
                    location_id: giftCard?.location_id,
                    client_id: null,
                    subject: subject,
                    name: name,
                    type: "single",
                    file_type: "gift_voucher",
                    temp_file: temFile,
                    html: '',
                    data: toMail,
                    date: Date(),
                    to_email: to,
                    status: "Sent",
                    response: null,
                    response_status: 'Sent',
                    email_type: "transaction"
                }

                if (giftCard?.buyer_customer_id) {
                    emailData.client_id = giftCard?.buyer_customer_id?._id || giftCard?.buyer_customer_id;
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
        //Client booking mail end
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.getCustomerGiftCardBalance = async function (req, res, next) {
    try {
        var companyId = req.body?.company_id || "";
        var locationId = req.body?.location_id || "";
        var customerId = req.body?.customer_id || "";
        var serviceIds = req.body?.service_ids || null;

        var validation = false;
        var message = "Something went wrong!";

        if (!companyId) {
            validation = true;
            message = "Company Id must be present!";
        } else if (!locationId) {
            validation = true;
            message = "Location Id must be present!";
        } else if (!customerId) {
            validation = true;
            message = "Customer Id must be present!";
        } else if (serviceIds && !Array.isArray(serviceIds)) {
            validation = true;
            message = "Service Ids must be array!";
        } else if (serviceIds && !serviceIds?.length) {
            validation = true;
            message = "Service Ids must be not blank!";
        }

        if (validation) {
            return res.status(200).json({ status: 200, flag: false, message: message });
        }

        var custGiftData = await getGiftCardBalance(req.body);

        return res.status(200).json({
            status: 200,
            ...custGiftData
        });
    } catch (error) {
        console.log("getCustomerGiftCardBalance catch >>> ", error);
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: error.message });
    }
}

exports.redeemCustomerGiftCard = async function (req, res, next) {
    try {
        var companyId = req.body?.company_id || "";
        var locationId = req.body?.location_id || "";
        var customerId = req.body?.customer_id || "";
        var giftCode = req.body?.gift_code || "";
        var serviceIds = req.body?.service_ids || null;

        var validation = false;
        var message = "Something went wrong!";

        if (!companyId) {
            validation = true;
            message = "Company Id must be present!";
        } else if (!locationId) {
            validation = true;
            message = "Location Id must be present!";
        } else if (!customerId) {
            validation = true;
            message = "Customer Id must be present!";
        } else if (!giftCode) {
            validation = true;
            message = "Gift code must be present!";
        } else if (serviceIds && !Array.isArray(serviceIds)) {
            validation = true;
            message = "Service Ids must be array!";
        } else if (serviceIds && !serviceIds?.length) {
            validation = true;
            message = "Service Ids must be not blank!";
        }

        if (validation) {
            return res.status(200).json({ status: 200, flag: false, message: message });
        }

        var valid = false;
        var message = "";
        var codeMessage = "";
        var pastRedeemed = false;
        var globalGiftCard = null;
        var currentComName = "";

        var currentLocation = await LocationService.getLocationOne({ _id: locationId });
        if (currentLocation?.company_id?.name) {
            currentComName = currentLocation.company_id.name;
        }

        var todayDate = formatDate(null, 'YYYY-MM-DD');

        var existQuery = {
            status: 1,
            is_redeemed: true,
            gift_code: giftCode
        };
        var redeemedRecord = await CustomerGiftCardService.getGiftCardOne(existQuery, "_id", -1);
        if (redeemedRecord && redeemedRecord?._id) {
            var custGiftData = await getGiftCardBalance(req.body);
            pastRedeemed = true;
            var redmdComName = redeemedRecord?.company_id?.name || "";
            var redmdLocName = redeemedRecord?.location_id?.name || "";
            codeMessage = `It appears that a gift voucher code has been used. If it is in the correct account, your gift voucher balance will be used towards your appointment. If not, you may have entered the wrong code. Contact ${redmdComName}${redmdLocName ? `, ${redmdLocName}` : ''} for help!`;

            return res.status(200).json({
                status: 200,
                ...custGiftData,
                valid,
                code_message: codeMessage,
                past_redeemed: pastRedeemed,
                customerGiftCard: redeemedRecord,
                message: "Gift card already redeemed!"
            });
        }

        var querySimple = { gift_code: giftCode, status: 1 }
        var query = { gift_code: giftCode, end_date: { $gte: todayDate }, status: 1 }
        query['$or'] = [
            { $and: [{ company_id: companyId }, { location_id: locationId }] },
            { $and: [{ company_id: companyId }, { location_id: null }] }
        ];

        var giftCard = await CustomerGiftCardService.getGiftCardOne(query, "_id", -1) || null;
        if (giftCard && giftCard?._id && giftCard?.gift_code) {
            valid = true;
            codeMessage = `The ${giftCode} has been successfully redeemed to your booking!`;
            await CustomerGiftCardService.updateCustomerGiftCard({
                _id: giftCard._id,
                redeem_location_id: locationId,
                customer_id: customerId,
                is_redeemed: true
            });

            await GiftCardTransactionService.createGiftCardTransaction({
                company_id: companyId,
                location_id: locationId,
                customer_gift_card_id: giftCard._id,
                customer_id: customerId,
                date: new Date(),
                action: "credit",
                amount: giftCard?.remaining || 0,
                total_amount: giftCard?.remaining || 0,
                description: `Gift card redeem - ${giftCard.gift_code}`
            });

            giftCard = await CustomerGiftCardService.getGiftCardOne({ _id: giftCard._id });

            message = "Gift card redeemed successfully!";
        }

        var custGiftData = await getGiftCardBalance(req.body);
        if (!giftCard || !giftCard?._id) {
            valid = false;
            codeMessage = `It seems the code you have entered is incorrect. Please retry with the same code that you have received as text/email from ${currentComName}. You can retry by copying & pasting the same code from the text/email. error could persist as there may be space at the begining, middle, or at the end of the code. please try removing the space (if any).`;
            message = codeMessage;
            globalGiftCard = await CustomerGiftCardService.getGiftCardOne(querySimple, "_id", -1) || null;
            if (globalGiftCard && globalGiftCard?._id) {
                var comId = globalGiftCard?.company_id?._id || globalGiftCard?.company_id || "";
                var locId = globalGiftCard?.location_id?._id || globalGiftCard?.location_id || "";
                var comName = globalGiftCard?.company_id?.name || "";
                var locName = globalGiftCard?.location_id?.name || "";
                var startDate = globalGiftCard?.start_date || "";
                var endDate = globalGiftCard?.end_date || "";
                if (endDate) { endDate = formatDate(endDate, 'YYYY-MM-DD'); }
                if (startDate) { startDate = formatDate(startDate, 'YYYY-MM-DD'); }
                if ((comId != companyId) && comName) {
                    codeMessage = `Gift card code that you have entered is valid at ${comName}`;
                    message = codeMessage;
                } else if ((locId != locationId) && locName) {
                    codeMessage = `We are sorry but the Gift Card Code you are trying to redeem is exclusively valid at ${locName}, ${comName}.`;
                    message = codeMessage;
                } else if (endDate && checkIsBeforeDate(null, endDate)) {
                    codeMessage = `Gift card code you have entered is now  expired. It was valid between ${startDate}, ${endDate}.`;
                    message = codeMessage;
                }
            }
        }

        return res.status(200).json({
            status: 200,
            ...custGiftData,
            valid,
            code_message: codeMessage,
            past_redeemed: pastRedeemed,
            customerGiftCard: giftCard,
            globalGiftCard,
            message: message
        });
    } catch (error) {
        console.log("redeemCustomerGiftCard catch >>> ", error);
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: error.message });
    }
}

exports.debitGiftCardBalance = async function (req, res, next) {
    try {
        var companyId = req.body?.company_id || "";
        var locationId = req.body?.location_id || "";
        var customerId = req.body?.customer_id || "";
        var amount = Number(req.body?.amount || 0);
        var serviceIds = req.body?.service_ids || null;

        var validation = false;
        var message = "Something went wrong!";

        if (!companyId) {
            validation = true;
            message = "Company Id must be present!";
        } else if (!locationId) {
            validation = true;
            message = "Location Id must be present!";
        } else if (!customerId) {
            validation = true;
            message = "Customer Id must be present!";
        } else if (!amount) {
            validation = true;
            message = "Amount must be present!";
        } else if (serviceIds && !Array.isArray(serviceIds)) {
            validation = true;
            message = "Service Ids must be array!";
        } else if (serviceIds && !serviceIds?.length) {
            validation = true;
            message = "Service Ids must be not blank!";
        }

        if (validation) {
            return res.status(200).json({ status: 200, flag: false, message: message });
        }

        var giftCards = [];
        var transactionIds = [];
        var custGiftData = await getGiftCardBalance(req.body);
        if (custGiftData?.data && custGiftData.data?.length) { giftCards = custGiftData.data; }
        if (giftCards && giftCards?.length) {
            var debitData = await debitCustomerGiftCardBalance(req.body);
            if (debitData?.transaction_ids && debitData.transaction_ids?.length) {
                transactionIds = debitData.transaction_ids;
            }
        }

        var custGiftData = await getGiftCardBalance(req.body);

        return res.status(200).json({
            status: 200,
            flag: false,
            message: message,
            transaction_ids: transactionIds,
            ...custGiftData
        });
    } catch (error) {
        console.log("creditDebitGiftCardBalance catch >>> ", error);
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: error.message });
    }
}

exports.creditGiftCardBalance = async function (req, res, next) {
    try {
        var companyId = req.body?.company_id || "";
        var locationId = req.body?.location_id || "";
        var transactionIds = req.body?.transaction_ids || [];

        var validation = false;
        var message = "Something went wrong!";

        if (!companyId) {
            validation = true;
            message = "Company Id must be present!";
        } else if (!locationId) {
            validation = true;
            message = "Location Id must be present!";
        } else if (!transactionIds) {
            validation = true;
            message = "Transaction Ids must be present!";
        } else if (!Array.isArray(transactionIds)) {
            validation = true;
            message = "Transaction Ids must be an array!";
        } else if (!transactionIds?.length) {
            validation = true;
            message = "Transaction Ids must be not blank!";
        }

        if (validation) {
            return res.status(200).json({ status: 200, flag: false, message: message });
        }

        await creditCustomerGiftCardBalance(req.body);

        var custGiftData = await getGiftCardBalance(req.body);

        return res.status(200).json({
            status: 200,
            flag: true,
            message: message,
            ...custGiftData
        });
    } catch (error) {
        console.log("creditGiftCardBalance catch >>> ", error);
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: error.message });
    }
}

/* Handle customer gift card expire (InActive) */
async function checkExpireCustomerGiftCard() {
    try {
        var todayDate = formatDate(null, 'YYYY-MM-DD');
        var query = {
            status: 1,
            end_date: { $lte: todayDate }
        };
        var customerGiftCards = await CustomerGiftCardService.getCustomerGiftCardsOne(query, "end_date", 1) || [];
        if (customerGiftCards && customerGiftCards?.length) {
            for (let i = 0; i < customerGiftCards.length; i++) {
                let customerGiftCard = customerGiftCards[i];
                if (customerGiftCard && customerGiftCard?._id) {
                    var companyId = customerGiftCard?.company_id?._id || customerGiftCard?.company_id || null;
                    var locationId = customerGiftCard?.location_id?._id || customerGiftCard?.location_id || null;
                    if (!locationId) {
                        locationId = customerGiftCard?.redeem_location_id?._id || customerGiftCard?.redeem_location_id || null;
                    }

                    var customerId = customerGiftCard?.customer_id?._id || customerGiftCard?.customer_id || null;
                    var customerGiftCardId = customerGiftCard._id;

                    var giftTansact = await GiftCardTransactionService.createGiftCardTransaction({
                        company_id: companyId,
                        location_id: locationId,
                        customer_gift_card_id: customerGiftCardId,
                        customer_id: customerId,
                        date: new Date(),
                        action: "debit",
                        amount: customerGiftCard?.remaining,
                        total_amount: 0,
                        description: `Gift card expired - ${customerGiftCard.gift_code}`
                    });

                    if (giftTansact && giftTansact?._id) {
                        await CustomerGiftCardService.updateCustomerGiftCard({ _id: customerGiftCardId, status: 0 });
                    }
                }
            }
        }

        return { flag: true, message: "Customer gift card expire update successfully!" }
    } catch (e) {
        console.log("checkExpireCustomerGiftCard Error >>> ", e)
        return { flag: false, message: e.message }
    }
}

cron.schedule("30 0 * * *", async () => {
    await checkExpireCustomerGiftCard()
});
/* /Handle customer gift card expire (InActive) */
