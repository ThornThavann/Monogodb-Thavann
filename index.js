require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/dbconnect', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));


// Define the User model (simplified for this example)
const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String
});
const User = mongoose.model('User', userSchema);

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON data from request body
app.use(bodyParser.json());

// Route handlers
app.get('/home', (req, res) => {
  res.status(200).json('You are welcome');
});

// Define a route to register users
app.post('/registers', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      fullname: username,  // Assuming username is passed as fullname
      email,
      password: hashedPassword
    });

    // Save the user to the database
    await newUser.save();

    // Generate a token
    const token = jwt.sign({ id: newUser._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Define the /login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send('User not found');
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send('Invalid password');
    }

    // Generate a JSON Web Token (JWT)
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    // Send the token back to the user
    res.status(200).send({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Set up the server to listen on a port
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
