'use strict';
var express = require('express');
var path = require('path');
var https = require('https');
var bodyParser = require('body-parser');
var session = require('express-session');
var logout = require('express-passport-logout');
var passportHttp = require('passport-http');
const { urlencoded } = require('express');
var bodyParser = require('body-parser');
const { brotliDecompressSync } = require('zlib');
const { stringify } = require('querystring');
var urlencodedParser = bodyParser.urlencoded({extended: false})

var PORT  = process.env.PORT || 5000;

var app = express();
var userInfo = new Object();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.static( "views" ) );

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) { // หน้าlogin
    res.render('login',{'status': true});

});

var udata;

app.post('/login', urlencodedParser, function(req, res){
    var data = {
       'username': req.body.username,
       'password': req.body.password
    }
    console.log(data);
    console.log(tuApi(data));
    async function main() {
        try{
            userInfo = await tuApi(data);
            console.log(userInfo);
            udata = userInfo;
            if(userInfo.status == true){
                if(userInfo.type != "student"){
                    res.render('mainpage',udata);
            }
                res.render('mainStudent', udata);
            }else {
                console.log('wrong data');
                res.render('login', {'status': false} );
                }
            }catch(error){
                console.log(error);
            }
        }
    main();

});

app.listen(PORT, function () {
    console.log(`Listening on ${PORT}`)
});

//tu api request
async function tuApi(data){ 
    return new Promise(function( resolve, reject) {
        var options = {
            'method': 'POST',
            'hostname': 'restapi.tu.ac.th',
            'path': '/api/v1/auth/Ad/verify',
            'headers': {
            'Content-Type': 'application/json',
            'Application-Key': 'TUd385e507f10b7b04ec0c73d853e9ae18a332e504be6a734cafe5527017c2be83b1040a9c3f22ed82a441bfa5dee16f58'
            },
        };

        var userInfo;

        var request = https.request(options, function (res) {
            var chunks = [];
        
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
        
            res.on("end", function (chunk) {
                var body = Buffer.concat(chunks);
                userInfo = JSON.parse(body);
                resolve(userInfo);
            });
        
            res.on("error", function (error) {
                console.error(error);
            });
        });
        
        var postData =  `{\n\t\"UserName\":\"${data.username}\",\n\t\"PassWord\":\"${data.password}\"\n}`;
        request.write(postData);
        
        request.end();
        
    })
}

async function getStudentData(data){ 
    return new Promise(function(resolve, reject) {
        var options = {
            'method': 'GET',
            'hostname': 'restapi.tu.ac.th',
            'path': `/api/v2/profile/std/info/?id=${data}`,
            'headers': {
              'Content-Type': 'application/json',
              'Application-Key': 'TUd385e507f10b7b04ec0c73d853e9ae18a332e504be6a734cafe5527017c2be83b1040a9c3f22ed82a441bfa5dee16f58'
            }
        };
          
        var req = https.request(options, function (res) {
            var chunks = [];
        
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
        
            res.on("end", function (chunk) {
                let body = Buffer.concat(chunks);
                let studentData = JSON.parse(body);
                resolve(studentData);
            });
        
            res.on("error", function (error) {
                console.error(error);
            });
        });
        
        req.end();
        
    })
}

function checkJsonEmpty(obj){
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}


app.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
});

app.get('/inboxStaff', function(req, res) {
    res.render('inboxForStaff',udata);
    //res.render('inboxForStaff');
});

app.get('/status', function(req, res) {
	res.render('formStatusForStu',udata);
});

app.get('/mainpageStudent', function(req, res) {
	res.render('mainStudent',udata);
});

app.get('/stuform', function(req, res) {
	res.render('formstd',udata);
});

app.get('/mainpage', function(req, res) {
	res.render('mainpage',udata);
});

app.get('/profilestd', function(req, res) {
	res.render('profilestd',udata);
});

var detailform= new Object();
app.post('/formstd2', urlencodedParser , function(req,res){
    detailform = {
    'to' : req.body.to,
    'nameto': req.body.nameto,
    'title': req.body.title,
    'namelastname': req.body.namelastname,
    'idstd': req.body.idstd,
    'classstd': req.body.classstd,
    'department': req.body.department,
    'address': req.body.address,
    'tumbon': req.body.tumbon,
    'aumpor': req.body.aumpor,
    'city': req.body.city,
    'phonenumber': req.body.phonenumber,
    'semester1': req.body.semester1,
    'semester2': req.body.semester2,
    'subjectnum': req.body.subjectnum,
    'subject': req.body.subject,
    'section': req.body.section,
    'reason': req.body.reason,
    }
    res.render('formstd2',detailform);
    }
    );

var profilestd;
app.post('/profilestd2', urlencodedParser , function(req,res){
    profilestd ={
        'phonenum' : req.body.phonenum,
        'address' : req.body.address
    }
    res.render('profilestd2',profilestd);

});

    
app.get('/detailforms' , urlencodedParser ,function(req,res){    
        res.render('detailforms1');
    });
app.get('/detailforms2' , urlencodedParser ,function(req,res){    
        res.render('detailforms2');
    });
