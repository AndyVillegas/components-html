// begin constants
const PADDING_RIGTH = '0.5rem'; // Para separar las columnas colapsadas de su título
const CLASS_NAME_CHILD = 'child';
const CLASS_NAME_PARENT = 'parent';
// end constants
const $table = document.getElementById('table');
const $tableParent = $table.parentElement;
const $headers = $table.tHead.rows[0].cells;
const $rows = $table.tBodies[0].rows;
const columnsLength = $headers.length;
const style = getComputedStyle($tableParent);
const paddingExtra = (parseInt(style.paddingRight) + parseInt(style.paddingLeft));
const twbi = getTableWidthByIndex();
const maxIndex = columnsLength - 1; // Es el índice mpaximo de las columnas
let lastIndex = maxIndex; // El índice hace referencia a la última columna mostrada
let isCollapsible = false; // Bandera para saber si la tabla se puede collapsar o no

function settingRows() {
  Array.from($rows).forEach(row => {
    // Enlazar evento click
    row.querySelector('td').addEventListener('click', () => {
      toggleTrChild(row);
    });
    // Agregar el rol de fila para poder diferenciar de las filas hijas
    row.setAttribute('role', 'row');
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
    const row = $rows[i];
    if (!row.classList.contains(CLASS_NAME_CHILD)) // Solo oculta las columnas en las filas que no son hijos
      row.cells[lastIndex].style.display = displayValue;
  }
}

function hideLastColumn() {
  setDisplayLastColumn('none');
}

function showLastColumn() {
  setDisplayLastColumn('table-cell');
}

function createTr() {
  const trChildElement = document.createElement('tr');
  trChildElement.classList.add(CLASS_NAME_CHILD);
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
  strongElement.style.paddingRight = PADDING_RIGTH;
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

function createTrChild({
  cells
}) {
  const trChildElement = createTr();
  const tdElement = createTd();
  const ulElement = createUl(cells);
  tdElement.appendChild(ulElement);
  trChildElement.appendChild(tdElement);
  return trChildElement;
}

function renderTrChild(trParent) {
  const trChild = createTrChild(trParent);
  trParent.classList.add(CLASS_NAME_PARENT);
  trParent.insertAdjacentElement('afterend', trChild);
}

function removeTrChild(trParent) {
  let trChild = trParent.nextSibling;
  trChild.parentNode.removeChild(trChild);
  trParent.classList.remove(CLASS_NAME_PARENT);
}

function toggleTrChild(trParent) {
  if (!isCollapsible) return;
  if (!trParent.classList.contains(CLASS_NAME_PARENT))
    renderTrChild(trParent);
  else
    removeTrChild(trParent);
}

function pushTrChild() {
  const $children = $table.querySelectorAll(`.${CLASS_NAME_CHILD}`);
  $children.forEach(child => {
    const tdElement = child.querySelector('td');
    tdElement.colSpan -= 1; // Se le resta porque ahora la tabla tiene una columna menos
    const $parent = child.previousSibling;
    const liElement = createLi($headers[lastIndex].innerText, $parent.cells[lastIndex].innerText);
    child.querySelector('li').insertAdjacentElement('beforebegin', liElement);
  });
}

function popTrChild() {
  const $children = $table.querySelectorAll(`.${CLASS_NAME_CHILD}`);
  $children.forEach(child => {
    const tdElement = child.querySelector('td');
    tdElement.colSpan += 1; // Se le suma porque ahora la tabla tiene una columna más
    const liElement = child.querySelector('li');
    liElement.parentNode.removeChild(liElement);
  });
}

function canHideLastColumn() {
  return lastIndex !== 0 &&
    getComputedStyle($headers[lastIndex]).display == 'table-cell' &&
    $table.clientWidth + paddingExtra > $tableParent.clientWidth;
}

function canShowLastColumn() {
  return lastIndex !== maxIndex &&
    getComputedStyle($headers[lastIndex + 1]).display == 'none' &&
    twbi[lastIndex + 1] + paddingExtra < $tableParent.clientWidth;
}
// Cuando las dimensiones del contenedor de la table cambien se ocultan o muestran columnas si es posible
const resizeObserver = new ResizeObserver(() => {
  while (canHideLastColumn()) {
    hideLastColumn();
    pushTrChild();
    lastIndex--; // La última columna mostrada ahora pasa hacer una menos
  }
  while (canShowLastColumn()) {
    lastIndex++; // Aumentamos una unidad a la última columna mostrada para que así la función la muestre
    showLastColumn();
    popTrChild();
  }
  if (lastIndex !== maxIndex) // Si la condición se cumple significa que hay columnas ocultas
    addCollapsed();
  else
    removeCollapsed();
});
function addCollapsed() {
  $table.classList.add('table-responsive--collapsed');
  isCollapsible = true;
}
function removeCollapsed() {
  $table.classList.remove('table-responsive--collapsed');
  isCollapsible = false;
  // En caso de que hayan filas hijas abiertas se eliminan
  const $children = $table.querySelectorAll(`.${CLASS_NAME_CHILD}`);
  $children.forEach($child => $child.parentNode.removeChild($child));
}

resizeObserver.observe($tableParent);

document.addEventListener('DOMContentLoaded', settingRows);