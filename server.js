'use strict';
var express = require('express');
var path = require('path');
var https = require('https');
var http = require('http');
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
var obj;

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

app.get('/', function (req, res) {
    res.render('login');
});

app.listen(PORT, function () {
    console.log(`Listening on ${PORT}`)
});

app.get('/api', function (req, res) {
    const queryParams = req.query;
    console.log('param[1]:' + queryParams['user']);
    res.send(queryParams);
});

var ssn;
app.post('/auth', function(request ,response){
    ssn = request.session;
    ssn.username = request.body.username;
    var username = request.body.username;
    var password = request.body.password;

    if(username && password){
        var options = {
            'method': 'POST',
            'hostname': 'restapi.tu.ac.th',
            'path': '/api/v1/auth/Ad/verify',
            'headers': {
                'Content-Type': 'application/json',
                'Application-Key': 'TU516b31bfcaebea2c4d1180b23f7ff15c6abcb7971f7757786dfad18e3a7a8da058f8e9a43eddd71053fc3afa264615c8'
            }
        };
        
        var req = https.request(options, function (res) {
        var chunks = [];
        
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        
        res.on("end", function (chunk) {
            var body = Buffer.concat(chunks);
            console.log(body.toString());

            obj = JSON.parse(body.toString());
            console.log(obj.status);

            if(obj.status == "FALSE"){
                //response.send("FALSE");
                response.redirect("/")
                response.end();
            }else{
                request.body = body.toString();

                if(obj.username == "6209680054"){ //staff main page
                    response.redirect("/inboxStaff");
                }else if(obj.username == "6209680070"){
                    response.redirect("/mainpage");
                }else{//student main page
                    response.redirect("/mainpageStudent");
                }
                response.end();
            }
        });
        
        res.on("error", function (error) {
            console.error(error);
        });
    });    
    var postData =  "{\n\t\"UserName\":\"" + username + "\",\n\t\"PassWord\":\""+ password + "\"\n}";
    req.write(postData);
    req.end(); 
    
    }else{
        response.send('pls enter username or password');
        response.end();
    }
});

app.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
});

app.get('/inboxStaff', function(req, res) {
    res.render('inboxForStaff');
    //res.render('inboxForStaff');
});

app.get('/status', function(req, res) {
	res.render('formStatusForStu');
});

app.get('/mainpageStudent', function(req, res) {
	res.render('mainStudent');
});

app.get('/stuform', function(req, res) {
	res.render('formstd');
});

app.get('/mainpage', function(req, res) {
	res.render('mainpage');
});


app.post('/formstd2', urlencodedParser , function(req,res){
    var detailform = {
        'to' : req.body.to,
        'nameto': req.body.nameto,
        'title': req.body.title,
        'namelastname': req.body.namelastname,
        'idstd': req.body.idstd,
        'classstd': req.body.class,
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
    });


/*var options = {
    'method': 'POST',
    'hostname': 'restapi.tu.ac.th',
    'path': '/api/v1/auth/Ad/verify',
    'headers': {
        'Content-Type': 'application/json',
        'Application-Key': 'TUa4e553b83aa271d3411a4ad88395265801fcfb074110e8b0e03962c01f2aed6ab1662db3a0e1451df7835880c6828fcf'
    }
}
var req = https.request(options, function (res) {
    var chunks = []
    res.on("data", function (chunk) {
        chunks.push(chunk);
    })
    res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
    })
    res.on("error", function (error) {
        console.error(error);
    });
})*/


//var options = {
//    'method': 'GET',
//    'hostname': 'restapi.tu.ac.th',
//    'path': '/api/v2/std/fac/all',
//    'headers': {
//        'Content-Type': 'application/json',
//        'Application-Key': 'TUa4e553b83aa271d3411a4ad88395265801fcfb074110e8b0e03962c01f2aed6ab1662db3a0e1451df7835880c6828fcf'
//    }
//}
//var req = https.request(options, function (res) {
//    var chunks = []
//    res.on("data", function (chunk) {
//        chunks.push(chunk);
//    })
//    res.on("end", function (chunk) {
//        var body = Buffer.concat(chunks);
//        console.log(body.toString());
//    })
//    res.on("error", function (error) {
//        console.error(error);
//    });
//})

/*var postData =  "{\n\t\"UserName\":\"6209680055\",\n\t\"PassWord\":\"4409817425298\"\n}";
var a = req.write(postData);
req.end()*/

//const options = {
//    hostname: 'jsonplaceholder.typicode.com',
//    path: '/posts/1/comments',
//    method: 'GET',
//    'headers': {
//        'Content-Type': 'application/json',
//    }
//};
//
//function dataCounter(inputs) {
//    let counter = 0;
//    for (const input of inputs) {
//        if (input.postId === 1) {
//            counter += 1;
//            console.log('input.postId:' + input.postId);
//            console.log('input.email:' + input.email);
//        }
//    }
//    return counter;
//};
//
//const req = http.request(options, function(response) {
//    response.setEncoding('utf8');
//    var body = '';
//    response.on('data', chunk => {
//        body += chunk;
//    });
//
//    response.on('end', () => {
//        console.log('body:' + body);
//        var data = JSON.parse(body);
//        console.log('number of posts:' + dataCounter(data));
//        console.log('data:' + data);
//        console.log('data[0]:' + data[0]);
//        console.log('data[0].id:' + data[0].id);
//        console.log('data[0].email:' + data[0].email);
//        console.log('end of GET request');
//    });
//});
//
//req.on('error', e => {
//    console.log('Problem with request:', e.message);
//});
//req.end();
