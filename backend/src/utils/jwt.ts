import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserPayload } from '../types';

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as any);
};

export const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, config.jwt.secret) as UserPayload;
};
