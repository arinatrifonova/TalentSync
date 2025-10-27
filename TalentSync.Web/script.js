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