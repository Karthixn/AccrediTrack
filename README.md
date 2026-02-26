# AccrediTrack
AccrediTrack is a web-based accreditation management prototype designed to organize NAAC/NBA documentation digitally. It provides role-based access, structured evidence upload, and a readiness score with gap tracking to monitor institutional compliance and improve accreditation preparedness.

## Features

- **Role-Based Authentication (Simulated)**
  - Select between Admin or Faculty roles during login
  - Stores user session using `localStorage`

- **Interactive Dashboard**
  - **Overall Readiness Metrics**: View total compliance percentage, total uploaded documents, and pending checklist items at a glance.
  - **Criteria Breakdown**: Detailed progress cards for all 7 NAAC criteria, complete with visual progress bars, status indicators (Complete, In Progress, Critical), and lists of missing specific evidence items.

- **Structured Evidence Upload**
  - Select academic year and specific NAAC criterion.
  - Dynamically populates checklist requirements based on the selected criterion.
  - Simulated drag-and-drop file upload interface.
  - Persists uploaded document metadata (title, criterion, uploader role, and date) to `localStorage`.

- **Evidence Repository (Documents Management)**
  - View all uploaded documents in a clean, tabular format.
  - Real-time search/filtering functionality.
  - Ability to delete individual documents with immediate UI updates.

- **Modern & Responsive UI/UX**
  - Sleek, glassy styling with smooth CSS animations.
  - Dynamic user feedback (Toast notifications for success/error).
  - Fully responsive design with a collapsible sidebar for mobile devices.
  - Custom branded logo integration and premium typography using Google Fonts (Outfit & Inter).
