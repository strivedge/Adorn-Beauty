const express = require('express');
const router = express.Router();
var Authorization = require('../../auth/authorization');
var LoginAuthorization = require('../../auth/loginauthorization');
const { sendWhatsAppMessageTest, sendSMSTest } = require('../../controllers/testTextSMSFunc.controller');

// ** Controllers
const AdminController = require('../../controllers/admins.controller');
const AppliedDiscountController = require('../../controllers/appliedDiscount.controller');
const AppointmentController = require('../../controllers/appointment.controller');
const appointmentReport = require('../../controllers/appointmentReport.controller');
const AppVersionController = require('../../controllers/appVersion.controller');
const BlockTimeController = require('../../controllers/blocktime.controller');
const BuySubscriptionController = require('../../controllers/buySubscription.controller');
const CartController = require('../../controllers/cart.controller');
const CategoryController = require('../../controllers/categories.controller');
const CleaningFormController = require('../../controllers/cleaningForm.controller');
const CompanyBookingFormController = require('../../controllers/companyBookingForms.controller');
const CompanyController = require('../../controllers/companies.controller');
const ConsultantFormController = require('../../controllers/consultantForm.controller');
const ConsultantServiceTypeQuestionController = require('../../controllers/consultantServiceTypeQuestion.controller');
const ConsultationFormController = require('../../controllers/consultationForm.controller');
const ContentMasterController = require('../../controllers/contentMaster.controller');
const CronjobActionController = require('../../controllers/cronjobAction.controller');
const CronJobController = require('../../controllers/cronJob.controller');
const CronjobParameterController = require('../../controllers/cronjobParameter.controller');
const CustomerController = require('../../controllers/customer.controller');
const CustomerGiftCardController = require('../../controllers/customerGiftCard.controller');
const CustomerLoyaltyCardController = require('../../controllers/customerLoyaltyCard.controller');
const CustomerLoyaltyCardLogController = require('../../controllers/customerLoyaltyCardLog.controller');
const CustomerPackageController = require('../../controllers/customerpackage.controller');
const CustomerReviewController = require('../../controllers/customerReview.controller');
const CustomerRewardsController = require('../../controllers/customerRewards.controller');
const CustomerUsagePackageServiceController = require('../../controllers/customerUsagePackageService.controller');
const CustomerWalletController = require('../../controllers/customerWallet.controller')
const CustomParameterController = require('../../controllers/customParameter.controller');
const CustomParameterSettingController = require('../../controllers/customParameterSetting.controller');


const DashboardController = require('../../controllers/dashboard.controller');
const DbScriptController = require('../../controllers/dbScript.controller')
const DiscountController = require('../../controllers/discount.controller');
const DiscountSlabController = require('../../controllers/discountSlab.controller');
const EmailLogController = require('../../controllers/emailLog.controller');
const EmailTemplateController = require('../../controllers/emailTemplate.controller');
const EmployeeTimingController = require('../../controllers/employeeTiming.controller');
const HolidayController = require('../../controllers/holiday.controller');
const LeavesController = require('../../controllers/leaves.controller');
const LocationController = require('../../controllers/locations.controller');
const LoyaltyCardController = require('../../controllers/loyaltyCard.controller');
const MachineController = require('../../controllers/machine.controller');
const MarketingController = require('../../controllers/marketing.controller');
const ModulesController = require('../../controllers/modules.controller');
const OfferEmailTemplateController = require('../../controllers/offerEmailTemplate.controller');
const PackageController = require('../../controllers/package.controller');
const PaidTimingController = require('../../controllers/paidTiming.controller');
const PermissionController = require('../../controllers/permission.controller');
const QuestionController = require('../../controllers/question.controller');
const QuestionGroupController = require('../../controllers/questionGroup.controller');
const QuestionServiceGroupController = require('../../controllers/questionServiceGroup.controller');
const QuickContactTemplate = require('../../controllers/quickContactTemplate.controller');
const QuickSmsLogController = require('../../controllers/quickSmsLog.controller');
const RescheduleController = require('../../controllers/reschedule.controller');
const RoleController = require('../../controllers/roles.controller');
const RotasController = require('../../controllers/rotas.controller');
const SendMailController = require('../../controllers/sendMail.controller');
const ServiceController = require('../../controllers/services.controller');
const ServiceTypeGroupController = require('../../controllers/serviceTypeGroup.controller');
const SmsLogController = require('../../controllers/smsLog.controller');
const SubscriptionController = require('../../controllers/subscriptions.controller');
const TestController = require('../../controllers/tests.controller');
const UserController = require('../../controllers/users.controller');
const UserDeviceTokenController = require('../../controllers/userDeviceToken.controller')
const WhatsAppLogController = require('../../controllers/whatsAppLog.controller')
const MasterTestController = require('../../controllers/masterTests.controller');
const MasterCategoriesController = require('../../controllers/masterCategories.controller');
const MasterServicesController = require('../../controllers/masterServices.controller');
const MasterQuestionsController = require('../../controllers/masterQuestions.controller');
const MasterQuestionGroupsController = require('../../controllers/masterQuestionGroups.controller');
const MasterConsultationFormsController = require('../../controllers/masterConsultationForms.controller');
const MasterEmailTemplateController = require('../../controllers/masterEmailTemplates.controller');
const MasterCustomParameterController = require('../../controllers/masterCustomParameters.controller');
const clientNoteController = require('../../controllers/clientNotes.controller');
const updateAppointments = require('../../controllers/dbScript.controller');
var GiftCardTransactionController = require('../../controllers/giftCardTransactions.controller');

const AppointmentProcessController = require('../../controllers/appointmentProcess.controller');


// Admin
router.get('/service/:location/:service_type', CategoryController.getServiceTypes);
// router.post('/admin/registration', AdminController.createAdmin)
// router.post('/admin/login', AdminController.loginAdmin)
// router.get('/admin', AdminController.getAdmins)
// router.put('/admin', Authorization, AdminController.updateAdmin)
// router.get('/admin/:id', Authorization, AdminController.getAdmin)
// router.delete('/admin/:id', Authorization, AdminController.removeAdmin)
router.get('/shortlink', AdminController.shortLink)
//router.get('/send-test-sms', AdminController.sendTestSMS)
router.get('/get-inactive-employee', AdminController.getInactiveEmployee)

//DB Script
router.get('/distinct-category', DbScriptController.createMasterCatelog);
router.get('/get-smtp-detail', DbScriptController.getSmtpDetail);
//router.get('/get-online-services-arr', DbScriptController.getOnlineServices);
router.get('/replace-service-data', LocationController.replaceServiceData);

//router.get('/send-sms' , AdminController.sendSms)
router.get('/generate-pdf', AdminController.generatePdf)
router.get('/export-download-pdf', Authorization, AdminController.exportDownloadPdf)
// router.get('/booking-formate-change',  AdminController.appoitmentModalChanges)
// router.get('/booking-service-formate-change',  AppointmentController.appoitmentModalChanges)

//router.get('/consutant-cat-update', AdminController.consultationCategoryUpdate)
router.get('/booking-packages-changes', AdminController.appoitmentPackageChanges)
router.get('/user-location-update', AdminController.userLocationUpdate)

router.get('/update-appointment-customer-icon', AdminController.updateAppointmentsCustomerIcon);

// Role
router.post('/roles', Authorization, RoleController.createRole)
router.get('/roles', Authorization, RoleController.getRoles)
router.put('/roles', Authorization, RoleController.updateRole)
router.get('/roles/:id', Authorization, RoleController.getRole)
router.delete('/roles/:id', Authorization, RoleController.removeRole)
router.get('/roles-specific', Authorization, RoleController.getRoleSpecific)
router.get('/role-menu', Authorization, RoleController.getMenuByRole)

// User 
router.get('/user-token', UserController.getFakeUserToken)
router.post('/users', UserController.createUser)

router.post('/create-employees', Authorization, UserController.createMultipleEmployee)
router.post('/users/login', UserController.loginUser)
//router.post('/customer/login', UserController.customerLogin)
router.get('/users', Authorization, UserController.getUsers)
router.put('/users', Authorization, UserController.updateUser)
router.get('/users/:id', Authorization, UserController.getUser)
router.delete('/users/:id', Authorization, UserController.removeUser)
router.post('/users/permissions', UserController.getUserPermission)
//router.post('/get-customer-by-email', Authorization, UserController.getCustomerByEmail)
router.post('/create-applied-discount', Authorization, DiscountController.createAppliedDiscount)
//router.post('/get-specific-customer', UserController.getSpecificCustomer)
router.get('/user-auto-merge', Authorization, UserController.userAutoMerge)
router.post('/change-password', Authorization, UserController.changePassword)
router.post('/forgot-password', UserController.forgotPassword)
router.get('/get-company-subcription', UserController.getCompanySubscriptions)

router.get('/email-exist', UserController.getExistEmail)
router.get('/mobile-exist', UserController.getExistMobile)
router.get('/account-recover/:id', Authorization, CustomerController.recoverCustomerAccount)

// User
router.post('/user/check-email', UserController.checkIsEmailUnique)
router.get('/user/check-mobile', UserController.checkIsMobileUnique)
router.get('/user/email-mobile-exist', UserController.checkIsEmailAndMobileUnique)

// router.post('/customers', UserController.createUser)
// router.get('/customers', Authorization, UserController.getUsers)
// router.put('/customers', UserController.updateUser)
// router.put('/customers/block_many', UserController.blockUsers)
// router.get('/customers/:id', Authorization, UserController.getUser)
router.get('/user-specific-data/:id', Authorization, UserController.getUserbyId)
router.delete('/user/:id', Authorization, UserController.removeUser)
router.post('/user/permissions', Authorization, UserController.getUserPermission)
router.get('/employees', Authorization, UserController.getEmployees)
router.get('/employees-listing', Authorization, UserController.getEmployeesListing)
// router.get('/clients', Authorization, UserController.getCustomers)
// router.get('/getclients', Authorization, UserController.getActiveCustomers)
// router.get('/get-customer-data', Authorization, UserController.getCustomerDataForExport)
//router.get('/get-active-clients', Authorization, UserController.getActiveCustomerConsultant)
router.get('/getemployees', Authorization, UserController.getActiveEmployees)
//router.get('/clients-specific', Authorization, UserController.getClients)
router.get('/employee-specific', Authorization, UserController.getEmployeeSpecific)
router.post('/available-employees', Authorization, UserController.getAvailableEmployees)
router.get('/employee-dropdown', Authorization, UserController.getEmployeesDropdown)
// router.get('/customer-dropdown', Authorization, UserController.getCustomersDropdown)
// router.get('/customer-notification/:id', UserController.getUserNotification)

//Customer
router.post('/customers', CustomerController.createCustomer)
router.get('/customers', Authorization, CustomerController.getCustomers)
router.put('/customers', CustomerController.updateCustomer)
router.put('/customers/block_many', CustomerController.blockCustomers)
router.get('/customers/:id', Authorization, CustomerController.getCustomer)
router.get('/customer-specific-data/:id', Authorization, CustomerController.getCustomerbyId)
router.put('/customers-settings', CustomerController.updateCustomerNotification)
router.delete('/customers/:id', Authorization, CustomerController.removeCustomer)
router.post('/customers/permissions', Authorization, CustomerController.getCustomerPermission)
router.get('/clients', Authorization, CustomerController.getCustomers)
router.get('/getclients', Authorization, CustomerController.getActiveCustomers)
router.get('/get-customer-data', Authorization, CustomerController.getCustomerDataForExport)
router.get('/get-active-clients', Authorization, CustomerController.getActiveCustomerConsultant)
router.get('/clients-specific', Authorization, CustomerController.getClients)
router.get('/customer-dropdown', Authorization, CustomerController.getCustomersDropdown)
router.get('/customer-notification/:id', CustomerController.getCustomerNotification)
router.post('/customers/check-email', CustomerController.checkIsEmailUnique)
router.get('/check-customers-mobile', CustomerController.checkIsMobileUnique)
router.get('/customers/email-mobile-exist', CustomerController.checkIsEmailAndMobileUnique)
router.post('/get-specific-customer', CustomerController.getSpecificCustomer)
router.post('/get-customer-by-email', Authorization, CustomerController.getCustomerByEmail)
// router.post('/customer/login', CustomerController.customerLogin)
router.get('/customers/account-recover/:id', Authorization, CustomerController.recoverCustomerAccount)
router.get('/customer-string-to-array', CustomerController.valueStringToArray)

// Front-booking
router.get('/booking/check-customer', CustomerController.checkCustomerByEmailMobile)
router.post('/booking/get-customer-by-email', CustomerController.getCustomerByEmail)

// one time sript
router.get('/customer-location-string-to-array', UserController.userLocationStringToArray)
router.get('/customer-merger-by-email-mobile', UserController.userMergeByEmailMobile)
router.get('/booking-user-replace', CustomerController.replceBookingUser)
router.get('/check-duplicate', CustomerController.getTestRedundantUsers)

// Database Script
router.get('/create-separate-customer', DbScriptController.createCustomerTableFromUser)
router.get('/verify-whatsapp-number', DbScriptController.verifyCustomerWhatsAppNumber)
router.get('/add-verify-number-to-customer', DbScriptController.AddVerifyNumberToCustomer)

// Employee timing
router.post('/employee-timing', Authorization, EmployeeTimingController.createEmployeeTiming)
router.get('/employee-timing', Authorization, EmployeeTimingController.getEmployeeTimings)

// Comapany (Organization) 
router.post('/companies/check-domain', Authorization, CompanyController.checkIsDomainUnique)
router.post('/companies', Authorization, CompanyController.createCompany)
router.get('/companies', Authorization, CompanyController.getCompanies)
router.get('/active-companies', Authorization, CompanyController.getActiveCompanies)
router.put('/companies', Authorization, CompanyController.updateCompany)
router.get('/companies/:id', Authorization, CompanyController.getCompany)
router.get('/get-company/:domain', CompanyController.getCompanyByDomain)
router.delete('/companies/:id', Authorization, CompanyController.removeCompany)
router.get('/get-company-location/:domain', CompanyController.getCompanyLocationByDomain)
router.post('/copy-company-data', Authorization, CompanyController.copyCompanyData)
router.get('/sync-company-data', Authorization, CompanyController.syncCompanyData)

// Location (Branch)
router.post('/locations', Authorization, LocationController.createLocation)
router.post('/locations-listing', Authorization, LocationController.getLocationListing)
router.get('/locations', Authorization, LocationController.getLocations)
router.post('/location-specific', Authorization, LocationController.getLocationSpecific)
router.get('/active-locations', Authorization, LocationController.getActiveLocations)
router.put('/locations', Authorization, LocationController.updateLocation)
router.get('/locations/:id', Authorization, LocationController.getLocation)
router.delete('/locations/:id', Authorization, LocationController.removeLocation)
router.post('/locations-timings', Authorization, LocationController.createLocationTimings)
router.put('/locations-timings', Authorization, LocationController.updateLocationTimings)
router.get('/locations-timings/:location_id', Authorization, LocationController.getLocationTimings)
router.post('/locations-close-days', Authorization, LocationController.createLocationCloseDay)
router.get('/locations-close-days/:location_id', Authorization, LocationController.getLocationCloseDays)
router.get('/location-parameter', Authorization, LocationController.getLocationParameter)
router.get('/sync-location-wise', Authorization, LocationController.syncLocationsData)
router.post('/copy-location-questions', Authorization, LocationController.copyQuestionsLocation)
router.post('/copy-location-services', Authorization, LocationController.copySeriveByLocation)
router.get('/group-booking-limit', Authorization, LocationController.getLocationGroupBookingLimit)
router.get('/get-location-company', LocationController.getLocationComapany)
router.post('/copy-location-data', LocationController.copyLocationData)
router.get('/get-location-timing', Authorization, LocationController.getLocationTiming)
router.get('/location-soft-delete/:location_id', Authorization, LocationController.softDeleteLocation)

// Machines
router.post('/machines', Authorization, MachineController.createMachine)
router.get('/machines', Authorization, MachineController.getMachines)
router.get('/active-machines', Authorization, MachineController.getActiveMachines)
router.put('/machines', Authorization, MachineController.updateMachine)
router.get('/machines/:id', Authorization, MachineController.getMachine)
router.delete('/machines/:id', Authorization, MachineController.removeMachine)

// Test (service test) 
router.post('/tests', Authorization, TestController.createTest)
router.get('/tests', Authorization, TestController.getTests)
router.get('/active-tests', Authorization, TestController.getActiveTests)
router.put('/tests', Authorization, TestController.updateTest)
router.get('/tests/:id', Authorization, TestController.getTest)
router.delete('/tests/:id', Authorization, TestController.removeTest)
router.post('/import-test-excel-file', Authorization, TestController.importTestDataFromExcel)
router.get('/export-test-data', Authorization, TestController.exportTestDataToExcel)

// Service type groups
router.post('/service-type-groups', Authorization, ServiceTypeGroupController.createServiceTypeGroup)
router.get('/service-type-groups', Authorization, ServiceTypeGroupController.getServiceTypeGroups)
router.get('/active-service-type-groups', Authorization, ServiceTypeGroupController.getServiceTypeGroupsSpecific)
router.put('/service-type-groups', Authorization, ServiceTypeGroupController.updateServiceTypeGroup)
router.get('/service-type-groups/:id', Authorization, ServiceTypeGroupController.getServiceTypeGroup)
router.delete('/service-type-groups/:id', Authorization, ServiceTypeGroupController.removeServiceTypeGroup)

// Category (service type) 
router.post('/categories', Authorization, CategoryController.createCategory)
router.get('/categories', Authorization, CategoryController.getCategories)
router.get('/active-categories', Authorization, CategoryController.getActiveCategories)
router.get('/category-specific', Authorization, CategoryController.getCategorySpecific)
router.put('/categories', Authorization, CategoryController.updateCategory)
router.get('/categories/:id', Authorization, CategoryController.getCategory)
router.delete('/categories/:id', Authorization, CategoryController.removeCategory)
router.get('/categories-specific', Authorization, CategoryController.getCategoriesSpecific)
router.get('/view-category-question', Authorization, CategoryController.getCategoryViewQuestion)
router.get('/categories-dropdown', Authorization, CategoryController.getCategoriesDropdown)
router.post('/import-category-excel-file', Authorization, CategoryController.importCategoryDataFromExcel)
router.post('/export-category-data', Authorization, CategoryController.exportCategoryDataToExcel)
router.post('/categories/remove', Authorization, CategoryController.removeMultipleCategory)

// for branch copy
router.get('/categories-by-location', Authorization, CategoryController.getCategoriesbyLocation)
router.get('/tests-by-location', Authorization, TestController.getTestsbyLocation)
router.get('/services-by-location', Authorization, ServiceController.getServicesbyLocation)

// company copy
router.get('/locations-company-specific', Authorization, LocationController.getLocationCompanySpecific)
router.post('/get-service-types', Authorization, CategoryController.getTypesCompanySpecific)
router.post('/get-service-tests', Authorization, TestController.getTestsCompanySpecific)

// Service (service) 
router.post('/services', Authorization, ServiceController.createService)
router.get('/services', Authorization, ServiceController.getServices)
router.put('/services', Authorization, ServiceController.updateService)
router.get('/services/:id', Authorization, ServiceController.getService)
router.delete('/services/:id', Authorization, ServiceController.removeService)
router.get('/services-specific', Authorization, ServiceController.getServiceSpecific)
router.post('/employee-services', Authorization, ServiceController.getEmployeeService)
router.post('/employee-services-all', Authorization, ServiceController.getEmployeeAllService)
router.post('/get-employee-by-services', ServiceController.getEmployeeByServices)
router.post('/services/remove', Authorization, ServiceController.removeMultipleService)
router.post('/services-limit', Authorization, ServiceController.checkServiceLimit)
router.post('/services-dropdown', Authorization, ServiceController.getServicesDropdown)
router.post('/machine-services-dropdown', Authorization, ServiceController.getMachineServicesDropdown)

router.post('/check-client-service-data', Authorization, ServiceController.checkCustomerServiceData)

router.get('/get-online-services', Authorization, ServiceController.getOnlineServices)
router.post('/import-service-excel-file', Authorization, ServiceController.importServiceDataFromExcel)
router.post('/export-services-data', Authorization, ServiceController.exportServiceDataToExcel)

// Permission 
router.post('/permissions', Authorization, PermissionController.createPermission)
router.get('/permissions', Authorization, PermissionController.getPermissions)
router.put('/permissions', Authorization, PermissionController.updatePermission)
router.get('/permissions/:id', Authorization, PermissionController.getPermission)
router.delete('/permissions/:id', Authorization, PermissionController.removePermission)

// Module
router.post('/modules', Authorization, ModulesController.createModule)
router.get('/modules', Authorization, ModulesController.getModules)
router.put('/modules', Authorization, ModulesController.updateModule)
router.get('/modules/:id', Authorization, ModulesController.getModule)
router.delete('/modules/:id', Authorization, ModulesController.removeModule)
// this is only for subscription module
router.get('/custom-modules', Authorization, ModulesController.getCustomModules)

// Rota
router.post('/rotas', Authorization, RotasController.createRota)
router.get('/rotas', Authorization, RotasController.getRotas)
router.put('/rotas', Authorization, RotasController.updateRota)
router.get('/rotas/:id', Authorization, RotasController.getRota)
router.delete('/rotas/:id', Authorization, RotasController.removeRota)

// Leave
router.post('/leaves', Authorization, LeavesController.createLeave)
router.get('/leaves', Authorization, LeavesController.getLeaves)
router.put('/leaves', Authorization, LeavesController.updateLeave)
router.get('/leaves/:id', Authorization, LeavesController.getLeave)
router.delete('/leaves/:id', Authorization, LeavesController.removeLeave)

// Discount
router.post('/discounts', Authorization, DiscountController.createDiscount)
router.post('/discount-specific', Authorization, DiscountController.getDiscountSpecific)
router.get('/discounts', Authorization, DiscountController.getDiscounts)
router.put('/discounts', Authorization, DiscountController.updateDiscount)
router.get('/discounts/:id', DiscountController.getDiscount)
router.delete('/discounts/:id', Authorization, DiscountController.removeDiscount)
router.get('/active-discounts', Authorization, DiscountController.getActiveDiscount)
router.get('/active-offers', Authorization, DiscountController.getActiveOffers)
router.get('/get-offer-detail/:id', DiscountController.getOfferDetail)
router.post('/discounts/remove', Authorization, DiscountController.removeMultipleData)
router.get('/get-discount-types', Authorization, DiscountController.getDiscountTypes)
router.get('/get-discount-offer', DiscountController.getDiscountAndOffer)
//router.get('/discount-offer-sms', DiscountController.sendDiscountSms)

// Package
router.post('/packages', Authorization, PackageController.createPackage)
router.get('/packages', Authorization, PackageController.getPackages)
router.put('/packages', Authorization, PackageController.updatePackage)
router.get('/packages/:id', Authorization, PackageController.getPackage)
router.delete('/packages/:id', Authorization, PackageController.removePackage)
router.get('/getpackages', Authorization, PackageController.getActivePackages)
router.get('/packages-dropdown', Authorization, PackageController.getPackagesDropdown)
router.get('/multi-service-packages', PackageController.getMultiServicePackages)

// Customer Packages
router.post('/customerpackages', Authorization, CustomerPackageController.createCustomerPackage)
router.get('/customerpackages', Authorization, CustomerPackageController.getCustomerPackages)
router.put('/customerpackages', Authorization, CustomerPackageController.updateCustomerPackage)
router.get('/customerpackages/:id', Authorization, CustomerPackageController.getCustomerPackage)
router.delete('/customerpackages/:id', Authorization, CustomerPackageController.removeCustomerPackage)
router.get('/get-customer-packages', Authorization, CustomerPackageController.getCustomerAllPackages)
router.get('/check-customer-packages', Authorization, CustomerPackageController.checkCustomerPackages)
router.get('/customerpackages-dropdown', Authorization, CustomerPackageController.getCustomerPackagesDropdown)



// Appointment Booking
router.post('/appointments', Authorization, AppointmentController.createAppointment)
router.get('/appointments', Authorization, AppointmentController.getAppointments)
router.put('/appointments', AppointmentController.updateAppointment)
router.get('/appointments/:id', Authorization, AppointmentController.getAppointment)
router.delete('/appointments/:id', Authorization, AppointmentController.removeAppointment)
router.post('/appointment-details', Authorization, AppointmentController.getAppointmentsDetails)
router.get('/appointment-lists-detail', Authorization, AppointmentController.getAppointmentListsDetail)
router.get('/appointment-list-detail/:id', Authorization, AppointmentController.getAppointmentListDetail)
router.get('/remove-appointment-gift-balance', Authorization, AppointmentController.removeAppointmentGiftCardBalance)
router.get('/revert-appointment-gift-balance', Authorization, AppointmentController.revertAppointmentGiftCardBalance)

router.get('/notifications-unreaded', Authorization, AppointmentController.getAppointmentNotificationsUnreaded)
router.get('/notifications-readed', Authorization, AppointmentController.getAppointmentNotificationsReaded)
router.get('/reschedule-booking-unreaded', Authorization, AppointmentController.getRescheduleUnreadBooking)
router.post('/user-booking', Authorization, AppointmentController.getUserBooking)
router.post('/appointments-msg', Authorization, AppointmentController.sendMsgAppointment)
router.get('/clear-unread-notification', Authorization, AppointmentController.clearAllUnreadNotification)
router.post('/update-unread-notification', Authorization, AppointmentController.updateSpecificNotification)
router.post('/no-show-message', Authorization, AppointmentController.noShowsMessageCustomer)
router.get('/get-customer-appointment', Authorization, AppointmentController.getCustomerBooking)
router.post('/get-appointment-list-ref-data', Authorization, AppointmentController.getAppointmentsListRefData)
router.get('/set-future-appointment-list-ref-data', AppointmentController.setFutureAppointmentsListRefData)
router.post('/appointment-calculation', Authorization, AppointmentController.getAppointmentCalculation)

router.get('/appointment-structure-changes', AppointmentController.appointmentStructuralScript)


router.post('/booking/order-calculation', AppointmentController.bookingOrderCalculation)

router.get('/get-customer-bookings', AppointmentController.getCustomerAllBooking)
router.get('/check-employee-appointments', Authorization, AppointmentController.checkEmployeeAppointments)
router.get('/get-rebooking-appointments', Authorization, AppointmentController.getReBookingAppointments)
router.get('/appointment-email-content/:id', AppointmentController.getBookingEmailContents)
router.post('/generate-booking-pdf', Authorization, SmsLogController.sendBookingHistoryLogEmailPdf)

// Block Time
router.post('/block-time', Authorization, BlockTimeController.createBlockTime)
router.get('/block-time', Authorization, BlockTimeController.getBlockTimes)
router.put('/block-time', Authorization, BlockTimeController.updateBlockTime)
router.get('/block-time/:id', Authorization, BlockTimeController.getBlockTime)
router.delete('/block-time/:id', Authorization, BlockTimeController.removeBlockTime)
router.post('/check-slot-available', Authorization, BlockTimeController.checkSlotIsAvailable)
router.post('/get-available-slot', Authorization, BlockTimeController.createAvailableSlot)
router.post('/remove-blocktime-by-employee', Authorization, BlockTimeController.removeEmployeeBlockTime)
router.post('/re-assign-booking', Authorization, BlockTimeController.reAssignBookingEmployee)
router.post('/get-employee-available-slot', BlockTimeController.getEmployeeAvailableSlot)
router.post('/get-available-slot-with-index', Authorization, BlockTimeController.createAvailableSlotWithIndex)

// Testing Mail for postman
router.post('/sendMail', SendMailController.sendMail)

// AppVersion
router.post('/app-version', Authorization, AppVersionController.createAppVersion)
router.get('/app-version', Authorization, AppVersionController.getAppVersions)
router.put('/app-version', Authorization, AppVersionController.updateAppVersion)
router.get('/app-version/:id', Authorization, AppVersionController.getAppVersion)
router.delete('/app-version/:id', Authorization, AppVersionController.removeAppVersion)

// EmailTemplate
router.post('/email-template', Authorization, EmailTemplateController.createEmailTemplate)
router.get('/email-template', Authorization, EmailTemplateController.getEmailTemplates)
router.put('/email-template', Authorization, EmailTemplateController.updateEmailTemplate)
router.get('/email-template/:id', Authorization, EmailTemplateController.getEmailTemplate)
router.delete('/email-template/:id', Authorization, EmailTemplateController.removeEmailTemplate)
router.get('/email-template-by-org', Authorization, EmailTemplateController.getEmailTemplatesbyOrg)
router.get('/email-template-all-by-org', Authorization, EmailTemplateController.getAllEmailTemplatesbyOrg)

// Offer EmailTemplate
router.post('/offer-email-template', Authorization, OfferEmailTemplateController.createOfferEmailTemplate)
router.get('/offer-email-templates', Authorization, OfferEmailTemplateController.getOfferEmailTemplates)
router.put('/offer-email-template', Authorization, OfferEmailTemplateController.updateOfferEmailTemplate)
router.get('/offer-email-template/:id', Authorization, OfferEmailTemplateController.getOfferEmailTemplate)
router.delete('/offer-email-template/:id', Authorization, OfferEmailTemplateController.removeOfferEmailTemplate)
router.get('/offer-specific-email-template', Authorization, OfferEmailTemplateController.getSpecificOfferEmailTemplates)

// Marketing
router.post('/marketing', Authorization, MarketingController.createMarketing)
router.post('/marketing-template', Authorization, MarketingController.createMarketingTemplate)
router.get('/marketings', Authorization, MarketingController.getMarketings)
router.put('/marketing', Authorization, MarketingController.updateMarketing)
router.get('/marketing/:id', Authorization, MarketingController.getMarketing)
router.delete('/marketing/:id', Authorization, MarketingController.removeMarketing)
router.get('/marketing-specific', Authorization, MarketingController.getSpecificMarketing)

// CustomerUsagePackageService
router.post('/customer-usage-package-service', Authorization, CustomerUsagePackageServiceController.createCustomerUsagePackageService)
router.post('/create-usage-package-services', Authorization, CustomerUsagePackageServiceController.createUsagePackageServices)
router.post('/customer-usage-package-services', Authorization, CustomerUsagePackageServiceController.getCustomerUsagePackageServices)
router.put('/customer-usage-package-service', Authorization, CustomerUsagePackageServiceController.updateCustomerUsagePackageService)
router.get('/customer-usage-package-service/:id', Authorization, CustomerUsagePackageServiceController.getCustomerUsagePackageService)
router.delete('/customer-usage-package-service/:id', Authorization, CustomerUsagePackageServiceController.removeCustomerUsagePackageService)
router.post('/get-usage-services-specific', CustomerUsagePackageServiceController.getUsageServiceSpecific)
router.post('/get-usage-services-count', CustomerUsagePackageServiceController.getCountServiceUsage)
router.get('/get-usage-by-booking', CustomerUsagePackageServiceController.getCustomerUsagePackageByBooking)
router.get('/customer-usage-package-service-by-customer-package-id/:id', Authorization, CustomerUsagePackageServiceController.getCustomerUsagePackageServiceByCustomerPackageId)

// ContentMaster
router.post('/content-master', Authorization, ContentMasterController.createContentMaster)
router.post('/getting-content-master', Authorization, ContentMasterController.gettingContentMaster)
router.get('/content-masters', Authorization, ContentMasterController.getContentMasters)
router.put('/content-master', Authorization, ContentMasterController.updateContentMaster)
router.get('/content-master/:id', Authorization, ContentMasterController.getContentMaster)
router.delete('/content-master/:id', Authorization, ContentMasterController.removeContentMaster)
router.get('/content-masters-by-org', Authorization, ContentMasterController.getContentMastersbyOrg)
router.get('/content-master-all-by-org', Authorization, ContentMasterController.getAllContentMastersbyOrg)

// CustomParameter
router.post('/custom-parameter', Authorization, CustomParameterController.createCustomParameter)
router.post('/getting-custom-parameter', Authorization, CustomParameterController.gettingCustomParameter)
router.get('/custom-parameters', Authorization, CustomParameterController.getCustomParameters)
router.put('/custom-parameter', Authorization, CustomParameterController.updateCustomParameter)
router.get('/custom-parameter/:id', Authorization, CustomParameterController.getCustomParameter)
router.delete('/custom-parameter/:id', Authorization, CustomParameterController.removeCustomParameter)
router.get('/custom-parameters-by-org', Authorization, CustomParameterController.getCustomParametersbyOrg)
router.get('/custom-parameter-all-by-org', Authorization, CustomParameterController.getAllCustomParametersbyOrg)
router.post('/custom-parameter-specific', Authorization, CustomParameterController.getSpecificCustomParameter)
router.get('/custom-parameters-distinct', Authorization, CustomParameterController.getAllDistinctCategory)
router.get('/custom-parameters-location-wise', Authorization, CustomParameterController.getCustomParameterLocation)


//CustomParameterSettingController
router.post('/custom-parameter-setting', Authorization, CustomParameterSettingController.createCustomParameter)
router.post('/getting-custom-parameter-setting', Authorization, CustomParameterSettingController.gettingCustomParameter)
router.get('/custom-parameters-settings-data', Authorization, CustomParameterSettingController.getCustomParameters)
router.put('/custom-parameter-setting', Authorization, CustomParameterSettingController.updateCustomParameter)
router.get('/custom-parameter-setting/:id', Authorization, CustomParameterSettingController.getCustomParameter)
router.delete('/custom-parameter-settings/:id', Authorization, CustomParameterSettingController.removeCustomParameter)
router.get('/custom-parameters-settings-by-category', CustomParameterSettingController.getCustomParametersbyCategory)
router.get('/custom-parameter-settings-all-by-org', Authorization, CustomParameterSettingController.getAllCustomParametersbyOrg)
router.post('/custom-parameter-settings-specific', Authorization, CustomParameterSettingController.getSpecificCustomParameter)
router.get('/custom-parameters-settings-distinct', Authorization, CustomParameterSettingController.getAllDistinctCategory)
router.get('/custom-parameters-settings-location-wise', Authorization, CustomParameterSettingController.getCustomParameterLocation)
router.get('/set-company-custom-parameters', CustomParameterSettingController.createCompanyCustomParameter) //set default value from master

// Holiday
router.post('/holiday', Authorization, HolidayController.createHoliday)
router.get('/holidays', Authorization, HolidayController.getHolidays)
router.put('/holiday', Authorization, HolidayController.updateHoliday)
router.get('/holiday/:id', Authorization, HolidayController.getHoliday)
router.delete('/holiday/:id', Authorization, HolidayController.removeHoliday)

// Consultant Question 
router.post('/questions', Authorization, QuestionController.createQuestion)
router.get('/questions', Authorization, QuestionController.getQuestions)
router.get('/questions-specific', Authorization, QuestionController.getQuestionsSpecific)
router.get('/active-questions', Authorization, QuestionController.getActiveQuestions)
router.post('/get-all-questions', QuestionController.getAllQuestions)
router.put('/questions', Authorization, QuestionController.updateQuestion)
router.put('/multi-questions', Authorization, QuestionController.updateMultiQuestion)
router.get('/questions/:id', Authorization, QuestionController.getQuestion)
router.delete('/questions/:id', Authorization, QuestionController.removeQuestion)
router.post('/questions/remove', Authorization, QuestionController.removeMultipleQuestion)
router.get('/questions-dropdown', Authorization, QuestionController.getQuestionsDropdown)
router.post('/upload-question-image', Authorization, QuestionController.uploadQuestionImage)

// Consultant Form
router.post('/consultant-form', ConsultantFormController.createConsultantForm)
router.get('/consultant-form', Authorization, ConsultantFormController.getConsultantForms)
router.get('/booking-consultants', Authorization, ConsultantFormController.getBookingsConsultant)
router.get('/consultant-form-specific', Authorization, ConsultantFormController.getSpecificConsultantForms)
router.get('/active-consultant-form', Authorization, ConsultantFormController.getActiveConsultantForms)
router.put('/consultant-form', ConsultantFormController.updateConsultantForm)
router.get('/consultant-form/:id', Authorization, ConsultantFormController.getConsultantForm)
router.delete('/consultant-form/:id', Authorization, ConsultantFormController.removeConsultantForm)
router.get('/client-consultant-form/:client_id', Authorization, ConsultantFormController.getClientConsultantForm)
router.get('/client-booked-consultation', ConsultantFormController.getConsultationForm)
router.get('/consultant-form-client-question', Authorization, ConsultantFormController.getConsultantClientQuestion)
router.post('/consultant-form-send-pdf', Authorization, ConsultantFormController.sendConsultantFormPdf)
router.get('/check-client-booking-consultation', Authorization, ConsultantFormController.checkClientBookingConsultationForm)
router.get('/get-client-consultation', Authorization, ConsultantFormController.getClientConsultationForm)
router.get('/previous-consultants', Authorization, ConsultantFormController.getPreviousConsultantForms)

// Email Log
router.get('/email-logs', Authorization, EmailLogController.getEmailLogs)
router.get('/email-log-specific', Authorization, EmailLogController.getEmailLogSpecific)
router.get('/email-log/:id', Authorization, EmailLogController.getEmailLog)
router.delete('/email-log/:id', Authorization, EmailLogController.removeEmailLog)

// SMS Log
router.post('/sms-log', Authorization, SmsLogController.createSmsLog)
router.get('/sms-logs', Authorization, SmsLogController.getSmsLogs)
router.get('/sms-log-specific', Authorization, SmsLogController.getSmsLogSpecific)
router.get('/sms-log/:id', Authorization, SmsLogController.getSmsLog)
router.delete('/sms-log/:id', Authorization, SmsLogController.removeSmsLog)
//router.post('/sms-log-email', Authorization,  SmsLogController.sendSmsLogEmail)
router.post('/sms-log-email', Authorization, SmsLogController.sendSmsLogEmailPdf)

// QuickSmsLog
router.post('/quick-sms-log', Authorization, QuickSmsLogController.createQuickSmsLog)
router.get('/quick-sms-logs', Authorization, QuickSmsLogController.getQuickSmsLogs)
router.get('/quick-sms-log-specific', Authorization, QuickSmsLogController.getQuickSmsLogSpecific)
router.get('/quick-sms-log/:id', Authorization, QuickSmsLogController.getQuickSmsLog)
router.delete('/quick-sms-log/:id', Authorization, QuickSmsLogController.removeQuickSmsLog)
router.post('/quick-sms-log-email', Authorization, QuickSmsLogController.sendQuickSmsLogEmail)

// CronJob Parameter
router.post('/cronjob-parameter', Authorization, CronjobParameterController.createCronjobParameter)
router.get('/cronjob-parameter', Authorization, CronjobParameterController.getCronjobParameters)
router.put('/cronjob-parameter', Authorization, CronjobParameterController.updateCronjobParameter)
router.get('/cronjob-parameter/:id', Authorization, CronjobParameterController.getCronjobParameter)
router.delete('/cronjob-parameter/:id', Authorization, CronjobParameterController.removeCronjobParameter)

// Subscription 
router.post('/subscription', Authorization, SubscriptionController.createSubscription)
router.get('/subscriptions', Authorization, SubscriptionController.getSubscriptions)
router.put('/subscription', Authorization, SubscriptionController.updateSubscription)
router.get('/subscription/:id', Authorization, SubscriptionController.getSubscription)
router.delete('/subscription/:id', Authorization, SubscriptionController.removeSubscription)
router.post('/get-subscription-plans', Authorization, SubscriptionController.getSubscriptionsPlan)


router.get('/set-custom-parameter-setting', SubscriptionController.setCustomParametersetting)


router.post('/user-login', LoginAuthorization, SubscriptionController.userAutoLogin)

// Applied Discount 
router.post('/applied-discount', Authorization, AppliedDiscountController.createAppliedDiscount)
router.get('/applied-discount', Authorization, AppliedDiscountController.getAppliedDiscounts)
router.put('/applied-discount', Authorization, AppliedDiscountController.updateAppliedDiscount)
router.get('/applied-discount/:id', Authorization, AppliedDiscountController.getAppliedDiscount)
router.delete('/applied-discount/:id', Authorization, AppliedDiscountController.removeAppliedDiscount)
router.get('/appointment-applied-discount', Authorization, AppliedDiscountController.getAppointmentAppliedDiscount)

// Buy Subscription 
router.post('/buy-subscription', Authorization, BuySubscriptionController.createBuySubscription)
router.get('/buy-subscriptions', Authorization, BuySubscriptionController.getBuySubscriptions)
router.put('/buy-subscription', Authorization, BuySubscriptionController.updateBuySubscription)
router.get('/buy-subscription/:id', Authorization, BuySubscriptionController.getBuySubscription)
router.delete('/buy-subscription/:id', Authorization, BuySubscriptionController.removeBuySubscription)
router.get('/buy-subscriptions-company', Authorization, BuySubscriptionController.getCompanyBuySubscriptions)
router.post('/buy-subscription-specific-company', Authorization, BuySubscriptionController.getBuySubscriptionCompany)

// CompanyBookingForm for colors 
router.post('/company-booking-form', Authorization, CompanyBookingFormController.createCompanyBookingForm)
router.get('/company-booking-forms', Authorization, CompanyBookingFormController.getCompanyBookingForms)
router.put('/company-booking-form', Authorization, CompanyBookingFormController.updateCompanyBookingForm)
router.get('/company-booking-form/:id', Authorization, CompanyBookingFormController.getCompanyBookingForm)
router.delete('/company-booking-form/:id', Authorization, CompanyBookingFormController.removeCompanyBookingForm)
router.get('/company-color-specific/:company_id', Authorization, CompanyBookingFormController.getCompanySpecificColor)

// discount-slab
router.post('/discount-slab', Authorization, DiscountSlabController.createDiscountSlab)
router.get('/discount-slab', Authorization, DiscountSlabController.getDiscountSlabs)
router.put('/discount-slab', Authorization, DiscountSlabController.updateDiscountSlab)
router.get('/discount-slab/:id', Authorization, DiscountSlabController.getDiscountSlab)
router.delete('/discount-slab/:id', Authorization, DiscountSlabController.removeDiscountSlab)
router.post('/discount-slab-specific', Authorization, DiscountSlabController.getDiscountSlabsSpecific)

// Customer Rewards
router.post('/customer-rewards', Authorization, CustomerRewardsController.createCustomerRewards)
router.get('/customer-rewards', Authorization, CustomerRewardsController.getCustomerRewards)
router.get('/customer-rewards/:id', Authorization, CustomerRewardsController.getCustomerReward)
router.delete('/customer-rewards/:id', Authorization, CustomerRewardsController.removeCustomerRewards)
router.post('/customer-rewards-specific', Authorization, CustomerRewardsController.getSpecificCustomerRewards)
router.get('/set-customer-rewards', CustomerRewardsController.setCustomerRewardsByPoints)

// QuestionGroup
router.post('/question-group', Authorization, QuestionGroupController.createQuestionGroup)
router.get('/question-groups', Authorization, QuestionGroupController.getQuestionGroups)
router.put('/question-group', Authorization, QuestionGroupController.updateQuestionGroup)
router.get('/question-group/:id', Authorization, QuestionGroupController.getQuestionGroup)
router.delete('/question-group/:id', Authorization, QuestionGroupController.removeQuestionGroup)
router.get('/question-group-specific', Authorization, QuestionGroupController.getQuestionGroupSpecific)
router.get('/question-groups-dropdown', Authorization, QuestionGroupController.getQuestionGroupsDropdown)

// QuestionServiceGroup
router.post('/question-service-group', Authorization, QuestionServiceGroupController.createQuestionServiceGroup)
router.get('/question-service-groups', Authorization, QuestionServiceGroupController.getQuestionServiceGroups)
router.put('/question-service-group', Authorization, QuestionServiceGroupController.updateQuestionServiceGroup)
router.get('/question-service-group/:id', Authorization, QuestionServiceGroupController.getQuestionServiceGroup)
router.delete('/question-service-group/:id', Authorization, QuestionServiceGroupController.removeQuestionServiceGroup)
router.get('/question-service-group-specific', Authorization, QuestionServiceGroupController.getQuestionServiceGroupSpecific)

// CronjobAction
router.post('/cronjob-action', Authorization, CronjobActionController.createCronjobAction)
router.get('/cronjob-actions', Authorization, CronjobActionController.getCronjobActions)
router.put('/cronjob-action', Authorization, CronjobActionController.updateCronjobAction)
router.get('/cronjob-action/:id', Authorization, CronjobActionController.getCronjobAction)
router.delete('/cronjob-action/:id', Authorization, CronjobActionController.removeCronjobAction)

// Dashboards
router.get('/dashboards', Authorization, DashboardController.getDashBoardData)
router.get('/dashboards-rebooking', Authorization, DashboardController.getDashBoardRebookingData)
router.post('/dashboard-appointments', Authorization, DashboardController.getDashboardAppointments)

router.get('/dashboard-stats', Authorization, DashboardController.getDashBoardStats)
router.get('/dashboard-stats-rebooking', Authorization, DashboardController.getDashBoardStatsRebooking)
router.get('/dashboard-stats-list-detail', Authorization, DashboardController.getDashBoardStatsListDetail)
router.get('/employee-appointments-count', Authorization, DashboardController.getEmployeeAppointmentsCount)

router.get('/get-dashboard-ref-data', Authorization, DashboardController.getDashboardRefData)
router.get('/get-dashboard-rebooking-ref-data', Authorization, DashboardController.getDashboardRefRebookingData)
// router.get('/get-dashboard-rebooking-ref-data-old', DashboardController.getDashboardRebookingRefData)
// router.get('/set-dashboard-future-ref-data', DashboardController.setDashboardFutureRefData)

// Loyalty Card 
router.post('/loyalty-card', Authorization, LoyaltyCardController.createLoyaltyCard)
router.get('/loyalty-cards', Authorization, LoyaltyCardController.getLoyaltyCards)
router.get('/active-loyalty-card', Authorization, LoyaltyCardController.getActiveLoyaltyCards)
router.put('/loyalty-card', Authorization, LoyaltyCardController.updateLoyaltyCard)
router.get('/loyalty-card/:id', Authorization, LoyaltyCardController.getLoyaltyCard)
router.delete('/loyalty-card/:id', Authorization, LoyaltyCardController.removeLoyaltyCard)
router.get('/loyalty-cards-dropdown', Authorization, LoyaltyCardController.getLoyaltyCardsDropdown)

// Customer Loyalty Card
router.post('/customer-loyalty-card', Authorization, CustomerLoyaltyCardController.createCustomerLoyaltyCard)
router.get('/customer-loyalty-cards', Authorization, CustomerLoyaltyCardController.getCustomerLoyaltyCards)
router.get('/active-customer-loyalty-card', Authorization, CustomerLoyaltyCardController.getActiveCustomerLoyaltyCards)
router.put('/customer-loyalty-card', Authorization, CustomerLoyaltyCardController.updateCustomerLoyaltyCard)
router.get('/customer-loyalty-card/:id', Authorization, CustomerLoyaltyCardController.getCustomerLoyaltyCard)
router.delete('/customer-loyalty-card/:id', Authorization, CustomerLoyaltyCardController.removeCustomerLoyaltyCard)
router.post('/check-customer-loyalty-card', CustomerLoyaltyCardController.checkCustomerLoyaltyCards)
router.get('/customer-loyalty-cards-dropdown', Authorization, CustomerLoyaltyCardController.getCustomerLoyaltyCardsDropdown)

// Customer Loyalty Card Log
router.get('/customer-loyalty-card-log', Authorization, CustomerLoyaltyCardLogController.getCustomerLoyaltyCardLogs)

// QuickContactTemplate
router.post('/quick-contact-template', Authorization, QuickContactTemplate.createQuickContactTemplate)
router.get('/quick-contact-templates', Authorization, QuickContactTemplate.getQuickContactTemplates)
router.get('/active-quick-contact-templates', Authorization, QuickContactTemplate.getActiveQuickContactTemplates)
router.put('/quick-contact-template', Authorization, QuickContactTemplate.updateQuickContactTemplate)
router.get('/quick-contact-template/:id', Authorization, QuickContactTemplate.getQuickContactTemplate)
router.delete('/quick-contact-template/:id', Authorization, QuickContactTemplate.removeQuickContactTemplate)

// Customer Loyalty Card
router.post('/consultant-service-type-question', Authorization, ConsultantServiceTypeQuestionController.createConsultantServiceTypeQuestion)
router.get('/consultant-service-type-questions', Authorization, ConsultantServiceTypeQuestionController.getConsultantServiceTypeQuestions)
router.put('/consultant-service-type-question', Authorization, ConsultantServiceTypeQuestionController.updateConsultantServiceTypeQuestion)
router.get('/consultant-service-type-question/:id', Authorization, ConsultantServiceTypeQuestionController.getConsultantServiceTypeQuestion)
router.delete('/consultant-service-type-question/:id', Authorization, ConsultantServiceTypeQuestionController.removeConsultantServiceTypeQuestion)

// Package
router.post('/customer-reviews', CustomerReviewController.createCustomerReview)
router.get('/customer-reviews', Authorization, CustomerReviewController.getCustomerReviews)
router.put('/customer-reviews', Authorization, CustomerReviewController.updateCustomerReview)
router.get('/customer-reviews/:id', Authorization, CustomerReviewController.getCustomerReview)
router.delete('/customer-reviews/:id', Authorization, CustomerReviewController.removeCustomerReview)
router.get('/customer-specific-reviews', Authorization, CustomerReviewController.getCustomerSpecificReview)

// ConsultationFormController
router.get('/consultation-form', Authorization, ConsultationFormController.getConsultationForms)
router.post('/consultation-form', Authorization, ConsultationFormController.createConsultationForm)
router.put('/consultation-form', Authorization, ConsultationFormController.updateConsultationForm)
router.get('/consultation-form/:id', Authorization, ConsultationFormController.getConsultationForm)
router.delete('/consultation-form/:id', Authorization, ConsultationFormController.removeConsultationForm)
router.get('/consultation-form-specific', Authorization, ConsultationFormController.getConsultationFormsSpecific)
router.post('/get-consultation-form-question', ConsultationFormController.getConsultationFormQuestion)
router.get('/get-cleaning-form-question', Authorization, ConsultationFormController.getCleaningFormQuestion)
router.get('/copy-consultation-form-data', ConsultationFormController.copyConsultationFormData)

router.post('/copy-consultation-form-to-location', ConsultationFormController.copyConsultationFormToLocationData)
router.post('/copy-master-consultation-form-to-location', ConsultationFormController.copyMasterConsultationFormToLocationData)

// Cleaning Form
router.get('/cleaning-form', Authorization, CleaningFormController.getCleaningForms)
router.post('/cleaning-form', Authorization, CleaningFormController.createCleaningForm)
router.put('/cleaning-form', Authorization, CleaningFormController.updateCleaningForm)
router.get('/cleaning-form/:id', Authorization, CleaningFormController.getCleaningForm)
router.delete('/cleaning-form/:id', Authorization, CleaningFormController.removeCleaningForm)
router.get('/cleaning-form-specific', Authorization, CleaningFormController.getSpecificCleaningForms)
router.get('/cleaning-form-dropdown', Authorization, CleaningFormController.getCleaningFormsDropdown)

// WhatsAppLogs
router.get('/whatsapp-logs', Authorization, WhatsAppLogController.getWhatsAppLogs)
router.get('/whatsapp-logs/:id', Authorization, WhatsAppLogController.getWhatsAppLog)
router.post('/whatsapp-logs', Authorization, WhatsAppLogController.createWhatsAppLog)
router.delete('/whatsapp-logs/:id', Authorization, WhatsAppLogController.removeWhatsAppLog)

// ** Customer Gift Card
router.get('/customer-gift-cards', Authorization, CustomerGiftCardController.getCustomerGiftCards);
router.post('/customer-gift-cards', Authorization, CustomerGiftCardController.createCustomerGiftCard);
router.put('/customer-gift-cards', Authorization, CustomerGiftCardController.updateCustomerGiftCard);
router.get('/customer-gift-cards/:id', Authorization, CustomerGiftCardController.getCustomerGiftCard);
router.delete('/customer-gift-cards/:id', Authorization, CustomerGiftCardController.removeCustomerGiftCard);
router.post('/customer-gift-card-balance', Authorization, CustomerGiftCardController.getCustomerGiftCardBalance);
router.post('/redeem-customer-gift-card', Authorization, CustomerGiftCardController.redeemCustomerGiftCard);
router.get('/customer-gift-card-setting', Authorization, CustomerGiftCardController.getCompanyGiftCardDetails);

// Customer Wallet
router.get('/customer-wallet', Authorization, CustomerWalletController.getCustomerWallets)
router.post('/customer-wallet', Authorization, CustomerWalletController.createCustomerWallet)
router.put('/customer-wallet', Authorization, CustomerWalletController.updateCustomerWallet)
router.get('/customer-wallet/:id', Authorization, CustomerWalletController.getCustomerWallet)
router.delete('/customer-wallet/:id', Authorization, CustomerWalletController.removeCustomerWallet)
router.get('/customer-wallet-specific', Authorization, CustomerWalletController.getActiveCustomerWallets)

// UserDevice Token
router.get('/user-device-token', Authorization, UserDeviceTokenController.getUserDeviceTokens)
router.post('/user-device-token', Authorization, UserDeviceTokenController.createUserDeviceToken)
router.put('/user-device-token', Authorization, UserDeviceTokenController.updateUserDeviceToken)
router.get('/user-device-token/:id', Authorization, UserDeviceTokenController.getUserDeviceToken)
router.delete('/user-device-token/:id', Authorization, UserDeviceTokenController.removeUserDeviceToken)

/* Master Catelog */
// ** Mater Test (service test)
router.post('/master-tests', Authorization, MasterTestController.createMasterTest);
router.get('/master-tests', Authorization, MasterTestController.getMasterTests);
router.put('/master-tests', Authorization, MasterTestController.updateMasterTest);
router.get('/master-tests/:id', Authorization, MasterTestController.getMasterTest);
router.delete('/master-tests/:id', Authorization, MasterTestController.removeMasterTest);
router.get('/master-export-test-data', Authorization, MasterTestController.exportMasterTestDataToExcel);
router.get('/master-tests-search', Authorization, MasterTestController.searchMasterTestNames);

// ** Master Category (service type)
router.post('/master-categories', Authorization, MasterCategoriesController.createMasterCategory);
router.get('/master-categories', Authorization, MasterCategoriesController.getMasterCategories);
router.put('/master-categories', Authorization, MasterCategoriesController.updateMasterCategory);
router.get('/master-categories/:id', Authorization, MasterCategoriesController.getMasterCategory);
router.delete('/master-categories/:id', Authorization, MasterCategoriesController.removeMasterCategory);
router.get('/master-categories-dropdown', Authorization, MasterCategoriesController.getMasterCategoriesDropdown);
router.post('/master-export-category-data', Authorization, MasterCategoriesController.exportMasterCategoryDataToExcel);
router.get('/master-category-search', Authorization, MasterCategoriesController.searchMasterCategoryNames);

// ** Master Service (service)
router.post('/master-services', Authorization, MasterServicesController.createMasterService);
router.get('/master-services', Authorization, MasterServicesController.getMasterServices);
router.put('/master-services', Authorization, MasterServicesController.updateMasterService);
router.get('/master-services/:id', Authorization, MasterServicesController.getMasterService);
router.delete('/master-services/:id', Authorization, MasterServicesController.removeMasterService)
router.post('/master-services-dropdown', Authorization, MasterServicesController.getMasterServicesDropdown);
router.post('/master-export-services-data', Authorization, MasterServicesController.exportMasterServiceDataToExcel);
router.get('/master-services-search', Authorization, MasterServicesController.searchMasterServiceNames);

// ** Master Questions
router.post('/master-questions', Authorization, MasterQuestionsController.createMasterQuestion);
router.get('/master-questions', Authorization, MasterQuestionsController.getMasterQuestions);
router.put('/master-questions', Authorization, MasterQuestionsController.updateMasterQuestion);
router.get('/master-questions/:id', Authorization, MasterQuestionsController.getMasterQuestion);
router.delete('/master-questions/:id', Authorization, MasterQuestionsController.removeMasterQuestion);
router.post('/master-questions/remove', Authorization, MasterQuestionsController.removeMultipleMasterQuestion);

// ** Master Question Groups
router.post('/master-question-groups', Authorization, MasterQuestionGroupsController.createMasterQuestionGroup);
router.get('/master-question-groups', Authorization, MasterQuestionGroupsController.getMasterQuestionGroups);
router.put('/master-question-groups', Authorization, MasterQuestionGroupsController.updateMasterQuestionGroup);
router.get('/master-question-groups/:id', Authorization, MasterQuestionGroupsController.getMasterQuestionGroup);
router.delete('/master-question-groups/:id', Authorization, MasterQuestionGroupsController.removeMasterQuestionGroup);
router.get('/master-question-groups-dropdown', Authorization, MasterQuestionGroupsController.getMasterQuestionGroupsDropdown);

// ** Master Consultation Forms
router.post('/master-consultation-forms', Authorization, MasterConsultationFormsController.createMasterConsultationForm);
router.get('/master-consultation-forms', Authorization, MasterConsultationFormsController.getMasterConsultationForms);
router.put('/master-consultation-forms', Authorization, MasterConsultationFormsController.updateMasterConsultationForm);
router.get('/master-consultation-forms/:id', Authorization, MasterConsultationFormsController.getMasterConsultationForm);
router.delete('/master-consultation-forms/:id', Authorization, MasterConsultationFormsController.removeMasterConsultationForm);

// ** Master Email Templates
router.post('/master-email-templates', Authorization, MasterEmailTemplateController.createMasterEmailTemplate);
router.get('/master-email-templates', Authorization, MasterEmailTemplateController.getMasterEmailTemplates);
router.put('/master-email-templates', Authorization, MasterEmailTemplateController.updateMasterEmailTemplate);
router.get('/master-email-templates/:id', Authorization, MasterEmailTemplateController.getMasterEmailTemplate);
router.delete('/master-email-templates/:id', Authorization, MasterEmailTemplateController.removeMasterEmailTemplate);
router.get('/check-type-master-email-template-item', Authorization, MasterEmailTemplateController.checkTypeMasterEmailTemplateItem);

// ** Master Email Templates
router.post('/master-custom-parameters', Authorization, MasterCustomParameterController.createMasterCustomParameter);
router.get('/master-custom-parameters', Authorization, MasterCustomParameterController.getMasterCustomParameters);
router.put('/master-custom-parameters', Authorization, MasterCustomParameterController.updateMasterCustomParameter);
router.get('/master-custom-parameters/:id', Authorization, MasterCustomParameterController.getMasterCustomParameter);
router.delete('/master-custom-parameters/:id', Authorization, MasterCustomParameterController.removeMasterCustomParameter);
router.get('/master-custom-parameters-distinct', Authorization, MasterCustomParameterController.getDistinctMasterCustomParameters);
router.get('/check-key-master-custom-parameter-item', Authorization, MasterCustomParameterController.checkTypeMasterCustomParameterItem);
/* /Master Catelog */

// user booking api without Authorization
router.get('/booking/get-company', CompanyController.getCompanyByDomain)
router.get('/booking/get-company/:domain', CompanyController.getCompanyByDomain)
router.get('/booking/active-companies', CompanyController.getActiveCompanies)
router.get('/booking/active-locations', LocationController.getBookingActiveLocations)
router.get('/booking/active-categories', CategoryController.getActiveCategories)
router.post('/booking/available-employees', UserController.getAvailableEmployees)
router.post('/booking/get-employee-by-services', ServiceController.getEmployeeByServices)
router.get('/booking/services-specific', ServiceController.getServiceSpecific)
router.get('/booking/location-parameter', LocationController.getLocationParameter)
router.post('/booking/user-booking', AppointmentController.getUserBooking)
router.post('/booking/services-limit', ServiceController.checkServiceLimit)


//Appointment booking Process
router.post('/booking/process-appointments', AppointmentProcessController.createAppointmentProcess)
router.put('/booking/process-appointments', AppointmentProcessController.updateAppointmentProcess)

router.post('/booking/check-client-incomplete-appointment', AppointmentProcessController.checkClientIncompleteAppointment)

router.post('/booking/appointments', AppointmentController.createAppointment)
router.post('/booking/discount-specific', DiscountController.getDiscountSpecific)
router.post('/booking/create-applied-discount', DiscountController.createAppliedDiscount)
router.post('/booking/check-customer-offer', DiscountController.checkCustomerOffer)
//router.post('/booking/get-available-slot',  BlockTimeController.old_createAvailableSlot2)
router.post('/booking/get-available-slot', BlockTimeController.createAvailableSlot)

router.post('/booking/get-available-slot-new', BlockTimeController.createAvailableSlot)
router.get('/booking/company-color-specific/:company_id', CompanyBookingFormController.getCompanySpecificColor)
router.post('/booking/discount-slab-specific', DiscountSlabController.getDiscountSlabsSpecific)

router.get('/front/location-prices-data', LocationController.getLocationData)
router.get('/booking/check-customer-packages', CustomerPackageController.checkCustomerPackages)

// ** Customer Gift Card
router.post('/booking/customer-gift-card-balance', CustomerGiftCardController.getCustomerGiftCardBalance);
router.post('/booking/redeem-customer-gift-card', CustomerGiftCardController.redeemCustomerGiftCard);

// EmployeeNumberLog
router.post('/employee-number-log', UserController.createEmployeeNumberLog)
router.post('/employee-filter-log', UserController.createEmployeeFilterLog)

// Cron job api without authorization
router.get('/cron-job-first', CronJobController.cronJobFirst)
router.get('/cron-job-second', CronJobController.cronJobSecond)
router.get('/appointment-booked-service-cron-job', CronJobController.appointmentBookedServiceCronJob)
router.get('/package-session-service-cron-job', CronJobController.packageSessionCronJob)
router.get('/notify-client-after-three-month', CronJobController.notifyClientAfterThreeMonth)
router.get('/notify-client-on-birthday', CronJobController.notifyClientOnBirthday)
router.get('/notify-client-on-birthday-in-advanced', CronJobController.notifyClientOnBirthdayInAdvanced)
router.get('/notify-client-on-post-birthday', CronJobController.notifyClientOnPostBirthday)
router.get('/appointment-auto-complete', CronJobController.appointmentsAutoComplete)
router.get('/assign-cutomer-icon', CronJobController.assignCustomerIcon)
router.get('/send-monthly-sms-report', CronJobController.sendMonthlySmsReport)
router.get('/appointment-rewards', CronJobController.rewardsToAppointments)
router.get('/duplicate-rewards', CronJobController.duplicateRewards)
router.get('/sendapplive-resend-failed-sms', CronJobController.getSendAppLiveFailedSMS)
router.get('/send-whatsapp-initial-sms', CronJobController.sendInitialWhatsppMessage)
router.get('/sendapplive-send-initial-sms', CronJobController.getSendAppLiveInitialSMS)
router.get('/twilio-send-initial-sms', CronJobController.getTwilioInitialSMS)
router.get('/send-email-initial-status', CronJobController.sendEmailLogInitialStatus)
router.get('/send-offer-email-initial-status', CronJobController.sendOfferEmailLogInitialStatus)
router.get('/send-firebase-push-notification', CronJobController.sendFirebasePushNotificationToDevice)
router.get('/send-multiple-firebase-push-notification', CronJobController.sendMultiplePushNotification)

// Add cart api without authorization
router.get('/get-active-cart', CartController.getActiveCarts)
router.post('/add-service-to-cart', CartController.createCart)
router.post('/remove-service-from-cart', CartController.removeServiceFromCart)

// Third party open api
router.get('/front/search-category', CategoryController.searchCategoryService)
router.get('/front/search-service', ServiceController.searchService)


// test appointmentReport Url
router.get('/appointment-report', appointmentReport.appointmentReport)

//create paid timing
router.post('/create-paid-timing', PaidTimingController.create)
router.get('/find_paid_hours', PaidTimingController.findPaidTiming)
router.get('/check_if_paid', PaidTimingController.checkPaidTiming)

// Reschedule
router.get('/reschedule-booking-data/:id', RescheduleController.getRescheduleAppointmentDetail)
router.post('/reschedule-payment-agreement-email', RescheduleController.sendPaymentAgreementEmail) //not-in-use

router.get('/customer-loyalty-log-transform-script', CustomerLoyaltyCardLogController.getTransformToObjectIdLogScript)

router.get('/send-test-email', UserController.sendTestEmail)

// router.get('/booking-consultant-blank-null-script', ConsultationFormController.getBookingConsultantBlankNullScript)

router.get('/que-group-convert-to-object', QuestionGroupController.getQuestionGroupsConvertToObject)
// router.get('/que-group-convert-consultation-form', ConsultationFormController.getQuestionGroupToConsultationForm)


//For Client Notes
router.post('/client-notes', Authorization, clientNoteController.createClientNote);
router.get('/client-notes/:location_Id/:client_Id', Authorization, clientNoteController.getClientNotes);
router.put('/client-notes/:id', Authorization, clientNoteController.updateClientNote);
router.delete('/client-notes/:id', Authorization, clientNoteController.deleteClientNote);


//For Update Master Collection ID in Test,Service & Category
router.post('/update-tests-collection', DbScriptController.updateTestsCollection);
router.post('/update-categories-collection', DbScriptController.updateCategoriesCollection);
router.post('/update-services-collection', DbScriptController.updateServicesCollection);

//For update the appointment-data & loyalty-card-logs-data 
router.post('/update-appointment-data', updateAppointments.updateAppointments);
router.post('/update-customer-loyalty-card-logs-data', updateAppointments.updateCustomerLoyaltyCardLogs);


// ** Gift Card Transaction
router.get('/gift-card-transactions', Authorization, GiftCardTransactionController.getGiftCardTransactions);
router.get('/gift-card-transaction/:id', Authorization, GiftCardTransactionController.getGiftCardTransaction);
router.post('/gift-card-transaction', Authorization, GiftCardTransactionController.createGiftCardTransaction);
router.put('/gift-card-transaction', Authorization, GiftCardTransactionController.updateGiftCardTransaction);
router.delete('/gift-card-transaction/:id', Authorization, GiftCardTransactionController.removeGiftCardTransaction);

// For Update the 
router.post('/update-question-group-data', updateAppointments.updateQuestionGroups);
router.post('/update-question-data', updateAppointments.updateQuestions);
router.post('/update-custom-parameters-data', updateAppointments.updateCustomParameters);
router.post('/update-cron-job-parameters-data', updateAppointments.updateCronJobParameters);

router.post('/update-discount', DbScriptController.updateDiscount);
router.post('/sendWhatsAppMessageTest', sendWhatsAppMessageTest);
router.post('/sendTestMessageTest', sendSMSTest);
router.get('/undefined-discount-walog', DbScriptController.undefinedDiscountWAlog);


module.exports = router;
