(EN)
Local controller server installation (Ubuntu 18.04):
1) Install Node.js
 -$ sudo apt update
 -$ sudo apt install nodejs

2) Install the npm package manager
 -$ sudo apt install npm

3) To make sure Node.js is installed check its version
 -$ nodejs -v

4) Copy the app to a location you like and go to the project's
   main directory
5) Install all project dependencies
 -$ npm install

6) Enter all the settings in the .env file, located in the project's main directory
7) Start the application
 -$ npm run start
 OR
 -$ npm run devStart

You can add your entrances in the entransesIO.json file in json format

(BG)
Инсталация на локалния контролерен сървър (Ubuntu 18.04):
1) Инсталиране на Node.js
 -$ sudo apt update
 -$ sudo apt install nodejs

2) Инсталиране на npm package manager
 -$ sudo apt install npm

3) За да се уверите, че node.js е инсталиран, проверете версията му
 -$ nodejs -v

4) Копирайте приложението на подходяща локация и се придвижете до 
   локацията на проекта
5) Инсталирайте всички зависимости на проекта
 -$ npm install

6) Въведете необходимите настройки в .env файла, който се намира в главната директория на проекта
7) Стартирайте приложението
 -$ npm run start
 ИЛИ
 -$ npm run devStart

Можете да добавите входовете на паркинга във файла "entransesIO.json" в "json" формат

Yordan Yordanov, April 2021