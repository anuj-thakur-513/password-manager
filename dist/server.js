"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const version1_1 = __importDefault(require("./routes/version1"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const sendEmails_1 = __importDefault(require("./utils/sendEmails"));
const Redis_1 = __importDefault(require("./services/Redis"));
const app = (0, express_1.default)();
const redis = Redis_1.default.getInstance();
redis.ping().then((res) => {
    console.log(`Redis Connected PING:${res}`);
});
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "50kb" }));
app.use(express_1.default.urlencoded({ extended: false, limit: "50kb" }));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
app.use(errorHandler_1.default);
app.get("/", (req, res) => {
    res.send("<h1>API is up and working fine</h1>");
});
// setImmediate to send emails in the background
(0, sendEmails_1.default)(redis);
// routes are initialized through this
app.use("/api/v1", version1_1.default);
exports.default = app;
