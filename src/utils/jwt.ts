import jwt, { Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "secreto";

export const generateToken = (
  payload: string | object | Buffer,
  expiresIn: string = "2h"
): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyTokenJWT = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
