"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allowedOrigins_1 = require("./allowedOrigins");
const corsOptions = {
    // need to remove the origin == undefined while using in production
    origin: (origin, callback) => {
        if ((origin && allowedOrigins_1.allowedOrigins.indexOf(origin) !== -1) ||
            origin == undefined) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by Cors"), false);
        }
    },
    credentials: true, // Allow credentials (e.g., cookies)
    optionsSuccessStatus: 204, // Respond 204 No for successful preflight req
};
exports.default = corsOptions;
