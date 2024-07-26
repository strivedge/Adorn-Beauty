const express = require('express');
const router = express.Router();
var Authorization = require('../../auth/authorization');

// ** Controllers
var CommonController = require('../../controllers/common.controller');
var CustomerLoyaltyCardController = require('../../controllers/customerLoyaltyCard.controller');
var CustomerPackageController = require('../../controllers/customerpackage.controller');
var MasterCategoryController = require('../../controllers/masterCategories.controller');
var MasterContentMasterController = require('../../controllers/masterContentMasters.controller');
var MasterConsultationFormController = require('../../controllers/masterConsultationForms.controller');
var MasterCronJobActionController = require('../../controllers/masterCronjobActions.controller');
var MasterCronJobParameterController = require('../../controllers/masterCronjobParameters.controller');
var MasterCustomParameterController = require('../../controllers/masterCustomParameters.controller');
var MasterEmailTemplateController = require('../../controllers/masterEmailTemplates.controller');
var MasterQuestionController = require('../../controllers/masterQuestions.controller');
var MasterQuestionGroupController = require('../../controllers/masterQuestionGroups.controller');
var MasterServiceController = require('../../controllers/masterServices.controller');
var MasterTestController = require('../../controllers/masterTests.controller');
var UserController = require('../../controllers/users.controller');
var WhatsAppLogController = require('../../controllers/whatsAppLog.controller');
var whatsapp_api_key = require('../../controllers/whatsapp_api.controller');
var smtp_setting = require('../../controllers/smtp_setting.controller');
var marketingSettingsController = require('../../controllers/markettingSetting.controller');

// ** Users
router.post('/users/login', UserController.loginUser);

// ** Crypto Token
router.post('/create-crypto-token', Authorization, CommonController.createCryptoToken);
// router.get('/test-function-common', Authorization, CommonController.testFunctionCommon);

// ** Master Categories

// ** Master Content Masters

// ** Master CronJob Actions

// ** Master CronJob Parameters

// ** Master Custom Parameters

// ** Master Email Templates

// ** Master Tests

// ** Master Services

// ** WhatsAppLogs
router.get('/whatsapp-logs', Authorization, WhatsAppLogController.getWhatsAppLogs);
router.get('/whatsapp-logs/:id', Authorization, WhatsAppLogController.getWhatsAppLog);
router.post('/whatsapp-logs', Authorization, WhatsAppLogController.createWhatsAppLog);
router.delete('/whatsapp-logs/:id', Authorization, WhatsAppLogController.removeWhatsAppLog);

// ** Scripts
router.post('/restructure-customer-packages', Authorization, CustomerPackageController.restructureCustomerPackages);
router.post('/restructure-customer-loyalty-cards', Authorization, CustomerLoyaltyCardController.restructureCustomerLoyaltyCards);

// ** Default Data Create Script
router.post('/master-content-masters-default', Authorization, MasterContentMasterController.createDefaultMasterContentMasters);
router.post('/master-cronjob-actions-default', Authorization, MasterCronJobActionController.createDefaultMasterCronJobActions);
router.post('/master-cronjob-parameters-default', Authorization, MasterCronJobParameterController.createDefaultMasterCronjobParameters);
router.post('/master-custom-parameters-default', Authorization, MasterCustomParameterController.createDefaultMasterCustomParameters);
router.post('/master-email-templates-default', Authorization, MasterEmailTemplateController.createDefaultMasterEmailTemplates);
router.post('/master-categories-default', Authorization, MasterCategoryController.createDefaultMasterCategories);
router.post('/master-tests-default', Authorization, MasterTestController.createDefaultMasterTests);
router.post('/master-services-default', Authorization, MasterServiceController.createDefaultMasterServices);
router.post('/master-question-groups-default', Authorization, MasterQuestionGroupController.createDefaultMasterQuestionGroups);
router.post('/master-questions-default', Authorization, MasterQuestionController.createDefaultMasterQuestions);
router.post('/master-consultation-forms-default', Authorization, MasterConsultationFormController.createDefaultMasterConsultationForms);



// For WhatsApp API Key Settings
router.post('/settings/whatsapp-api', Authorization, whatsapp_api_key.CreateWhatsAppApiKey);
router.get('/settings/whatsapp-api/:id', Authorization, whatsapp_api_key.GetWhatsAppApiKey);
router.put('/settings/whatsapp-api/:id', Authorization, whatsapp_api_key.UpdateWhatsAppApiKey);
router.delete('/settings/whatsapp-api/:id', Authorization, whatsapp_api_key.DeleteWhatsAppApiKey);

// For WhatsApp API Key Settings
router.post('/settings/smtp-api', Authorization, smtp_setting.CreateSMTPSetting);
router.get('/settings/smtp-api', Authorization, smtp_setting.GetSMTPSettingData);
router.put('/settings/smtp-api', Authorization, smtp_setting.UpdateSMTPSetting);
router.delete('/settings/smtp-api/:id', Authorization, smtp_setting.DeleteSMTPSetting);

//for the MArketting Setting
router.post('/setting/create-marketting',Authorization, marketingSettingsController.create);
router.get('/setting/get-marketting',Authorization, marketingSettingsController.getAll);
router.put('/setting/update-marketting/:id',Authorization, marketingSettingsController.updateById);
router.delete('/setting/delete-marketting/:id',Authorization, marketingSettingsController.deleteById);
router.post('/setting/check-unique-slug', Authorization,  marketingSettingsController.checkIsSlugUnique)

module.exports = router;
