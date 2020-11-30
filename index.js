var redis, redisClient, message;

const websocket = require('ws');
const http = require('http');
const express = require('express');
const app = express();
const url = require('url');
const server = http.createServer(app);
const wss = new websocket.Server({ server });
//app.on('upgrade', wss.handleUpgrade);

redis = require('redis');
redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379
});

wss.on('connection', function(ws, req) {
  ws.on('message', function(response) {
    const pathname = req.url.split("/");
    data = JSON.parse(response);
    if (data.message !== '') {
      if ( pathname[1] == 'agent' ) {
        switch(data.command){
          case 'REGISTER':
            message = {
              id: 001,
              type: 'AGENT',
              command: 'REGISTER',
              status: 200
            }
            redisClient.set("agent", pathname[2]);
          break;
          case 'MESSAGE':
            message = {
              id: 002,
              type: 'CLIENT',
              command: 'MESSAGE',
              message: data.text,
              status: 200
            }
          break;
          case 'LEAVE':
            message = {
              id: 003,
              type: 'CLIENT',
              command: 'LEAVE',
              status: 200
            }
            redisClient.del("agent");
          break;
          default:
            message = {
              id: 004,
              type: 'AGENT',
              command: 'INIT',
              status: 200
            }
        }        
      } else {
        switch(data.command) {
          case 'REGISTER':
            message = {
              id: 101,
              type: 'AGENT',
              command: 'REGISTER',
              status: 200
            }
          break;
          case 'MESSAGE':
            message = {
              id: 102,
              type: 'AGENT',
              command: 'MESSAGE',
              message: data.text,
              status: 200
            }
          break;
          case 'LEAVE':
            message = {
              id: 103,
              type: 'AGENT',
              command: 'LEAVE',
              status: 200
            }
          break;
          case 'AVAILABLE':
            redisClient.get("agent", function(err, res) {
              if( res !== null ){
                message = {
                  id: 105,
                  type: 'CLIENT',
                  command: 'AVAILABLE',
                  value: true,
                  status: 200
                }
              }
            })
          break;
          default:
            message = {
              id: 104,
              type: 'CLIENT',
              command: 'INIT',
              status: 200
            }
        }
      }
      allMessage(message);
    }
  });
});

allMessage = function(data) {  
  wss.clients.forEach(function each(client) {
    if (client.readyState === websocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

server.listen(8080, () => {
    console.log('server started on PORT 8080');
});
