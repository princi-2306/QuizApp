import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useDropzone } from "react-dropzone";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import quizStore from "@/store/quizStore";
import userQuiz from "@/store/userStore";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const CreateQuiz = () => {
  const [inputType, setInputType] = useState("text");
  const [extractedText, setExtractedText] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizResults, setQuizResults] = useState();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState({
    title: "",
    numQuestions: 5,
    difficulty: "medium",
    questionType: "multiple-choice",
    text: "",
    file: null,
  });

  const setCurrentQuiz = quizStore((state) => state.setCurrentQuiz);
  const currentQuiz = quizStore((state) => state.currentQuiz);
  const setNumberOfQuestions = quizStore((state) => state.setNumberOfQuestions);

  // Get quiz ID methods from userQuiz store
  const generateQuizId = userQuiz((state) => state.generateQuizId);
  const clearQuizId = userQuiz((state) => state.clearQuizId);

  const generateQuiz = async () => {
    setLoading(true);
    setQuizResults(null);

    // IMPORTANT: Clear old quiz ID and generate new one for fresh quiz
    clearQuizId();
    const newQuizId = generateQuizId();
    console.log("Generated new quiz ID for fresh quiz:", newQuizId);

    try {
      let content = quizData.text;

      // Validate content based on input type
      if (inputType === "pdf") {
        if (!quizData.file) {
          toast.error("Please upload a PDF file");
          setLoading(false);
          return;
        }
        content = await extractTextFromPdf(quizData.file);
        toast.dismiss("extracting questions from pdf");
        toast.success("PDF text extracted successfully!");
      } else if (inputType === "url") {
        if (!quizData.text.trim()) {
          toast.error("Please enter a URL");
          setLoading(false);
          return;
        }
        if (!isValidUrl(quizData.text)) {
          toast.error("Please enter a valid URL (e.g., https://example.com)");
          setLoading(false);
          return;
        }
        content = quizData.text;
      } else if (inputType === "text") {
        if (!quizData.text.trim()) {
          toast.error("Please enter text content");
          setLoading(false);
          return;
        }
        if (quizData.text.length < 50) {
          toast.warning(
            "Text content seems short. For better results, provide more content."
          );
        }
        content = quizData.text;
      }

      if (!content.trim()) {
        toast.error("No content available to generate quiz");
        setLoading(false);
        return;
      }

      const requestData = {
        text: content.substring(0, 10000),
        quizType: quizData.questionType,
        numQuestions: parseInt(quizData.numQuestions),
        difficulty: quizData.difficulty,
        title: quizData.title,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_URL}/quiz/generate-quiz`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60000, // 60 sec
        }
      );

      console.log("API Response:", response.data);
      const generatedQuiz = response.data.data.quiz;

      if (response.data.success) {
        setQuizResults(response.data.data.quiz);
        setCurrentQuiz({ ...generatedQuiz, quizType: quizData.questionType });

        // Update number of questions in store
        setNumberOfQuestions(parseInt(quizData.numQuestions));

        console.log(response.data.data.quiz);
        toast.success("Quiz generated successfully!");

        setTimeout(() => {
          navigate("/quiz");
        }, 1500);
      } else {
        console.log(quizData.file);
        console.log("failed to generate quiz");
        toast.error("failed to generate quiz");
      }
      setLoading(false);
    } catch (error) {
      console.error("Quiz generation error:", error);
      let errorMessage = "Failed to generate quiz";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (error) {
      return false;
    }
  };

  const extractTextFromPdf = async (file) => {
    try {
      if (!file) {
        throw new Error("No file provided");
      }

      if (!(file instanceof File || file instanceof Blob)) {
        throw new Error("Invalid file type");
      }

      if (file.size === 0) {
        throw new Error("File is empty");
      }

      if (file.type !== "application/pdf") {
        throw new Error("Please upload a valid PDF file");
      }

      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);

      const pdfDoc = await pdfjsLib.getDocument(typedArray).promise;

      let fullText = "";
      const maxPages = Math.min(pdfDoc.numPages, 50);

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      await pdfDoc.destroy();
      return fullText;
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update number of questions in store when it changes
    if (name === "numQuestions") {
      setNumberOfQuestions(parseInt(value));
    }
  };

  //dropzone setup
  const onDrop = (acceptedFile) => {
    if (acceptedFile.length > 0) {
      const file = acceptedFile[0];
      setQuizData((prev) => ({
        ...prev,
        file,
        content: "", // clears content when file is selected
      }));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  useEffect(() => {
    setQuizData((prev) => ({
      ...prev,
      text: "",
      file: null,
    }));
  }, [inputType]);

  return (
    <div className="min-h-screen bg-gradient-to-b md:p-10 overflow-hidden relative">
      <Navbar />

      <div className="flex items-center justify-center pt-20 px-4 sm:px-6 relative z-10">
        <div className="w-full max-w-5xl rounded-2xl bg-gradient-to-br from-slate-700 via-indigo-900 to-purple-900 backdrop-blur-md border border-purple-500/30 shadow-2xl flex flex-col gap-4 md:gap-6 p-4 md:p-8 lg:p-10 pb-6 md:pb-12 lg:pb-16">
          <div className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quiz Generator
          </div>

          <form className="space-y-4 md:space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
              {/* Left Column - Quiz Settings */}
              <div className="w-full lg:w-1/2 space-y-4 md:space-y-6">
                {/* Quiz Name */}
                <div>
                  <label className="block text-purple-100 font-medium mb-1 md:mb-2 text-sm md:text-base">
                    Quiz Name
                  </label>
                  <div className="bg-purple-800/50 backdrop-blur-sm w-full p-1 rounded-xl border border-purple-400/50 transition-all focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-400/50 hover:border-purple-300/70">
                    <input
                      name="title"
                      value={quizData.title}
                      onChange={handleInputChange}
                      className="w-full bg-transparent outline-none px-3 md:px-4 py-2 text-white placeholder-purple-300 text-sm md:text-base"
                      placeholder="Enter quiz name"
                    />
                  </div>
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="block text-purple-100 font-medium mb-1 md:mb-2 text-sm md:text-base">
                    Number of Questions
                  </label>
                  <div className="bg-purple-800/50 backdrop-blur-sm w-full md:w-full p-1 rounded-xl border border-purple-400/50 transition-all focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-400/50 hover:border-purple-300/70 relative overflow-auto">
                    <select
                      name="numQuestions"
                      aria-label="Number of questions"
                      value={quizData.numQuestions}
                      onChange={handleInputChange}
                      className="bg-transparent outline-none px-3 py-2 text-white appearance-none -translate-x-1 text-sm md:text-base lg:w-full md:w-full w-3/4 sm:overflow-y-scroll"
                    >
                      {Array.from({ length: 16 }, (_, i) => i + 5).map(
                        (num) => (
                          <option
                            key={num}
                            value={num}
                            className="bg-purple-900 text-white rounded-lg text-sm py-1.5 hover:bg-purple-700 w-1/3 "
                          >
                            {num}
                          </option>
                        )
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-300">
                      <svg
                        className="h-4 w-4 md:h-5 md:w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-purple-100 font-medium mb-1 md:mb-2 text-sm md:text-base">
                    Difficulty Level
                  </label>
                  <div className="bg-purple-800/50 backdrop-blur-sm w-full p-1 rounded-xl border border-purple-400/50 transition-all focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-400/50 hover:border-purple-300/70">
                    <select
                      name="difficulty"
                      value={quizData.difficulty}
                      onChange={handleInputChange}
                      className=" bg-transparent outline-none px-3 py-2 text-white appearance-none text-sm md:text-base lg:w-full md:w-full w-3/4"
                    >
                      <option
                        value="easy"
                        className="bg-purple-800 text-green-300"
                      >
                        Easy
                      </option>
                      <option
                        value="medium"
                        className="bg-purple-800 text-yellow-300"
                      >
                        Medium
                      </option>
                      <option
                        value="hard"
                        className="bg-purple-800 text-red-300"
                      >
                        Hard
                      </option>
                    </select>
                  </div>
                </div>

                {/* Question Type */}
                <div>
                  <label className="block text-purple-100 font-medium mb-1 md:mb-2 text-sm md:text-base">
                    Question Type
                  </label>
                  <div className="bg-purple-800/50 backdrop-blur-sm w-full p-1 rounded-xl border border-purple-400/50 transition-all focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-400/50 hover:border-purple-300/70">
                    <select
                      name="questionType"
                      value={quizData.questionType}
                      onChange={handleInputChange}
                      className="bg-transparent outline-none px-3 py-2 text-white appearance-none text-sm md:text-base lg:w-full md:w-full w-3/4"
                    >
                      <option value="multiple-choice" className="bg-purple-800">
                        Multiple Choice
                      </option>
                      <option value="boolean" className="bg-purple-800">
                        True/False
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column - Content Input */}
              <div className="w-full space-y-3 md:space-y-4 lg:translate-y-9 xl:translate-y-9">
                {/* Input Type Toggle */}
                <div className="flex bg-purple-800/50 rounded-xl p-1 border border-purple-400/30">
                  <button
                    type="button"
                    onClick={() => setInputType("text")}
                    className={`flex-1 py-2 px-1 rounded-lg text-center transition-all text-xs sm:text-sm ${
                      inputType === "text"
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow"
                        : "text-purple-200 hover:text-white"
                    }`}
                  >
                    Paste Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType("url")}
                    className={`flex-1 py-2 px-1 rounded-lg text-center transition-all text-xs sm:text-sm ${
                      inputType === "url"
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow"
                        : "text-purple-200 hover:text-white"
                    }`}
                  >
                    Paste URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType("pdf")}
                    className={`flex-1 py-2 px-1 rounded-lg text-center transition-all text-xs sm:text-sm ${
                      inputType === "pdf"
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow"
                        : "text-purple-200 hover:text-white"
                    }`}
                  >
                    Upload PDF
                  </button>
                </div>

                {/* Content Input */}
                <div>
                  <label className="block text-purple-100 font-medium mb-1 md:mb-2 text-sm md:text-base">
                    {inputType === "text"
                      ? "Paste your content here"
                      : inputType == "url"
                      ? "Enter URL"
                      : "Upload PDF File"}
                  </label>
                  <div>
                    {inputType === "text" && (
                      <textarea
                        name="text"
                        value={quizData.text}
                        onChange={handleInputChange}
                        className="bg-purple-800/50 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-900/20 backdrop-blur-sm w-full h-32 md:h-40 lg:h-48 pt-2 pl-3 md:pl-4 rounded-xl border border-purple-400/50 transition-all focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-400/50 hover:border-purple-300/70 focus:outline-none text-sm md:text-base placeholder-purple-300"
                        placeholder="Paste your text content here..."
                      />
                    )}
                    {inputType === "url" && (
                      <input
                        type="url"
                        name="text"
                        value={quizData.text}
                        onChange={handleInputChange}
                        className="w-full bg-purple-800/50 border focus:outline-none border-purple-400/50 rounded-xl px-3 md:px-4 py-2 md:py-3 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400/50 text-sm md:text-base"
                        placeholder="https://example.com"
                      />
                    )}
                    {inputType === "pdf" && (
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-4 md:p-6 text-center cursor-pointer transition text-sm md:text-base ${
                          isDragActive
                            ? "border-pink-400 bg-purple-700/40"
                            : "border-purple-400/50 bg-purple-800/50"
                        }`}
                      >
                        <input {...getInputProps()} />
                        {quizData.file ? (
                          <p className="text-green-300">
                            📄 {quizData.file.name} uploaded
                          </p>
                        ) : isDragActive ? (
                          <p className="text-pink-300">Drop the PDF here...</p>
                        ) : (
                          <p className="text-purple-200">
                            Drag & drop a PDF, or click to select
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full cursor-pointer transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/30 mt-2 md:mt-0">
                  <button
                    type="button"
                    onClick={generateQuiz}
                    disabled={loading}
                    className="w-full py-2 md:py-3 text-white font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      ></path>
                    </svg>
                    {loading ? "Generating..." : "Generate quiz"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes shoot {
          0% {
            transform: translateX(100%) translateY(-100%) rotate(45deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateX(-100%) translateY(100%) rotate(45deg);
            opacity: 0;
          }
        }

        .star {
          position: absolute;
          top: 0;
          width: 2px;
          height: 2px;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shoot linear;
          z-index: 1;
        }

        .star:before {
          content: "";
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 1px;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.6) 100%
          );
        }
      `}</style>
    </div>
  );
};

export default CreateQuiz;
