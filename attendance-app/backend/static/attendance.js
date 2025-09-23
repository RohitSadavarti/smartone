document.addEventListener("DOMContentLoaded", () => {
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

    // Get DOM elements
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
    const tableBody = table ? table.querySelector('tbody') : null;
    const tableHeaders = table ? table.querySelectorAll('thead th') : [];

    // Set max date to today
    const today = new Date().toISOString().split('T')[0];
    if (startDateInput) startDateInput.setAttribute('max', today);
    if (endDateInput) endDateInput.setAttribute('max', today);

    // Show initial loading and hide after setup
    showLoading();
    setTimeout(() => {
        hideLoading();
    }, 500);

    // Filter attendance with loading
    if (filterButton) {
        filterButton.addEventListener('click', async () => {
            const startDate = startDateInput ? startDateInput.value : '';
            const endDate = endDateInput ? endDateInput.value : '';
            const department = departmentDropdown ? departmentDropdown.value : '';
            const className = classDropdown ? classDropdown.value : '';

            if (!startDate || !endDate) {
                alert('Please select both start and end dates.');
                return;
            }

            try {
                showLoading();
                
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
            } catch (error) {
                console.error('Error fetching attendance data:', error);
                alert('Error fetching attendance data. Please check the console for details.');
            } finally {
                hideLoading();
            }
        });
    }

    // Export CSV with loading
    if (extractCsvButton) {
        extractCsvButton.addEventListener('click', async () => {
            const startDate = startDateInput ? startDateInput.value : '';
            const endDate = endDateInput ? endDateInput.value : '';
            const department = departmentDropdown ? departmentDropdown.value : '';
            const className = classDropdown ? classDropdown.value : '';

            if (!startDate || !endDate) {
                alert('Please select both start and end dates.');
                return;
            }

            try {
                showLoading();
                
                const params = new URLSearchParams({
                    start_date: startDate,
                    end_date: endDate
                });
                if (department) params.append('department', department);
                if (className) params.append('class', className);

                const response = await fetch(`/attendance-csv?${params.toString()}`);
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
                alert('Failed to generate CSV. Please try again.');
            } finally {
                hideLoading();
            }
        });
    }

    // Display attendance data in table
    function displayAttendanceData(data) {
        if (!tableBody) return;
        
        tableBody.innerHTML = '';

        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="7" style="text-align: center; padding: 20px; color: #666;">No records found for the selected dates</td>';
            tableBody.appendChild(row);
            return;
        }

        // Sort by date (newest first)
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        data.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.date || ''}</td>
                <td>${record.roll_number || ''}</td>
                <td>${record.name || ''}</td>
                <td>${record.department || ''}</td>
                <td>${record.class || ''}</td>
                <td style="color: ${record.attendance === 'P' ? 'green' : 'red'}; font-weight: bold;">${record.attendance || ''}</td>
                <td>${record.lecture_time || ''}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Search filter
    function filterTableRows(query) {
        if (!tableBody) return;
        
        const rows = tableBody.querySelectorAll('tr');
        query = query.toLowerCase();
        
        rows.forEach(row => {
            const cells = Array.from(row.cells);
            const matches = cells.some(cell => 
                cell.textContent.toLowerCase().includes(query)
            );
            row.style.display = matches ? '' : 'none';
        });
    }

    // Sort table columns
    function sortTable(columnIndex, isAscending) {
        if (!tableBody) return;
        
        const rows = Array.from(tableBody.rows);
        
        rows.sort((a, b) => {
            const cellA = a.cells[columnIndex] ? a.cells[columnIndex].textContent.trim().toLowerCase() : '';
            const cellB = b.cells[columnIndex] ? b.cells[columnIndex].textContent.trim().toLowerCase() : '';
            
            // Handle date sorting
            if (!isNaN(Date.parse(cellA)) && !isNaN(Date.parse(cellB))) {
                return isAscending ? new Date(cellA) - new Date(cellB) : new Date(cellB) - new Date(cellA);
            }
            // Handle number sorting
            else if (!isNaN(cellA) && !isNaN(cellB)) {
                return isAscending ? cellA - cellB : cellB - cellA;
            }
            // Handle string sorting
            else {
                return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
            }
        });
        
        rows.forEach(row => tableBody.appendChild(row));
    }

    // Add click events to table headers for sorting
    tableHeaders.forEach((header, index) => {
        let isAscending = true;
        header.addEventListener('click', () => {
            // Remove any existing sort indicators
            tableHeaders.forEach(h => {
                h.style.position = 'sticky';
                h.style.top = '0';
                h.innerHTML = h.textContent.replace(' ↑', '').replace(' ↓', '');
            });
            
            // Add sort indicator
            header.innerHTML = header.textContent + (isAscending ? ' ↑' : ' ↓');
            
            sortTable(index, isAscending);
            isAscending = !isAscending;
        });
        
        // Add hover effect
        header.style.cursor = 'pointer';
        header.title = 'Click to sort';
    });

    // Search functionality
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (!query) {
                alert("Please enter a value to search.");
                return;
            }
            filterTableRows(query);
        });
    }

    // Clear search
    if (clearSearchButton && searchInput) {
        clearSearchButton.addEventListener('click', () => {
            searchInput.value = '';
            filterTableRows('');
        });
    }

    // Enter key search
    if (searchInput && searchButton) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }

    // Fetch departments with loading
    async function fetchDepartments() {
        if (!departmentDropdown) return;
        
        try {
            showLoading();
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
        } finally {
            hideLoading();
        }
    }

    // Fetch classes with loading  
    async function fetchClasses() {
        if (!classDropdown) return;
        
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

    // Initialize dropdowns
    fetchDepartments();
    fetchClasses();

    // Auto-resize search input on mobile
    if (searchInput && window.innerWidth <= 768) {
        searchInput.style.width = '100%';
    }
});
