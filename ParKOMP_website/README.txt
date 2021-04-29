(EN)
Main server installation (Ubuntu Server 20.04):
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

6) Install mysql and set it up, following their guide
7) Create parkomp_db database by generating the creation script with 
   Mysql Workbench and use the given .mwb project
8) Enter all the settings in the .env file, located in the project's main directory
9) Start the application
 -$ npm run devStart

(BG)
Инсталация на главния сървър (Ubuntu Server 20.04):
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

6) Инсталирайте mysql и го настройте, като следвате указанията, които дава
7) Създайте базата данни parkomp_db, като генерирате скрипта чрез 
   mysql workbench и използвате предоставения .mwb проект
8) Въведете необходимите настройки в .env файла, който се намира в главната директория на проекта
9) Стартирайте приложението
 -$ npm run devStart

Yordan Yordanov, February 2021