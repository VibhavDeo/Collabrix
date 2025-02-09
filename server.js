// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const app = express();
const { authSocket, socketServer } = require("./socketServer");

// Import your routes
const posts = require("./routes/posts");
const users = require("./routes/users");
const comments = require("./routes/comments");
const messages = require("./routes/messages");
const chatRoutes = require("./routes/chat");

dotenv.config();

// Create HTTP + Socket.IO server
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://post-it-heroku.herokuapp.com"],
  },
});

// Socket auth
io.use(authSocket);
io.on("connection", (socket) => socketServer(socket));

// Connect to MongoDB
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("MongoDB connected");
  }
);

// Start server
httpServer.listen(process.env.PORT || 4000, () => {
  console.log("Listening on port", process.env.PORT || 4000);
});

// Express middleware
app.use(express.json());
app.use(cors());

// REST routes
app.use("/api/posts", posts);
app.use("/api/users", users);
app.use("/api/comments", comments);
app.use("/api/messages", messages);
app.use("/api/chat", chatRoutes);

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}
