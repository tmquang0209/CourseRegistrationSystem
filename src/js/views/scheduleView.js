import { axiosPost } from "../components/axios";
import localStorage from "../components/localStorage";
import { view } from "../elements";
class ScheduleView {
    _day = [
        { alias: "day", key: null, name: "Thứ" },
        { alias: "mon", key: 2, name: 2 },
        { alias: "tue", key: 3, name: 3 },
        { alias: "wed", key: 4, name: 4 },
        { alias: "thur", key: 5, name: 5 },
        { alias: "fri", key: 6, name: 6 },
        { alias: "sat", key: 7, name: 7 },
        { alias: "sun", key: 1, name: "CN" },
    ];
    _shift = [...Array(15).keys()].filter((item) => item != 0);

    _enroll = [];

    constructor() {}

    render() {
        const tableHtml = this.renderShiftTable();
        const markup = `
        <div class="container">
            <div class="row">
                <div class="col-md-4">
                    <div class="alert alert-primary text-danger fw-bold text-center text-uppercase fs-5" role="alert">Danh
                        sách
                        lớp học</div>
                    <div class="input-group mb-3 pe-1">
                        <span class="input-group-text" id="basic-addon1">Search</span>
                        <input id="searchSubject" type="text" class="form-control" placeholder="Tìm kiếm theo môn học/ lớp học"
                            aria-label="Tìm kiếm theo môn học" aria-describedby="basic-addon1">
                    </div>
                    <div style="max-height:70vh;overflow-y:scroll;margin-bottom: 5vh;">
                        <ul class="list-group" id="list-group">
                        </ul>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="alert alert-primary text-danger fw-bold text-center text-uppercase fs-5" role="alert">Thời
                        khóa biểu</div>
                    <table class="table table-bordered fixed">
                        <thead>
                            <tr>
                                ${this._day
                                    .map((item, index) => {
                                        if (
                                            Number(item.name) ||
                                            item.name === "CN"
                                        )
                                            return `<td class="text-center">${item.name}</td>`;
                                        else
                                            return `<td class="text-center col-1">${item.name}</td>`;
                                    })
                                    .join("")}
                            </tr>
                        </thead>
                        <tbody>
                            ${tableHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        `;
        view.innerHTML = markup;
    }

    renderShiftTable() {
        const shiftRows = this._shift
            .map((shiftItem, shiftIndex) => {
                const dayColumns = this.renderDayColumns(shiftIndex);
                return `<tr>
                    <td class="text-center">${shiftItem}</td>
                    ${dayColumns}
                </tr>`;
            })
            .join("");

        return shiftRows;
    }

    renderDayColumns(shiftIndex) {
        const dayColumns = this._day
            .map((dayItem, dayIndex) => {
                if (dayIndex > 0 && dayIndex < 8) {
                    const cellId = `${this._day[dayIndex].alias}_${
                        shiftIndex + 1
                    }`;
                    return `<td class="text-center" id="${cellId}"></td>`;
                }
                return "";
            })
            .join("\n");

        return dayColumns;
    }

    renderSummary() {
        const markup = `
        <div class="container">
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <td class="fw-bold text-center align-middle">STT</td>
                        <td class="fw-bold text-center align-middle">Môn học</td>
                        <td class="fw-bold text-center align-middle">Lớp</td>
                        <td class="fw-bold text-center align-middle">Giảng viên</td>
                        <td class="fw-bold text-center align-middle">Tín chỉ</td>
                        <td class="col-1 fw-bold text-center align-middle">Hệ số</td>
                        <td class="fw-bold text-center align-middle">Thành tiền</td>
                    </tr>
                </thead>
                <tbody id="bodySummary">
                </tbody>
            </table>
        </div>
        `;
        view.insertAdjacentHTML("beforeend", markup);
    }
    updateSummary(data) {
        const summary = [];

        // get schedule
        const td = document.querySelectorAll("td[data-schedule-id][rowspan]");

        // get subject info
        td.forEach((item) => {
            const results = data
                .filter(
                    (fil) =>
                        fil.subject.subjectCode === item.dataset.subjectCode
                )
                .map((map) =>
                    map.classList
                        .filter((fil) =>
                            fil._id.includes(item.dataset.scheduleId)
                        )
                        .map((filteredItem) => ({
                            subject: map.subject,
                            classInfo: filteredItem,
                            // Include other properties from 'filteredItem' as needed
                        }))
                );

            const flattenedResults = [].concat(...results);

            flattenedResults.forEach((result) => {
                const existingSubject = summary.find(
                    (sum) =>
                        sum?.subject?.subjectCode === result.subject.subjectCode
                );

                if (existingSubject) {
                    existingSubject.classList.push(result.classInfo);
                } else {
                    summary.push({
                        subject: result.subject,
                        classList: [result.classInfo],
                    });
                }
            });
        });

        // get schedule info
        const bodySummary = document.getElementById("bodySummary");
        bodySummary.innerHTML = ``;
        const markupItems = summary.flatMap((summaryItem, index) => {
            let countDay = 0;
            return summaryItem.classList.map(
                (classItem, classIndex) => `
        <tr data-subject-code="${summaryItem.subject.subjectCode}">
            <td data-subject-code="${
                summaryItem.subject.subjectCode
            }" class="text-center align-middle" ${
                    classIndex === 0
                        ? `rowspan="${summaryItem.classList.length}"`
                        : ``
                }
            }>${index + 1}</td>
            <td data-subject-code="${
                summaryItem.subject.subjectCode
            }" class="text-center align-middle" ${
                    classIndex === 0
                        ? `rowspan="${summaryItem.classList.length}"`
                        : ""
                }>${summaryItem.subject.subjectName}</td>
            <td>${classItem.className} (Thứ ${classItem.day[countDay]} [${
                    classItem.shift[countDay]
                }])</td>
            <td>${classItem.teacher}</td>
            <td data-subject-code="${
                summaryItem.subject.subjectCode
            }" class="text-center align-middle" ${
                    classIndex === 0
                        ? `rowspan="${summaryItem.classList.length}"`
                        : ""
                }>${summaryItem.subject.credits}</td>
            <td data-subject-code="${
                summaryItem.subject.subjectCode
            }" class="text-center align-middle" ${
                    classIndex === 0
                        ? `rowspan="${summaryItem.classList.length}"`
                        : ""
                }><input class="form-control" type="number"/></td>
            <td data-subject-code="${
                summaryItem.subject.subjectCode
            }" class="text-center align-middle" ${
                    classIndex === 0
                        ? `rowspan="${summaryItem.classList.length}"`
                        : ""
                }>1.000.000đ</td>
        </tr>`
            );
        });

        bodySummary.insertAdjacentHTML("beforeend", markupItems.join(""));

        // Combine multiple queries
        // Combine multiple queries
        summary.forEach((summaryItem) => {
            const query = bodySummary.querySelectorAll(
                `tr[data-subject-code="${summaryItem.subject.subjectCode}"]`
            );
            query.forEach((trItem, index) => {
                const td = trItem.querySelectorAll(
                    `td[data-subject-code="${summaryItem.subject.subjectCode}"]`
                );
                // if (index === 0) {
                //     td.forEach((element) => {
                //         element.setAttribute("rowspan", query.length);
                //     });
                // } else {
                //     td.forEach((element) => {
                //         element.classList.add("hidden");
                //     });
                // }
                if (index != 0) {
                    td.forEach((element) => {
                        element.classList.add("hidden");
                    });
                }
            });
        });

        const totalCredits = summary.reduce(
            (acc, curr) => acc + curr.subject.credits,
            0
        );
        const markupTotal = `
        <tr>
            <td class="fw-bold text-danger">Tổng</td>
            <td class="fw-bold text-danger text-center">${summary.length} môn học</td>
            <td></td>
            <td></td>
            <td class="fw-bold text-danger text-center">${totalCredits}</td>
            <td></td>
            <td class="fw-bold text-danger">Tổng</td>
        </tr>
        `;

        bodySummary.insertAdjacentHTML("beforeend", markupTotal);
    }
    loadClassroom(data) {
        const listGroup = document.getElementById("list-group");
        listGroup.innerHTML = ``;

        data.map((item) => {
            const markup = `
                <li class="list-group-item">
                    <li class="list-group list-group-flush text-center text-danger fw-bold">${item.subject.subjectName}</li>
                    <ul class="list-group list-group-flush" id="${item._id}">
                    </ul>
                </li>
                `;
            listGroup.insertAdjacentHTML("beforeend", markup);

            const subject = document.getElementById(item._id);
            item.classList
                .filter((classItem) => !classItem.className.endsWith("_LT"))
                .forEach((classItem) => {
                    const getTheoryClassName = classItem.className.endsWith(
                        "_BT"
                    )
                        ? classItem.className.slice(0, -5) + "_LT"
                        : null;

                    const getTheoryClass =
                        item.classList.find(
                            (f) => f.className === getTheoryClassName
                        ) || null;
                    let id = "";
                    if (getTheoryClass) {
                        id = getTheoryClass._id;
                        id += "," + classItem._id;
                    } else {
                        id = classItem._id;
                    }

                    const markupClass = `
            <li class="list-group-item" id="${id}">
                <input class="form-check-input me-1" id="${id}" name="${
                        item.subject.subjectCode
                    }" type="checkbox" value="" aria-label="...">
                ${getTheoryClass?.className || ""}
                ${
                    getTheoryClass?.day
                        ? getTheoryClass.day.map(
                              (dayItem, index) =>
                                  `Thứ ${dayItem} [${getTheoryClass.shift[index]}]`
                          )
                        : ""
                }
                ${classItem.className} (${classItem.day
                        .map(
                            (dayItem, index) =>
                                `Thứ ${dayItem} [${classItem.shift[index]}]`
                        )
                        .join(",")})
            </li>
        `;

                    subject.insertAdjacentHTML("beforeend", markupClass);
                });
        });
    }

    addToTable(subjectCode, classInfo) {
        this.removeFromTable(subjectCode);
        for (let i = 0; i < classInfo.length; i++) {
            const item = classInfo[i];
            const flag = item.day.some((dayItem, i) => {
                // console.log(
                //     this.checkClass(subjectCode, dayItem, item.shift[i])
                // );
                return !this.checkClass(subjectCode, dayItem, item.shift[i]);
            });

            // console.log(subjectCode, classInfo, flag);

            if (flag) {
                this.unCheck(item._id, subjectCode);
                this.removeFromTable(subjectCode);
                alert("Bị trùng lịch!");
                break;
            }

            for (let i = 0; i < item.day.length; i++) {
                const findAlias = this._day.filter(
                    (dayItem) => dayItem.key === item.day[i]
                )[0];
                const [shiftStart, shiftEnd] = item.shift[i].split("-");

                for (let j = Number(shiftStart); j <= Number(shiftEnd); j++) {
                    const tdId = `${findAlias.alias}_${j}`;
                    const tdElement = document.getElementById(tdId);
                    tdElement.dataset.subjectCode = subjectCode;
                    tdElement.dataset.scheduleId = item._id[i];
                    if (j === Number(shiftStart)) {
                        tdElement.rowSpan = shiftEnd - shiftStart + 1;
                        tdElement.classList.add("align-middle");
                        tdElement.innerHTML = `<div class="alert-primary text-danger fw-bold p-1">${item.className}<br/>${item.classroom[i]}</div>`;
                    } else {
                        tdElement.classList.add("hidden");
                    }
                }
            }
        }
        setTimeout(() => {
            this.saveToDB();
        }, 1000);
    }

    removeFromTable(subjectCode) {
        const getTd = document.querySelectorAll(
            `[data-subject-code=${subjectCode}]`
        );
        getTd.forEach((item) => {
            item.innerHTML = ``;
            item.removeAttribute("rowspan");
            delete item.dataset.subjectCode;
            delete item.dataset.scheduleId;
            item.classList.remove("align-middle");
            item.classList.remove("hidden");
        });
    }

    checkClass(subjectCode, day, shift) {
        // console.log("=================CHECK CLASS==================");
        const findAlias = this._day.filter((dayItem) => dayItem.key === day)[0];
        const [shiftStart, shiftEnd] = shift.split("-");
        // console.log(findAlias, shiftStart, shiftEnd);

        for (let i = Number(shiftStart); i <= Number(shiftEnd); i++) {
            const tdId = `${findAlias.alias}_${i}`;
            const tdElement = document.getElementById(tdId);
            const datasetSubjectCode = tdElement.dataset.subjectCode;
            // console.log(
            //     "dataset",
            //     datasetSubjectCode && datasetSubjectCode !== subjectCode
            // );
            // console.log("rowspan", tdElement.rowSpan > 1);
            // console.log(tdElement.style.display === "hidden");
            if (datasetSubjectCode && datasetSubjectCode !== subjectCode)
                return false;

            if (tdElement.rowSpan > 1) return false;

            if (tdElement.style.display === "hidden") return false;
        }
        // console.log("=================END CHECK CLASS==================");
        return true;
    }

    unCheck(id) {
        const checkbox = document.querySelector(`input[id*="${id}"]`);
        checkbox.checked = false;
    }

    async saveToDB() {
        const enrollId = localStorage.get("enrollId");
        const enrollPassword = localStorage.get("enrollPassword");

        const getSchedule = document.querySelectorAll("td[data-schedule-id]");

        // Create an object to store unique data-schedule-id values
        const scheduleIds = [];

        // Filter out duplicates
        Array.from(getSchedule).forEach((element) => {
            const scheduleId = element.dataset.scheduleId;
            if (!scheduleIds.includes(scheduleId)) {
                scheduleIds.push(scheduleId);
            }
        });
        const url = `/api/addPersonalSchedule`;
        const body = {
            enrollId,
            password: enrollPassword,
            schedule: scheduleIds,
        };

        const response = await axiosPost(url, body);
    }
}

export default new ScheduleView();
