# Kanban Board

A modern task management application built with Next.js and TypeScript.

## Features

- Drag & drop task management
- Dark/light theme support
- Responsive design
- Type-safe development

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Radix UI
- Drag & Drop
- Prisma + PostgreSQL
- NextAuth (Auth.js)

## Getting Started

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Scripts

```bash
npm run dev     # Development server
npm run build   # Production build
npm run start   # Production server
npm run lint    # Code linting
```

## Notes

- Set `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` if you want Sentry enabled.
- If your Postgres requires SSL, configure `PG_SSL_MODE` (see `.env.example`).

## License

Private project - not for public distribution.

```
kanban-board
├─ app
│  ├─ actions
│  │  ├─ auth-actions.ts
│  │  ├─ board.ts
│  │  ├─ notifications.ts
│  │  ├─ onboarding-actions.ts
│  │  ├─ profile.ts
│  │  ├─ project-status.ts
│  │  ├─ project.ts
│  │  ├─ security.ts
│  │  ├─ sso.ts
│  │  └─ task.ts
│  ├─ api
│  │  └─ [...nextauth]
│  │     └─ route.ts
│  ├─ AppWrapper.tsx
│  ├─ assets
│  │  └─ logo.svg
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ settings
│  │  ├─ integration
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ notifications
│  │  │  └─ page.tsx
│  │  ├─ profile
│  │  │  └─ page.tsx
│  │  ├─ project-status
│  │  │  └─ page.tsx
│  │  ├─ security
│  │  │  └─ page.tsx
│  │  ├─ team
│  │  │  └─ page.tsx
│  │  └─ team-settings
│  │     └─ page.tsx
│  └─ styles
│     ├─ animations.css
│     ├─ boards.css
│     ├─ calendar.css
│     ├─ components.css
│     ├─ drag-drop.css
│     ├─ globals.css
│     ├─ layout.css
│     ├─ scrollbar.css
│     └─ utilities.css
├─ auth.ts
├─ components
│  ├─ add-board-dialog.tsx
│  ├─ auth
│  │  └─ two-factor-guard.tsx
│  ├─ board-dropdown-menu.tsx
│  ├─ calendar-view
│  │  ├─ CalendarHeader.tsx
│  │  └─ CalendarView.tsx
│  ├─ chart-view
│  │  ├─ BarChart.tsx
│  │  ├─ ChartView.tsx
│  │  └─ StatusChart.tsx
│  ├─ ClientOnly.tsx
│  ├─ custom-loader.tsx
│  ├─ delete-board-dialog.tsx
│  ├─ drop-downs
│  │  ├─ filter-dropdown.tsx
│  │  ├─ project-selection
│  │  │  ├─ project-command-items.tsx
│  │  │  ├─ project-selection.tsx
│  │  │  └─ singleProjectItem.tsx
│  │  └─ task-drop-down.tsx
│  ├─ landing-page
│  │  ├─ auth-card.tsx
│  │  ├─ cta-section.tsx
│  │  ├─ features-section.tsx
│  │  ├─ footer.tsx
│  │  ├─ hero-section.tsx
│  │  ├─ interactive-demo-section.tsx
│  │  └─ navbar.tsx
│  ├─ landing-page.tsx
│  ├─ left-sidebar
│  │  ├─ left-sidebar.tsx
│  │  ├─ logo-app.tsx
│  │  └─ user-button.tsx
│  ├─ mode-toggle.tsx
│  ├─ onboarding-flow.tsx
│  ├─ projects-area
│  │  ├─ empty-board-state.tsx
│  │  ├─ list-view
│  │  │  ├─ EditableTaskRow.tsx
│  │  │  ├─ ListView.tsx
│  │  │  ├─ ListViewHelpers.tsx
│  │  │  └─ NewTaskRow.tsx
│  │  ├─ people-view
│  │  │  ├─ people-view.tsx
│  │  │  └─ virtual-resources-view.tsx
│  │  ├─ project-area-header
│  │  │  └─ project-area-header.tsx
│  │  ├─ project-area-task-board
│  │  │  ├─ project-area-board.tsx
│  │  │  ├─ single-board.tsx
│  │  │  └─ single-task.tsx
│  │  └─ project-area.tsx
│  ├─ settings
│  │  ├─ create-resource-dialog.tsx
│  │  ├─ invite-user-dialog.tsx
│  │  └─ settings-sidebar.tsx
│  ├─ theme-provider.tsx
│  ├─ ui
│  │  ├─ alert-dialog.tsx
│  │  ├─ avatar.tsx
│  │  ├─ badge.tsx
│  │  ├─ button.tsx
│  │  ├─ calendar.tsx
│  │  ├─ card.tsx
│  │  ├─ checkbox.tsx
│  │  ├─ command.tsx
│  │  ├─ date-picker.tsx
│  │  ├─ dialog.tsx
│  │  ├─ dropdown-menu.tsx
│  │  ├─ input.tsx
│  │  ├─ label.tsx
│  │  ├─ popover.tsx
│  │  ├─ radio-group.tsx
│  │  ├─ scroll-area.tsx
│  │  ├─ select.tsx
│  │  ├─ separator.tsx
│  │  ├─ switch.tsx
│  │  ├─ tabs.tsx
│  │  └─ textarea.tsx
│  └─ windows-dialogs
│     ├─ all-projects-dialog
│     │  ├─ all-projects-dialog.tsx
│     │  ├─ components
│     │  │  ├─ board-card.tsx
│     │  │  ├─ delete-project-alert.tsx
│     │  │  ├─ dialog-header.tsx
│     │  │  ├─ dialog-tabs.tsx
│     │  │  ├─ edit-task-dialog.tsx
│     │  │  ├─ empty-state.tsx
│     │  │  └─ project-card.tsx
│     │  ├─ hooks
│     │  │  ├─ use-all-projects.ts
│     │  │  └─ use-search-filter.ts
│     │  ├─ index.ts
│     │  └─ utils
│     │     └─ grid-utils.ts
│     ├─ board-dialogs
│     │  └─ edit-board-dialog.tsx
│     ├─ project-dialog
│     │  ├─ add-resource-dialog.tsx
│     │  ├─ change-owner-dialog.tsx
│     │  ├─ convert-resource-dialog.tsx
│     │  ├─ CreateProjectDialog.tsx
│     │  ├─ invite-member-dialog.tsx
│     │  └─ user-invitation-dialog.tsx
│     └─ task-dialog
│        ├─ copy-task-dialog.tsx
│        ├─ delete-task-dialog.tsx
│        ├─ edit-task-dialog.tsx
│        ├─ ProjectDialog.tsx
│        ├─ sub-component
│        │  ├─ label-selector.tsx
│        │  ├─ priority-list.tsx
│        │  ├─ priority-selector.tsx
│        │  ├─ progress-selector.tsx
│        │  ├─ projects-list.tsx
│        │  ├─ task-checklist.tsx
│        │  ├─ task-description.tsx
│        │  ├─ task-input-components.tsx
│        │  └─ task-name.tsx
│        └─ taskdialog.tsx
├─ components.json
├─ constants
│  └─ index.ts
├─ contexts
│  └─ projectContext.tsx
├─ eslint.config.mjs
├─ hooks
│  ├─ use-task-actions.ts
│  └─ use-toast.tsx
├─ lib
│  ├─ account-storage.ts
│  ├─ mail.ts
│  ├─ prisma.ts
│  └─ utils.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20251201051522_init_db
│  │  │  └─ migration.sql
│  │  ├─ 20251201080217_fix_schema_sync
│  │  │  └─ migration.sql
│  │  ├─ 20251202120524_add_notification_settings
│  │  │  └─ migration.sql
│  │  ├─ 20251202134716_add_project_status
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  └─ schema.prisma
├─ prisma.config.ts
├─ public
│  ├─ favicon.ico
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ tsconfig.json
└─ types
   ├─ custom.d.ts
   ├─ index.ts
   └─ next-auth.d.ts

```
