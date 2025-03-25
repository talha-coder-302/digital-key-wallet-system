const config = require("./config");
// console.log("MongoDB")
const mongoose =  require('mongoose');
function getDatabaseUrl() {
  // return (
  //   config.db_config.driver +
  //   "://" +
  //   // config.db_config.username
  //   //  + ":"+
  //   // config.db_config.password 
  //   // +"@"+
  //   config.db_config.host +
  //   ":" +
  //   config.db_config.port +
  //   "/" +
  //   config.db_config.dbName //+ "?authSource=" + config.db_config.authSource
  // );
     return (
      "mongodb+srv://talhadevelopments:1Cbbr63H6CwLQ4ig@cluster0.c3jvt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
     )
}
const uri = getDatabaseUrl();
console.log(uri)

let isConnected = false;
let idleTimer = null;

const connectToDatabase = async () => {
  if (!isConnected) {
    try {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      isConnected = true;
      console.log('MongoDB Connected');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err?.message);
      throw err;
    }
  }

  clearIdleTimer();
  return mongoose.connection;
};

// Function to start an idle timer and disconnect the database after inactivity
const startIdleTimer = () => {
  clearIdleTimer(); // Clear existing timer
  idleTimer = setTimeout(async () => {
    if (isConnected) {
      console.log('Closing MongoDB connection due to inactivity...');
      await mongoose.disconnect();
      isConnected = false;
    }
  }, 60000); // Close connection after 1 minute of inactivity (adjust as needed)
};

// Clear idle timer function
const clearIdleTimer = () => {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
};

// Export connect function and a function to manually close connection if needed
const disconnectFromDatabase = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB Disconnected');
  }
};

module.exports = { connectToDatabase, disconnectFromDatabase, startIdleTimer };

