document.addEventListener("DOMContentLoaded", async () => {
    // Set the max date to the current date
    const today = new Date().toISOString().split('T')[0];
    const attendanceDateInput = document.getElementById('attendance-date');
    attendanceDateInput.setAttribute('max', today);

    const popupBox = document.getElementById('popup-box');
    const closePopup = document.getElementById('close-popup');
    const departmentDropdown = document.getElementById('department');
    const teacherDropdown = document.getElementById('teacher');
    const classDropdown = document.getElementById('class');
    const subjectDropdown = document.getElementById('subject');
    const timeDropdown = document.getElementById('time');
    const saveAttendanceButton = document.getElementById('save-attendance');

    // Show Popup Function
    function showPopup(message) {
        popupBox.querySelector('p').textContent = message; // Update message
        popupBox.style.display = 'block'; // Ensure display is block
        popupBox.classList.remove('hidden'); // Show popup
    }

    // Close Popup Event
    closePopup.addEventListener('click', () => {
        popupBox.style.display = 'none'; // Hide the popup
        popupBox.classList.add('hidden'); // Add hidden class for consistency
    });

    // Fetch data for dropdowns
    async function fetchDropdownData(url) {
        const response = await fetch(url);
        return await response.json();
    }

    async function populateDropdown(dropdown, data) {
        dropdown.innerHTML = '<option value="">Select</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            dropdown.appendChild(option);
        });
    }

    // Populate departments on page load
    const departments = await fetchDropdownData('/departments');
    populateDropdown(departmentDropdown, departments);

    // Populate teachers when a department is selected
    departmentDropdown.addEventListener('change', async () => {
        const department = departmentDropdown.value;
        if (department) {
            const teachers = await fetchDropdownData(`/teachers?department=${department}`);
            populateDropdown(teacherDropdown, teachers);
        } else {
            populateDropdown(teacherDropdown, []);
        }
    });

    // Populate subjects and classes when a teacher is selected
    teacherDropdown.addEventListener('change', async () => {
        const teacher = teacherDropdown.value;
        if (teacher) {
//            const subjects = await fetchDropdownData(`/subjects?teacher=${teacher}`);
//            populateDropdown(subjectDropdown, subjects);

            const classes = await fetchDropdownData(`/student-classes?teacher=${teacher}`);
            populateDropdown(classDropdown, classes);
        } else {
//            populateDropdown(subjectDropdown, []);
            populateDropdown(classDropdown, []);
        }
    });


// Populate subjects when a class is selected
classDropdown.addEventListener('change', async () => {
    const department = departmentDropdown.value;
    const className = classDropdown.value;
    const teacherName = teacherDropdown.value;

    if (department && className && teacherName) {
        const subjects = await fetchDropdownData(`/subjects?department=${department}&class=${className}&teacher_name=${teacherName}`);
        populateDropdown(subjectDropdown, subjects);
    } else {
        populateDropdown(subjectDropdown, []);
    }
});



    // Fetch time slots
    const timeSlots = await fetchDropdownData('/time-slots');
    populateDropdown(timeDropdown, timeSlots);

    async function fetchAllStudents() {
        const response = await fetch('/students');
        const students = await response.json();
        displayStudents(students);
    }

    function displayStudents(students) {
        const tableBody = document.getElementById('student-table').querySelector('tbody');
        tableBody.innerHTML = '';

        if (students.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="3">No students found</td>`;
            tableBody.appendChild(row);
            return;
        }

        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.roll_number}</td>
                <td>${student.name}</td>
                <td>
                    <button class="present-btn">Present</button>
                    <button class="absent-btn">Absent</button>
                </td>
            `;
            tableBody.appendChild(row);

            const presentBtn = row.querySelector('.present-btn');
            const absentBtn = row.querySelector('.absent-btn');

            presentBtn.addEventListener('click', () => {
                if (presentBtn.classList.contains('selected')) {
                    presentBtn.classList.remove('selected', 'present');
                    presentBtn.style.backgroundColor = '';
                    presentBtn.style.color = '';
                } else {
                    presentBtn.classList.add('selected', 'present');
                    presentBtn.style.backgroundColor = 'green';
                    presentBtn.style.color = 'white';

                    absentBtn.classList.remove('selected', 'absent');
                    absentBtn.style.backgroundColor = '';
                    absentBtn.style.color = '';
                }
            });

            absentBtn.addEventListener('click', () => {
                if (absentBtn.classList.contains('selected')) {
                    absentBtn.classList.remove('selected', 'absent');
                    absentBtn.style.backgroundColor = '';
                    absentBtn.style.color = '';
                } else {
                    absentBtn.classList.add('selected', 'absent');
                    absentBtn.style.backgroundColor = 'red';
                    absentBtn.style.color = 'white';

                    presentBtn.classList.remove('selected', 'present');
                    presentBtn.style.backgroundColor = '';
                    presentBtn.style.color = '';
                }
            });
        });
    }

    await fetchAllStudents();

    // Filter students by department
    document.getElementById('search-filters').addEventListener('click', async () => {
        const department = departmentDropdown.value;
        if (department) {
            const response = await fetch(`/students?department=${department}`);
            const students = await response.json();
            displayStudents(students);
        } else {
            alert('Please select a department.');
        }
    });

    // Save attendance
    saveAttendanceButton.addEventListener('click', async () => {
        const date = attendanceDateInput.value;
        const department = departmentDropdown.value;
        const teacherName = teacherDropdown.value;
        const classValue = classDropdown.value;
        const subject = subjectDropdown.value;
        const lectureTime = timeDropdown.value;

        if (!date || !department || !teacherName || !classValue || !subject || !lectureTime) {
            alert('Please fill all required fields.');
            return;
        }

        const rows = document.querySelectorAll('#student-table tbody tr');
        const attendanceRecords = Array.from(rows).map(row => {
            const rollNumber = row.cells[0].textContent;
            const name = row.cells[1].textContent;
            const presentBtn = row.querySelector('.present-btn');
            const absentBtn = row.querySelector('.absent-btn');
            let attendance = '';

            if (presentBtn.classList.contains('selected')) attendance = 'P';
            if (absentBtn.classList.contains('selected')) attendance = 'A';

            return {
                date,
                roll_number: rollNumber,
                name,
                department,
                class: classValue,
                subject,
                teacher_name: teacherName,
                lecture_time: lectureTime,
                attendance,
            };
        });

        try {
            const response = await fetch('/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attendance_records: attendanceRecords }),
            });

            const result = await response.json();
            if (result.status === 'success') {
                showPopup('ATTENDANCE SAVED SUCCESSFULLY');
                setTimeout(() => {
                    popupBox.classList.add('hidden');
                    popupBox.style.display = 'none';
                    window.location.reload();
                }, 3000);
            } else {
                alert('Error saving attendance.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save attendance. Please try again.');
        }
    });
}); 
