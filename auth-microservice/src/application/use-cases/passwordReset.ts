import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { userRepository } from '../../app';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export const passwordReset = async (req: Request): Promise<string> => {
  let { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestException(
      'Missing fields for user password reset. Please try again.'
    );
  }

  // Extract passwordResetToken from URL
  const passwordResetToken = req.url.split('/').pop();
  if (!passwordResetToken) {
    throw new InternalServerErrorException(
      'Unable to retrieve password reset token.'
    );
  }

  // Find user by email
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new NotFoundException('User with given email not found.');
  }

  // If user not found return 404 status with customized message
  const userResetPasswordToken = user.resetPasswordToken;

  // Check if user is able to perform password recovery
  if (!userResetPasswordToken || userResetPasswordToken != passwordResetToken) {
    throw new UnauthorizedException(
      'Invalid information sent for given user to reset password'
    );
  }

  if (
    !user.resetPasswordExpires ||
    Date.now() > user.resetPasswordExpires.getTime()
  ) {
    throw new UnauthorizedException(
      'Token validation for password recovery has expired'
    );
  }

  // Update user with new password
  await userRepository.update(user.getId(), {
    password: await bcrypt.hash(password, 10),
  });

  return 'Password reset successfull';
};
