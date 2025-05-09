import { Request } from 'express';
import { authRepository, jwtHelper, mailer } from '../../app';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';

export const passwordRecovery = async (req: Request): Promise<string> => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestException(
      'Missing fields for user password recovery. Please try again.'
    );
  }

  // Find user by email
  const auth = await authRepository.findByEmail(email);

  // If user not found return 404 status with customized message
  if (!auth) {
    throw new NotFoundException('User with given email not found.');
  }

  // Generate token for the password recovery
  const token = await jwtHelper.generateToken(
    auth.getId(),
    auth.email,
    auth.userType.toString()
  );

  const newResetPasswordToken = token;
  const newResetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  // Updated given user fields related to password recovery
  await authRepository.update(auth.getId(), {
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
};
