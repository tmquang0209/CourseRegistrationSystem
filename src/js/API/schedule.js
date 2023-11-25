import axios from "axios";
import { API_URI } from "../constants";
const fetchSchedule = async (semesterId) => {
    try {
        const url = API_URI + "/api/getSchedule/" + semesterId;
        const response = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                Accept: "*/*",
            },
        });
        const responseData = await response.data;
        return responseData;
    } catch (err) {
        console.error(err);
    }
};

export default fetchSchedule;
