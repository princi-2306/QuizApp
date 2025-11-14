import React from "react";

const Questions = ({
  questionNumber,
  questionText,
  options,
  selectedAnswer,
  onAnswerSelect,
  correctAnswer,
  showResult,
  explanation,
  isSubmit,
}) => {
  const getOptionLetter = (index) => {
    return String.fromCharCode(97 + index);
  };

  const findCorrectAnswerText = () => {
    const correctOption = options.find((option) => option.isCorrect);
    return correctOption ? correctOption.text : correctAnswer;
  };

  // Only show feedback (colors + explanations) when BOTH submitted AND modal open
  const showFeedback = isSubmit && showResult;

  console.log(`Question ${questionNumber}:`, {
    showFeedback,
    isSubmit,
    showResult,
    selectedAnswer,
    optionsWithUserAnswer: options
      .filter((opt) => opt.userAnswer)
      .map((opt) => opt.text),
  });

  const getOptionStyle = (option) => {
    // Check if this option is selected by the user
    const isSelectedByUser = selectedAnswer === option.text;

    // CASE 1: Modal is OPEN after submission - show correct/incorrect feedback
    if (showFeedback) {
      if (option.isCorrect) {
        return "bg-green-600 border-2 border-green-300"; // Correct answer (green)
      } else if (option.userAnswer && !option.isCorrect) {
        return "bg-red-600 border-2 border-red-300"; // Wrong answer selected by user (red)
      } else {
        return "bg-purple-800 opacity-70"; // Other options (dimmed)
      }
    }

    // CASE 2: Modal is CLOSED (before submit OR after submit with modal closed)
    // Show selected answer in purple, others in default purple
    if (isSelectedByUser) {
      return "bg-purple-600 border-2 border-purple-300"; // Selected option (bright purple)
    }

    // Default state for non-selected options
    if (isSubmit) {
      return "bg-purple-700"; // After submit, no hover
    } else {
      return "bg-purple-700 hover:bg-purple-800"; // Before submit, with hover
    }
  };

  return (
    <div className="bg-[#885dc1] w-full max-w-4xl rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 animate-fadeInUp">
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
        {/* Question Text */}
        <div className="text-base sm:text-lg md:text-xl w-full text-white font-medium leading-relaxed">
          <span className="text-purple-300 font-bold mr-2">
            {questionNumber}.
          </span>
          {questionText}
        </div>

        {/* Options */}
        <div>
          <form className="flex flex-col gap-2 sm:gap-3">
            {options &&
              options.map((option, index) => {
                const isSelectedByUser = selectedAnswer === option.text;

                return (
                  <div
                    key={index}
                    className={`p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                      !isSubmit ? "cursor-pointer" : "cursor-default"
                    } border transform origin-center ${
                      !isSubmit ? "hover:scale-[1.02] active:scale-[0.98]" : ""
                    } ${getOptionStyle(option)}`}
                    onClick={() => !isSubmit && onAnswerSelect(option.text)}
                  >
                    <label
                      className={`flex items-center ${
                        !isSubmit ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${questionNumber}`}
                        value={option.text}
                        checked={isSelectedByUser}
                        onChange={() => {}}
                        className="hidden"
                        disabled={isSubmit}
                      />
                      <span className="mr-3 sm:mr-4 font-medium text-white min-w-[20px] text-sm sm:text-base">
                        {getOptionLetter(index)} )
                      </span>
                      <span className="text-white text-sm sm:text-base flex-1">
                        {option.text}
                      </span>

                      {/* Selection Indicator - Show when option is selected and NOT showing feedback */}
                      {isSelectedByUser && !showFeedback && (
                        <div className="ml-2 animate-bounceIn">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>
                );
              })}
          </form>
        </div>

        {/* Results Section - ONLY show when showFeedback is true (modal open) */}
        {showFeedback && (
          <div className="space-y-2 sm:space-y-3 animate-fadeIn">
            {selectedAnswer !== findCorrectAnswerText() && (
              <div className="text-green-200 bg-green-900 bg-opacity-50 p-3 sm:p-4 rounded-xl border border-green-400/30">
                <strong className="font-semibold">Correct answer:</strong>{" "}
                {findCorrectAnswerText()}
              </div>
            )}
            {explanation && (
              <div className="text-blue-200 bg-blue-900 bg-opacity-50 p-3 sm:p-4 rounded-xl border border-blue-400/30">
                <strong className="font-semibold">Explanation:</strong>{" "}
                {explanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;
