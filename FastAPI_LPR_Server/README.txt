(EN)
Starting the LPR Server container
You have to build a container image using the "docker build" command in the directory where the Dockerfile is located.
Use the "docker run" command with port 8000 to run the container image. "docker stop" can be used to stop the already running container.
Then "docker start" can be used to run the stopped container again. For more information on how to use Docker you can visit the Docker
documentation. https://docs.docker.com/get-started/

(BG)
Стартиране на "LPR Server" контейнер
Контейнерът се създава чрез "docker build" командъта в директорията, където се намира Dockerfilе-a.
За да се стартира контейнера се използва "docker run" командата с порт 8000. С "docker stop" можем да спрем стартирания контейнер. 
След това може да се използва "docker start" за да се стартира контайнера отново. За повече информация можете да се обърнете към
документацията на Docker. https://docs.docker.com/get-started/