import "core-js/stable";
import "regenerator-runtime/runtime";
import homeView from "./views/homeView";
import mainView from "./views/mainView";
import fetchYear from "./API/year";
import fetchSchedule from "./API/schedule";

//main controller
const mainController = () => {
    mainView.render();
    renderPageBaseOnHash();

    window.addEventListener("hashchange", renderPageBaseOnHash);
};

// import * as elements from "./elements";
const renderPageBaseOnHash = () => {
    const hashUrl = window.location.hash;
    switch (hashUrl) {
        case "#home":
            homeController();
            break;
        case "#enroll":
            break;
        default:
            break;
    }
};

//home controller
const homeController = async () => {
    console.log("Home Controller");
    homeView.render();

    const year = document.getElementById("year");
    const semester = document.getElementById("semester");
    const search = document.getElementById("search");

    const data = await getDataYear();
    homeView.updateForm(data);
    year.addEventListener("change", () =>
        data.map((item, index) => {
            if (item.yearId === Number(year.value))
                handleYearChange(data[index].semesters);
        })
    );

    semester.addEventListener("change", handleSemesterChange);

    search.addEventListener("input", () => handleSearch(search.value));
};

const getDataYear = async () => {
    try {
        const yearData = await fetchYear(); // Call the function to get the result
        return yearData.data;
    } catch (error) {
        console.error(error);
    }
};

const handleYearChange = (data) => {
    console.log("getSemester", data);

    data.forEach((item) => {
        const markup = `<option value="${item.semesterId}">${item.semesterName}</option>`;
        semester.insertAdjacentHTML("beforeend", markup);
    });
};

const handleSemesterChange = async () => {
    const semester = document.getElementById("semester");
    const semesterValue = semester.value;

    const data = await getSchedule(semesterValue);
    homeView.renderView(data);
    console.log(data);
};

const getSchedule = async (semesterId) => {
    try {
        const scheduleData = await fetchSchedule(semesterId); // Call the function to get the result
        return scheduleData.data;
    } catch (error) {
        console.error(error);
    }
};

const handleSearch = (keyword) => {
    const classList = document.querySelectorAll("tbody tr");
    // console.log(classList);
    for (let i = 0; i < classList.length; i++) {
        const search = classList[i].innerHTML.includes(keyword);
        classList[i].style.display = search ? "" : "none";
    }
};

const init = () => {
    mainController();
};

init();
