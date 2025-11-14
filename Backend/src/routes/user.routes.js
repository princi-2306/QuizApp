import { Router } from "express";
import {
  logoutUser,
  registerUser,
  loginUser,
  getUserQuizes,
  changePassword,
  changeUserDetails,
  changeAvatar,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/allQuizes").get(verifyJWT, getUserQuizes);
router.route("/change-password").put(verifyJWT, changePassword);
router.route("/change-details").post(verifyJWT, changeUserDetails);
router.route("/update-avatar").patch(
  verifyJWT,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  changeAvatar
);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
