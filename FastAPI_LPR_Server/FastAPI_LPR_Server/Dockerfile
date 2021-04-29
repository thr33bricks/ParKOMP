FROM python:3.7

LABEL maintainer = "Yordan Yordanov <jormil1@abv.bg>"

#Pytesseract prereqisites
#Google Tesseract OCR and python3-imaging
RUN apt-get update -y \
    && apt-get install -y python3-pil \
    && apt-get install -y tesseract-ocr

#install dependencies
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

#Install opencv-python dependencies
RUN apt-get update \
    && apt-get install ffmpeg libsm6 libxext6  -y

EXPOSE 8000

COPY ./app /app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]