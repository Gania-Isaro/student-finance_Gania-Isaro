# Student Finance Tracker 🎓💰

A responsive, accessible, and "student-themed" finance management tool built with vanilla HTML and CSS (JS pending). Designed to help students track income, expenses, and budgets with a vibrant, unique glassmorphism UI.

## 🚀 Theme One: Student Finance Tracker
This project sets out to solve the chaos of student budgeting.
**Core Goal**: Manage budgets, track transactions (tuition, food, transport), and provide visual spending insights.

## ✨ Features (UI Implemented)
- **Responsive Dashboard**: Stats at a glance (Balance, Income, Expenses, Budget Cap).
- **Transaction Records**: Fully responsive table (transforms to cards on mobile) with sorting and search UI.
- **Add/Edit Forms**: Inputs for description, amount, type, category, and date validation.
- **Settings**: Currency selection (RWF, USD, etc.) and Monthly Spending Cap inputs.
- **Accessibility**:
  - Semantic HTML landmarks
  - Visible focus states
  - ARIA labels and live regions
  - High contrast "Vibrant Glass" theme
  - Keyboard navigation support

## 🛠️ Tech Stack
- **HTML5**: Semantic structure.
- **CSS3**: Custom properties (variables), Flexbox, Grid, Media Queries.
- **No Frameworks**: Pure vanilla implementation.

## 📂 Project Structure
```
student-finance_Gania-Isaro/
├── index.html          # Main SPA structure
├── tests.html          # Unit test runner (skeleton)
├── seed.json           # Sample data for development
├── assets/             # Images and static assets
├── styles/             # Modular CSS
│   ├── base.css        # Reset & Typography
│   ├── layout.css      # Grid/Sidebar structure
│   ├── components.css  # Cards, buttons, tables
│   └── variables.css   # Theme colors & tokens
└── scripts/            # JS Modules (Placeholders)
    ├── app.js
    ├── storage.js
    ├── ui.js
    ├── state.js
    ├── validators.js
    └── search.js
```

## 🎨 Theme: "Vibrant Glass"
- **Primary**: Electric Indigo & Violet
- **Accent**: Hot Pink & Rose
- **Style**: Modern glassmorphism with soft shadows and gradients.

## 📱 Responsiveness
The UI is built Mobile-First and supports:
1. **Mobile (< 768px)**: Stacked layout, sticky bottom/relative nav, card-view tables.
2. **Tablet (768px - 1024px)**: Sidebar navigation, 2-column grids.
3. **Desktop (> 1024px)**: Full dashboard view, 4-column grids, expanded tables.

## 🧪 How to Test
1. Open `index.html` in any modern browser.
2. Resize the window to verify responsiveness.
3. Use `Tab` key to navigate through interactive elements.
4. Check `tests.html` for future JS validation tests.

## 👤 Author
**Gania Isaro**
- GitHub: [Gania-Isaro](https://github.com/Gania-Isaro)
- Email: g.kayumba@alustudent.com
