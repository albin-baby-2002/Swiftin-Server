import { z } from "zod";

export const EditUserSchema = z.object({
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
});
