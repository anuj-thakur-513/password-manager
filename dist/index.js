"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.configDotenv({
    path: "./.env",
});
const db_1 = __importDefault(require("./services/db"));
const server_1 = __importDefault(require("./server"));
(0, db_1.default)()
    .then(() => {
    const PORT = process.env.PORT || 8000;
    server_1.default.listen(PORT, () => {
        console.log(`server started on PORT ${PORT}`);
    });
})
    .catch((err) => {
    console.log(`Error connecting to DB: ${err}`);
});
