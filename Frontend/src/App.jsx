import React from 'react'
import Home from './Pages/Home'
import Login from './Pages/Login';
import SignUp from './Pages/SignUp';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CreateQuiz from './Pages/CreateQuiz';
import QuizPage from './Pages/QuizPage';
import UserQuizzes from './Pages/UserQuizzes';
const App = () => {
  return (
    <div className="bg-[#2c1e4a]">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/prompt" element={<CreateQuiz />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/user" element={<UserQuizzes/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App
