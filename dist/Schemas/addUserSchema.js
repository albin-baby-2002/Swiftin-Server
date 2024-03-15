"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserSchema = void 0;
const zod_1 = require("zod");
exports.AddUserSchema = zod_1.z.object({
    email: zod_1.z.string().email("Enter a valid email"),
    username: zod_1.z.string().min(5, "user name should have min 5 character"),
    phone: zod_1.z
        .string()
        .refine((value) => {
        if (!value)
            return true;
        const IND_PHONE_REGEX = /^(\+91[\-\s]?)?[6789]\d{9}$/;
        return IND_PHONE_REGEX.test(value);
    }, "Invalid phone . It Should be 10 digits")
        .optional(),
    password: zod_1.z
        .string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: "minimum 8 char & min one (uppercase & lowercase letter, special char & number)",
    }),
});
