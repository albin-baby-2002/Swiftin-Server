import { z } from "zod";

export const RegisterUserSchema = z.object({
  email: z.string().email("Enter a valid email"),
  username: z.string().min(5, "user name should have min 5 character"),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "minimum 8 char & min one (uppercase & lowercase letter, special char & number)",
      }
    ),
});
