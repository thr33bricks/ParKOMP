from cv2 import cv2 as cv
import numpy as np
import math

from .config import DEBUGGING

from . import Preprocess
from . import DetectChars
from . import PossiblePlate
from . import PossibleChar

PLATE_WIDTH_PADDING_FACTOR = 1.1
PLATE_HEIGHT_PADDING_FACTOR = 1.3

def detectPlatesInScene(imgOriginalScene):
    listOfPossiblePlates = []                   #return value

    height, width, _ = imgOriginalScene.shape
    imgThreshScene = np.zeros((height, width, 1), np.uint8)

    _, imgThreshScene = Preprocess.preprocess(imgOriginalScene)  #Preprocess to get grayscale and threshold images

    #Find all possible chars in the scene,
    #This function first finds all contours, then only includes contours that could be chars (without comparison to other chars yet)
    listOfPossibleCharsInScene = findPossibleCharsInScene(imgThreshScene)

    #Given a list of all possible chars, find groups of matching chars
    #In the next steps every group of chars will be checked to see if it is a lp
    listOfListsOfMatchingCharsInScene = DetectChars.findListOfListsOfMatchingChars(listOfPossibleCharsInScene)

    for listOfMatchingChars in listOfListsOfMatchingCharsInScene:                   #For each group of matching chars
        possiblePlate = extractPlate(imgOriginalScene, listOfMatchingChars)         #attempt to extract plate

        if possiblePlate.imgPlate is not None:                          #If plate was found
            listOfPossiblePlates.append(possiblePlate)                  #add it to list of possible plates

    if DEBUGGING:
        print("\n" + str(len(listOfPossiblePlates)) + " possible plates found")

    return listOfPossiblePlates

def findPossibleCharsInScene(imgThresh):
    listOfPossibleChars = []
    intCountOfPossibleChars = 0

    imgThreshCopy = imgThresh.copy()
    contours, _ = cv.findContours(imgThreshCopy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)   #Find all contours

    for i in range(0, len(contours)):         #For each contour
        possibleChar = PossibleChar.PossibleChar(contours[i])

        if DetectChars.checkIfPossibleChar(possibleChar):            #If contour is a possible char (no comparison to other chars yet)
            intCountOfPossibleChars = intCountOfPossibleChars + 1    #Increment count of possible chars
            listOfPossibleChars.append(possibleChar)                 #and add to list of possible chars

    return listOfPossibleChars

#========================================================================================
#The following function crops the possible license plate from the original image based
#on the char group width and height. Calculates correction angle and fixes rotation of
#the possible lp. Prints previously found contours of chars on cropped lp image. Fixes 
#text quality of the lp using character segmentation algorithm.
#========================================================================================
def extractPlate(imgOriginal, listOfMatchingChars):
    possiblePlate = PossiblePlate.PossiblePlate()           #return value
    possiblePlate.possibleChrCount = len(listOfMatchingChars)

    listOfMatchingChars.sort(key = lambda matchingChar: matchingChar.intCenterX)   #Sort chars from left to right based on x position

    #Calculate the center point of the plate
    fltPlateCenterX = (listOfMatchingChars[0].intCenterX + listOfMatchingChars[len(listOfMatchingChars) - 1].intCenterX) / 2.0
    fltPlateCenterY = (listOfMatchingChars[0].intCenterY + listOfMatchingChars[len(listOfMatchingChars) - 1].intCenterY) / 2.0

    ptPlateCenter = fltPlateCenterX, fltPlateCenterY

    #Calculate plate width and height
    intPlateWidth = int((listOfMatchingChars[len(listOfMatchingChars) - 1].intBoundingRectX + 
                         listOfMatchingChars[len(listOfMatchingChars) - 1].intBoundingRectWidth - 
                         listOfMatchingChars[0].intBoundingRectX) * PLATE_WIDTH_PADDING_FACTOR)

    intTotalOfCharHeights = 0

    for matchingChar in listOfMatchingChars:
        intTotalOfCharHeights = intTotalOfCharHeights + matchingChar.intBoundingRectHeight

    fltAverageCharHeight = intTotalOfCharHeights / len(listOfMatchingChars)
    intPlateHeight = int(fltAverageCharHeight * PLATE_HEIGHT_PADDING_FACTOR)

    #Calculate correction angle of plate region
    fltOpposite = listOfMatchingChars[len(listOfMatchingChars) - 1].intCenterY - listOfMatchingChars[0].intCenterY
    fltHypotenuse = DetectChars.distanceBetweenChars(listOfMatchingChars[0], listOfMatchingChars[len(listOfMatchingChars) - 1])
    fltCorrectionAngleInRad = math.asin(fltOpposite / fltHypotenuse)
    fltCorrectionAngleInDeg = fltCorrectionAngleInRad * (180.0 / math.pi)

    #Pack plate region center point, width and height, and correction angle into rotated rect member variable of plate
    possiblePlate.rrLocationOfPlateInScene = ( tuple(ptPlateCenter), (intPlateWidth, intPlateHeight), fltCorrectionAngleInDeg )

    #Get the rotation matrix for our calculated correction angle
    rotationMatrix = cv.getRotationMatrix2D(tuple(ptPlateCenter), fltCorrectionAngleInDeg, 1.0)

    height, width, _ = imgOriginal.shape      #Unpack original image width and height
    imgRotated = cv.warpAffine(imgOriginal, rotationMatrix, (width, height))       #Rotate the entire image
    imgCropped = cv.getRectSubPix(imgRotated, (intPlateWidth, intPlateHeight), tuple(ptPlateCenter))

    possiblePlate.imgPlate = imgCropped         #Copy the cropped plate image into the applicable member variable of the possible plate

    charH = listOfMatchingChars[0].intBoundingRectHeight #Get char height to calculate min/max char area

    #Apply char contours on image for better character segmentation
    imgOrg2 = imgOriginal.copy()
    for char in listOfMatchingChars:
        cnt = char.contour
        cv.drawContours(imgOrg2, [cnt], 0, (0,0,0), 1)
    imgRotatedCont = cv.warpAffine(imgOrg2, rotationMatrix, (width, height))      #Rotate the entire image containing the char contours
    imgCroppedCont = cv.getRectSubPix(imgRotatedCont, (intPlateWidth, intPlateHeight), tuple(ptPlateCenter))
    height, width, _ = imgCroppedCont.shape

    #Improve lp text quality by character segmentation and background removal

    #Create blank mask, convert to HSV, define thresholds, color threshold
    result = np.zeros(imgCroppedCont.shape, dtype=np.uint8)
    hsv = cv.cvtColor(imgCroppedCont, cv.COLOR_BGR2HSV)
    lower = np.array([0,0,0])
    upper = np.array([179,100,130])
    mask = cv.inRange(hsv, lower, upper)

    #Perform morph close and merge for 3-channel ROI extraction
    kernel = cv.getStructuringElement(cv.MORPH_RECT, (3,3))
    close = cv.morphologyEx(mask, cv.MORPH_CLOSE, kernel, iterations=1)
    extract = cv.merge([close,close,close])

    #Find contours, filter using contour area, and extract using Numpy slicing
    cnts = cv.findContours(close, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]
    for c in cnts:
        x,y,w,h = cv.boundingRect(c)
        area = w * h
        if area < charH * charH * 0.8 and area > charH * charH * 0.3:
            if DEBUGGING:
                print(area)
            cv.rectangle(imgCroppedCont, (x, y), (x + w, y + h), (36,255,12), 3)
            result[y:y+h, x:x+w] = extract[y:y+h, x:x+w] 

    #Invert image
    invert = 255 - result

    possiblePlate.imgReadable = invert

    return possiblePlate