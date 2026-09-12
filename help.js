const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('stayfinder-theme');
if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';

function updateThemeIcon() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeToggle.querySelector('i').className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}
updateThemeIcon();
themeToggle.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  localStorage.setItem('stayfinder-theme', dark ? 'dark' : 'light');
  updateThemeIcon();
});

document.querySelectorAll('.help-faq button').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.help-faq');
    const open = item.classList.toggle('open');
    button.setAttribute('aria-expanded', open);
  });
});

const search = document.getElementById('helpSearch');
const faqItems = [...document.querySelectorAll('.help-faq')];
const topicCards = [...document.querySelectorAll('.help-card')];
const empty = document.getElementById('helpEmpty');
const summary = document.getElementById('searchSummary');
search.addEventListener('input', () => {
  const term = search.value.trim().toLowerCase();
  let count = 0;
  faqItems.forEach(item => {
    const matches = !term || item.textContent.toLowerCase().includes(term) || item.dataset.search.includes(term);
    item.hidden = !matches;
    if (matches) count++;
  });
  topicCards.forEach(card => card.hidden = Boolean(term) && !(card.textContent.toLowerCase().includes(term) || card.dataset.search.includes(term)));
  empty.hidden = count > 0;
  summary.textContent = term ? `${count} answer${count === 1 ? '' : 's'} found for “${search.value.trim()}”.` : 'Quick answers to get you moving.';
});

document.getElementById('supportForm').addEventListener('submit', event => {
  event.preventDefault();
  event.currentTarget.reset();
  document.getElementById('formConfirmation').hidden = false;
});
