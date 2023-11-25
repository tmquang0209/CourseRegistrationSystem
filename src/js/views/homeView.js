import * as elements from "../elements";
class HomeView {
    dataForm = [];
    constructor() {}

    render() {
        const markup = `<div class="container">
        <div class="row align-items-center">
            <div class="col-4">
                <select name="year" id="year" class="form-control">
                    <option value="">Chọn năm học</option>
                </select>
            </div>
            <div class="col-4">
                <select name="semester" id="semester" class="form-control">
                    <option value="">Chọn kỳ học</option>
                </select>
            </div>
            <div class="col-4">
                <input type="text" class="form-control" id="search" placeholder="Tìm kiếm môn học">
            </div>
        </div>
    </div>`;

        elements.view.innerHTML = markup;
    }

    updateForm(data) {
        this.dataForm = data;
        const year = document.getElementById("year");
        console.log(data);
        data.map((item) => {
            const markup = `<option value="${item.yearId}">${item.yearName}</option>`;
            year.insertAdjacentHTML("beforeend", markup);
        });
    }

    renderView(data) {
        console.log("data in view");
        let table = "";
        data.forEach((item, index) => {
            table += `<tr>
            <td>${index + 1}</td>
            <td>${item.subject.subjectCode}</td>
            <td>${item.subject.subjectName}</td>
            <td>${item.className}</td>
            <td>${item.day}</td>
            <td>${item.shift}</td>
            <td>${item.subject.credits}</td>
            <td>${item.teacher}</td>
            </tr>`;
        });
        const markup = `
        <div class="row" style="margin-top: 20px;">
            <table id="result" class="table table-bordered">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã môn</th>
                        <th>Tên môn</th>
                        <th>Tên lớp</th>
                        <th>Thứ</th>
                        <th>Ca</th>
                        <th>Số TC</th>
                        <th>Giảng viên</th>
                    </tr>
                </thead>
                <tbody>
                ${table}
                </tbody>
            </table>
        </div>
        `;
        const container = document.querySelector(".container");
        const tableElement = container.querySelector(".table");
        if (tableElement) container.removeChild(tableElement);
        container.insertAdjacentHTML("beforeend", markup);
    }
}

export default new HomeView();
