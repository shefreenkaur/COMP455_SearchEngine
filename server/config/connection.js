const mongoose = require('mongoose');
require('dotenv').config();

console.log('Attempting to connect to MongoDB with URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI);

const conn = mongoose.connection;
conn.on('error', err => console.error('MongoDB connection error:', err));
conn.once('open', () => console.log('Connected to MongoDB'));

module.exports = conn;
