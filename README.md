# SmartOne

# SmartOne — Attendance Portal

A web-based attendance management system built with **Flask** and **PostgreSQL**, featuring role-based access, analytics dashboards, and bulk data upload.

---

## Features

- **Authentication** — Secure login with session management and role-based access (Admin / User)
- **Attendance Tracking** — Mark student attendance by department, class, teacher, subject, and time slot
- **Analytics Dashboard** — Visual charts including gauge meters, donut charts, bar graphs, and absentee trend lines
- **Top Defaulters Table** — Highlights the 10 most frequently absent students
- **Bulk Upload** — Import student and teacher data via Excel (`.xlsx` / `.xls`)
- **CSV Export** — Download filtered attendance records
- **Admin Panel** — Manage student and teacher data with upload history and error tracking
- **Dark / Light Mode** — Togglable theme across all pages
- **Responsive Design** — Mobile-friendly sidebar and layout

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, Gunicorn |
| Database | PostgreSQL (Supabase) |
| ORM / DB | psycopg2, SQLAlchemy |
| Data & Charts | Pandas, Matplotlib, Seaborn, NumPy |
| Frontend | HTML, CSS, Vanilla JS |
| File Handling | openpyxl |
| Deployment | Vercel |

---

## Project Structure

```
backend/
├── app.py                   # Main Flask application
├── requirements.txt         # Python dependencies
├── vercel.json              # Vercel deployment config
├── .vercelignore
├── static/
│   ├── styles.css           # Main stylesheet
│   ├── sidebar.css          # Sidebar component styles
│   ├── attendance_data.css  # Attendance page styles
│   ├── login.css            # Login page styles
│   ├── script.js            # Attendance update logic
│   ├── attendance.js        # Attendance tracker logic
│   ├── sidebar.js           # Sidebar toggle & nav logic
│   ├── filter.js            # Dashboard filter logic
│   ├── admin-students.js    # Student admin logic
│   └── admin-teacher.js     # Teacher admin logic
└── templates/
    ├── login.html           # Login page
    ├── index.html           # Home / landing page
    ├── update_attendance.html
    ├── Attendance.html      # Attendance tracker
    ├── dashboard.html       # Analytics dashboard
    ├── admin-students.html  # Student data management
    └── admin-teacher.html   # Teacher data management
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- A PostgreSQL database (e.g., [Supabase](https://supabase.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/RohitSadavarti/smartone.git
cd smartone/backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export PG_HOST=your_host
export PG_USER=your_user
export PG_PASSWORD=your_password
export PG_DB=postgres
export PG_PORT=6543
```

### Run Locally

```bash
python app.py
```

The app will be available at `http://localhost:5000`.

---

## Database Schema

The application expects the following tables in PostgreSQL:

| Table | Description |
|---|---|
| `users` | Stores login credentials and roles |
| `Students` | Student records (roll number, name, dept, class) |
| `Teachers` | Teacher schedule (name, subject, time slot, dept, class) |
| `Attendance` | Attendance records per lecture |
| `UploadHistory` | Tracks bulk upload events |
| `Validrecords` | Valid rows from student uploads |
| `Errorrecords` | Failed rows from student uploads |
| `ValidTeachers` | Valid rows from teacher uploads |
| `ErrorTeachers` | Failed rows from teacher uploads |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Login with email & password |
| POST | `/api/logout` | Clear session |
| POST | `/api/register` | Register new user |
| GET | `/api/user-info` | Get current user info |

### Attendance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/attendance-data` | Fetch filtered attendance records |
| POST | `/attendance` | Save attendance records |
| GET | `/attendance-csv` | Download attendance as CSV |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| POST | `/submit` | Add a single student |
| POST | `/upload-file` | Bulk upload students via Excel |
| POST | `/teachers` | Add a single teacher |
| POST | `/upload-teachers` | Bulk upload teachers via Excel |
| GET | `/upload-history` | View upload history |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/plot/<plot_name>` | Get a chart as PNG image |
| GET | `/api/table/top_defaulters` | Get top defaulters data |
| GET | `/api/filters` | Get all filter options |

---

## Deployment

The backend is configured for **Vercel** deployment via `vercel.json`. Push to your connected branch to trigger a deployment.

```bash
vercel deploy
```

> **Note:** Heavy dependencies (pandas, matplotlib, seaborn) are bundled within the 250MB Lambda limit using the `maxLambdaSize` config.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PG_HOST` | Supabase pooler URL | PostgreSQL host |
| `PG_USER` | — | Database user |
| `PG_PASSWORD` | — | Database password |
| `PG_DB` | `postgres` | Database name |
| `PG_PORT` | `6543` | Connection port |
| `PG_SSLMODE` | `require` | SSL mode |

---

## License

This project is licensed under the MIT License.
