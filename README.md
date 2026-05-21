# BugTrackr — Bug Tracking & Project Management Dashboard

BugTrackr is a single-page application for software teams to track bugs, manage projects, and collaborate. Built with **Angular 21**, it runs entirely in the browser with localStorage as a mock backend.

## Live Demo

**https://bugtrackr-omega.vercel.app**

Demo credentials:
- **Email:** MohamedTarek@test.com
- **Password:** password

## Features

- **Dashboard**: Overview of open bugs, active projects, and team activity with Chart.js visualizations
- **Project Management**: Create, edit, and view projects with linked bugs
- **Bug Tracking**: Full CRUD for bugs with list, detail, and Kanban board views
- **Team Management**: Invite members via EmailJS, assign roles, and manage the team
- **Role-Based Access**: Admin, Team Lead, Developer, and Viewer roles with conditional navigation
- **Dark/Light Theme**: Persisted theme preference
- **Responsive**: Desktop-first with tablet-friendly layout

## Tech Stack

- **Framework**: Angular 21 (Standalone Components, Signals)
- **State Management**: @ngrx/signals
- **Styling**: Tailwind CSS + CSS custom properties
- **Icons**: Lucide Angular
- **Charts**: Chart.js + ng2-charts
- **Email**: EmailJS (transactional invites)

## Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Installation

```bash
git clone https://github.com/NourhanKhaled23/JOJO-BugTracker.git
cd JOJO-BugTracker
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200)

### Build for Production

```bash
ng build --configuration production
```

Output is written to `dist/bugtrackr/browser/`.

<img width="870" height="840" alt="image" src="https://github.com/user-attachments/assets/7725bdfb-1c05-4e0e-af23-6ba7f9dd8de2" />

## Deployment

The app is deployed on Vercel via GitHub integration. Pushes to the `main` branch trigger automatic builds.

## License

MIT
