// Gettign the Newly created Mongoose Model we just created 
var Machine = require('../models/Machine.model')
var Service = require('../models/Service.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Machine List
exports.getMachines = async function (query, page, limit, order_name, order, searchText) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {}
        sort[order_name] = order

        // if(searchText && searchText != '') {
        //     query['$text'] = { $search: searchText, $language:'en',$caseSensitive:false};
        // }

        const facetedPipeline = [
            { $match: query },
            { $sort: sort },
            {
                "$facet": {
                    "data": [
                        { "$skip": page },
                        { "$limit": limit }
                    ],
                    "pagination": [
                        { "$count": "total" }
                    ]
                }
            },
        ]

        var machines = await Machine.aggregate(facetedPipeline)

        // Return the Machined list that was retured by the mongoose promise
        return machines
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Machines')
    }
}

exports.getActiveMachines = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var machines = await Machine.find(query)

        // Return the Machined list that was retured by the mongoose promise
        return machines
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding Machines')
    }
}

exports.getMachine = async function (id) {
    try {
        // Find the Data 
        var _details = await Machine.findOne({ _id: id }).populate({
                path: 'services',
                model: Service,
                select: {
                    _id: 1, name: 1, tax: 1, hide_strike_price: 1, commission: 1, base_val: 1, tax_val: 1, old_price: 1, name: 1, price: 1, special_price: 1, actual_price: 1, variable_price: 1, deposite_type: 1, deposite: 1, min_deposite: 1, is_start_from: 1, start_from_title: 1, is_price_range: 1, max_price: 1,
                }
            })

        return _details || {}
    } catch (e) {
        return {}
        // return a Error message describing the reason     
        //throw Error("Machine not available");
    }
}

// getting all Machines for company copy
exports.getMachinesCompanySpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var machines = await Machine.find(query)

        // Return the Serviced list that was retured by the mongoose promise
        return machines
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Machine')
    }
}

exports.getMachinesbyLocation = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var machines = await Machine.find(query)

        // Return the Machines list that was retured by the mongoose promise
        return machines
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Machine')
    }
}

exports.getSingleMachineByName = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var machines = await Machine.findOne(query)

        // Return the machines list that was retured by the mongoose promise
        return machines
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Machine')
    }
}


exports.createMachine = async function (machine) {
    var newMachine = new Machine({
        location_id: machine.location_id ? machine.location_id : "",
        category_id: machine.category_id ? machine.category_id : "",
        name: machine.name ? machine.name : "",
        desc: machine.desc ? machine.desc : "",
        services: machine.services ? machine.services : [],
        limit: machine.status ? machine.status : 0,
        status: machine.status ? machine.status : 0
    })

    try {
        // Saving the Machine 
        var savedMachine = await newMachine.save();
        return savedMachine;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Machine")
    }
}

exports.updateMachine = async function (machine) {
    var id = machine._id
    try {
        //Find the old Machine Object by the Id
        var oldMachine = await Machine.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Machine")
    }
    // If no old Machine Object exists return false
    if (!oldMachine) {
        return false;
    }

    //Edit the Machine Object
    if (machine.name) {
        oldMachine.name = machine.name
    }


    if (machine.location_id) {
        oldMachine.location_id = machine.location_id;
    }

    oldMachine.services = machine.services ? machine.services : [];
    oldMachine.limit = machine.limit ? machine.limit : 0;
    oldMachine.desc = machine.desc ? machine.desc : "";
    oldMachine.status = machine.status ? machine.status : 0;


    try {
        var savedMachine = await oldMachine.save()
        return savedMachine;
    } catch (e) {
        throw Error("And Error occured while updating the Machine");
    }
}

exports.deleteMachine = async function (id) {
    // Delete the Machine
    try {
        var deleted = await Machine.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Machine Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the Machine")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the Multiple Machine
    try {
        var deleted = await Machine.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the Machine")
    }
}