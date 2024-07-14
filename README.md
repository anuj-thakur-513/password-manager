# Password Manager [Backend]

![](/github_assets/password-manager.png)

It is a backend service for storing passwords of different users of different websites

## 3RE Architecture

![](/github_assets/3re-architecture.png)

## Run Locally

Clone the Project

```bash
git clone https://github.com/anuj-thakur-513/password-manager.git
```

Go to Project Directory

```bash
cd password-manager
```

Install Dependencies

```bash
npm install
```

Build Project

```bash
npm run build-ts
```

Start the Project

```bash
npm start
```

## Environment Variables

Change the `.env.example` file to `.env` and change the variable names accordingly

`PORT=8000`

`MONGO_URI=''`

`JWT_SECRET=''`

`ACCESS_TOKEN_EXPIRY='2d'`

`REFRESH_TOKEN_EXPIRY='30d'`

`BASE_URL=''`

`REDIS_HOST=''`

`REDIS_PORT=''`

`REDIS_USER=''`

`REDIS_PASSWORD=''`

## Project Directory Structure

```
.
├── src
│   ├── config
│   │   ├── cookiesConfig.ts
│   │   └── keys.ts
│   ├── controllers
│   │   ├── password
│   │   │   └── passwordController.ts
│   │   └── user
│   │       └── userController.ts
│   ├── core
│   │   ├── ApiError.ts
│   │   └── ApiResponse.ts
│   ├── middlewares
│   │   ├── authMiddleware.ts
│   │   └── rateLimiter.ts
│   ├── models
│   │   ├── passwords.ts
│   │   └── user.ts
│   ├── routes
│   │   ├── password
│   │   │   └── passwordRoutes.ts
│   │   ├── user
│   │   │   └── userRoutes.ts
│   │   └── version1.ts
│   ├── services
│   │   ├── db.ts
│   │   └── redis.ts
│   ├── types
│   │   ├── asyncFunction.ts
│   │   ├── express.d.ts
│   │   ├── jwtPayload.ts
│   │   ├── password.ts
│   │   ├── tokens.ts
│   │   ├── userSchema.ts
│   │   └── userWithSensitiveInfo.ts
│   ├── utils
│   │   ├── asyncHandler.ts
│   │   └── generateToken.ts
│   ├── constants.ts
│   ├── index.ts
│   └── server.ts
├── README.md
├── package-lock.json
├── package.json
└── tsconfig.json
```

## Find this project useful ? ❤️

Support it by clicking the 🌟 button on the upper right of this page. ❤️

## Tech Stack

Typescript

Node.js

Express.js

MongoDB

Redis

## License

```
MIT License

Copyright (c) 2024 Anuj Thakur

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
