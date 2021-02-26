require("dotenv").config();
var AWS = require('aws-sdk');

let ec2 = new AWS.EC2({
    region: process.env.aws_region,
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key
});

function createInstances(maxInstances, existingInstances, callback){
    var instanceParams = {
        ImageId: process.env.aws_auto_scale_instance_ami_id, 
        InstanceType: process.env.aws_auto_scale_instance_type,
        KeyName: process.env.aws_key_name,
        SecurityGroupIds:[process.env.aws_security_group_id],
        MinCount: 1,
        MaxCount: 1
    };
    if (maxInstances > 1){
        instanceParams.MinCount = maxInstances - 1
    }
    instanceParams.MaxCount = maxInstances
    ec2.runInstances(instanceParams).promise().then((data) => {
        var instanceIds = []
        data.Instances.forEach((instance, index) => {
            var instanceId = instance.InstanceId;
            instanceIds.push(instanceId);
            console.log("Created instance", instanceId);
            var tagParams = {
                Resources:  [instanceId], 
                Tags:   [
                    { Key: 'Name', Value: 'app-instance'+ (existingInstances + index + 1) },
                    { Key: 'Purpose', Value: 'app-tier' }
                ]
            };
            ec2.createTags(tagParams).promise().then((data) => {}).catch((err) => {
                console.error(err, err.stack);
            });
        })
        existingInstances += instanceIds.length;
        callback(existingInstances, instanceIds)
    }).catch((err) => {
        console.log("Error", err);
    });
}

function terminateInstances(instanceIds, callback){
    ec2.terminateInstances({
        InstanceIds: instanceIds
    }).promise().then((data) =>{
        console.log('Terminated', data);
        callback();
    }).catch((err) => {
        console.log("Error", err);
    });
}

function getNumberOfInstances(callback){
    var params = { 
        Filters: [ 
            { Name: 'instance-state-name', Values: ['running', 'pending'] },
            { Name: "tag:Purpose",  Values: ["app-tier"] }
        ]
    };
    ec2.describeInstances(params).promise().then((data) => {
        var numberOfAppInstances = 0
        data.Reservations.forEach((reservation) =>{
            numberOfAppInstances += reservation.Instances.length;
        })
        callback(numberOfAppInstances);
    }).catch((err) => {
        console.log("Error", err);
    });
}

module.exports = {
    createInstances,
    terminateInstances,
    getNumberOfInstances
}