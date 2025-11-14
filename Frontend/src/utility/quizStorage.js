import userQuiz from "../store/userStore";

// Delete all previous submitted quizzes EXCEPT the current one
export const cleanupPreviousQuizzes = (currentQuizId) => {
  try {
    const keysToDelete = [];
    
    // Find all submitted_quiz keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('submitted_quiz_')) {
        // Extract the quiz ID from the key
        const quizId = key.replace('submitted_quiz_', '');
        
        // Delete if it's NOT the current quiz
        if (quizId !== currentQuizId) {
          keysToDelete.push(key);
        }
      }
    }
    
    // Delete all old quiz keys
    keysToDelete.forEach(key => {
      localStorage.removeItem(key);
      console.log("Cleaned up previous quiz:", key);
    });
    
    console.log(`Cleaned up ${keysToDelete.length} previous quiz(es)`);
    return keysToDelete.length;
  } catch (error) {
    console.error("Error cleaning up previous quizzes:", error);
    return 0;
  }
}

export const saveSubmittedQuiz = (currentQuiz, userAnswers) => {
  // Get the current quiz ID from the store
  const quizId = userQuiz.getState().getQuizId();
  
  // IMPORTANT: Clean up all previous quizzes before saving the new one
  cleanupPreviousQuizzes(quizId);
  
  // Create a deep copy of currentQuiz to avoid mutating the original
  const quizWithUserAnswers = JSON.parse(JSON.stringify(currentQuiz));

  // Add userAnswer property to choices directly to the quiz copy
  quizWithUserAnswers.questions.forEach((question, questionIndex) => {
    question.choices.forEach((choice) => {
      choice.userAnswer = userAnswers[questionIndex] === choice.text;
    });
  });
  
  // Calculate score
  const scoreResult = calculateScore(quizWithUserAnswers);

  const submittedQuiz = {
    quizId: quizId,
    ...quizWithUserAnswers,
    submittedAt: new Date().toISOString(),
    score: scoreResult.percentage,
    userAnswers: userAnswers,
    isSaved: false // Flag to track if saved to server
  };

  localStorage.setItem(
    `submitted_quiz_${quizId}`,
    JSON.stringify(submittedQuiz)
  );
  
  // Set a timer to auto-delete after 5 minutes if not saved
  setTimeout(() => {
    const stillExists = localStorage.getItem(`submitted_quiz_${quizId}`);
    if (stillExists) {
      const quizData = JSON.parse(stillExists);
      // Only delete if not saved to server yet
      if (!quizData.isSaved) {
        localStorage.removeItem(`submitted_quiz_${quizId}`);
        console.log("Auto-deleted expired quiz:", quizId);
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  console.log("Quiz saved with ID:", quizId, "- will expire in 5 minutes if not saved");
  return submittedQuiz;
}

export const loadQuiz = (quizId) => {
  const saved = localStorage.getItem(`submitted_quiz_${quizId}`);
  return saved ? JSON.parse(saved) : null;
}

// Mark quiz as saved to server (update the flag)
export const markQuizAsSaved = (quizId) => {
  try {
    const saved = localStorage.getItem(`submitted_quiz_${quizId}`);
    if (saved) {
      const quizData = JSON.parse(saved);
      quizData.isSaved = true;
      localStorage.setItem(`submitted_quiz_${quizId}`, JSON.stringify(quizData));
      console.log("Quiz marked as saved:", quizId);
    }
  } catch (error) {
    console.error("Error marking quiz as saved:", error);
  }
}

// Delete specific quiz by ID
export const deletequiz = (quizId) => {
  try {
    localStorage.removeItem(`submitted_quiz_${quizId}`);
    console.log("Quiz deleted with ID:", quizId);
  } catch (error) {
    console.error("error deleting the quiz", error);
  }
}

// Delete all submitted quizzes that are marked as saved
export const cleanupSavedQuizzes = () => {
  try {
    const keysToDelete = [];
    
    // Find all submitted_quiz keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('submitted_quiz_')) {
        const quizData = JSON.parse(localStorage.getItem(key));
        // Only delete if marked as saved
        if (quizData && quizData.isSaved) {
          keysToDelete.push(key);
        }
      }
    }
    
    // Delete the marked keys
    keysToDelete.forEach(key => {
      localStorage.removeItem(key);
      console.log("Cleaned up saved quiz:", key);
    });
    
    return keysToDelete.length;
  } catch (error) {
    console.error("Error cleaning up quizzes:", error);
    return 0;
  }
}

// Delete old submitted quizzes (older than 24 hours)
export const cleanupOldQuizzes = () => {
  try {
    const keysToDelete = [];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('submitted_quiz_')) {
        const quizData = JSON.parse(localStorage.getItem(key));
        if (quizData && quizData.submittedAt) {
          const submittedDate = new Date(quizData.submittedAt);
          if (submittedDate < oneDayAgo) {
            keysToDelete.push(key);
          }
        }
      }
    }
    
    keysToDelete.forEach(key => {
      localStorage.removeItem(key);
      console.log("Cleaned up old quiz:", key);
    });
    
    return keysToDelete.length;
  } catch (error) {
    console.error("Error cleaning up old quizzes:", error);
    return 0;
  }
}

export const calculateScore = (currentQuiz) => {
  if (!currentQuiz?.questions) return { score: 0, total: 0, percentage: 0 };

  let score = 0;
  currentQuiz.questions.forEach((question, idx) => {
    const correctAnswer = question.choices.find(choice =>
      choice.isCorrect && choice.userAnswer === true
    );
    if (correctAnswer) {
      score++;
    }
  });

  return {
    score: score,
    total: currentQuiz.questions.length,
    percentage: Math.round(
      (score / currentQuiz.questions.length) * 100
    ),
  };
};