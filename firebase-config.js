// Firebase Configuration
// Replace with your Firebase project credentials from Google Cloud Console
const firebaseConfig = {
    apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "pulserelief-xxxxx.firebaseapp.com",
    databaseURL: "https://pulserelief-xxxxx.firebaseio.com",
    projectId: "pulserelief-xxxxx",
    storageBucket: "pulserelief-xxxxx.appspot.com",
    messagingSenderId: "xxxxxxxxxx",
    appId: "1:xxxxxxxxxx:web:xxxxxxxxxxxxxxxxxx",
    measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getDatabase, ref, set, get, push, onValue } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// ============================================================
// AUTHENTICATION FUNCTIONS
// ============================================================

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User full name
 * @param {string} userType - 'user' or 'staff'
 */
export async function registerUser(email, password, name, userType = 'user') {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user data in Realtime Database
        await set(ref(database, 'users/' + user.uid), {
            uid: user.uid,
            email: email,
            name: name,
            userType: userType,
            createdAt: new Date().toISOString(),
            verified: false,
            profile: {
                phone: '',
                address: '',
                country: ''
            }
        });

        // Track signup event in BigQuery via Cloud Function
        await trackEvent('user_signup', {
            userId: user.uid,
            email: email,
            userType: userType,
            timestamp: new Date().toISOString()
        });

        return { success: true, user: user };
    } catch (error) {
        console.error('Registration Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 */
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Track login event
        await trackEvent('user_login', {
            userId: user.uid,
            email: email,
            timestamp: new Date().toISOString()
        });

        return { success: true, user: user };
    } catch (error) {
        console.error('Login Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Logout user
 */
export async function logoutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user);
            } else {
                resolve(null);
            }
        });
    });
}

// ============================================================
// DATABASE FUNCTIONS
// ============================================================

/**
 * Create a new donation
 * @param {object} donationData - Donation details
 */
export async function createDonation(donationData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const donation = {
            donorId: user.uid,
            amount: donationData.amount,
            currency: 'USD',
            paymentMethod: donationData.paymentMethod,
            caseId: donationData.caseId,
            status: 'pending',
            encryptedPaymentDetails: donationData.encryptedPaymentDetails,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const donationRef = push(ref(database, 'donations'));
        await set(donationRef, donation);

        // Track donation for analytics
        await trackEvent('donation_created', {
            userId: user.uid,
            amount: donationData.amount,
            paymentMethod: donationData.paymentMethod,
            timestamp: new Date().toISOString()
        });

        return { success: true, donationId: donationRef.key };
    } catch (error) {
        console.error('Donation Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user's donation history
 * @param {string} userId - User ID
 */
export async function getUserDonations(userId) {
    try {
        const snapshot = await get(ref(database, 'donations'));
        const donations = [];

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const donation = childSnapshot.val();
                if (donation.donorId === userId) {
                    donations.push({
                        id: childSnapshot.key,
                        ...donation
                    });
                }
            });
        }

        return { success: true, donations: donations };
    } catch (error) {
        console.error('Get Donations Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create an emergency case
 * @param {object} caseData - Case details
 */
export async function createEmergencyCase(caseData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const emergencyCase = {
            submittedBy: user.uid,
            title: caseData.title,
            description: caseData.description,
            category: caseData.category,
            targetAmount: caseData.targetAmount,
            currentAmount: 0,
            location: caseData.location,
            verificationStatus: 'pending',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const caseRef = push(ref(database, 'emergencyCases'));
        await set(caseRef, emergencyCase);

        // Track case creation
        await trackEvent('emergency_case_created', {
            userId: user.uid,
            caseId: caseRef.key,
            category: caseData.category,
            targetAmount: caseData.targetAmount,
            timestamp: new Date().toISOString()
        });

        return { success: true, caseId: caseRef.key };
    } catch (error) {
        console.error('Case Creation Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all emergency cases
 */
export async function getEmergencyCases() {
    try {
        const snapshot = await get(ref(database, 'emergencyCases'));
        const cases = [];

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                cases.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
        }

        return { success: true, cases: cases };
    } catch (error) {
        console.error('Get Cases Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update case funding progress
 * @param {string} caseId - Case ID
 * @param {number} amount - Donation amount to add
 */
export async function updateCaseFunding(caseId, amount) {
    try {
        const caseRef = ref(database, 'emergencyCases/' + caseId);
        const snapshot = await get(caseRef);

        if (snapshot.exists()) {
            const currentCase = snapshot.val();
            const newAmount = currentCase.currentAmount + amount;

            await set(caseRef, {
                ...currentCase,
                currentAmount: newAmount,
                updatedAt: new Date().toISOString()
            });

            return { success: true, newAmount: newAmount };
        } else {
            throw new Error('Case not found');
        }
    } catch (error) {
        console.error('Update Funding Error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// ANALYTICS & FRAUD DETECTION
// ============================================================

/**
 * Track events for BigQuery analytics
 * @param {string} eventName - Event name
 * @param {object} eventData - Event data
 */
export async function trackEvent(eventName, eventData) {
    try {
        // Send to Cloud Function that forwards to BigQuery
        const response = await fetch('https://us-central1-pulserelief-xxxxx.cloudfunctions.net/trackEvent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eventName: eventName,
                eventData: eventData,
                timestamp: new Date().toISOString()
            })
        });

        if (response.ok) {
            return { success: true };
        } else {
            throw new Error('Failed to track event');
        }
    } catch (error) {
        console.error('Track Event Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Validate donation for fraud
 * @param {object} donationData - Donation details
 */
export async function validateDonationForFraud(donationData) {
    try {
        const response = await fetch('https://us-central1-pulserelief-xxxxx.cloudfunctions.net/validateDonation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: donationData.amount,
                paymentMethod: donationData.paymentMethod,
                userId: auth.currentUser?.uid,
                timestamp: new Date().toISOString()
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Fraud Validation Error:', error);
        return { success: false, error: error.message };
    }
}

export { auth, database };
