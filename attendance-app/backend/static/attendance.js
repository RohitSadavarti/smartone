// ✅ Hide skeleton overlay after full page load
window.addEventListener("load", () => {
  const overlay = document.getElementById("skeleton-overlay");
  if (overlay) {
    overlay.style.display = "none";
  }
});

// ✅ DOM content ready logic with attendance filtering and loader integration
document.addEventListener("DOMContentLoaded", () => {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const filterButton = document.getElementById('filter-data');
    const extractCsvButton = document.getElementById('extract-csv');
    const searchButton = document.getElementById('search');
    const clearSearchButton = document.getElementById('clear-search');
    const searchInput = document.getElementById('search-input');
    const departmentDropdown = document.getElementById('department');
    const classDropdown = document.getElementById('class');
    const table = document.getElementById('attendance-table');
    const tableBody = table.querySelector('tbody');
    const tableHeaders = table.querySelectorAll('thead th');
    const today = new Date().toISOString().split('T')[0];

    if (startDateInput) startDateInput.setAttribute('max', today);
    if (endDateInput) endDateInput.setAttribute('max', today);

    // ✅ Filter attendance
    filterButton?.addEventListener('click', async () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const department = departmentDropdown.value;
        const className = classDropdown.value;

        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }

        try {
            document.getElementById("skeleton-overlay").style.display = "flex";

            const params = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
            });
            if (department) params.append('department', department);
            if (className) params.append('class', className);

            const response = await fetch(`/attendance-data?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch data');

            const data = await response.json();
            displayAttendanceData(data);
            document.getElementById("skeleton-overlay").style.display = "none";
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            alert('Error fetching attendance data. Please check the console for details.');
        }
    });

    // ✅ Export CSV
    extractCsvButton?.addEventListener('click', async () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }

        try {
            const response = await fetch(`/attendance-csv?start_date=${startDate}&end_date=${endDate}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'attendance_data.csv';
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                const error = await response.json();
                alert(error.message || 'Error generating CSV');
            }
        } catch (error) {
            console.error('Error generating CSV:', error);
        }
    });

    // ✅ Display attendance data in table
    function displayAttendanceData(data) {
        tableBody.innerHTML = '';
        document.getElementById("skeleton-overlay").style.display = "none";

        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="7">No records found for the selected dates</td>';
            tableBody.appendChild(row);
            return;
        }

        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        data.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.roll_number}</td>
                <td>${record.name}</td>
                <td>${record.department}</td>
                <td>${record.class}</td>
                <td>${record.attendance}</td>
                <td>${record.lecture_time}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // ✅ Search filter
    function filterTableRows(query) {
        const rows = tableBody.querySelectorAll('tr');
        query = query.toLowerCase();
        rows.forEach(row => {
            const cells = Array.from(row.cells);
            const matches = cells.some(cell => cell.textContent.toLowerCase().includes(query));
            row.style.display = matches ? '' : 'none';
        });
    }

    // ✅ Sort columns
    function sortTable(columnIndex, isAscending) {
        const rows = Array.from(tableBody.rows);
        rows.sort((a, b) => {
            const cellA = a.cells[columnIndex].textContent.trim().toLowerCase();
            const cellB = b.cells[columnIndex].textContent.trim().toLowerCase();
            if (!isNaN(Date.parse(cellA)) && !isNaN(Date.parse(cellB))) {
                return isAscending ? new Date(cellA) - new Date(cellB) : new Date(cellB) - new Date(cellA);
            } else if (!isNaN(cellA) && !isNaN(cellB)) {
                return isAscending ? cellA - cellB : cellB - cellA;
            } else {
                return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
            }
        });
        rows.forEach(row => tableBody.appendChild(row));
    }

    tableHeaders.forEach((header, index) => {
        let isAscending = true;
        header.addEventListener('click', () => {
            sortTable(index, isAscending);
            isAscending = !isAscending;
        });
    });

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (!query) {
            alert("Please enter a value to search.");
            return;
        }
        filterTableRows(query);
    });

    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        filterTableRows('');
    });

    async function fetchDepartments() {
        try {
            const response = await fetch('/student-departments');
            const departments = await response.json();
            departments.forEach(department => {
                const option = document.createElement('option');
                option.value = department;
                option.textContent = department;
                departmentDropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    }

    async function fetchClasses() {
        try {
            const response = await fetch('/student-classes');
            const classes = await response.json();
            classes.forEach(className => {
                const option = document.createElement('option');
                option.value = className;
                option.textContent = className;
                classDropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    }

    fetchDepartments();
    fetchClasses();
});
