// Basic interactions for CivicResolve AI Landing Page

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            // Simple toggle (in a real app, you'd want to add a class and handle CSS)
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'white';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
            }
        });
    }

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Close mobile menu if open
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.style.display = 'none';
                }

                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for fixed navbar
                    behavior: 'smooth'
                });
            }
        });
    });

    // Simple mockup animation
    const mockupItems = document.querySelectorAll('.mockup-item');
    if (mockupItems.length > 0) {
        mockupItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(10px)';
            item.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 300 + (index * 200));
        });
    }

    // Dropdown delay
    const navDropdown = document.querySelector('.nav-dropdown');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    let dropdownTimeout;

    if (navDropdown && dropdownMenu) {
        navDropdown.addEventListener('mouseenter', () => {
            clearTimeout(dropdownTimeout);
            dropdownMenu.classList.add('show');
        });

        navDropdown.addEventListener('mouseleave', () => {
            dropdownTimeout = setTimeout(() => {
                dropdownMenu.classList.remove('show');
            }, 5000); // 5 seconds
        });
    }

    // Sticky Navbar Scroll Effect
    const navbar = document.querySelector('.portal-nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('nav-scrolled');
            } else {
                navbar.classList.remove('nav-scrolled');
            }
        });
    }

    // Voice Search Functionality
    const voiceSearchBtn = document.getElementById('voice-search-btn');
    const mainSearchInput = document.getElementById('main-search-input');
    
    if (voiceSearchBtn && mainSearchInput) {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            // Set language to Hindi (hi-IN) / Marathi (mr-IN)
            // You can change this to 'mr-IN' if you specifically want Marathi
            recognition.lang = 'hi-IN';
            recognition.interimResults = false;

            voiceSearchBtn.addEventListener('click', () => {
                try {
                    recognition.start();
                    voiceSearchBtn.classList.add('recording');
                    mainSearchInput.placeholder = "Listening...";
                } catch (e) {
                    console.log("Recognition already started");
                }
            });

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                mainSearchInput.value = transcript;
                voiceSearchBtn.classList.remove('recording');
                mainSearchInput.placeholder = "Search for services, reports, or information...";
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                voiceSearchBtn.classList.remove('recording');
                mainSearchInput.placeholder = "Search for services, reports, or information...";
                alert("Could not recognize voice. Please try again.");
            };

            recognition.onend = () => {
                voiceSearchBtn.classList.remove('recording');
                mainSearchInput.placeholder = "Search for services, reports, or information...";
            };
        } else {
            // Browser doesn't support Web Speech API
            voiceSearchBtn.addEventListener('click', () => {
                alert("Voice search is not supported in this browser. Please use Chrome or Edge.");
            });
        }
    }
});
