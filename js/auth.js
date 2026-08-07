// Initialize Firebase Auth from js/firebase-config.js.
const firebaseApp = window.JanSetuFirebase ? window.JanSetuFirebase.init() : null;
const auth = firebaseApp ? firebase.auth() : null;
if (auth) {
    auth.languageCode = 'en';
}

let confirmationResult = null;
let userPhone = '';
let countdownInterval;

document.addEventListener('DOMContentLoaded', () => {
    const phoneSection = document.getElementById('phone-section');
    const otpSection = document.getElementById('otp-section');
    const phoneForm = document.getElementById('phone-form');
    const otpForm = document.getElementById('otp-form');
    const phoneInput = document.getElementById('phone');
    const displayPhone = document.getElementById('display-phone');
    const changePhoneBtn = document.getElementById('change-phone-btn');
    const resendBtn = document.getElementById('resend-btn');
    const timerText = document.getElementById('timer-text');
    const timerSpan = document.getElementById('timer');

    // Tab Switching Logic
    const tabCitizen = document.getElementById('tab-citizen');
    const tabAdmin = document.getElementById('tab-admin');
    const adminLoginSection = document.getElementById('admin-login-section');
    const adminLoginForm = document.getElementById('admin-login-form');

    if (tabCitizen && tabAdmin) {
        tabCitizen.addEventListener('click', () => {
            tabCitizen.classList.add('active');
            tabCitizen.style.color = 'var(--saffron)';
            tabCitizen.style.borderBottomColor = 'var(--saffron)';
            
            tabAdmin.classList.remove('active');
            tabAdmin.style.color = 'var(--text-muted)';
            tabAdmin.style.borderBottomColor = 'transparent';

            phoneSection.style.display = 'block';
            adminLoginSection.style.display = 'none';
            otpSection.style.display = 'none';
        });

        tabAdmin.addEventListener('click', () => {
            tabAdmin.classList.add('active');
            tabAdmin.style.color = 'var(--saffron)';
            tabAdmin.style.borderBottomColor = 'var(--saffron)';
            
            tabCitizen.classList.remove('active');
            tabCitizen.style.color = 'var(--text-muted)';
            tabCitizen.style.borderBottomColor = 'transparent';

            adminLoginSection.style.display = 'block';
            phoneSection.style.display = 'none';
            otpSection.style.display = 'none';
        });
    }

    // Handle Admin Login Submission
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('admin-username').value.trim();
            const passwordInput = document.getElementById('admin-password').value.trim();

            if ((usernameInput === 'ycce@123' || usernameInput === 'admin') && passwordInput === 'admin') {
                localStorage.setItem('isAdminLoggedIn', 'true');
                localStorage.setItem('userType', 'admin');
                alert('Admin Login Successful!');
                window.location.href = 'index.html#admin-portal';
            } else {
                alert('Invalid Admin Credentials. Please check your username and password.');
            }
        });
    }

    if (auth) {
        // 1. Setup Firebase reCAPTCHA Verifier
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved
            }
        });
    }

    // 2. Handle Phone Submission
    phoneForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userPhone = phoneInput.value;
        
        if (!auth) {
            alert('Firebase is not configured yet. Add your project values in js/firebase-config.js to enable OTP login.');
            return;
        }

        if (userPhone.length === 10) {
            const phoneNumber = '+91' + userPhone;
            const btn = phoneForm.querySelector('button');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            // Send SMS via Firebase
            auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
                .then((result) => {
                    // SMS sent successfully
                    confirmationResult = result;
                    displayPhone.textContent = phoneNumber;
                    
                    phoneSection.style.display = 'none';
                    otpSection.style.display = 'block';
                    
                    btn.innerHTML = 'Send OTP';
                    btn.disabled = false;
                    
                    startResendTimer();
                })
                .catch((error) => {
                    console.error("Error during signInWithPhoneNumber:", error);
                    alert("Error sending OTP. Please check your config or try again. Error: " + error.message);
                    btn.innerHTML = 'Send OTP';
                    btn.disabled = false;
                    // Reset recaptcha
                    if (window.recaptchaVerifier) window.recaptchaVerifier.render().then(id => grecaptcha.reset(id));
                });

        } else {
            alert('Please enter a valid 10-digit mobile number.');
        }
    });

    // 3. Handle OTP Submission
    otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const otpInput = document.getElementById('otp').value;
        
        if (otpInput.length === 6 && confirmationResult) {
            const btn = otpForm.querySelector('button');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            btn.disabled = true;

            // Verify code with Firebase
            confirmationResult.confirm(otpInput)
                .then((result) => {
                    // User signed in successfully
                    btn.innerHTML = '<i class="fas fa-check"></i> Success!';
                    btn.style.backgroundColor = 'var(--teal)';
                    
                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 800);
                })
                .catch((error) => {
                    console.error("Error confirming OTP:", error);
                    alert('Invalid OTP code. Please try again.');
                    btn.innerHTML = 'Verify & Login';
                    btn.disabled = false;
                });
        } else {
            alert('Please enter a valid 6-digit OTP.');
        }
    });

    // 4. Change Phone Number
    changePhoneBtn.addEventListener('click', () => {
        clearInterval(countdownInterval);
        otpSection.style.display = 'none';
        phoneSection.style.display = 'block';
        document.getElementById('otp').value = '';
    });

    // 5. Resend Timer Logic
    function startResendTimer() {
        resendBtn.style.display = 'none';
        timerText.style.display = 'block';
        let timeLeft = 30;
        timerSpan.textContent = timeLeft;

        clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                resendBtn.style.display = 'inline-block';
                timerText.style.display = 'none';
            }
        }, 1000);
    }

    // 6. Resend OTP click
    resendBtn.addEventListener('click', () => {
        // Just re-trigger the phone submission
        phoneForm.dispatchEvent(new Event('submit'));
    });
});
