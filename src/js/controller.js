import "core-js/stable";
import "regenerator-runtime/runtime";
import homeView from "./views/homeView";
import mainView from "./views/mainView";
import fetchYear from "./API/year";
import {
    fetchSchedule,
    fetchScheduleRegister,
    fetchSubject,
    fetchSummary,
    updateSummary,
} from "./API/schedule";
import enrollView from "./views/enrollView";
import { root, view } from "./elements";
import { checkEnrollId, fetchEnroll } from "./API/enroll";
import localStorage from "./components/localStorage";
import scheduleView from "./views/scheduleView";
import { decode } from "jsonwebtoken";
//general
const loading = (status) => {
    const markup = `<div id="loading" class="text-center position-absolute top-50 start-50 translate-middle">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>`;
    const loadingElement = document.getElementById("loading");
    if (status) view.insertAdjacentHTML("afterbegin", markup);
    else if (loadingElement)
        loadingElement.parentElement.removeChild(loadingElement);
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
    homeView.renderSemester(data);
};

//main controller
const mainController = () => {
    mainView.render();
    renderPageBaseOnHash();

    window.addEventListener("hashchange", renderPageBaseOnHash);
};

// import * as elements from "./elements";
const renderPageBaseOnHash = () => {
    loading(true);

    const HASH_URI = window.location.hash;
    const enrollPattern = /^#schedule\/[a-z0-9]+$/;
    if (enrollPattern.test(HASH_URI)) {
        scheduleController();
    }

    switch (HASH_URI) {
        case "#home":
            homeController();
            break;
        case "#enroll":
            enrollController();
            break;

        default:
            break;
    }
    loading(false);
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
            if (item.yearId === Number(year.value) && year.value != "")
                handleYearChange(data[index].semesters);
        })
    );

    semester.addEventListener("change", handleSemesterChange);

    search.addEventListener("input", () => handleSearch(search.value));
};

const handleSemesterChange = async () => {
    loading(true);
    const semester = document.getElementById("semester");
    const semesterValue = semester.value;
    let data = [];
    if (semesterValue != "") data = await getSchedule(semesterValue);
    loading(false);
    homeView.renderView(data);
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
    for (let i = 0; i < classList.length; i++) {
        const search = classList[i].innerHTML
            .toLowerCase()
            .includes(keyword.toLowerCase());
        classList[i].style.display = search ? "" : "none";
    }
};

//enroll controller
const enrollController = async () => {
    console.log("Enroll controller");
    // await checkEnrollAndLoadSchedule();

    enrollView.render();

    const year = document.getElementById("year");
    const yearData = await getDataYear();

    enrollView.updateForm(yearData);
    year.addEventListener("change", () =>
        yearData.map((item, index) => {
            if (item.yearId === Number(year.value))
                handleYearChange(yearData[index].semesters);
        })
    );

    const submit = document.getElementById("submit");
    submit.addEventListener("click", handleSubmitEnroll);
};

const handleSubmitEnroll = async () => {
    const studentCode = document.getElementById("studentCode");
    const password = document.getElementById("password");
    const year = document.getElementById("year");
    const semester = document.getElementById("semester");

    if (studentCode.value && year.value && semester.value) {
        try {
            const enrollData = await fetchEnroll(
                semester.value,
                studentCode.value,
                password.value
            );
            if (enrollData.message) {
                enrollView.renderNotification(enrollData.message, "danger");
                return;
            }
            localStorage.set("enrollId", enrollData.data._id, 60);
            localStorage.set("enrollPassword", enrollData.data.password, 60);
            window.location.href = `#schedule/${enrollData.data._id}`;
        } catch (err) {
            console.error("Error submitting enrollment", err);
        }
    }
};

const scheduleController = async () => {
    const HASH_URI = window.location.hash;
    console.log("Schedule controller");

    //Check url format
    const enrollPattern = /^#schedule\/[a-z0-9]+$/;
    if (!enrollPattern.test(HASH_URI)) {
        window.location.href = "#enroll";
        return;
    }

    //Get enroll id from url
    const parseEnrollId = HASH_URI.replace("#schedule/", "");

    //Get enrollId and enrollPassword from localStorage
    const enrollId = localStorage.get("enrollId");
    const enrollPassword = localStorage.get("enrollPassword");

    //If id in the URL is not equal to id in localStorage => Skip typing the password
    if (parseEnrollId === enrollId) {
        loadScheduleWithoutPassword(enrollId, enrollPassword);
        return;
    }

    //If id in the URL is not equal to the id in localStorage => Typing the password
    await checkPassword(parseEnrollId);
};

const loadScheduleWithoutPassword = async (enrollId, enrollPassword) => {
    try {
        // Set enrollId and enrollPassword in localStorage
        localStorage.set("enrollId", enrollId, 60);
        localStorage.set("enrollPassword", enrollPassword, 60);

        // Render schedule
        loading(true);
        scheduleView.render();
        loading(false);

        // Fetch subject data
        const getSubject = await fetchSubject(enrollId);

        // Load classroom and render summary
        loading(true);
        scheduleView.loadClassroom(getSubject.data);
        scheduleView.renderSummary(getSubject.data);
        loading(false);

        // Handle checkbox click
        loading(true);
        handleClassClick(getSubject.data);
        loading(false);

        // Add event listener for search input
        const searchInput = document.getElementById("searchSubject");
        searchInput.addEventListener("input", () =>
            handleSearchSubject(searchInput.value)
        );

        // Load schedule register from the database
        loading(true);
        await loadScheduleRegister(enrollId, enrollPassword);
        scheduleView.updateSummary(getSubject.data);

        // Load and update coefficient values
        loadCoefValue(enrollId, enrollPassword);
        setTimeout(() => {
            updateCoefValue(enrollId, enrollPassword);
        }, 1000);
        loading(false);
        // Add event listener for unit price input
        const unitPriceInput = document.getElementById("unitPrice");
        const coefInput = document.querySelectorAll(
            `input[id="coef"][data-subject-code]`
        );

        // Update amount and total amount for each coefficient input
        const updateCoefInput = (item) => {
            scheduleView.updateAmount(item.dataset.subjectCode, item.value);
            scheduleView.updateTotalAmount();
            setTimeout(() => {
                updateCoefValue(enrollId, enrollPassword);
            }, 1000);
        };
        setTimeout(() => {
            coefInput.forEach((item) => updateCoefInput(item));
        }, 2000);

        // Set up listeners for coefficient inputs
        const setupCoefInputListeners = () => {
            coefInput.forEach((item) => {
                item.addEventListener("input", () => updateCoefInput(item));
            });
        };

        // Set up listeners initially
        setupCoefInputListeners();

        // Add event listener for unit price input
        unitPriceInput.addEventListener("input", () => {
            // Update amount and total amount for each coefficient input
            coefInput.forEach((item) => updateCoefInput(item));
        });
        return;
    } catch (err) {
        console.log("Error loading schedule without password", err);
        window.location.href = "#enroll";
    }
};

const checkPassword = async (parseEnrollId) => {
    try {
        const response = await checkEnrollId(parseEnrollId);

        if (!response) return;

        //If error => go to #enroll
        if (response.message != null) {
            alert(response.message);
            window.location.href = "/#enroll";
            return;
        }

        //else
        const responseData = response.data;
        const enrollPassword = localStorage.get("enrollPassword");
        if (!enrollPassword) {
            do {
                //typing password
                const password = prompt("Nhập mật khẩu để tiếp tục.");
                const decodePassword = decode(responseData.password);
                //check password
                //if true => save to localStorage => render schedule
                if (decodePassword.password === password) {
                    localStorage.set("enrollId", parseEnrollId, 60);
                    localStorage.set(
                        "enrollPassword",
                        responseData.password,
                        60
                    );
                    window.location.reload();
                    break;
                }
                //if false => typing password again
            } while (true);
        }
    } catch (err) {
        console.log("Error checking enrollment", err);
        window.location.href = "#enroll";
    }
};

const loadScheduleRegister = async (enrollId, enrollPassword) => {
    //load class register in db
    const getClassRegister = await fetchScheduleRegister(
        enrollId,
        enrollPassword
    );
    //get
    const classRegisterData = getClassRegister.data;
    classRegisterData.schedule.map((item) => {
        //add to table
        scheduleView.addToTable(item.subject.subjectCode, item.classList);
        //set checked
        const getCheckboxBySubject = document.querySelectorAll(
            `input[name="${item.subject.subjectCode}"]`
        );
        for (let i = 0; i < getCheckboxBySubject.length; i++) {
            const element = getCheckboxBySubject[i];
            const id = element.id.split(",");
            const idDB = item.classList.flatMap((id) => id._id);
            const check = idDB.every((value) => id.includes(value));
            if (check) {
                element.checked = check;
                break;
            }
        }
    });
};

const loadCoefValue = async (enrollId, password) => {
    const fetchData = await fetchSummary(enrollId, password);

    const unitPrice = document.getElementById("unitPrice");
    unitPrice.value = fetchData.unitPrice;

    fetchData.coefList.forEach((item) => {
        const getInput = document.querySelector(
            `input[id="coef"][data-subject-code="${item.subjectCode}"]`
        );
        getInput.value = item.coef;
    });
};

const updateCoefValue = async (enrollId, password) => {
    const coefList = [];
    const getUnitPrice = document.getElementById("unitPrice");
    const getCoefInput = document.querySelectorAll(`input[id="coef"]`);

    getCoefInput.forEach((item) => {
        coefList.push({
            subjectCode: item.dataset.subjectCode,
            coef: item.value,
        });
    });

    //send to BE
    await updateSummary(enrollId, password, getUnitPrice.value, coefList);
};

const handleClassClick = (data) => {
    const listGroup = document.querySelector(".list-group");

    listGroup.addEventListener("click", function (e) {
        const input = e.target.closest(".form-check-input");
        if (!input) return;

        if (!input.checked) {
            scheduleView.removeFromTable(input.name);
            scheduleView.updateSummary(data);
            setTimeout(() => {
                scheduleView.saveToDB();
            }, 1000);
            return;
        }

        // Uncheck other checkboxes with the same name
        const getInputSubjectCode = document.getElementsByName(input.name);
        const arrInput = Array.from(getInputSubjectCode);
        arrInput.forEach((item) => {
            if (item.id !== input.id) item.checked = false;
        });

        const classIds = input.id.split(",").map((item) => item.trim());

        const findSubject = data.find(
            (item) => item.subject.subjectCode === input.name
        );

        const findClass = classIds.flatMap((classId) =>
            findSubject.classList.filter((classItem) =>
                classItem._id.includes(classId.trim())
            )
        );

        const reduceClass = [...new Set(findClass)];
        scheduleView.addToTable(input.name, reduceClass);
        scheduleView.updateSummary(data);
    });
};

const handleSearchSubject = (searchValue) => {
    const listGroup = document.querySelectorAll(
        "#list-group > .list-group-item"
    );
    const arrListGroup = Array.from(listGroup);

    arrListGroup.map(
        (item) =>
            (item.style.display = item.innerText
                .toLowerCase()
                .includes(searchValue.toLowerCase())
                ? ""
                : "none")
    );
};
const init = () => {
    if (window.location.hash === "") window.location.href = "#home";
    mainController();
};

init();
