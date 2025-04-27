document.addEventListener("DOMContentLoaded", () => {
    // Initialize DOM elements
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

    // Set maximum dates for inputs
    if (startDateInput) startDateInput.setAttribute('max', today);
    if (endDateInput) endDateInput.setAttribute('max', today);

    // Fetch and display attendance data
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
            const url = new URL('/attendance-data');
            const params = {
                start_date: startDate,
                end_date: endDate,
            };

            // Add department and class filters to URL parameters if selected
            if (department && department !== "") params.department = department;
            if (className && className !== "") params.class = className;

            // Send the request with parameters
            const response = await fetch(`${url}?${new URLSearchParams(params).toString()}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            displayAttendanceData(data);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            alert('Error fetching attendance data. Please check the console for details.');
        }
    });

    // Extract CSV data
    extractCsvButton?.addEventListener('click', async () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const department = departmentDropdown.value;
        const className = classDropdown.value;
        
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

    // Display attendance data in the table
    function displayAttendanceData(data) {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="7">No records found for the selected dates</td>';
            tableBody.appendChild(row);
            return;
        }

        // Sort data by date in descending order (most recent first)
        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Create rows and append to the table
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

    // Filter table rows based on search input
    function filterTableRows(query) {
        const rows = tableBody.querySelectorAll('tr');
        query = query.toLowerCase();

        rows.forEach(row => {
            const cells = Array.from(row.cells);
            const matches = cells.some(cell => cell.textContent.toLowerCase().includes(query));
            row.style.display = matches ? '' : 'none';
        });
    }

    // Sorting functionality
    function sortTable(columnIndex, isAscending) {
        const rows = Array.from(tableBody.rows); // Get all rows as an array

        rows.sort((a, b) => {
            const cellA = a.cells[columnIndex].textContent.trim().toLowerCase();
            const cellB = b.cells[columnIndex].textContent.trim().toLowerCase();

            if (!isNaN(Date.parse(cellA)) && !isNaN(Date.parse(cellB))) {
                // If the column contains dates, parse and compare them
                return isAscending
                    ? new Date(cellA) - new Date(cellB)
                    : new Date(cellB) - new Date(cellA);
            } else if (!isNaN(cellA) && !isNaN(cellB)) {
                // If the column contains numbers, compare them numerically
                return isAscending ? cellA - cellB : cellB - cellA;
            } else {
                // Otherwise, compare as strings
                return isAscending
                    ? cellA.localeCompare(cellB)
                    : cellB.localeCompare(cellA);
            }
        });

        // Append sorted rows back to the table body
        rows.forEach(row => tableBody.appendChild(row));
    }

    // Add click event listeners to table headers
    tableHeaders.forEach((header, index) => {
        let isAscending = true; // Track sort direction

        header.addEventListener('click', () => {
            sortTable(index, isAscending); // Sort by the clicked column
            isAscending = !isAscending; // Toggle sort direction
        });
    });

    // Search functionality
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (!query) {
            alert("Please enter a value to search.");
            return;
        }
        filterTableRows(query);
    });

    // Clear search functionality
    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        filterTableRows('');
    });

    // Fetch and populate Department and Class dropdowns
    async function fetchDepartments() {
        try {
            const response = await fetch('/student-departments');
            const departments = await response.json();
            console.log('Departments fetched:', departments);  // Debug log
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
            console.log('Classes fetched:', classes);  // Debug log
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

    // Fetch initial data for dropdowns
    fetchDepartments();
    fetchClasses();
});
