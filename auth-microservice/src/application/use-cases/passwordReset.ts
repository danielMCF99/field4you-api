import { Request } from 'express';
import bcrypt from 'bcryptjs';
import { BadRequestException } from '../../domain/exceptions/BadRequestException';
import { InternalServerErrorException } from '../../domain/exceptions/InternalServerErrorException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { userRepository } from '../../app';

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

  try {
    // Find user by email
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User with given email not found.');
    }

    // If user not found return 404 status with customized message
    const userResetPasswordToken = user.resetPasswordToken;

    // Check if user is able to perform password recovery
    if (
      !userResetPasswordToken ||
      userResetPasswordToken != passwordResetToken
    ) {
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
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      throw new NotFoundException(error.message);
    } else if (error instanceof UnauthorizedException) {
      throw new UnauthorizedException(error.message);
    } else {
      throw new InternalServerErrorException(error.message);
    }
  }
};
