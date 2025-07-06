import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";

export const hashPassword = async (plainPassword: string): Promise<string> => {
  return await bcrypt.hash(plainPassword, 10);
};

export const comparePassword = async (
  input: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(input, hash);
};

export const createToken = (payload: object): string => {
  return generateToken(payload);
};
