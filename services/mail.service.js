// Main Mail file with all configurabled data
var dateFormat = require('dateformat');
var ObjectId = require('mongodb').ObjectId;

var fs = require('fs');
var Hogan = require('hogan.js');
var nodemailer = require('nodemailer');
var path = require('path').resolve('./'); //get main dir path
var inlineBase64 = require('nodemailer-plugin-inline-base64');

var CompanyService = require('./company.service');
var LocationService = require('./location.service');
var EmailCountService = require('./emailCount.service');

function base64_encode(file) {
	var bitmap = fs.readFileSync(file);
	//console.log("bitmap",bitmap)
	return new Buffer(bitmap).toString('base64');
}

// Async function to get the Test List
exports.sendEmailAwait = async function (to, name, subject, temFile, html, text, type, location_id = '', company_id = '') {
	try {
		// for given dynamic template files and compile it.
		var readTemplate = ""
		if (html) {
			var writeTemplate = fs.writeFileSync('./templates/' + temFile, html, 'utf-8');
			readTemplate = fs.readFileSync('./templates/' + temFile, 'utf-8');
		}

		if (!html) {
			readTemplate = fs.readFileSync('./templates/backup/' + temFile, 'utf-8');
		}

		var compiledTemplate = Hogan.compile(readTemplate);

		var smtpData = await getSmtpDetails(type, location_id, company_id);
		if (smtpData && smtpData.smtp_from && smtpData.smtp_host && smtpData.smtp_port && smtpData.smtp_username && smtpData.smtp_password) {
			var from = smtpData.smtp_from;
			var host = smtpData.smtp_host;
			var port = smtpData.smtp_port;
			var userName = smtpData.smtp_username;
			var password = smtpData.smtp_password;

			var transport = nodemailer.createTransport({
				host: host,
				port: port,
				auth: {
					user: userName,
					pass: password
				}
			});

			const mailOptions = {
				from: `${from} ${userName}`,
				//to: `(${name} ${to})`,
				to: to,
				subject: subject,
				//bcc: 'sumerpal@gmail.com,info@calista-beauty.com',
				headers: {
					'Content-Type': "text/html; charset=UTF-8"
				},
				html: compiledTemplate.render({ text })
			}

			var result = null;
			var requestCall = new Promise((resolve, reject) => {
				transport.sendMail(mailOptions, function (error, info) {
					if (error) {
						result = {
							flag: false,
							status: "Failed",
							response: error
						}
						console.log("error is " + error);
						resolve(false); // or use rejcet(false) but then you will have to handle errors
					}
					else {
						result = {
							flag: true,
							status: "Sent",
							response: info
						};
						console.log('Email sent: ' + info.response);
						resolve(true);
					}
				});
			});

			var mailResult = await requestCall.then((res) => {
				return result;
			}).catch((error) => {
				console.log(error)
			})

			await increaseEmailCount(userName, type, location_id);
			//console.log('mailResult', mailResult)
			return mailResult;
		}

		//  await transport.sendMail(mailOptions, async function (error, info) {
		// 	if (error) {
		// 		console.log('sendMail Error >>> ', error)
		// 		return error;
		// 	} else {
		// 		console.log('sendMail Sent response >>> ', info?.response)
		// 		return info;
		// 	}
		// })
	} catch (e) {
		console.log("sendEmail Error >>> ", e)
	}
}

// Async function to get the Test List
exports.sendEmail = async function (to, name, subject, temFile, html, text, type, location_id = '', company_id = '') {
	try {
		// for given dynamic template files and compile it.
		var readTemplate = "";
		if (html) {
			var writeTemplate = fs.writeFileSync('./templates/' + temFile, html, 'utf-8');
			readTemplate = fs.readFileSync('./templates/' + temFile, 'utf-8');
		}

		if (!html) {
			readTemplate = fs.readFileSync('./templates/backup/' + temFile, 'utf-8');
		}

		var compiledTemplate = Hogan.compile(readTemplate);

		var smtpData = await getSmtpDetails(type, location_id, company_id);
		if (smtpData && smtpData.smtp_from && smtpData.smtp_host && smtpData.smtp_port && smtpData.smtp_username && smtpData.smtp_password) {
			var from = smtpData.smtp_from;
			var host = smtpData.smtp_host;
			var port = smtpData.smtp_port;
			var userName = smtpData.smtp_username;
			var password = smtpData.smtp_password;

			var transport = nodemailer.createTransport({
				host: host,
				port: port,
				auth: {
					user: userName,
					pass: password
				}
			});

			const mailOptions = {
				from: `${from} ${userName}`,
				//to: `(${name} ${to})`,
				to: to,
				subject: subject,
				//bcc: 'sumerpal@gmail.com,info@calista-beauty.com',
				headers: {
					'Content-Type': "text/html; charset=UTF-8"
				},
				html: compiledTemplate.render({ text })
			}

			await transport.sendMail(mailOptions, async function (error, info) {
				if (error) {
					console.log('sendMail Error >>> ', error)
					return error;
				} else {
					console.log('sendMail Sent response >>> ', info?.response)
					return info;
				}
			})

			await increaseEmailCount(userName, type, location_id);
		}

		return false;
	} catch (e) {
		console.log("sendEmail Error >>> ", e)
	}
}

exports.sendEmailToMultipleRecipients = async function (to, name, subject, temFile, html, text, unique_id, type, location_id = '', company_id = '') {
	try {
		//console.log('sendEmail html',html)
		// for given dynamic template files and compile it.
		var readTemplate = "";
		if (html) {
			var writeTemplate = fs.writeFileSync('./templates/' + temFile, html, 'utf-8');
			readTemplate = fs.readFileSync('./templates/' + temFile, 'utf-8');
		}

		if (!html) {
			readTemplate = fs.readFileSync('./templates/backup/' + temFile, 'utf-8');
		}

		var compiledTemplate = Hogan.compile(readTemplate);

		var smtpData = await getSmtpDetails(type, location_id, company_id);
		if (smtpData && smtpData.smtp_from && smtpData.smtp_host && smtpData.smtp_port && smtpData.smtp_username && smtpData.smtp_password) {
			var from = smtpData.smtp_from;
			var host = smtpData.smtp_host;
			var port = smtpData.smtp_port;
			var userName = smtpData.smtp_username;
			var password = smtpData.smtp_password;

			let transport = nodemailer.createTransport({
				host: host,
				port: port,
				auth: {
					user: userName,
					pass: password
				}
			});

			var unique_id = (new Date()).getTime().toString(36);
			//console.log('unique_id',unique_id)
			transport.use('compile', inlineBase64({ cidPrefix: 'somePrefix_' + unique_id }));

			const mailOptions = {
				from: `${from} ${userName}`,
				to: userName,
				bcc: to,
				subject: subject,
				headers: 'Content-Type: text/html; charset=UTF-8',
				html: compiledTemplate.render({ text })
			}

			transport.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log('error', error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			})

			await increaseEmailCount(userName, type, location_id);
		}
	} catch (e) {
		console.log("sendEmailToMultipleRecipients e ", e);
		console.log("\n\nMail update Issaues >>>>>>>>>>>>>>\n\n");
	}
}

exports.sendEmailFile = async function (to, name, subject, temFile, html, text, file, file_name, type, location_id = '', company_id = '') {
	try {
		// for given dynamic template files and compile it.
		var readTemplate = "";
		if (html) {
			var writeTemplate = fs.writeFileSync('./templates/' + temFile, html, 'utf-8');
			readTemplate = fs.readFileSync('./templates/' + temFile, 'utf-8');
		}

		if (!html) {
			readTemplate = fs.readFileSync('./templates/backup/' + temFile, 'utf-8');
		}

		var compiledTemplate = Hogan.compile(readTemplate);

		var smtpData = await getSmtpDetails(type, location_id, company_id);
		if (smtpData && smtpData.smtp_from && smtpData.smtp_host && smtpData.smtp_port && smtpData.smtp_username && smtpData.smtp_password) {
			var from = smtpData.smtp_from;
			var host = smtpData.smtp_host;
			var port = smtpData.smtp_port;
			var userName = smtpData.smtp_username;
			var password = smtpData.smtp_password;

			let transport = nodemailer.createTransport({
				host: host,
				port: port,
				auth: {
					user: userName,
					pass: password
				}
			});

			//var imageFile =  path + '/public/images/front-logo.svg';
			//let data_base64 = base64_encode(imageFile); 

			const mailOptions = {
				from: `${from} ${userName}`,
				to: to,
				//to: `(${name} ${to})`,
				subject: subject,
				// html: text
				//bcc: 'sumerpal@gmail.com',
				html: compiledTemplate.render({ text }),
				attachments: [
					{
						filename: file_name,
						//path: path + '/public/images/front-logo.svg',https://api.appointgem.com/images/front-logo.svg
						path: path + file,
						cid: 'uniq-' + file_name
					}
				]
			}

			if (text?.bcc) { mailOptions.bcc = text.bcc; }
			// console.log("mailOptions ", mailOptions);

			transport.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Email file sent: ' + info.response);
				}
			})

			increaseEmailCount(userName, type, location_id);
		}
	} catch (e) {
		console.log("e ", e);
		console.log("\n\nMail update Issaues >>>>>>>>>>>>>>\n\n");
	}
}

exports.sendEmailMultipleFiles = async function (to, name, subject, temFile, html, text, file_name_arr, type, location_id = '', company_id = '') {
	try {
		var readTemplate = "";
		if (html) {
			var writeTemplate = fs.writeFileSync('./templates/' + temFile, html, 'utf-8');
			readTemplate = fs.readFileSync('./templates/' + temFile, 'utf-8');
		}

		if (!html) {
			readTemplate = fs.readFileSync('./templates/backup/' + temFile, 'utf-8');
		}

		var compiledTemplate = Hogan.compile(readTemplate);

		var smtpData = await getSmtpDetails(type, location_id, company_id);

		if (smtpData && smtpData.smtp_from && smtpData.smtp_host && smtpData.smtp_port && smtpData.smtp_username && smtpData.smtp_password) {
			var from = smtpData.smtp_from;
			var host = smtpData.smtp_host;
			var port = smtpData.smtp_port;
			var userName = smtpData.smtp_username;
			var password = smtpData.smtp_password;

			let transport = nodemailer.createTransport({
				host: host,
				port: port,
				auth: {
					user: userName,
					pass: password
				}
			});

			const mailOptions = {
				from: `${from} ${userName}`,
				to: to,
				//to: `(${name} ${to})`,
				//bcc: process.env.ADMIN_EMAIL,
				//bcc: 'sumerpal@gmail.com',
				subject: subject,
				html: compiledTemplate.render({ text }),
				attachments: file_name_arr
			}
			//console.log("file_name_arr ",file_name_arr)

			transport.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			})

			await increaseEmailCount(userName, type, location_id);
		}
	} catch (e) {
		console.log("e ", e)
		console.log("\n\nMail update Issaues >>>>>>>>>>>>>>\n\n");
	}
}

const increaseEmailCount = async function (from_email, type, location_id) {
	if (type == 'marketing' && location_id) {
		var date = dateFormat(new Date(), "yyyy-mm-dd");
		var query = { from_email: from_email, location_id: ObjectId(location_id), date: date }

		var fromCount = await EmailCountService.getEmailCountsSpecific(query)

		if (!fromCount || fromCount?.length == 0) {
			await EmailCountService.createEmailCount(query)
		}

		await EmailCountService.increaseEmailCount(query);
	}

	return true;
}

const getSmtpDetails = async function (type, location_id, company_id) {
	try {
		if (type == 'transaction') {
			var customParameter = {
				smtp_from: process.env?.SMTP_FROM || "AppointGem",
				smtp_host: process.env?.SMTP_HOST,
				smtp_port: process.env?.SMTP_PORT,
				smtp_username: process.env?.SMTP_USERNAME,
				smtp_password: process.env?.SMTP_PASSWORD
			};

			if (location_id) {
				var location = await LocationService.getLocationCompanySmtpDetail({ _id: location_id });
				if (location && location?.smtp_from && location?.smtp_host && location?.smtp_port && location?.smtp_username && location?.smtp_password) {
					customParameter.smtp_from = location?.smtp_from;
					customParameter.smtp_host = location?.smtp_host;
					customParameter.smtp_port = location?.smtp_port;
					customParameter.smtp_username = location?.smtp_username;
					customParameter.smtp_password = location?.smtp_password;

					return customParameter;
				} else if (location && location?.company_id && location?.company_id?.smtp_from && location?.company_id?.smtp_host && location?.company_id?.smtp_port && location?.company_id?.smtp_username && location?.company_id?.smtp_password) {
					customParameter.smtp_from = location?.company_id?.smtp_from;
					customParameter.smtp_host = location?.company_id?.smtp_host;
					customParameter.smtp_port = location?.company_id?.smtp_port;
					customParameter.smtp_username = location?.company_id?.smtp_username;
					customParameter.smtp_password = location?.company_id?.smtp_password;

					return customParameter;
				}
			} else if (company_id) {
				var company = await CompanyService.getCompanySmtpDetail({ _id: location_id });
				if (company && company?.smtp_from && company?.smtp_host && company?.smtp_port && company?.smtp_username && company?.smtp_password) {
					customParameter.smtp_from = company?.smtp_from;
					customParameter.smtp_host = company?.smtp_host;
					customParameter.smtp_port = company?.smtp_port;
					customParameter.smtp_username = company?.smtp_username;
					customParameter.smtp_password = company?.smtp_password;

					return customParameter;
				}
			}

			return customParameter
		} else if (type == 'marketing') {
			var date = dateFormat(new Date(), "yyyy-mm-dd");
			var email_limit = process.env?.EMAIL_MAX_LIMIT || 200;

			if (location_id) {

				var emailQuery = { location_id: ObjectId(location_id), date: date, count: { $gte: email_limit } };
				var exceedEmail = await EmailCountService.getLimitExceedEmail(emailQuery);

				var location = await LocationService.getLocationMultipleSmtpDetail({ _id: location_id });
				if (location && location.smtp_setting && location.smtp_setting.length > 0) {
					if (exceedEmail && exceedEmail.length > 0) {
						location.smtp_setting = location.smtp_setting.filter(md => exceedEmail.every(fd => fd != md.username));
					}

					var randomIndex = randomIntFromInterval(0, location.smtp_setting.length);
					randomIndex = randomIndex > 0 ? randomIndex - 1 : randomIndex;

					if (location.smtp_setting[randomIndex]) {
						var smtp_setting = location.smtp_setting[randomIndex];
						var customParameter = {
							smtp_from: smtp_setting?.from,
							smtp_host: smtp_setting?.host,
							smtp_port: smtp_setting?.port,
							smtp_username: smtp_setting?.username,
							smtp_password: smtp_setting?.password
						};

						return customParameter;
					}
				}

			} else if (company_id) {
				var emailQuery = { company_id: ObjectId(company_id), location_id: null, date: date, count: { $gte: email_limit } };
				var exceedEmail = await EmailCountService.getLimitExceedEmail(emailQuery);

				var company = await CompanyService.getComanyMultipleSmtpDetail({ _id: company_id });
				if (company && company.smtp_setting && company.smtp_setting.length > 0) {
					if (exceedEmail && exceedEmail.length > 0) {
						company.smtp_setting = company.smtp_setting.filter(md => exceedEmail.every(fd => fd != md.username));
					}

					var randomIndex = randomIntFromInterval(0, company.smtp_setting.length);
					randomIndex = randomIndex > 0 ? randomIndex - 1 : randomIndex;
					console.log('randomIndex', randomIndex, company.smtp_setting[randomIndex])
					if (company.smtp_setting[randomIndex]) {
						var smtp_setting = company.smtp_setting[randomIndex];
						var customParameter = {
							smtp_from: smtp_setting?.from,
							smtp_host: smtp_setting?.host,
							smtp_port: smtp_setting?.port,
							smtp_username: smtp_setting?.username,
							smtp_password: smtp_setting?.password
						};
						console.log('customParameter', customParameter);

						return customParameter;
					}
				}
			}

		}

		return null;
	} catch (e) {
		console.log(e);
		return null;
	}
}

function randomIntFromInterval(min, max) { // min and max included 
	return Math.floor(Math.random() * (max - min + 1) + min)
}

exports.sendEmail2 = async function (to, name, subject, temFile, html, text) {
	const nodemailer = require("nodemailer");
	console.log("Test 1");

	let transport = nodemailer.createTransport({
		host: 'mail.appointgem.com',
		port: 465,
		secure: true,
		requireTLS: true,
		auth: {
			user: 'noreply@appointgem.com',
			pass: 'N0-reply-app0intg3m'
		},
		from: 'noreply@appointgem.com',
		tls: {
			rejectUnauthorized: false
		}
	})

	console.log("Test 2");
	const message = {
		from: 'Appoint Gem <noreply@appointgem.com>', // Sender address
		to: 'priyankastrivedge@gmail.com',         // List of recipients
		subject: 'Hello Sumer', // Subject line
		text: 'Hope you are doing well! Are you available ?' // Plain text body
	}

	console.log("Test 3");
	try {
		// verify connection configuration
		transport.verify(function (error, success) {
			if (error) {
				console.log(error);
			} else {
				console.log('Server is ready to take our messages');
			}
		});

		transport.sendMail(message, function (err, info) {
			if (err) {
				console.log(err)
			} else {
				console.log(info);
			}
		});
	} catch (err) {
		console.log(err)
	}
}
