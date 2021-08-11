// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();

const dialogflow = require('dialogflow');
const uuid = require ('uuid');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const axios = require ("axios");

const bodyParser = require('body-parser')
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extend: true
}));

// 
const projectId = 'botsi-yhpy';
const sessionId = uuid.v4(); // criando identificador único
const sessionClient = new dialogflow.SessionsClient(); // objeto para chamar client do Dialogflow
const sessionPath = sessionClient.sessionPath(projectId,sessionId); // variável para armazenar o caminho chamada API



console.log(sessionPath);


// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// Rota para chat.html
app.get("/chat", (request, response) => {
  response.sendFile(__dirname + "/views/chat.html");
});


// send the default array of dreams to the webpage
app.get("/dreams", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(dreams);
});

// rota para dialogflow sempre com post
app.post('/detectIntent',function(request,response){
  
  let texto = request.body.texto;
  
  const query = {
      session: sessionPath,
      queryInput: {
        text: {
          text: texto,
          languageCode: 'pt-br'
        }
      }
  }
  
  // chamada sessão
  sessionClient.detectIntent(query)
    .then((res)=>{
      response.json(res)
  })
  .catch(err => console.log(err))
})

// ADICIONADO INLINE EDITOR 


app.post('/webhook', function(request,response){
  
// process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
// exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
 // console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
//  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
  
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  function Benvindo(agent){
    agent.add('Isso é um teste');
  }
  
// Card Teste Novidade do Dia   
  function botApresentacao(agent) {

    agent.add(new Card({
        title: `Veja a novidade do dia`,
        imageUrl: 'https://cdn.glitch.com/d9afb1e1-db2d-4cb0-93d1-e32b86a20991%2Fmr-robot-icon.jpg?v=1604442473920',
        text: `As matrículas estão abertas!`,
        buttonText: 'Saiba mais',
        buttonUrl: 'https://ellibot-si.glitch.me/'
       })
     );
    
	agent.add(new Suggestion(`Secretaria`));
  agent.add(new Suggestion(`Coordenação`));
	agent.add(new Suggestion(`Curso`));
  }
 
  function quemSou(agent) {
   
    agent.add(new Card({
        title: `Veja a novidade do dia`,
        imageUrl: 'https://cdn.glitch.com/d9afb1e1-db2d-4cb0-93d1-e32b86a20991%2Fmr-robot-icon.jpg?v=1604442473920',
        text: `As matrículas estão abertas!`,
        buttonText: 'Saiba mais',
        buttonUrl: 'https://ellibot-si.glitch.me/',
       })
     );
    
  
  }   

  var intentName = request.body.queryResult.intent.displayName;
  
  if(intentName == 'buscaDado') {
    var Rotulo = request.body.queryResult.parameters("Rotulo");
  
    return axios.get("https://sheet.best/api/sheets/b8ec91eb-2768-4794-ac5a-a5bf331a4f10").then(res => {
      res.data.map(person => {
        if (person.Rotulo === Rotulo)
          response.json({"fullfilmentText":"Informações solicitadas: "+Rotulo+":"+"\n"+
                       "Registro:"+person.Registro+"\n"+
                       "Contato:"+person.Contato+"\n"+
                       "Mais:"+person.Mais
                      });
    });
  });
}

  

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('bot apresentacao', botApresentacao);
  intentMap.set('quemsou', quemSou);
  intentMap.set('Teste', Benvindo);
  // intentMap.set('busca', busca);
  
  agent.handleRequest(intentMap);
// });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// Consulta planilha Google



