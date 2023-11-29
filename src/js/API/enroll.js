import { axiosPost } from "../components/axios";
export const fetchEnroll = async (semesterId, studentCode, password) => {
    const url = `/api/personalSchedule`;
    const body = {
        semesterId,
        studentCode,
        password,
    };
    return axiosPost(url, body);
};

export const checkEnrollId = async (enrollId) => {
    const url = `/api/checkEnroll/${enrollId}`;
    return axiosPost(url, { enrollId });
};
