const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

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

app.get('/', (req, res) => {
	res.send(database.users);
})

app.post('/signin', (req, res) => {
	db.select('email', 'hash').from('login')
	.where('email', '=', req.body.email)
	.then(data => {
		const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
		if (isValid) {
			return db.select('*').from('users')
				.where('email', '=', req.body.email)
				.then(user => {
						res.json(user[0])
				})
				.catch(err => res.status(400).json('unable to get user'))
			} else {
				res.status(400).json('wrong credentials 1')
			}
		})
	.catch(err => res.status(400).json('wrong credentials 2'))
})

// Hashing passwords on '/register'
// This transaction is probably the trickiest part to get used to,
// but once you get the syntax down it becomes very easy:
app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	const hash = bcrypt.hashSync(password);
// You create a transaction when you have to do more than two things at once,
	db.transaction(
// and you use this trx object (instead of 'db' now) to do these operations.
		trx => {
// In this case, we insert it...
		trx.insert({
			hash: hash,
			email: email
		})
// into login:
		.into('login')
 // It returned the email:
		.returning('email')
// And then, we use the loginEmail to...
		.then(loginEmail => {
// return another trx transaction...
			return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0],
					name: name,
					joined: new Date()
				})
// ... to insert into the users, 
					.then(user => {
// and responded with Json:
					res.json(user[0]);
				})
			})
// In order for this to get added, we have to make sure that we commit:
			.then(trx.commit)
// and in case anything fails, we... 
			.catch(trx.rollback)
// rollback the changes
		})
	.catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db.select('*').from('users').where({id})
		.then(user => {
			if (user.length) {
				res.json(user[0])
			} else {
				res.status(400).json('Not found!')
			}
	})
		.catch(err => res.status(400).json('error getting user'))
})

app.put('/image', (req, res) => {
	const { id } = req.body;
	db('users').where('id', '=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0]);
	})
	.catch(err => res.status(400).json('unable to get entries'))
})



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