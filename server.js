const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'gillenha',
    password : '8BlockdoWn',
    database : 'smartbrain'
  }
});

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res) => { res.send(database.users) })
app.post('/signin', signin.handleSignin(db, bcrypt));
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) });
app.get('/profile/:id', (req, res) => { proflile.handleProfileGet(req, res, db) });
app.put('/image', (req, res) => { image.handleImage(req, res, db) });
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) });

// Load hash from your password DB.
app.listen(3000, () => {
	console.log("app is running on port 3000")
})

/*
Before you start coding, you want an idea of what your API will look like

/ --> res = this is working // a root route that responds with 'this is working';
/ signin  --> POST = success/fail // we're posting some data, which is user information, it responds with success or fail
/ register --> POST = user // we want to add the data to a database, or in this case a const on our file;
/ profile/:userId --> GET = user // we want the ability to access the profile of the user, an actual parameter of the user id so that each user has their own home screen
/ image --> PUT --> user, will update count

*/