const mongoose = require('mongoose')


const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [ true, "token is required to be added in blacklist" ]
    }
}, {
    timestamps: true
})

// Fast lookup for authMiddleware's findOne({ token }) — called on every authenticated request
blacklistTokenSchema.index({ token: 1 })
// Auto-delete expired tokens after 24 hours — keeps the collection small forever
blacklistTokenSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 86400 }  // 86400 = 24 hours
)

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)


module.exports = tokenBlacklistModel