const bcrypt = require("bcrypt");
const User = require("../models/User");
const auth = require("../auth");

const { errorHandler } = auth;

module.exports.registerUser = (req, res) => {
	const { email, password } = req.body;

	if (typeof email !== "string" || !email.includes("@")) {
		return res.status(400).send({ message: "Email invalid" });
	}

	if (typeof password !== "string" || password.length < 8) {
		return res.status(400).send({ message: "Password must be atleast 8 characters" });
	}

	return User.findOne({ email: email })
	.then(existingUser => {
		if (existingUser) {
			return res.status(400).send({ message: "Email already registered" });
		}

		let newUser = new User({
			email: email,
			password: bcrypt.hashSync(password, 10)
		});

		return newUser.save()
		.then(() => res.status(201).send({ message: "Registered Successfully" }))
		.catch(error => {
			// 11000 = duplicate key (unique index caught a race or old data)
			if (error.code === 11000) {
				return res.status(400).send({ message: "Email already registered" });
			}
			return errorHandler(error, req, res);
		});
	})
	.catch(error => errorHandler(error, req, res));
};

module.exports.loginUser = (req, res) => {
	const { email, password } = req.body;

	if (typeof email !== "string" || typeof password !== "string") {
		return res.status(400).send({ message: "Email and password are required" });
	}

	return User.findOne({ email: email })
	.then(user => {
		if (!user) {
			return res.status(404).send({ message: "No Email Found" });
		}

		const isPasswordCorrect = bcrypt.compareSync(password, user.password);

		if (isPasswordCorrect) {
			return res.status(200).send({ access: auth.createAccessToken(user) });
		} else {
			return res.status(401).send({ message: "Email and password do not match" });
		}
	})
	.catch(error => errorHandler(error, req, res));
};

module.exports.getUserDetails = (req, res) => {
	// select("-password") keeps the password hash out of the response
	return User.findById(req.user.id).select("-password")
	.then(user => {
		if (!user) {
			return res.status(404).send({ message: "User not found" });
		}

		return res.status(200).send({ user: user });
	})
	.catch(error => errorHandler(error, req, res));
};
