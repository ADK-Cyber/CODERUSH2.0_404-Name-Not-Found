document.addEventListener('DOMContentLoaded', () => {
    const adminPortalSection = document.getElementById('admin-portal');
    const adminFeedContainer = document.getElementById('admin-feed-container');
    const totalReportsElement = document.getElementById('total-reports');
    const newReportsElement = document.getElementById('new-reports');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    
    // Check if admin is logged in
    function checkAdminAuth() {
        const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
        if (adminPortalSection) {
            if (isAdmin || window.location.hash === '#admin-portal') {
                adminPortalSection.style.display = 'block';
            } else {
                adminPortalSection.style.display = 'none';
            }
        }
    }

    checkAdminAuth();

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAdminLoggedIn');
            localStorage.removeItem('userType');
            alert('Admin logged out successfully.');
            if (adminPortalSection) {
                adminPortalSection.style.display = 'none';
            }
            window.location.hash = '';
        });
    }

    if (!adminFeedContainer) return;

    let lastKnownCount = -1;
    let unsubscribeReports = null;

    function normalizeReportsSnapshot(snapshot) {
        const reports = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            reports.push({
                id: data.id || doc.id,
                ...data,
                timestamp: data.timestamp || (data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString())
            });
        });
        return reports;
    }

    function renderReports(reports) {
        try {
            localStorage.setItem('civic_reports', JSON.stringify(reports));
        } catch (e) {
            console.warn('Unable to cache reports locally', e);
        }

        // Only re-render if count changes to save DOM updates
        if (reports.length === lastKnownCount) return;
        lastKnownCount = reports.length;

        // Update stats
        totalReportsElement.innerText = reports.length;
        
        const today = new Date().toDateString();
        const newToday = reports.filter(r => new Date(r.timestamp).toDateString() === today).length;
        newReportsElement.innerText = newToday;

        if (reports.length === 0) {
            adminFeedContainer.innerHTML = `
                <div class="empty-feed" style="text-align: center; color: var(--text-muted); padding: 40px 0;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Waiting for new reports to come in...</p>
                </div>`;
            return;
        }

        let html = '';
        reports.forEach(report => {
            const timeAgo = new Date(report.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const dateStr = new Date(report.timestamp).toLocaleDateString();
            
            html += `
            <div class="feed-item" style="display: flex; gap: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                <div class="feed-photo" style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #cbd5e1;">
                    <img src="${report.photo}" alt="Report Photo" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="feed-content" style="flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                        <h4 style="margin: 0; color: var(--navy); font-size: 1rem;">ID: ${report.id}</h4>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${dateStr} at ${timeAgo}</span>
                    </div>
                    <p style="margin: 0 0 5px 0; font-size: 0.9rem; font-weight: 600; color: var(--teal);"><i class="fas fa-map-marker-alt"></i> ${report.address}</p>
                    <p style="margin: 0; font-size: 0.9rem; color: var(--text-main);">${report.description || 'No description provided.'}</p>
                    ${report.video ? `<p style="margin: 8px 0 0 0; font-size: 0.85rem;"><a href="${report.video}" target="_blank" rel="noopener" style="color: var(--saffron); font-weight: 600;"><i class="fas fa-video"></i> View video evidence</a></p>` : ''}
                    ${report.location ? `<p style="margin: 5px 0 0 0; font-size: 0.8rem; color: var(--text-muted);">GPS: ${report.location.latitude}, ${report.location.longitude}</p>` : ''}
                </div>
            </div>`;
        });

        adminFeedContainer.innerHTML = html;
    }

    async function renderFeed() {
        let reports = [];
        try {
            const res = await fetch('/api/reports');
            if (res.ok) {
                reports = await res.json();
            } else {
                reports = JSON.parse(localStorage.getItem('civic_reports') || '[]');
            }
        } catch (e) {
            reports = JSON.parse(localStorage.getItem('civic_reports') || '[]');
        }

        renderReports(reports);
    }

    if (window.JanSetuFirebase && window.JanSetuFirebase.isConfigured()) {
        try {
            window.JanSetuFirebase.init();
            unsubscribeReports = firebase.firestore()
                .collection('complaints')
                .orderBy('createdAt', 'desc')
                .onSnapshot(snapshot => {
                    renderReports(normalizeReportsSnapshot(snapshot));
                }, error => {
                    console.warn('Firestore live feed failed, using local API fallback', error);
                    renderFeed();
                });
        } catch (error) {
            console.warn('Firebase admin feed setup failed, using local API fallback', error);
            renderFeed();
        }
    } else {
        renderFeed();
    }

    // Poll local API only when Firebase is not configured.
    if (!unsubscribeReports) {
        setInterval(renderFeed, 2000);
    }
});
