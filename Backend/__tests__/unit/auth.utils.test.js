const bcrypt = require("bcryptjs")

describe("password hashing", () => {

  test("bcrypt hash is not equal to plain text", async () => {
    const plain = "MyPass@123"
    const hash = await bcrypt.hash(plain, 10)
    expect(hash).not.toBe(plain)
  })

  test("bcrypt compare returns true for correct password", async () => {
    const plain = "MyPass@123"
    const hash = await bcrypt.hash(plain, 10)
    const result = await bcrypt.compare(plain, hash)
    expect(result).toBe(true)
  })

  test("bcrypt compare returns false for wrong password", async () => {
    const hash = await bcrypt.hash("MyPass@123", 10)
    const result = await bcrypt.compare("WrongPass@123", hash)
    expect(result).toBe(false)
  })

})
