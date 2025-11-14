import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserAlt, FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import userQuiz from "@/store/userStore";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentUser = userQuiz((state) => state.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 10) {
        setIsVisible(true);
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsMobileMenuOpen(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);

    // Check if trying to access Quizzes or Create page without login
    // Redirect to login page if user is not authenticated
    if ((path === "/user" || path === "/prompt") && !currentUser) {
      navigate("/login");
      return;
    }

    navigate(path);
  };

  const handleOnclick = () => {
    if (currentUser) {
      navigate("/user");
    } else {
      navigate("/login");
    }
  };

  const navElements = [
    { name: "Home", path: "/" },
    { name: "Quizzes", path: "/user" },
    { name: "Create", path: "/prompt" },
  ];

  return (
    <>
      {/* Main Navbar */}
      <div
        className={`fixed top-4 left-0 w-full flex justify-center transition-all duration-300 z-50 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ backdropFilter: "blur(10px)" }}
      >
        {/* Desktop Navbar - Exact same measurements as original */}
        <div
          className="hidden lg:flex w-3/4 h-12 rounded-full justify-between items-center px-10"
          style={{ background: "rgba(30, 15, 63, 0.7)" }}
        >
          <div className="text-[#cb6ce6] text-2xl font-bold">Quizzii</div>

          <div className="flex justify-center items-center gap-16 flex-grow">
            {navElements.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavClick(item.path)}
                className="relative text-white hover:text-violet-300 font-medium transition-colors duration-300 cursor-pointer group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-violet-400 group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
          </div>

          <div
            onClick={handleOnclick}
            className="cursor-pointer text-white hover:text-violet-300 transition-colors"
          >
            {currentUser ? <FaUserAlt /> : "login"}
          </div>
        </div>

        {/* Mobile Navbar */}
        <div
          className="lg:hidden w-11/12 h-14 rounded-2xl flex justify-between items-center px-6"
          style={{ background: "rgba(30, 15, 63, 0.7)" }}
        >
          <div className="text-[#cb6ce6] text-xl font-bold">Quizzii</div>

          {/* Mobile Menu Button and User */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-violet-300 transition-colors focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <FaTimes size={20} />
                ) : (
                  <FaBars size={20} />
                )}
              </button>
            ) : (
              <button
                onClick={handleOnclick}
                className="text-white hover:text-violet-300 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed top-20 left-1/2 transform -translate-x-1/2 w-11/12 rounded-2xl z-50"
            style={{ background: "rgba(30, 15, 63, 0.95)" }}
          >
            <div className="px-6 py-4 space-y-2">
              {navElements.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(item.path)}
                  className="block w-full text-left text-white hover:text-violet-300 font-medium py-3 px-4 transition-colors duration-300 rounded-lg hover:bg-violet-900/30"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
