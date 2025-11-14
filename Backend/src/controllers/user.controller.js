import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const generateAccessAndRefershToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while creating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;
  // console.log("body :".req.body)
  // console.log("files : ", req.files);

  if ([username, password, email].some((field) => field?.trim() == "")) {
    throw new ApiError(400, "All fileds are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(400, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar || !avatar.url) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary");
  }

  const user = await User.create({
    username,
    email,
    password,
    avatar: avatar.url,
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "user registered successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "user does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefershToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  console.log("User logged out successfully");

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getUserQuizes = asyncHandler(async (req, res) => {
  const userWithQuizes = await User.findById(req.user._id)
    .select("userQuizes")
    .populate({
      path: "userQuizes",
      options: {
        sort: { lastAttempted: -1 },
      },
    });

  if (!userWithQuizes) {
    throw new ApiError(404, "No user logged in!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userWithQuizes, "all quizes fetched successfully!")
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "user not found!");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(404, "invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully!"));
});

const changeUserDetails = asyncHandler(async (req, res) => {
  const { email, username } = req.body;

  if (!email && !username) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "at least one field(email or username) is required"
        )
      );
  }

  const updateFields = {};
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Please provide a valid email address")
        );
    }
    updateFields.email = email.toLowerCase();
  }

  if (username) {
    if (username.length < 3) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Username must be at least 3 characters long"
          )
        );
    }
    updateFields.username = username.toLowerCase();
  }

  if (updateFields.email) {
    const existingEmail = await User.findOne({
      email: updateFields.email,
      _id: { $ne: req.user._id },
    });
    if (existingEmail) {
      return res
        .status(409)
        .json(new ApiResponse(409, null, "Email is already taken"));
    }
  }

  if (updateFields.username) {
    const existingUsername = await User.findOne({
      username: updateFields.username,
      _id: { $ne: req.user._id },
    });

    if (existingUsername) {
      return res
        .status(409)
        .json(new ApiResponse(409, null, "Username is already taken"));
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: updateFields,
    },
    {
      new: true,
      select: "-password -refreshToken",
    }
  );

  if (!updatedUser) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "user details updated successfully!")
    );
});

const changeAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.files?.avatar[0].path;
  // console.log("Request files:", req.files?.avatar[0].path);

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "error while uploading on cloudinary");
  }

  const getCurrentUser = await User.findById(req.user._id).select("-password");
  if (!getCurrentUser) {
    throw new ApiError(401, "Not getting current user!!!");
  }
  const avatarArrLastIndex = getCurrentUser.avatar.split("/").length - 1; // getting the last element of the array because publicId of the old avatar is present at last element of the array
  const publicIdOfCloudinaryImage = getCurrentUser.avatar
    .split("/")
    [avatarArrLastIndex].split(".")[0]; // getting the publicId of the old avatar
  const deleteOldAvatar = await deleteFromCloudinary(publicIdOfCloudinaryImage);
  if (!deleteOldAvatar) {
    throw new ApiError(500, "The old avatar is not deleted yet!!!");
  }

  if (!avatar.url) {
    throw new ApiError(400, "error while uploading  on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserQuizes,
  changePassword,
  changeUserDetails,
  changeAvatar,
};
