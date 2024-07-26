const express = require('express');
const router = express.Router();
var cryptoTokenAuth = require('../../auth/cryptoTokenAuth');

// ** Controllers
var ModulesController = require('../../controllers/modules.controller');
var SubscriptionController = require('../../controllers/subscriptions.controller');
var UserController = require('../../controllers/users.controller');

// ** Users
// router.post('/users/login', UserController.loginUser)
router.get('/email-exist', cryptoTokenAuth, UserController.getExistEmail);
router.get('/mobile-exist', cryptoTokenAuth, UserController.getExistMobile);

// ** Modules
router.get('/modules', cryptoTokenAuth, ModulesController.getModules);

// ** Subscriptions
router.post('/company-subscription', cryptoTokenAuth, SubscriptionController.createNewSubscription);
router.post('/upgrade-company-subscription', cryptoTokenAuth, SubscriptionController.upgradeCompanySubscription);
router.post('/manage-companies-subscription', cryptoTokenAuth, SubscriptionController.manageCompanySubscriptionUser);
router.post('/companies-booking-commission', cryptoTokenAuth, SubscriptionController.getCompanyBookingCommissionCharge);
router.post('/manage-suspend-enable-company', cryptoTokenAuth, SubscriptionController.manageSuspendEnableCompanySubscription);

module.exports = router