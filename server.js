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

db.select('*').from('users').then(data => {
	// console.log(data);
});

const app = express();

const database = {
	users: [
		{
			id: "123",
			name: "John",
			password: "cookies",
			email: "john@gmail.com",
			entries: 0,
			joined: new Date()
		},
		{
			id: "124",
			name: "Sally",
			password: "bananas",
			email: "sally@gmail.com",
			entries: 0,
			joined: new Date()
		}
	],
	login: [
		{
			id: '987',
			has: '',
			email: 'john@gmail.com'
		}
	]
}

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
	res.send(database.users);
})

app.post('/signin', (req, res) => {
	// bcrypt.compare("apples", "$2a$10$WE0WmBvWmzkN7aQeqkfPB.nV6GkDvSa9lwuxjJgS9Rq9/tnixtZqe", function(err, res) {
	//     console.log('first guess', res)
	// });
	// bcrypt.compare("veggies", "$2a$10$WE0WmBvWmzkN7aQeqkfPB.nV6GkDvSa9lwuxjJgS9Rq9/tnixtZqe", function(err, res) {
	//     console.log('second guess', res)
	// });
	if (req.body.email === database.users[0].email && 
			req.body.password === database.users[0].password) {
		res.json(database.users[0]);
	} else {
		res.status(400).json('error loggin in, sorry')
	}
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
			if(user.length) {
				res.json(user[0])
			} else {
				res.status(400).json('Not found!')
			}
	})
		.catch(err => res.status(400).json('error getting user'))
	// if (!found) {
	// 	res.status(400).json('not found');
	// }
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