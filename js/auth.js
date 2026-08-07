// ==========================================
// FIREBASE CONFIGURATION
// Replace the values below with your actual Firebase Project keys
// ==========================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
auth.languageCode = 'en';

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

    // 1. Setup Firebase reCAPTCHA Verifier
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
            // reCAPTCHA solved
        }
    });

    // 2. Handle Phone Submission
    phoneForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userPhone = phoneInput.value;
        
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
