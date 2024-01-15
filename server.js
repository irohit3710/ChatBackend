const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const  mongoose  = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json()); 
dotenv.config();

const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

const connectToDb = async ()=>{
  try{
      const connect = await mongoose.connect(process.env.MONGO_URI);
      console.log("Database Connected")
  }
  catch(err){
      console.log("Server is not connected to Database : ",err);
  }
}
connectToDb();



app.get("/", (req, res) => {
  res.send("API Running!");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
//   );
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..");
//   });
// }

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: `${process.env.FRONT_URL}`,
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  // console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    // console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    // console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
