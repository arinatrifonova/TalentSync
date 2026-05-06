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
        loadResume();
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

                const userId = localStorage.getItem("userId"); // пока оставляем userId в localStorage, но не safeVacancies

                likeBtn.addEventListener("click", async (event) => {
                    event.stopPropagation();
                    likeBtn.classList.toggle("liked");
                    const isLiked = likeBtn.classList.contains("liked");
                    likeBtn.textContent = isLiked ? "Сохранено" : "Сохранить";

                    if (isLiked) {
                        // добавить в БД
                        await addFavoriteVacancy(userId, vacancy);
                    } else {
                        // удалить из БД
                        await removeFavoriteVacancy(userId, vacancy.id);
                        // возможно, удаляем div из DOM при желании
                        // div.remove();
                    }
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

async function addFavoriteVacancy(userId, vacancy) {
    await fetch("https://localhost:64102/api/favorite_vacancies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: parseInt(userId, 10),
            vacancyId: vacancy.id,
            vacancyName: vacancy.name,
            vacancyDescription: vacancy.description || ""  
        })
    });
}

async function removeFavoriteVacancy(userId, vacancyId) {
    await fetch(
        `https://localhost:64102/api/favorite_vacancies/${vacancyId}?userId=${userId}`,
        { method: "DELETE" }
    );
}

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
    likeBtn.addEventListener("click", async () => {
        likeBtn.classList.toggle("liked");
        const isLiked = likeBtn.classList.contains("liked");
        likeBtn.textContent = isLiked ? "Сохранено" : "Сохранить";

        const userId = localStorage.getItem("userId");
        if (isLiked) {
            await addFavoriteVacancy(userId, vacancy);
        } else {
            await removeFavoriteVacancy(userId, vacancy.id);
        }
    });

}

// мои резюме 
// загрузить вакансии при открытии страницы 
async function loadSavedVacancies(savedContainer) {
    const userId = localStorage.getItem("userId");

    try {
        // 1. загружаем резюме, чтобы получить resumeId
        const resumeResp = await fetch(
            `https://localhost:64102/api/resume?userId=${userId}`
        );
        //const resume = await resumeResp.json();
        //const resumeId = resume.id;

        const resumes = await resumeResp.json();

        if (!resumes || resumes.length === 0) {
            alert("Нет резюме");
            return;
        }

        const resumeId = resumes[0].id; 

        // 2. загружаем список id сохранённых вакансий
        const resp = await fetch(
            `https://localhost:64102/api/favorite_vacancies?userId=${userId}`
        );
        const favoriteVacancySummary = await resp.json();

        console.log("1. favoriteVacancySummary:", favoriteVacancySummary);

        if (!favoriteVacancySummary || favoriteVacancySummary.length === 0) {
            savedContainer.innerHTML = "<p>Нет сохранённых вакансий.</p>";
            return;
        }

        savedContainer.innerHTML = "";

        // 3. один раз загружаем мок всех вакансий
        const vacancyResp = await fetch("https://localhost:64102/api/vacancies"); // без query!
        const vacancySource = await vacancyResp.json();

        const vacancyList = Array.isArray(vacancySource)
            ? vacancySource
            : vacancySource.items || [];

        console.log("2. vacancyList:", vacancyList);

        for (const fv of favoriteVacancySummary) {
            console.log("3. fv.id:", fv.id);

            const vacancy = vacancyList.find(v => String(v.id) === String(fv.id));

            console.log("4. found vacancy:", vacancy);

            if (!vacancy) continue;

            const div = createVacancyDiv(vacancy, userId, resumeId);
            savedContainer.appendChild(div);
        }
    } catch (err) {
        console.error("Ошибка загрузки сохранённых вакансий:", err);
        savedContainer.innerHTML = "<p>Ошибка при загрузке сохранённых вакансий.</p>";
    }
}

function createVacancyDiv(vacancy, userId, resumeId) {
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

    const likeBtn = document.createElement("button");
    likeBtn.textContent = "Сохранено";
    likeBtn.classList.add("actionButton", "likeButton", "liked");

    likeBtn.addEventListener("click", async (event) => {
        event.stopPropagation();
        likeBtn.classList.toggle("liked");
        const isLiked = likeBtn.classList.contains("liked");
        likeBtn.textContent = isLiked ? "Сохранено" : "Сохранить";

        if (!isLiked) {
            await removeFavoriteVacancy(userId, vacancy.id);
            div.remove();
        }
    });

    const checkBtn = document.createElement("button");
    checkBtn.textContent = "Проверить на соответствие";
    checkBtn.classList.add("actionButton", "checkButton");
    checkBtn.type = "button";

    checkBtn.addEventListener("click", async (event) => {
        event.stopPropagation();

        const resumeTextResponse = await fetch(
            `https://localhost:64102/api/resume/${resumeId}/text`
        );
        if (!resumeTextResponse.ok) {
            const err = await resumeTextResponse.text();
            alert("Ошибка получения резюме: " + err);
            return;
        }

        const resumeText = await resumeTextResponse.text();

        const job_text = vacancy.description || "Описание вакансии не указано.";

        const response = await fetch("http://localhost:8000/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                resume_text: resumeText,
                job_text: job_text
            })
        });

        if (!response.ok) {
            const text = await response.text();
            alert("Не удалось проверить резюме: " + text);
            return;
        }

        const result = await response.json();
        await saveResumeAnalysis(resumeId, result, vacancy);
        showResultBlock(div, result);
    });

    buttonGroup.appendChild(likeBtn);
    buttonGroup.appendChild(checkBtn);

    div.appendChild(title);
    div.appendChild(company);
    div.appendChild(salary);
    div.appendChild(buttonGroup);

    return div;
}

async function saveResumeAnalysis(resumeId, result, vacancy) {
    const analysisDto = {
        resumeId: parseInt(resumeId, 10),
        vacancyId: vacancy.id,
        score: result.score,
        missingSkills: result.missing,
        recommendations: result.recommendations.join("\n")
    };

    console.log("Отправка результатов анализа:", analysisDto);

    try {
        const response = await fetch("https://localhost:64102/api/analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(analysisDto)
        });

        const text = await response.text();
        console.log("Ответ /api/analysis:", text);

        if (!response.ok) {
            console.error("Ошибка сохранения анализа:", text);
        }
    } catch (err) {
        console.error("Ошибка запроса к /api/analysis:", err);
    }
}

function showResultBlock(parent, result) {
    const resultBlock = document.createElement("div");
    resultBlock.classList.add("check-result");

    resultBlock.innerHTML = `
        <h4>Результат</h4>
        <p><strong>Score:</strong> ${result.score.toFixed(2)}</p>
        <p><strong>Совпадения:</strong> ${result.matches.join(", ")}</p>
        <p><strong>Не хватает:</strong> ${result.missing.join(", ")}</p>
        <p><strong>Рекомендации:</strong><br>${result.recommendations.join("<br>")}</p>
    `;

    parent.appendChild(resultBlock);
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

    //nextBtn.addEventListener("click", async () => {
    //    if (currentStep < steps.length - 1) {
    //        currentStep++;
    //        showStep(currentStep);
    //        return;
    //    }

    //    // дошли до последнего шага — собираем данные и отправляем резюме
    //    const userId = localStorage.getItem("userId");
    //    if (!userId) {
    //        alert("Сначала войдите в систему.");
    //        return;
    //    }

    //    const formData = new FormData(resumeForm); // resumeForm уже есть в DOM
    //    const data = Object.fromEntries(formData.entries());
    //    const born = data.born?.trim();

    //    let birthDate = null;

    //    if (born && /^\d{4}-\d{2}-\d{2}$/.test(born)) {
    //        birthDate = born + "T00:00:00";
    //    }

    //    const empType = Array.isArray(data.employmentType)
    //        ? data.employmentType.join(", ")
    //        : (data.employmentType || "");

    //    const resumeDto = {
    //        //id: resumeId,
    //        userId: parseInt(userId, 10),
    //        profession: data.profession.trim(),
    //        fullName: data.fullname,
    //        phone: data.number,
    //        email: data.email,
    //        //birthDate: data.born ? data.born + "T00:00:00" : null,
    //        birthDate,
    //        citizenship: data.citizen,
    //        // образование
    //        educationPlace: data.educationPlace || "",
    //        faculty: data.faculty || "",
    //        specialization: data.specialization || "",
    //        educationLevel: data.educationLevel || "",
    //        graduationYear: data.graduationYear ? parseInt(data.graduationYear, 10) : null,

    //        // занятость и формат
    //        employmentType: empType,
    //        workFormat: data.workFormat || "",

    //        skills: data.skills ? data.skills.trim() : "",
    //        about: data.about || ""

    //    };

    //    console.log("Отправляем резюме:", resumeDto);

    //    try {
    //        const response = await fetch("https://localhost:64102/api/resume", {
    //            method: "POST",
    //            headers: {
    //                "Content-Type": "application/json"
    //            },
    //            body: JSON.stringify(resumeDto)
    //        });

    //        if (!response.ok) {
    //            const text = await response.text();
    //            alert("Ошибка: " + text);
    //            console.error("Ошибка сервера:", text);
    //            return;
    //        }

    //        const result = await response.json();
    //        alert("Резюме сохранено (id: " + result.id + ")");
    //        resumeModal.style.display = "none";
    //        currentStep = 0;
    //        showStep(currentStep);

    //    } catch (err) {
    //        console.error("Ошибка сети:", err);
    //        alert("Не удалось отправить резюме. Проверь консоль.");
    //    }
    //});

    //const nextBtn = document.getElementById("nextBtn");
    nextBtn.addEventListener("click", async (event) => {
        const profession = document.getElementById("profession").value;
        const fullname = document.getElementById("fullname").value;
        const phone = document.getElementById("number").value;
        const email = document.getElementById("email").value;
        const birthDate = document.getElementById("born").value;
        const citizenship = document.getElementById("citizen").value;
        const educationPlace = document.getElementById("educationPlace").value;
        const faculty = document.getElementById("faculty").value;
        const specialization = document.getElementById("specialization").value;
        const educationLevel = document.getElementById("educationLevel").value;
        const graduationYear = document.getElementById("graduationYear").value;
        const employmentType = document.querySelector(
            "input[name='employmentType']:checked"
        )?.value;
        const workFormat = document.querySelector(
            "input[name='workFormat']:checked"
        )?.value;
        const skills = document.getElementById("skills").value;
        const about = document.getElementById("about").value;

        const resumeDto = {
            userId,
            profession,
            fullName: fullname,
            phone,
            email,
            birthDate,
            citizenship,
            educationPlace,
            faculty,
            specialization,
            educationLevel,
            graduationYear,
            employmentType,
            workFormat,
            skills,
            about
        };

        let url, method;
        if (window.currentResumeId) {
            url = `https://localhost:64102/api/resume/${window.currentResumeId}`;
            method = "PUT";
        } else {
            url = "https://localhost:64102/api/resume";
            method = "POST";
        }

        const resp = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resumeDto)
        });

        if (!resp.ok) {
            alert("Ошибка сохранения резюме");
            return;
        }

        document.getElementById("resumeModal").style.display = "none";
        await loadResume(); // перезагрузить список
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

// личный кабинет загрузка данных пользователя
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

// загрузить резюме пользователя
async function loadResume() {
    const userId = localStorage.getItem("userId");
    const container = document.getElementById("currentResumeContainer");

    if (!userId || !container) return;

    try {
        const response = await fetch(`https://localhost:64102/api/resume?userId=${userId}`);

        if (response.status === 404) {
            container.innerHTML = `
                <p>Резюме не найдено. <button id="createResumeBtn" type="button">Создать резюме</button></p>
            `;
            const createBtn = document.getElementById("createResumeBtn");
            if (createBtn) {
                createBtn.addEventListener("click", () => {
                    document.getElementById("addResumeBtn").click();
                });
            }
            return;
        }

        if (!response.ok) {
            const text = await response.text();
            container.innerHTML = `<p>Ошибка загрузки резюме: <code>${text}</code></p>`;
            return;
        }

        //const resume = await response.json();
        const resumes = await response.json();
        container.innerHTML = "";

        resumes.forEach(resume => {
            const card = document.createElement("div");
            card.className = "resume-card";
            card.innerHTML = `
                <h3>${resume.profession || ""}</h3>
                <p><strong>ФИО:</strong> ${resume.fullName || ""}</p>
                <p><strong>Телефон:</strong> ${resume.phone || "не указан"}</p>
                <p><strong>Email:</strong> ${resume.email || "не указан"}</p>
                <p><strong>Гражданство:</strong> ${resume.citizenship || "не указано"}</p>
                <p><strong>Образование:</strong></p>
                <p><strong>Факультет:</strong> ${resume.faculty || "не указан"}</p>
                <p><strong>Специализация:</strong> ${resume.specialization || "не указана"}</p>
                <p><strong>Уровень образования:</strong> ${resume.educationLevel || "не указан"}</p>
                <p><strong>Год окончания:</strong> ${resume.graduationYear || "не указан"}</p>
                <p><strong>Навыки:</strong> ${resume.skills || "не указаны"}</p>
                <p><strong>О себе:</strong> ${resume.about || "не указано"}</p>
                <div class="resume-actions">
                    <button class="editResumeBtn" data-id="${resume.id}" type="button">Редактировать</button>
                    <button class="deleteResumeBtn" data-id="${resume.id}" type="button">Удалить</button>
                </div>
            `;

            container.appendChild(card);
        });

        // активируем кнопки редактирования и удаления
        document.querySelectorAll(".editResumeBtn").forEach(btn => {
            btn.addEventListener("click", () => {
                const resumeId = btn.dataset.id;
                openEditModal(resumeId);
            });
        });

        document.querySelectorAll(".deleteResumeBtn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const resumeId = btn.dataset.id;
                await deleteResume(resumeId, btn.closest(".resume-card"));
            });
        });

        //container.innerHTML = `
        //    <div class="resume-card">
        //        <h3>${resume.profession}</h3>
        //        <p><strong>ФИО:</strong> ${resume.fullName}</p>
        //        <p><strong>Телефон:</strong> ${resume.phone || "не указан"}</p>
        //        <p><strong>Email:</strong> ${resume.email || "не указан"}</p>
        //        <p><strong>Гражданство:</strong> ${resume.citizenship || "не указано"}</p>
        //        <p><strong>Образование:</strong> ${resume.educationPlace || "не указано"}</p>
        //        <p><strong>Специальность:</strong> ${resume.educationSpeciality || "не указана"}</p>
        //        <p><strong>Навыки:</strong> ${resume.skills || "не указаны"}</p>
        //        <p><strong>Тип занятости:</strong> ${resume.employmentType || "не указан"}</p>
        //        <p><strong>Формат работы:</strong> ${resume.workFormat || "не указан"}</p>
        //        <p><strong>Уровень образования:</strong> ${resume.educationLevel || "не указан"}</p>
        //        <p><strong>Год окончания:</strong> ${resume.graduationYear || "не указан"}</p>
        //        <p><strong>Факультет:</strong> ${resume.faculty || "не указан"}</p>
        //        <p><strong>Специализация:</strong> ${resume.specialization || "не указана"}</p>
        //        <p><strong>О себе:</strong></p>
        //        <p>${resume.about ? resume.about.replace(/\n/g, "<br>") : "не указано"}</p>
        //        <button id="editResumeBtn" type="button">Редактировать</button>
        //        <button id="deleteResumeBtn" type="button">Удалить</button>
        //    </div>
        //`;

        // кнопка редактировать
        const editBtn = document.getElementById("editResumeBtn");
        if (editBtn) {
            editBtn.addEventListener("click", () => {
                // заполняем форму из модели и открываем modal
                document.getElementById("profession").value = resume.profession || "";
                document.getElementById("fullname").value = resume.fullName || "";
                document.getElementById("number").value = resume.phone || "";
                document.getElementById("email").value = resume.email || "";
                document.getElementById("born").value = resume.birthDate ? resume.birthDate.split("T")[0] : "";
                document.getElementById("citizen").value = resume.citizenship || "";
                document.getElementById("education").value = resume.educationPlace || "";
                document.getElementById("speciality").value = resume.educationSpeciality || "";
                document.getElementById("skills").value = resume.skills || "";
                document.getElementById("about").value = resume.about || "";

                document.getElementById("resumeModal").style.display = "flex";
                nextBtn.textContent = "Сохранить изменения";
                // здесь можно добавить поле resumeId куда‑нибудь в скрытый input
                // и в `fetch` в `nextBtn` добавить `resumeId` в DTO
            });
        }

    } catch (err) {
        console.error("Ошибка загрузки резюме:", err);
        container.innerHTML = "<p>Не удалось загрузить резюме. Проверь консоль.</p>";
    }
}

async function openEditModal(resumeId) {
    const response = await fetch(`https://localhost:64102/api/resume/${resumeId}`);
    const resume = await response.json();

    // заполняем форму
    document.getElementById("profession").value = resume.profession || "";
    document.getElementById("fullname").value = resume.fullName || "";
    document.getElementById("number").value = resume.phone || "";
    document.getElementById("email").value = resume.email || "";
    document.getElementById("born").value = resume.birthDate
        ? resume.birthDate.split("T")[0]
        : "";
    document.getElementById("citizen").value = resume.citizenship || "";
    document.getElementById("educationPlace").value = resume.educationPlace || "";
    document.getElementById("faculty").value = resume.faculty || "";
    document.getElementById("specialization").value = resume.specialization || "";
    document.getElementById("educationLevel").value = resume.educationLevel || "";
    document.getElementById("graduationYear").value = resume.graduationYear || "";
    document.getElementById("employmentType").value = resume.employmentType || "";
    document.getElementById("workFormat").value = resume.workFormat || "";
    document.getElementById("skills").value = resume.skills || "";
    document.getElementById("about").value = resume.about || "";

    document.getElementById("resumeModal").style.display = "flex";
    window.currentResumeId = resumeId; // запоминаем id для PUT
    document.getElementById("nextBtn").textContent = "Сохранить изменения";
}

async function deleteResume(resumeId, cardElement) {
    if (!confirm("Удалить резюме?")) return;

    const response = await fetch(
        `https://localhost:64102/api/resume/${resumeId}`,
        { method: "DELETE" }
    );

    if (!response.ok) {
        alert("Ошибка удаления резюме");
        return;
    }

    cardElement.remove();
}

// загрузка фотографии
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.location.pathname.includes("personal_account.html")) return;
    await loadUserProfile();

    const profilePhoto = document.getElementById("profilePhoto");
    const photoUpload = document.getElementById("photoUpload");

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const savedPhoto = localStorage.getItem("userPhoto_" + userId);
    if (savedPhoto && profilePhoto) {
        profilePhoto.src = savedPhoto;
    }

    if (profilePhoto && photoUpload) {
        profilePhoto.addEventListener("click", () => {
            photoUpload.click();
        });

        // сжимаем фотку
        photoUpload.addEventListener("change", () => {
            const file = photoUpload.files[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;

                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    const maxSize = 600; 
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedData = canvas.toDataURL("image/jpeg", 0.7);

                    profilePhoto.src = compressedData;

                    try {
                        localStorage.setItem("userPhoto_" + userId, compressedData);
                    } catch (e) {
                        console.error("Ошибка сохранения фото:", e);
                        alert("Фото слишком большое, попробуйте выбрать другое.");
                    }
                };
            };

            reader.readAsDataURL(file);
        });
    }
});



async function logoutUser() {
    await fetch('/api/User/logout', { method: 'POST' });
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/appl_main.html';  
}

// редактирование профиля
document.addEventListener("DOMContentLoaded", () => {
    const editBtn = document.getElementById("editProfileBtn");
    const modal = document.getElementById("editProfileModal");
    const closeBtn = document.getElementById("closeEditProfile");
    const form = document.getElementById("editProfileForm");

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    async function fillForm() {
        const resp = await fetch(`https://localhost:64102/api/user/${userId}`);
        if (!resp.ok) return;
        const user = await resp.json();

        form.lastName.value = user.last_name || "";
        form.firstName.value = user.first_name || "";
        form.telephone_number.value = user.telephone_number || "";
        form.email.value = user.email || "";
    }

    editBtn.addEventListener("click", () => {
        fillForm();
        modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", e => {
        if (e.target === modal) modal.style.display = "none";
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            LastName: form.lastName.value,
            FirstName: form.firstName.value,
            Telephone_number: form.telephone_number.value,
            Email: form.email.value
        };

        const resp = await fetch(`https://localhost:64102/api/user/${userId}`, {
            method: "PUT", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (resp.ok) {
            alert("Профиль успешно обновлен");
            modal.style.display = "none";
            loadUserProfile();
        } else {
            const err = await resp.json();
            alert("Ошибка: " + (err.error || "Неизвестная ошибка"));
        }
    });
});


document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        email: e.target.email.value,
        password: e.target.password.value
    };

    const response = await fetch("https://localhost:64102/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        const result = await response.json();
        localStorage.setItem("userId", result.id);
        window.location.href = "/pages/personal_account.html";
    } else {
        alert("Неверный email или пароль");
    }
});
