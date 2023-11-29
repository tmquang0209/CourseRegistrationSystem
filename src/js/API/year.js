import { axiosGet } from "../components/axios";
const fetchYear = async () => {
    const url = `/api/getListYear`;
    return axiosGet(url);
};

export default fetchYear;
