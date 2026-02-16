import { expenses, addExpense, updateExpense, deleteExpense } from './state.js';
import { saveExpenses, loadExpenses, exportJSON, importJSON } from './storage.js';
import { validate } from './validators.js';
import { renderRecords } from './ui.js';

// form and als search
const form = document.getElementById('expense-form');
const searchInput = document.getElementById('search-input');
const caseCheck = document.getElementById('case-checkbox');
const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-file');

// loading the old
loadExpenses().forEach(e=>expenses.push(e));
renderRecords();

// submitt
form.addEventListener('submit', e=>{
  e.preventDefault();
  const id = form.dataset.editId || `rec_${Date.now()}`;
  const desc = form.description.value.trim();
  const amt = form.amount.value.trim();
  const cat = form.category.value.trim();
  const date = form.date.value;

  if(!validate('description',desc) || !validate('amount',amt) || !validate('category',cat) || !validate('date',date)){
    alert('check your inputs');
    return;
  }

  const exp = {id, description:desc, amount:parseFloat(amt), category:cat, date, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()};

  if(form.dataset.editId){
    updateExpense(id,exp);
    delete form.dataset.editId;
  } else addExpense(exp);

  saveExpenses(expenses);
  form.reset();
  renderRecords();
});

// to search
searchInput.addEventListener('input', ()=>{
  renderRecords(searchInput.value, caseCheck.checked);
});

// exporting
exportBtn.addEventListener('click', exportJSON);

// importig
importInput.addEventListener('change', async e=>{
  const file = e.target.files[0];
  if(!file) return;
  try{
    const data = await importJSON(file);
    data.forEach(d=>expenses.push(d));
    saveExpenses(expenses);
    renderRecords();
  }catch(err){
    alert('Import failed '+err);
  }
});
