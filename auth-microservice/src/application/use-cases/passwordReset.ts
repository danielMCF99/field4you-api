import { IUserRepository } from '../../domain/interfaces/UserRepository';

export const passwordReset = async (
  email: string,
  newPassword: string,
  passwordResetToken: string,
  repository: IUserRepository
): Promise<{ status: number; message: string }> => {
  try {
    // Find user by email
    const user = await repository.findByEmail(email);

    if (!user) {
      return {
        status: 404,
        message: 'User with given email not found',
      };
    }

    // If user not found return 404 status with customized message
    const userResetPasswordToken = user.resetPasswordToken;

    // Check if user is able to perform password recovery
    if (
      !userResetPasswordToken ||
      userResetPasswordToken != passwordResetToken
    ) {
      return {
        status: 401,
        message: 'Invalid information sent for given user to reset password',
      };
    }

    if (
      !user.resetPasswordExpires ||
      Date.now() > user.resetPasswordExpires.getTime()
    ) {
      return {
        status: 401,
        message: 'Token validation for password recovery has expired',
      };
    }

    // Update user with new password
    await repository.update(user.getId(), { password: newPassword });
    console.log('Updated user password');

    return {
      status: 200,
      message: 'Password reset successfull',
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: 'Something went wrong with password reset',
    };
  }
};
