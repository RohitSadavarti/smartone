document.addEventListener("DOMContentLoaded", async () => {
    // Show loading overlay
    showLoading();

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

    // Loading functions
    function showLoading() {
        let loadingOverlay = document.getElementById('loading-overlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading...</div>
            `;
            document.body.appendChild(loadingOverlay);
        }
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

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

    // Fetch data for dropdowns with loading
    async function fetchDropdownData(url) {
        try {
            showLoading();
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        } finally {
            hideLoading();
        }
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

    try {
        // Populate departments on page load
        const departments = await fetchDropdownData('/departments');
        populateDropdown(departmentDropdown, departments);

        // Fetch time slots
        const timeSlots = await fetchDropdownData('/time-slots');
        populateDropdown(timeDropdown, timeSlots);

        // Fetch initial students
        await fetchAllStudents();
    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        hideLoading();
    }

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

    // Populate classes when a teacher is selected
    teacherDropdown.addEventListener('change', async () => {
        const teacher = teacherDropdown.value;
        if (teacher) {
            const classes = await fetchDropdownData(`/student-classes?teacher=${teacher}`);
            populateDropdown(classDropdown, classes);
        } else {
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

    async function fetchAllStudents() {
        try {
            showLoading();
            const response = await fetch('/students');
            const students = await response.json();
            displayStudents(students);
        } catch (error) {
            console.error('Error fetching students:', error);
            displayStudents([]);
        } finally {
            hideLoading();
        }
    }

    function displayStudents(students) {
        const tableBody = document.getElementById('student-table').querySelector('tbody');
        tableBody.innerHTML = '';

        if (students.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="3" style="text-align: center; padding: 20px; color: #666;">No students found</td>`;
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
                    presentBtn.classList.remove('selected');
                } else {
                    presentBtn.classList.add('selected');
                    absentBtn.classList.remove('selected');
                }
            });

            absentBtn.addEventListener('click', () => {
                if (absentBtn.classList.contains('selected')) {
                    absentBtn.classList.remove('selected');
                } else {
                    absentBtn.classList.add('selected');
                    presentBtn.classList.remove('selected');
                }
            });
        });
    }

    // Filter students by department + class
    document.getElementById('search-filters').addEventListener('click', async () => {
        const department = departmentDropdown.value;
        const className = classDropdown.value;

        if (!department || !className) {
            alert('Please select both department and class.');
            return;
        }

        const queryString = new URLSearchParams({
            department: department,
            class: className
        }).toString();

        try {
            showLoading();
            const response = await fetch(`/students?${queryString}`);
            const students = await response.json();
            displayStudents(students);
        } catch (error) {
            console.error('Error fetching filtered students:', error);
        } finally {
            hideLoading();
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

            if (presentBtn && presentBtn.classList.contains('selected')) attendance = 'P';
            if (absentBtn && absentBtn.classList.contains('selected')) attendance = 'A';

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
            showLoading();
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
        } finally {
            hideLoading();
        }
    });
});
