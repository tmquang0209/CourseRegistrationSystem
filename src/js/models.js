import fetchYear from "./API/year";

export const getYear = async () => {
    const fetchYear = await fetchYear();
    return fetchYear;
};
