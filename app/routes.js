var User = require('./models/user');

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.render('index');
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/register', function(req, res) {
		res.render('register');
	});

	app.post('/register', passport.authenticate('local-signup', {
		successRedirect: '/profile',
		failureRedirect: '/register',
		failureFlash: true
	}));

	app.get('/profile', loggedIn, function(req, res) {
		res.render('profile', {user: req.user});
	});

	app.get('/login', function (req, res) {
		res.render('login');
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.get('/users', function(req, res) {
		User.find({}, function(err, users) {
			if (err) throw err;

			res.send(users);
		});
	});

	app.get('/user/:username', function(req, res) {
		var username = req.params.username;

		User.findOne({username: username}, function(err, user) {
			if (err) throw err;

			res.send(user);
		});
	});


	function loggedIn(req, res, next) {
		if (req.isAuthenticated()) return next();

		res.redirect('/'); // else redirect home
	}

}