/**
 * Explore Your Neighbourhood - Map Logic for Nagpur
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Leaflet Map centered on Nagpur
    // Coordinates for Nagpur City: 21.1458° N, 79.0882° E
    const nagpurCenter = [21.1458, 79.0882];
    
    // Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const map = L.map('map').setView(nagpurCenter, 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // 2. Mock Complaint Data Generator for Nagpur
    const priorities = ['High', 'Medium', 'Low'];
    const categories = [
        'Pothole Repair', 'Streetlight not working', 'Garbage Dump', 
        'Water Leakage', 'Broken Sidewalk', 'Stray Animals', 'Illegal Parking'
    ];
    const statuses = ['New', 'In Progress', 'Assigned'];

    const mockComplaints = [];
    
    // Generate 15 random complaints around Nagpur center
    for (let i = 1; i <= 15; i++) {
        // Random offset for coordinates (roughly within 5-10km of center)
        const latOffset = (Math.random() - 0.5) * 0.08;
        const lngOffset = (Math.random() - 0.5) * 0.08;
        
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        
        mockComplaints.push({
            id: i,
            title: categories[Math.floor(Math.random() * categories.length)],
            lat: nagpurCenter[0] + latOffset,
            lng: nagpurCenter[1] + lngOffset,
            priority: priority,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString()
        });
    }

    // 3. Render Markers and Populate Sidebar
    const requestList = document.getElementById('request-list');
    const requestCount = document.getElementById('request-count');
    
    if (requestCount) {
        requestCount.textContent = `Showing ${mockComplaints.length} open requests`;
    }

    // Dictionary to hold marker references for sidebar clicking
    const markers = {};

    mockComplaints.forEach(complaint => {
        // Determine marker color class based on priority
        let markerClass = 'marker-low';
        let badgeClass = 'bg-low';
        
        if (complaint.priority === 'High') {
            markerClass = 'marker-high';
            badgeClass = 'bg-high';
        } else if (complaint.priority === 'Medium') {
            markerClass = 'marker-medium';
            badgeClass = 'bg-medium';
        }

        // Create Custom HTML Icon for Leaflet
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin ${markerClass}"></div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        });

        // Add Marker to Map
        const marker = L.marker([complaint.lat, complaint.lng], { icon: customIcon }).addTo(map);
        
        // Popup Content
        marker.bindPopup(`
            <strong>${complaint.title}</strong><br>
            Priority: ${complaint.priority}<br>
            Status: ${complaint.status}<br>
            Date: ${complaint.date}
        `);

        markers[complaint.id] = marker;

        // Add to Sidebar
        if (requestList) {
            const item = document.createElement('div');
            item.className = 'request-item';
            item.innerHTML = `
                <h4>${complaint.title}</h4>
                <p>
                    <span class="status-badge ${badgeClass}">${complaint.priority} Priority</span>
                    <span>${complaint.status}</span>
                </p>
                <p style="margin-top: 5px; font-size: 0.75rem;">Reported: ${complaint.date}</p>
            `;
            
            // Add click event to pan map to this marker
            item.addEventListener('click', () => {
                map.setView([complaint.lat, complaint.lng], 16, { animate: true });
                marker.openPopup();
                
                // Highlight item
                document.querySelectorAll('.request-item').forEach(el => el.style.background = 'white');
                item.style.background = '#f3f4f6';
            });

            requestList.appendChild(item);
        }
    });

    // 4. Geolocation Button
    const btnGeo = document.getElementById('btn-geolocation');
    if (btnGeo) {
        btnGeo.addEventListener('click', () => {
            if (navigator.geolocation) {
                btnGeo.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        map.setView([latitude, longitude], 15);
                        L.circle([latitude, longitude], { radius: 200, color: '#1d4ed8' }).addTo(map);
                        btnGeo.innerHTML = '<i class="fas fa-crosshairs"></i>';
                    },
                    (error) => {
                        alert("Could not get your location. Displaying Nagpur center.");
                        btnGeo.innerHTML = '<i class="fas fa-crosshairs"></i>';
                    }
                );
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        });
    }
});
