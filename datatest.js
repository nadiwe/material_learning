//________________ml5
let model;
let targetLabel = 'C';

let state = 'collection';
//________________ml5


// MQTT client details:
let broker = {
    hostname: 'nadiaunivers.cloud.shiftr.io/', //HIER_______________________________
    port: 443
};

// MQTT client:
let client;

// client credentials:
// For shiftr.io type in both username and password

let creds = {
    clientID: 'data', //HIER_______________________________
    userName: 'nadiaunivers', //HIER_______________________________
    password: 'MAjPLOJ6qo2p7Ydk' //HIER_______________________________
};

// topic to subscribe to when you connect
// For shiftr.io, use whatever word you want 
let topicPosition = 'pos';
let topic = 'values';
let topic2 = 'ledBlink';


// position of the circle
let aPos, bPos, cPos, dPos, ePos, fPos, gPos, hPos, iPos, jPos;

//button click
let clicked = false;

let lastTimeSent = 0;
const sendInterval = 100;

function setup() {
    createCanvas(400, 400);
    // Create an MQTT client:
    client = new Paho.MQTT.Client(broker.hostname, broker.port, creds.clientID);
    // set callback handlers for the client:
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    // connect to the MQTT broker:
    client.connect(
        {
            onSuccess: onConnect,       // callback function for when you connect
            userName: creds.userName,   // username
            password: creds.password,   // password
            useSSL: true   // use SSL
        }
    );
    // create a div for local messages:
    localMsg = createP("Local message");
    localMsg.position(20, 50);

    // create a div for the response:
    remoteMsg =  createP("Waiting for message"); 
    remoteMsg.position(20, 80);

   //__________________________ml5_________
  
 
   let options = {
     inputs: ['a', 'b','c','d','e','f','g','h','i','j'],
     outputs: ['label'],
     task: 'classification',
     debug: 'true'
   };
   model = ml5.neuralNetwork(options);
   background(255);
      //__________________________ml5_________

}

function draw() {
background(0,255,0);
textSize(32);
//text('aPos: '+ aPos,100,100);
if(targetLabel== 'W'){
    text('material: Wood',10,300);
   

}
if(targetLabel== 'P'){
    text('material: Paper' ,10,300);

}else if(targetLabel== 'C'){
    text('material: ??' ,10,300);

}

    
    
}

// called when the client connects
function onConnect() {
    localMsg.html('client is connected');
    client.subscribe(topicPosition);
}

// called when the client loses its connection
function onConnectionLost(response) {
    if (response.errorCode !== 0) {
        console.log(response.errorMessage);
        localMsg.html('onConnectionLost:' + response.errorMessage);
    }
}

// called when a message arrives
function onMessageArrived(message) {
    remoteMsg.html(message.payloadString);
    
    // assume the message payload is a JSON object  {"x":xPos, "y":yPos}
    // parse it and use the X and Y:
    var acc = JSON.parse(message.payloadString);
    aPos = acc.a;
    bPos = acc.b;
    cPos = acc.c;
    dPos = acc.d;
    ePos = acc.e;
    fPos = acc.f;
    gPos = acc.g;
    hPos = acc.h;
    iPos = acc.i;
    jPos = acc.j;
     
    
}



//_____________________ml5

function keyPressed() {
    if (key == 't') {
      state = 'training';
      console.log('starting training');
      model.normalizeData();
      let options = {
        epochs: 200
      };
      model.train(options, whileTraining, finishedTraining);
    } else if (key == 's') {
      model.saveData('mouse-notes');
    } 
    else {
      targetLabel = key.toUpperCase();
      console.log(targetLabel);
    }
  }
  
  function whileTraining(epoch, loss) {
    console.log(epoch);
  }
  
  function finishedTraining() {
    console.log('finished training.');
    state = 'prediction';
  }
  
  function mousePressed() {
    let inputs = {
      a: aPos,
      b: bPos,
      c: cPos,
      d: dPos,
      e: ePos,
      f: fPos,
      g: gPos,
      h: hPos,
      i: iPos,
      j: jPos
    };
  
    if (state == 'collection') {
      let target = {
        label: targetLabel
      };
      model.addData(inputs, target);
      
      console.log(target); 
      console.log(inputs);



  
    } else if (state == 'prediction') {
      model.classify(inputs, gotResults);
      console.log(state);

    }
  }
  
  function gotResults(error, results) {
    if (error) {
      console.error(error);
      return;
    }
    console.log(results);
  
    let label = results[0].label;
    text(label, mouseX, mouseY);
  
  }


  