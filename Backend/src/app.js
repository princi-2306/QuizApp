import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());       // accepting this size of amount of json data here
app.use(express.urlencoded({
    extended:true
}));
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
})) // if cors is requested for backend to deliver the data
//routes

import userRouter from "./routes/user.routes.js"
import quizRouter from "./routes/quiz.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/quiz", quizRouter);
// console.log(user);
app.get("/", (req, res) => res.send(`Server running on port`));

export default app;
