document.addEventListener("DOMContentLoaded", async () => {
    // Set the max date to the current date
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    startDateInput.setAttribute('max', today);
    endDateInput.setAttribute('max', today);

    const filterButton = document.getElementById('filter-data');
    const extractCsvButton = document.getElementById('extract-csv');
    const departmentDropdown = document.getElementById('department');
    const classDropdown = document.getElementById('class');
    const tableBody = document.getElementById('attendance-table').querySelector('tbody');
    const tableHeaders = document.querySelectorAll('#attendance-table thead th');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search');
    const clearSearchButton = document.getElementById('clear-search');

    const baseUrl = 'https://your-app-name.onrender.com'; // Replace with your actual Render app URL

    // Fetch data for dropdowns
    async function fetchDropdownData(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    }

    // Populate dropdown with values
    async function populateDropdown(dropdown, data) {
        dropdown.innerHTML = '<option value="">Select</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            dropdown.appendChild(option);
        });
    }

    // Populate department dropdown on page load
    const departments = await fetchDropdownData(`${baseUrl}/student-departments`);
    populateDropdown(departmentDropdown, departments);

    // Populate classes based on selected department
    departmentDropdown.addEventListener('change', async () => {
        const department = departmentDropdown.value;
        if (department) {
            const classes = await fetchDropdownData(`${baseUrl}/student-classes?department=${department}`);
            populateDropdown(classDropdown, classes);
        } else {
            populateDropdown(classDropdown, []);
        }
    });

    // Fetch attendance data based on selected filters
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
            const url = new URL(`${baseUrl}/attendance-data`);
            const params = {
                start_date: startDate,
                end_date: endDate,
            };

            if (department) params.department = department;
            if (className) params.class = className;

            const response = await fetch(`${url}?${new URLSearchParams(params).toString()}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            displayAttendanceData(data);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            alert('Error fetching attendance data. Please check the console for details.');
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

    // Search functionality
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (!query) {
            alert("Please enter a value to search.");
            return;
        }
        filterTableRows(query);
    });

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

    // Clear search functionality
    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        filterTableRows('');
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
            const response = await fetch(`${baseUrl}/attendance-csv?start_date=${startDate}&end_date=${endDate}`);
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

    // Sorting functionality
    function sortTable(columnIndex, isAscending) {
        const rows = Array.from(tableBody.rows); // Get all rows as an array

        rows.sort((a, b) => {
            const cellA = a.cells[columnIndex].textContent.trim().toLowerCase();
            const cellB = b.cells[columnIndex].textContent.trim().toLowerCase();

            if (!isNaN(Date.parse(cellA)) && !isNaN(Date.parse(cellB))) {
                return isAscending
                    ? new Date(cellA) - new Date(cellB)
                    : new Date(cellB) - new Date(cellA);
            } else if (!isNaN(cellA) && !isNaN(cellB)) {
                return isAscending ? cellA - cellB : cellB - cellA;
            } else {
                return isAscending
                    ? cellA.localeCompare(cellB)
                    : cellB.localeCompare(cellA);
            }
        });

        rows.forEach(row => tableBody.appendChild(row)); // Reorder rows in table
    }

    // Add click event listeners to table headers for sorting
    tableHeaders.forEach((header, index) => {
        let isAscending = true; // Track sort direction

        header.addEventListener('click', () => {
            sortTable(index, isAscending); // Sort by the clicked column
            isAscending = !isAscending; // Toggle sort direction
        });
    });
});
