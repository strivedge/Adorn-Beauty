const express = require('express')
const router = express.Router()

const v1Router = require('./v1/index')
const adminRouter = require('./v1/admin')
const customerRouter = require('./v1/customer')
const sassRouter = require('./v1/sass')
const catalougeRouter = require('./v1/catalouge')

router.use('/', v1Router)
router.use('/admin', adminRouter)
router.use('/customer', customerRouter)
router.use('/sass', sassRouter)
router.use('/catalogue', catalougeRouter)

module.exports = router