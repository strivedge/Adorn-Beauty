const express = require('express');
const router = express.Router();
var Authorization = require('../../auth/authorization');

// ** Controllers
var AdminController = require('../../controllers/admins.controller');
var AppointmentController = require('../../controllers/appointment.controller');
var BlockTimeController = require('../../controllers/blocktime.controller');
var CategoryController = require('../../controllers/categories.controller');
var CleaningFormController = require('../../controllers/cleaningForm.controller');
var ConsultantFormController = require('../../controllers/consultantForm.controller');
var ConsultationFormController = require('../../controllers/consultationForm.controller');
var CustomerController = require('../../controllers/customer.controller');
var CustomerGiftCardController = require('../../controllers/customerGiftCard.controller');
var CustomerLoyaltyCardController = require('../../controllers/customerLoyaltyCard.controller');
var CustomerPackageController = require('../../controllers/customerpackage.controller');
var CustomerRewardsController = require('../../controllers/customerRewards.controller');
var CustomerUsagePackageServiceController = require('../../controllers/customerUsagePackageService.controller');
var DashboardController = require('../../controllers/dashboard.controller');
var DiscountController = require('../../controllers/discount.controller');
var DiscountSlabController = require('../../controllers/discountSlab.controller');
var GiftCardTransactionController = require('../../controllers/giftCardTransactions.controller');
var LocationController = require('../../controllers/locations.controller');
var PackageController = require('../../controllers/package.controller');
var PaidTimingController = require('../../controllers/paidTiming.controller');
var ServiceController = require('../../controllers/services.controller');
var UserController = require('../../controllers/users.controller');
var UserDeviceTokenController = require('../../controllers/userDeviceToken.controller');

// ** Authorization
router.post('/login', CustomerController.customerLogin);
router.post('/register', CustomerController.createCustomerUser);
router.post('/reset-password', CustomerController.resetPassword);
router.post('/verify-reset-code', CustomerController.verifyResetCode);
router.post('/reset-change-password', CustomerController.resetChangePassword);
router.get('/email-exist', CustomerController.getExistEmail);
router.get('/mobile-exist', CustomerController.getExistMobile);
router.get('/check-email', CustomerController.getCheckExistEmail);
router.get('/check-mobile', CustomerController.getCheckExistMobile);
router.post('/check-customer-exist', CustomerController.getCreateCustomerToken);
router.post('/get-multiple-customer-create-or-exist', CustomerController.getCreateMultipleCustomerToken);
router.get('/soft-delete/:id', Authorization, CustomerController.softDeleteUser);
router.get('/account-detail/:id', Authorization, CustomerController.customerAccountDetail);

// ** Appointments
router.get('/user-bookings', Authorization, AppointmentController.getUserBookings);
router.get('/appointments', Authorization, AppointmentController.getCustomerAppointmentLists);
router.get('/appointment/:id', Authorization, AppointmentController.getAppointmentListDetail);
router.post('/create-appointment', Authorization, AppointmentController.createAppointment);
router.put('/appointment', Authorization, AppointmentController.updateAppointment);
router.get('/location-parameters', Authorization, LocationController.getLocationParameters);
router.post('/appointment-calculation', Authorization, AppointmentController.bookingOrderCalculation);
router.post('/appointment-reschedule-count', Authorization, AppointmentController.increaseAppointmentRescheduleCount);

// ** Block Times
router.post('/available-slot', Authorization, BlockTimeController.createAvailableSlot);
router.get('/check-paid-slot', Authorization, PaidTimingController.checkPaidTiming);

// ** Consultant Forms
router.post('/consultation-form-question', Authorization, ConsultationFormController.getConsultationFormQuestion);
router.get('/client-booked-consultant', Authorization, ConsultantFormController.getBookedConsultantForm);
router.get('/booking-consultants', Authorization, ConsultantFormController.getBookingConsultants);
router.post('/consultant-form', Authorization, ConsultantFormController.createConsultantForm);
router.put('/consultant-form', Authorization, ConsultantFormController.updateConsultantForm);
router.get('/previous-consultants', Authorization, ConsultantFormController.getPreviousConsultantForms);

// ** Customer Gift Card
router.get('/customer-gift-cards', Authorization, CustomerGiftCardController.getCustomerGiftCardsOne);
router.get('/customer-gift-card-detail/:id', Authorization, CustomerGiftCardController.getCustomerGiftCardDetail);
router.post('/customer-gift-card-balance', Authorization, CustomerGiftCardController.getCustomerGiftCardBalance);
router.post('/redeem-customer-gift-card', Authorization, CustomerGiftCardController.redeemCustomerGiftCard);
// router.post('/debit-gift-card', Authorization, CustomerGiftCardController.debitGiftCardBalance);
// router.post('/credit-gift-card', Authorization, CustomerGiftCardController.creditGiftCardBalance);

// ** Gift Card Transactions
router.get('/gift-card-transactions', Authorization, GiftCardTransactionController.getGiftCardTransactionsOne);

// ** Customer Loyalty Card
router.get('/getOrAuto-asign-loyalty-cards', Authorization, CustomerLoyaltyCardController.getOrAutoAsignCustomerLoyaltyCards);
router.get('/customer-loyalty-cards', Authorization, CustomerLoyaltyCardController.getClientCustomerLoyaltyCards);
router.get('/customer-loyalty-card/:id', Authorization, CustomerLoyaltyCardController.getClientCustomerLoyaltyCard);

// ** Customer Packages
router.get('/customer-packages', Authorization, CustomerPackageController.getClientCustomerPackages);
router.post('/buy-customer-package', Authorization, CustomerPackageController.buyCustomerPackage);

// ** Customer Rewards
router.get('/customer-rewards', Authorization, CustomerRewardsController.getClientCustomerRewards);

// ** Customer Usage Package Service
router.get('/customer-usage-package-services', Authorization, CustomerUsagePackageServiceController.getClientCustomerUsagePackageServices);

// ** Dashboard
router.get('/dashboards', Authorization, DashboardController.getCustomerDashboardData);

// ** Discounts
router.get('/check-offer', Authorization, DiscountController.checkClientOffer);
router.post('/discount-code-match', Authorization, DiscountController.getDiscountCodeMatch);
router.get('/discounts', Authorization, DiscountController.getCustomerDiscounts);
router.get('/discount/:id', DiscountController.getDiscountDetail);
// router.get('/discount/:id', Authorization, DiscountController.getDiscountDetail);
router.get('/discount-offer-public', DiscountController.getPublicOfferDiscount);

// ** Discount Slabs
router.get('/discount-slabs', Authorization, DiscountSlabController.getSpecificDiscountSlabs);

// ** Dropdowns
router.get('/categories-dropdown', CategoryController.getCategoriesDropdown);
router.post('/services-dropdown', ServiceController.getServicesDropdown);
router.get('/employee-dropdown', Authorization, UserController.getEmployeesDropdown);
router.get('/customerpackages-dropdown', Authorization, CustomerPackageController.getCustomerPackagesDropdown);
router.get('/customer-loyalty-cards-dropdown', Authorization, CustomerLoyaltyCardController.getCustomerLoyaltyCardsDropdown);
router.get('/cleaning-form-dropdown', Authorization, CleaningFormController.getCleaningFormsDropdown);

// ** Locations
router.get('/locations', LocationController.getLocationsOne);
router.get('/location-timing', Authorization, LocationController.getLocationTiming);

// ** Packages
router.get('/online-packages-public', PackageController.getPublicOnlinePackges);
router.get('/package/:id', PackageController.getPackageOne);
// router.get('/package/:id', Authorization, PackageController.getPackageOne);

// ** Services
router.post('/service-limit', Authorization, ServiceController.checkServiceLimit);
router.get('/cart-services', Authorization, ServiceController.getCartServices);
router.post('/employee-by-services', Authorization, ServiceController.getEmployeeByServices);

// ** Tests
router.get('/test-send-sms', Authorization, AdminController.getTestSendSMS);

// ** Users
router.get('/customer/:id', Authorization, CustomerController.getCustomer);
router.put('/customer/update', Authorization, CustomerController.updateCustomer);
router.post('/change-password', Authorization, CustomerController.changePassword);

// ** UserDeviceToken
router.get('/delete-device-token', Authorization, UserDeviceTokenController.removeCustomerDeviceToken);

// Wordpress Api
router.get('/category-service-data', ServiceController.getCategoryServiceData);
router.get('/company-gift-card-details', CustomerGiftCardController.getCompanyGiftCardDetails);
router.post('/wp-company-gift-cards', CustomerGiftCardController.createCustomerGiftCard);

module.exports = router;
