import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import QuizCard from "@/components/QuizCard";
import UserCard from "@/components/UserCard";
import quizStore from "@/store/quizStore";
import userQuiz from "@/store/userStore";
import { useNavigate } from "react-router-dom";

const UserQuizzes = () => {
  const [loading, setLoading] = useState(false);
  const [quizes, setQuizes] = useState(null);
  const currentUser = userQuiz((state) => state.currentUser);
  const setCurrentQuiz = quizStore((state) => state.setCurrentQuiz);
  const currentQuiz = quizStore((state) => state.currentQuiz);
  const setUpdateQuiz = quizStore((state) => state.setUpdateQuiz);

  const navigate = useNavigate();
  const getQuizes = async () => {
    const token = localStorage.getItem("tokens");
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const data = await axios.get(
        `${import.meta.env.VITE_URL}/users/allQuizes`,
        config
      );
      setQuizes(data.data.data);
      console.log(data.data.data);
    } catch (error) {
      console.error(error);
      toast.error("can't fetch your quizes");
    } finally {
      setLoading(false);
    }
  };

  //delete quiz from state
  const handleQuizDelete = (quizId) => {
    setQuizes((prev) => {
      if (!prev || !prev.userQuizes) return prev;

      return {
        ...prev,
        userQuizes: prev.userQuizes.filter((quiz) => quiz._id !== quizId),
      };
    });
  };

  const handleUpdateQuiz = (quiz) => {
    setLoading(true);

    // Set the quiz for updating
    setUpdateQuiz(quiz);

    // Also set it as current quiz for the quiz page
    setCurrentQuiz(quiz);

    toast.success("Loading quiz...");

    setTimeout(() => {
      navigate("/quiz");
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (currentUser) {
      getQuizes();
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-16 md:pt-20 bg-gradient-to-b">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading your quizzes...</div>
        </div>
      </div>
    );
  }

  // No quizzes state
  if (!quizes) {
    return (
      <div className="z-0 min-h-screen pt-24 md:pt-20 bg-gradient-to-b">
        <Navbar />
        <div className="flex flex-col lg:flex-row w-full items-center max-w-7xl gap-6 md:gap-8">
          <div className="lg:w-80 xl:w-96 lg:sticky lg:top-24 lg:self-start w-90">
            <UserCard />
          </div>
          <div className="text-xl">No quizzes found</div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen z-0 relative pt-16 md:pt-20 bg-gradient-to-b">
      <Navbar />

      <div className="flex flex-col items-center w-full px-3 sm:px-4 md:px-6 py-4 md:py-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-700 mb-6 md:mb-8">
          Your Quizzes
        </h1>

        <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-6 md:gap-8">
          {/* Sticky User Card on desktop */}
          <div className="lg:w-80 xl:w-96 lg:sticky lg:top-24 lg:self-start z-10">
            <UserCard />
          </div>

          {/* Quiz Cards */}
          <div className="flex-1 min-w-0 z-0">
            {quizes.userQuizes && quizes.userQuizes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6">
                {quizes.userQuizes.map((item, idx) => (
                  <QuizCard
                    key={item._id || idx} // Use item._id if available, otherwise fallback to idx
                    score={item.score}
                    name={item.title}
                    quizId={item._id}
                    onDelete={handleQuizDelete}
                    updateQuiz={() => handleUpdateQuiz(item)}
                    date={new Date(item.lastAttempted).toLocaleDateString()}
                    quizType={item.quizType}
                    questionsCount={item.questions} // Add if you implemented the count
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-600 mb-4">
                  No quizzes yet
                </h3>
                <p className="text-gray-500">
                  Start by taking a quiz to see your results here!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserQuizzes;
