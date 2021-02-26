require("dotenv").config();
var AWS = require("aws-sdk");

const hashTable = {}

let queue = new AWS.SQS({
    region: process.env.aws_region,
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key
});

var queueUrl = {}

queue.getQueueUrl({
    QueueName: process.env.aws_request_queue
}).promise().then((data)=>{
    queueUrl[process.env.aws_request_queue] = data.QueueUrl;
}).catch((err) => {
    console.log("Error", err);
});

queue.getQueueUrl({
    QueueName: process.env.aws_response_queue
}).promise().then((data)=>{
    queueUrl[process.env.aws_response_queue] = data.QueueUrl;
}).catch((err) => {
    console.log("Error", err);
});

function deleteMessage(queueName, message){
    const params = {
        QueueUrl: queueUrl[queueName],
        ReceiptHandle: message.ReceiptHandle
        };
    queue.deleteMessage(params).promise().then((data)=>{
        console.log("Message Deleted", data);
    }).catch((err) => {
        console.log("Error", err);
    });
}

function sendMessage(queueName, message, callback){
    const params = {
        DelaySeconds: 0,
        MessageBody: message,
        QueueUrl: queueUrl[queueName]
    };
    queue.sendMessage(params).promise().then((data)=>{
        console.log("Success sendMessage", data.MessageId);
        callback();
    }).catch((err)=>{
        console.log("Error", err);
    });
}

function receiveMessage(queueName, key, callback){
    if (key in hashTable){
        callback(hashTable[key]);
        delete hashTable[key];
    }else{
        const params = {
            MaxNumberOfMessages: 1,
            VisibilityTimeout: 15,
            WaitTimeSeconds: 0,
            QueueUrl: queueUrl[queueName]
        };
        queue.receiveMessage(params).promise().then((data)=>{
            if (data.Messages && data.Messages.length != 0){
                const message = data.Messages[0];
                console.log("Success receiveMessage", message.Body);
                deleteMessage(queueName, message);
                var values = message.Body.split('#');
                const image = values[0];
                const prediction = values[1];
                hashTable[image] = prediction;
            }
            receiveMessage(queueName, key, callback);
        }).catch((err)=>{
            console.log("Error", err);
        });
    }
}

function getNumberOfMessages(queueName, callback){
    const params = {
        QueueUrl: queueUrl[queueName],
        AttributeNames: ['ApproximateNumberOfMessages']
    };
    queue.getQueueAttributes(params).promise().then((data)=>{
        callback(data.Attributes.ApproximateNumberOfMessages);
    }).catch((err)=>{
        console.log("Error", err);
    });
}

module.exports = {
    sendMessage,
    receiveMessage,
    getNumberOfMessages
};

