import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            return { ok: true, data }
        } catch (err) {
            return {
                ok: false,
                message: err?.response?.data?.message || "Unable to login. Please try again."
            }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return { ok: true, data }
        } catch (err) {
            return {
                ok: false,
                message: err?.response?.data?.message || "Unable to register. Please try again."
            }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
            return { ok: true }
        } catch (err) {
            return {
                ok: false,
                message: err?.response?.data?.message || "Unable to logout. Please try again."
            }
        } finally {
            setLoading(false)
        }
    }

    return { user, loading, handleRegister, handleLogin, handleLogout }
}
