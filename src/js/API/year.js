import axios from "axios";
import { API_URI } from "../constants";
const fetchYear = async () => {
    try {
        const url = API_URI + "/api/getListYear";
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

export default fetchYear;
