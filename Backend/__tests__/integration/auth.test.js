const request = require("supertest")
const app = require("../../src/app")
const userModel = require("../../src/models/user.model")

describe("Auth Integration Tests", () => {
    
    const testUser = {
        username: "testuser",
        email: "test@example.com",
        password: "Password123!"
    }

    test("POST /api/auth/register - success", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send(testUser)

        expect(res.statusCode).toBe(201)
        expect(res.body.message).toContain("Registration completely successful")
        
        const user = await userModel.findOne({ email: testUser.email })
        expect(user).toBeDefined()
        expect(user.username).toBe(testUser.username)
    })

    test("POST /api/auth/login - failure (wrong password)", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: testUser.email,
                password: "WrongPassword"
            })

        expect(res.statusCode).toBe(400)
    })

    test("GET /api/auth/get-me - failure (no token)", async () => {
        const res = await request(app).get("/api/auth/get-me")
        expect(res.statusCode).toBe(401)
    })

    test("GET /api/auth/logout - success", async () => {
        const res = await request(app).get("/api/auth/logout")
        expect(res.statusCode).toBe(200) // Logout usually returns 200 and clears cookie
    })
})
