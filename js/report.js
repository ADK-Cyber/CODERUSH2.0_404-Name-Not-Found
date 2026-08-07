document.addEventListener('DOMContentLoaded', () => {
    const uploadBox = document.getElementById('upload-box');
    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo-preview');
    const btnGetLocation = document.getElementById('btn-get-location');
    const addressInput = document.getElementById('address-input');
    const locationStatus = document.getElementById('location-status');
    const reportForm = document.getElementById('report-form');
    const issueDesc = document.getElementById('issue-desc');

    let currentPhotoBase64 = null;

    // Trigger file input when clicking the upload box
    uploadBox.addEventListener('click', () => {
        photoInput.click();
    });

    // Handle photo selection (from camera or gallery)
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentPhotoBase64 = event.target.result;
                photoPreview.src = currentPhotoBase64;
                photoPreview.style.display = 'block';
                uploadBox.style.display = 'none'; // Hide the box once photo is uploaded
            };
            reader.readAsDataURL(file);
        }
    });

    // Get live location
    btnGetLocation.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        btnGetLocation.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(5);
                const lon = position.coords.longitude.toFixed(5);
                
                // Simulate reverse geocoding or just use coordinates
                addressInput.value = `Lat: ${lat}, Lng: ${lon} (Nagpur Area)`;
                
                btnGetLocation.innerHTML = '<i class="fas fa-map-marker-alt"></i> Use My Live Location';
                locationStatus.style.display = 'block';
                
                setTimeout(() => {
                    locationStatus.style.display = 'none';
                }, 3000);
            },
            (error) => {
                alert("Unable to retrieve your location. Please check your permissions.");
                btnGetLocation.innerHTML = '<i class="fas fa-map-marker-alt"></i> Use My Live Location';
            }
        );
    });

    // Form Submission
    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!addressInput.value) {
            alert("Please provide a location.");
            return;
        }

        const newReport = {
            id: 'REQ-' + Math.floor(Math.random() * 100000),
            address: addressInput.value,
            description: issueDesc.value,
            photo: currentPhotoBase64 || 'assets/nagpur.jpeg', // Fallback photo if none provided
            timestamp: new Date().toISOString(),
            status: 'Pending'
        };

        // Save to localStorage
        let reports = JSON.parse(localStorage.getItem('civic_reports') || '[]');
        reports.unshift(newReport); // Add to the beginning
        localStorage.setItem('civic_reports', JSON.stringify(reports));

        alert("Report submitted successfully! The admin portal has been updated in real-time.");
        
        // Redirect back to home to see the admin feed
        window.location.href = 'index.html#admin-portal';
    });
});
