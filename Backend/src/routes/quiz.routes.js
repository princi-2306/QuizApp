import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteQuiz, generateQuiz, getQuizDetails, saveQuiz, updateQuiz } from "../controllers/quiz.controller.js";

const quizRouter = Router();

quizRouter.route("/generate-quiz").post(generateQuiz);
quizRouter.route("/save").post(verifyJWT, saveQuiz);
quizRouter.route("/update-quiz/:quizId").put(verifyJWT,updateQuiz)
quizRouter.route("/delete/:quizId").delete(verifyJWT, deleteQuiz)
quizRouter.route("/getQuiz/:quizId").get(verifyJWT, getQuizDetails)

export default quizRouter;