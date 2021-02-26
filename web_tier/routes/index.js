require("dotenv").config();
var s3 = require('../services/s3')
var sqs = require('../services/sqs')
var loadBalance = require('../services/loadBalance')
var express = require('express');
var multer  = require('multer')

var router = express.Router();

var storage = multer.memoryStorage();
var upload = multer({ storage: storage })

var s3InputURI = 's3://'+process.env.aws_input_bucket+'/';

setTimeout(() => {
  loadBalance.scaleInScaleout(0)
}, 1000);

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Deep Recognition' });
});

router.post('/', upload.single('file'), (req,res) => {
  const timestamp = new Date().toISOString();
  const file = req.file;
  const key = timestamp.replace(/:/g, '-')+'-'+file.originalname;
  const imageURI = s3InputURI+key;
  s3.upload(process.env.aws_input_bucket, key, file, res, ()=>{
    sqs.sendMessage(process.env.aws_request_queue, imageURI, ()=>{
      sqs.receiveMessage(process.env.aws_response_queue, imageURI, (prediction)=>{
        res.send(key+' : '+prediction);
      });
    });
  });
})

module.exports = router;
