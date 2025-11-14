import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Quiz } from "../models/quizs.model.js";
import {GoogleGenerativeAI} from "@google/generative-ai"


const generateQuiz = asyncHandler(async (req, res) => {
    const { text, quizType, numQuestions, difficulty, title} =
        req.body;

    //validate required fields 
    if (!text || !text.trim()) {
        throw new ApiError(400, "text content is required to generate a quiz");
    }

    const quizOptions = {
        quizType: quizType || "multiple-choice",
        numQuestions: numQuestions || 5,
        difficulty: difficulty || "medium",
        title: title || "Generated quiz",
    };

    //validate options
    if (quizOptions.numQuestions < 1 || quizOptions.numQuestions > 20) {
        throw new ApiError(400, "number of questions must be between 1 and 20");
    }

    const validQuizType = ["multiple-choice", "boolean"];
    if (!validQuizType.includes(quizOptions.quizType)) {
        throw new ApiError(400, "Invalid quiz type. Must be one of : " + validQuizType.join(","));
    }

    const validateDifficulties = ["easy", "medium", "hard"];
    if (!validateDifficulties.includes(quizOptions.difficulty)) {
        throw new ApiError(400, "invalid difficulty")
    };

    //initialise gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const prompt = `
    Generate a ${quizOptions.quizType} quiz based on the following text.
    
    TEXT:
    ${text.substring(0, 10000)} // Limit text length
    
    REQUIREMENTS:
    - Number of questions: ${quizOptions.numQuestions}
    - Type: ${quizOptions.quizType}
    - Difficulty: ${quizOptions.difficulty}
    - Format: JSON
    
    OUTPUT FORMAT:
    {
      "title": "${quizOptions.title}",
      "questions": [
        {
          "questionText": "Question here",
          "choices": [
            {"text": "Option A", "isCorrect": true/false},
            {"text": "Option B", "isCorrect": true/false},
            // ... more options
          ],
          "explanation": "Brief explanation"
        }
      ]
    }
    
       Important rules:
    - For multiple-choice: include exactly 1 correct answer per question, only have 4 options
    - For true-false: choices should be "True" and "False" only
    - Ensure questions are directly based on the provided text
    - Make explanations educational and accurate
    - Return ONLY valid JSON, no additional text
    
    Ensure the quiz is educational and accurate.
    `;
     
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const quizText = response.text();

        //parse JSON response from Gemini
        let quizData;
        try {
            const cleanedText = quizText.replace(/```json|```/g, '').trim();
            quizData = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("failed to parse AI response : ", quizText);
        }

        return res.status(200).json(
            new ApiResponse(200, {
                quiz: quizData,
                message: "Quiz generated successfully",
            }, "Quiz generated successfully!")
        );
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "failed to generate quiz " + error.message)
    }
});

const saveQuiz = asyncHandler(async (req, res) => {
  const { userId, title, lastAttempted, questions, attempted, quizType, score } =
    req.body;
  // console.log(req.body)
  if (!title?.trim()) {
    throw new ApiError(400, "Quiz title is required!");
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, "Questions array is required and cannot be empty!");
  }
  const cleanedQuestions = questions.map((question) => ({
    questionText: question.questionText,
    explanation: question.explanation,
    choices: question.choices.map((choice) => ({
      text: choice.text,
      isCorrect: choice.isCorrect,
      userAnswer: choice.userAnswer,
    })),
  }));
  const quiz = await Quiz.create({
    userId: userId,
    title: title.trim(),
    lastAttempted: lastAttempted || new Date(),
    questions: cleanedQuestions,
    attempted: attempted || true,
    quizType: quizType,
    score: score,
  });

  const updateduser = await User.findByIdAndUpdate(
    userId,
    {
      $push: { userQuizes: quiz._id }
    },
    { new: true }
  );

  if (!updateduser) {
    //if user not found, delete the created quiz and throw error
    await Quiz.findByIdAndDelete(quiz._id);
    throw new ApiError(404, "user not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { quiz, user: updateduser }, "quiz saved successully!"));
});

const deleteQuiz = asyncHandler(async (req, res) => {
  const {quizId} = req.params;
  const deleteQuiz = await Quiz.findByIdAndDelete(quizId);
 
  const updateuser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $pull: {userQuizes : quizId}
    },
    {new : true}
  )
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "quiz deleted successfully!"));
})

const updateQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { userAnswers, score } = req.body;

  // Validate required fields
  if (!quizId) {
    throw new ApiError(400, "Quiz ID is required");
  }

  if (score === undefined || score === null) {
    throw new ApiError(400, "Score is required");
  }

  if (!userAnswers || !Array.isArray(userAnswers)) {
    throw new ApiError(400, "User answers array is required");
  }

  // Find the existing quiz
  const existingQuiz = await Quiz.findById(quizId);
  if (!existingQuiz) {
    throw new ApiError(404, "Quiz not found");
  }

  // Validate that userAnswers length matches questions length
  if (userAnswers.length !== existingQuiz.questions.length) {
    throw new ApiError(400, "User answers count must match questions count");
  }

  // Update user answers in choices and set score/lastAttempted
  const updatedQuestions = existingQuiz.questions.map(
    (question, questionIndex) => {
      const userAnswerForQuestion = userAnswers[questionIndex];

      const updatedChoices = question.choices.map((choice) => ({
        text: choice.text,
        isCorrect: choice.isCorrect,
        // Set userAnswer to true if this choice text matches the user's answer for this question
        userAnswer: choice.text === userAnswerForQuestion,
      }));

      return {
        questionText: question.questionText,
        explanation: question.explanation,
        choices: updatedChoices,
      };
    }
  );

  // Update the quiz with only the allowed fields
  const updatedQuiz = await Quiz.findByIdAndUpdate(
    quizId,
    {
      $set: {
        questions: updatedQuestions,
        score: score,
        lastAttempted: new Date(),
        attempted: true,
      },
    },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, { quiz: updatedQuiz }, "Quiz updated successfully!")
    );
})

const getQuizDetails = asyncHandler(async (req, res) => {
  const { quizId } = req.params
  if (!quizId) {
    return res
    .status(404).json(new ApiError(404,"quiz not found!"))
  }
  const quiz = await Quiz.findById(quizId);
  return res
    .status(200)
    .json(
      new ApiResponse(200, quiz, "quiz fetched successfully!")
    )
})

export {
  generateQuiz,
  saveQuiz,
  deleteQuiz,
  updateQuiz,
  getQuizDetails
}