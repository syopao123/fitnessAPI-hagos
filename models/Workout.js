const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Workout name is Required"]
	},
	duration: {
		type: String,
		required: [true, "Duration is Required"]
	},
	userId: {
		type: String,
		required: [true, "User ID is Required"]
	},
	dateAdded: {
		type: Date,
		default: Date.now
	},
	status: {
		type: String,
		default: "pending"
	}
});

module.exports = mongoose.model("Workout", workoutSchema);