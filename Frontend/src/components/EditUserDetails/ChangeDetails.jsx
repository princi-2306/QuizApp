import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Mail, User } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import userQuiz from "@/store/userStore";
//get current user too
const ChangeDetails = ({ isOpen, onClose, currentUser }) => {
  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const updateUserDetails = userQuiz((state) => state.updateUserDetails);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {};

      if (formData.username && formData.username.trim() !== "") {
        payload.username = formData.username.trim();
      }

      if (formData.email && formData.email.trim() !== "") {
        payload.email = formData.email.trim();
      }

      if (Object.keys(payload).length === 0) {
        toast.warn("Please provide either username or email to update");
        setIsSubmitting(false);
        return;
      }
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/users/change-details`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("tokens")}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("password changed successfully!");

        updateUserDetails(payload);
        setIsSuccess(true);
        setFormData({
          email: "",
          username: "",
        });

        setTimeout(() => {
          setIsSubmitting(false);
          setIsSuccess(false);
          if (onClose) onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("user details change error : ", error);
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  };

  const hasValidChanges = () => {
    const hasUsernameChange =
      formData.username.trim() !== "" &&
      formData.username !== currentUser?.username &&
      formData.username.length >= 3;

    const hasEmailChange =
      formData.email.trim() !== "" &&
      formData.email !== currentUser?.email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

    return hasUsernameChange || hasEmailChange;
  };

  // Individual field validations
  const isEmailValid =
    formData.email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isUsernameValid =
    formData.username === "" || formData.username.length >= 3;

  // Check if fields have actually changed from current values
  const isUsernameChanged = formData.username !== currentUser?.username;
  const isEmailChanged = formData.email !== currentUser?.email;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md"
          >
            {/* Success overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-green-500/90 rounded-2xl z-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="text-white text-center"
                  >
                    <CheckCircle size={64} className="mx-auto mb-4" />
                    <h3 className="text-2xl font-bold">Details Updated!</h3>
                    <p className="mt-2">
                      Your information has been updated successfully.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dialog box */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl overflow-hidden border border-white/20">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 p-6 text-white relative">
                <h2 className="text-2xl font-bold text-center">
                  Update Your Details
                </h2>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div
                    className={`relative rounded-lg transition-all ${
                      activeField === "username" ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onFocus={() => setActiveField("username")}
                      onBlur={() => setActiveField(null)}
                      className={`w-full px-4 py-3 pl-10 text-gray-800 bg-white rounded-lg border focus:outline-none transition-all ${
                        formData.username && !isUsernameValid
                          ? "border-red-500"
                          : isUsernameChanged && isUsernameValid
                          ? "border-green-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your username"
                    />
                  </div>
                  {formData.username && !isUsernameValid && (
                    <p className="mt-1 text-xs text-red-600">
                      Username should be at least 3 characters
                    </p>
                  )}
                  {isUsernameValid && isUsernameChanged && (
                    <p className="mt-1 text-xs text-green-600">
                      Username will be updated
                    </p>
                  )}
                  {isUsernameValid &&
                    !isUsernameChanged &&
                    formData.username && (
                      <p className="mt-1 text-xs text-gray-500">
                        Same as current username
                      </p>
                    )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div
                    className={`relative rounded-lg transition-all ${
                      activeField === "email" ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setActiveField("email")}
                      onBlur={() => setActiveField(null)}
                      className={`w-full text-gray-800 px-4 py-3 pl-10 bg-white rounded-lg border focus:outline-none transition-all ${
                        formData.email && !isEmailValid
                          ? "border-red-500"
                          : isEmailChanged && isEmailValid
                          ? "border-green-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {formData.email && !isEmailValid && (
                    <p className="mt-1 text-xs text-red-600">
                      Please enter a valid email address
                    </p>
                  )}
                  {isEmailValid && isEmailChanged && (
                    <p className="mt-1 text-xs text-green-600">
                      Email will be updated
                    </p>
                  )}
                  {isEmailValid && !isEmailChanged && formData.email && (
                    <p className="mt-1 text-xs text-gray-500">
                      Same as current email
                    </p>
                  )}
                </div>

                {/* Current details preview */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Current Details
                  </h3>
                  <div className="text-sm text-blue-600">
                    <p>
                      <span className="font-medium">Username:</span>{" "}
                      {currentUser?.username || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {currentUser?.email || "Not set"}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !hasValidChanges()}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      "Update Details"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChangeDetails;
