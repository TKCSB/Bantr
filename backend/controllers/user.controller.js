import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("jwt",{
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
    });
    res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      console.log("Invalid Credentials");
      res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "6d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 6 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const signupUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if ((!username && username.trim() === "") || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "6d",
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 6 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const editUser = async (req, res) => {
  try {
    const {profilePic} = req.body;
    const userId = req.user._id;

    if(!profilePic){
      console.log("All fields are required");
      
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({
        message: "User not found",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {profilePic}, {new: true});
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
    
  }
};

const getUser = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export { loginUser, signupUser, logoutUser, editUser, getUser };
