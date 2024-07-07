import UserWithSensitiveInfo from "./userWithSensitiveInfo";
declare module "express-serve-static-core" {
  interface Request {
    user?: UserWithSensitiveInfo;
  }
}
