// Hashing passwords on '/register'
// This transaction is probably the trickiest part to get used to,
// but once you get the syntax down it becomes very easy:
const handleRegister = (req, res, db, bcrypt) => {
	const { email, name, password } = req.body;
	if (!email || !name || !password) {
		return res.status(400).json('incorrect form submission');
	}
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
}

module.exports = {
	handleRegister: handleRegister
};
