import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import axios from "axios";
import { User } from "../../domain/entities/User";
import { registerUser } from "../../application/use-cases/registerUser";
import { loginUser } from "../../application/use-cases/loginUser";
import { passwordReset } from "../../application/use-cases/passwordReset";
import { passwordRecovery } from "../../application/use-cases/passwordRecovery";
import { userRepository, jwtHelper, mailer } from "../../app";
import config from "../../config/env";
import mongoose from "mongoose";
import { deleteUser } from "../../application/use-cases/deleteUser";

export const registerUserController = async (req: Request, res: Response) => {
  let { userType, email, password, firstName, lastName, birthDate } = req.body;

  // Validate request sent for any necessary fields missing
  if (
    !userType ||
    !password ||
    !email ||
    !firstName ||
    !lastName ||
    !birthDate
  ) {
    res.status(400).json({ message: "Bad Request for User creation" });
    return;
  }

  // Encrypt password
  password = await bcrypt.hash(password, 10);
  const registerDate = new Date();
  const lastAccessDate = new Date();

  try {
    const userRequest = new User({
      userType,
      email,
      password,
      firstName,
      lastName,
      birthDate,
      registerDate,
      lastAccessDate,
    });
    const newUser = await registerUser(userRequest, userRepository);

    if (!newUser) {
      res.status(500).json({
        message: "Something went wrong for new user registration",
      });
      return;
    }

    // Send request to create equivalent user in user-microservice
    try {
      await axios
        .post(config.userGatewayServiceUri + "/create", {
          authServiceUserId: newUser.getId(),
          userType: userType,
          email: email,
          firstName: firstName,
          lastName: lastName,
          birthDate: birthDate,
          registerDate: registerDate,
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({
            message:
              "Something went wrong for new user registration in user-service",
          });
          return;
        });
    } catch (erro: any) {
      res.status(500).json({
        message:
          "Something went wrong for new user registration in user-service",
      });
      return;
    }

    // Generate JWT Token
    const token = await jwtHelper.generateToken(
      newUser.getId(),
      newUser.userType.toString(),
      newUser.email
    );

    res.status(200).json({
      message: "Successfully registered the user.",
      token: token,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const loginUserController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and Password are required" });
    return;
  }

  try {
    const { success, status, message, userId, userType } = await loginUser(
      email,
      password,
      userRepository
    );

    if (!success || !userId || !userType) {
      res.status(status).json({ message: message });
      return;
    }
    // Generate JWT Token
    const token = await jwtHelper.generateToken(
      userId,
      userType.toString(),
      email
    );
    res.status(status).json({
      message: "Login was successfull.",
      token: token,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
    return;
  }
};

export const passwordRecoveryController = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  try {
    const { status, message } = await passwordRecovery(
      email,
      userRepository,
      mailer
    );

    res.status(status).json({ message: message });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
    return;
  }
};

export const passwordResetController = async (req: Request, res: Response) => {
  let { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and Password are required" });
    return;
  }

  // Extract passwordResetToken from URL
  const passwordResetToken = req.url.split("/").pop();
  if (!passwordResetToken) {
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }

  try {
    password = await bcrypt.hash(password, 10);
    const { status, message } = await passwordReset(
      email,
      password,
      passwordResetToken,
      userRepository
    );

    res.status(status).json({ message: message });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
    return;
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  const id = req.params.id.toString();
  const token = await jwtHelper.extractBearerToken(req);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid ID format" });
    return;
  }

  if (!token) {
    res.status(401).json({ message: "Bearer token required" });
    return;
  }

  try {
    const { status, message } = await deleteUser(id, token, userRepository);
    res.status(status).json({ message: message });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Authentication failed",
    });
    return;
  }
};
