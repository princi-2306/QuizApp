import React from "react";

const ScoreCard = ({ onClose, onSave, score, userAnswers, questions }) => {
  // Calculate actual results based on props
  const actualScore = score || {
    score: 0,
    total: questions?.length || 0,
    percentage: 0,
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return "Excellent! 🎉";
    if (percentage >= 80) return "Great job! 👍";
    if (percentage >= 70) return "Good work! 👏";
    if (percentage >= 60) return "Not bad! 💪";
    if (percentage >= 50) return "You passed! ✅";
    return "Keep practicing! 📚";
  };

  const getStrokeColor = (percentage) => {
    if (percentage >= 80) return "#10b981"; // green-500
    if (percentage >= 60) return "#f59e0b"; // yellow-500
    return "#ef4444"; // red-500
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform scale-95 animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white">
          <h3 className="text-2xl font-bold">Quiz Completed!</h3>
          <p className="text-purple-200 mt-1">
            {getScoreMessage(actualScore.percentage)}
          </p>
        </div>

        <div className="p-6">
          {/* Circular Progress */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={getStrokeColor(actualScore.percentage)}
                  strokeWidth="3"
                  strokeDasharray={`${actualScore.percentage}, 100`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
                <text
                  x="18"
                  y="20.5"
                  textAnchor="middle"
                  className={` font-bold ${getScoreColor(
                    actualScore.percentage
                  )}`}
                  fontSize="8"
                >
                  {actualScore.percentage}%
                </text>
              </svg>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
              <div className="text-2xl font-bold text-purple-700">
                {actualScore.score}/{actualScore.total}
              </div>
              <div className="text-gray-600 text-sm">Correct Answers</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
              <div className="text-2xl font-bold text-purple-700">
                {Math.round((actualScore.score / actualScore.total) * 100)}%
              </div>
              <div className="text-gray-600 text-sm">Success Rate</div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-700">Performance:</span>
              <span
                className={`font-semibold ${getScoreColor(
                  actualScore.percentage
                )}`}
              >
                {actualScore.percentage >= 80
                  ? "Excellent"
                  : actualScore.percentage >= 60
                  ? "Good"
                  : "Needs Improvement"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-purple-700">Date Completed:</span>
              <span className="text-gray-700">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Detailed Breakdown */}
          {questions && (
            <div className="text-center text-sm text-gray-600 mb-2">
              Review your answers below to see explanations for each question.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-gray-700 font-medium hover:bg-gray-50 transition duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Close
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Save Results
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ScoreCard;
