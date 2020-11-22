
// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = 'ACc338df292a27eb23e34c65600bef9abf';
const authToken = 'dc75be38bd5acfd08da1c1bf852dd3d3';
const client = require('twilio')(accountSid, authToken);

client.messages
      .create({body: 'Server test!!!', from: '+12543646231', to: '+84588819322'})
      .then(message => console.log(message.sid));