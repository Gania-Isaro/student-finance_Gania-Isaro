let records = []
let editId = null

const form = document.getElementById("expense-form")
const descriptionInput = document.getElementById("description")
const amountInput = document.getElementById("amount")
const categoryInput = document.getElementById("category")
const dateInput = document.getElementById("date")

const tableBody = document.querySelector("#records-table tbody")

const totalCount = document.getElementById("total-count")
const totalAmount = document.getElementById("total-amount")
const topCategory = document.getElementById("top-category")
const last7 = document.getElementById("last-7-days")

const searchInput = document.getElementById("search-input")
const caseCheckbox = document.getElementById("case-checkbox")

const capInput = document.getElementById("cap-input")
const capMessage = document.getElementById("cap-message")

const exportBtn = document.getElementById("export-btn")
const importFile = document.getElementById("import-file")

const sortDateBtn = document.getElementById("sort-date")
const sortDescBtn = document.getElementById("sort-desc")
const sortAmountBtn = document.getElementById("sort-amount")

// load from local storage
window.onload = function () {
    const saved = localStorage.getItem("finance_records")
    if (saved) {
        records = JSON.parse(saved)
        renderTable(records)
        updateDashboard()
    }
}

// save to local storage
function saveToStorage() {
    localStorage.setItem("finance_records", JSON.stringify(records))
}

// validation
function validate(description, amount, category, date) {
    let valid = true

    const descRegex = /^[A-Za-z ]+$/
    const amountRegex = /^\d+(\.\d{1,2})?$/
    const categoryRegex = /^[A-Za-z ]+$/

    document.querySelectorAll(".error").forEach(e => e.textContent = "")

    if (!descRegex.test(description.trim())) {
        document.getElementById("desc-error").textContent = "Invalid description"
        valid = false
    }

    if (!amountRegex.test(amount) || Number(amount) <= 0) {
        document.getElementById("amount-error").textContent = "Invalid amount"
        valid = false
    }

    if (!categoryRegex.test(category.trim())) {
        document.getElementById("category-error").textContent = "Invalid category"
        valid = false
    }

    if (!date) {
        document.getElementById("date-error").textContent = "Select a date"
        valid = false
    }

    return valid
}

// form submiting
form.addEventListener("submit", function (e) {
    e.preventDefault()

    const description = descriptionInput.value
    const amount = amountInput.value
    const category = categoryInput.value
    const date = dateInput.value

    if (!validate(description, amount, category, date)) return

    if (editId) {
        const index = records.findIndex(r => r.id === editId)
        records[index] = { id: editId, description, amount: Number(amount), category, date }
        editId = null
    } else {
        const newRecord = {
            id: Date.now(),
            description,
            amount: Number(amount),
            category,
            date
        }
        records.push(newRecord)
    }

    saveToStorage()
    renderTable(records)
    updateDashboard()
    form.reset()
})

// table
function renderTable(data) {
    tableBody.innerHTML = ""

    data.forEach(record => {
        const row = document.createElement("tr")

        row.innerHTML = `
            <td>${record.description}</td>
            <td>${record.amount}</td>
            <td>${record.category}</td>
            <td>${record.date}</td>
            <td>
                <button onclick="editRecord(${record.id})">Edit</button>
                <button onclick="deleteRecord(${record.id})">Delete</button>
            </td>
        `

        tableBody.appendChild(row)
    })
}

// deleting
function deleteRecord(id) {
    records = records.filter(r => r.id !== id)
    saveToStorage()
    renderTable(records)
    updateDashboard()
}

// editing
function editRecord(id) {
    const record = records.find(r => r.id === id)
    descriptionInput.value = record.description
    amountInput.value = record.amount
    categoryInput.value = record.category
    dateInput.value = record.date
    editId = id
}

// dashbord
function updateDashboard() {
    totalCount.textContent = records.length

    const total = records.reduce((sum, r) => sum + r.amount, 0)
    totalAmount.textContent = total.toFixed(2)

    const categoryCount = {}
    records.forEach(r => {
        categoryCount[r.category] = (categoryCount[r.category] || 0) + 1
    })

    let max = 0
    let top = "None"
    for (let cat in categoryCount) {
        if (categoryCount[cat] > max) {
            max = categoryCount[cat]
            top = cat
        }
    }

    topCategory.textContent = top

    const today = new Date()
    const last7Records = records.filter(r => {
        const recordDate = new Date(r.date)
        const diff = (today - recordDate) / (1000 * 60 * 60 * 24)
        return diff <= 7
    })

    last7.textContent = "Last 7 Days Total: " +
        last7Records.reduce((sum, r) => sum + r.amount, 0).toFixed(2)

    checkCap(total)
}

// searching with regex
searchInput.addEventListener("input", function () {
    try {
        const flags = caseCheckbox.checked ? "i" : ""
        const regex = new RegExp(searchInput.value, flags)

        const filtered = records.filter(r =>
            regex.test(r.description) || regex.test(r.category)
        )

        renderTable(filtered)
    } catch (err) {
        console.log("Invalid regex")
    }
})

// sorting
sortDateBtn.addEventListener("click", function () {
    records.sort((a, b) => new Date(b.date) - new Date(a.date))
    renderTable(records)
})

sortDescBtn.addEventListener("click", function () {
    records.sort((a, b) => a.description.localeCompare(b.description))
    renderTable(records)
})

sortAmountBtn.addEventListener("click", function () {
    records.sort((a, b) => b.amount - a.amount)
    renderTable(records)
})

capInput.addEventListener("input", function () {
    const total = records.reduce((sum, r) => sum + r.amount, 0)
    checkCap(total)
})

function checkCap(total) {
    const cap = Number(capInput.value)
    if (!cap) return

    if (total > cap) {
        capMessage.textContent = "Warning: You exceeded your spending cap!"
    } else {
        capMessage.textContent = ""
    }
}

// exportting
exportBtn.addEventListener("click", function () {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "finance_records.json"
    link.click()
})

// importing
importFile.addEventListener("change", function () {
    const file = importFile.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result)
            if (Array.isArray(data)) {
                records = data
                saveToStorage()
                renderTable(records)
                updateDashboard()
            }
        } catch (err) {
            alert("Invalid JSON file")
        }
    }
    reader.readAsText(file)
})
