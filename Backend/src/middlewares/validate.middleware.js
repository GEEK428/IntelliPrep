const { z } = require("zod")

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * On failure, returns 400 with the first validation error message.
 * On success, replaces req.body with the coerced, stripped data and calls next().
 *
 * Usage:  router.post("/route", validate(mySchema), controller)
 */
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body)
        if (!result.success) {
            const message = result.error.errors[0]?.message || "Invalid input."
            return res.status(400).json({ message })
        }
        req.body = result.data  // use coerced, stripped data
        next()
    }
}

module.exports = validate
