import crypto from 'crypto';
import { IUserRepository } from '../../domain/interfaces/UserRepository';
import { Mailer } from '../../domain/interfaces/Mailer';

export const passwordRecovery = async (
  email: string,
  repository: IUserRepository,
  mailer: Mailer
): Promise<{
  status: number;
  message: string;
}> => {
  try {
    // Find user by email
    const user = await repository.findByEmail(email);

    // If user not found return 404 status with customized message
    if (!user) {
      return {
        status: 404,
        message: 'User with given email not found',
      };
    }

    // Generate token for the password recovery
    const token = crypto.randomBytes(20).toString('hex');

    const newResetPasswordToken = token;
    const newResetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Updated given user fields related to password recovery
    await repository.update(user.getId(), {
      resetPasswordToken: newResetPasswordToken,
      resetPasswordExpires: newResetPasswordExpires,
    });

    const resetURL = `http://localhost:3000/api/auth/reset-password/${token}`;

    try {
      await mailer.sendMail(
        email,
        `You requested a password reset. Click the link to reset your password: ${resetURL}`
      );

      return {
        status: 200,
        message: 'Successfully sent email for password recovery to user',
      };
    } catch (error) {
      console.error('Error sending email:', error);

      return {
        status: 500,
        message: 'Something went wrong sending the recover password email',
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: 'Something went wrong with password recovery mechanism',
    };
  }
};
