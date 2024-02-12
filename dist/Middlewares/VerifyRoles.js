"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        var _a;
        if (!((_a = req === null || req === void 0 ? void 0 : req.userInfo) === null || _a === void 0 ? void 0 : _a.roles)) {
            return res.sendStatus(401);
        }
        const rolesArray = [...allowedRoles];
        const result = req.userInfo.roles.some((role) => rolesArray.includes(role));
        if (!result) {
            return res.sendStatus(401);
        }
        // If the control reaches here, it means the user has the required role
        next();
    };
};
exports.default = verifyRoles;
