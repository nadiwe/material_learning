//________________ml5
let model;
let targetLabel = 'C';
let material;

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
    clientID: 'dataNblau', //HIER_______________________________
    userName: 'nadiaunivers', //HIER_______________________________
    password: 'MAjPLOJ6qo2p7Ydk' //HIER_______________________________
};

// topic to subscribe to when you connect
// For shiftr.io, use whatever word you want 
let topicPosition = 'pos';
 let topicPosition2 = 'pos2';
 let firstValues;
 let secondValues;
 let allValues;

 let topic = 'buch';

 let lastTimeSent = 0;
const sendInterval = 100;




// position of the circle
// let aPos, bPos, cPos, dPos, ePos, fPos, gPos, hPos, iPos, jPos, kPos;

//button click
let clicked = false;



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
        inputs: ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r'],
        // inputs: ['a','b'],
     outputs: ['label'],
     task: 'classification',
     debug: 'true'
   };
  //  console.log(options);

   model = ml5.neuralNetwork(options);
   
  //  model.loadData('mouse-notes.json');
  //  state = 'prediction';
  //  loadDataMaterial();
   
   background(255);
      //__________________________ml5_________

}

// function loadDataMaterial(){
//     model.loadData('mouse-notes.json');
//     state = 'prediction';
// console.log('hello');
// }

function draw() {
background(0,255,0);
textSize(32);
console.log(state);
// if (millis() - lastTimeSent > sendInterval) {
//   sendMqttMessage("wood", topic);
//   lastTimeSent = millis();
// }

if(state == 'prediction'){
    if( material == 'W'){
        textSize(62);
        text('Wood',10,300);
        sendMqttMessage("Wood", topic);

    }
    else if ( material == 'P'){
        textSize(62);
        text('Paper',10,300);
        sendMqttMessage("Paper", topic);
    }
    else{
        text('???',10,300);
        sendMqttMessage("???", topic);

    }

}else if(state == 'collection'){
    if(targetLabel== 'W' ){
        text('material: Wood',10,300);

    
    }
    if(targetLabel== 'P'){
        text('material: Paper' ,10,300);
    
    }else if(targetLabel== 'C'){
        text('material: COLLECTING' ,10,300);
    
    }
}
}



    
    




// called when the client loses its connection
function onConnectionLost(response) {
    if (response.errorCode !== 0) {
        console.log(response.errorMessage);
        localMsg.html('onConnectionLost:' + response.errorMessage);
    }
}

// called when the client connects
function onConnect() {
    localMsg.html('client is connected');
    client.subscribe(topicPosition);
    client.subscribe(topicPosition2);
}

// called when a message arrives
function onMessageArrived(message) {
  
   if (message.destinationName  == "pos") {

      firstValues = split(message.payloadString, " ");
  

  
   } else if (message.destinationName  == "pos2"){
     secondValues = split(message.payloadString, " ");
   


  } 
  // console.log("firstValues" + " " + firstValues);
  // console.log("secondValues" + " " + secondValues)

       allValues = firstValues.concat(secondValues);  
    //  console.log("allValues" + " " + allValues)
     //remoteMsg.html(message.payloadString);

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
    } 
    else if (key == 's') {
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
     
  a: allValues[0],
  b: allValues[1],
  c: allValues[2],
  d: allValues[3],
  e: allValues[4],
  f: allValues[5],
  g: allValues[6],
  h: allValues[7],
  i: allValues[8],
  j: allValues[9],
  k: allValues[10],
  l: allValues[11],
  m: allValues[12],
  n: allValues[13],
  o: allValues[14],
  p: allValues[15],
  q: allValues[16],
  r: allValues[17]


    };
    
    // console.log('inputs :'+inputs);

    if (state == 'collection') {
      let target = {
        label: targetLabel
      };
      model.addData(inputs, target);
      
      console.log(target); 
      console.log(inputs);



  
    } else if (state == 'prediction') {
      model.classify(inputs, gotResults);
      // console.log(inputs);
            console.log(targetLabel);

      console.log('where i am')

    }
  }
  
  function gotResults(error, results) {
    if (error) {
      console.error(error);
      return;
    }
    console.log(results);
  
     let material = results[0].label;
     text(material, 10, 10);

  }

// called when you want to send a message:
function sendMqttMessage(msg, tpc) {
  // if the client is connected to the MQTT broker:
  if (client.isConnected()) {
      // start an MQTT message:
      message = new Paho.MQTT.Message(JSON.stringify(msg));
      // choose the destination topic:
      message.destinationName = tpc;
      // send it:
      client.send(message);
      // print what you sent:
      localMsg.html('I sent: ' + message.payloadString);
  }
}



  