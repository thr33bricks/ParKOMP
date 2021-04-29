#include "WiFimy.h"
#include "WebsocketLIB.h"

WiFimy wifi;
WebsocketLIB ws;

char* host = "192.168.43.182";  //node.js LPR System Server ip
const int lprServPort = 3000;  //node.js LPR System Server port

void setup() {
  Serial.begin(9600);
  wifi.Setstation();
  ws.wsConnect(host, lprServPort);
}

void loop() {
  ws.update();
}
