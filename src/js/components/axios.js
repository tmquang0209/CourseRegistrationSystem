import axios from "axios";
import { API_URI } from "../constants";
export const axiosGet = async (url, params) => {
    try {
        const targetUrl = API_URI + url;

        const response = await axios.get(targetUrl, {
            params,
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

export const axiosPost = async (url, body) => {
    try {
        const targetUrl = API_URI + url;
        const response = await axios.post(
            targetUrl,
            { ...body },
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "*/*",
                },
            }
        );
        const responseData = await response.data;
        return responseData;
    } catch (err) {
        console.error(err);
    }
};
