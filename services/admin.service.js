// Gettign the Newly created Mongoose Model we just created 
var Admin = require('../models/Admin.model');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Admin List
exports.getAdmins = async function (query, page, limit) {

    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var Admins = await Admin.paginate(query, options)
        // Return the Admind list that was retured by the mongoose promise
        return Admins;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Admins');
    }
}

exports.getAdmin = async function (id) {

    try {
        // Find the User 
        var _details = await Admin.findOne({
            _id: id
        });
        if(_details._id){
            return _details;
        }else{
            throw Error("Admin not available");
        }
        
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Admin not available");
    }

}

exports.getAdminByEmail = async function(email){

    try {
        // Find the User 
        var _details = await Admin.findOne({
            email: email
        });
        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("User not available");
    }
}

exports.createAdmin = async function (user) {

    var hashedPassword = bcrypt.hashSync(user.password, 8);
    var newAdmin = new Admin({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        status: user.status ? user.status : 1,
        picture: user.picture ? user.picture : "",  
    })

    try {
        // Saving the Admin 
        var savedAdmin = await newAdmin.save();
        return savedAdmin;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Admin")
    }
}

exports.updateAdmin = async function (user) {

    var id = user._id
    try {

        //Find the old Admin Object by the Id
        var oldAdmin = await Admin.findById(id);

    } catch (e) {
        throw Error("Error occured while Finding the Admin")
    }
    // If no old Admin Object exists return false
    if (!oldAdmin) {
        return false;
    }

    //Edit the Admin Object
    oldAdmin.name = user.name
    oldAdmin.email = user.email

    if(user.password){
        oldAdmin.password = bcrypt.hashSync(user.password, 8);
    } 

    if(user.status){
        oldAdmin.status = user.status;
    }    

    if(user.picture){
        oldUser.picture = user.picture;
    }

    try {
        var savedAdmin = await oldAdmin.save()
        return savedAdmin;
    } catch (e) {
        throw Error("And Error occured while updating the Admin");
    }
}

exports.deleteAdmin = async function (id) {

    // Delete the Admin
    try {
        var deleted = await Admin.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Admin Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Admin")
    }
}


exports.loginAdmin = async function (user) {

    // Creating a new Mongoose Object by using the new keyword
    try {

        // Find the Admin 
        var _details = await Admin.findOne({
            email: user.email
        });

        console.log('details >> \n',_details)

        if (_details) {

            var passwordIsValid = bcrypt.compareSync(user.password, _details.password);
        
            if (!passwordIsValid) throw Error("Invalid username/password")
            
            return _details;

        }else{
          throw Error("Invalid username")
          return _details;
        }
    
    } catch (e) {
        console.log('Service error >> \n',e)
        // return a Error message describing the reason     
        throw Error("Error while Login Admin")
    }

}