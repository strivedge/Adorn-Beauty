// Saving the context of this module inside the _the variable
var base64ToImage = require('base64-to-image');
var fs = require('fs');

_this = this


// Async function to get the Test List
exports.saveImage = async function (imgString,imgSavePath) {
    try {
        const url = imgString;
        const imgName = "img-"+ new Date().getTime()+'.jpg';
        const path = imagePath + imgName;  

        var root_path = require('path').resolve('public');
        var imagePath = root_path + imgSavePath;

        var mkDir = await fs.promises.mkdir(imagePath, { recursive: true })
       
        var isImage = await this.isValidUrl(imgString).then( data => {
            return data;
        });

        // console.log("imgString",imgString.startsWith("data:"))
        // console.log("\n IsImage >>>>>>>>>>",isImage,"\n");

        if(isImage) {
            const url = imgString;
            const imgName = "img-"+ new Date().getTime()+'.jpg';
            const path = imagePath + imgName;

            const fs = require('fs');
            const fetch = require('node-fetch');

            //const url = "https://www.google.com/images/srpr/logo3w.png"

            const response = await fetch(url);
            const buffer = await response.buffer();
            fs.writeFile(path, buffer, () => 
                console.log('finished downloading!',path) );

            return (imgSavePath + imgName).replace(/^\/|\/$/g, '');

            /*
            const fs = require('fs')
            const request = require('request')

            console.log("\nImported >>>>>>",isImage,"\n");
            const download = async (url, path, callback) => {
                request.head(url, (err, res, body) => {
                    console.log("err:",err)
                     request(url)
                    .pipe(fs.createWriteStream(path))
                    .on('close', callback)
                })
            }

            const url = imgString;
            const imgName = "img-"+ new Date().getTime()+'.jpg';
            const path = imagePath + imgName;

            console.log("\n url >>>>>>>>>>",url,"\n");

            console.log("\n path >>>>>>>>>>",path,"\n");

            var savedImage = await download(url, path, () => {

                console.log("\n imgSavePath >>>>>>>>>>",imgSavePath + imgName,"\n");

               // return imgSavePath + imgName;
            })

            return (imgSavePath + imgName).replace(/^\/|\/$/g, '');*/

        } else if(imgString.startsWith("data:")){
            // Create New User image       
            var imageInfo = base64ToImage(imgString,imagePath);
            return (imgSavePath + imageInfo.fileName).replace(/^\/|\/$/g, '');

        }
    } catch (e) {
        console.log('img ser',e)
        console.log("\n\nImage update Issaues >>>>>>>>>>>>>>\n\n");
    }
}


exports.isValidUrl = async function (str) {
    //console.log("string",str)
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;  
    }

    return url.protocol === "http:" || url.protocol === "https:";

    // if (str ==='' || str.trim() ===''){ return false; }
    // try {
    //     return btoa(atob(str)) == str;
    // } catch (err) {
    //     return false;
    // }
}