#ParKOMP Systems, Yordan Yordanov 2021
#===========================================================
import re
from .config import COUNTRIES

#authenticate plate number for the all selected countries
def authPlateAll(text):
    auth = None
    for country in COUNTRIES:
        res = authPlate(country, text)
        if(res != None):
            auth = res
            break
    return auth

#authenticate plate number for the selected country
def authPlate(country, text):
    auth = None
    if country == 'bg':
        auth = authPlateBG(text)
    return auth

#======================================================

def authPlateBG(text):
    pattern = re.compile('[ABEKMHOPCTYX]{1,2}[0-9]{4}[ABEKMHOPCTYX]{2}$|[ABEKMHOPCTYX]{1,2}[0-9]{6}$|[0-9]{3}[BMHT]{1}[0-9]{3}$|[CT]{1,2}[0-9]{4}$|[XH]{2}[0-9]{4}$')#P1112CA, P111111, 123H229, C0110, XH1123 
    try:
        plate = pattern.match(text)
    except:
        return None
    
    if plate:
        return plate.group()
    else:
        return None
