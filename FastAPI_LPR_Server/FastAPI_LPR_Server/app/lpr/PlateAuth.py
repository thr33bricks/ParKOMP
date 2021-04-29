#ParKOMP Systems, Yordan Yordanov 2021
#===========================================================
import re
import pytesseract
from pytesseract import Output

from . import Countries as ctry
from .config import DEBUGGING
from .config import OCR_CONFIDENCE_TRESH

def detectPlate(listOfPossiblePlates):
    #Sort the list of possible plates in DESCENDING order (most number of chars to least number of chars)
    listOfPossiblePlates.sort(key = lambda possiblePlate: possiblePlate.possibleChrCount, reverse = True)

    for possiblePlate in listOfPossiblePlates:
        #Get license plate text from processed image
        text = img2LP(possiblePlate.imgReadable)
        text = ctry.authPlateAll(text)
        if text != None: #if lp text is authenticated for the selected country
            possiblePlate.strChars = text
            return possiblePlate
        else:   #if text is not auth pass the unmodified cropped image of the license plate
            text = img2LP(possiblePlate.imgPlate)
            text = ctry.authPlateAll(text)
            if text != None:
                if DEBUGGING:
                    print('\n================================================================')
                    print('Is the LP number: ' + text + '?')
                    print('================================================================\n')
                possiblePlate.strChars = text
                return possiblePlate
            if DEBUGGING:
                print(text)
    return None

#Get text from license plate and filter it to only digits and letters
#Also check for confidence score of every word
def img2LP(img):
    dic = pytesseract.image_to_data(img, lang='eng', nice=1, config='--psm 9', output_type=Output.DICT) #org: psm 6
    if DEBUGGING:
        print(dic['text'])
        print(dic['conf'])
    if confPass(dic['conf']):
        text = getText(dic['text'])
    else:
        text = None

    if text != None:
        text = re.sub(r'[^A-Za-z0-9]', '', text)
        text = text.upper()
    return text

def confPass(confArr):
    for conf in confArr:
        if conf == '-1':
            continue
        elif conf < OCR_CONFIDENCE_TRESH:
            return False
    return True

def getText(textArr):
    txt = ''
    for elm in textArr:
        if elm != '':
            txt += elm
    return txt