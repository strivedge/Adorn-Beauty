const Catalouge_content_Service = require("../services/catalogue.service")


exports.createContent = async function (req, res) {
    try {
        let contentData = req.body;
        if (!contentData) {
            return res.status(200).json({ status: 200, flag: false, message: 'Data is not provided' });
        }
        let newContent = await Catalouge_content_Service.create(contentData);
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

exports.updateContent = async function (req, res) {
    try {
        let id = req.body._id;
        if (!id) {
            return res.status(200).json({ status: 200, flag: false, message: 'Content id must be present' });
        }
        let updateContentData = {}
        updateContentData._id = id;
        updateContentData.images = req.body.images;
        updateContentData.services = req.body.services
        updateContentData.title = req.body.title
        updateContentData.location_id = req.body.location_id

        let content = await Catalouge_content_Service.update(updateContentData);
        return res.status(200).json({
            status: 200,
            flag: true,
            data: content,
            message: 'content updated successfully'
        });

    } catch (error) {
        return res.status(200).json({ status: 200, flag: false, message: 'Issue with update content' });
    }
}

exports.getContents = async function (req, res) {
    try {
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 0;
        let skip = (page - 1) * limit;
        let locationId = req.query.location_id

        let query = {};
        query.soft_delete = false;
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
        let Contents = await Catalouge_content_Service.getContents(query, limit, skip);
        let count = await Catalouge_content_Service.getContentsCount(query);
        let pageData = {
            page: page,
            limit: limit,
            total: count,
        }

        if (Contents) {
            return res.status(200).json({ status: 200, flag: true, data: Contents, page_data: pageData, message: "Contents get successfully" })
        }
    } catch (e) {
        console.log('error in get Contents controller', e)
        return res.status(200).json({ status: 200, flag: false, message: 'Issue with get Contents' });
    }
}

exports.getContent = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        if (!id) {
            return res.status(200).json({ status: 200, flag: false, message: "Id in params is required" });

        }
        var Cataloge_Content = await Catalouge_content_Service.getContent(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Cataloge_Content, message: "Successfully Content Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}


exports.softDelete = async function (req, res) {
    try {
        if (!req.params.id) {
            return res.status(200).json({status: 200, flag: false, message: 'Content id must be present'});
        }
        let Content = await Catalouge_content_Service.softDelete(req.params.id);
        if (!Content) {
            return res.status(200).json({status: 200, flag: false, message: 'Issue with delete Content'});
        }
        return res.status(200).json({
            status: 200,
            flag: true,
            data: Content,
            message: 'Content deleted successfully'
        });
    } catch (e) {
        console.log('error in soft delete Content controller', e)
        return res.status(200).json({status: 200, flag: false, message: 'Issue with delete Content'});
    }
}