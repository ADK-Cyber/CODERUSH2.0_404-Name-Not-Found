/**
 * JanSetu AI - Multilingual Voice Mic, Translation & Auto-Form Classifier
 * Converts speech in Marathi (मराठी), Hindi (हिंदी), or English into English for AI decision making,
 * and automatically classifies form requirements.
 */

window.JanSetuVoiceAI = {
    recognition: null,
    isListening: false,

    init: function(micBtnId, textareaId, badgeId, translationId, langSelectId) {
        const micBtn = document.getElementById(micBtnId);
        const textarea = document.getElementById(textareaId);
        const badge = document.getElementById(badgeId);
        const translationText = document.getElementById(translationId);

        if (!micBtn || !textarea) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            micBtn.style.opacity = '0.6';
            micBtn.title = 'Voice recognition not supported in this browser. Please use Chrome/Edge.';
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'hi-IN'; // Default to Hindi/Marathi Devanagari recognition

        const self = this;

        micBtn.addEventListener('click', () => {
            if (self.isListening) {
                self.stopListening(micBtn);
            } else {
                self.startListening(micBtn, textarea, badge, translationText);
            }
        });
    },

    startListening: function(micBtn, textarea, badge, translationText) {
        if (!this.recognition) return;

        try {
            // Auto detect or select Marathi / Hindi / English
            this.recognition.lang = 'hi-IN';
            this.recognition.start();
            this.isListening = true;

            micBtn.style.background = '#dc2626';
            micBtn.innerHTML = '<i class="fas fa-stop-circle" style="animation: pulse 1s infinite;"></i> 🔴 Listening... Speak now';
        } catch (e) {
            console.warn("Speech recognition error:", e);
        }

        const self = this;

        this.recognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }

            textarea.value = transcript;

            if (event.results[0].isFinal) {
                self.stopListening(micBtn);
                self.processTranslationAndAutoForm(transcript, badge, translationText);
            }
        };

        this.recognition.onerror = function(event) {
            console.warn("Speech recognition error event:", event.error);
            self.stopListening(micBtn);
        };

        this.recognition.onend = function() {
            if (self.isListening) {
                self.stopListening(micBtn);
            }
        };
    },

    stopListening: function(micBtn) {
        this.isListening = false;
        if (this.recognition) {
            try { this.recognition.stop(); } catch(e) {}
        }
        if (micBtn) {
            micBtn.style.background = '#2563eb';
            micBtn.innerHTML = '<i class="fas fa-microphone"></i> <span>Speak (Marathi/Hindi/English)</span>';
        }
    },

    processTranslationAndAutoForm: async function(text, badge, translationText) {
        if (!text || text.trim() === '') return;

        // 1. Translate Marathi/Hindi Devanagari to English for AI Decision Engine
        const englishTranslation = await this.translateToEnglish(text);

        if (badge && translationText) {
            badge.style.display = 'block';
            translationText.textContent = `"${englishTranslation}"`;
        }

        // 2. Auto-Classify and Select Form Options based on translated text
        this.autoSelectFormOptions(englishTranslation, text);
    },

    translateToEnglish: async function(text) {
        const isDevanagari = /[\u0900-\u097F]/.test(text);
        if (!isDevanagari) return text; // Already English

        try {
            // Free high-speed MyMemory Translation API (Marathi/Hindi to English)
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|en`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data && data.responseData && data.responseData.translatedText) {
                    return data.responseData.translatedText;
                }
            }
        } catch (e) {
            console.warn("Translation API fallback used:", e);
        }

        // Client-side Dictionary Fallback mapping
        return this.dictionaryFallbackTranslate(text);
    },

    dictionaryFallbackTranslate: function(text) {
        let t = text;
        const dict = [
            { deba: /खड्डा|गड्ढा|रस्ता|सड़क/gi, en: 'pothole on road' },
            { deba: /पाणी|पानी|गळती|लीकेज/gi, en: 'water pipeline leakage' },
            { deba: /लाइट|दिवा|बत्ती|अंधार|अंधेरा/gi, en: 'streetlight not working' },
            { deba: /कचरा|घाण|सफाई|कचरागाडी/gi, en: 'garbage waste accumulation' },
            { deba: /झाड|पेड़|फांदी|झाडी/gi, en: 'broken tree branch' }
        ];

        dict.forEach(item => {
            if (item.deba.test(t)) {
                t = t.replace(item.deba, item.en);
            }
        });

        return t;
    },

    autoSelectFormOptions: function(englishText, originalText) {
        const lower = (englishText + ' ' + originalText).toLowerCase();

        // Check category dropdowns in services.html, explore.html, or report.html if present
        const categorySelect = document.getElementById('category-select') || document.getElementById('issue-category');
        const prioritySelect = document.getElementById('priority-select') || document.getElementById('issue-priority');

        if (categorySelect) {
            if (lower.includes('road') || lower.includes('pothole') || lower.includes('tar') || lower.includes('traffic')) {
                categorySelect.value = 'Roads & Infrastructure';
            } else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('drain')) {
                categorySelect.value = 'Water & Sewage';
            } else if (lower.includes('light') || lower.includes('bulb') || lower.includes('electric') || lower.includes('dark')) {
                categorySelect.value = 'Street Lighting';
            } else if (lower.includes('garbage') || lower.includes('waste') || lower.includes('clean') || lower.includes('trash')) {
                categorySelect.value = 'Sanitation & Garbage';
            }
        }

        if (prioritySelect) {
            if (lower.includes('urgent') || lower.includes('danger') || lower.includes('accident') || lower.includes('emergency') || lower.includes('खूप') || lower.includes('मोठा')) {
                prioritySelect.value = 'HIGH';
            }
        }
    }
};
