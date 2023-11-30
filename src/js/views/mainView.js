import { menu, view } from "../elements";

class MainView {
    _title = "DangKyHoc";
    _navItem = [
        { url: "#home", title: "Trang chủ", active: true },
        { url: "#enroll", title: "Thời khóa biểu", active: false },
        { url: "#tool", title: "Công cụ", active: false },
        { url: "#about_me", title: "About me", active: false },
    ];

    constructor() {
        const HASH_URI = window.location.hash;
        this._navItem.forEach((item) => (item.active = item.url === HASH_URI));

        // Bind the event listener to the instance of the class
        this.handleHashChange = this.handleHashChange.bind(this);
        // Add the event listener when the instance is created
        window.addEventListener("hashchange", this.handleHashChange);
    }

    render() {
        this.header();
    }

    header() {
        const markup = `<header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
        <a href="/#home" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
            <svg class="bi me-2" width="40" height="32">
                <use xlink:href="#bootstrap" />
            </svg>
            <span class="fs-4">${this._title}</span>
        </a>

        <ul class="nav nav-pills">
        ${this._navItem
            .map(
                (item) =>
                    `<li class="nav-item"><a href="/${
                        item.url
                    }" class="nav-link ${item.active ? "active" : ""}">${
                        item.title
                    }</a></li>`
            )
            .join("")}
        </ul>
    </header>`;

        menu.innerHTML = markup; // Use innerHTML to replace the content
    }

    handleHashChange() {
        const HASH_URI = window.location.hash;
        this._navItem.forEach((item) => {
            item.active = item.url === HASH_URI;
        });

        // Update the header after the hash changes
        this.header();
    }

    updateView(data) {
        view.innerHTML = data;
    }
}

export default new MainView();
