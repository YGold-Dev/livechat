function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(r => r.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            location.href = "chat.html";
        } else {
            alert(data.message);
        }
    });
}

function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(r => r.json())
    .then(data => {
        alert(data.message);
        if (data.message === "회원가입 성공!") {
            location.href = "login.html";
        }
    });
}

const toggle = document.getElementById("authToggle");
const tabs = document.querySelectorAll(".auth-tab");

tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        document.querySelectorAll("input").forEach(i => i.value = "");

        toggle.dataset.active = index;
    });
});

document.querySelector(".confirm").addEventListener("click", () => {
    const activeIndex = Number(toggle.dataset.active);

    if (activeIndex === 0) {
        login();
    } else {
        register();
    }
});

toggle.dataset.active = 0;