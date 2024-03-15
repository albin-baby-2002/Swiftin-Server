import { z } from "zod";

export const AddUserSchema = z.object({
  email: z.string().email("Enter a valid email"),
  username: z.string().min(5, "user name should have min 5 character"),
  phone: z
    .string()
    .refine((value) => {
      if (!value) return true;
      const IND_PHONE_REGEX = /^(\+91[\-\s]?)?[6789]\d{9}$/;
      return IND_PHONE_REGEX.test(value);
    }, "Invalid phone . It Should be 10 digits")
    .optional(),
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
