document.addEventListener("DOMContentLoaded", () => {
    const filterForm = document.getElementById("filter-form");

    // All image-based plots
    const plotImages = {
        present_gauge_img: '/plot/present_gauge',
        absent_gauge_img: '/plot/absent_gauge',
        absentee_by_dept_img: '/plot/absentee_by_dept',
        absentee_by_class_img: '/plot/absentee_by_class',
        donut_by_class_img: '/plot/donut_by_class',
        donut_by_time_img: '/plot/donut_by_time',
        bar_by_day_class_img: '/plot/bar_by_day_class',
        bar_by_day_dept_img: '/plot/bar_by_day_dept'
    };

    // All table-based visualizations
    const tableEndpoints = {
        'defaulters-table-container': '/api/table/top_defaulters'
    };
    
    // --- Custom Multi-Select Dropdown Logic ---
    function setupCustomSelect(filterId) {
        const wrapper = document.querySelector(`.filter-item[data-filter-id="${filterId}"] .custom-select-wrapper`);
        if (!wrapper) return;

        const display = wrapper.querySelector('.custom-select-display');
        const optionsContainer = wrapper.querySelector('.custom-select-options');

        display.addEventListener('click', () => {
            optionsContainer.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                optionsContainer.classList.remove('open');
            }
        });
    }

    function populateCustomSelect(filterId, options) {
        const wrapper = document.querySelector(`.filter-item[data-filter-id="${filterId}"] .custom-select-wrapper`);
        if (!wrapper) return;
        const optionsContainer = wrapper.querySelector('.custom-select-options');
        const display = wrapper.querySelector('.custom-select-display');
        optionsContainer.innerHTML = '';

        // Add "Select All" option
        const selectAllContainer = document.createElement('div');
        selectAllContainer.className = 'custom-select-option';
        selectAllContainer.id = 'select-all-container';
        selectAllContainer.innerHTML = `<input type="checkbox" class="select-all"><label>Select All</label>`;
        optionsContainer.appendChild(selectAllContainer);

        // Add individual options
        options.forEach(optionValue => {
            const optionEl = document.createElement('div');
            optionEl.className = 'custom-select-option';
            optionEl.innerHTML = `<input type="checkbox" class="option-item" value="${optionValue}"><label>${optionValue}</label>`;
            optionsContainer.appendChild(optionEl);
        });

        const selectAllCheckbox = selectAllContainer.querySelector('.select-all');
        const itemCheckboxes = optionsContainer.querySelectorAll('.option-item');

        // "Select All" logic
        selectAllCheckbox.addEventListener('change', () => {
            itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
            updateDisplay();
        });

        // Individual checkbox logic
        itemCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                selectAllCheckbox.checked = [...itemCheckboxes].every(i => i.checked);
                updateDisplay();
            });
        });
        
        // Update display text
        function updateDisplay() {
            const selectedCount = [...itemCheckboxes].filter(i => i.checked).length;
            if (selectedCount === 0) {
                display.textContent = `Select ${filterId.charAt(0).toUpperCase() + filterId.slice(1)}...`;
            } else if (selectedCount === itemCheckboxes.length) {
                display.textContent = 'All Selected';
            } else {
                display.textContent = `${selectedCount} Selected`;
            }
        }
    }

    async function populateFilters() {
        try {
            const response = await fetch('/api/filters');
            const filters = await response.json();
            
            const filterMap = {
                'department': filters.departments,
                'class': filters.classes,
                'teacher': filters.teachers,
                'subject': filters.subjects,
                'student': filters.students,
                'lecture_time': filters.lecture_times,
                'day': filters.days
            };

            for (const [filterId, options] of Object.entries(filterMap)) {
                setupCustomSelect(filterId);
                populateCustomSelect(filterId, options);
            }

        } catch (error) { console.error("Error populating filters:", error); }
    }


    function showLoadingSpinner(element) {
        let container = (element.tagName === 'IMG') ? element.parentElement : element;
        if (element.tagName === 'IMG') element.style.display = 'none';
        else container.innerHTML = '';
        if (container.querySelector('.loading-spinner')) return;
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        container.appendChild(spinner);
    }

    function hideLoadingSpinner(element) {
        let container = (element.tagName === 'IMG') ? element.parentElement : element;
        const spinner = container.querySelector('.loading-spinner');
        if (spinner) container.removeChild(spinner);
        if (element.tagName === 'IMG') element.style.display = 'block';
    }

    async function updateTable(containerId, baseUrl, queryString) {
        const container = document.getElementById(containerId);
        if (!container) return;
        showLoadingSpinner(container);

        try {
            const response = await fetch(`${baseUrl}?${queryString}`);
            const data = await response.json();
            hideLoadingSpinner(container);

            if (!data || data.length === 0) {
                container.innerHTML = '<p>No data for selected filters.</p>';
                return;
            }

            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');
            const headers = Object.keys(data[0]);

            const headerRow = document.createElement('tr');
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);

            data.forEach(rowData => {
                const row = document.createElement('tr');
                headers.forEach(header => {
                    const cell = document.createElement('td');
                    cell.innerHTML = rowData[header];
                    row.appendChild(cell);
                });
                tbody.appendChild(row);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            container.innerHTML = '';
            container.appendChild(table);

        } catch (error) {
            console.error(`Error updating table ${containerId}:`, error);
            hideLoadingSpinner(container);
            container.innerHTML = '<p>Error loading table data.</p>';
        }
    }

    filterForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        const formData = new FormData(filterForm);

        if (formData.get("start_date")) params.append("start_date", formData.get("start_date"));
        if (formData.get("end_date")) params.append("end_date", formData.get("end_date"));
        
        // Get selected values from custom dropdowns
        const multiSelects = ["department", "class", "teacher", "subject", "student", "lecture_time", "day"];
        multiSelects.forEach(filterId => {
            const wrapper = document.querySelector(`.filter-item[data-filter-id="${filterId}"]`);
            if (wrapper) {
                const checkedItems = wrapper.querySelectorAll('.option-item:checked');
                checkedItems.forEach(item => {
                    params.append(filterId, item.value);
                });
            }
        });
        
        const queryString = params.toString();

        // Update all images
        for (const [imgId, baseUrl] of Object.entries(plotImages)) {
            const img = document.getElementById(imgId);
            if (img) {
                showLoadingSpinner(img);
                img.onload = () => hideLoadingSpinner(img);
                img.onerror = () => { hideLoadingSpinner(img); img.alt = 'Error loading chart.'; };
                img.src = `${baseUrl}?${queryString}&t=${new Date().getTime()}`;
            }
        }

        // Update all tables
        for (const [containerId, baseUrl] of Object.entries(tableEndpoints)) {
            updateTable(containerId, baseUrl, queryString);
        }
    });

    // Initial load
    populateFilters();
    filterForm.dispatchEvent(new Event('submit'));
});

