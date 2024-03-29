"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSchema = void 0;
const zod_1 = require("zod");
exports.authSchema = zod_1.z.object({
    email: zod_1.z.string().email("Enter a valid email"),
    password: zod_1.z.string().min(8, "Password should be at least 8 character long"),
});
