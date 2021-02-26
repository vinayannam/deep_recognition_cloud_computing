require("dotenv").config();
var AWS = require("aws-sdk");
var sqs = require('./sqs')
var ec2 = require('./ec2')

var totalInstanceIds = []

function scaleInScaleout(currentInstance){
    try{
        sqs.getNumberOfMessages(process.env.aws_request_queue, (numberOfMessages) => {
            try{
                console.log('numberOfMessages: ', numberOfMessages)
                ec2.getNumberOfInstances((numberOfAppInstances) => {
                    console.log('numberOfAppInstances: ', numberOfAppInstances)
                    if (numberOfMessages > 0 && numberOfMessages > numberOfAppInstances){
                        const available = process.env.aws_max_app_instances - numberOfAppInstances;
                        console.log('available: ', available)
                        if (available > 0){
                            var required  = numberOfMessages - numberOfAppInstances;
                            console.log('required: ', required)
                            if(required >= available){
                                required = available;
                            }
                            ec2.createInstances(required, currentInstance, (existingInstances, instanceIds) => {
                                totalInstanceIds = totalInstanceIds.concat(instanceIds);
                                console.log('Success createInstances', totalInstanceIds);
                                setTimeout(() => {
                                    scaleInScaleout(existingInstances);
                                }, 1000)
                            });
                        }
                        else{
                            scaleInScaleout(currentInstance)
                        }
                    }
                    else{
                        scaleInScaleout(currentInstance)
                    }
                });
            }catch(err) {
                scaleInScaleout(currentInstance);
            }
        })
    }catch(err) {
        scaleInScaleout(currentInstance);
    } 
}

module.exports = {
    scaleInScaleout
}