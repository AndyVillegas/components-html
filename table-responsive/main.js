const $table = document.getElementById('table');
const $tableParent = $table.parentElement;
const $headers = $table.tHead.rows[0].cells;
const $rows = $table.tBodies[0].rows;
const columnsLength = $headers.length;
const style = getComputedStyle($tableParent);
const paddingExtra = (parseInt(style.paddingRight) + parseInt(style.paddingLeft));
const twbi = getTableWidthByIndex();
let lastIndex = $headers.length - 1; // El índice hace referencia a la última columna mostrada

function setEventToRows() {
  Array.from($rows).forEach(row => {
    row.addEventListener('click', () => {
      toggleTrChild(row);
    });
  });
}

function getTableWidthByIndex() {
  const twbi = [];
  let sum = 0;
  for (let i = 0; i < columnsLength; i++) {
    sum += $headers[i].clientWidth;
    twbi.push(sum);
  }
  return twbi;
}

function setDisplayLastColumn(displayValue) {
  $headers[lastIndex].style.display = displayValue;
  const rowsLength = $rows.length;
  for (let i = 0; i < rowsLength; i++) {
    $rows[i].cells[lastIndex].style.display = displayValue;
  }
}

function hideLastColumn() {
  setDisplayLastColumn('none');
  lastIndex--;// La última columna mostrada ahora pasa hacer una menos
}

function showLastColumn() {
  lastIndex++;// Aumentamos una unidad a la última columna mostrada para que así la función la muestre
  setDisplayLastColumn('table-cell');
}

function createTr() {
  const trChildElement = document.createElement('tr');
  trChildElement.classList.add('child');
  return trChildElement;
}

function createTd() {
  const tdElement = document.createElement('td');
  tdElement.style.whiteSpace = 'normal';
  tdElement.colSpan = lastIndex + 1; // El colSpan es igual al número de columnas que no están ocultas
  return tdElement;
}

function createLi(columnTitle, content) {
  const liElement = document.createElement('li');
  const strongElement = document.createElement('strong');
  strongElement.innerText = columnTitle;
  strongElement.style.paddingRight = '0.5rem';
  const textElement = document.createTextNode(content);
  liElement.appendChild(strongElement);
  liElement.appendChild(textElement);
  return liElement;
}

function createUl(cells) {
  const ulElement = document.createElement('ul');
  ulElement.style.margin = '0px';
  ulElement.style.padding = '0px';
  ulElement.style.listStyle = 'none';
  for (let i = lastIndex + 1; i < columnsLength; i++) {
    const cell = cells[i];
    const liElement = createLi($headers[i].innerText, cell.innerText);
    ulElement.appendChild(liElement);
  }
  return ulElement;
}

function createTrChild({ cells }) {
  const trChildElement = createTr();
  const tdElement = createTd();
  const ulElement = createUl(cells);
  tdElement.appendChild(ulElement);
  trChildElement.appendChild(tdElement);
  return trChildElement;
}

function renderTrChild(trParent) {
  const trChild = createTrChild(trParent);
  trParent.classList.add('parent');
  trParent.insertAdjacentElement('afterend', trChild);
}

function removeTrChild(trParent) {
  let trChild = trParent.nextSibling;
  trChild.parentNode.removeChild(trChild);
  trParent.classList.remove('parent');

}

function toggleTrChild(trParent) {
  if (!trParent.classList.contains('parent'))
    renderTrChild(trParent);
  else
    removeTrChild(trParent);
}

function canHideLastColumn() {
  return $table.clientWidth + paddingExtra > $tableParent.clientWidth;
}

function canShowLastColumn() {
  return twbi[lastIndex + 1] + paddingExtra < $tableParent.clientWidth;
}
// Cuando las dimensiones del contenedor de la table cambien se ocultan o muestran columnas si es posible
const resizeObserver = new ResizeObserver(() => {
  while (canHideLastColumn()) {
    hideLastColumn();
  }
  while (canShowLastColumn()) {
    showLastColumn();
  }
});

resizeObserver.observe($tableParent);

document.addEventListener('DOMContentLoaded', setEventToRows);