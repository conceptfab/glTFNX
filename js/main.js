// Usunięto funkcję copyDebugContent

function copyDebugContent() {
  const content = document.getElementById('render-info-content').textContent;
  navigator.clipboard
    .writeText(content)
    .then(() => {
      const button = document.querySelector('.copy-button');
      button.textContent = 'Skopiowano!';
      setTimeout(() => {
        button.textContent = 'Kopiuj do schowka';
      }, 2000);
    })
    .catch((err) => {
      console.error('Błąd podczas kopiowania:', err);
    });
}
