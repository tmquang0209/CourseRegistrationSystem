import { view } from "../elements";
class EnrollView {


    constructor() {}

    render() {
        const markup = `
        <div class="container">
            <div id="message"></div>
            <div class="row align-items-center">
                <div class="mb-3 col-6">
                    <input type="text" class="form-control" id="studentCode" placeholder="Mã sinh viên">
                </div>
                <div class="mb-3 col-6">
                    <input type="text" class="form-control" id="password" placeholder="Mật khẩu (nếu cần)">
                </div>
            </div>
            <div class="row align-items-center">
                <div class="mb-3 col-6">
                    <select name="year" id="year" class="form-control">
                        <option value="">Chọn năm học</option>
                    </select>
                </div>
                <div class="mb-3 col-6">
                    <select name="semester" id="semester" class="form-control">
                        <option value="">Chọn kỳ học</option>
                    </select>
                </div>
            </div>
            <button type="button" class="btn btn-primary" id="submit">Submit</button>
        </div>
        `;
        view.innerHTML = markup;
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

    renderNotification(message, type) {
        const messageElement = document.getElementById("message");
        messageElement.innerHTML = message
            ? `<div class="alert alert-${type}" role="alert">${message}</div>`
            : "";
    }
}

export default new EnrollView();
