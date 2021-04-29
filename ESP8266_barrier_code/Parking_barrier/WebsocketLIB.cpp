#include "WebsocketLIB.h"

void WebsocketLIB::wsConnect(char* host, int serv_port){
  // Connect to the websocket server
  while(!client.connect(host, serv_port)){
    Serial.println("Connection failed.");
    delay(1000); 
  }
  Serial.println("Connected to webserver!");

  // Handshake with the server
  wsCli.path = path;
  wsCli.host = host;
  while(!wsCli.handshake(client)){
    Serial.println("Handshake failed.");
    delay(1000);
  }
  Serial.println("Handshake successful");
}

void WebsocketLIB::update(){
  if (client.connected()) {
    if(firstCon){
      firstCon = false;
      wsCli.sendData("send_auth");
    }
    wsCli.getData(data);    
    if (data.length() > 0) {
      Serial.println(data);
      if(data == "open"){
        Serial.println("opened");
        sm.openBarr();
        delay(sm.openDelay);
        sm.closeBarr();
        Serial.println("closed");
        wsCli.sendData("closed");
      }
      else if(data == "auth"){
        sm.init();
        sm.moveToStart();

        wsCli.sendData("auth:" + sec_socket_auth + ":" + entr_name);
      }
    }
    data = "";
  }
}
