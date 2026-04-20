import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/auth.api";
import { initSocket, disconnectSocket } from "../../services/socket.service";


export const AuthContext = createContext()


export const AuthProvider = ({ children }) => { 

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const bootstrapAuth = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (err) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        bootstrapAuth()
    }, [])

    useEffect(() => {
        if (user) {
            const token = localStorage.getItem("intelliprep_token");
            if (token) {
                initSocket(token);
            }
        } else {
            disconnectSocket();
        }
    }, [user])

    return (
        <AuthContext.Provider value={{user,setUser,loading,setLoading}} >
            {children}
        </AuthContext.Provider>
    )

    
}
