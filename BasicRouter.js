var express = require('express');
const http = require('http');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
var app = express();
const path = require('path');
const router = express.Router();
var fs = require('fs');
var prepend = require('prepend');
//const accountSid = 'ACc338df292a27eb23e34c65600bef9abf';
//const authToken = '80f0cfd344488bec7bd92d323ea0ee98';
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;


const client = require('twilio')(accountSid, authToken);
const bodyParser = require('body-parser');
var socketIO = require('socket.io')
const { RSA_NO_PADDING } = require('constants');

var clientSocket;
var username="admin";
var password="admin";
var check =0;

function validateAccount(user1,password1){
  if (user1 === username && password === password1){
    return 1;
  }
  return 0;
}
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/login.html'));
  //__dirname : It will resolve to your project folder.
});
router.get('/index', function (req, res) {
 if (check === 1) res.sendFile(path.join(__dirname + '/index.html'));
 else  res.sendFile(path.join(__dirname + '/login.html'));
  
});

router.post('/login', function (req, res) {
    if (validateAccount(req.body.user.trim(), req.body.password.trim()) === 1){
      //res.sendFile(path.join(__dirname + '/index.html'));
      res.redirect('/index');
      check = 1;
    } else {
      res.sendFile(path.join(__dirname + '/login.html'));
    }
});

router.get('/data', function (req, res) {
  var data = fs.readFileSync('data.txt');
  var array = data.toString().split('\n');
  if(data.length != 0) res.send(array);
});
router.get('/dataSchedual', function (req, res) {
  var data = fs.readFileSync('schedual.txt');
  var array = data.toString().split(':');
  if(data.length != 0) res.send(array);
});

router.get('/start', function (req, res) {
  var day = new Date().getDate();
  var month =  new Date().getMonth() + 1;
  var year =  new Date().getFullYear();
  var date = day + "/" + month + "/" + year;
  var hours = new Date().getHours() + 7;
  var minutes = new Date().getMinutes();
  var seconds = new Date().getSeconds();
  if (minutes < 10) minutes = "0" + minutes;
  if (hours < 10) hours = "0" + hours;
  if (seconds < 10) seconds = "0" + seconds;
  if (day < 10) day = "0" + day;
  if (month < 10) month = "0" + month;

  var writeFile = date + " " + hours + ":" + minutes + ":" + seconds + " " + "null" + " " + "null" + " " + "start";

  prepend(__dirname + '/data.txt', writeFile, function(error) {
    if (error)
        console.error(error.message);
  });
  res.redirect('/index');
});

router.get('/end', function (req, res) {
  var endTime = req.query.endTime;
  var totalTime = req.query.totalTime;
  var data = fs.readFileSync('data.txt');
  var array = data.toString().split('\n');

  array[0] =  array[0].replace('null', endTime);
  array[0] =  array[0].replace('null', totalTime);
  array[0] =  array[0].replace('start', 'end');
  var str="";
  for( i of array){
   str += i + "\n";
  };
  str = str.trim();
  fs.writeFileSync('data.txt',str);
  res.redirect('/index');
});
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.get('/shutDown', (req, res) => {
  clientSocket.disconnect();
  res.end("OK");
});

app.post('/notify', (req, res) => {
   clientSocket.emit('notify', req.body.notifyStr);
  res.end("OK");
});

app.get('/sms', (req, res) => {
  client.messages
  .create({body: '[CẢNH BÁO] Máy tính sử dụng đã vượt quá thời gian quy định!', from: '+12543646231', to: '+84588819322'})
  .then(message => console.log(message.sid));
  res.redirect('/index');
});

app.post('/sms', (req, res) => {
  //io.emit("end", "HELLO");
  const twiml = new MessagingResponse();
  twiml.message('The Robots are coming! Head for the hills!');
  console.log(req.body);
  io.emit("end", "HELLO");
  res.redirect('/index');
});

router.post('/setTime', function (req, res) {
 // if(req.body.hours < 10) req.body.hours= "0" +req.body.hours;
 // if(req.body.minutes < 10) req.body.minutes = "0" + req.body.minutes;
 // if(req.body.seconds < 10) req.body.seconds = "0" + req.body.seconds;
  var str = req.body.hours + ":" + req.body.minutes + ":" + req.body.seconds;
  fs.writeFileSync('schedual.txt',str);
  res.redirect('/index');
});

//add the router
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', router);
io = socketIO(app.listen(process.env.PORT || 1337));
console.log('Running at Port 1337');

io.on('connection', function (socket) {
  clientSocket=socket;
  // socket.emit('greeting-from-server', {
  //     greeting: 'Hello Client'
  // });
  // socket.on('greeting-from-client', function (message) {
  //   console.log(message);
  // });
});
//test
//twilio phone-numbers:update "+12543646231" --sms-url="http://localhost:1337/sms"
