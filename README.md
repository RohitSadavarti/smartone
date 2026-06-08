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

##Application Screenshots
##Login Page
Provides secure authentication using encrypted credentials, ensuring that only authorized users can access the platform.
 <img width="840" height="948" alt="image" src="https://github.com/user-attachments/assets/e6002876-f368-4b3e-8ac8-273a0ecffea2" />


 
Attendance Portal/Update Attendance
It’s the page where teacher can login and mark attendance for the students will be save directly to the database based on the filter selected below 
1-Department
2-Teacher (Name)
3-Class
4-Subject
5-Time (Lecture timeslot)
6-Date
<img width="975" height="456" alt="image" src="https://github.com/user-attachments/assets/8da53bea-b6e3-48c4-9d84-3245644b73ac" />
<img width="975" height="459" alt="image" src="https://github.com/user-attachments/assets/f406912e-7f57-4d46-a900-7a09aa8d30cf" />

 
 
 
Attendance Data/Attendance Tracker
In this Page the user (teaching/College faculty) can access the attendance data that have been updated in the portal, They can view or download the report in excel format.
Even they can check the attendance is updated or not properly.

Initial state
<img width="975" height="335" alt="image" src="https://github.com/user-attachments/assets/b3e48119-f33b-47a8-9b9e-35bdc5d45db2" />
 

After Selection
<img width="975" height="358" alt="image" src="https://github.com/user-attachments/assets/c1091636-ed07-406c-8e7a-4bc979ebe9da" />
<img width="975" height="339" alt="image" src="https://github.com/user-attachments/assets/234d9e23-a9d7-461a-ac37-44a1b45083a1" />
<img width="975" height="393" alt="image" src="https://github.com/user-attachments/assets/eeaebd46-ecc5-4b18-a503-4f34f68552bb" />
<img width="975" height="369" alt="image" src="https://github.com/user-attachments/assets/1a539890-178e-400e-9260-76d8c2584ac0" />
<img width="975" height="399" alt="image" src="https://github.com/user-attachments/assets/08a47adc-6315-47ef-b268-307d1ffc3958" />
 
 
 
 
 

 
CSV Download
 <img width="975" height="456" alt="image" src="https://github.com/user-attachments/assets/129d08bb-fe87-4ded-be90-c9f6e33089f7" />
<img width="975" height="505" alt="image" src="https://github.com/user-attachments/assets/7c1da896-2827-4c6f-b722-00113fc3c561" />

 

Update Date
It is very important to keep database updated as it is automated system that take all load of manual work and provide user a way to perform its task in simplest way and in flash of time,
Here we have two different pages where user need to update data as admin,
 <img width="975" height="458" alt="image" src="https://github.com/user-attachments/assets/86ee509d-79bb-4562-9664-2b3e8a45c283" />

1. Student Data:
●	Adding the new arrived/ admission student detail in database so teacher can mark the attendance for the student.
●	Admin can update the student detail manually and if the bulk amount of data is available then they can upload excel file directly so all records can save in database at once.
<img width="975" height="449" alt="image" src="https://github.com/user-attachments/assets/3fdae188-e600-420e-9bb1-f4c44f906a3b" />

  
2.	Teacher Data: 
●	Here admin can update details for new teachers like there Name, Lecture timing, Teaching Subject, Department, Class so the teacher can mark attendance easily.
●	Admin can update the Teachers detail manually and if the bulk amount of data is available then they can upload excel file directly so all records can save in database at once.
<img width="975" height="446" alt="image" src="https://github.com/user-attachments/assets/f4ddf874-c105-4352-9431-362a510e9fe9" />

 

Dashboard
<img width="975" height="455" alt="image" src="https://github.com/user-attachments/assets/0116d38b-ceca-4bbc-82f7-3f1dfee5b88d" />
<img width="975" height="466" alt="image" src="https://github.com/user-attachments/assets/cf28ae8a-82d5-4ec5-806f-e2acbaf92a48" />
<img width="975" height="441" alt="image" src="https://github.com/user-attachments/assets/c092c94a-8358-4030-ac3d-d22454a13424" />
<img width="975" height="349" alt="image" src="https://github.com/user-attachments/assets/5f9f2f3e-d76c-43f3-9cef-3bb2fd14bd52" />
<img width="975" height="462" alt="image" src="https://github.com/user-attachments/assets/b9511572-0591-452a-bb9c-8917f32ae503" />

 
 
 
 
 
