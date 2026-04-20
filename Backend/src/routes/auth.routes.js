const { Router } = require('express')
const { z } = require("zod")
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const forgotPasswordRateLimit = require("../middlewares/forgotPasswordRateLimit.middleware")
const validate = require("../middlewares/validate.middleware")

// ── Zod schemas for input validation ────────────────────────────────
const passwordRule = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password needs an uppercase letter")
    .regex(/[a-z]/, "Password needs a lowercase letter")
    .regex(/\d/, "Password needs a number")
    .regex(/[^A-Za-z\d]/, "Password needs a special character")

const registerSchema = z.object({
    username: z.string().min(1, "Username is required").max(30),
    email: z.string().email("Invalid email format"),
    password: passwordRule
})

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
})

const authRouter = Router()

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", validate(registerSchema), authController.registerUserController)


/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */
authRouter.post("/login", validate(loginSchema), authController.loginUserController)

/**
 * @route POST /api/auth/google
 * @description login/register user using Google credential token
 * @access Public
 */
authRouter.post("/google", authController.googleAuthController)

/**
 * @route POST /api/auth/forgot-password
 * @description request reset-password email for local account.
 * @access Public
 */
authRouter.post("/forgot-password", forgotPasswordRateLimit, authController.forgotPasswordController)

/**
 * @route GET /api/auth/reset-password/:token/verify
 * @description verify reset token validity.
 * @access Public
 */
authRouter.get("/reset-password/:token/verify", authController.verifyResetTokenController)

/**
 * @route POST /api/auth/reset-password/:token
 * @description reset user password using valid token.
 * @access Public
 */
authRouter.post("/reset-password/:token", authController.resetPasswordController)

/**
 * @route GET /api/auth/verify-email/:token
 * @description verify user email with token from verification email.
 * @access Public
 */
authRouter.get("/verify-email/:token", authController.verifyEmailController)


/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
authRouter.get("/logout", authController.logoutUserController)


/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)

/**
 * @route PATCH /api/auth/settings
 * @description update current user settings
 * @access private
 */
authRouter.patch("/settings", authMiddleware.authUser, authController.updateSettingsController)

/**
 * @route PATCH /api/auth/change-password
 * @description change password for current user.
 * @access private
 */
authRouter.patch("/change-password", authMiddleware.authUser, authController.changePasswordController)

/**
 * @route DELETE /api/auth/delete-account
 * @description delete current user account.
 * @access private
 */
authRouter.delete("/delete-account", authMiddleware.authUser, authController.deleteAccountController)


module.exports = authRouter
