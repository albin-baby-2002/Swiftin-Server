"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserSchema = void 0;
const zod_1 = require("zod");
exports.RegisterUserSchema = zod_1.z.object({
    email: zod_1.z.string().email("Enter a valid email"),
    username: zod_1.z.string().min(5, "user name should have min 5 character"),
    password: zod_1.z
        .string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: "minimum 8 char & min one (uppercase & lowercase letter, special char & number)",
    }),
});
