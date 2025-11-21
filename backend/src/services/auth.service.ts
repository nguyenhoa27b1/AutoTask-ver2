import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { AppError } from '../utils/errorHandler';

const client = new OAuth2Client(config.google.clientId);

class AuthService {
  // Verify Google ID Token and authenticate user
  async googleLogin(idToken: string) {
    try {
      // Verify token with Google
      const ticket = await client.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new AppError('Invalid Google token', 401);
      }

      const { sub: googleId, email, name, picture } = payload;

      if (!email) {
        throw new AppError('Email not found in Google account', 400);
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Auto-create user but keep inactive (need admin approval)
        user = await prisma.user.create({
          data: {
            googleId,
            email,
            name,
            avatar: picture,
            role: 'USER',
            isActive: false,
          },
        });

        return {
          message: 'Account created. Please wait for admin approval.',
          needsApproval: true,
        };
      }

      // Update Google ID and profile if changed
      if (user.googleId !== googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            name,
            avatar: picture,
          },
        });
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AppError('Your account is inactive. Please contact admin for access.', 403);
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          score: user.score,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to authenticate with Google', 401);
    }
  }
}

export default new AuthService();
