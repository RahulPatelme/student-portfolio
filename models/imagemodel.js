//this models/imagemodel is to create a schema for portfolio
//packages must be downloaded in the system
var mongoose = require('mongoose'); 

//create a portfolio schema 
var imageSchema = new mongoose.Schema({ 
    fname: String,
    lname: String,
    email: String,
    department: String,
    PTitle: String, 
    Description: String, 
    ITitile: String,
    url: String,
    group: String,
    img: 
    { 
        data: Buffer, 
        contentType: String 
    } 
}); 
  
//Image is a model which has a schema imageSchema   
module.exports = new mongoose.model('projectDetails', imageSchema); 