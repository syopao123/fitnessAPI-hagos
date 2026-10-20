const express = require('express');
const mongoose = require('mongoose');
const workoutRoutes = require("./routes/workout");
const userRoutes = require("./routes/user");

require('dotenv').config();

const app = express();

mongoose.connect(process.env.MONGODB_STRING);
mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'))

app.use(express.json());

//Routes Middleware
app.use("/workouts", workoutRoutes);
app.use("/users", userRoutes);

if(require.main === module){
	app.listen(process.env.PORT || 4000, () => {
	    console.log(`API is now online on port ${ process.env.PORT || 4000 }`)
	});
}

module.exports = {app,mongoose};