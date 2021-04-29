#ifndef StepperMotor_h
#define StepperMotor_h

#include <Arduino.h>
#include <DanStepper.h>

class StepperMotor {
  public:
    void init();
    void moveToStart();
    void openBarr();
    void closeBarr();

    int openDelay = 8000;
  private:
    int ledPin = 4;
    int speed = 50;
};
#endif
