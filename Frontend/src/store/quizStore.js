import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const quizStore = create(
  devtools(
    persist(
      (set) => ({
        currentQuiz: false,
        quizes: [],
        numberOfQuestions: 5, // Default value
        updatedQuiz: null,
        
        setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
        
        setNumberOfQuestions: (num) => set({ numberOfQuestions: num }),
        
        setUpdateQuiz: (quiz) =>
          set({
            updatedQuiz: quiz,
          }),
        
        clearUpdatedQuiz: () => set({ updatedQuiz: null }),
      }),
      {
        name: "quiz-store", // localStorage key
        partialize: (state) => ({
          currentQuiz: state.currentQuiz,
          quizes: state.quizes,
          numberOfQuestions: state.numberOfQuestions,
          updatedQuiz: state.updatedQuiz,
        }),
      }
    )
  )
);

export default quizStore;