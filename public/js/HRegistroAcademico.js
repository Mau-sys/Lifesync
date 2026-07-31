const btnOptions = document.getElementById('btn-options-academico');
const kebabMenu = document.getElementById('kebab-menu-academico');

btnOptions.addEventListener('click', (e) => {
    e.stopPropagation();
    kebabMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    if (!kebabMenu.contains(e.target)) {
        kebabMenu.classList.remove('show');
    }
});