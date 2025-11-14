import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Update your existing userQuiz store
const userQuiz = create(
  devtools(
    persist(
      (set, get) => ({
        currentUser: false,
        users: [],
        currentQuizId: null, // Add quiz ID here
        
        // Quiz ID methods
        generateQuizId: () => {
          const newQuizId = Math.random().toString(36).substring(2, 9);
          set({ currentQuizId: newQuizId });
          return newQuizId;
        },
        
        setQuizId: (quizId) => set({ currentQuizId: quizId }),
        
        clearQuizId: () => set({ currentQuizId: null }),
        
        getQuizId: () => {
          const state = get();
          if (!state.currentQuizId) {
            return state.generateQuizId();
          }
          return state.currentQuizId;
        },
        
        // Existing user methods
        login: (user) => set({ currentUser: user }),
        logout: () => {
          set({ currentUser: null, currentQuizId: null });
          localStorage.removeItem("tokens");
        },
        
        removeUser: (userId) =>
          set((state) => ({
            users: state.users.filter((p) => p._id !== userId),
          })),
        
        updateUserDetails: (updates) => 
          set((state) => ({
            ...state,
            currentUser: {
              ...state.currentUser,
              ...updates
            }
          })),
        
        updateAvatar: (url) => 
          set((state) => ({
            ...state,
            currentUser: {
              ...state.currentUser,
              avatar: url
            }
          }))
      }),
      { 
        name: "quiz-storage",
        partialize: (state) => ({ 
          currentUser: state.currentUser,
          users: state.users,
          currentQuizId: state.currentQuizId
        })
      }
    )
  )
);

export default userQuiz;