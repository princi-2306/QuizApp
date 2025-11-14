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
  const { username, email, password } = req.body; // req.body is an object, possibly from a server response containing properties like username, email and password.
  // The { username, email, password } syntax pulls these specific properties out of req.body and assigns them directly to new variables with the same names.
  // Now, username, email and password are individual constants containing the values from req.body.

  if (
    // some is the method on array on which we can check any condition on each element of the array and according to the codition it will return true or false.
    [username, email, password].some((feild) => feild?.trim() === "") // In the some() method this statement(feild?.trim() === "") means if feild is present then trim it then check if it is equals to "" => output will be boolean
  ) {
    throw new ApiError(400, "All feilds are required");
  }
  // checking weather is user is existing or not
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with same Username or Email, already exists");
  }

  // uploading the avatar
  const avatarLocalPath = [req.files?.avatar[0]?.buffer];
  if (!avatarLocalPath) {
    throw new ApiError(400, "Please upload an Avatar");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // creating the user on database
  const user = await User.create({
    username: username.toLowerCase(),
    avatar: avatar[0].url,
    email: email,
    password: password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  } else {
    console.log("The User is Created with the username :", user.username);
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
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
  // Get the buffer directly, don't wrap in an array
  const avatarBuffer = req.files?.avatar?.[0]?.buffer;

  if (!avatarBuffer) {
    throw new ApiError(400, "Invalid provided path of the avatar");
  }

  console.log("HI2 : ", avatarBuffer);

  // Upload the avatar to Cloudinary
  const avatar = await uploadOnCloudinary([avatarBuffer]); // Pass buffer as array

  console.log("HI : ", avatar);

  if (!avatar || !avatar[0]?.url) {
    throw new ApiError(400, "Error while uploading the avatar");
  }

  // Delete the old avatar of the user
  const getCurrentUser = await User.findById(req.user._id).select("-password");

  if (!getCurrentUser) {
    throw new ApiError(401, "Not getting current user!!!");
  }

  const avatarArrLastIndex = getCurrentUser.avatar.split("/").length - 1;
  const publicIdOfCloudinaryImage = getCurrentUser.avatar
    .split("/")
    [avatarArrLastIndex].split(".")[0];

  const deleteOldAvatar = await deleteFromCloudinary(publicIdOfCloudinaryImage);

  if (!deleteOldAvatar) {
    throw new ApiError(500, "The old avatar is not deleted yet!!!");
  }

  // Update user's avatar
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar[0].url } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Avatar updated Successfully"));
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
