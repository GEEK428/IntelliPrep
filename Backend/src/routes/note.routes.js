const { Router } = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const noteController = require("../controllers/note.controller")
const upload = require("../middlewares/file.middleware")

const noteRouter = Router()

noteRouter.post("/", authMiddleware.authUser, noteController.createNoteController)
noteRouter.get("/", authMiddleware.authUser, noteController.getNotesController)

// Due notes for spaced repetition review — must be before /:noteId
noteRouter.get("/due", authMiddleware.authUser, async (req, res) => {
    const { noteModel } = require("../models/note.model")
    const notes = await noteModel.find({
        user: req.user.id,
        spacedRepetitionDueAt: { $lte: new Date() }
    }).sort({ spacedRepetitionDueAt: 1 }).limit(20)

    return res.status(200).json({ message: "Due notes fetched.", notes })
})

noteRouter.patch("/:noteId", authMiddleware.authUser, noteController.updateNoteController)
noteRouter.delete("/:noteId", authMiddleware.authUser, noteController.deleteNoteController)
noteRouter.post("/export/pdf", authMiddleware.authUser, noteController.exportNotesPdfController)
noteRouter.post("/ai-answer", authMiddleware.authUser, noteController.generateAiAnswerController)
noteRouter.post("/import/pdf", authMiddleware.authUser, upload.single("file"), noteController.importNoteFromPdfController)

module.exports = noteRouter
