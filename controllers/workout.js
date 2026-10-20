const mongoose = require("mongoose");
const Workout = require("../models/Workout");
const { errorHandler } = require("../auth");

module.exports.addWorkout = (req, res) => {
	const { name, duration } = req.body;

	if (typeof name !== "string" || name.trim() === "" || typeof duration !== "string" || duration.trim() === "") {
		return res.status(400).send({ message: "Name and duration are required" });
	}

	let newWorkout = new Workout({
		name: name,
		duration: duration,
		userId: req.user.id
	});

	return newWorkout.save()
	.then(workout => res.status(201).send(workout))
	.catch(error => errorHandler(error, req, res));
};

module.exports.getMyWorkouts = (req, res) => {
	// req.user.id comes from the verify middleware, so no User lookup needed
	return Workout.find({ userId: req.user.id })
	.then(workouts => res.status(200).send({ workouts: workouts }))
	.catch(error => errorHandler(error, req, res));
};

module.exports.updateWorkout = (req, res) => {
	const { workoutId } = req.params;
	const { name, duration } = req.body;

	if (!mongoose.isValidObjectId(workoutId)) {
		return res.status(400).send({ message: "Invalid workout ID" });
	}

	let updates = {};
	if (typeof name === "string" && name.trim() !== "") updates.name = name;
	if (typeof duration === "string" && duration.trim() !== "") updates.duration = duration;

	if (Object.keys(updates).length === 0) {
		return res.status(400).send({ message: "Provide a name or duration to update" });
	}

	// userId in the filter makes sure users can only update their own workouts
	return Workout.findOneAndUpdate(
		{ _id: workoutId, userId: req.user.id },
		updates,
		{ returnDocument: "after" }
	)
	.then(workout => {
		if (!workout) {
			return res.status(404).send({ message: "Workout not found" });
		}

		return res.status(200).send({ message: "Workout updated successfully", updatedWorkout: workout });
	})
	.catch(error => errorHandler(error, req, res));
};

module.exports.deleteWorkout = (req, res) => {
	const { workoutId } = req.params;

	if (!mongoose.isValidObjectId(workoutId)) {
		return res.status(400).send({ message: "Invalid workout ID" });
	}

	return Workout.findOneAndDelete({ _id: workoutId, userId: req.user.id })
	.then(workout => {
		if (!workout) {
			return res.status(404).send({ message: "Workout not found" });
		}

		return res.status(200).send({ message: "Workout deleted successfully" });
	})
	.catch(error => errorHandler(error, req, res));
};

module.exports.completeWorkoutStatus = (req, res) => {
	const { workoutId } = req.params;

	if (!mongoose.isValidObjectId(workoutId)) {
		return res.status(400).send({ message: "Invalid workout ID" });
	}

	// Atomic: only a "pending" workout owned by this user gets updated
	return Workout.findOneAndUpdate(
		{ _id: workoutId, userId: req.user.id, status: "pending" },
		{ status: "completed" },
		{ returnDocument: "after" }
	)
	.then(workout => {
		if (workout) {
			return res.status(200).send({ message: "Workout status updated successfully", updatedWorkout: workout });
		}

		// No match: find out if it doesn't exist or is already completed
		return Workout.findOne({ _id: workoutId, userId: req.user.id })
		.then(existing => {
			if (!existing) {
				return res.status(404).send({ message: "Workout not found" });
			}

			return res.status(400).send({ message: "Workout already completed" });
		});
	})
	.catch(error => errorHandler(error, req, res));
};
