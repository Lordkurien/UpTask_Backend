import User from "../models/User.js";
import createId from "../helpers/createId.js";
import generateJWT from "../helpers/generateJWT.js";
import { registeredEmail, emailForgetPassword } from "../helpers/email.js";

const registerUser = async (req, res) => {
    const { email } = req.body;
    const userExits = await User.findOne({ email });

    if (userExits) {
        const error = new Error("User Register");
        return res.status(400).json({ msg: error.message });
    };

    try {
        const user = new User(req.body);
        user.token = createId();
        await user.save();

        registeredEmail({
            email: user.email,
            name: user.name,
            token: user.token
        });

        res.json({msg: "The user has been created. Please, confirm your account"});

    } catch (error) {
        console.log(error);
    };
};

const authenticate = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error("User does not exist");
        return res.status(404).json({ msg: error.message });

    };

    if (!user.confirmed) {
        const error = new Error("User has not been confirmed");
        return res.status(403).json({ msg: error.message });
    };

    if (await user.checkPassword(password)) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateJWT(user._id),
        });
    } else {
        const error = new Error("Password incorrect");
        return res.status(403).json({ msg: error.message });
    };
};

const confirm = async (req, res) => {
    const { token } = req.params;
    const userConfirm = await User.findOne({ token });

    if (!userConfirm) {
        const error = new Error("Invalid Token");
        return res.status(403).json({ msg: error.message });
    };

    try {
        userConfirm.confirmed = true;
        userConfirm.token = "";
        await userConfirm.save();
        res.json({ msg: "Confirmed User Successfully" });
    } catch (error) {
        console.log(error);
    };
};

const forgetPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error("User does not exist");
        return res.status(404).json({ msg: error.message });
    };

    try {
        user.token = createId();
        await user.save();

        emailForgetPassword({
            email: user.email,
            name: user.name,
            token: user.token
        })

        res.json({ msg: "We have sent an email with the instructions" });
    } catch (error) {
        console.log(error);
    };
};

const checkPassword = async (req, res) => {
    const { token } = req.params;
    const validToken = await User.findOne({ token });

    if (validToken) {
        res.json({ msg: "Valid Token" });
    } else {
        const error = new Error("Invalid Token");
        return res.status(404).json({ msg: error.message });
    };
};

const newPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({ token });

    if (user) {
        user.password = password;
        user.token = "";
        
        try {
            await user.save();
            res.json({ msg: "Password Changed Correctly" });
        } catch (error) {
            console.log(error);
        };

    } else {
        const error = new Error("Invalid Token");
        return res.status(404).json({ msg: error.message });
    };
};

const profile = async (req, res) => {
    const { user } = req;

    res.json(user);
};

export { registerUser, authenticate, confirm, forgetPassword, checkPassword, newPassword, profile };