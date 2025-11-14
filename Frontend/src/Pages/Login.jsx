import React, { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { LuEyeClosed } from "react-icons/lu";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import userQuiz from "@/store/userStore";
import axios from "axios";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  let userData;
  const login = userQuiz((state) => state.login);
  const navigate = useNavigate();

  const toggleView = () => {
    setShowPassword((prev) => !prev);
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name === "email") {
      error = validateEmail(value);
    } else if (name === "password") {
      error = validatePassword(value);
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/users/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );
      if (
        response.data.success &&
        response.data.data &&
        response.data.data.accessToken
      ) {
        const accessToken = response.data.data.accessToken;
        userData = response.data.data.user;
        if (accessToken) {
          localStorage.setItem("tokens", accessToken);
          localStorage.setItem("userId", userData._id);
          toast.success("Successfully logged in!");
          login({
            username: userData.username,
            email: userData.email,
            avatar: userData.avatar,
            userQuizes: userData.userQuizes,
          });
          console.log(userData);
        }
        setTimeout(() => {
          navigate("/prompt");
        }, 2000);
      }
    } catch (error) {
      // Handle specific error messages from backend
      // if (error.response?.data?.message) {
      //   toast.error(error.response.data.message);
      // } else if (error.response?.status === 401) {
      //   toast.error("Invalid email or password");
      // } else if (error.response?.status === 404) {
      //   toast.error("User not found. Please sign up first.");
      // } else {
      //   toast.error("Unable to login. Please try again.");
      // }
      console.log("auth error : ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#2c1e4a] w-full min-h-screen p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-[#cb6ce6] hover:text-[#d78ef0] transition-colors p-2 rounded-lg hover:bg-[#342557]"
          aria-label="Go back"
        >
          <IoArrowBack size={24} />
        </button>
        <div className="text-[#cb6ce6] text-xl sm:text-2xl font-bold">
          Quizzii
        </div>
      </div>
      <div className="flex justify-center flex-col items-center">
        <div className="w-full max-w-xs sm:max-w-sm sm:mb-6">
          <DotLottieReact
            src="https://lottie.host/afbd5301-b405-421a-99e4-812d781e6a1b/A3NVdHgK2x.lottie"
            loop
            autoplay
          />
        </div>
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-[#342557] rounded-xl sm:rounded-2xl flex flex-col p-4 sm:p-6 md:p-8 gap-3 sm:gap-4">
          <div className="flex justify-between items-center">
            <div className="heading text-lg sm:text-xl md:text-2xl font-semibold">
              Login
            </div>
            <div className="underline cursor-pointer text-sm sm:text-base">
              <Link
                to="/sign-up"
                className="hover:text-[#d78ef0] transition-colors"
              >
                New user?
              </Link>
            </div>
          </div>
          <form
            onSubmit={handleSubmitLogin}
            className="flex flex-col gap-3 sm:gap-4"
          >
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  type="email"
                  placeholder="Enter your email"
                  className="w-full outline-none px-2 sm:px-3 text-sm sm:text-base bg-transparent"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs sm:text-sm mt-1 px-2">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="px-2 sm:px-4">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="px-2 text-sm sm:text-base">
                  Password
                </label>
                <div
                  onClick={toggleView}
                  className="px-2 sm:px-4 cursor-pointer hover:text-[#cb6ce6] transition-colors"
                >
                  {showPassword ? (
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
                  name="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full outline-none px-2 sm:px-3 text-sm sm:text-base bg-transparent"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs sm:text-sm mt-1 px-2">
                  {errors.password}
                </p>
              )}
            </div>
            <div className="flex justify-center mt-2 sm:mt-4">
              <button
                type="submit"
                className="bg-[#2c1e4a] w-full sm:w-3/4 md:w-1/2 h-10 sm:h-9 rounded-2xl sm:rounded-3xl font-semibold cursor-pointer hover:bg-[#3a2760] transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
