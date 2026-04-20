const { buildFallbackInterviewReport } = require("../../src/controllers/interview.controller")

describe("buildFallbackInterviewReport", () => {

  test("generates report with target role title", () => {
    const jd = "Software Engineer at Google\nFull time"
    const report = buildFallbackInterviewReport({ jobDescription: jd })
    
    expect(report.title).toBe("Software Engineer at Google")
    expect(report.matchScore).toBe(60)
    expect(report.technicalQuestions.length).toBeGreaterThan(0)
  })

  test("handles empty job description", () => {
    const report = buildFallbackInterviewReport({ jobDescription: "" })
    expect(report.title).toBe("Target Role")
  })

})
