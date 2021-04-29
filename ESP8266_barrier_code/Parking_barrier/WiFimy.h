#ifndef WiFimy_h
#define WiFimy_h

#include <ESP8266WiFi.h>

#define wifi_Name "redmi7a"
#define wifi_Pass "70000000"

class WiFimy {
  public:
    int wifiConnected = 1;
    String ip = "";
    String wifiName = "";

    void Setstation();
  private:
    unsigned int previousWifiTime = 0;
};
#endif
