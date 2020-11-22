const Nexmo = require('nexmo');

const nexmo = new Nexmo({
  apiKey: '9cdc5245',
  apiSecret: 'REqaSQhTaWRz4XoY',
});

const from = '84937327501';
const to = '84588819322';
const text = 'test';

nexmo.message.sendSms(from, to, text);
