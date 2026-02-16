export let expenses = [];
export let cap = null; 
export let currency = 'RWF';

// adding expenses
export function addExpense(exp){
  expenses.push(exp);
}

// updating expense by id
export function updateExpense(id, newExp){
  const i = expenses.findIndex(e=>e.id===id);
  if(i>=0){
    expenses[i] = {...expenses[i], ...newExp, updatedAt: new Date().toISOString()};
  }
}

// delete
export function deleteExpense(id){
  expenses = expenses.filter(e=>e.id!==id);
}

// stats
export function getStats(){
  const totalCount = expenses.length;
  const totalAmount = expenses.reduce((sum,e)=>sum+parseFloat(e.amount),0);

  const cats = {};
  expenses.forEach(e=> cats[e.category] = (cats[e.category]||0)+1 );
  const topCategory = Object.entries(cats).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'None';

  // last 7 days chart
  const last7 = Array(7).fill(0);
  const today = new Date();
  expenses.forEach(e=>{
    const diff = Math.floor((today-new Date(e.date))/(1000*60*60*24));
    if(diff<7) last7[6-diff] += parseFloat(e.amount);
  });

  return {totalCount, totalAmount, topCategory, last7};
}
