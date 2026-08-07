// JanSetu Firebase setup
// Replace these values with your Firebase project settings from:
// Firebase Console > Project settings > General > Your apps > SDK setup.
window.janSetuFirebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

function isFirebaseConfigured() {
    const config = window.janSetuFirebaseConfig || {};
    return Boolean(
        config.apiKey &&
        config.projectId &&
        config.storageBucket &&
        !config.apiKey.includes("YOUR_") &&
        !config.projectId.includes("YOUR_")
    );
}

function initializeJanSetuFirebase() {
    if (!window.firebase || !isFirebaseConfigured()) {
        return null;
    }

    if (!firebase.apps.length) {
        firebase.initializeApp(window.janSetuFirebaseConfig);
    }

    return firebase.app();
}

window.JanSetuFirebase = {
    isConfigured: isFirebaseConfigured,
    init: initializeJanSetuFirebase
};
