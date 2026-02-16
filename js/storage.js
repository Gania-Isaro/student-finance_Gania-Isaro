import { expenses } from './state.js';

const KEY = 'finance:exp';

// sav
export function saveExpenses(data){
  localStorage.setItem(KEY, JSON.stringify(data));
}

// loading
export function loadExpenses(){
  const stored = localStorage.getItem(KEY);
  return stored ? JSON.parse(stored) : [];
}

// exporting
export function exportJSON(){
  const blob = new Blob([JSON.stringify(expenses, null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'expenses.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

// importing
export function importJSON(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = e=>{
      try{
        const data = JSON.parse(e.target.result);
        if(!Array.isArray(data)) throw new Error('invalid data');
        resolve(data);
      }catch(err){
        reject(err.message);
      }
    };
    reader.readAsText(file);
  });
}
