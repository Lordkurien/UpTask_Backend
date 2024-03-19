import express from "express";
import {
    registerUser,
    authenticate,
    confirm,
    forgetPassword,
    checkPassword,
    newPassword,
    profile
} from "../controllers/userController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.post("/", registerUser);
router.post("/login", authenticate);
router.get("/confirm/:token", confirm);
router.post("/forget-password", forgetPassword);
router.route("/forget-password/:token").get(checkPassword).post(newPassword);
router.get("/profile", checkAuth, profile);

export default router;

