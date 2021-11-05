//________________ML5
let model;
let targetLabel = 'C';
let material;

let state = 'collection';
//________________ML5

//________________MQTT
// MQTT client details:
let broker = {
    hostname: 'nadiaunivers.cloud.shiftr.io/', //HIER_______________________________
    port: 443
};

// MQTT client:
let client;

let creds = {
    clientID: 'materialLupe', //HIER_______________________________
    userName: 'nadiaunivers', //HIER_______________________________
    password: 'MAjPLOJ6qo2p7Ydk' //HIER_______________________________
};
//________________MQTT


// topic i want to recive 
 let topicPosition = 'pos';
 let topicPosition2 = 'pos2';
 let firstValues;
 let firstValuesOn;
 let secondValues;
 let secondValuesOn;
 let allValuesGet;
 var allValues;

//  //topic i want to sent
 let topic = 'buch';
 let lastTimeSent = 0;
const sendInterval = 100;




//_____________________________________________SET_UP
function setup(){
    createCanvas(400, 400);

    allValues = 0;

    //________________MQTT_CLIENT
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
    //________________MQTT_CLIENT


//________________ML5
   let options = {
      // inputs: 18,
    inputs: ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r'],
    outputs: ['label'],
    task: 'classification',
    debug: 'true'
    };


model = ml5.neuralNetwork(options);
//________________ML5


 background(255);
  
    // create a div for local messages:
    localMsg = createP("Local message");
    localMsg.position(20, 50);

    // create a div for the response:
    remoteMsg =  createP("Waiting for message"); 
    remoteMsg.position(20, 80);


}

//_____________________________________________DRAW
function draw() {
    background(0,255,0);
    textSize(32);

    

                

    if(state == 'prediction'){
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
        console.log(inputs);

                model.classify(inputs, gotResults);
                console.log('t');
                console.log(targetLabel);
                console.log('m');
                console.log(material);
              
        if( material == 'W'){
            textSize(62);
            text('Wood',10,300);
            sendMqttMessage("Wood", topic);
    
        }
        else if (material == 'P'){
            textSize(62);
            text('Paper',10,300);
            sendMqttMessage("Paper", topic);
        }
        else if (material == 'M'){
            textSize(62);
            text('Metal',10,300);
            sendMqttMessage("Metal", topic);
        }
        else if (material == 'K'){
            textSize(62);
            text('Kunststoff',10,300);
            sendMqttMessage("Kunststoff", topic);
        }
        else if (material == 'G'){
            textSize(62);
            text('Glas',10,300);
            sendMqttMessage("Glas", topic);
        }
        else{
            text('???',10,300);
            // sendMqttMessage("???", topic);
    
        }
    
    }else if(state == 'collection'){
        if(targetLabel== 'W' ){
            text('material: Wood',10,300);
        } else if(targetLabel== 'P'){
            text('material: Paper' ,10,300);
        
        }else if(targetLabel== 'M'){
            text('material: Metal' ,10,300);
        }
         else if(targetLabel== 'K'){
        text('material: Kunststoff' ,10,300);
    }
    else if(targetLabel== 'G'){
        text('material: Glas' ,10,300);
    }
        else if(targetLabel== 'C'){
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

//called when a message arrives
function onMessageArrived(message) {
    if(message.destinationName == 'pos'){
         firstValues = split(message.payloadString, " ");
        //  firstValues = parseFloat(firstValuesOn);
        // console.log(firstValuesOn);
        //  for (let i = 0; i<18; i++) {
        //     firstValues.push(parseFloat(firstValuesON[i]));   //parseF  loat strings werden in floats gewandelt
        //   }
        //console.log('firstValues');
          // console.log(firstValues);
    }else{
         secondValues = split(message.payloadString, " ");
        // for (let i = 0; i<18; i++) {
        //     secondValues.push(parseFloat(secondValuesOn[i]));   //parseF  loat strings werden in floats gewandelt
        //   }
    }        //console.log('secondValues');
                // console.log(secondValues);

     allValuesGet = firstValues.concat(secondValues);


     allValues = allValuesGet.map(Number);

    //  console.log('allValues');
    //  console.log(allValues);
       
}

//________________ML5
// called to training, save and giving targetLabel
function keyPressed(){
    if (key == 't'){
        state = 'training';
        console.log('starting training');
        model.normalizeData();
        console.log('im here');
        let options = {
            epochs: 100,
            learningRate: 0.2,
            batchSize: 8
        };

        model.train(options, whileTraining, finishedTraining);
    }else if (key == 's'){
        model.saveData('materialData');
    }else if (key == 'l'){
        model.loadData('materialData.json'); 
        state = 'prediction';
        console.log(state);
       }else {
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
    console.log(state);

  }

  function mousePressed(){
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


      if (state == 'collection'){
          let target = {
              label: targetLabel
          };
          model.addData(inputs, target);
          console.log(target); 
          console.log(inputs);
              }else if(state == 'prediction'){
                console.log(inputs);

                model.classify(inputs, gotResults);
                console.log('t');
                console.log(targetLabel);
                console.log('m');
                console.log(material);
              }
  }

  function gotResults(error, results) {
    if (error) {
      console.error(error);
      return;
    }
      material = results[0].label;
    //  text(material, 10, 10);
                     console.log(results);

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