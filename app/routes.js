var mongoose = require('mongoose');

var User = require('./models/user');
var Poem = require('./models/poem');

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		if (req.isAuthenticated()) {
			res.render('home', {user: req.user, title: 'Post'});
		} else {
			res.render('index');
		}
	});

	app.post('/', loggedIn, function(req, res) {
		// post a poem
		var poem = new Poem({
			title: req.body.title,
			content: req.body.poem,
			author: req.user._id
		});

		poem.save(function(err, poem) {
			if (err) res.send(err);

			res.redirect('/poem/' + poem._id)
		});
	});

	app.get('/settings', loggedIn, function(req, res) {
		res.render('settings', {user: req.user, title: req.user.username});
	});

	app.post('/settings', loggedIn, function(req, res) {
		User.findOne({username: req.user.username}, function(err, user) {
			user.username = req.body.username;

			user.save(function(err) {
				if (err) throw err;
			});

			res.redirect(req.get('referer'));
		});
	});

	app.get('/delete', loggedIn, function(req, res) {
		res.render('delete', {user: req.user});
	});

	app.post('/delete', loggedIn, function(req, res) {
		// change this to app.delete soon
		User.remove({_id: req.user._id}, function(err) {
			if (err) throw err;

			Poem.find({author: req.user._id}).remove().exec();

			res.redirect('/');
		})
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/register', function(req, res) {
		res.render('register', {
			title: 'Register',
			message: req.flash('registerMessage')
		});
	});

	app.post('/register', passport.authenticate('local-register', {
		successRedirect: '/',
		failureRedirect: '/register',
		failureFlash: true
	}));

	app.get('/login', function (req, res) {
		res.render('login', {
			title: 'Login',
			message: req.flash('loginMessage')
		});
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.get('/poem/:id', function(req, res) {
		var id = req.params.id;

		Poem.findOne({_id: id}, function(err, poem) {
			if (err) res.send(err);

			User.findOne({_id: poem.author}, function(err, author) {
				if (err) res.send(err);

				res.render('poem', {
					poem: poem,
					author: author,
					title: poem.title
				});
			});
		});

	});

	// testing, remove in production
	app.get('/poems', function(req, res) {
		Poem.find({}, function(err, poems) {
			if (err) throw err;

			res.send(poems);
		})
	})

	// testing, remove in production
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
			if (!user) {
				res.render('404')
			} else {
				Poem.find({author: user._id}, function(err, poems) {
					res.render('profile', {user: user, poems: poems});
				})
			}
		});
	});

	app.get('/me', loggedIn, function(req, res) {
		res.redirect('/user/' + req.user.username);
	})

	app.get('*', function(req, res) {
		res.render('404');
	})

	function loggedIn(req, res, next) {
		if (req.isAuthenticated()) return next();

		res.redirect('/login'); // else redirect to login
	}

}