//DanStepper stepper motor library by Yordan Yordanov, October 2020
#include "Arduino.h"
#include "DanStepper.h"


/*
 *========================================================================================================*
 *                                           Public methods                                               *
 *========================================================================================================*
 */

/* =========== Setup ===========
 * contrPin1 -> pin controlling the first coil of the motor
 * contrPin2 -> pin controlling the second coil of the motor
 * stepsCount -> number of steps for the motor
 * pinEnCoil1 -> EN pin for the first coil of a bipolar stepper motor used for making half steps
 * pinEnCoil2 -> EN pin for the second coil of a bipolar stepper motor used for making half steps
 */
DanStepper::DanStepper(int _stepsCount, int _contrPin1, int _contrPin2, char a, int _pinEnCoil1, int _pinEnCoil2)
{
  currStep = 0;    // which step the motor is on
  direction = 0;      // motor direction
  lastStepTime = 0; // time stamp in us of the last step taken
  stepsCount = _stepsCount; //Total steps count

  //Controller pins
  contrPin1 = _contrPin1;
  contrPin2 = _contrPin2;
  
  //Used to turn coils on/off (half-stepping)
  pinEnCoil1 = _pinEnCoil1;
  pinEnCoil2 = _pinEnCoil2;

  //Initialize pins as output on the arduino
  pinMode(contrPin1, OUTPUT);
  pinMode(contrPin2, OUTPUT);

  //Set the unused pins to 0
  contrPin3 = 0;
  contrPin4 = 0;

  // pinCount is used by the stepMotor() and stepHalfAction() methods:
  pinCount = 2;
  
  if(pinEnCoil1 != 0 && pinEnCoil2 != 0){
	pinMode(pinEnCoil1, OUTPUT);
	pinMode(pinEnCoil2, OUTPUT);
	useCoilEN = 1;
  }
  else
	useCoilEN = 0;
}


/* =========== Setup ===========
 * contrPin1 -> pin controlling the first coil of the motor
 * contrPin2 -> pin controlling the first coil of the motor
 * contrPin3 -> pin controlling the second coil of the motor
 * contrPin4 -> pin controlling the second coil of the motor
 * stepsCount -> number of steps for the motor
 * pinEnCoil1 -> EN pin for the first coil of a bipolar stepper motor used for making half steps (L293D)
 * pinEnCoil2 -> EN pin for the second coil of a bipolar stepper motor used for making half steps (L293D)
 */
DanStepper::DanStepper(int _stepsCount, int _contrPin1, int _contrPin2, int _contrPin3, int _contrPin4)
{
  currStep = 0;    // which step the motor is on
  direction = 0;      // motor direction
  lastStepTime = 0; // time stamp in us of the last step taken
  stepsCount = _stepsCount; //Total steps count

  //Controller pins
  contrPin1 = _contrPin1;
  contrPin2 = _contrPin2;
  contrPin3 = _contrPin3;
  contrPin4 = _contrPin4;

  //Initialize pins as output on the arduino
  pinMode(contrPin1, OUTPUT);
  pinMode(contrPin2, OUTPUT);
  pinMode(contrPin3, OUTPUT);
  pinMode(contrPin4, OUTPUT);

  //pinCount is used by the stepAction() and stepHalfAction() methods:
  pinCount = 4;
  useCoilEN = 0;
}

/*
 * Sets the speed in rpm
 */
void DanStepper::setSpeed(int _rpm)
{
  rpm = _rpm;
  setStepDelay(stepsCount);
}

/*
 * Frees the pressure from the motor. The motor uses brake
 * for every movement by default. That is why there is a
 * need for such a function.
 * 
 * Note: When using 2 wire communication you  
 * need to use coil enable pins as well
 * 
 */
void DanStepper::releaseBrake(){
  if(pinCount == 2 && useCoilEN == 1){
	setCoil(1,0);
	setCoil(2,0);
  }
  else if(pinCount == 4){
	digitalWrite(contrPin1, LOW);
	digitalWrite(contrPin2, LOW);
	digitalWrite(contrPin3, LOW);
	digitalWrite(contrPin4, LOW);
  }
}

/*
 * Moves the motor by a number of steps.  If the number is negative,
 * the motor moves in the reverse direction.
 *
 * Mode 1 => regular steps 
 * Mode 2 => half steps
 */
void DanStepper::step(int moveSteps, int mode)
{
  int stepsLeft = abs(moveSteps);  // how many steps to take

  //Determine direction based on whether moveSteps is positive or negative:
  setDirection(moveSteps);

  while (stepsLeft > 0){
    unsigned long timeNow = micros();
    //Move when delay passes
    if ((unsigned long)(timeNow - lastStepTime) >= stepDelay){ 
	  moveStep(mode);
	  stepsLeft--;
	  
	  //Set the time of moving a step
	  timeNow = micros();
      lastStepTime = timeNow;
    }
	yield();
  }
}

/*
 * Move motor a number of rotations. If the sign is negative
 * the rotation is set to reverse.
 */
void DanStepper::rotations(int rot){
  int absRot = abs(rot);  //How many absolute rotations to make
  int multi = 1; //Multiplier based on the sign of rot value
  if(rot < 0)
	multi = -1;

  for(int i = 0; i < rot; i++){
	step(stepsCount * multi, 1);
	yield();
  }
}

/*
 * Move motor for a period of time (time in ms)
 * direction => 1 -> forward, -1 -> backwards
 */
void DanStepper::timeRotate(long time, int _direction){
  setDirection(_direction);
  unsigned long timeStart = millis();
  unsigned long timeNow = micros();
  
  while((unsigned long)(timeNow * 1000 - timeStart) < time){
	timeNow = micros();
	//Move when delay passes
    if ((unsigned long)(timeNow - lastStepTime) >= stepDelay){ 
	  moveStep(1);
	  
	  //Set the time of moving a step
	  timeNow = micros();
      lastStepTime = timeNow;
    }
	yield();
  }
}

/*
 *========================================================================================================*
 *                                          Private methods                                               *
 *========================================================================================================*
 */

/*
 * Set direction according to the sign of the movement
 * If movement is negative sets direction to reverse.
 */
void DanStepper::setDirection(int movement){
  if (movement > 0) 
	direction = 1;
  if (movement < 0) 
	direction = 0;
}

/*
 * Method for setting the delay between steps
 */
void DanStepper::setStepDelay(int _stepsCount)
{
  stepDelay = 60L * 1000L * 1000L / rpm / _stepsCount;
}

/*
 * Move the motor a single/half step
 *
 * Mode 1 => single step
 * Mode 2 => half step
 *
 * Note: Two pin controlling doesnt support half-stepping
 */
void DanStepper::moveStep(int mode)
{
  //Cannot use mode 2 with no
  //access to the enable pins of the driver for the coils
  if(mode == 2 && useCoilEN != 1 && pinCount == 2)
	return;
  
  //Set the delay between steps according to mode
  if(mode == 1)
	setStepDelay(stepsCount);
  else
	setStepDelay(stepsCount * 2);

  if (direction == 1)
  {
	if(mode == 1)
	  currStep += 2;
	else if(mode == 2)
	  currStep ++;
    if (currStep == stepsCount)
      currStep = 0;
  }
  else
  {
	if(mode == 1)
	  currStep -= 2;
	else if(mode == 2)
	  currStep --;
    if (currStep == - 1)
      currStep = stepsCount - 1;
  }
      
  //Move motor through a step sequencer
  if(mode == 1)
	stepAction((currStep/2) % 4);
  else
	stepHalfAction(currStep % 8);
}

/*
 * Turn coil on/off. Used for half-stepping.
 */
void DanStepper::setCoil(int num, int val)
{
	if(num == 1)
		digitalWrite(pinEnCoil1, val);
	else if(num == 2)
		digitalWrite(pinEnCoil2, val);
}

/*
 * The function selects the required step from the step sequence
 */
void DanStepper::stepAction(int _currStep)
{
  if(useCoilEN == 1){
	setCoil(1,1);
	setCoil(2,1);
  }
  
  if (pinCount == 2) {
    switch (_currStep) {
      case 0:  //01
        digitalWrite(contrPin1, LOW);
        digitalWrite(contrPin2, HIGH);
		break;
      case 1:  //11
        digitalWrite(contrPin1, HIGH);
        digitalWrite(contrPin2, HIGH);
		break;
      case 2:  //10
        digitalWrite(contrPin1, HIGH);
        digitalWrite(contrPin2, LOW);
		break;
      case 3:  //00
        digitalWrite(contrPin1, LOW);
        digitalWrite(contrPin2, LOW);
		break;
    }
  }
  if (pinCount == 4) {
    switch (_currStep) {
      case 0:  //1010
        digitalWrite(contrPin1, HIGH);
        digitalWrite(contrPin2, LOW);
        digitalWrite(contrPin3, HIGH);
        digitalWrite(contrPin4, LOW);
		break;
      case 1:  //0110
        digitalWrite(contrPin1, LOW);
        digitalWrite(contrPin2, HIGH);
        digitalWrite(contrPin3, HIGH);
        digitalWrite(contrPin4, LOW);
		break;
      case 2:  //0101
        digitalWrite(contrPin1, LOW);
        digitalWrite(contrPin2, HIGH);
        digitalWrite(contrPin3, LOW);
        digitalWrite(contrPin4, HIGH);
		break;
      case 3:  //1001
        digitalWrite(contrPin1, HIGH);
        digitalWrite(contrPin2, LOW);
        digitalWrite(contrPin3, LOW);
        digitalWrite(contrPin4, HIGH);
		break;
    }
  }
}

void DanStepper::stepHalfAction(int _currStep)
{
  if (pinCount == 2) {
    switch (_currStep) {
	  case 0:  //01
		setCoil(1,1);
		setCoil(2,0);
        digitalWrite(contrPin1, LOW);
		break;
      case 1:  //01
		setCoil(1,1);
		setCoil(2,1);
        digitalWrite(contrPin1, LOW);
        digitalWrite(contrPin2, HIGH);
		break;
	  case 2:  //11
		setCoil(1,0);
		setCoil(2,1);
        digitalWrite(contrPin2, HIGH);
		break;
      case 3:  //11
		setCoil(1,1);
		setCoil(2,1);
        digitalWrite(contrPin1, HIGH);
        digitalWrite(contrPin2, HIGH);
		break;
	  case 4:  //10
		setCoil(1,1);
		setCoil(2,0);
        digitalWrite(contrPin1, HIGH);
		break;
      case 5:  //10
		setCoil(1,1);
		setCoil(2,1);
        digitalWrite(contrPin1, HIGH);
        digitalWrite(contrPin2, LOW);
		break;
	  case 6:  //00
	    setCoil(1,0);
		setCoil(2,1);
        digitalWrite(contrPin2, LOW);
		break;
      case 7:  //00
	    setCoil(1,1);
		setCoil(2,1);
        digitalWrite(contrPin1, LOW);
        digitalWrite(contrPin2, LOW);
		break;
    }
  }
  else if (pinCount == 4) {
    switch (_currStep) {
	  case 0:  //1000
        digitalWrite(contrPin1, HIGH);
        digitalWrite(contrPin2, LOW);
        digitalWrite(contrPin3, LOW);
        digitalWrite(contrPin4, LOW);
        break;
	  case 1:  //1010
        digitalWrite(contrPin1, HIGH); //*
        digitalWrite(contrPin2, LOW);
        digitalWrite(contrPin3, HIGH);
        digitalWrite(contrPin4, LOW);
        break;
	  case 2:  //0010
        digitalWrite(contrPin1, LOW);
        digitalWrite(contrPin2, LOW);
        digitalWrite(contrPin3, HIGH); //*
        digitalWrite(contrPin4, LOW);
        break;
	  case 3:  //0110
        digitalWrite(contrPin1, LOW);
        digitalWrite(contrPin2, HIGH);
        digitalWrite(contrPin3, HIGH); //*
        digitalWrite(contrPin4, LOW);
		break;
      case 4:  //0100
        digitalWrite(contrPin1, LOW);
        digitalWrite(contrPin2, HIGH); //*
        digitalWrite(contrPin3, LOW);
        digitalWrite(contrPin4, LOW);
		break;
      case 5:  //0101
        digitalWrite(contrPin1, LOW);
        digitalWrite(contrPin2, HIGH); //*
        digitalWrite(contrPin3, LOW);
        digitalWrite(contrPin4, HIGH);
		break;
      case 6:  //0001
        digitalWrite(contrPin1, LOW);
        digitalWrite(contrPin2, LOW);
        digitalWrite(contrPin3, LOW);
        digitalWrite(contrPin4, HIGH); //*
		break;
	  case 7:  //1001
        digitalWrite(contrPin1, HIGH);
        digitalWrite(contrPin2, LOW);
        digitalWrite(contrPin3, LOW);
        digitalWrite(contrPin4, HIGH); //*
		break;
    }
  }
}