require("dotenv").config();
var AWS = require("aws-sdk");

let bucket = new AWS.S3({
    region: process.env.aws_region,
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key
});

function upload(bucketName, key, file, res, callback){
    var params = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read"
    };
    bucket.upload(params).promise().then((data) => {
        console.log('Succesfully uploaded to the bucket...', data);
        callback();
    }).catch((err) => {
        res.status(500).json({ error: true, Message: err });
    });
}

module.exports = {
    upload
};

