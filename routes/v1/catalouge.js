const express = require('express');
const router = express.Router();
const CatalogueController = require("../../controllers/catalogue.controller")
const CatalogePagesController = require("../../controllers/catalogepages.controller")
const locationController = require("../../controllers/locations.cataloge.controller")
// ** Controllers

router.post('/content', CatalogueController.createContent)
router.put('/content/update', CatalogueController.updateContent)
router.get('/getcontents', CatalogueController.getContents)
router.get('/getcontent/:id', CatalogueController.getContent)
router.delete('/remove/content/:id', CatalogueController.softDelete)

router.post('/page', CatalogePagesController.create)
router.put('/page/update', CatalogePagesController.updateCatalogPage)
router.get('/page/catalogepages', CatalogePagesController.getCatalogePages)
router.get('/getpage/:id', CatalogePagesController.getCatalogePage)
router.delete('/remove/page/:id', CatalogePagesController.softDelete)


router.get('/getlocations', locationController.getLocations)

// front 

router.get('/front/pages', CatalogePagesController.getCatalogePagesFront)

// router.get('')


module.exports = router