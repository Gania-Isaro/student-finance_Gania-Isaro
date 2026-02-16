import { expenses, getStats } from './state.js';
import { compileRegex, highlight } from './search.js';

const tbody = document.querySelector('#records-table tbody');
const cards = document.querySelector('#cards-container');
const totalCountEl = document.getElementById('total-count');
const totalAmountEl = document.getElementById('total-amount');
const topCatEl = document.getElementById('top-category');
const last7El = document.getElementById('last-7-days');
const capMessage = document.getElementById('cap-message');

// records
export function renderRecords(searchPattern='', caseIgnore=false){
  const re = compileRegex(searchPattern, caseIgnore?'i':'');

  tbody.innerHTML='';
  expenses.forEach(e=>{
    const row = document.createElement('tr');
    row.innerHTML=`
      <td>${highlight(e.description,re)}</td>
      <td>${e.amount}</td>
      <td>${highlight(e.category,re)}</td>
      <td>${e.date}</td>
      <td>
        <button data-edit="${e.id}">Edit</button>
        <button data-delete="${e.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // dashboard
  const stats = getStats();
  totalCountEl.textContent = stats.totalCount;
  totalAmountEl.textContent = stats.totalAmount.toFixed(2);
  topCatEl.textContent = stats.topCategory;

  last7El.innerHTML='';
  stats.last7.forEach(a=>{
    const bar = document.createElement('div');
    bar.style.height = `${a*2}px`;
    last7El.appendChild(bar);
  });
}
