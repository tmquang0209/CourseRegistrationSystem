import { axiosGet, axiosPost } from "../components/axios";

export const fetchSchedule = async (semesterId) => {
    const url = `/api/getSchedule/${semesterId}`;
    return axiosGet(url);
};

export const fetchSubject = async (enrollId) => {
    const url = `/api/getSubjectSemester/${enrollId}`;
    return axiosGet(url);
};

export const fetchScheduleRegister = async (enrollId, password) => {
    const url = `/api/getClassRegister/`;
    const body = {
        enrollId,
        password,
    };
    return axiosPost(url, body);
};

export const fetchSummary = async (enrollId, password) => {
    const url = `/api/getCoefList`;

    const body = { enrollId, password };
    return axiosPost(url, body);
};

export const updateSummary = async (
    enrollId,
    password,
    unitPrice,
    coefList
) => {
    const url = `/api/updateCoefList`;
    const body = {
        enrollId,
        password,
        unitPrice,
        coefList,
    };

    return axiosPost(url, body);
};
