import Navbar from "@/components/Navbar";
import React, { useEffect, useState } from "react";
import Questions from "@/components/Questions";
import { Link, useNavigate } from "react-router-dom";
import ScoreCard from "@/components/ScoreCard";
import LoadingPage from "@/components/loadingPages/LoadingPage";
import quizStore from "@/store/quizStore";
import userQuiz from "@/store/userStore";
import { toast } from "react-toastify";
import {
  saveSubmittedQuiz,
  loadQuiz,
  calculateScore,
  markQuizAsSaved,
  cleanupOldQuizzes,
} from "@/utility/quizStorage";
import axios from "axios";

const QuizPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isSubmit, setIsSubmit] = useState(false);
  const [submittedQuizData, setSubmittedQuizData] = useState(null);
  const [hasViewedResults, setHasViewedResults] = useState(false); // NEW: Track if results were viewed
  const navigate = useNavigate();

  const currentQuiz = quizStore((state) => state.currentQuiz);
  const updatedQuiz = quizStore((state) => state.updatedQuiz);
  const setUpdateQuiz = quizStore((state) => state.setUpdateQuiz);

  // Get quiz ID methods from userQuiz store
  const getQuizId = userQuiz((state) => state.getQuizId);
  const generateQuizId = userQuiz((state) => state.generateQuizId);
  const clearQuizId = userQuiz((state) => state.clearQuizId);

  const token = localStorage.getItem("tokens");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // Cleanup old quizzes on component mount
    cleanupOldQuizzes();

    if (currentQuiz) {
      // Get or generate quiz ID
      const quizId = getQuizId();

      // Check if this is a new quiz by checking if it has _id (from database)
      const isNewQuiz = !currentQuiz._id;

      // Check if already submitted
      const submitted = loadQuiz(quizId);

      // If it's a brand new quiz (not from database), clear any old submission
      if (isNewQuiz && !updatedQuiz && submitted) {
        // Generate a NEW quiz ID for this fresh quiz
        clearQuizId();
        const newQuizId = generateQuizId();

        // Initialize fresh state
        const initialAnswers = new Array(
          currentQuiz.questions?.length || 0
        ).fill(undefined);
        setUserAnswers(initialAnswers);
        setIsSubmit(false);
        setSubmittedQuizData(null);
        setHasViewedResults(false);
      } else if (submitted) {
        // Quiz was previously submitted - restore the submitted state
        console.log("Restoring submitted quiz state");
        setUserAnswers(submitted.userAnswers);
        setSubmittedQuizData(submitted);
        setIsSubmit(true);
        setHasViewedResults(true); // Already submitted, so results can be shown
      } else {
        // Fresh quiz - initialize with empty answers
        console.log("Initializing fresh quiz");
        const initialAnswers = new Array(
          currentQuiz.questions?.length || 0
        ).fill(undefined);
        setUserAnswers(initialAnswers);
        setIsSubmit(false);
        setSubmittedQuizData(null);
        setHasViewedResults(false);
      }
    }
  }, [currentQuiz, getQuizId, updatedQuiz, clearQuizId, generateQuizId]);

  //handle answer selection
  const handleAnswerSelect = (questionIndex, selectedAnswer) => {
    if (isSubmit) return;

    setUserAnswers((prevAnswers) => {
      const newUserAnswers = [...prevAnswers];
      newUserAnswers[questionIndex] = selectedAnswer;
      return newUserAnswers;
    });
  };

  //find correct answer for a specific question
  const findCorrectAnswer = (questionIndex) => {
    const question = currentQuiz.questions[questionIndex];
    if (!question || !question.choices) return "";

    const correctOption = question.choices.find((choice) => choice.isCorrect);
    return correctOption ? correctOption.text : "";
  };

  const handleSubmit = () => {
    if (!currentQuiz) return;

    //check if all question are answered
    const unansweredQuestions = currentQuiz.questions.filter(
      (_, index) => userAnswers[index] === undefined
    ).length;
    if (unansweredQuestions > 0) {
      toast.warn(`${unansweredQuestions} questions left unattempted`);
      return;
    }

    const submittedData = saveSubmittedQuiz(currentQuiz, userAnswers);
    setSubmittedQuizData(submittedData);
    setIsSubmit(true);
    setIsOpen(true);
    setHasViewedResults(true); // Mark that results have been viewed
  };

  const closeModal = () => {
    // console.log("=== CLOSING MODAL ===");
    // console.log("userAnswers:", userAnswers);
    // console.log("isSubmit:", isSubmit);
    setIsOpen(false);
    // hasViewedResults stays true, so explanations remain visible
  };

  const handleSaveResults = async () => {
    setIsOpen(false); // Close modal first
    setLoading(true);
    const quizId = getQuizId();

    if (!updatedQuiz && !currentQuiz._id) {
      try {
        // Generate unique title for server (add random suffix to avoid duplicates)
        const uniqueTitle = `${submittedQuizData.title}_${Math.random()
          .toString(36)
          .substring(2, 9)}`;

        const quizData = {
          title: uniqueTitle,
          questions: submittedQuizData.questions.map((question, idx) => ({
            questionText: question.questionText,
            explanation: question.explanation,
            choices: question.choices.map((choice) => ({
              text: choice.text,
              isCorrect: choice.isCorrect,
              userAnswers: choice.userAnswers,
            })),
          })),
          attempted: true,
          quizType: submittedQuizData.quizType,
          score: submittedQuizData.score,
          lastAttempted: submittedQuizData.submittedAt,
          userId: userId,
        };

        const response = await axios.post(
          `${import.meta.env.VITE_URL}/quiz/save`,
          quizData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Quiz saved successfully!");

        // Mark as saved before cleanup
        markQuizAsSaved(quizId);

        setLoading(false);

        // Delayed cleanup - delete after navigating away
        setTimeout(() => {
          clearQuizId(); // Clear quiz ID
        }, 500);

        // Navigate to /user page after saving
        setTimeout(() => navigate("/user"), 2000);
      } catch (error) {
        toast.error("Quiz cannot be saved!");
        console.log(error);
        setLoading(false);
      }
    } else {
      const finalUserAnswers =
        userAnswers || submittedQuizData?.userAnswers || [];
      const finalScore = calculateScore(submittedQuizData);

      try {
        const updateData = {
          userAnswers: finalUserAnswers,
          score: finalScore.percentage,
        };
        const response = await axios.put(
          `${import.meta.env.VITE_URL}/quiz/update-quiz/${currentQuiz?._id}`,
          updateData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Quiz updated successfully!");

        // Mark as saved before cleanup
        markQuizAsSaved(quizId);

        setLoading(false);
        setUpdateQuiz(null);

        // Delayed cleanup
        setTimeout(() => {
          clearQuizId();
        }, 500);

        // Navigate to /user page after updating
        setTimeout(() => navigate("/user"), 2000);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update quiz!");
        setLoading(false);
        setUpdateQuiz(null);
      }
    }
  };

  const getOptionsForQuestion = (questionIndex) => {
    const question = currentQuiz.questions[questionIndex];
    if (!question || !question.choices) return [];

    // If quiz is submitted and results have been viewed (even if modal is closed)
    // Load the data from localStorage to get the userAnswer property
    if (isSubmit && hasViewedResults) {
      const quizId = getQuizId();
      const savedQuiz = loadQuiz(quizId);

      if (savedQuiz && savedQuiz.questions) {
        // Return the choices with userAnswer property from localStorage
        return savedQuiz.questions[questionIndex].choices;
      }
    }

    // For fresh quiz or before submission
    return question.choices;
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="w-full min-h-screen flex flex-col gap-8 md:gap-15 bg-gradient-to-b from-gray-900 to-purple-900">
      <Navbar />

      <div className="py-24 md:py-16 lg:py-24 flex flex-col gap-8 md:gap-12 items-center px-5 sm:px-6">
        {/* Quiz Title */}
        <div className="text-2xl sm:text-3xl font-semibold text-white text-center px-4">
          {currentQuiz.title}
        </div>

        {/* Questions Container */}
        <div className="flex flex-col gap-8 md:gap-10 lg:gap-12 items-center w-full max-w-4xl">
          {currentQuiz.questions && currentQuiz.questions.length > 0 ? (
            currentQuiz.questions.map((question, idx) => (
              <div
                key={idx}
                className="w-full animate-fadeInUp"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <Questions
                  questionNumber={idx + 1}
                  questionText={question.questionText}
                  options={getOptionsForQuestion(idx)}
                  selectedAnswer={userAnswers[idx]}
                  onAnswerSelect={(selectedAnswer) =>
                    handleAnswerSelect(idx, selectedAnswer)
                  }
                  correctAnswer={findCorrectAnswer(idx)}
                  showResult={hasViewedResults} // Show results if viewed at least once
                  explanation={question.explanation}
                  isSubmit={isSubmit}
                />
              </div>
            ))
          ) : (
            <div className="text-white text-center py-8">
              No questions available for this quiz.
            </div>
          )}
        </div>

        {/* Submit Button - Only show before submission */}
        {!isSubmit && (
          <button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700 py-3 px-8 rounded-full text-white font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/30 mt-4"
          >
            Submit Quiz
          </button>
        )}

        {/* View Results Button - Show after submission when modal is closed */}
        {isSubmit && !isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-green-600 hover:bg-green-700 py-3 px-8 rounded-full text-white font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/30 mt-4"
          >
            View Results
          </button>
        )}
      </div>

      {/* Score Card Modal */}
      {isOpen && (
        <ScoreCard
          onClose={closeModal}
          onSave={handleSaveResults}
          score={calculateScore(submittedQuizData)}
          userAnswers={userAnswers}
          questions={currentQuiz?.questions || []}
        />
      )}
    </div>
  );
};

export default QuizPage;
