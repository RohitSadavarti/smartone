// Handle Manual Entry Submission
document.getElementById('studentForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const rollNumber = document.getElementById('rollNumber').value.trim();
    const name = document.getElementById('name').value.trim();
    const department = document.getElementById('department').value;
    const classValue = document.getElementById('class').value;

    const popupBox = document.getElementById('popup-box');
    const closePopup = document.getElementById('close-popup');

    // Function to show the popup
    function showPopup(message) {
        popupBox.querySelector('p').textContent = message;
        popupBox.classList.remove('hidden');
        popupBox.style.display = 'block';
    }

    closePopup.addEventListener('click', () => {
        popupBox.classList.add('hidden');
        popupBox.style.display = 'none';
    });

    if (!rollNumber || !name || !department || !classValue) {
        showPopup('All fields are required!');
        return;
    }

    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                roll_number: rollNumber,
                name: name,
                department: department,
                class: classValue,
            }),
        });

        const result = await response.json();
        if (response.ok && result.success) {
            showPopup('Student Details added successfully!');
            document.getElementById('studentForm').reset();
            setTimeout(() => {
                popupBox.classList.add('hidden');
                popupBox.style.display = 'none';
            }, 3000);
        } else if (response.status === 409) {
            showPopup('Roll number already exists.');
        } else {
            showPopup(result.message || 'Error submitting data.');
        }
    } catch (error) {
        console.error('Error occurred while submitting data:', error);
        showPopup('Failed to submit data. Please try again later.');
    }
});

// Handle Excel File Upload

document.getElementById('excelForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload-file', { // Updated to match backend route
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alert("File uploaded successfully!");
            fetchUploadHistory(); // Refresh the upload history
        } else {
            alert(result.message || "Failed to upload the file.");
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert("An error occurred while uploading the file.");
    }
});

// Fetch and display upload history in recent-first order
// Fetch and display upload history with pagination
let currentPage = 1;
let rowsPerPage = 10;

document.getElementById("rows-per-page").addEventListener("change", (event) => {
    rowsPerPage = parseInt(event.target.value);
    currentPage = 1; // Reset to the first page
    fetchUploadHistory();
});

async function fetchUploadHistory() {
    try {
        const response = await fetch("/upload-history");
        const history = await response.json();

        // Sort the records by upload_time in descending order
        history.sort((a, b) => new Date(b.upload_time) - new Date(a.upload_time));

        const totalRecords = history.length;
        const totalPages = Math.ceil(totalRecords / rowsPerPage);

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = history.slice(start, end);

        const uploadSummary = document.getElementById("uploadSummary");
        uploadSummary.innerHTML = ""; // Clear existing rows

        pageData.forEach((record) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                 <td>${record.uploader_name}</td>
                <td><a href="javascript:void(0)" onclick="downloadCSV('${record.id}', 'total')">${record.total_records}</a></td>
                <td><a href="javascript:void(0)" onclick="downloadCSV('${record.id}', 'valid')">${record.valid_records}</a></td>
                <td><a href="javascript:void(0)" onclick="downloadCSV('${record.id}', 'error')">${record.error_records}</a></td>
                <td>${new Date(record.upload_time).toLocaleString()}</td>`;
            uploadSummary.appendChild(row);
        });

        updatePaginationControls(totalPages);
    } catch (error) {
        console.error("Error fetching upload history:", error);
    }
}

async function downloadCSV(uploadId, recordType) {
    if (!uploadId || uploadId === 'undefined') {
        alert('Invalid Upload ID');
        return;
    }

    const response = await fetch(`/download-upload-history/${uploadId}?type=${recordType}`);
    if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${recordType}_records_${uploadId}.csv`;
        link.click();
    } else {
        alert('Error downloading CSV file');
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const departmentDropdown = document.getElementById("department");
    const classDropdown = document.getElementById("class");

    async function fetchAndPopulateDropdown(url, dropdownElement, defaultText) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error fetching data from ${url}`);
            }

            const data = await response.json();
            dropdownElement.innerHTML = `<option value="" disabled selected>${defaultText}</option>`;
            data.forEach((item) => {
                const option = document.createElement("option");
                option.value = item;
                option.textContent = item;
                dropdownElement.appendChild(option);
            });
        } catch (error) {
            console.error("Error populating dropdown:", error);
            dropdownElement.innerHTML = `<option value="" disabled>${defaultText} (Error)</option>`;
        }
    }

    // Populate the Department dropdown
    await fetchAndPopulateDropdown(
        "/student-departments",
        departmentDropdown,
        "Select Department"
    );

    // Populate the Class dropdown
    await fetchAndPopulateDropdown(
        "/student-classes",
        classDropdown,
        "Select Class"
    );
});

// Update pagination controls
function updatePaginationControls(totalPages) {
    const paginationControls = document.getElementById("pagination-controls");
    paginationControls.innerHTML = ""; // Clear existing controls

    // Add previous button
    if (currentPage > 1) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "Previous";
        prevButton.addEventListener("click", () => {
            currentPage--;
            fetchUploadHistory();
        });
        paginationControls.appendChild(prevButton);
    }

    // Add page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.disabled = i === currentPage;
        pageButton.addEventListener("click", () => {
            currentPage = i;
            fetchUploadHistory();
        });
        paginationControls.appendChild(pageButton);
    }

    // Add next button
    if (currentPage < totalPages) {
        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.addEventListener("click", () => {
            currentPage++;
            fetchUploadHistory();
        });
        paginationControls.appendChild(nextButton);
    }
}
// Initial fetch of upload history
fetchUploadHistory();
