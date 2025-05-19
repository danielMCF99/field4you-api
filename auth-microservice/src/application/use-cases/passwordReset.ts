import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { authRepository } from '../../app';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';

export const passwordReset = async (req: Request): Promise<string> => {
  let { email, password, token } = req.body;

  console.log(req.body);
  if (!email || !password) {
    throw new BadRequestException(
      'Missing fields for user password reset. Please try again.'
    );
  }

  if (!token) {
    throw new InternalServerErrorException(
      'Unable to retrieve password reset token.'
    );
  }

  // Find user by email
  const auth = await authRepository.findByEmail(email);

  if (!auth) {
    throw new NotFoundException('User with given email not found.');
  }

  if (token != auth.resetPasswordToken) {
    throw new BadRequestException('Invalid password reset code');
  }

  if (
    !auth.resetPasswordExpires ||
    Date.now() > auth.resetPasswordExpires.getTime()
  ) {
    throw new UnauthorizedException(
      'Token validation for password recovery has expired'
    );
  }

  // Update user with new password
  await authRepository.update(auth.getId(), {
    password: await bcrypt.hash(password, 10),
  });

  return 'Password reset successfull';
};
