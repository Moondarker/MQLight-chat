var mqlight = require('mqlight');
var readline = require('readline');

var TOPIC = "mqlight/simplechat";
var SHARE_ID = "";
var mqlightServiceName = "mqlight";

var opts = {
  service: 'http://mqlightprod-lookup.eu-gb.bluemix.net/Lookup?serviceId=7f888597-8c14-4090-b25c-8f7de8699a2b&tls=true',
  user: 'tUwaDThNsxmk',
  password: '8s@V]@:3Jm=N'
};

var rl = readline.createInterface(process.stdin, process.stdout);

var mqlightClient = mqlight.createClient(opts, function(err) {
    if (err) {
      console.error('Connection to ' + opts.service + ' using client-id ' + mqlightClient.id + ' failed: ' + err);
    } 
});

mqlightClient.on('started', function() {
      
      rl.question("Please, choose your nickname: ", function(result) {
        SHARE_ID = result;
        console.log("Welcome,", SHARE_ID, "!");
        rl.setPrompt(SHARE_ID + '> ');
        
        mqlightClient.subscribe(TOPIC, SHARE_ID, 
        { credit : 5,
          autoConfirm : true,
          qos : 0}, function(err) {
           if (err) console.error("Failed to subscribe: " + err); 
           else {
             console.log("Subscribed to " + TOPIC);
             rl.prompt();
           }
        });
      });
    });

mqlightClient.on('message', function(data, delivery) {
  data = JSON.parse(data);
  if (data.id != SHARE_ID) {
    readline.clearLine(process.stdout, 0);
    rl.setPrompt(data.id + '> ');
    rl.prompt();
    console.log(data.message + '                 ');
    rl.setPrompt(SHARE_ID + '> ');
    rl.prompt();
  }
});

rl.on('line', function(message) {
  if(message != "") {
    var data = JSON.stringify({
      id: SHARE_ID,
      message: message
    });
    mqlightClient.send(TOPIC, data, {
      ttl: 60*60*1000
    });
    rl.prompt();
  }
});

rl.on('close', function() {
  readline.clearLine(process.stdout, 0);
  console.log('Goodbye!');
  process.exit(0);
});