#include "StepperMotor.h"

//NodeMCU 12E ESP8266
DanStepper ds(24, D2, D3, D6, D7);

void StepperMotor::init(){
  pinMode(ledPin, OUTPUT);
  ds.setSpeed(speed);
}

void StepperMotor::moveToStart(){
  ds.step(18, 2);
  ds.releaseBrake();
}

void StepperMotor::openBarr(){
  ds.step(-15, 2);
  //ds.releaseBrake();
  digitalWrite(ledPin, 1);
}

void StepperMotor::closeBarr(){
  ds.step(15, 2);
  ds.releaseBrake();
  digitalWrite(ledPin, 0);
}
