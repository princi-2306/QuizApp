import React, { useState } from "react";
import { LuEyeClosed } from "react-icons/lu";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import LoadingPage from "@/components/loadingPages/LoadingPage";
import axios from "axios";
import { toast } from "react-toastify";

const SignUp = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPass: "",
    avatar: null,
  });

  // Check if username exists
  const checkUsernameAvailability = async (username) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/users/check-username/${username}`
      );
      return response.data.available;
    } catch (error) {
      console.error("Username check error:", error);
      return true; // Allow to proceed if check fails
    }
  };

  // Check if email exists
  const checkEmailAvailability = async (email) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/users/check-email/${email}`
      );
      return response.data.available;
    } catch (error) {
      console.error("Email check error:", error);
      return true; // Allow to proceed if check fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validateFormErrors = await formValidate();
    if (Object.keys(validateFormErrors).length > 0) {
      setErrors(validateFormErrors);
      Object.values(validateFormErrors).forEach((error) => {
        if (error) {
          toast.error(error);
        }
      });
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("username", formData.username);
      form.append("email", formData.email);
      form.append("password", formData.password);
      if (formData.avatar) {
        form.append("avatar", formData.avatar);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_URL}/users/register`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success && response.data.data) {
        const accessToken = response.data.data.accessToken;
        const userData = response.data.data.user;
        localStorage.setItem("token", accessToken);
        console.log(userData);
        toast.success("User created successfully!");
        navigate("/login");
      }
    } catch (error) {
      console.log("Auth error:", error);

      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 409) {
        toast.error("Username or email already exists!");
      } else {
        toast.error("Username or email already exists!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleProfile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB!");
        return;
      }

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(
          "Please upload a valid image file (JPEG, PNG, GIF, or WebP)"
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));

      // Clear avatar error
      if (errors.avatar) {
        setErrors((prev) => ({
          ...prev,
          avatar: "",
        }));
      }
    }
  };

  const formValidate = async () => {
    const myError = {};

    // Username validation
    if (!formData.username.trim()) {
      myError.username = "Username is required";
    } else if (formData.username.length < 3) {
      myError.username = "Username must be at least 3 characters long";
    } else if (formData.username.length > 20) {
      myError.username = "Username must not exceed 20 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      myError.username =
        "Username can only contain letters, numbers, and underscores";
    } else {
      // Check if username already exists
      const isAvailable = await checkUsernameAvailability(formData.username);
      if (!isAvailable) {
        myError.username = "Username is already taken";
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      myError.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      myError.email = "Please enter a valid email address";
    } else {
      // Check if email already exists
      const isAvailable = await checkEmailAvailability(formData.email);
      if (!isAvailable) {
        myError.email = "Email is already registered";
      }
    }

    // Password validation
    if (!formData.password) {
      myError.password = "Password is required";
    } else if (formData.password.length < 8) {
      myError.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      myError.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      myError.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      myError.password = "Password must contain at least one number";
    } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
      myError.password =
        "Password must contain at least one special character (@$!%*?&)";
    }

    // Confirm password validation
    if (!formData.confirmPass) {
      myError.confirmPass = "Please confirm your password";
    } else if (formData.password !== formData.confirmPass) {
      myError.confirmPass = "Passwords do not match";
    }

    // Avatar validation
    if (!formData.avatar) {
      myError.avatar = "Avatar is required";
    }

    return myError;
  };

  return (
    <div className="bg-[#2c1e4a] w-full min-h-screen p-10 sm:p-6 md:p-8 lg:p-10">
      <div className="flex items-center gap-4 mb-4 sm:mb-6 md:mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-[#cb6ce6] hover:text-[#d78ef0] transition-colors p-2 rounded-lg hover:bg-[#342557]"
          aria-label="Go back"
        >
          <IoArrowBack size={24} />
        </button>
        <div className="text-[#cb6ce6] text-xl sm:text-2xl font-bold">
          Quizzi
        </div>
      </div>
      <div className="flex justify-center items-center">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-[#342557] rounded-xl sm:rounded-2xl flex flex-col p-4 sm:p-6 md:p-8 lg:p-10 gap-3 sm:gap-4">
          <div className="flex justify-between items-center">
            <div className="heading text-lg sm:text-xl md:text-2xl font-semibold">
              Sign up
            </div>
            <div className="underline text-sm sm:text-base">
              <Link
                to="/login"
                className="hover:text-[#d78ef0] transition-colors"
              >
                Already a user?
              </Link>
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:gap-4"
          >
            <div className="px-2 sm:px-4">
              <label htmlFor="username" className="px-2 text-sm sm:text-base">
                Username
              </label>
              <div
                className={`bg-[#2c1e4a] w-full p-2 rounded-2xl sm:rounded-3xl ${
                  errors.username ? "ring-2 ring-red-500" : ""
                }`}
              >
                <input
                  id="username"
                  name="username"
                  value={formData.username}
                  type="text"
                  placeholder="Enter your username"
                  onChange={handleChange}
                  required
                  className="w-full outline-none px-2 sm:px-3 text-sm sm:text-base bg-transparent"
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-xs mt-1 px-2">
                  {errors.username}
                </p>
              )}
            </div>

            <div className="px-2 sm:px-4">
              <label htmlFor="email" className="px-2 text-sm sm:text-base">
                Email
              </label>
              <div
                className={`bg-[#2c1e4a] w-full p-2 rounded-2xl sm:rounded-3xl ${
                  errors.email ? "ring-2 ring-red-500" : ""
                }`}
              >
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="m@example.com"
                  required
                  className="w-full outline-none px-2 sm:px-3 text-sm sm:text-base bg-transparent"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 px-2">{errors.email}</p>
              )}
            </div>

            <div className="px-2 sm:px-4">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="px-2 text-sm sm:text-base">
                  Password
                </label>
                <div
                  onClick={() => setPassword((prev) => !prev)}
                  className="px-2 sm:px-4 cursor-pointer hover:text-[#cb6ce6] transition-colors"
                >
                  {password ? (
                    <MdOutlineRemoveRedEye
                      size={18}
                      className="sm:w-5 sm:h-5"
                    />
                  ) : (
                    <LuEyeClosed size={18} className="sm:w-5 sm:h-5" />
                  )}
                </div>
              </div>
              <div
                className={`bg-[#2c1e4a] w-full p-2 rounded-2xl sm:rounded-3xl ${
                  errors.password ? "ring-2 ring-red-500" : ""
                }`}
              >
                <input
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  type={password ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full outline-none px-2 sm:px-3 text-sm sm:text-base bg-transparent"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 px-2">
                  {errors.password}
                </p>
              )}
              <div className="text-xs text-gray-400 mt-1 px-2">
                Must contain: 8+ chars, uppercase, lowercase, number, special
                char
              </div>
            </div>

            <div className="px-2 sm:px-4">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="confirmPass"
                  className="px-2 text-sm sm:text-base"
                >
                  Confirm Password
                </label>
                <div
                  onClick={() => setConfirmPassword((prev) => !prev)}
                  className="px-2 sm:px-4 cursor-pointer hover:text-[#cb6ce6] transition-colors"
                >
                  {confirmPassword ? (
                    <MdOutlineRemoveRedEye
                      size={18}
                      className="sm:w-5 sm:h-5"
                    />
                  ) : (
                    <LuEyeClosed size={18} className="sm:w-5 sm:h-5" />
                  )}
                </div>
              </div>
              <div
                className={`bg-[#2c1e4a] w-full p-2 rounded-2xl sm:rounded-3xl ${
                  errors.confirmPass ? "ring-2 ring-red-500" : ""
                }`}
              >
                <input
                  id="confirmPass"
                  name="confirmPass"
                  value={formData.confirmPass}
                  onChange={handleChange}
                  required
                  type={confirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className="w-full outline-none px-2 sm:px-3 text-sm sm:text-base bg-transparent"
                />
              </div>
              {errors.confirmPass && (
                <p className="text-red-400 text-xs mt-1 px-2">
                  {errors.confirmPass}
                </p>
              )}
            </div>

            <div className="px-2 sm:px-4">
              <label htmlFor="avatar" className="px-2 text-sm sm:text-base">
                Upload Avatar
              </label>
              <div
                className={`bg-[#2c1e4a] w-full p-2 rounded-2xl sm:rounded-3xl ${
                  errors.avatar ? "ring-2 ring-red-500" : ""
                }`}
              >
                <input
                  onChange={handleProfile}
                  id="avatar"
                  type="file"
                  name="avatar"
                  accept="image/*"
                  className="w-full outline-none px-2 sm:px-3 text-xs sm:text-sm bg-transparent file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-[#cb6ce6] file:text-[#2c1e4a] hover:file:bg-[#d78ef0]"
                />
              </div>
              {errors.avatar && (
                <p className="text-red-400 text-xs mt-1 px-2">
                  {errors.avatar}
                </p>
              )}
              {formData.avatar && (
                <p className="text-green-400 text-xs mt-1 px-2">
                  ✓ {formData.avatar.name}
                </p>
              )}
            </div>

            <div className="flex justify-center mt-2 sm:mt-4">
              <button
                type="submit"
                className="bg-[#2c1e4a] w-full sm:w-3/4 md:w-1/2 h-10 sm:h-9 rounded-2xl sm:rounded-3xl font-semibold cursor-pointer hover:bg-[#3a2760] transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
