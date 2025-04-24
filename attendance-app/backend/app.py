import csv
import os
from io import StringIO
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import mysql.connector
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

def get_mysql_connection():
    return mysql.connector.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        database=app.config['MYSQL_DB']
    )

# Routes for Departments, Teachers, Subjects, Time Slots, and Students (Python 1)
@app.route('/departments', methods=['GET'])
def get_departments():
    connection = get_mysql_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT DISTINCT department FROM Teachers ORDER BY department ASC")
    departments = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify([dept[0] for dept in departments])

@app.route('/teachers', methods=['GET'])
def get_teachers():
    department = request.args.get('department')
    connection = get_mysql_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT DISTINCT teacher_name FROM Teachers WHERE department = %s ORDER BY teacher_name ASC", (department,))
    teachers = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify([teacher[0] for teacher in teachers])

@app.route('/student-classes', methods=['GET'])
def get_student_classes():
    connection = get_mysql_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT DISTINCT class FROM students ORDER BY class ASC")
    classes = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify([class_[0] for class_ in classes])

@app.route('/subjects', methods=['GET'])
def get_subjects():
    department = request.args.get('department')
    class_name = request.args.get('class')
    teacher_name = request.args.get('teacher_name')

    if not department or not class_name or not teacher_name:
        return jsonify({"error": "Parameters 'department', 'class', and 'teacher_name' are required"}), 400

    connection = get_mysql_connection()
    cursor = connection.cursor()
    query = """
        SELECT DISTINCT subject 
        FROM Teachers 
        WHERE department = %s AND `class` = %s AND teacher_name = %s
        ORDER BY subject ASC
    """
    cursor.execute(query, (department, class_name, teacher_name))
    subjects = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify([subject[0] for subject in subjects])

@app.route('/time-slots', methods=['GET'])
def get_time_slots():
    connection = get_mysql_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT DISTINCT time_slot FROM Teachers ORDER BY time_slot ASC")
    time_slots = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify([time_slot[0] for time_slot in time_slots])

@app.route('/students', methods=['GET'])
def get_students():
    query = request.args.get('query', '').strip()
    department = request.args.get('department', '').strip()
    connection = get_mysql_connection()
    cursor = connection.cursor()

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
    connection.close()
    return jsonify([{"roll_number": student[0], "name": student[1]} for student in students])

@app.route('/attendance', methods=['POST'])
def save_attendance():
    data = request.json
    connection = get_mysql_connection()
    cursor = connection.cursor()

    for record in data['attendance_records']:
        cursor.execute(""" 
            INSERT INTO Attendance (date, roll_number, name, department, class, subject, teacher_name, lecture_time, attendance)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            attendance = VALUES(attendance)
        """, (record['date'], record['roll_number'], record['name'], record['department'], record['class'], record['subject'], record['teacher_name'], record['lecture_time'], record['attendance']))

    connection.commit()
    cursor.close()
    connection.close()
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
        connection = get_mysql_connection()
        cursor = connection.cursor()
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

        cursor.execute(query, tuple(filters))
        rows = cursor.fetchall()
        cursor.close()
        connection.close()

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

@app.route('/attendance-csv', methods=['GET'])
def download_attendance_csv():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if not start_date or not end_date:
        return jsonify({'message': 'Start and end dates are required'}), 400

    try:
        connection = get_mysql_connection()
        cursor = connection.cursor()
        query = """
            SELECT date, roll_number, name, department, class, attendance, lecture_time
            FROM Attendance
            WHERE date BETWEEN %s AND %s
        """
        cursor.execute(query, (start_date, end_date))
        rows = cursor.fetchall()
        cursor.close()
        connection.close()

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
            headers={'Content-Disposition': f'attachment;filename=attendance_{start_date}_to_{end_date}.csv' }
        )

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred while generating the CSV'}), 500

@app.route('/submit', methods=['POST'])

@app.route('/student-departments', methods=['GET'])
def get_student_departments():
    connection = get_mysql_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT DISTINCT department FROM students ORDER BY department ASC")
    departments = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify([dept[0] for dept in departments])

# Manual Student Submission
@app.route('/submit', methods=['POST'])
def submit_student():
    try:
        # Get data from the request
        data = request.json
        roll_number = data.get('roll_number')
        name = data.get('name')
        department = data.get('department')
        class_value = data.get('class')

        # Validate data
        if not all([roll_number, name, department, class_value]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400

        connection = get_mysql_connection()
        cursor = connection.cursor()

        # Check if the roll number already exists
        cursor.execute("SELECT * FROM Students WHERE roll_number = %s", (roll_number,))
        existing_student = cursor.fetchone()

        if existing_student:
            cursor.close()
            return jsonify({'success': False, 'message': 'Roll number already exists'}), 409  # 409 Conflict

        # Insert into the database
        cursor.execute("""
            INSERT INTO Students (roll_number, name, department, class)
            VALUES (%s, %s, %s, %s)
        """, (roll_number, name, department, class_value))
        connection.commit()
        cursor.close()

        return jsonify({'success': True, 'message': 'Student added successfully'})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'message': 'Failed to submit student data'}), 500

# Upload Excel File
def process_excel(file_path):
    # Parse the Excel file and return the data
    data = []
    workbook = load_workbook(file_path)
    sheet = workbook.active
    for row in sheet.iter_rows(min_row=2, values_only=True):  # Assuming data starts from row 2
        data.append(row)
    return data

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/upload-file', methods=['POST'])
def upload_file():
    try:
        file = request.files.get('file')
        if not file or file.filename == '':
            return jsonify({'message': 'No file selected'}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

            # Ensure the upload folder exists
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

            file.save(file_path)

            # Parse the file and insert data into the database
            data = process_excel(file_path)
            total_records = len(data)
            valid_records = 0
            error_records = 0

            cursor = mysql.connection.cursor()

            # Track valid and error records
            valid_data = []
            error_data = []

            for row in data:
                try:
                    roll_number, name, department, class_value = row
                    # Check if the roll number already exists
                    cursor.execute("SELECT * FROM Students WHERE roll_number = %s", (roll_number,))
                    existing_student = cursor.fetchone()
                    
                    if existing_student:
                        error_data.append(row + ('Duplicate roll number',))
                        error_records += 1
                        continue  # Skip inserting this record

                    # Insert the record into the Students table
                    cursor.execute("""
                        INSERT INTO Students (roll_number, name, department, class)
                        VALUES (%s, %s, %s, %s)
                    """, (roll_number, name, department, class_value))

                    valid_data.append(row)
                    valid_records += 1
                except Exception as e:
                    error_data.append(row + (str(e),))
                    error_records += 1

            mysql.connection.commit()
            cursor.close()

            # Save the valid and error records to separate tables
            if valid_data:
                cursor = mysql.connection.cursor()
                cursor.executemany("""
                    INSERT INTO Validrecords (roll_number, name, department, class)
                    VALUES (%s, %s, %s, %s)
                """, valid_data)
                mysql.connection.commit()
                cursor.close()

            if error_data:
                cursor = mysql.connection.cursor()
                cursor.executemany("""
                    INSERT INTO Errorrecords (roll_number, name, department, class, error_message)
                    VALUES (%s, %s, %s, %s, %s)
                """, error_data)
                mysql.connection.commit()
                cursor.close()

            # Record upload history
            upload_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor = mysql.connection.cursor()
            cursor.execute("""
                INSERT INTO UploadHistory (uploader_name, total_records, valid_records, error_records, upload_time)
                VALUES (%s, %s, %s, %s, %s)
            """, ("Admin", total_records, valid_records, error_records, upload_time))
            mysql.connection.commit()
            cursor.close()

            return jsonify({
                'message': 'File processed successfully.',
                'total_records': total_records,
                'valid_records': valid_records,
                'error_records': error_records
            }), 200
        else:
            return jsonify({'message': 'Invalid file type. Only .xlsx, .xls, and .csv files are allowed.'}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred while processing the file.'}), 500


# Route to get upload history and the total records
@app.route('/upload-history', methods=['GET'])
def upload_history():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT uploader_name, total_records, valid_records, error_records, upload_time 
            FROM UploadHistory
        """)
        rows = cursor.fetchall()
        cursor.close()

        history = [
            {
                'uploader_name': row[0],
                'total_records': row[1],
                'valid_records': row[2],
                'error_records': row[3],
                'upload_time': row[4]
            } for row in rows
        ]
        return jsonify(history)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'Failed to fetch upload history'}), 500


# Route for downloading valid records as CSV
@app.route('/valid-records-csv', methods=['GET'])
def download_valid_csv():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT roll_number, name, department, class FROM Validrecords")
        rows = cursor.fetchall()
        cursor.close()

        if not rows:
            return jsonify({'message': 'No valid records found'}), 404

        # Generate CSV content
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Roll Number', 'Name', 'Department', 'Class'])
        writer.writerows(rows)
        output.seek(0)

        # Return CSV file
        return Response(
            output,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment;filename=valid_records.csv'}
        )
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred while generating the CSV'}), 500

# Route for downloading error records as CSV
@app.route('/error-records-csv', methods=['GET'])
def download_error_csv():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT roll_number, name, department, class, error_message FROM Errorrecords")
        rows = cursor.fetchall()
        cursor.close()

        if not rows:
            return jsonify({'message': 'No error records found'}), 404

        # Generate CSV content
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Roll Number', 'Name', 'Department', 'Class', 'Error Message'])
        writer.writerows(rows)
        output.seek(0)

        # Return CSV file
        return Response(
            output,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment;filename=error_records.csv'}
        )
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred while generating the CSV'}), 500


@app.route('/upload-history/row-count', methods=['GET'])
def get_row_count():
    try:
        uploader_name = request.args.get('uploader_name', '').strip()  # Value selected from dropdown
        if not uploader_name:
            return jsonify({'message': 'Uploader name is required'}), 400

        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT COUNT(*) 
            FROM UploadHistory 
            WHERE uploader_name = %s
        """, (uploader_name,))
        row_count = cursor.fetchone()[0]
        cursor.close()

        return jsonify({'uploader_name': uploader_name, 'row_count': row_count})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred while fetching row count'}), 500

@app.route('/teachers', methods=['POST'])
def save_teacher():
    try:
        data = request.json
        teacher_name = data.get('teacher_name')
        day = data.get('day')
        subject = data.get('subject')
        time_slot = data.get('time_slot')
        department = data.get('department')
        class_value = data.get('class')

        if not all([teacher_name, day, subject, time_slot, department, class_value]):
            return jsonify({'message': 'All fields are required'}), 400

        cursor = mysql.connection.cursor()
        query = """
            INSERT INTO Teachers (teacher_name, day, subject, time_slot, department, class)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                subject = VALUES(subject),
                time_slot = VALUES(time_slot),
                department = VALUES(department),
                class = VALUES(class)
        """
        cursor.execute(query, (teacher_name, day, subject, time_slot, department, class_value))
        mysql.connection.commit()
        cursor.close()

        return jsonify({'message': 'Teacher data saved or updated successfully'})
    except Exception as e:
        print(f"Error saving teacher: {e}")
        return jsonify({'message': 'Failed to save teacher data'}), 500


@app.route('/upload-teachers', methods=['POST'])
def upload_teachers():
    try:
        file = request.files.get('file')
        if not file or file.filename == '':
            return jsonify({'message': 'No file selected'}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

            # Ensure the upload folder exists
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

            file.save(file_path)

            # Parse the file and insert data into the Teachers table
            data = process_excel(file_path)
            total_records = len(data)
            valid_records = 0
            error_records = 0

            cursor = mysql.connection.cursor()

            # Track valid and error records
            valid_data = []
            error_data = []

            for row in data:
                try:
                    teacher_name, day, subject, time_slot, department, class_value = row

                    # Insert into Teachers table
                    cursor.execute("""
                        INSERT INTO Teachers (teacher_name, day, subject, time_slot, department, class)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (teacher_name, day, subject, time_slot, department, class_value))

                    valid_data.append(row)
                    valid_records += 1
                except Exception as e:
                    error_data.append(row + (str(e),))
                    error_records += 1

            mysql.connection.commit()
            cursor.close()

            # Save the valid and error records to separate tables for reporting
            if valid_data:
                cursor = mysql.connection.cursor()
                cursor.executemany("""
                    INSERT INTO ValidTeachers (teacher_name, day, subject, time_slot, department, class)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, valid_data)
                mysql.connection.commit()
                cursor.close()

            if error_data:
                cursor = mysql.connection.cursor()
                cursor.executemany("""
                    INSERT INTO ErrorTeachers (teacher_name, day, subject, time_slot, department, class, error_message)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, error_data)
                mysql.connection.commit()
                cursor.close()

            return jsonify({
                'message': 'File processed successfully.',
                'total_records': total_records,
                'valid_records': valid_records,
                'error_records': error_records
            }), 200
        else:
            return jsonify({'message': 'Invalid file type. Only .xlsx, .xls, and .csv files are allowed.'}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred while processing the file.'}), 500


if __name__ == '__main__':
    app.run(debug=True)
