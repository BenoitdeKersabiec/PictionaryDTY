

# Pictionary DTY

Author: Benoit Sioc'han de Kersabiec

## Description: 
This project has been made to be admitted to the Digital Tech Year.
It is a Pictionary Game. Users can login/register and then play. 
Once a user is logged in, he can see all the games he has created and join an ongoing game.
A game can start when there is at least 2 players. A 'drawer' is choosen among the players.
He chooses a word among three propositions and start to draw. The other players take guesses.
Once all the other players have guessed or once the time has elapsed (after 90s), the drawer changes and the cycle restarts.
A game globally end when one player hits 500 points.

## Setup
Ensure you have nodeJS installed (version 10.18.0 or heigher)

1. Clone the repository
2. Go in the pictionary_back folder
3. Run ```npm install```
4. Run ```node server.js```
5. Go in the pictionary_front folder
6. Run ```npm install```
7. Run ```npm run start```
8. Once it has start, go to [localhost:3000](https://localhost:3000/)
9. To launch the process on a local network, change the server address in /pictionary_front/.env to your disired IP adress

## Tech Used

This project is using the MERN stack:
* MongoDB (Database)
* Express (to build an nodeJS web application)
* React (FrontEnd Side)
* NodeJS (BackEnd side)
<br/>
<br/>
The database is in the cloud (MongoDB Atlas), thus it's already initialized
<br/>
Mongoose is used to deal with the mongoDB database
<br/>
Autentification tokens are manage by Jason Web Token
<br/>
Real time transmission for drawing and chating is achieved thanks to Socket.io
<br/>
Linter used is ESlint

## Details

To log in as an admin, use:
<br/>
**email:** admin@admin
<br/>
**password:** adminSession
