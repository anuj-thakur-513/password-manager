"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiResponse {
    constructor(data, message = "Success") {
        this.data = data;
        this.message = message;
    }
}
exports.default = ApiResponse;
