import { z } from "zod";

export const createUser = z.object({
  username: z.string().min(3).max(20),
  password: z
    .string()
    .min(5)
    .max(20)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
  name: z.string(),
});

export const SigninSchema = z.object({
  username: z.string().min(3).max(20),
  password: z
    .string()
    .min(5)
    .max(20)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(3).max(20),
});
