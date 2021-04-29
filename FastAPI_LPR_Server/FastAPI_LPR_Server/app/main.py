#ParKOMP - Parking of the future
#Yordan Yordanov, March 2021
#Baba Tonka High School of Mathematics, Ruse
#For contacts - yyordanov2002@icloud.com

#IT IS FORBIDDEN TO USE THIS CODE IN ANY WAY
#WITHOUT THE PERMISSION OF THE OWNER


#ParKOMP Systems FastAPI LPR System Server
#
#This is an API responsible for discovering
#license plate text from photos captured by cameras on
#parking lots
#
#The server is designed to be easily scalable and could be inplemented
#on local parking level or instantiated in a public server
#
#It uses numerous computer vision techiques and minimalises
#error rate in guessing the license plate text
#
#FastAPI is used for the server as it is a modern async python
#server technology

from fastapi import Security, Depends, FastAPI, HTTPException, Request
from fastapi.security.api_key import APIKeyQuery, APIKeyHeader, APIKey

from starlette.status import HTTP_403_FORBIDDEN
from starlette.responses import RedirectResponse, JSONResponse

from .lpr import FindPlateText as fpt
import json

API_KEY = "abclfjjrgjkswei14467.@_" #The secret api_key passed by the header by the client
API_KEY_NAME = "access_token"       #the header name for the api_key

api_key_query = APIKeyQuery(name=API_KEY_NAME, auto_error=False)
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(
    api_key_query: str = Security(api_key_query),
    api_key_header: str = Security(api_key_header),
):

    if api_key_query == API_KEY:
        return api_key_query
    elif api_key_header == API_KEY:
        return api_key_header
    else:
        raise HTTPException( #error type for api_key validation error
            status_code=HTTP_403_FORBIDDEN, detail="Could not validate credentials"
        )

app = FastAPI()

#GET; used for testing purposes
@app.get("/") 
async def homepage():
    return "Hello World!"

#POST; Used for receiving image data
#Image data is passed by the body in json format {"img": "image_data"}
#api_key is passed by a header named "access_token"
@app.post("/image")
async def get_open_api_endpoint(request: Request, api_key: APIKey = Depends(get_api_key)):
    try:
        imgData = json.loads(await request.body())
        image = imgData["img"]   #get image data from json
        res = fpt.find_lp(image) #pass base64 image data to the lpr algorithm
        return res               #return result as String Results: "None" or "read_license_plate_text" 
    except Exception as e:
        return {"Wrong data! " + str(e)} #return exception details
