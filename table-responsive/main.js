const $table = document.getElementById('table');
const $tableParent = $table.parentElement;
const style = getComputedStyle($tableParent);
const paddingExtra = (parseInt(style.paddingRight) + parseInt(style.paddingLeft));
const cells = $table.tHead.rows[0].cells;
let lastIndex = $table.tHead.rows[0].cells.length - 1;

function setDisplayLastColumn(displayValue) {
  $table.tHead.rows[0].cells[lastIndex].style.display = displayValue;
  const rows = $table.tBodies[0].rows;
  for (const row of rows) {
    row.cells[lastIndex].style.display = displayValue;
  }
}

function hideLastColumn() {
  setDisplayLastColumn('none');
  lastIndex--;
}

function showLastColumn() {
  setDisplayLastColumn('table-cell');
}
//Este observador se va a encargar de registrar los cambios de ancho de la tabla
const resizeObserver = new ResizeObserver(() => {
  while (($table.clientWidth + paddingExtra) > $tableParent.clientWidth) {
    hideLastColumn();
  }
  // if(($table.clientWidth + paddingExtra) <= $tableParent.clientWidth && candAddColumn()){
  //   showLastColumn();
  // }
});

function canAddColumn() {

}
resizeObserver.observe($tableParent);