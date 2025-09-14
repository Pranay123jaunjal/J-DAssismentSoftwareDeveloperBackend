const mongoose = require("mongoose");

const MAX_RETRIES = 5;          
const RETRY_INTERVAL = 5000;       

let retries = 0;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(` MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(` MongoDB connection error: ${err.message}`);

    if (retries < MAX_RETRIES) {
      retries++;
      console.log(` Retry attempt ${retries}/${MAX_RETRIES} in ${RETRY_INTERVAL / 1000}s...`);

      setTimeout(connectDB, RETRY_INTERVAL);
    } else {
      console.error(" Max retries reached. Exiting...");
      process.exit(1);
    }
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});

module.exports = connectDB;
