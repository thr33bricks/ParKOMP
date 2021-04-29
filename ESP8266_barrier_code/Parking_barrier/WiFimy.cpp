#include "WiFimy.h"

void WiFimy::Setstation() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(wifi_Name, wifi_Pass);
  WiFi.persistent(false);
  WiFi.setAutoConnect(false);
  WiFi.setAutoReconnect(true);
  previousWifiTime = millis();
  if (WiFi.waitForConnectResult() != WL_CONNECTED){
    Serial.println("WiFi connection failed!");
    wifiConnected = 0;
  }
  Serial.println("");
  if (wifiConnected == 1){
    IPAddress locIP = WiFi.localIP();
    ip = String(locIP[0]) + "." + String(locIP[1]) + "." + String(locIP[2]) + "." + String(locIP[3]);
    wifiName = wifi_Name;
    
    Serial.println("WiFi Connected in " + String(millis() - previousWifiTime) + " ms");
    Serial.println("IP address: ");
    Serial.println(ip);
  }
  else{
    Serial.println("WiFi connection failed!");
    ESP.restart();
  }
}
