const btnOptions = document.getElementById('btn-options-saludmental');
const kebabMenu = document.getElementById('kebab-menu-saludmental');
const btnRegresar = document.getElementById('btn-regresar');

btnOptions.addEventListener('click', (e) => {
    e.stopPropagation();
    kebabMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    if (!kebabMenu.contains(e.target)) {
        kebabMenu.classList.remove('show');
    }
});

btnRegresar.addEventListener('click', (e) => {
    e.preventDefault();
    window.history.back();
});