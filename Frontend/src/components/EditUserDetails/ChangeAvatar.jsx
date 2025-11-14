import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, CheckCircle, RotateCw } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import userQuiz from "@/store/userStore";

const ChangeAvatar = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef(null);
  const updateAvatar = userQuiz((state) => state.updateAvatar);

  const handleFileChange = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("avatar", selectedImage);

      const response = await axios.patch(
        `${import.meta.env.VITE_URL}/users/update-avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("tokens")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Avatar updated successfully!");

        // Update user details in store with new avatar
        updateAvatar(response.data.data.avatar);

        setIsSuccess(true);

        setTimeout(() => {
          setIsSubmitting(false);
          setIsSuccess(false);
          if (onClose) onClose();
          // Reset states
          setSelectedImage(null);
          setRotation(0);
          setPreviewUrl(null);
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      toast.error("unable to update avatar");
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  };

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
                    <h3 className="text-2xl font-bold">Avatar Updated!</h3>
                    <p className="mt-2">
                      Your profile picture has been changed successfully.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dialog box */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl shadow-2xl overflow-hidden border border-white/20">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative">
                <h2 className="text-2xl font-bold text-center">
                  Change Avatar
                </h2>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Upload area */}
                {!previewUrl ? (
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                      isDragging
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-300 hover:border-purple-400"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                        <Upload className="text-purple-600" size={28} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">
                          Drag & drop your image here
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          or{" "}
                          <span className="text-purple-600 font-medium">
                            browse files
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        Supported formats: JPG, PNG, GIF (Max 5MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Preview area */
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          style={{ transform: `rotate(${rotation}deg)` }}
                        />
                      </div>
                      <button
                        onClick={handleRotate}
                        className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                        title="Rotate image"
                      >
                        <RotateCw size={16} />
                      </button>
                    </div>
                    <button
                      onClick={handleRemoveImage}
                      className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                      Remove image
                    </button>
                  </div>
                )}
                <form action="">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept="image/*"
                    className="hidden"
                  />

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
                      onClick={handleSubmit}
                      disabled={!selectedImage || isSubmitting}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        "Update Avatar"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChangeAvatar;
