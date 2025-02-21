"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function asyncHandler(asyncFunction) {
    return function (req, res, next) {
        asyncFunction(req, res, next).catch(next);
    };
}
exports.default = asyncHandler;
