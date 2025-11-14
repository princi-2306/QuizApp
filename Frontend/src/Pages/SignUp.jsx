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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    // confirmPass: "",
    avatar: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    //validate form
    const validateFormErrors = formValidate();
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
      let response;
      const form = new FormData();
      form.append("username", formData.username);
      form.append("email", formData.email);
      form.append("password", formData.password);
      if (formData.avatar) {
        form.append("avatar", formData.avatar);
      }

      response = await axios.post(
        `${import.meta.env.VITE_URL}/users/register`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
      if (response.data.success && response.data.data) {
        const accessToken = response.data.data.accessToken;
        const userData = response.data.data.user;
        localStorage.setItem("token", accessToken);
        toast.success("user created successfully!");
        navigate("/login");
      }
    } catch (error) {
      console.log("Auth error : ", error);
      toast.error("unable to create user!");
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
  };

  const handleProfile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("file above 5MB!");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));
    } else {
      toast.error("avatar is required!");
    }
  };

  const formValidate = () => {
    const myError = {};
    if (!formData.username.trim()) {
      myError.username = "username is required";
    } else if (formData.username.length < 3) {
      myError.username = "username should have 4 characters";
    }
    if (!formData.email.trim()) {
      myError.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      myError.email = "Enter valid email";
    }
    if (!formData.password) {
      myError.password = "Password is required";
    } else if (formData.password.length < 8) {
      myError.password = "Password should be atleast 8 charcters long";
    }
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
          <form action="" className="flex flex-col gap-3 sm:gap-4">
            <div className="px-2 sm:px-4">
              <label htmlFor="" className="px-2 text-sm sm:text-base">
                Username
              </label>
              <div className="bg-[#2c1e4a] w-full p-2 rounded-2xl sm:rounded-3xl">
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
            </div>
            <div className="px-2 sm:px-4">
              <label htmlFor="" className="px-2 text-sm sm:text-base">
                Email
              </label>
              <div className="bg-[#2c1e4a] w-full p-2 rounded-2xl sm:rounded-3xl">
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
            </div>
            <div className="px-2 sm:px-4">
              <div className="flex justify-between items-center">
                <label htmlFor="" className="px-2 text-sm sm:text-base">
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
              <div className="bg-[#2c1e4a] w-full p-2 rounded-2xl sm:rounded-3xl">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  type={password ? "text" : "password"}
                  className="w-full outline-none px-2 sm:px-3 text-sm sm:text-base bg-transparent"
                />
              </div>
            </div>
            <div className="px-2 sm:px-4">
              <div className="flex justify-between items-center">
                <label htmlFor="" className="px-2 text-sm sm:text-base">
                  Confirm Password
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
              <div className="bg-[#2c1e4a] w-full p-2 rounded-2xl sm:rounded-3xl">
                <input
                  name="password"
                  type={password ? "text" : "password"}
                  className="w-full outline-none px-2 sm:px-3 text-sm sm:text-base bg-transparent"
                />
              </div>
            </div>
            <div className="px-2 sm:px-4">
              <label htmlFor="" className="px-2 text-sm sm:text-base">
                Upload Avatar
              </label>
              <div className="bg-[#2c1e4a] w-full p-2 rounded-2xl sm:rounded-3xl">
                <input
                  onChange={handleProfile}
                  id="avatar"
                  type="file"
                  name="avatar"
                  accept="image/*"
                  className="w-full outline-none px-2 sm:px-3 text-xs sm:text-sm bg-transparent file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-[#cb6ce6] file:text-[#2c1e4a] hover:file:bg-[#d78ef0]"
                />
              </div>
            </div>
            <div className="flex justify-center mt-2 sm:mt-4">
              <button
                className="bg-[#2c1e4a] w-full sm:w-3/4 md:w-1/2 h-10 sm:h-9 rounded-2xl sm:rounded-3xl font-semibold cursor-pointer hover:bg-[#3a2760] transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
                onClick={handleSubmit}
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
