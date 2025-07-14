// Handle Manual Entry Submission
document.getElementById('teacherForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const overlay = document.getElementById("skeleton-overlay");
    overlay.style.display = "flex"; // ✅ Show loader

    const teacherName = document.getElementById('teacherName').value.trim();
    const day = document.getElementById('day').value;
    const subject = document.getElementById('subject').value.trim();
    const timeSlot = document.getElementById('timeSlot').value.trim();
    const department = document.getElementById('department').value;
    const classValue = document.getElementById('class').value;

    if (!teacherName || !day || !subject || !timeSlot || !department || !classValue) {
        alert("All fields are required!");
        overlay.style.display = "none"; // ✅ Hide on validation error
        return;
    }

    try {
        const response = await fetch("/teachers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                teacher_name: teacherName,
                day: day,
                subject: subject,
                time_slot: timeSlot,
                department: department,
                class: classValue,
            }),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message || "Teacher data saved successfully!");
        } else {
            alert(result.message || "Failed to save teacher data.");
        }
    } catch (error) {
        console.error("Error saving teacher data:", error);
        alert("An error occurred while saving data.");
    } finally {
        overlay.style.display = "none"; // ✅ Always hide after submission
    }
});


// Handle Excel File Upload
document.getElementById('excelForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const overlay = document.getElementById("skeleton-overlay");
    overlay.style.display = "flex"; // ✅ Show loader

    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload.");
        overlay.style.display = "none"; // ✅ Hide if invalid
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload-file', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alert("File uploaded successfully!");
            fetchUploadHistory(); // Optional: keep loader for that
        } else {
            alert(result.message || "Failed to upload the file.");
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert("An error occurred while uploading the file.");
    } finally {
        overlay.style.display = "none"; // ✅ Always hide
    }
});


// Fetch and display upload history in recent-first order
let currentPage = 1;
let rowsPerPage = 10;

document.getElementById("rows-per-page").addEventListener("change", (event) => {
    rowsPerPage = parseInt(event.target.value);
    currentPage = 1; // Reset to the first page
    fetchUploadHistory();
});

async function fetchUploadHistory() {
    const overlay = document.getElementById("skeleton-overlay");
    overlay.style.display = "flex";

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
    } finally {
        overlay.style.display = "none";
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

    // Helper function to fetch and populate dropdown
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

    // Populate Department dropdown
    await fetchAndPopulateDropdown(
        "/departments",
        departmentDropdown,
        "Select Department"
    );

    // Event listener to update Class dropdown based on selected department
    departmentDropdown.addEventListener("change", async () => {
        const selectedDepartment = departmentDropdown.value;

        if (selectedDepartment) {
            await fetchAndPopulateDropdown(
                `/student-classes?department=${selectedDepartment}`,
                classDropdown,
                "Select Class"
            );
        } else {
            classDropdown.innerHTML = `<option value="" disabled selected>Select Class</option>`;
        }
    });
});

