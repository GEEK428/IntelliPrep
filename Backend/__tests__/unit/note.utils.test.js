const DOMPurify = require("isomorphic-dompurify")

function sanitizeHtml(html = "") {
  return DOMPurify.sanitize(String(html || ""))
}

describe("sanitizeHtml", () => {

  test("removes script tags", () => {
    const input = '<div>Hello</div><script>alert("XSS")</script>'
    const output = sanitizeHtml(input)
    expect(output).toBe('<div>Hello</div>')
    expect(output).not.toContain("<script>")
  })

  test("handles empty input", () => {
    expect(sanitizeHtml("")).toBe("")
    expect(sanitizeHtml(null)).toBe("")
  })

})
