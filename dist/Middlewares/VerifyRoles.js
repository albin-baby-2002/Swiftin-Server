"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const statusCodes_1 = require("../Enums/statusCodes");
const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        var _a;
        if (!((_a = req === null || req === void 0 ? void 0 : req.userInfo) === null || _a === void 0 ? void 0 : _a.roles)) {
            return res.sendStatus(statusCodes_1.HTTP_STATUS_CODES.UNAUTHORIZED);
        }
        const rolesArray = [...allowedRoles];
        const result = req.userInfo.roles.some((role) => rolesArray.includes(role));
        if (!result) {
            return res.sendStatus(statusCodes_1.HTTP_STATUS_CODES.UNAUTHORIZED);
        }
        // If the control reaches here, it means the user has the required role
        next();
    };
};
exports.default = verifyRoles;
