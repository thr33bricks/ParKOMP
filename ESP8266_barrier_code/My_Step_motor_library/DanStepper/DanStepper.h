//DanStepper stepper motor library by Yordan Yordanov
#ifndef DanStepper_h
#define DanStepper_h

class DanStepper {
  public:
   /*
	* contrPin1 -> pin controlling the first coil of the motor
	* contrPin2 -> pin controlling the second coil of the motor
	* stepsCount -> number of steps for the motor
	* pinEnCoil1 -> EN pin for the first coil of a bipolar stepper motor used for making half steps
	* pinEnCoil2 -> EN pin for the second coil of a bipolar stepper motor used for making half steps
	*/
    DanStepper(int _stepsCount, int _contrPin1, int _contrPin2, char a = ' ', int _pinEnCoil1 = 0, int _pinEnCoil2 = 0);
	
   /*
	* contrPin1 -> pin controlling the first coil of the motor
	* contrPin2 -> pin controlling the first coil of the motor
	* contrPin3 -> pin controlling the second coil of the motor
	* contrPin4 -> pin controlling the second coil of the motor
	* stepsCount -> number of steps for the motor
	*/
    DanStepper(int _stepsCount, int _contrPin1, int _contrPin2, int _contrPin3, int _contrPin4);
	
   /*
	* Sets the speed in rpm
	*/
	void setSpeed(int _rpm);
	
   /*
	* Frees the pressure from the motor. The motor uses brake
	* for every movement by default. That is why there is a
	* need for such a function.
	* 
	* Note: When using 2 wire communication you  
	* need to use coil enable pins as well
	* 
	*/
    void releaseBrake();
	
   /*
	* Moves the motor by a number of steps.  If the number is negative,
	* the motor moves in the reverse direction.
	*
	* Mode 1 => regular steps 
	* Mode 2 => half steps
	*/
    void step(int moveSteps, int mode = 1);
	
   /*
    * Move motor a number of rotations. If the sign is negative
	* the rotation is set to reverse.
	*/
    void rotations(int rot);
	
   /*
	* Move motor for a period of time (time in ms)
	* direction => 1 -> forward, -1 -> backwards
	*/
	void timeRotate(long time, int _direction);
  private:
   /*
	* Set direction according to the sign of the movement
	* If movement is negative sets direction to reverse.
	*/
    void setDirection(int movement);
	
   /*
	* Method for setting the delay between steps
	*/
	void setStepDelay(int _stepsCount);
	
   /*
	* Move the motor a single/half step
	*
	* Mode 1 => single step
	* Mode 2 => half step
	*
	* Note: Two pin controlling doesnt support half-stepping
	*/
	void moveStep(int mode);
	
   /*
	* Turn coil on/off. Used for half-stepping.
	*/
	void setCoil(int num, int val);
	
   /*
	* The functions select the required step from a step sequence
	*/
	void stepAction(int _currStep);
	void stepHalfAction(int _currStep);
	
	int rpm;                 //Speed of rotation in rpm
	int currStep;            //The the current position the motor is on
    int direction;           //Rotation direction
    int stepsCount;          //Total steps of the motor
    int pinCount;            //Number of control pins for the motor
	int useCoilEN;           //Use coil enable pin for half-stepping (TI L293D)
	unsigned long stepDelay; //Delay between steps, in us
	
	//Motor control pins
    int contrPin1;
    int contrPin2;
    int contrPin3;
    int contrPin4;
	
	//Coil enable pins
	int pinEnCoil1;
	int pinEnCoil2;

    unsigned long lastStepTime; //Time stamp of the last performed step
};

#endif