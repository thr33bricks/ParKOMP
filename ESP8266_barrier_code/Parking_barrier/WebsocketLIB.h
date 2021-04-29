#ifndef WebsocketLIB_h
#define WebsocketLIB_h

#include "WiFimy.h"
#include "StepperMotor.h"
#include <WebSocketClient.h>

class WebsocketLIB {
  public:
    void wsConnect(char* host, int espPort);
    void update();
  private:
    String data = "";
    String sec_socket_auth = "Deez420._nuts";
    String entr_name = "entr1";
    char path[10] = "/";   //identifier of this device
    bool firstCon = true;

    WebSocketClient wsCli;
    // Use WiFiClient class to create TCP connections
    WiFiClient client;
    StepperMotor sm;
};
#endif
