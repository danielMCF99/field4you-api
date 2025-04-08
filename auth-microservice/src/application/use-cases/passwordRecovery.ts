import { Request } from 'express';
import { jwtHelper, mailer, userRepository } from '../../app';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';

export const passwordRecovery = async (req: Request): Promise<string> => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestException(
      'Missing fields for user password recovery. Please try again.'
    );
  }

  try {
    // Find user by email
    const user = await userRepository.findByEmail(email);

    // If user not found return 404 status with customized message
    if (!user) {
      throw new NotFoundException('User with given email not found.');
    }

    // Generate token for the password recovery
    const token = await jwtHelper.generateToken(
      user.getId(),
      user.email,
      user.userType.toString()
    );

    const newResetPasswordToken = token;
    const newResetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Updated given user fields related to password recovery
    await userRepository.update(user.getId(), {
      password: 'shouldBeRandomString',
      resetPasswordToken: newResetPasswordToken,
      resetPasswordExpires: newResetPasswordExpires,
    });

    const resetURL = `http://localhost:3000/api/auth/reset-password/${token}`;

    await mailer.sendMail(
      email,
      'Password recovery for Field4You App',
      `You requested a password reset. Click the link to reset your password: ${resetURL}`
    );

    return 'Successfully sent email for password recovery to user';
  } catch (error: any) {
    throw new InternalServerErrorException(error.message);
  }
};
