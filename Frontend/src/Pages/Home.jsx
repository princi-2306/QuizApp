import React, { useState, useEffect, useCallback } from "react";
import { FaTrophy } from "react-icons/fa";
import { FiRefreshCw, FiDownload } from "react-icons/fi";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import img from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LoadingPage from "@/components/loadingPages/LoadingPage";
import img1 from "../assets/Screenshot (403).png";
import img2 from "../assets/Screenshot (404).png";
import img3 from "../assets/Screenshot (405).png";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import userQuiz from "@/store/userStore";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const currentUser = userQuiz((state) => state.currentUser);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Memoized navigation functions
  const goToSignup = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      // Check if user is already logged in
      if (currentUser) {
        navigate("/user");
      } else {
        navigate("/sign-up");
      }
    }, 1500);
  }, [navigate, currentUser]);

  const goToLogin = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  }, [navigate]);

  // Auto-rotate sections on desktop
  useEffect(() => {
    if (isMobile) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sections.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile]);

  const sections = [
    {
      title: "Entering text",
      img: img1,
      description: "Easily create quizzes by typing your text directly.",
    },
    {
      title: "Paste URL",
      img: img2,
      description: "Generate quizzes from any URL content automatically.",
    },
    {
      title: "Drag and PDF",
      img: img3,
      description: "Upload PDF files and instantly turn them into quizzes.",
    },
  ];

  const features = [
    {
      title: "Keeping Score",
      Icon: FaTrophy,
      description: "Keep scores of your quizzes",
    },
    {
      title: "Multiple Quiz Attempts",
      Icon: FiRefreshCw,
      description:
        "Attempt one quiz multiple times to learn and track your progress",
    },
    {
      title: "Download Quizzes",
      Icon: FiDownload,
      description: "Download your generated quiz.",
    },
  ];

  // Animation variants for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (loading) return <LoadingPage />;

  return (
    <section className="overflow-hidden">
      <Navbar />
      {/* Hero Section */}
      <div className="flex flex-col p-6 py-20 md:p-6 lg:p-16 min-h-screen gap-10 justify-center md:gap-8">
        <div className="flex flex-col lg:flex-row w-full items-center lg:mt-10 gap-6 md:gap-12">
          <div className="w-full lg:w-1/2 text-5xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-bold leading-tight">
            Stop Wasting Time Manually Creating Quizzes
          </div>
          <div className="w-full lg:w-1/2 max-w-md lg:max-w-full lg:mt-15 mx-auto">
            <DotLottieReact
              src="https://lottie.host/c9a5b264-0216-46aa-a998-a30d60d6eea4/yeTfKXH9eV.lottie"
              loop
              autoplay
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="bg-[#342557] button py-3 text-lg md:text-xl rounded-3xl w-full max-w-sm md:max-w-md mx-auto lg:mx-0 flex px-4 items-center justify-center gap-4 hover:bg-[#3d2a63] transition-colors duration-200 cursor-pointer">
          <span>
            <img
              className="w-8 h-8 md:w-10 md:h-10"
              src={img}
              alt="Quizzy Logo"
              loading="lazy"
            />
          </span>
          <button onClick={goToSignup} className="font-semibold">
            {currentUser ? "Go to Dashboard" : "Sign up with email"}
          </button>
        </div>

        <div className="px-4 text-center lg:text-left text-gray-400 text-sm md:text-base">
          {currentUser
            ? "Continue your quiz journey"
            : "Start taking your own quiz"}
        </div>
      </div>

      {/* Features Showcase Section */}
      <div className="bg-[#2c1e4a] text-white font-poppins">
        <section className="flex flex-col lg:flex-row min-h-screen p-4 md:p-6 lg:p-10 gap-6 md:gap-8 lg:gap-10">
          {/* Text Content */}
          <div className="flex flex-col gap-4 md:gap-6 w-full lg:w-1/3">
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 md:mt-10 flex flex-col gap-2 md:gap-4"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <div>Create Quizzes</div>
              <div>Through</div>
            </motion.h1>

            <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col gap-2 cursor-pointer p-3 rounded-lg hover:bg-purple-900/20 transition-colors duration-200"
                  whileHover={{ scale: isMobile ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveIndex(index)}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <div
                    className={`text-2xl md:text-3xl lg:text-4xl font-semibold transition-all duration-300 ${
                      activeIndex === index
                        ? "text-purple-400 scale-105"
                        : "text-white"
                    }`}
                  >
                    {section.title}
                  </div>

                  <AnimatePresence>
                    {activeIndex === index && (
                      <motion.div
                        key="desc"
                        className="text-gray-300 text-sm md:text-base lg:text-lg max-w-md"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {section.description}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Image Display */}
          <div className="flex-1 relative min-h-[300px] md:min-h-[400px] lg:min-h-[500px] mt-6 lg:mt-0">
            <AnimatePresence mode="wait">
              {sections.map(
                (section, index) =>
                  activeIndex === index && (
                    <motion.img
                      key={section.title}
                      src={section.img}
                      alt={section.title}
                      className="absolute top-0 left-0 w-full h-full object-contain rounded-xl md:rounded-2xl shadow-lg"
                      initial={{ opacity: 0, x: isMobile ? 0 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isMobile ? 0 : -50 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      loading="lazy"
                    />
                  )
              )}
            </AnimatePresence>

            {/* Mobile Indicators */}
            {isMobile && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {sections.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeIndex === index ? "bg-purple-400" : "bg-gray-400"
                    }`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Description Section */}
        <section className="py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-10 max-w-6xl mx-auto text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6"
              variants={itemVariants}
            >
              Why Choose Our Quiz Creator?
            </motion.h2>
            <motion.p
              className="text-base md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Our platform helps teachers, students, and content creators
              generate quizzes quickly and efficiently. You can create
              interactive quizzes from text, URLs, or even PDFs, making learning
              fun and effective.
            </motion.p>
          </motion.div>
        </section>

        {/* Features Grid Section */}
        <section className="py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-10 bg-purple-900/30 backdrop-blur-sm">
          <motion.div
            className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-4 md:p-6 bg-purple-800/50 rounded-xl shadow-lg text-center hover:bg-purple-800/70 transition-all duration-300 group"
                whileHover={{ scale: isMobile ? 1 : 1.05 }}
                variants={itemVariants}
              >
                {feature.Icon && (
                  <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto mb-3 md:mb-4 bg-purple-900/50 rounded-full flex items-center justify-center group-hover:bg-purple-900/70 transition-colors duration-300">
                    <feature.Icon className="text-4xl md:text-5xl lg:text-6xl text-purple-300" />
                  </div>
                )}

                <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm md:text-base">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Call to Action Section */}
        <section className="py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-10 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6"
              variants={itemVariants}
            >
              Start Creating Quizzes Today!
            </motion.h2>
            <motion.button
              className="px-6 md:px-8 py-3 md:py-4 bg-purple-500 rounded-xl text-white font-semibold hover:bg-purple-600 transition-all duration-200 text-base md:text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToSignup}
              variants={itemVariants}
            >
              {currentUser ? "Go to Dashboard" : "Get Started"}
            </motion.button>
          </motion.div>
        </section>
      </div>
      <Footer />
    </section>
  );
};

export default Home;
