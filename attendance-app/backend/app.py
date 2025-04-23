import csv
import os
from io import StringIO
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from flask_mysqldb import MySQL
from werkzeug.utils import secure_filename
from datetime import datetime
from openpyxl import load_workbook

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'xlsx', 'xls', 'csv'}
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Clashe@7494'
app.config['MYSQL_DB'] = 'college'

mysql = MySQL(app)

# Routes for Departments, Teachers, Subjects, Time Slots, and Students (Python 1)
@app.route('/departments', methods=['GET'])
def get_departments():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT DISTINCT department FROM Teachers ORDER BY department ASC")
    departments = cursor.fetchall()
    cursor.close()
    return jsonify([dept[0] for dept in departments])

@app.route('/teachers', methods=['GET'])
def get_teachers():
    department = request.args.get('department')
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT DISTINCT teacher_name FROM Teachers WHERE department = %s ORDER BY teacher_name ASC", (department,))
    teachers = cursor.fetchall()
    cursor.close()
    return jsonify([teacher[0] for teacher in teachers])

@app.route('/student-classes', methods=['GET'])
def get_student_classes():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT DISTINCT class FROM students ORDER BY class ASC")
    classes = cursor.fetchall()
    cursor.close()
    return jsonify([class_[0] for class_ in classes])

@app.route('/subjects', methods=['GET'])
def get_subjects():
    department = request.args.get('department')
    class_name = request.args.get('class') 
    teacher_name = request.args.get('teacher_name')

    if not department or not class_name or not teacher_name:
        return jsonify({"error": "Parameters 'department', 'class', and 'teacher_name' are required"}), 400

    cursor = mysql.connection.cursor()
    query = """
        SELECT DISTINCT subject 
        FROM Teachers 
        WHERE department = %s AND `class` = %s AND teacher_name = %s
        ORDER BY subject ASC
    """
    cursor.execute(query, (department, class_name, teacher_name))
    subjects = cursor.fetchall()
    cursor.close()
    return jsonify([subject[0] for subject in subjects])

@app.route('/time-slots', methods=['GET'])
def get_time_slots():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT DISTINCT time_slot FROM Teachers ORDER BY time_slot ASC")
    time_slots = cursor.fetchall()
    cursor.close()
    return jsonify([time_slot[0] for time_slot in time_slots])

@app.route('/students', methods=['GET'])
def get_students():
    query = request.args.get('query', '').strip()
    department = request.args.get('department', '').strip()
    cursor = mysql.connection.cursor()

    if query:
        cursor.execute(""" 
            SELECT roll_number, name 
            FROM Students 
            WHERE roll_number LIKE %s OR name LIKE %s
        """, (f"%{query}%", f"%{query}%"))
    elif department:
        cursor.execute("SELECT roll_number, name FROM Students WHERE department = %s", (department,))
    else:
        cursor.execute("SELECT roll_number, name FROM Students")

    students = cursor.fetchall()
    cursor.close()
    return jsonify([{"roll_number": student[0], "name": student[1]} for student in students])

@app.route('/attendance', methods=['POST'])
def save_attendance():
    data = request.json
    cursor = mysql.connection.cursor()

    for record in data['attendance_records']:
        cursor.execute(""" 
            INSERT INTO Attendance (date, roll_number, name, department, class, subject, teacher_name, lecture_time, attendance)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            attendance = VALUES(attendance)
        """, (record['date'], record['roll_number'], record['name'], record['department'], record['class'], record['subject'], record['teacher_name'], record['lecture_time'], record['attendance']))

    mysql.connection.commit()
    cursor.close()
    return jsonify({"status": "success"})

@app.route('/attendance-data', methods=['GET'])
def get_attendance_data():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    department = request.args.get('department', '').strip()
    class_name = request.args.get('class', '').strip()

    if not start_date or not end_date:
        return jsonify({'message': 'Start date and end date are required'}), 400

    try:
        cur = mysql.connection.cursor()
        query = """
            SELECT date, roll_number, name, department, class, attendance, lecture_time
            FROM attendance
            WHERE date BETWEEN %s AND %s
        """
        filters = [start_date, end_date]

        if department:
            query += " AND department = %s"
            filters.append(department)

        if class_name:
            query += " AND class = %s"
            filters.append(class_name)

        cur.execute(query, tuple(filters))
        rows = cur.fetchall()
        cur.close()

        if not rows:
            return jsonify([])

        result = [
            {
                'date': row[0],
                'roll_number': row[1],
                'name': row[2],
                'department': row[3],
                'class': row[4],
                'attendance': row[5],
                'lecture_time': row[6]
            } for row in rows
        ]
        return jsonify(result)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred while fetching attendance data'}), 500

# Helper function to process Excel file
def process_excel(file_path):
    workbook = load_workbook(file_path)
    sheet = workbook.active
    data = []
    for row in sheet.iter_rows(min_row=2, values_only=True):
        data.append(row)
    return data

@app.route('/attendance-csv', methods=['GET'])
def download_attendance_csv():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if not start_date or not end_date:
        return jsonify({'message': 'Start and end dates are required'}), 400

    try:
        cursor = mysql.connection.cursor()
        query = """
            SELECT date, roll_number, name, department, class, attendance, lecture_time
            FROM Attendance
            WHERE date BETWEEN %s AND %s
        """
        cursor.execute(query, (start_date, end_date))
        rows = cursor.fetchall()
        cursor.close()

        if not rows:
            return jsonify({'message': 'No attendance records found for the given dates'}), 404

        # Generate CSV content
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Date', 'Roll Number', 'Name', 'Department', 'Class', 'Attendance', 'Lecture Time'])
        writer.writerows(rows)
        output.seek(0)

        # Return CSV file
        return Response(
            output,
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment;filename=attendance_{start_date}_to_{end_date}.csv'}
        )

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred while generating the CSV'}), 500

@app.route('/student-departments', methods=['GET'])
def get_student_departments():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT DISTINCT department FROM students ORDER BY department ASC")
    departments = cursor.fetchall()
    cursor.close()
    return jsonify([dept[0] for dept in departments])

# Manual Student Submission
@app.route('/submit', methods=['POST'])
def submit_student():
    try:
        data = request.json
        roll_number = data.get('roll_number')
        name = data.get('name')
        department = data.get('department')
        class_value = data.get('class')

        if not all([roll_number, name, department, class_value]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400

        cursor = mysql.connection.cursor()

        # Check if the roll number already exists
        cursor.execute("SELECT * FROM Students WHERE roll_number = %s", (roll_number,))
        existing_student = cursor.fetchone()

        if existing_student:
            cursor.close()
            return jsonify({'success': False, 'message': 'Roll number already exists'}), 409

        # Insert into the database
        cursor.execute("""
            INSERT INTO Students (roll_number, name, department, class)
            VALUES (%s, %s, %s, %s)
        """, (roll_number, name, department, class_value))
        mysql.connection.commit()
        cursor.close()

        return jsonify({'success': True, 'message': 'Student added successfully'})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'message': 'Failed to submit student data'}), 500

# Upload Excel File
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/upload-file', methods=['POST'])
def upload_file():
    try:
        file = request.files.get('file')
        if not file or file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({'success': False, 'message': 'Invalid file format'}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Process file based on extension (excel/csv)
        file_ext = filename.rsplit('.', 1)[1].lower()
        if file_ext in ['xlsx', 'xls']:
            data = process_excel(filepath)
        elif file_ext == 'csv':
            with open(filepath, newline='', encoding='utf-8') as f:
                reader = csv.reader(f)
                data = [row for row in reader]

        return jsonify({'success': True, 'data': data})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'message': 'Failed to upload file'}), 500

if __name__ == '__main__':
    app.run(debug=True)
