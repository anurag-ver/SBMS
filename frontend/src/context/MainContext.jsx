import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { axiosClient } from "../utils/AxiosClient";
import Loader from "../components/Loader";

const mainContext = createContext();

export const useMainContext = () => useContext(mainContext);

export const MainContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) return;

            const { data } = await axiosClient.get("/auth/profile", {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            setUser(data);
        } catch (error) {
            toast.error(error.response?.data?.msg || error.message);
        } finally {
            setLoading(false);
        }
    };

    const logoutHandler = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
        toast.success("Logout successful");
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f8fc]">
                <Loader />
            </div>
        );
    }

    return (
        <mainContext.Provider value={{ user, fetchUserProfile, logoutHandler }}>
            {children}
        </mainContext.Provider>
    );
};
