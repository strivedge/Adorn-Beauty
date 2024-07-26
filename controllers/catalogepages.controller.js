const Catalouge_page_Service = require("../services/catalogpages.service")

exports.createCatalogPage = async function (req, res) {
    try {
        let contentData = req.body;
        if (!contentData.dataArray) {
            return res.status(200).json({ status: 200, flag: false, message: 'Data is not provided' });
        }
        if (!contentData.location_id) {
            return res.status(200).json({ status: 200, flag: false, message: 'Location is not provided' });
        }

        let newContent = await Catalouge_page_Service.create(contentData);
        if (newContent) {
            return res.status(200).json({
                status: 200,
                flag: true,
                data: newContent,
                message: 'Content created successfully'
            });
        }

    } catch (error) {
        return res.status(200).json({ status: 200, flag: false, message: 'Issue with create Content' });
    }
}


exports.create = async function (req, res) {
    try {
        let location_id = req.body.location_id;
        let dataArray = req.body.dataArray
        let pageTitle = req.body.pageTitle
        let resultArray = []; // Initialize an array to store the validated items
        // if (req.body.position && !req.body.image) {
        //     return res.status(200).json({
        //         status: 200,
        //         flag: false,
        //         message: 'Image Is Required'
        //     });
        // }
        // if (!req.body.position && req.body.image) {
        //     return res.status(200).json({
        //         status: 200,
        //         flag: false,
        //         message: 'Image Position Required'
        //     });
        // }
        if (!location_id) {
            return res.status(200).json({ status: 200, flag: false, message: 'Location is not provided' });
        }


        for (let item of dataArray) {
            let { image, position, selectedItem } = item;
            let itemObj = {};

            // Validate each item here if needed
            if (!position && image) {
                return res.status(400).json({ status: 400, flag: false, message: 'Image Position Required' });
            }

            // if (position && !image) {
            //     return res.status(400).json({ status: 400, flag: false, message: 'Image Is Required' });
            // }

            itemObj.image = image ? image : '';
            itemObj.position = position ? position : '';
            // itemObj.category = selectedItem.category.value;
            itemObj.service = selectedItem.service;
            itemObj.title = selectedItem.title
            // Push the validated itemObj into the resultArray
            resultArray.push(itemObj);
        }

        let newContent = await Catalouge_page_Service.create({ location_id, resultArray, pageTitle });

        if (newContent) {
            return res.status(200).json({
                status: 200,
                flag: true,
                data: newContent,
                message: 'Content created successfully'
            });
        }

    } catch (error) {

    }
}
exports.updateCatalogPage = async function (req, res) {
    try {
        let id = req.body._id;
        if (!id) {
            return res.status(200).json({ status: 200, flag: false, message: 'Catalog Page id must be present' });
        }

        let updateCatalogPageData = {}
        updateCatalogPageData._id = id;
        updateCatalogPageData.pageTitle = req.body.pageTitle
        // updateCatalogPageData.content = req.body.content
        let resultArray = [];
        let dataArray = req.body.dataArray
        for (let item of dataArray) {
            let { image, position, selectedItem } = item;
            let itemObj = {};

            // Validate each item here if needed
            if (!position && image) {
                return res.status(400).json({ status: 400, flag: false, message: 'Image Position Required' });
            }

            // if (position && !image) {
            //     return res.status(400).json({ status: 400, flag: false, message: 'Image Is Required' });
            // }

            itemObj.image = image ? image : '';
            itemObj.position = position ? position : '';
            // itemObj.category = selectedItem.category.value;
            itemObj.service = selectedItem.service;
            itemObj.title = selectedItem.title
            // Push the validated itemObj into the resultArray
            resultArray.push(itemObj);
        }

        let catalogPages = await Catalouge_page_Service.update(updateCatalogPageData, resultArray);
        return res.status(200).json({
            status: 200,
            flag: true,
            data: catalogPages,
            message: 'Catalog Pages updated successfully'
        });

    } catch (error) {
        return res.status(200).json({ status: 200, flag: false, message: 'Issue with update content' });
    }
}


exports.getCatalogePages = async function (req, res) {
    try {
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 0;
        let skip = (page - 1) * limit;
        let locationId = req.query.location_id

        let query = {};
        query.soft_delete = false;
        // query.status = true;
        query.location_id = locationId
        if (req.query.search) {
            //search by name or email
            let search = req.query.search.trim();
            query['$or'] = [
                { title: { $regex: search, $options: 'i' } }]
        }
        if (!locationId) {
            return res.status(200).json({ status: 200, flag: false, message: "Location Id is required" })

        }
        let Contents = await Catalouge_page_Service.getCatalogePages(query, limit, skip);
        let count = await Catalouge_page_Service.getPagesCount(query);
        let pageData = {
            page: page,
            limit: limit,
            total: count,
        }
        if (Contents) {
            return res.status(200).json({ status: 200, flag: true, data: Contents, page_data: pageData, message: "Cataloge Pages get successfully" })
        }
    } catch (e) {
        console.log('error in get Cataloge Pages controller', e)
        return res.status(200).json({ status: 200, flag: false, message: 'Issue with get Cataloge Pages' });
    }
}
exports.getCatalogePagesFront = async function (req, res) {
    try {
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 0;
        let skip = (page - 1) * limit;
        let locationId = req.query.location_id

        let query = {};
        query.soft_delete = false;
        // query.status = true;
        query.location_id = locationId
        if (req.query.search) {
            //search by name or email
            let search = req.query.search.trim();
            query['$or'] = [
                { title: { $regex: search, $options: 'i' } }]
        }
        if (!locationId) {
            return res.status(200).json({ status: 200, flag: false, message: "Location Id is required" })

        }
        let Contents = await Catalouge_page_Service.getCatalogePagesFront(query, limit, skip);
        let count = await Catalouge_page_Service.getPagesCount(query);
        let pageData = {
            page: page,
            limit: limit,
            total: count,
        }
        if (Contents) {
            return res.status(200).json({ status: 200, flag: true, data: Contents, page_data: pageData, message: "Cataloge Pages get successfully" })
        }
    } catch (e) {
        console.log('error in get Cataloge Pages controller', e)
        return res.status(200).json({ status: 200, flag: false, message: 'Issue with get Cataloge Pages' });
    }
}


exports.getCatalogePage = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        if (!id) {
            return res.status(200).json({ status: 200, flag: false, message: "Id in params is required" });

        }
        var Cataloge_page = await Catalouge_page_Service.getCatalogePage(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Cataloge_page, message: "Successfully Page Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}


exports.softDelete = async function (req, res) {
    try {
        if (!req.params.id) {
            return res.status(200).json({ status: 200, flag: false, message: 'Page id must be present' });
        }
        let Content = await Catalouge_page_Service.softDelete(req.params.id);
        if (!Content) {
            return res.status(200).json({ status: 200, flag: false, message: 'Issue with delete page' });
        }
        return res.status(200).json({
            status: 200,
            flag: true,
            data: Content,
            message: 'page deleted successfully'
        });
    } catch (e) {
        console.log('error in soft delete page controller', e)
        return res.status(200).json({ status: 200, flag: false, message: 'Issue with delete page' });
    }
}