import React, { useState } from "react";
import ChangePassword from "./EditUserDetails/ChangePassword";
import ChangeAvatar from "./EditUserDetails/ChangeAvatar";
import ChangeDetails from "./EditUserDetails/ChangeDetails";
import userQuiz from "@/store/userStore";
import quizStore from "@/store/quizStore";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingPage from "./loadingPages/LoadingPage";
import { useNavigate } from "react-router-dom";

const UserCard = () => {
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [isChangeAvatar, setIsChangeAvatar] = useState(false);
  const [isChangeDetails, setIsChangeDetails] = useState(false);
  const currentUser = userQuiz((state) => state.currentUser);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const logout = userQuiz((state) => state.logout);

  const handleLogOut = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_URL}/users/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("tokens")}`,
          },
        }
      );
      toast.success("logged out successully");
      logout();

      window.location.href = "/";
    } catch (error) {
      localStorage.removeItem("tokens");
      toast.error("unable to logout!");
      console.log("logout error : ", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="flex  justify-center bg-gradient-to-br p-4 z-[9999]">
      <div className="w-96 h-[600px] bg-gradient-to-b from-purple-300 to-purple-400 rounded-2xl p-6 text-purple-900 flex flex-col items-center justify-between shadow-xl border border-purple-200/50">
        {/* Profile Section */}
        <div className="flex flex-col items-center mt-4">
          <div className="relative">
            <img
              className="h-40 w-40 rounded-full object-cover border-4 border-white shadow-md"
              src={currentUser.avatar}
              alt="Profile"
            />
          </div>
          <h2 className="text-2xl font-bold mt-4">{currentUser.username}</h2>
          <p className="text-purple-700 mt-1">{currentUser.email}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center w-full gap-3">
          <button
            onClick={() => setIsChangePassword(true)}
            className="w-4/5 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            Change Password
          </button>
          <ChangePassword
            isOpen={isChangePassword}
            onClose={() => setIsChangePassword(false)}
          />
          <button
            onClick={() => setIsChangeAvatar(true)}
            className="w-4/5 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Change Avatar
          </button>
          <ChangeAvatar
            isOpen={isChangeAvatar}
            onClose={() => setIsChangeAvatar(false)}
          />
          <button
            onClick={() => setIsChangeDetails(true)}
            className="w-4/5 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
              />
            </svg>
            Change Details
          </button>
          <ChangeDetails
            isOpen={isChangeDetails}
            onClose={() => setIsChangeDetails(false)}
            currentUser={currentUser}
          />
        </div>

        {/* Logout Button */}
        <div className="w-full m-4">
          <button className="w-4/5 mx-auto py-3 bg-white text-purple-700 rounded-xl font-medium border border-purple-300 hover:bg-purple-50 transition-all duration-300 shadow flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <button onClick={handleLogOut}>Logout</button>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
