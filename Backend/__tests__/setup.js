const { MongoMemoryServer } = require("mongodb-memory-server")
const mongoose = require("mongoose")

// Mock DOMPurify to avoid ESM issues in tests
jest.mock("isomorphic-dompurify", () => ({
  sanitize: jest.fn((html) => String(html || "").replace(/<script.*?>.*?<\/script>/gi, ""))
}))

// Mock AI service to avoid real API calls and warnings
jest.mock("../src/services/ai.service", () => ({
  generateInterviewReport: jest.fn(),
  generateNoteAnswer: jest.fn(),
  generateResumePdf: jest.fn(),
  generatePdfFromHtml: jest.fn()
}))

let mongod

// Start in-memory MongoDB before all tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri)
})

// Clean all collections between tests so they don't bleed into each other
afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

// Stop everything after all tests
afterAll(async () => {
  if (mongoose.connection) {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  }
  if (mongod) {
    await mongod.stop()
  }
})
