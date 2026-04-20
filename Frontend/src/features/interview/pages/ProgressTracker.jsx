import React, { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"
import "../style/home.scss"
import "../style/progress-tracker.scss"
import {
    createGoal,
    getProgressOverview,
    saveReminders,
    updateGoal
} from "../services/progress.api"
import Sidebar from "../components/Sidebar"
import TopBar from "../components/TopBar"
import Loader from "../../../components/Loader"

function formatDateKey(dateValue) {
    const d = new Date(dateValue)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
}

function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate()
}

const ProgressTracker = () => {
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    const currentYear = new Date().getFullYear()
    const [selectedYear, setSelectedYear] = useState(currentYear)

    const [skillGapSuggestions, setSkillGapSuggestions] = useState([])
    const [goals, setGoals] = useState([])
    const [goalForm, setGoalForm] = useState({ topic: "", durationDays: 7, targetPerDay: 3 })
    const [reminderTime, setReminderTime] = useState("20:00")
    const [reminderType, setReminderType] = useState("both")
    const [stats, setStats] = useState({ goalsSummary: { completed: 0, total: 0 }, completionTrendPercent: 0, heatmap: [], streak: { current: 0, longest: 0 } })

    const [showAllGoals, setShowAllGoals] = useState(false)
    const [showAllCompletedTopics, setShowAllCompletedTopics] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState(null)
    const [tick, setTick] = useState(Date.now())
    const heatmapScrollRef = useRef(null)
    const [heatmapSliderMax, setHeatmapSliderMax] = useState(0)
    const [heatmapSliderValue, setHeatmapSliderValue] = useState(0)
    const [goalsModalPage, setGoalsModalPage] = useState(1);
    const [topicsModalPage, setTopicsModalPage] = useState(1);



    const loadOverview = async (year = selectedYear) => {
        setLoading(true)
        setError("")
        try {
            const response = await getProgressOverview(year)
            setGoals(response?.goals || [])
            setSkillGapSuggestions((response?.skillGapSuggestions || []).slice(0, 7))
            setReminderTime(response?.roadmap?.reminderTime || "20:00")
            setReminderType(response?.roadmap?.reminderType || "both")

            if (response?.stats) setStats(response.stats)
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to load progress tracker.")
        } finally {
            setLoading(false)
        }
    }



    useEffect(() => {
        document.title = "Track Your Progress | IntelliPrep"
        loadOverview(currentYear)
    }, [])

    useEffect(() => {
        loadOverview(selectedYear)
    }, [ selectedYear ])

    useEffect(() => {
        const timer = setInterval(() => setTick(Date.now()), 15000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const syncSliderBounds = () => {
            const el = heatmapScrollRef.current
            if (!el) return
            const max = Math.max(0, el.scrollWidth - el.clientWidth)
            setHeatmapSliderMax(max)
            setHeatmapSliderValue(Math.min(el.scrollLeft, max))
        }

        syncSliderBounds()
        window.addEventListener("resize", syncSliderBounds)
        return () => window.removeEventListener("resize", syncSliderBounds)
    }, [ selectedYear, goals ])





    const visibleGoalTasks = useMemo(() => {
        const now = Date.now()
        return goals
            .filter((goal) => {
                if (goal.status !== "completed") return true
                const completedAt = goal.completedAt ? new Date(goal.completedAt).getTime() : now
                return now - completedAt <= 60 * 1000
            })
            .sort((a, b) => {
                if (a.status === b.status) return new Date(a.deadline) - new Date(b.deadline)
                return a.status === "active" ? -1 : 1
            })
    }, [ goals, tick ])
    const previewGoalTasks = useMemo(() => visibleGoalTasks.slice(0, 3), [ visibleGoalTasks ])

    const completedGoals = useMemo(() => {
        return goals
            .filter((goal) => {
                const total = Math.max(1, Number(goal.targetValue || 1))
                const current = Number(goal.currentProgress || 0)
                return goal.status === "completed" || current >= total
            })
            .map((goal) => ({
                ...goal,
                completedAt: goal.completedAt || goal.updatedAt || goal.createdAt || new Date().toISOString()
            }))
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    }, [ goals ])

    const previewCompletedGoals = useMemo(() => completedGoals.slice(0, 3), [ completedGoals ])

    const heatmapByDate = useMemo(() => {
        const map = new Map()
        completedGoals.forEach((goal) => {
            const key = formatDateKey(goal.completedAt)
            map.set(key, Number(map.get(key) || 0) + 1)
        })
        return map
    }, [ completedGoals ])

    const yearHeatmap = useMemo(() => {
        const months = Array.from({ length: 12 }).map((_, monthIndex) => {
            const monthStart = new Date(selectedYear, monthIndex, 1)
            const firstDayOffset = monthStart.getDay() // Sunday-first English calendar layout
            const totalDays = daysInMonth(selectedYear, monthIndex)
            const days = Array.from({ length: totalDays }).map((__, dayIdx) => {
                const date = new Date(selectedYear, monthIndex, dayIdx + 1)
                const key = formatDateKey(date)
                return {
                    key,
                    date,
                    value: Number(heatmapByDate.get(key) || 0)
                }
            })
            return {
                monthIndex,
                monthLabel: monthStart.toLocaleString("en-US", { month: "short" }),
                fullMonthLabel: monthStart.toLocaleString("en-US", { month: "long" }),
                firstDayOffset,
                totalDays,
                days
            }
        })

        const totalSubmissions = months.reduce(
            (acc, month) => acc + month.days.reduce((mAcc, day) => mAcc + day.value, 0),
            0
        )
        const totalActiveDays = months.reduce(
            (acc, month) => acc + month.days.filter((day) => day.value > 0).length,
            0
        )

        return { months, totalSubmissions, totalActiveDays }
    }, [ selectedYear, heatmapByDate ])

    const addGoalHandler = async () => {
        const topic = String(goalForm.topic || "").trim()
        if (!topic) {
            setError("Topic is required.")
            return
        }

        setSaving(true)
        setError("")
        setMessage("")

        try {
            const durationDays = Math.max(1, Number(goalForm.durationDays || 1))
            const dailyTarget = Math.max(1, Number(goalForm.targetPerDay || 1))
            const deadline = new Date()
            deadline.setDate(deadline.getDate() + durationDays)

            await createGoal({
                skill: topic,
                durationDays,
                dailyTarget,
                targetValue: durationDays * dailyTarget,
                deadline,
                goalType: "questions"
            })

            setGoalForm({ topic: "", durationDays: 7, targetPerDay: 3 })
            setMessage("Goal added.")
            await loadOverview(selectedYear)
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to add goal.")
        } finally {
            setSaving(false)
        }
    }

    const saveReminderHandler = async () => {
        setSaving(true)
        setError("")
        setMessage("")
        try {
            await saveReminders({ reminderTime, reminderType })
            setMessage("Reminder settings saved.")
            await loadOverview(selectedYear)
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to save reminders.")
        } finally {
            setSaving(false)
        }
    }

    const trendPercent = useMemo(() => {
        const now = new Date()
        now.setHours(0, 0, 0, 0)

        const sumRange = (fromOffset, toOffset) => {
            let sum = 0
            for (let i = fromOffset; i <= toOffset; i++) {
                const d = new Date(now)
                d.setDate(now.getDate() + i)
                sum += Number(heatmapByDate.get(formatDateKey(d)) || 0)
            }
            return sum
        }

        const currentWeek = sumRange(-6, 0)
        const previousWeek = sumRange(-13, -7)

        if (previousWeek === 0) return currentWeek > 0 ? 100 : 0
        return Math.round(((currentWeek - previousWeek) / previousWeek) * 100)
    }, [ heatmapByDate ])
    const trendClass = trendPercent >= 0 ? "up" : "down"

    const availableYears = useMemo(() => {
        const years = []
        for (let y = currentYear; y >= currentYear - 6; y--) years.push(y)
        return years
    }, [ currentYear ])

    const PROGRESS_MODAL_SIZE = 6;

    const paginatedVisibleGoals = visibleGoalTasks.slice((goalsModalPage - 1) * PROGRESS_MODAL_SIZE, goalsModalPage * PROGRESS_MODAL_SIZE);
    const totalGoalsModalPages = Math.ceil(visibleGoalTasks.length / PROGRESS_MODAL_SIZE);

    const paginatedCompletedGoals = completedGoals.slice((topicsModalPage - 1) * PROGRESS_MODAL_SIZE, topicsModalPage * PROGRESS_MODAL_SIZE);
    const totalTopicsModalPages = Math.ceil(completedGoals.length / PROGRESS_MODAL_SIZE);

    return (
        <main className="dashboard-page">
            <Sidebar />

            <section className="dashboard-main progress-main">
                <TopBar />

                <section className="progress-grid compact-2">
                    <article className="progress-card playcard glass" style={{ padding: '0.8rem' }}>
                        <h3 style={{ fontSize: '0.8rem', marginBottom: '8px' }}>Suggested Skill Gaps</h3>
                        <div className="chip-flow" style={{ gap: '6px' }}>
                            {skillGapSuggestions.map((item, idx) => (
                                <span key={`${item}-${idx}`} style={{ fontSize: '0.65rem', padding: '3px 8px' }}>{item}</span>
                            ))}
                            {!skillGapSuggestions.length && <span style={{ fontSize: '0.65rem' }}>No gaps available yet</span>}
                        </div>
                    </article>

                    <article className="progress-card glass" style={{ padding: '0.8rem' }}>
                        <h3 style={{ fontSize: '0.8rem', marginBottom: '8px' }}>Set Your Goals</h3>
                        <div className="goal-form minimal" style={{ gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <label style={{ flex: 2, fontSize: '0.65rem' }}>Topic
                                    <input value={goalForm.topic} onChange={(e) => setGoalForm((prev) => ({ ...prev, topic: e.target.value }))} placeholder="Ex: System Design" style={{ padding: '4px 8px', fontSize: '0.75rem' }} />
                                </label>
                                <label style={{ flex: 1, fontSize: '0.65rem' }}>Days
                                    <input type="number" min="1" value={goalForm.durationDays} onChange={(e) => setGoalForm((prev) => ({ ...prev, durationDays: e.target.value }))} style={{ padding: '4px 8px', fontSize: '0.75rem' }} />
                                </label>
                            </div>
                            <button type="button" className="generate-btn compact" onClick={addGoalHandler} disabled={saving} style={{ padding: '6px', fontSize: '0.75rem' }}>Add Goal</button>
                        </div>
                    </article>
                </section>

                <section className="progress-card glass" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={{ fontSize: '0.85rem' }}>Ongoing Goals</h3>
                        {visibleGoalTasks.length > 0 && <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{visibleGoalTasks.length} Active</span>}
                    </div>
                    <div className="task-history">
                        {!paginatedVisibleGoals.length && <p style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', padding: '20px' }}>No ongoing tasks.</p>}
                        {paginatedVisibleGoals.map((goal, index) => {
                            const total = Math.max(1, Number(goal.targetValue || 1))
                            const current = Number(goal.currentProgress || 0)
                            const percent = Math.min(100, Math.round((current / total) * 100))
                            const marker = goal.status === "completed" ? "completed" : "ongoing"

                            return (
                                <article
                                    key={goal._id}
                                    className={`task-item ${marker}`}
                                    style={{ padding: '0.6rem', marginBottom: '6px' }}
                                >
                                    <div className="task-main">
                                        <p className="task-title" style={{ fontSize: '0.8rem' }}>{goal.skill}</p>
                                        <span className={`task-inline-marker task-counter-chip ${marker}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                                            {current}/{total} qs
                                        </span>
                                    </div>
                                    <div className="task-actions" style={{ gap: '10px' }}>
                                        <input
                                            className="task-progress-input"
                                            type="number"
                                            min="0"
                                            value={current}
                                            style={{ width: '45px', padding: '2px 4px', fontSize: '0.75rem' }}
                                            onChange={async (e) => {
                                                const next = Number(e.target.value || 0)
                                                try {
                                                    await updateGoal(goal._id, { currentProgress: next })
                                                    setGoals((prev) => prev.map((item) => item._id === goal._id ? { ...item, currentProgress: next } : item))
                                                    await loadOverview(selectedYear)
                                                } catch (err) {
                                                    setError(err?.response?.data?.message || "Unable to update goal.")
                                                }
                                            }}
                                        />
                                        {goal.status !== "completed" && (
                                            <button
                                                type="button"
                                                style={{ fontSize: '0.65rem', padding: '2px 8px' }}
                                                onClick={async () => {
                                                    try {
                                                        await updateGoal(goal._id, { currentProgress: total })
                                                        await loadOverview(selectedYear)
                                                    } catch (err) {
                                                        setError(err?.response?.data?.message || "Unable to complete goal.")
                                                    }
                                                }}
                                            >
                                                Done
                                            </button>
                                        )}
                                    </div>
                                    <div className="bar" style={{ height: '3px', marginTop: '6px' }}><i style={{ width: `${percent}%` }} /></div>
                                </article>
                            )
                        })}
                    </div>
                    {totalGoalsModalPages > 1 && (
                        <div className="inline-pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                            <button disabled={goalsModalPage <= 1} onClick={() => setGoalsModalPage(p => p - 1)} style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.65rem', borderRadius: '4px' }}>Prev</button>
                            <span style={{ fontSize: '0.65rem' }}>{goalsModalPage}/{totalGoalsModalPages}</span>
                            <button disabled={goalsModalPage >= totalGoalsModalPages} onClick={() => setGoalsModalPage(p => p + 1)} style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.65rem', borderRadius: '4px' }}>Next</button>
                        </div>
                    )}
                </section>

                <section className="progress-grid compact-2">
                    <article className="progress-card glass" style={{ padding: '0.8rem' }}>
                        <h3 style={{ fontSize: '0.8rem', marginBottom: '8px' }}>Reminders</h3>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                            <label style={{ flex: 1, fontSize: '0.65rem' }}>Time
                                <input className="reminder-time-input" type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} style={{ padding: '4px', fontSize: '0.75rem' }} />
                            </label>
                            <button type="button" className="generate-btn compact" onClick={saveReminderHandler} disabled={saving} style={{ padding: '6px', fontSize: '0.75rem' }}>Save</button>
                        </div>
                    </article>

                    <article className="progress-card glass" style={{ padding: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <h3 style={{ fontSize: '0.8rem' }}>Completed Topics</h3>
                        </div>
                        <div className="topic-history">
                            {!paginatedCompletedGoals.length && <p style={{ fontSize: '0.7rem', opacity: 0.5, textAlign: 'center', padding: '10px' }}>No topics yet.</p>}
                            {paginatedCompletedGoals.map((goal) => (
                                <article key={`done-${goal._id}`} className="topic-item" style={{ padding: '4px 8px', marginBottom: '4px' }}>
                                    <strong style={{ fontSize: '0.75rem' }}>{goal.skill}</strong>
                                    <small style={{ fontSize: '0.6rem' }}>{new Date(goal.completedAt).toLocaleDateString()}</small>
                                </article>
                            ))}
                        </div>
                        {totalTopicsModalPages > 1 && (
                            <div className="inline-pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                                <button disabled={topicsModalPage <= 1} onClick={() => setTopicsModalPage(p => p - 1)} style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.6rem', borderRadius: '4px' }}>Prev</button>
                                <span style={{ fontSize: '0.6rem' }}>{topicsModalPage}/{totalTopicsModalPages}</span>
                                <button disabled={topicsModalPage >= totalTopicsModalPages} onClick={() => setTopicsModalPage(p => p + 1)} style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.6rem', borderRadius: '4px' }}>Next</button>
                            </div>
                        )}
                    </article>
                </section>

                <section className="progress-grid compact-3">
                    <article className="progress-card stat-tile glass" style={{ padding: '0.6rem' }}>
                        <h3 style={{ fontSize: '0.75rem' }}>Goals Completed</h3>
                        <p className="big" style={{ fontSize: '1.2rem' }}>{stats?.goalsSummary?.completed || 0}/{stats?.goalsSummary?.total || 0}</p>
                    </article>
                    <article className="progress-card stat-tile glass" style={{ padding: '0.6rem' }}>
                        <h3 style={{ fontSize: '0.75rem' }}>Streak</h3>
                        <p className="big" style={{ fontSize: '1.2rem' }}>{stats?.streak?.current || 0} days</p>
                    </article>
                    <article className="progress-card stat-tile glass" style={{ padding: '0.6rem' }}>
                        <h3 style={{ fontSize: '0.75rem' }}>Trend</h3>
                        <p className="big" style={{ fontSize: '1.2rem' }}>
                            <span className={`trend-chip ${trendClass}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                {trendPercent >= 0 ? '+' : ''}{trendPercent}%
                            </span>
                        </p>
                    </article>
                </section>

                <section className="progress-card heatmap-card glass" style={{ padding: '1rem' }}>
                    <div className="heatmap-head" style={{ marginBottom: '10px' }}>
                        <h3 style={{ fontSize: '0.85rem' }}>{yearHeatmap.totalSubmissions} Activity Points in {selectedYear}</h3>
                        <div className="heatmap-head__right">
                            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ padding: '2px 6px', fontSize: '0.75rem' }}>
                                {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="calendar-strip-wrap">
                        <div
                            className="calendar-heatmap heatmap-animate"
                            key={selectedYear}
                            ref={heatmapScrollRef}
                            style={{ gap: '15px' }}
                            onScroll={(e) => setHeatmapSliderValue(e.currentTarget.scrollLeft)}
                        >
                            {yearHeatmap.months.map((month) => (
                                <article className="calendar-month" key={`${selectedYear}-${month.monthIndex}`}>
                                    <h4 style={{ fontSize: '0.75rem' }}>{month.monthLabel}</h4>
                                    <div className="calendar-month__grid" style={{ gap: '3px' }}>
                                        {Array.from({ length: month.firstDayOffset }).map((_, idx) => (
                                            <span key={`pad-${month.monthIndex}-${idx}`} className="cell out" style={{ width: '10px', height: '10px' }} />
                                        ))}
                                        {month.days.map((day) => {
                                            const intensity = Math.min(4, Math.max(0, Number(day.value || 0)))
                                            return (
                                                <span
                                                    key={day.key}
                                                    className={`cell lv-${intensity}`}
                                                    style={{ width: '10px', height: '10px' }}
                                                    title={`${day.value} goals on ${day.key}`}
                                                />
                                            )
                                        })}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
                
                <div className="notes-flash">
                    {loading && <Loader style={{ minHeight: '100px' }} />}
                    {error && <p className="notes-error" style={{ fontSize: '0.7rem' }}>{error}</p>}
                </div>
            </section>
        </main>
    )
}

export default ProgressTracker
