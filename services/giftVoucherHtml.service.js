var rootPath = require('path').resolve('public');

var apiUrl = process.env?.API_URL || "";

const { formatDate } = require('../helper');

const generateVoucher = async (data = null) => {
    try {
        var curveBGImg = apiUrl + "/logos/curve-bg.svg";
        var bGSrTagImg = apiUrl + "/logos/bg-serial-tag.png";

        var companyData = data?.company_id || null;
        var createdLocData = data?.created_location_id || null;
        var currency = companyData?.currency?.symbol || "£"
        var companyLogo = apiUrl + "/" + companyData?.image;
        var companyWebsite = companyData?.contact_link || "";
        var giftCardTermsCon = companyData?.gift_card_terms_condition || "";
        if (createdLocData?.gift_card_terms_condition) {
            giftCardTermsCon = createdLocData.gift_card_terms_condition;
        }

        var serviceNames = "";
        if (data?.service_ids && data.service_ids?.length) {
            var serNames = data.service_ids.map((item) => {
                return item?.name || ""
            });

            if (serNames && serNames?.length) { serviceNames = serNames.join(", "); }
        }

        var amount = data?.amount || "";
        var srNo = data?.sr_no || "";
        var giftCode = data?.gift_code || "";
        var validTill = formatDate(data?.end_date, "DD MMMM YYYY");

        var html = ``;
        html += `<html>`;
        html += `<head>`;
        html += `<style>`;
        html += `@font-face {
            font-family: "Josefin Sans";
            src: url('${apiUrl}/fonts/JosefinSans.woff2');
        }`;
        html += `@font-face {
            font-family: "KaiseiTokumin-ExtraBold";
            src: url('${apiUrl}/fonts/KaiseiTokumin-ExtraBold.woff2');
            font-weight: 800;
        }`;
        html += `body {
            margin: 20px 0;
            width: 960px; 
            height: 400px;
        }`;
        html += `</style>`;
        html += `</head>`;
        html += `<body>`;
        html += `<div class="gift-voucher" style="width: 100%; height: 100%; background: #9A563A;margin: 0 auto;">`;
        html += `<div class="content-wrap" style="display: flex;flex-wrap: wrap; height: 100%;">`;
        html += `<div class="price-content" style="width: 65.75%; display: inline-block; padding: 15px 15px 20px 20px; text-align: left; box-sizing: border-box; position: relative; height: 400px;">`;
        html += `<div class="content-wrap" style="height: 100%;">`;
        html += `<span class="price-text" style="color: #FFF; display: block;">`;
        html += `<span class="price" style="font-family: 'KaiseiTokumin-ExtraBold'; font-weight: 700; font-size: 58px; line-height: 60px;">${currency}${amount}</span>`;
        html += `<span class="text" style="font-family: 'KaiseiTokumin-ExtraBold'; font-weight: 700; font-size: 36px; line-height: 5px; padding-left: 5px;"> | Gift Voucher</span>`;
        html += `</span>`;

        html += `<span class="valid-date" style="display: block; font-family: 'Josefin Sans'; font-weight: 500; font-style: italic; letter-spacing: 4px; font-size: 18px; padding-top: 20px; line-height: normal; color: #FFF;">Valid till : ${validTill}</span>`;

        if (serviceNames) {
            html += `<span class="services" style="display: block; font-family: 'Josefin Sans', sans-serif; font-weight: 500; letter-spacing: 1px; font-size: 13px; padding-top: 12px; line-height: normal; color: #FFF;">Services : ${serviceNames}</span>`;
        }

        if (giftCardTermsCon) {
            html += `<span class="title" style="display: block; padding-top: 15px; font-family: 'Josefin Sans'; font-weight: 700; text-transform: uppercase; color: #FFF; letter-spacing: 1px;">TERMS & CONDITIONS</span>`;
            html += `<div class="content" style="font-family: 'Josefin Sans'; font-weight: 500; color: #FFF; font-size: 13px; line-height: 21px; padding-top: 8px; letter-spacing: 1px;">${giftCardTermsCon}</div>`;
        }

        html += `<span class="serial" style="display: block; font-family: 'KaiseiTokumin-ExtraBold'; font-weight: 700; font-size: 24px; line-height: normal; color: #FFF; padding-top: 15px; position: absolute; left: 20px; right: auto; bottom: 20px;">Sr No. ${srNo}</span>`;
        html += `</div>`;
        html += `</div>`;

        html += `<div class="serialno-logo" style="width: 33.40%; display: inline-block; background-image: url('${curveBGImg}'); background-repeat: no-repeat; background-size: cover; text-align: right; padding: 20px 8px 0px 0; height: 400px">`;
        html += `<div class="content-wrap" style="height: 100%;">`;
        html += `<span class="serialno" style="border: 2px dashed #9A563A; display: block; width: max-content; margin: 0 16px 0 0; padding: 3px 5px 5px; font-family: 'KaiseiTokumin-ExtraBold'; font-weight: 700; float: right;">`;
        html += `<span class="no" style="font-size: 20px; line-height: 50px; color: #fff; background-image: url('${bGSrTagImg}'); background-repeat: no-repeat; background-size: cover; display: block; width: 170px; height: 53px; text-align: center;">${giftCode}</span>`;
        html += `</span>`;

        html += `<span class="logo" style="width: 180px; overflow: hidden; display: block; margin: 0 16px 0 0; padding: 30px 0 60px; float: right;">`;
        html += `<img src="${companyLogo}"  alt="" style="width: 100%;" />`;
        html += `</span>`;

        html += `<span class="website" style="display: block; color: #9A563A; clear: both; margin: 0 8px 0 0;padding-bottom: 15px;">`;
        html += `<a href="${companyWebsite}" style="font-family: 'Josefin Sans'; font-weight: 500; font-size: 16px; line-height: normal; letter-spacing: 2px; text-decoration: none; color: #9A563A;">${companyWebsite}</a>`;
        html += `</span>`;
        html += `</div>`;

        html += `</div>`;
        html += `</div>`;
        html += `</div>`;
        html += `</body>`;
        html += `</html>`;

        // console.log("html", html);
        // console.log("generateVoucher", data);
        return html;
    } catch (e) {
        console.log("generateVoucher Error >>> ", e)
        // return a Error message describing the reason 
        throw Error('Error occur while Generate voucher image');
    }
}

module.exports = {
    generateVoucher
}