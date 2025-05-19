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
  const token = await jwtHelper.generatePasswordResetCode();

  const newResetPasswordToken = token;
  const newResetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  // Updated given user fields related to password recovery
  await authRepository.update(auth.getId(), {
    password: 'shouldBeRandomString',
    resetPasswordToken: newResetPasswordToken,
    resetPasswordExpires: newResetPasswordExpires,
  });

  await mailer.sendMail(
    email,
    'Password recovery for Field4You App',
    `You requested a password reset. 
    Please paste the following code: ${token}
    Do not share this code!`
  );

  return 'Successfully sent email for password recovery to user';
};
