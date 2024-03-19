import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from './config/db.js';
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();
app.use(express.json());

dotenv.config();

conectarDB();

const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Error Cors"));
        }
    },
};

app.use(cors(corsOptions));

// Routing
app.use("/api/user", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/task", taskRoutes);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

//socket.io
import { Server } from "socket.io";

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
});

io.on("connection", socket => {

    //events socket io
    socket.on("open project", (project) => {
        socket.join(project);
    });

    socket.on("new task", task => {
        const project = task.project;
        socket.to(project).emit("task added", task);
    });

    socket.on("delete task", task => {
        const project = task.project;
        socket.to(project).emit("delete task", task);
    });

    socket.on("edit task", task => {
        const project = task.project._id;
        socket.to(project).emit("edit task", task);
    });

    socket.on("completed task", task => {
        const project = task.project._id;
        socket.to(project).emit("new state", task);

    })

})