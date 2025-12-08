// главная (переключаться соискатель-работодатель)
document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop();

    const applLink = document.getElementById("applicant-link");
    const empLink = document.getElementById("employer-link");

    if (!applLink || !empLink) return; 

    applLink.classList.remove("active-black", "active-blue");
    empLink.classList.remove("active-black", "active-blue");

    if (currentPage === "appl_main.html") {
        applLink.classList.add("active-black");
        empLink.classList.add("active-blue");
    } else if (currentPage === "emp_main.html") {
        empLink.classList.add("active-black");
        applLink.classList.add("active-blue");
    }
});

// личный кабинет (переключаться лк-мои резюме)
function switchTab(tab) {
    const profileSection = document.getElementById('profile-section');
    const resumeSection = document.getElementById('resume-section');
    const buttons = document.querySelectorAll('.switch-btn');

    buttons.forEach(btn => btn.classList.remove('active'));

    if (tab === 'profile') {
        profileSection.style.display = 'block';
        resumeSection.style.display = 'none';
        buttons[0].classList.add('active');
    } else {
        profileSection.style.display = 'none';
        resumeSection.style.display = 'block';
        buttons[1].classList.add('active');
    }
}

// подключаться к hh
async function loadVacancies(query) {
    // удалить старые результаты, если есть
    const oldResults = document.querySelector(".vacancy-results");
    if (oldResults) oldResults.remove();

    try {
        const response = await fetch(`https://localhost:64102/api/vacancies?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

        const data = await response.json();

        const resultsContainer = document.createElement("div");
        resultsContainer.classList.add("vacancy-results");

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(vacancy => {
                const div = document.createElement("div");
                div.classList.add("vacancy");

                const title = document.createElement("h3");
                title.textContent = vacancy.name;

                const company = document.createElement("p");
                company.textContent = vacancy.employer?.name || "Компания не указана";

                const salary = document.createElement("p");
                if (vacancy.salary) {
                    const { from, to, currency } = vacancy.salary;
                    salary.textContent =
                        (from || to)
                            ? `${from || ''}–${to || ''} ${currency || ''}`
                            : "Зарплата не указана";
                } else {
                    salary.textContent = "Зарплата не указана";
                }

                const buttonGroup = document.createElement("div");
                buttonGroup.classList.add("button-group");

                const applyBtn = document.createElement("button");
                applyBtn.textContent = "Откликнуться";
                applyBtn.classList.add("actionButton", "applyButton");
                applyBtn.type = "button";
                applyBtn.addEventListener("click", (event) => {
                    event.stopPropagation();
                    //alert(`Спасибо за отклик на вакансию "${vacancy.name}"!`);
                });

                const likeBtn = document.createElement("button");
                likeBtn.textContent = "Сохранить";
                likeBtn.classList.add("actionButton", "likeButton");
                likeBtn.type = "button";

                likeBtn.addEventListener("click", (event) => {
                    event.stopPropagation(); // чтобы не открывалось модальное окно
                    likeBtn.classList.toggle("liked");
                    const isLiked = likeBtn.classList.contains("liked");
                    likeBtn.textContent = isLiked ? "Сохранено" : "Сохранить";

                    // сохраняем или удаляем из localStorage
                    let savedVacancies = JSON.parse(localStorage.getItem("savedVacancies")) || [];
                    if (isLiked) {
                        // Добавляем вакансию, если её нет
                        if (!savedVacancies.some(v => v.id === vacancy.id)) {
                            savedVacancies.push(vacancy);
                        }
                    } else {
                        // Удаляем, если убрали лайк
                        savedVacancies = savedVacancies.filter(v => v.id !== vacancy.id);
                    }
                    localStorage.setItem("savedVacancies", JSON.stringify(savedVacancies));
                });

                buttonGroup.appendChild(applyBtn);
                buttonGroup.appendChild(likeBtn);

                div.appendChild(title);
                div.appendChild(company);
                div.appendChild(salary);
                div.appendChild(buttonGroup);

                // открываем модальное коно при клике
                div.addEventListener("click", () => showVacancyModal(vacancy));

                resultsContainer.appendChild(div);
            });
        } else {
            resultsContainer.textContent = "Вакансии не найдены";
        }
        document.querySelector("main").appendChild(resultsContainer);
    } catch (error) {
        alert("Ошибка при загрузке вакансий: " + error.message);
    }
}

// обработчик поиска
document.querySelector(".search-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = e.target.querySelector("input[name='query']").value.trim();
    if (!query) return;
    await loadVacancies(query);
});

// функция отображения модального окна
function showVacancyModal(vacancy) {
    const modal = document.createElement("div");
    modal.classList.add("vacancy-modal");
    modal.innerHTML = `
        <div class="vacancy-modal-content">
            <span class="close">&times;</span>
            <h2>${vacancy.name}</h2>
            <p><strong>Компания:</strong> ${vacancy.employer?.name || "Не указана"}</p>
            <p><strong>Зарплата:</strong> ${vacancy.salary
            ? `${vacancy.salary.from || ''}–${vacancy.salary.to || ''} ${vacancy.salary.currency || ''}`
            : "Не указана"
        }</p>
            <div class="vacancy-description">${vacancy.description || "Описание отсутствует"}</div>

            <div class="button-group">
                <button id="applyButton" class="actionButton applyButton" type="button">Откликнуться на вакансию</button>
                <button id="likeButton" class="actionButton likeButton" type="button">Сохранить</button>
            </div>

        </div>
    `;

    document.body.appendChild(modal);

    // закрыть окна
    modal.querySelector(".close").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
    });

    // логика Сохранить внутри модального кона
    const likeBtn = modal.querySelector(".likeButton");
    likeBtn.addEventListener("click", () => {
        likeBtn.classList.toggle("liked");
        const isLiked = likeBtn.classList.contains("liked");
        likeBtn.textContent = isLiked ? "Сохранено" : "Сохранить";

        let savedVacancies = JSON.parse(localStorage.getItem("savedVacancies")) || [];
        if (isLiked) {
            if (!savedVacancies.some(v => v.id === vacancy.id)) {
                savedVacancies.push(vacancy);
            }
        } else {
            savedVacancies = savedVacancies.filter(v => v.id !== vacancy.id);
        }
        localStorage.setItem("savedVacancies", JSON.stringify(savedVacancies));
    });

}

// мои резюме 
// загрузить вакансии при открытии страницы 
function loadSavedVacancies(savedContainer) {
    const savedVacancies = JSON.parse(localStorage.getItem("savedVacancies")) || [];
    savedContainer.innerHTML = "";

    if (savedVacancies.length === 0) {
        savedContainer.innerHTML = "<p>Нет сохранённых вакансий.</p>";
        return;
    }

    savedVacancies.forEach(vacancy => {
        const div = document.createElement("div");
        div.classList.add("vacancy");

        const title = document.createElement("h3");
        title.textContent = vacancy.name;

        const company = document.createElement("p");
        company.textContent = vacancy.employer?.name || "Компания не указана";

        const salary = document.createElement("p");
        if (vacancy.salary) {
            const { from, to, currency } = vacancy.salary;
            salary.textContent = (from || to)
                ? `${from || ''}–${to || ''} ${currency || ''}`
                : "Зарплата не указана";
        } else {
            salary.textContent = "Зарплата не указана";
        }

        const buttonGroup = document.createElement("div");
        buttonGroup.classList.add("button-group");

        const likeBtn = document.createElement("button");
        likeBtn.textContent = "Сохранено";
        likeBtn.classList.add("actionButton", "likeButton", "liked");
        likeBtn.type = "button";

        likeBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            likeBtn.classList.toggle("liked");
            const isLiked = likeBtn.classList.contains("liked");
            likeBtn.textContent = isLiked ? "Сохранено" : "Сохранить";

            let savedVacancies = JSON.parse(localStorage.getItem("savedVacancies")) || [];
            if (isLiked) {
                // если удалили обратно добавляем
                if (!savedVacancies.some(v => v.id === vacancy.id)) {
                    savedVacancies.push(vacancy);
                }
            } else {
                // удаляем из сохраненок
                savedVacancies = savedVacancies.filter(v => v.id !== vacancy.id);
                div.remove(); 
            }
            localStorage.setItem("savedVacancies", JSON.stringify(savedVacancies));
        });

        const checkBtn = document.createElement("button");
        checkBtn.textContent = "Проверить на соответствие";
        checkBtn.classList.add("actionButton", "checkButton");
        checkBtn.type = "button";
        checkBtn.addEventListener("click", (event) => {
            event.stopPropagation();

            // проверить есть ли блок с рез-том под вакансией (если да удаляем)
            const existingResult = div.querySelector(".check-result");
            if (existingResult) {
                existingResult.remove();
                return;
            }

            const resultBlock = document.createElement("div");
            resultBlock.classList.add("check-result");

            const title = document.createElement("h4");
            title.textContent = "Результат проверки резюме";

            const p1 = document.createElement("p");
            p1.innerHTML = `Проверяем ваше резюме на соответствие вакансии <strong>${vacancy.name}</strong>.`;

            const p2 = document.createElement("p");
            p2.textContent = "Здесь будет результат проверки и рекомендации.";

            const newResumeBtn = document.createElement("button");
            newResumeBtn.type = "button";
            newResumeBtn.textContent = "Новое резюме";
            newResumeBtn.classList.add("actionButton", "newResumeButton");
            newResumeBtn.addEventListener("click", () => {
                const addBtn = document.getElementById("addResumeBtn");
                if (addBtn) addBtn.click(); 
            });

            const closeBtn = document.createElement("button");
            closeBtn.type = "button";
            closeBtn.classList.add("close-result-btn");
            //closeBtn.textContent = "Закрыть"; 

            closeBtn.addEventListener("click", () => {
                resultBlock.remove();
            });

            resultBlock.appendChild(closeBtn);
            resultBlock.appendChild(title);
            resultBlock.appendChild(p1);
            resultBlock.appendChild(p2);
            resultBlock.appendChild(newResumeBtn);

            div.appendChild(resultBlock);
        });

        buttonGroup.appendChild(likeBtn);
        buttonGroup.appendChild(checkBtn);

        div.appendChild(title);
        div.appendChild(company);
        div.appendChild(salary);
        div.appendChild(buttonGroup);

        savedContainer.appendChild(div);

    });

    function showVacancyDetails(vacancy) {
        detailsBlock.classList.add("active");
        detailsBlock.innerHTML = `
            <h3>${vacancy.name}</h3>
            <p><strong>Компания:</strong> ${vacancy.employer?.name || "Не указана"}</p>
            <p><strong>Зарплата:</strong> ${vacancy.salary
                ? `${vacancy.salary.from || ''}–${vacancy.salary.to || ''} ${vacancy.salary.currency || ''}`
                : "Не указана"}</p>
            <p><strong>Описание:</strong></p>
            <p>${vacancy.description || "Описание отсутствует."}</p>
        `;
    }

    function showCheckResultModal(vacancy) {
        const modal = document.createElement("div");
        modal.classList.add("vacancy-modal");
        modal.innerHTML = `
        <div class="vacancy-modal-content">
            <span class="close">&times;</span>
            <h2>Результат проверки резюме</h2>
            <p>Проверяем ваше резюме на соответствие вакансии <strong>${vacancy.name}</strong>.</p>
            <p>Здесь результат проверки и рекомендации</p>
            <button class="close-btn">Закрыть</button>
        </div>
    `;
        document.body.appendChild(modal);

        function closeModal() {
            modal.remove();
        }

        modal.querySelector(".close").addEventListener("click", closeModal);
        modal.querySelector(".close-btn").addEventListener("click", closeModal);
        modal.addEventListener("click", e => {
            if (e.target === modal) closeModal();
        });
    }
}

// вакансии при загрузке страницы 
document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".search-form")) {
        loadVacancies("бариста"); // если это страница поиска
    }
    const savedContainer = document.querySelector(".saved-vacancies");
    if (savedContainer) {
        loadSavedVacancies(savedContainer);
    }
});

// personal account (мои резюме, кнопка добавить резюме)
const addResumeBtn = document.getElementById("addResumeBtn");
const resumeModal = document.getElementById("resumeModal");
if (addResumeBtn && resumeModal) {
    const closeModal = resumeModal.querySelector(".close");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const steps = document.querySelectorAll(".form-step");

    let currentStep = 0;

    addResumeBtn.addEventListener("click", () => {
        resumeModal.style.display = "flex";
        showStep(currentStep);
    });

    closeModal.addEventListener("click", () => {
        resumeModal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === resumeModal) resumeModal.style.display = "none";
    });

    function showStep(step) {
        steps.forEach((el, idx) => {
            el.classList.toggle("active", idx === step);
        });

        prevBtn.style.display = step === 0 ? "none" : "inline-block";
        nextBtn.textContent = step === steps.length - 1 ? "Сохранить" : "Далее";
    }

    nextBtn.addEventListener("click", () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
        } else {
            alert("Резюме успешно сохранено!");
            resumeModal.style.display = "none";
            currentStep = 0;
            showStep(currentStep);
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });
}


// регистрация
const registerForm = document.getElementById("register-form");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            lastName: e.target.lastName.value,
            firstName: e.target.firstName.value,
            telephone_number: e.target.number.value,
            email: e.target.email.value,
            password: e.target.password.value
        };

        const response = await fetch("https://localhost:64102/api/user/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            localStorage.setItem("userId", result.id);
            window.location.href = "/pages/personal_account.html";
        } else {
            const error = await response.json();
            alert("Ошибка: " + error.error);
        }
    });
}

//document.getElementById("register-form").addEventListener("submit", async (e) => {
//    e.preventDefault();

//    const data = {
//        lastName: e.target.lastName.value,
//        firstName: e.target.firstName.value,
//        telephone_number: e.target.number.value,
//        email: e.target.email.value,
//        password: e.target.password.value
//    };

//    const response = await fetch("https://localhost:64102/api/user/register", {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        body: JSON.stringify(data)
//    });

//    if (response.ok) {
//        alert("Регистрация прошла успешно!");
//        const result = await response.json();
//        // сохраняем id пользователя
//        localStorage.setItem("userId", result.id);
//        window.location.href = "/pages/personal_account.html";
//    } else {
//        const error = await response.json();
//        alert("Ошибка: " + error.error);
//    }
//});


// личный кабинет — загрузка данных пользователя
async function loadUserProfile() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const response = await fetch(`https://localhost:64102/api/user/${userId}`);
    if (!response.ok) return;

    const user = await response.json();

    const nameElement = document.querySelector(".profile-name");
    const phoneElement = document.querySelector(".phone p");
    const emailElement = document.querySelector(".email p");

    if (nameElement) {
        nameElement.textContent = `${user.first_name} ${user.last_name}`;
    }

    if (phoneElement) {
        phoneElement.textContent = user.telephone_number;
    }

    if (emailElement) {
        emailElement.textContent = user.email;
    }
}

if (window.location.pathname.includes("personal_account.html")) {
    loadUserProfile();
}





//
//document.getElementById("registerBtn").addEventListener("click", async () => {
//    const data = {
//        LastName: document.getElementById("lastName").value,
//        FirstName: document.getElementById("firstName").value,
//        Telephone_number: document.getElementById("number").value,
//        Email: document.getElementById("email").value,
//        Password: document.getElementById("password").value
//    };

//    const response = await fetch("/api/user/register", {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        body: JSON.stringify(data)
//    });

//    if (response.ok) {
//        alert("Регистрация прошла успешно!");
//    } else {
//        const error = await response.json();
//        alert("Ошибка: " + (error.error || "Неизвестная ошибка"));
//    }
//});
