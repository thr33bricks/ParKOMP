#ParKOMP Systems, Yordan Yordanov 2021
#===========================================================
from cv2 import cv2 as cv
import numpy as np
import base64
import time

from . import DetectPlates
from . import PlateAuth
from . import Preprocess as pp
from .config import DEBUGGING
from .config import BLUR_TRESH

def base64ToImage(base64str):
    encoded_data = base64str.split(',')[1]
    nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    img = cv.imdecode(nparr, cv.IMREAD_COLOR)
    return img

def find_lp(base64str):
    #global last_res
    img = base64ToImage(base64str)
    res = find_lp_str(img)
    if res == None:
        return 'None'
    return res

def find_lp_str(orgImage):
    if DEBUGGING: 
        start_time = time.time()    #Start stopwatch 

    if orgImage is None:                            #Image not loaded
        if DEBUGGING: 
            print("\nERROR: Image not loaded correctly!\n\n")   
        return None

    blurLvl = pp.laplacianBlurDetect(orgImage) #Image blur detection
    if DEBUGGING:
        print("\nBlurriness level: " + str(blurLvl))
    if blurLvl < BLUR_TRESH:
        return None

    listOfPossiblePlates = DetectPlates.detectPlatesInScene(orgImage)    #Detect possible license plates on image
    licPlate = PlateAuth.detectPlate(listOfPossiblePlates)        #Detect lp text

    if licPlate == None:                  
        if DEBUGGING:
            print("\nNo license plates were detected!\n")  
        return None
    elif DEBUGGING:                                                              
        resTime = time.time() #Stop stopwatch
        print("\nlicense plate number = " + licPlate.strChars + "\n")  #Display lp number
        print("----------------------------------------")
        print("\n--- %s seconds ---" % (round(resTime - start_time, 3)))

    return licPlate.strChars