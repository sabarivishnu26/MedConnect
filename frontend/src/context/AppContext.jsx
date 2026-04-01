import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const currencySymbol = '$'
    const [doctors, setDoctors] = useState([])

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await axios.get("http://localhost:4000/api/doctors")
                console.log("Doctors from backend:", res.data) // ✅ DEBUG
                setDoctors(res.data)
            } catch (err) {
                console.error(err)
            }
        }

        fetchDoctors()
    }, [])

    const value = {
        doctors,
        currencySymbol
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider