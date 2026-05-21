# 🐛 BugTrackr — Professional Bug Tracking System

BugTrackr is a state-of-the-art bug tracking and project management system built with **Angular 21**, designed for high-performance teams. It features a modern "SaaS" aesthetic with 5 dynamic themes, real-time data visualization, and an intuitive Kanban-based workflow.

## ✨ Key Features

- **📊 Interactive Dashboard**: Visualize project health with real-time Chart.js integration.
- **📋 Issue Management**: track bugs with high-density tables or visual Kanban boards.
- **📁 Project Hub**: Manage multiple development projects with custom branding (colors/icons).
- **🎨 5 Premium Themes**: Switch instantly between Light, Dark, Ocean, Forest, and Rose modes.
- **⚡ Performance First**: Built using Angular Signals and OnPush change detection for lightning-fast UI.
- **🛡️ Secure Auth**: JWT-based authentication with protected routes and animated forms.

## 🛠️ Technology Stack

- **Framework**: [Angular 21](https://angular.io/) (Standalone Components, Signals)
- **State Management**: [@ngrx/signals](https://ngrx.io/guide/signals)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [SCSS Themes](https://sass-lang.com/)
- **Icons**: [Lucide Angular](https://lucide.dev/)
- **Charts**: [Chart.js](https://www.chartjs.org/) + [ng2-charts](https://valor-software.com/ng2-charts/)
- **Animations**: [Angular Animations](https://angular.io/guide/animations) + [GSAP](https://greensock.com/)

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:4200](http://localhost:4200)

## 📁 Project Structure

- `src/app/core`: Singleton services, guards, interceptors, and models.
- `src/app/shared`: Reusable components (Modals, Drawers, Badges).
- `src/app/features`: Feature-based modules (Auth, Projects, Bugs, Dashboard).
- `src/app/layout`: Application shell, Sidebar, and Topbar.
- `src/styles/themes`: Custom SCSS theme definitions.

---
Built with ❤️ by the BugTrackr Team.
