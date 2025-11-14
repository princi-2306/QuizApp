import { useState } from "react";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { FaDownload } from "react-icons/fa6";
import axios from "axios";
import { toast } from "react-toastify";

const QuizCard = ({
  name,
  date,
  score,
  onDelete,
  quizId,
  updateQuiz,
  questionsCount,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Calculate the actual number of questions
  // questionsCount is the questions array, so we just need its length
  const numberOfQuestions = Array.isArray(questionsCount)
    ? questionsCount.length
    : 0;

  // Clean the title - remove everything after "Quiz_" pattern
  const cleanTitle = (title) => {
    if (!title) return "";
    // Remove the pattern: Quiz_randomId and anything after it
    const cleaned = title.replace(/\s*Quiz_[a-z0-9]+.*$/i, "");
    return cleaned.trim();
  };
  const displayName = cleanTitle(name);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const confirmDelete = async (e) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("tokens");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(
        `${import.meta.env.VITE_URL}/quiz/delete/${quizId}`,
        config
      );

      toast.success("Quiz deleted successfully!");

      if (onDelete) {
        onDelete(quizId);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete quiz");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  const handleDownloadClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    setIsDownloading(true);
    try {
      const token = localStorage.getItem("tokens");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Fetch quiz data from your API
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/quiz/getQuiz/${quizId}`,
        config
      );

      const quizData = response.data;

      // Generate formatted content based on the API response
      const quizContent = generateContentFromAPI(quizData);

      // Create and download the file
      const blob = new Blob([quizContent], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${quizData.data.title
        .replace(/\s+/g, "-")
        .toLowerCase()}-results.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Quiz results downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);

      // Fallback if API call fails
      if (error.response?.status === 404) {
        toast.error("Quiz data not found");
      } else if (error.response?.status === 401) {
        toast.error("Please login to download results");
      } else {
        // Generate basic content from available props
        const fallbackContent = `QUIZ RESULTS - ${name}
==============================
Score: ${score}
Date: ${date}
Quiz ID: ${quizId}

Note: Detailed results unavailable.
Please try again later.

Generated on: ${new Date().toLocaleString()}`;

        const blob = new Blob([fallbackContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${name
          .replace(/\s+/g, "-")
          .toLowerCase()}-basic-results.txt`;
        link.click();
        URL.revokeObjectURL(url);

        toast.warning("Downloaded basic results (detailed data unavailable)");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const generateContentFromAPI = (quizData) => {
    const quiz = quizData.data;

    let content = `QUIZ RESULTS - ${quiz.title}\n`;
    content += "=".repeat(60) + "\n\n";

    content += `📝 QUIZ TITLE: ${quiz.title}\n`;
    content += `📊 SCORE: ${quiz.score}%\n`;
    content += `📅 LAST ATTEMPTED: ${new Date(
      quiz.lastAttempted
    ).toLocaleString()}\n`;
    content += `🆔 QUIZ ID: ${quiz._id}\n`;
    content += `🎯 QUIZ TYPE: ${quiz.quizType}\n`;
    content += `✅ ATTEMPTED: ${quiz.attempted ? "Yes" : "No"}\n\n`;

    content += "PERFORMANCE SUMMARY\n";
    content += "-".repeat(30) + "\n";

    const totalQuestions = quiz.questions.length;
    const correctAnswers = quiz.questions.filter((q) => {
      const userChoice = q.choices.find((choice) => choice.userAnswer === true);
      return userChoice ? userChoice.isCorrect : false;
    }).length;

    const incorrectAnswers = totalQuestions - correctAnswers;
    const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(1);

    content += `• Total Questions: ${totalQuestions}\n`;
    content += `• Correct Answers: ${correctAnswers}\n`;
    content += `• Incorrect Answers: ${incorrectAnswers}\n`;
    content += `• Accuracy: ${percentage}%\n`;
    content += `• Performance: ${getPerformanceRating(percentage)}\n\n`;

    content += "DETAILED QUESTION ANALYSIS\n";
    content += "=".repeat(40) + "\n\n";

    quiz.questions.forEach((question, index) => {
      const userChoice = question.choices.find(
        (choice) => choice.userAnswer === true
      );
      const correctChoice = question.choices.find(
        (choice) => choice.isCorrect === true
      );

      content += `QUESTION ${index + 1}:\n`;
      content += `📖 ${question.questionText}\n\n`;

      content += `YOUR ANSWER: `;
      if (userChoice) {
        const isCorrect = userChoice.isCorrect;
        content += `${userChoice.text} ${
          isCorrect ? "✅ CORRECT" : "❌ INCORRECT"
        }\n`;
      } else {
        content += `Not attempted ❓\n`;
      }

      content += `CORRECT ANSWER: ${correctChoice.text} ✅\n\n`;

      content += `💡 EXPLANATION:\n`;
      content += `${question.explanation}\n`;

      content += `\nCHOICES:\n`;
      question.choices.forEach((choice, choiceIndex) => {
        let marker = "  ";
        if (choice.userAnswer && choice.isCorrect) marker = "✅";
        else if (choice.userAnswer && !choice.isCorrect) marker = "❌";
        else if (choice.isCorrect) marker = "✓ ";

        content += `${marker} ${choice.text}\n`;
      });

      content += "─".repeat(50) + "\n\n";
    });

    content += "ANSWER KEY SUMMARY\n";
    content += "-".repeat(25) + "\n";

    quiz.questions.forEach((question, index) => {
      const correctChoice = question.choices.find(
        (choice) => choice.isCorrect === true
      );
      const userChoice = question.choices.find(
        (choice) => choice.userAnswer === true
      );
      const status = userChoice ? (userChoice.isCorrect ? "✓" : "✗") : "?";

      content += `Q${index + 1}: ${correctChoice.text} ${status}\n`;
    });

    content += `\nLegend: ✓ = Correct, ✗ = Incorrect, ? = Not attempted\n\n`;

    content += "=".repeat(60) + "\n";
    content += `Report generated on: ${new Date().toLocaleString()}\n`;
    content += `User ID: ${quiz.userId}\n`;
    content += "Thank you for completing the quiz! 🎉\n";

    return content;
  };

  const getPerformanceRating = (percentage) => {
    const percent = parseFloat(percentage);
    if (percent >= 90) return "Excellent 🎉";
    if (percent >= 80) return "Very Good 👍";
    if (percent >= 70) return "Good 😊";
    if (percent >= 60) return "Average 📊";
    return "Needs Improvement 📚";
  };

  return (
    <div className="relative z-0">
      <div
        className="p-6 rounded-xl shadow-lg transition-all duration-300 transform border border-purple-200/30"
        style={{
          background: isHovered
            ? "linear-gradient(145deg, rgba(179,136,235,0.25), rgba(131,88,202,0.25))"
            : "linear-gradient(145deg, rgba(179,136,235,0.15), rgba(131,88,202,0.15))",
          backdropFilter: "blur(10px)",
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">
              {displayName} Quiz
            </h3>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadClick}
              disabled={isDownloading}
              className="p-2 rounded-lg transition-colors duration-200 hover:bg-purple-700/30"
              title="Download Results"
            >
              {isDownloading ? (
                <FaSpinner className="animate-spin text-blue-400" />
              ) : (
                <FaDownload />
              )}
            </button>
            <button onClick={handleDeleteClick} disabled={isDeleting}>
              {isDeleting ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaTrash className="text-sm" />
              )}
            </button>
            {showConfirm && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-10">
                <div className="bg-purple-900 p-5 rounded-xl border border-purple-500 text-center max-w-xs mx-4">
                  <p className="mb-3 font-semibold text-white">
                    Delete this quiz?
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={cancelDelete}
                      className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4 text-purple-100">
          <div className="flex items-center mb-1">
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Score: {score}%</span>
          </div>
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Last Attempt: {date}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-purple-200 bg-purple-900/30 px-3 py-1 rounded-full">
            {numberOfQuestions} question{numberOfQuestions !== 1 ? "s" : ""}
          </span>
          <button
            onClick={updateQuiz}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
            style={{
              background: isHovered
                ? "linear-gradient(to right, #8B5CF6, #7C3AED)"
                : "linear-gradient(to right, #7C3AED, #6D28D9)",
              color: "white",
              boxShadow: isHovered
                ? "0 6px 12px rgba(124, 58, 237, 0.4)"
                : "0 4px 8px rgba(124, 58, 237, 0.3)",
            }}
          >
            Take Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
