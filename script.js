document.addEventListener("DOMContentLoaded", async () => {
    // Import GCP modules
    // Note: In production, use proper module bundling
    // import { loginUser, registerUser, getCurrentUser } from './firebase-config.js';
    // import { initializeGooglePay, createGooglePayButton } from './google-pay-config.js';
    // import { initializeDialogflowMessenger } from './dialogflow-config.js';

    // Initialize GCP services
    let currentAuthUser = null;

    // Check authentication status on page load
    async function checkAuthStatus() {
        try {
            // This would be replaced with Firebase auth check in production
            // currentAuthUser = await getCurrentUser();
            console.log('Auth status checked. User:', currentAuthUser);
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }

    // Initialize all GCP services
    async function initializeGCPServices() {
        try {
            // Initialize Google Pay
            // const googlePayReady = await initializeGooglePay();
            // if (googlePayReady) {
            //     createGooglePayButton('google-pay-button', handleGooglePaySuccess);
            // }

            // Initialize Dialogflow Messenger
            // initializeDialogflowMessenger();

            console.log('GCP services initialized');
        } catch (error) {
            console.error('GCP initialization error:', error);
        }
    }

    // Handle Google Pay success
    function handleGooglePaySuccess(result) {
        if (result.success) {
            console.log('Google Pay successful:', result);
            // Process payment through Cloud Function
        }
    }

    // Initialize on page load
    await checkAuthStatus();
    await initializeGCPServices();
    
    const nav = document.getElementById("nav");
    const navToggle = document.getElementById("nav-toggle");
    const navOverlay = document.getElementById("nav-overlay");

    if (navToggle && nav) {
        const closeNav = () => {
            nav.classList.remove("open");
            navToggle.classList.remove("active");
            document.body.classList.remove("nav-open");
            if (navOverlay) navOverlay.classList.remove("open");
        };

        const toggleNav = () => {
            const willOpen = !nav.classList.contains("open");
            nav.classList.toggle("open", willOpen);
            navToggle.classList.toggle("active", willOpen);
            document.body.classList.toggle("nav-open", willOpen);
            if (navOverlay) navOverlay.classList.toggle("open", willOpen);
        };

        navToggle.addEventListener("click", toggleNav);

        if (navOverlay) {
            navOverlay.addEventListener("click", closeNav);
        }

        nav.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener("click", () => {
                closeNav();
            });
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeNav();
        });
    }

    const modeToggle = document.getElementById("mode-toggle");

    if (modeToggle) {
        const applyTheme = (theme) => {
            if (theme === "dark") {
                document.body.classList.remove("theme-light");
            } else {
                document.body.classList.add("theme-light");
            }
        };

        const savedTheme = localStorage.getItem("pulseTheme");
        applyTheme(savedTheme === "dark" ? "dark" : "light");

        modeToggle.addEventListener("click", () => {
            const nextTheme = document.body.classList.contains("theme-light") ? "dark" : "light";
            applyTheme(nextTheme);
            localStorage.setItem("pulseTheme", nextTheme);
        });
    }

    document.querySelectorAll("[data-scroll-to]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-scroll-to");
            if (!target) return;
            const el = document.querySelector(target);
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
        
    // Add smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    const categorySwitch = document.getElementById("category-switch");
    const caseGrid = document.getElementById("case-grid");

    // Initialize sample cases in localStorage if they don't exist
    const initializeCases = () => {
        const allRequests = JSON.parse(localStorage.getItem('pulserelief_emergency_requests')) || [];
        
        const staticCases = [
            {
                id: 'static_medical_1',
                userName: 'Road Accident Victim',
                userEmail: 'hospital@example.com',
                type: 'Medical',
                location: 'Nairobi, Kenya',
                amount: 10000,
                raisedAmount: 6200,
                description: 'Verified by County General Hospital. Funds go directly to hospital billing to cover surgery and 48 hours of intensive care.',
                status: 'approved',
                submittedDate: 'Dec 10, 2023',
                timestamp: Date.now() - 1000000
            },
            {
                id: 'static_disaster_1',
                userName: 'Flood Victims',
                userEmail: 'ngo@example.com',
                type: 'Disaster relief',
                location: 'Assam, India',
                amount: 20000,
                raisedAmount: 8800,
                description: 'Coordinated with two local NGOs. Each kit includes water filters, blankets, and emergency food rations for a family of five.',
                status: 'approved',
                submittedDate: 'Nov 20, 2023',
                timestamp: Date.now() - 2000000
            },
            {
                id: 'static_education_1',
                userName: 'First-gen Student',
                userEmail: 'university@example.com',
                type: 'Education',
                location: 'Cape Town, South Africa',
                amount: 5000,
                raisedAmount: 4400,
                description: 'University bursary office verified tuition bill. Funds disbursed directly to the institution on confirmation.',
                status: 'approved',
                submittedDate: 'Dec 05, 2023',
                timestamp: Date.now() - 500000
            },
            {
                id: 'static_startup_1',
                userName: 'Community Clinic',
                userEmail: 'tech@example.com',
                type: 'Small startup',
                location: 'Medellín, Colombia',
                amount: 20000,
                raisedAmount: 5800,
                description: 'A small health-tech startup powering 22 clinics faces unexpected infrastructure costs. Bridge funds prevent a shutdown of patient records and triage tools.',
                status: 'approved',
                submittedDate: 'Jan 01, 2024',
                timestamp: Date.now() - 100000
            }
        ];

        let updated = false;
        staticCases.forEach(staticCase => {
            if (!allRequests.find(req => req.id === staticCase.id)) {
                allRequests.push(staticCase);
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem('pulserelief_emergency_requests', JSON.stringify(allRequests));
        }
    };

    initializeCases();

    // Global variable to track which case we are currently donating to
    window.activeDonationCaseId = null;

    // Render Main Case Grid
    window.renderMainCaseGrid = () => {
        if (!caseGrid) return;

        // Get approved requests that are not yet fully funded
        const allRequests = JSON.parse(localStorage.getItem('pulserelief_emergency_requests')) || [];
        const approvedRequests = allRequests.filter(req => 
            req.status === 'approved' && (req.raisedAmount || 0) < req.amount
        );

        // Clear grid to render everything from data (including static ones now in localStorage)
        caseGrid.innerHTML = '';

        approvedRequests.forEach(request => {
            const card = document.createElement('article');
            card.className = 'case-card';
            
            // Map request type to button categories
            let catClass = 'medical';
            if (request.type.toLowerCase().includes('medical')) catClass = 'medical';
            else if (request.type.toLowerCase().includes('education')) catClass = 'education';
            else if (request.type.toLowerCase().includes('disaster')) catClass = 'disaster';
            else if (request.type.toLowerCase().includes('startup')) catClass = 'startup';
            
            card.setAttribute('data-category', catClass);
            
            const raised = request.raisedAmount || 0;
            const target = request.amount;
            const percent = Math.min(Math.round((raised / target) * 100), 100);
            
            card.innerHTML = `
                <div class="case-tag ${catClass}">${request.type} • Emergency</div>
                <h3>${request.type} Help for ${request.userName}</h3>
                <p class="case-location">${request.location}</p>
                <p class="case-summary">${request.description}</p>
                <div class="case-progress">
                    <div class="progress-bar"><span style="width: ${percent}%"></span></div>
                    <div class="progress-meta">
                        <span>$${raised.toLocaleString()} of $${target.toLocaleString()}</span>
                        <span>${percent}% funded</span>
                    </div>
                </div>
                <div class="card-icons">
                    <span>❤️</span>
                    <span>⚡</span>
                    <span>🌍</span>
                </div>
                <button class="btn ghost" data-open-modal="donate-modal" data-case-id="${request.id}">Support this now</button>
                
                <div class="case-timeline">
                    <div class="timeline-step completed"><div class="step-dot"></div><span class="step-label">Submitted</span></div>
                    <div class="timeline-step completed"><div class="step-dot"></div><span class="step-label">Verified</span></div>
                    <div class="timeline-step ${percent >= 100 ? 'completed' : 'active'}"><div class="step-dot"></div><span class="step-label">Funded</span></div>
                    <div class="timeline-step ${percent >= 100 ? 'active' : ''}"><div class="step-dot"></div><span class="step-label">Resolved</span></div>
                </div>
            `;
            
            // Re-attach modal trigger for the new button and set active case ID
            const btn = card.querySelector('[data-open-modal]');
            btn.addEventListener('click', () => {
                window.activeDonationCaseId = request.id;
                const modal = document.getElementById('donate-modal');
                if (modal) {
                    modal.setAttribute('aria-hidden', 'false');
                    // Reset donation display
                    if (typeof updateDonationDisplay === 'function') updateDonationDisplay();
                }
            });

            caseGrid.appendChild(card);
        });
    };

    renderMainCaseGrid();

    if (categorySwitch && caseGrid) {
        categorySwitch.addEventListener("click", (event) => {
            const button = event.target instanceof HTMLElement ? event.target.closest("button[data-category]") : null;
            if (!button) return;

            const selected = button.getAttribute("data-category");
            if (!selected) return;

            categorySwitch.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
            button.classList.add("active");

            caseGrid.querySelectorAll(".case-card").forEach((card) => {
                const category = card.getAttribute("data-category");
                card.style.display = selected === "all" || selected === category ? "flex" : "none";
            });
        });
    }

    const faqList = document.getElementById("faq-list");
    if (faqList) {
        faqList.addEventListener("click", (event) => {
            const question = event.target instanceof HTMLElement ? event.target.closest(".faq-question") : null;
            if (!question) return;
            const item = question.parentElement;
            const open = item.classList.contains("open");
            faqList.querySelectorAll(".faq-item").forEach((other) => {
                other.classList.remove("open");
            });
            item.classList.toggle("open", !open);
        });
    }

    const requestModal = document.getElementById("request-modal");
    const donateModal = document.getElementById("donate-modal");
    const modals = [requestModal, donateModal].filter(Boolean);

    document.querySelectorAll("[data-open-modal]").forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const id = trigger.getAttribute("data-open-modal");
            const modal = id ? document.getElementById(id) : null;
            if (modal) {
                modal.setAttribute("aria-hidden", "false");
            }
        });
    });

    document.querySelectorAll("[data-close-modal]").forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const modal = trigger.closest(".modal");
            if (modal) {
                modal.setAttribute("aria-hidden", "true");
                // Reset active donation case if donation modal is closed
                if (modal.id === 'donate-modal') {
                    window.activeDonationCaseId = null;
                }
            }
        });
    });

    modals.forEach((modal) => {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.setAttribute("aria-hidden", "true");
            }
        });
    });

    const partnerForm = document.getElementById("partner-form");
    const partnerMessage = document.getElementById("partner-message");

    if (partnerForm && partnerMessage) {
        partnerForm.addEventListener("submit", (event) => {
            event.preventDefault();
            
            // Get form data
            const formData = new FormData(partnerForm);
            const partnerRequest = {
                id: 'partner_' + Date.now(),
                org: formData.get('org'),
                type: formData.get('type'),
                email: formData.get('email'),
                region: formData.get('region'),
                description: formData.get('description'),
                status: 'pending',
                submittedDate: new Date().toLocaleString(),
                timestamp: Date.now()
            };
            
            // Get existing requests from localStorage
            let partnerRequests = JSON.parse(localStorage.getItem('partnerRequests')) || [];
            
            // Add new request
            partnerRequests.push(partnerRequest);
            
            // Save to localStorage
            localStorage.setItem('partnerRequests', JSON.stringify(partnerRequests));
            
            // Trigger staff notification
            window.triggerGlobalNotification({
                title: 'New Partner Request',
                message: `${partnerRequest.org} has requested sandbox access for ${partnerRequest.region}.`,
                type: 'staff',
                icon: '🤝',
                role: 'staff'
            });

            // Show success message
            partnerMessage.textContent = `✅ Thank you! Your sandbox access request has been submitted. We'll review ${partnerRequest.org} and get back to you at ${partnerRequest.email} soon.`;
            partnerMessage.style.color = '#22c55e';
            
            // Refresh staff partner requests if dashboard is open
            displayPartnerRequests();
            
            // Reset form
            partnerForm.reset();
            
            // Clear message after 5 seconds
            setTimeout(() => {
                partnerMessage.textContent = '';
                partnerMessage.style.color = '';
            }, 5000);
        });
    }

    const requestForm = document.getElementById("request-form");
    const requestMessage = document.getElementById("request-message");
    const fileUploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('file-input');
    const filesPreview = document.getElementById('files-preview');
    
    // Store uploaded files
    let uploadedFiles = [];
    let latestVerificationResult = null;

    // Remove file from upload list
    window.removeFile = (index) => {
        uploadedFiles.splice(index, 1);
        displayFilePreview();
        
        // Clear verification if no files left
        if (uploadedFiles.length === 0) {
            const verificationPanel = document.getElementById('ai-verification-panel');
            if (verificationPanel) verificationPanel.style.display = 'none';
            latestVerificationResult = null;
        }
    };

    if (requestForm && requestMessage) {
        // File upload drag and drop
        if (fileUploadArea && fileInput) {
            fileUploadArea.addEventListener('click', () => fileInput.click());
            
            // Drag and drop
            fileUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUploadArea.classList.add('drag-over');
            });
            
            fileUploadArea.addEventListener('dragleave', () => {
                fileUploadArea.classList.remove('drag-over');
            });
            
            fileUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUploadArea.classList.remove('drag-over');
                handleFiles(e.dataTransfer.files);
            });
            
            // File input change
            fileInput.addEventListener('change', (e) => {
                handleFiles(e.target.files);
            });
        }
        
        // Handle file uploads
        async function handleFiles(files) {
            for (let file of files) {
                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`File ${file.name} is too large. Maximum 5MB allowed.`);
                    continue;
                }
                
                // Check if file already exists
                if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
                    alert(`File ${file.name} already uploaded.`);
                    continue;
                }
                
                uploadedFiles.push(file);
                
                // Verify the first document with AI if it's an image
                if (file.type.startsWith('image/')) {
                    console.log('Starting AI verification for:', file.name);
                    verifyDocumentWithAI(file);
                }
            }
            
            displayFilePreview();
        }
        
        // Display file preview
        function displayFilePreview() {
            filesPreview.innerHTML = '';
            
            uploadedFiles.forEach((file, index) => {
                const fileExt = file.name.split('.').pop().toLowerCase();
                const fileIcons = {
                    'pdf': '📄',
                    'jpg': '🖼️',
                    'jpeg': '🖼️',
                    'png': '🖼️',
                    'gif': '🖼️',
                    'doc': '📝',
                    'docx': '📝',
                    'xls': '📊',
                    'xlsx': '📊'
                };
                
                const icon = fileIcons[fileExt] || '📎';
                const size = (file.size / 1024).toFixed(2);
                
                const fileElement = document.createElement('div');
                fileElement.className = 'file-preview-item';
                fileElement.innerHTML = `
                    <div class="file-preview-icon">${icon}</div>
                    <div class="file-preview-name">${file.name}</div>
                    <div class="file-preview-size">${size}KB</div>
                    <button type="button" class="file-preview-remove" onclick="removeFile(${index})">✕</button>
                `;
                filesPreview.appendChild(fileElement);
            });
        }
        
        // Remove file from upload
        window.removeFile = (index) => {
            uploadedFiles.splice(index, 1);
            displayFilePreview();
        };
        
        // Form submission
        requestForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!uploadedFiles || uploadedFiles.length === 0) {
                requestMessage.textContent = 'Please upload at least one proof photo (JPG/PNG) before submitting.';
                requestMessage.style.color = '#ef4444';
                if (fileUploadArea) {
                    fileUploadArea.classList.add('drag-over');
                    setTimeout(() => fileUploadArea.classList.remove('drag-over'), 800);
                }
                return;
            }
            
            const emergencyType = requestForm.querySelector('select[name="type"]').value;
            const location = requestForm.querySelector('input[name="location"]').value;
            const amount = requestForm.querySelector('input[name="amount"]').value;
            const neededWithinHoursRaw = requestForm.querySelector('select[name="neededWithin"]')
                ? requestForm.querySelector('select[name="neededWithin"]').value
                : '';
            const story = requestForm.querySelector('textarea[name="story"]').value;
            const verifier = requestForm.querySelector('input[name="verifier"]').value;

            const neededWithinHours = neededWithinHoursRaw ? Number(neededWithinHoursRaw) : null;
            const neededBy = neededWithinHours ? (Date.now() + neededWithinHours * 60 * 60 * 1000) : null;

            const toDataUrl = (file) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result || ''));
                    reader.onerror = () => resolve('');
                    reader.readAsDataURL(file);
                });
            };

            const proofPhotos = await Promise.all(
                uploadedFiles.map(async (f) => {
                    const dataUrl = await toDataUrl(f);
                    return {
                        name: f.name,
                        type: f.type,
                        size: f.size,
                        dataUrl
                    };
                })
            );
            
            // Create request object
            const emergencyRequest = {
                id: 'req_' + Date.now(),
                userEmail: authSystem.currentUser ? authSystem.currentUser.email : 'anonymous@example.com',
                userName: authSystem.currentUser ? authSystem.currentUser.name : 'Anonymous',
                type: emergencyType,
                location: location,
                amount: amount,
                raisedAmount: 0,
                description: story, // Mapping story to description for dashboard consistency
                neededWithinHours: neededWithinHours,
                neededBy: neededBy,
                verifier: verifier,
                status: 'pending', // pending, approved, rejected
                submittedDate: new Date().toLocaleDateString(),
                timestamp: Date.now(),
                files: uploadedFiles.map(f => f.name),
                proofPhotos: proofPhotos,
                aiVerification: latestVerificationResult
            };

            // Save to localStorage
            const existingRequests = JSON.parse(localStorage.getItem('pulserelief_emergency_requests')) || [];
            existingRequests.push(emergencyRequest);
            localStorage.setItem('pulserelief_emergency_requests', JSON.stringify(existingRequests));
            
            // Trigger notifications
            window.triggerGlobalNotification({
                title: 'New Emergency Request',
                message: `A new ${emergencyType} request in ${location} requires review.`,
                type: 'staff',
                icon: '🚨',
                role: 'staff'
            });

            window.triggerGlobalNotification({
                title: 'Request Submitted',
                message: 'Your emergency help request has been received and is being verified.',
                type: 'user',
                icon: '✅',
                role: 'user'
            });

            // Show success message
            let message = `Request submitted successfully! Emergency case: ${emergencyType} in ${location} needing $${amount}.`;

            if (neededWithinHours) {
                message += ` Urgent: needed within ${neededWithinHours} hour(s).`;
            }
            
            if (uploadedFiles.length > 0) {
                message += ` ${uploadedFiles.length} proof document(s) attached.`;
            }
            
            requestMessage.textContent = message;
            requestMessage.style.color = '#22c55e';
            
            // Update dashboards if open
            if (typeof displayMyRequests === 'function') displayMyRequests();
            if (typeof displayPendingRequests === 'function') displayPendingRequests();

            // After a short delay, close the modal and reset form
            setTimeout(() => {
                requestForm.reset();
                uploadedFiles = [];
                const filesPreview = document.getElementById('files-preview');
                if (filesPreview) filesPreview.innerHTML = '';
                requestMessage.textContent = '';
                
                // Close the modal
                const modal = document.getElementById('request-modal');
                if (modal) {
                    modal.setAttribute('aria-hidden', 'true');
                    document.body.style.overflow = '';
                }
                
                alert('Your emergency request has been submitted and is now visible in your dashboard "My Requests" and sent to our staff for verification.');
            }, 1500);
        });
    }

    // ===== EMAIL RECEIPT & THANK YOU PAGE FUNCTIONALITY =====
    
    // Store donation data globally
    let currentDonation = {
        amount: 0,
        currency: 'USD',
        symbol: '$',
        method: 'Credit Card',
        email: '',
        caseTitle: 'Medical Emergency',
        date: new Date(),
        transactionId: 'TXN-' + Date.now()
    };

    // Update thank you page with donation details
    function showThankYouPage(donationData) {
        const symbol = currencyConverter.getSymbol(donationData.currency || 'USD');
        
        // Update current donation
        currentDonation = {
            amount: donationData.amount,
            currency: donationData.currency || 'USD',
            symbol: symbol,
            method: donationData.method,
            email: donationData.email,
            caseTitle: donationData.caseTitle || 'Medical Emergency',
            date: new Date(),
            transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            isInstallment: donationData.isInstallment || false
        };

        // Populate thank you page
        document.getElementById('thank-you-amount').textContent = `${symbol}${donationData.amount}`;
        document.getElementById('receipt-amount').textContent = `${symbol}${donationData.amount}${donationData.currency ? ' ' + donationData.currency : ''}`;
        document.getElementById('receipt-method').textContent = donationData.method;
        document.getElementById('receipt-date').textContent = currentDonation.date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('receipt-txn-id').textContent = currentDonation.transactionId;
        document.getElementById('receipt-case').textContent = donationData.caseTitle;
        document.getElementById('receipt-email-input').value = donationData.email || '';
        document.getElementById('email-preview-section').style.display = 'block';

        // Show thank you modal
        const donateModal = document.getElementById('donate-modal');
        const thankYouModal = document.getElementById('thank-you-modal');
        
        if (donateModal) donateModal.setAttribute('aria-hidden', 'true');
        if (thankYouModal) thankYouModal.setAttribute('aria-hidden', 'false');
        
        // Scroll to top of modal
        setTimeout(() => {
            const container = document.querySelector('.thank-you-container');
            if (container) container.scrollTop = 0;
        }, 100);
    }

    // Generate HTML email receipt
    function generateEmailHTML() {
        const installmentNote = currentDonation.isInstallment ? 
            `<p style="color: #cbd5e1; font-size: 0.9rem; font-style: italic; margin-top: 0.5rem;">
                This donation is part of an installment plan.
            </p>` : '';

        return `
            <div style="font-family: 'Poppins', Arial, sans-serif; background: #1a2e50; padding: 2rem; border-radius: 8px;">
                <h2 style="color: #22c55e; text-align: center; margin-bottom: 1.5rem;">🎉 Donation Receipt</h2>
                
                <div style="background: rgba(236, 72, 153, 0.05); padding: 1.2rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="color: #f1f5f9; font-size: 1.1rem; margin: 0 0 0.5rem 0;">
                        Thank you for your generous donation of <strong style="color: #22c55e; font-size: 1.2rem;">${currentDonation.symbol}${currentDonation.amount}</strong>
                    </p>
                    ${installmentNote}
                    <p style="color: #cbd5e1; font-size: 0.95rem; margin: 0;">
                        You're helping someone in critical need. Real impact, right now.
                    </p>
                </div>

                <div style="background: rgba(15, 23, 41, 0.4); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <h3 style="color: #f1f5f9; margin-top: 0;">📋 Receipt Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid rgba(236, 72, 153, 0.1);">
                            <td style="padding: 0.6rem 0; color: #cbd5e1;"><strong>💝 Amount</strong></td>
                            <td style="padding: 0.6rem 0; color: #f1f5f9; text-align: right;">$${currentDonation.amount}.00</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(236, 72, 153, 0.1);">
                            <td style="padding: 0.6rem 0; color: #cbd5e1;"><strong>💳 Payment Method</strong></td>
                            <td style="padding: 0.6rem 0; color: #f1f5f9; text-align: right;">${currentDonation.method}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(236, 72, 153, 0.1);">
                            <td style="padding: 0.6rem 0; color: #cbd5e1;"><strong>📅 Date & Time</strong></td>
                            <td style="padding: 0.6rem 0; color: #f1f5f9; text-align: right;">${currentDonation.date.toLocaleString()}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(236, 72, 153, 0.1);">
                            <td style="padding: 0.6rem 0; color: #cbd5e1;"><strong>🆔 Transaction ID</strong></td>
                            <td style="padding: 0.6rem 0; color: #f1f5f9; text-align: right; font-family: monospace;">${currentDonation.transactionId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.6rem 0; color: #cbd5e1;"><strong>🏥 Supporting Case</strong></td>
                            <td style="padding: 0.6rem 0; color: #f1f5f9; text-align: right;">${currentDonation.caseTitle}</td>
                        </tr>
                    </table>
                </div>

                <div style="background: rgba(34, 197, 94, 0.08); border-left: 3px solid #22c55e; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem;">
                    <h3 style="color: #22c55e; margin-top: 0;">🌍 Your Impact</h3>
                    <p style="color: #cbd5e1; margin: 0;">
                        Your donation joins thousands of others helping people in crisis. We'll send you updates as this case progresses. Your generosity saves lives.
                    </p>
                </div>

                <div style="background: rgba(99, 102, 241, 0.08); padding: 1rem; border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2);">
                    <h3 style="color: #6366f1; margin-top: 0;">📋 Important Information</h3>
                    <ul style="color: #cbd5e1; font-size: 0.9rem; margin: 0; padding-left: 1.2rem;">
                        <li>This receipt confirms your donation to PulseRelief.</li>
                        <li>Your donation is tax-deductible. Tax ID: 12-3456789</li>
                        <li>A portion of funds support platform operations and security.</li>
                        <li>You can track your donation at any time on our website.</li>
                        <li>For questions, visit our help center or contact support.</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(236, 72, 153, 0.1); color: #64748b; font-size: 0.85rem;">
                    <p>Thank you for making a difference in someone's life!</p>
                    <p>© 2026 PulseRelief. All rights reserved.</p>
                </div>
            </div>
        `;
    }

    // Send email receipt
    window.sendEmailReceipt = function() {
        const emailInput = document.getElementById('receipt-email-input');
        const email = emailInput.value.trim();

        if (!email) {
            alert('Please enter an email address.');
            return;
        }

        if (!email.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }

        currentDonation.email = email;

        // Show preview section
        document.getElementById('email-preview-section').style.display = 'block';
        const previewContainer = document.getElementById('email-preview-container');
        const previewContent = document.getElementById('email-preview-content');

        previewContent.innerHTML = generateEmailHTML();

        // Show success message
        const sendBtn = document.querySelector('.send-receipt-btn');
        const originalText = sendBtn.textContent;
        sendBtn.textContent = '✅ Receipt sent to ' + email;
        sendBtn.style.background = 'linear-gradient(135deg, #22c55e, #10b981)';

        setTimeout(() => {
            sendBtn.textContent = originalText;
            sendBtn.style.background = '';
        }, 3000);

        // Log to console (in production, this would send an actual email)
        console.log('Email receipt sent to:', email);
        console.log('Receipt HTML:', generateEmailHTML());
    };

    // Show email preview
    window.showEmailPreview = function() {
        const previewContainer = document.getElementById('email-preview-container');
        const previewBtn = document.querySelector('.preview-btn');
        if (!previewContainer) return;

        const isHidden = previewContainer.style.display === 'none' || !previewContainer.style.display;

        if (isHidden) {
            previewContainer.style.display = 'block';
            if (previewBtn) previewBtn.classList.add('active');
            const previewContent = document.getElementById('email-preview-content');
            if (previewContent) previewContent.innerHTML = generateEmailHTML();
        } else {
            previewContainer.style.display = 'none';
            if (previewBtn) previewBtn.classList.remove('active');
        }
    };

    // Download receipt as TXT
    window.downloadReceipt = function() {
        const dateStr = currentDonation.date instanceof Date ? currentDonation.date.toLocaleString() : new Date().toLocaleString();
        const amountStr = currentDonation.symbol + currentDonation.amount;
        
        const receiptText = `
PULSERELIEF DONATION RECEIPT
========================================
Date: ${dateStr}
Transaction ID: ${currentDonation.transactionId}

DONATION DETAILS
========================================
Amount: ${amountStr}
Currency: ${currentDonation.currency}
Payment Method: ${currentDonation.method}
Supporting Case: ${currentDonation.caseTitle}

THANK YOU
========================================
Your generosity is making a real difference.
We'll send you updates as this case progresses.

© 2026 PulseRelief. All rights reserved.
        `;

        const blob = new Blob([receiptText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `PulseRelief-Receipt-${currentDonation.transactionId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // Share on social media
    window.shareOnSocial = function() {
        const shareText = `I just donated $${currentDonation.amount} to help someone in crisis through PulseRelief! 💝 Real impact, right now. Join me in helping others.`;
        const shareUrl = 'https://pulserelief.com';

        // Twitter
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

        // Facebook
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

        // LinkedIn
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

        alert('Share your impact!\n\n' +
            'Twitter: ' + twitterUrl + '\n\n' +
            'In production, these would open social media sharing dialogs.');
    };

    const donateForm = document.getElementById('donate-form');
    const donateMessage = document.getElementById('donate-message');
    
    // Currency Conversion Handler
    window.updateDonationDisplay = function() {
        const currencySelect = document.getElementById('currency-select');
        const amountInput = donateForm.querySelector('input[name="amount"]');
        const currencySymbolSpan = document.getElementById('currency-symbol');
        const conversionInfo = document.getElementById('conversion-info');
        const conversionText = document.getElementById('conversion-text');
        const summaryAmount = document.getElementById('summary-amount');
        
        // Installment elements
        const installmentSection = document.getElementById('installment-section');
        const useInstallmentsCheckbox = document.getElementById('use-installments');
        const installmentOptions = document.getElementById('installment-options');
        const plan3Amount = document.getElementById('plan-3-amount');
        const plan6Amount = document.getElementById('plan-6-amount');
        const plan12Amount = document.getElementById('plan-12-amount');
        const installmentTotalDisplay = document.getElementById('installment-total-display');
        
        if (!currencySelect || !amountInput || !currencyConverter) return;
        
        const selectedCurrency = currencySelect.value;
        const amount = parseFloat(amountInput.value) || 0;
        
        // Update currency symbol in input
        const symbol = currencyConverter.getSymbol(selectedCurrency);
        currencySymbolSpan.textContent = symbol;
        
        // Update conversion display
        if (selectedCurrency !== 'USD') {
            const result = currencyConverter.updateDisplay(amount, selectedCurrency, 'USD');
            if (result.showConversion) {
                conversionInfo.style.display = 'block';
                conversionText.textContent = `≈ ${result.originalDisplay} (${amount.toFixed(2)} ${selectedCurrency})`;
            }
        } else {
            conversionInfo.style.display = 'none';
        }
        
        // Update installment logic
        const threshold = 500; // Show installments for $500 or more
        let baseAmountInUSD = amount;
        
        // If not in USD, convert to USD to check threshold
        if (selectedCurrency !== 'USD') {
            baseAmountInUSD = amount * (1 / (currencyConverter.rates[selectedCurrency] || 1));
        }

        if (baseAmountInUSD >= threshold) {
            installmentSection.style.display = 'block';
            
            // Calculate monthly amounts
            plan3Amount.textContent = `${symbol}${(amount / 3).toFixed(2)}/mo`;
            plan6Amount.textContent = `${symbol}${(amount / 6).toFixed(2)}/mo`;
            plan12Amount.textContent = `${symbol}${(amount / 12).toFixed(2)}/mo`;
            installmentTotalDisplay.textContent = `${symbol}${amount.toFixed(2)} ${selectedCurrency}`;
        } else {
            installmentSection.style.display = 'none';
            if (useInstallmentsCheckbox && useInstallmentsCheckbox.checked) {
                useInstallmentsCheckbox.checked = false;
                toggleInstallmentPlans();
            }
            if (installmentOptions) installmentOptions.style.display = 'none';
        }
        
        // Update summary display
        summaryAmount.textContent = amount.toFixed(2);
    };

    window.toggleInstallmentPlans = function() {
        const useInstallments = document.getElementById('use-installments').checked;
        const installmentOptions = document.getElementById('installment-options');
        const summaryMethod = document.getElementById('summary-method');
        
        if (installmentOptions) {
            installmentOptions.style.display = useInstallments ? 'block' : 'none';
        }
        
        if (useInstallments) {
            const selectedPlan = document.querySelector('input[name="installmentPlan"]:checked').value;
            summaryMethod.textContent = `Installment Plan (${selectedPlan} Months)`;
        } else {
            const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Credit Card';
            summaryMethod.textContent = selectedMethod.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
    };
    
    if (donateForm && donateMessage) {
        donateForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const amountInput = donateForm.querySelector('input[name="amount"]');
            const currencySelect = document.getElementById('currency-select');
            const amount = amountInput.value;
            const currency = currencySelect.value;
            const paymentMethod = donateForm.querySelector('input[name="paymentMethod"]:checked').value;
            const name = donateForm.querySelector('input[name="name"]').value || 'Anonymous';
            const email = donateForm.querySelector('input[name="email"]').value || '';
            
            // Check for installments
            const useInstallments = document.getElementById('use-installments').checked;
            let installmentInfo = '';
            let finalMethod = paymentMethod;

            if (useInstallments) {
                const months = document.querySelector('input[name="installmentPlan"]:checked').value;
                const monthlyAmount = (parseFloat(amount) / parseInt(months)).toFixed(2);
                installmentInfo = ` in ${months} monthly installments of ${currencyConverter.getSymbol(currency)}${monthlyAmount}`;
                finalMethod = `Installment Plan (${months} months)`;
            }
            
            // Show thank you page
            showThankYouPage({
                amount: amount,
                currency: currency,
                method: finalMethod,
                email: email,
                caseTitle: 'Emergency Case Support',
                isInstallment: useInstallments
            });

            // Save donation to localStorage for the dashboard
            const donationRecord = {
                id: 'don_' + Date.now(),
                amount: amount,
                currency: currency,
                method: finalMethod,
                email: email || (authSystem.currentUser ? authSystem.currentUser.email : 'anonymous@example.com'),
                caseTitle: 'Emergency Case Support',
                date: new Date().toISOString(),
                isInstallment: useInstallments
            };
            
            const existingDonations = JSON.parse(localStorage.getItem('pulserelief_donations')) || [];
            existingDonations.push(donationRecord);
            localStorage.setItem('pulserelief_donations', JSON.stringify(existingDonations));
            
            // Refresh dashboard donations if open
            if (typeof displayMyDonations === 'function') displayMyDonations();
                
            // Update the emergency case progress if a case is selected
            if (window.activeDonationCaseId) {
                const allRequests = JSON.parse(localStorage.getItem('pulserelief_emergency_requests')) || [];
                const caseIndex = allRequests.findIndex(req => req.id === window.activeDonationCaseId);
                
                if (caseIndex !== -1) {
                    // Convert donation to USD for consistent tracking if needed, 
                    // but here we'll assume the goal is in the base currency (USD)
                    // and the donation amount input is already converted or handled.
                    // For simplicity, we'll use the numeric amount.
                    const donationAmountNumeric = parseFloat(amount);
                    allRequests[caseIndex].raisedAmount = (allRequests[caseIndex].raisedAmount || 0) + donationAmountNumeric;
                    
                    localStorage.setItem('pulserelief_emergency_requests', JSON.stringify(allRequests));
                    
                    // Re-render the grid to show new progress
                    if (typeof renderMainCaseGrid === 'function') renderMainCaseGrid();
                }
            }

            donateMessage.textContent = `Thank you ${name}! Processing ${currencyConverter.getSymbol(currency)}${amount} ${currency} donation via ${finalMethod}${installmentInfo}. In production, secure payment processing would occur here with encrypted card details.`;
        });
    
        // Handle quick amount buttons
        const amountButtons = document.querySelectorAll('.amount-btn');
        const amountInput = donateForm.querySelector('input[name="amount"]');
        const summaryAmount = document.getElementById('summary-amount');
    
        amountButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const amount = button.getAttribute('data-amount');
                amountInput.value = amount;
                
                // Update active state
                amountButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update display and installment logic
                updateDonationDisplay();
            });
        });
    
        // Update summary when amount changes
        amountInput.addEventListener('change', () => {
            summaryAmount.textContent = amountInput.value;
        });
    
        // Handle payment method selection
        const paymentMethodRadios = donateForm.querySelectorAll('input[name="paymentMethod"]');
        const cardDetailsSection = document.getElementById('card-details-section');
        const googlePaySection = document.getElementById('google-pay-section');
        const upiSection = document.getElementById('upi-section');
        const qrCodeSection = document.getElementById('qr-code-section');
        const summaryMethod = document.getElementById('summary-method');
    
        paymentMethodRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                // Hide all payment method details
                cardDetailsSection.style.display = 'none';
                googlePaySection.style.display = 'none';
                upiSection.style.display = 'none';
                qrCodeSection.style.display = 'none';
    
                // Show relevant section based on selection
                switch(radio.value) {
                    case 'credit-card':
                    case 'debit-card':
                        cardDetailsSection.style.display = 'block';
                        break;
                    case 'google-pay':
                        googlePaySection.style.display = 'block';
                        break;
                    case 'upi':
                        upiSection.style.display = 'block';
                        break;
                    case 'qr-code':
                        qrCodeSection.style.display = 'block';
                        generateQRCode();
                        break;
                }
    
                // Update summary
                const methodNames = {
                    'credit-card': 'Credit Card',
                    'debit-card': 'Debit Card',
                    'paypal': 'PayPal',
                    'bank-transfer': 'Bank Transfer',
                    'google-pay': 'Google Pay',
                    'upi': 'UPI',
                    'qr-code': 'QR Code'
                };
                
                const useInstallments = document.getElementById('use-installments').checked;
                if (!useInstallments) {
                    summaryMethod.textContent = methodNames[radio.value];
                }
            });
        });
    
        // Format card number input (add spaces)
        const cardNumberInput = donateForm.querySelector('input[name="cardNumber"]');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '');
                let formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = formattedValue;
            });
        }
    
        // Format expiry date input (MM/YY)
        const expiryInput = donateForm.querySelector('input[name="cardExpiry"]');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                e.target.value = value;
            });
        }
    
        // Format UPI ID input
        const upiInput = donateForm.querySelector('input[name="upiId"]');
        if (upiInput) {
            upiInput.addEventListener('blur', (e) => {
                const upiId = e.target.value.trim();
                if (upiId && !upiId.includes('@')) {
                    e.target.classList.add('error');
                } else {
                    e.target.classList.remove('error');
                }
            });
        }
    }
    
    // Generate QR Code for donation - Creates unique QR every time
    function generateQRCode() {
        try {
            const amount = document.querySelector('input[name="amount"]').value;
            
            // Generate truly unique identifiers
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substr(2, 9);
            const transactionRef = `TXN-${timestamp}-${randomId}`;
            const caseId = `case_${timestamp}_${randomId}`;
            
            // Generate a unique session ID for this QR session
            const sessionId = Math.random().toString(36).substr(2, 12);
            
            // Create UPI string with all unique identifiers
            const upiString = `upi://pay?pa=pulserelief@okhdfcbank&pn=PulseRelief&am=${amount}&tn=Emergency%20Donation&tr=${transactionRef}&sid=${sessionId}`;
            
            // Store transaction data for reference
            const qrData = {
                transactionRef: transactionRef,
                caseId: caseId,
                sessionId: sessionId,
                amount: amount,
                timestamp: new Date().toISOString(),
                generatedAt: new Date().toLocaleString()
            };
            
            // Save to session storage for download
            sessionStorage.setItem('currentQRData', JSON.stringify(qrData));
            
            // Generate QR code with the unique data
            if (window.QRious) {
                // Clear previous QR code
                const qrContainer = document.getElementById('qrcode');
                if (qrContainer) {
                    qrContainer.innerHTML = '';
                }
                
                const qrCode = new QRious({
                    element: document.getElementById('qrcode'),
                    value: upiString,
                    size: 220,
                    level: 'H',
                    mime: 'image/png'
                });
            }
            
            // Update display with unique transaction info
            const qrAmount = document.getElementById('qr-amount');
            const qrRefId = document.getElementById('qr-reference-id');
            
            if (qrAmount) {
                qrAmount.textContent = `$${amount}`;
            }
            
            // Display transaction reference ID
            if (qrRefId) {
                qrRefId.textContent = transactionRef;
                qrRefId.title = `Generated: ${qrData.generatedAt}`;
            }
            
            // Update session info if available
            const sessionInfo = document.getElementById('qr-session-info');
            if (sessionInfo) {
                sessionInfo.innerHTML = `
                    <div class="qr-info-item">
                        <strong>Session ID:</strong> <code>${sessionId}</code>
                    </div>
                    <div class="qr-info-item">
                        <strong>Generated:</strong> ${qrData.generatedAt}
                    </div>
                `;
            }
            
            console.log('QR Code generated:', qrData);
        } catch (error) {
            console.error('QR code generation error:', error);
        }
    }
    
    // Download QR Code as image
    window.downloadQRCode = function() {
        try {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.href = canvas.toDataURL();
                link.download = 'pulserelief-donation-qr.png';
                link.click();
            }
        } catch (error) {
            console.error('Download error:', error);
        }
    }
    
    // Initialize UPI payment
    window.initializeUPIPayment = function(event) {
        event.preventDefault();
            
        const upiId = document.querySelector('input[name="upiId"]').value.trim();
        const amount = document.querySelector('input[name="amount"]').value;
            
        if (!upiId || !upiId.includes('@')) {
            alert('Please enter a valid UPI ID (e.g., name@upi)');
            return;
        }
    
        const caseId = 'case_' + Math.random().toString(36).substr(2, 9);
        const upiLink = `upi://pay?pa=${upiId}&pn=PulseRelief&am=${amount}&tn=Emergency%20Donation&tr=${caseId}`;
            
        // Open UPI app
        window.location.href = upiLink;
            
        // Fallback: Show QR code
        setTimeout(() => {
            alert('If your UPI app did not open, please scan the QR code instead.');
        }, 1000);
    }

    const ticker = document.getElementById("ticker");
    if (ticker) {
        let index = 0;
        const items = Array.from(ticker.children);
        if (items.length > 1) {
            setInterval(() => {
                items[index].style.opacity = "0.3";
                index = (index + 1) % items.length;
                items[index].style.opacity = "1";
            }, 4000);
        }
    }

    const emergencyLocations = [
        {
            title: "Emergency surgery for road accident victim",
            position: { lat: -1.286389, lng: 36.817223 },
            category: "Medical · ICU",
        },
        {
            title: "Clean water & shelter kits after flash floods",
            position: { lat: 26.200604, lng: 92.9375739 },
            category: "Disaster relief · Floods",
        },
        {
            title: "Keep a first-gen student enrolled this semester",
            position: { lat: -33.9249, lng: 18.4241 },
            category: "Education · Scholarship",
        },
        {
            title: "Keep community clinic software online",
            position: { lat: 6.2442, lng: -75.5812 },
            category: "Startup · Crisis bridge",
        },
    ];

    window.initMap = function () {
        const mapElement = document.getElementById("map");
        if (!mapElement || !window.L) return;

        if (window.__pulsereliefLeafletMap) {
            try {
                window.__pulsereliefLeafletMap.invalidateSize();
            } catch (e) {
                // ignore
            }
            return;
        }

        const map = window.L.map(mapElement, {
            zoomControl: true,
            scrollWheelZoom: false,
            worldCopyJump: true
        });

        window.__pulsereliefLeafletMap = map;

        const tile = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap &copy; CARTO'
        });
        tile.addTo(map);

        const markerSvgs = {
            medical: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50"><path fill="%23ff6384" d="M20,0C10,0 2,8 2,18c0,18 18,30 18,30s18-12 18-30c0-10-8-18-18-18z"/><path fill="white" d="M20,12h-3v4h-4v3h4v4h3v-4h4v-3h-4v-4z"/></svg>',
            disaster: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50"><path fill="%2338bdf8" d="M20,0C10,0 2,8 2,18c0,18 18,30 18,30s18-12 18-30c0-10-8-18-18-18z"/><path fill="white" d="M20,10 L25,22 L38,22 L28,30 L33,42 L20,34 L7,42 L12,30 L2,22 L15,22 Z"/></svg>',
            education: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50"><path fill="%238b8cfc" d="M20,0C10,0 2,8 2,18c0,18 18,30 18,30s18-12 18-30c0-10-8-18-18-18z"/><path fill="white" d="M20,10 L8,16 L8,23 C8,30 20,38 20,38 C20,38 32,30 32,23 L32,16 Z M20,18 L14,21 L20,24 L26,21 Z"/></svg>',
            startup: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50"><path fill="%232dd4bf" d="M20,0C10,0 2,8 2,18c0,18 18,30 18,30s18-12 18-30c0-10-8-18-18-18z"/><path fill="white" d="M20,12 C16,12 14,14 14,18 C14,22 16,24 20,24 C24,24 26,22 26,18 C26,14 24,12 20,12 M16,28 L16,36 L18,36 L18,32 L22,32 L22,36 L24,36 L24,28 Z"/></svg>'
        };

        const getIcon = (category, label) => {
            const cat = String(category || '');
            let url = markerSvgs.medical;
            if (cat.includes('Disaster')) url = markerSvgs.disaster;
            else if (cat.includes('Education')) url = markerSvgs.education;
            else if (cat.includes('Startup')) url = markerSvgs.startup;

            const html = `
                <div class="leaflet-pin">
                    <img class="leaflet-pin-img" src="${url}" alt="" />
                    <span class="leaflet-pin-label">${label}</span>
                </div>
            `;
            return window.L.divIcon({
                className: 'leaflet-pin-wrap',
                html,
                iconSize: [40, 50],
                iconAnchor: [20, 50],
                popupAnchor: [0, -48]
            });
        };

        const bounds = [];
        emergencyLocations.forEach((item, index) => {
            const latlng = [item.position.lat, item.position.lng];
            bounds.push(latlng);

            const icon = getIcon(item.category, String(index + 1));
            const marker = window.L.marker(latlng, { icon, title: item.title, riseOnHover: true }).addTo(map);

            const popupHtml = `
                <div class="map-info-window">
                    <div class="info-header">
                        <strong>${item.title}</strong>
                    </div>
                    <div class="info-body">
                        <p><strong>Category:</strong> ${item.category}</p>
                        <p><strong>Location:</strong> ${item.position.lat.toFixed(2)}°, ${item.position.lng.toFixed(2)}°</p>
                    </div>
                </div>
            `;
            marker.bindPopup(popupHtml, { maxWidth: 320, closeButton: true });
        });

        if (bounds.length) {
            map.fitBounds(bounds, { padding: [28, 28] });
        } else {
            map.setView([20, 10], 2);
        }
    };

    const initAllMaps = () => {
        if (typeof window.initMap === 'function') {
            window.initMap();
        }

        // Some layouts load/animate sections after load. Initialize again once the
        // map is visible, and ensure Leaflet has computed the correct size.
        const mapElement = document.getElementById('map');
        if (mapElement && typeof IntersectionObserver !== 'undefined') {
            const observer = new IntersectionObserver((entries) => {
                const isVisible = entries && entries[0] && entries[0].isIntersecting;
                if (!isVisible) return;

                try {
                    window.initMap();
                    if (window.__pulsereliefLeafletMap) {
                        window.__pulsereliefLeafletMap.invalidateSize();
                    }
                } catch (e) {
                    // ignore
                }

                observer.disconnect();
            }, { threshold: 0.15 });
            observer.observe(mapElement);
        }

        // Final safety net: retry shortly after load to avoid timing issues.
        setTimeout(() => {
            try {
                window.initMap();
                if (window.__pulsereliefLeafletMap) {
                    window.__pulsereliefLeafletMap.invalidateSize();
                }
            } catch (e) {
                // ignore
            }
        }, 600);
    };

    initAllMaps();

    window.addEventListener('load', () => {
        if (typeof window.initMap === 'function') {
            try {
                window.initMap();
                if (window.__pulsereliefLeafletMap) {
                    window.__pulsereliefLeafletMap.invalidateSize();
                }
            } catch (e) {
                // ignore
            }
        }
    });

    // Chatbot functionality
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');

    // Knowledge base with information from the website
    const knowledgeBase = [
        {
            patterns: ['how it works', 'process', 'steps', 'workflow', 'procedure'],
            response: "PulseRelief works in 4 critical steps:\n1. Signal the emergency - Submit a short, mobile-first request with essentials\n2. Rapid verification - Partner hospitals/NGOs validate with digital proofs, AI-powered document verification, and real-time checks\n3. Instant storytelling - Clear one-screen story for donors\n4. Smart disbursement - Funds routed directly to providers with live tracking and blockchain-based security"
        },
        {
            patterns: ['trust', 'verification', 'fraud', 'safe', 'secure', 'reliable'],
            response: "We ensure trust through: Rapid verification (not paperwork), Instant traceable disbursement, Radical transparency, Stress-tested interfaces, Global donor reach. Every case is verified by partners (hospitals, schools, NGOs), documents are checked via AI, and we use behavioral patterns to prevent fraud. We also use blockchain for immutable verification records."
        },
        {
            patterns: ['funds', 'disbursement', 'release', 'money', 'payment', 'donate', 'donation'],
            response: "For fully verified cases with connected providers, funds can be disbursed in a few hours. We optimize for hours, not weeks. Funds go directly to service providers when possible, with a live, public ledger showing every transaction. We use smart contracts for automated milestone-based releases. You can fund specific cases or contribute to focused emergency pools."
        },
        {
            patterns: ['verification', 'verify', 'document', 'documents', 'check', 'validate'],
            response: "Our verification process includes AI-powered document verification, real-time partner validation (hospitals, NGOs), blockchain-based immutable records, and pre-verification profiles. We also use OCR technology and government database integration for instant verification."
        },
        {
            patterns: ['disbursement', 'release', 'payout', 'transfer', 'send', 'funds'],
            response: "Our disbursement system uses smart contracts to automatically release funds when milestones are met, direct integration with payment providers for instant transfers, emergency fund pools for immediate disbursement, and escrow services for security. Funds are routed directly to service providers when possible."
        },
        {
            patterns: ['emergency', 'help', 'support', 'request', 'get help', 'need help'],
            response: "If you're in a crisis, click the 'Get help' button in the header or the 'Start an emergency request' button. The process takes about 5 minutes. You'll select the emergency type, location, amount needed, describe what happened, and identify who can verify your case. For faster processing, you can use voice-based requests."
        },
        {
            patterns: ['live', 'cases', 'current', 'active', 'ongoing'],
            response: "We feature live emergencies seeking support across 4 categories: Medical, Education, Disaster relief, and Small startups. Each case shows real-time progress, verification status, and transparent updates. You can filter cases by category using the category switch."
        },
        {
            patterns: ['partners', 'hospital', 'ngo', 'school', 'organization'],
            response: "We partner with Hospitals & clinics, Schools & universities, Disaster relief NGOs, and Small startups & social enterprises. Partners can integrate PulseRelief into their workflows to trigger support instantly when crises hit."
        },
        {
            patterns: ['contact', 'support', 'reach', 'talk', 'help'],
            response: "You can reach out through the 'Partners' section if you represent an organization, or use the 'FAQ' section for common questions. You can also start an emergency request if you need immediate assistance."
        },
        {
            patterns: ['about', 'what', 'pulserelief', 'service', 'mission'],
            response: "PulseRelief provides instant, trustworthy emergency fundraising. We connect verified urgent cases with ready donors in real-time. Our mission is to remove friction from traditional fundraising when time is critical, focusing on hours instead of weeks. We use AI, blockchain, and smart contracts to ensure rapid, secure, and transparent fundraising."
        },
        {
            patterns: ['crisis', 'map', 'location', 'geographic', 'global'],
            response: "Our crisis map visualizes verified emergencies across regions in real-time. Each marker represents a live or recently funded case. We support emergencies globally, even where we don't have local partners, by collaborating with international organizations."
        }
    ];

    // Toggle chatbot visibility
    chatbotToggle.addEventListener('click', () => {
        chatbotContainer.classList.toggle('active');
        if (chatbotContainer.classList.contains('active')) {
            chatbotInput.focus();
        }
    });

    // Close chatbot
    chatbotClose.addEventListener('click', () => {
        chatbotContainer.classList.remove('active');
    });

    // Send message when button is clicked
    chatbotSend.addEventListener('click', sendMessage);

    // Send message when Enter key is pressed
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Function to add a message to the chat
    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        messageDiv.textContent = text;
        chatbotMessages.appendChild(messageDiv);
        
        // Scroll to the bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Function to find a response based on user input
    function findResponse(userInput) {
        const lowerInput = userInput.toLowerCase();
        
        for (const entry of knowledgeBase) {
            for (const pattern of entry.patterns) {
                if (lowerInput.includes(pattern)) {
                    return entry.response;
                }
            }
        }
        
        // Check for verification-related queries not explicitly in the knowledge base
        if (lowerInput.includes('blockchain') || lowerInput.includes('ai') || lowerInput.includes('smart contract')) {
            return "PulseRelief uses advanced technologies for verification and trust: \n- Blockchain-based immutable records for verification steps\n- AI-powered document verification to speed up the process\n- Smart contracts for automated, milestone-based fund releases\n- Real-time tracking of every verification and disbursement step";
        }
        
        // Default response if no pattern matches
        return "I'm here to help you with information about PulseRelief. You can ask me about how our service works, trust and verification, emergency fundraising, or how to get help. What would you like to know?";
    }

    // Function to send a message
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (message) {
            // Add user message
            addMessage(message, true);
            
            // Clear input
            chatbotInput.value = '';
            
            // Simulate bot thinking
            setTimeout(() => {
                const response = findResponse(message);
                addMessage(response, false);
            }, 500);
        }
    }

    // Add welcome message when chat opens
    chatbotToggle.addEventListener('click', () => {
        if (chatbotContainer.classList.contains('active') && chatbotMessages.children.length === 0) {
            setTimeout(() => {
                addMessage("Hello! I'm here to help you with information about PulseRelief. You can ask me about our service, how fundraising works, trust mechanisms, or how to get emergency help.", false);
            }, 300);
        }
    });
    
    // Also open chatbot when 'Get help' nav link is clicked
    const getHelpLink = document.querySelector('a.nav-cta[href="#get-started"]');
    if (getHelpLink) {
        getHelpLink.addEventListener('click', (e) => {
            e.preventDefault();
            chatbotContainer.classList.add('active');
            if (chatbotMessages.children.length === 0) {
                setTimeout(() => {
                    addMessage("Hello! I'm here to help you with information about PulseRelief. You can ask me about our service, how fundraising works, trust mechanisms, or how to get emergency help.", false);
                }, 300);
            }
            chatbotInput.focus();
        });
    }
    
    // Dashboard functionality
    const dashboardModal = document.getElementById('dashboard-modal');
    const dashboardOverlay = document.getElementById('dashboard-overlay');
    const dashboardClose = document.getElementById('dashboard-close');
    const loginTabs = document.querySelectorAll('.login-tab');
    const loginForms = document.querySelectorAll('.login-form');
    const dashboardMain = document.querySelector('.dashboard-main');
    const dashboardLogin = document.querySelector('.dashboard-login');
    const dashboardViews = document.querySelectorAll('.dashboard-view');
    const userLoginForm = document.getElementById('user-login-form');
    const donorLoginForm = document.getElementById('donor-login-form');
    const staffLoginForm = document.getElementById('staff-login-form');
    const bankDetailsForm = document.getElementById('bank-details-form');
    const userNav = document.getElementById('user-nav');
    const donorNav = document.getElementById('donor-nav');
    const staffNav = document.getElementById('staff-nav');
    let currentUserType = authSystem.currentUserType;

    const getCriticalMeta = (req) => {
        const now = Date.now();
        const neededBy = req && req.neededBy ? Number(req.neededBy) : null;
        const neededWithinHours = req && req.neededWithinHours ? Number(req.neededWithinHours) : null;
        const hoursLeft = neededBy ? Math.max(0, (neededBy - now) / (1000 * 60 * 60)) : null;

        // Treat anything with a timer that is due within 24 hours as critical.
        // (Also mark as critical if the user explicitly selected <= 24 hours.)
        const isCritical = (typeof neededWithinHours === 'number' && neededWithinHours > 0)
            ? (neededWithinHours <= 24)
            : (typeof hoursLeft === 'number' ? hoursLeft <= 24 : false);

        return {
            isCritical,
            hoursLeft,
            neededWithinHours
        };
    };
    
    // Initialize Dashboard Session
    const initDashboardSession = () => {
        if (authSystem.currentUser) {
            dashboardLogin.style.display = 'none';
            dashboardMain.style.display = 'flex';
            
            if (authSystem.currentUserType === 'admin') {
                userNav.style.display = 'none';
                if (donorNav) donorNav.style.display = 'none';
                staffNav.style.display = 'none';
                document.getElementById('admin-nav').style.display = 'flex';
                document.getElementById('dashboard-user-name').textContent = authSystem.currentUser.name + ' (Admin)';
                document.getElementById('dashboard-user-type').textContent = 'Administrator';
                
                const stats = authSystem.getDashboardStats();
                document.getElementById('total-users').textContent = stats.totalUsers;
                document.getElementById('total-staff').textContent = stats.totalStaff;
                document.getElementById('total-cases').textContent = stats.activeCases;
                
                showView('admin-overview');
            } else if (authSystem.currentUserType === 'staff') {
                userNav.style.display = 'none';
                if (donorNav) donorNav.style.display = 'none';
                staffNav.style.display = 'flex';
                document.getElementById('admin-nav').style.display = 'none';
                document.getElementById('dashboard-user-name').textContent = authSystem.currentUser.name;
                document.getElementById('dashboard-user-type').textContent = 'Staff - ' + authSystem.currentUser.role;
                
                showView('pending-requests');
            } else if (authSystem.currentUserType === 'donor') {
                userNav.style.display = 'none';
                if (donorNav) donorNav.style.display = 'flex';
                staffNav.style.display = 'none';
                document.getElementById('admin-nav').style.display = 'none';
                document.getElementById('dashboard-user-name').textContent = authSystem.currentUser.name;
                document.getElementById('dashboard-user-type').textContent = 'Donor';

                showView('donor-site');
            } else {
                userNav.style.display = 'flex';
                if (donorNav) donorNav.style.display = 'none';
                staffNav.style.display = 'none';
                document.getElementById('admin-nav').style.display = 'none';
                document.getElementById('dashboard-user-name').textContent = authSystem.currentUser.name;
                document.getElementById('dashboard-user-type').textContent = 'User';
                
                if (document.getElementById('profile-name')) {
                    document.getElementById('profile-name').textContent = authSystem.currentUser.name;
                    document.getElementById('profile-email').textContent = authSystem.currentUser.email;
                    if (document.getElementById('profile-phone')) {
                        document.getElementById('profile-phone').textContent = authSystem.currentUser.phone || '—';
                    }
                    document.getElementById('profile-join-date').textContent = authSystem.currentUser.joinDate;
                }
                
                showView('profile');
            }
        }
    };
    const openDashboard = () => {
        dashboardModal.style.display = 'block';
        setTimeout(() => {
            dashboardModal.style.opacity = '1';
        }, 10);
    };
    
    // Close dashboard
    const closeDashboard = () => {
        dashboardModal.style.display = 'none';
        dashboardModal.style.opacity = '0';
        
        // If we logged out, reset to login view. 
        // Otherwise (just closed the modal), keep the current view state.
        if (!authSystem.currentUser) {
            dashboardLogin.style.display = 'flex';
            dashboardMain.style.display = 'none';
            const activeTab = document.querySelector('.login-tab.active');
            if (activeTab) activeTab.classList.remove('active');
            const userTab = document.querySelector('.login-tab[data-tab="user-login"]');
            if (userTab) userTab.classList.add('active');
            loginForms.forEach(form => form.style.display = 'none');
            document.getElementById('user-login-form').style.display = 'flex';
            currentUserType = null;
        }
    };
    
    // Dashboard toggle button functionality
    const dashboardToggle = document.getElementById('dashboard-toggle');
    if (dashboardToggle) {
        dashboardToggle.addEventListener('click', (e) => {
            e.preventDefault();
            openDashboard();
        });
    }

    // Tab switching for login
    loginTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.getAttribute('data-tab');
            
            loginTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            loginForms.forEach(form => {
                if (form.getAttribute('data-form') === tabType) {
                    form.style.display = 'flex';
                } else {
                    form.style.display = 'none';
                }
            });
        });
    });
    
    // User Signup Form
    const userSignupForm = document.getElementById('user-signup-form');
    if (userSignupForm) {
        userSignupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;
            const phone = document.getElementById('signup-phone') ? document.getElementById('signup-phone').value : '';
            const country = document.getElementById('signup-country').value;
            const accountTypeEl = document.getElementById('signup-account-type');
            const accountType = accountTypeEl ? accountTypeEl.value : 'user';
            
            // Validate passwords match
            if (password !== confirm) {
                alert('❌ Passwords do not match!');
                return;
            }
            
            if (password.length < 6) {
                alert('❌ Password must be at least 6 characters!');
                return;
            }

            if (!country) {
                alert('❌ Please select your country!');
                return;
            }

            if (!phone || !phone.trim()) {
                alert('❌ Please enter your phone number!');
                return;
            }
            
            // Create account using auth system (saves to localStorage automatically)
            const result = authSystem.createUser(name, email, password, country, phone, accountType);
            
            if (result.success) {
                // Clear form
                userSignupForm.reset();
                
                // Show success notification
                alert(`✅ Account created successfully!

📧 Email: ${email}
🔐 Your credentials have been saved securely.

You can now login with these credentials.`);

                // Switch to appropriate login tab
                const nextTab = accountType === 'donor'
                    ? document.querySelector('[data-tab="donor"]')
                    : document.querySelector('[data-tab="user-login"]');
                if (nextTab) nextTab.click();

                // Auto-fill email for convenience
                setTimeout(() => {
                    if (accountType === 'donor') {
                        const donorEmail = document.getElementById('donor-email');
                        if (donorEmail) donorEmail.value = email;
                    } else {
                        const userEmail = document.getElementById('user-email');
                        if (userEmail) userEmail.value = email;
                    }
                }, 100);
            } else {
                alert('❌ Error: ' + result.message);
            }
        });
    }

    const signupBackToLoginBtn = document.getElementById('signup-back-to-login-btn');
    if (signupBackToLoginBtn) {
        signupBackToLoginBtn.addEventListener('click', () => {
            const loginTabBtn = document.querySelector('[data-tab="user-login"]');
            if (loginTabBtn) loginTabBtn.click();
        });
    }

    const signupScrollDownBtn = document.getElementById('signup-scroll-down-btn');
    if (signupScrollDownBtn) {
        signupScrollDownBtn.addEventListener('click', () => {
            const signupForm = document.getElementById('user-signup-form');
            const signupSubmitBtn = document.getElementById('signup-submit-btn');
            if (!signupForm || !signupSubmitBtn) return;
            signupSubmitBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }
    
    // Login form submission
    userLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('user-email').value;
        const password = document.getElementById('user-password').value;
        
        const result = authSystem.loginUser(email, password);
        
        if (result.success) {
            // Show dashboard
            dashboardLogin.style.display = 'none';
            dashboardMain.style.display = 'flex';
            currentUserType = 'user';
            
            // Show user nav, hide staff/admin nav
            userNav.style.display = 'flex';
            staffNav.style.display = 'none';
            document.getElementById('admin-nav').style.display = 'none';
            
            // Update user info
            document.getElementById('dashboard-user-name').textContent = result.user.name;
            document.getElementById('dashboard-user-type').textContent = 'User';
            document.getElementById('profile-name').textContent = result.user.name;
            document.getElementById('profile-email').textContent = result.user.email;
            if (document.getElementById('profile-phone')) {
                document.getElementById('profile-phone').textContent = result.user.phone || '—';
            }
            document.getElementById('profile-join-date').textContent = result.user.joinDate;
            
            showView('profile');
        } else {
            alert('Login failed: ' + result.message);
        }
    });

    // Donor Login Form
    if (donorLoginForm) {
        donorLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('donor-email').value;
            const password = document.getElementById('donor-password').value;

            const result = authSystem.loginDonor(email, password);
            if (result.success) {
                dashboardLogin.style.display = 'none';
                dashboardMain.style.display = 'flex';
                currentUserType = 'donor';

                userNav.style.display = 'none';
                if (donorNav) donorNav.style.display = 'flex';
                staffNav.style.display = 'none';
                document.getElementById('admin-nav').style.display = 'none';

                document.getElementById('dashboard-user-name').textContent = result.user.name;
                document.getElementById('dashboard-user-type').textContent = 'Donor';

                showView('donor-site');
            } else {
                alert('Donor login failed: ' + result.message);
            }
        });
    }
    
    // Staff Login Form
    staffLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('staff-email').value;
        const password = document.getElementById('staff-password').value;
        
        const result = authSystem.loginStaff(email, password);
        
        if (result.success) {
            dashboardLogin.style.display = 'none';
            dashboardMain.style.display = 'flex';
            currentUserType = 'staff';
            
            // Show staff nav, hide user/admin nav
            userNav.style.display = 'none';
            staffNav.style.display = 'flex';
            document.getElementById('admin-nav').style.display = 'none';
            
            // Update user info
            document.getElementById('dashboard-user-name').textContent = result.user.name;
            document.getElementById('dashboard-user-type').textContent = 'Staff - ' + result.user.role;
            
            showView('pending-requests');
        } else {
            alert('Staff login failed: ' + result.message);
        }
    });
    
    // Admin Login Form
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            
            const result = authSystem.loginAdmin(email, password);
            
            if (result.success) {
                dashboardLogin.style.display = 'none';
                dashboardMain.style.display = 'flex';
                currentUserType = 'admin';
                
                // Show admin nav, hide user/staff nav
                userNav.style.display = 'none';
                staffNav.style.display = 'none';
                document.getElementById('admin-nav').style.display = 'flex';
                
                // Update user info
                document.getElementById('dashboard-user-name').textContent = result.user.name + ' (Admin)';
                document.getElementById('dashboard-user-type').textContent = 'Administrator';
                
                // Update dashboard stats
                const stats = authSystem.getDashboardStats();
                document.getElementById('total-users').textContent = stats.totalUsers;
                document.getElementById('total-staff').textContent = stats.totalStaff;
                document.getElementById('total-cases').textContent = stats.activeCases;
                
                showView('admin-overview');
            } else {
                alert('Admin login failed: ' + result.message);
            }
        });
    }
    
    // Navigation in dashboard
    const handleNavClick = function() {
        const view = this.getAttribute('data-view');
        let currentNav;
        if (currentUserType === 'staff') {
            currentNav = staffNav;
        } else if (currentUserType === 'admin') {
            currentNav = document.getElementById('admin-nav');
        } else if (currentUserType === 'donor') {
            currentNav = donorNav;
        } else {
            currentNav = userNav;
        }
        
        // Remove active class from all nav items in the current nav
        if (currentNav) {
            const navItems = currentNav.querySelectorAll('.nav-item');
            navItems.forEach(nav => nav.classList.remove('active'));
        }
        this.classList.add('active');
        
        if (view === 'logout') {
            authSystem.logout();
            closeDashboard();
        } else {
            showView(view);
        }
    };
    
    // Add event listeners to all dashboard nav items once
    document.querySelectorAll('.dashboard-nav .nav-item').forEach(item => {
        item.addEventListener('click', handleNavClick);
    });

    const donorDonateNowBtn = document.getElementById('donor-donate-now-btn');
    if (donorDonateNowBtn && !donorDonateNowBtn.__hasDonateNowHandler) {
        donorDonateNowBtn.__hasDonateNowHandler = true;
        donorDonateNowBtn.addEventListener('click', () => {
            closeDashboard();
            const donateModalBtn = document.querySelector('[data-open-modal="donate-modal"]');
            if (donateModalBtn) {
                donateModalBtn.click();
                return;
            }
            const target = document.getElementById('live-cases');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Show specific view
    const showView = (viewName) => {
        dashboardViews.forEach(view => {
            if (view.id === viewName + '-view') {
                view.classList.add('active');
                // Some dashboard views in HTML have inline style="display: none;".
                // Inline styles override CSS classes, so we must explicitly clear them.
                view.style.display = '';
            } else {
                view.classList.remove('active');
                view.style.display = 'none';
            }
        });
        
        // Load partner requests when partner-requests view is opened
        if (viewName === 'partner-requests') {
            displayPartnerRequests();
        }

        // Load user's own requests
        if (viewName === 'my-requests') {
            displayMyRequests();
        }

        // Load user's donations
        if (viewName === 'my-donations') {
            displayMyDonations();
        }

        // Load staff pending requests
        if (viewName === 'pending-requests') {
            displayPendingRequests();
        }
        
        // Load staff active cases
        if (viewName === 'active-cases') {
            displayStaffActiveCases();
        }
        
        // Load admin overview data
        if (viewName === 'admin-overview') {
            updateAdminOverview();
        }
        
        // Load staff management data
        if (viewName === 'staff-management') {
            displayStaffMembers();
        }
        
        // Load users management data
        if (viewName === 'admin-users') {
            displayUsers();
        }
        
        // Load cases management data
        if (viewName === 'admin-cases') {
            displayCases();
        }
        
        // Load analytics data
        if (viewName === 'admin-analytics') {
            displayAnalytics();
        }
    };

    // Display user's own requests
    window.displayMyRequests = () => {
        const myRequestsList = document.getElementById('my-requests-list');
        if (!myRequestsList) return;

        const myRequestsHistoryList = document.getElementById('my-requests-history-list');

        const allRequests = JSON.parse(localStorage.getItem('pulserelief_emergency_requests')) || [];
        const userEmail = authSystem.currentUser ? authSystem.currentUser.email : 'anonymous@example.com';

        // Filter requests for current user
        const userRequests = allRequests.filter(req => req.userEmail === userEmail);

        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const recentRequests = userRequests.filter(r => Number(r.timestamp || 0) >= cutoff);
        const previousRequests = userRequests.filter(r => Number(r.timestamp || 0) < cutoff);

        myRequestsList.innerHTML = '';
        if (myRequestsHistoryList) myRequestsHistoryList.innerHTML = '';

        if (recentRequests.length === 0) {
            myRequestsList.innerHTML = `
                <div class="empty-state">
                    <p>You haven't submitted any emergency requests in the last 24 hours.</p>
                </div>
            `;
        }

        if (myRequestsHistoryList && previousRequests.length === 0) {
            myRequestsHistoryList.innerHTML = `
                <div class="empty-state">
                    <p>No previous cases yet.</p>
                </div>
            `;
        }

        const sortRequests = (arr) => arr.sort((a, b) => {
            const aMeta = getCriticalMeta(a);
            const bMeta = getCriticalMeta(b);

            if (aMeta.isCritical !== bMeta.isCritical) {
                return aMeta.isCritical ? -1 : 1;
            }

            const aDue = a.neededBy ? Number(a.neededBy) : Infinity;
            const bDue = b.neededBy ? Number(b.neededBy) : Infinity;
            if (aDue !== bDue) return aDue - bDue;

            return (b.timestamp || 0) - (a.timestamp || 0);
        });

        sortRequests(recentRequests);
        sortRequests(previousRequests);

        const renderRequestItem = (request, container) => {
            const requestElement = document.createElement('div');
            requestElement.className = 'request-item';

            // Determine timeline classes based on status
            const isVerified = request.status === 'approved';
            const isRejected = request.status === 'rejected';

            const meta = getCriticalMeta(request);
            const urgencyText = meta.neededWithinHours
                ? `Needed within ${meta.neededWithinHours} hour(s)`
                : '';

            const criticalBadge = meta.isCritical
                ? `<span class="urgency-badge critical">CRITICAL</span>`
                : '';

            if (meta.isCritical) requestElement.classList.add('critical');

            requestElement.innerHTML = `
                <div class="request-info">
                    <h4>${request.type} Help Request ${criticalBadge}</h4>
                    <p class="request-amount">$${request.amount} requested</p>
                    ${urgencyText ? `<p class="request-date"><strong>${urgencyText}</strong></p>` : ''}
                    <p class="request-date">${request.submittedDate}</p>
                </div>
                <span class="request-status ${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>

                <div class="case-timeline">
                    <div class="timeline-step completed">
                        <div class="step-dot"></div>
                        <span class="step-label">Submitted</span>
                    </div>
                    <div class="timeline-step ${isVerified ? 'completed' : (isRejected ? 'rejected' : 'active')}">
                        <div class="step-dot"></div>
                        <span class="step-label">${isRejected ? 'Rejected' : 'Verified'}</span>
                    </div>
                    <div class="timeline-step">
                        <div class="step-dot"></div>
                        <span class="step-label">Funded</span>
                    </div>
                    <div class="timeline-step">
                        <div class="step-dot"></div>
                        <span class="step-label">Resolved</span>
                    </div>
                </div>
            `;

            container.appendChild(requestElement);
        };

        recentRequests.forEach(r => renderRequestItem(r, myRequestsList));
        if (myRequestsHistoryList) {
            previousRequests.forEach(r => renderRequestItem(r, myRequestsHistoryList));
        }
    };

    // Display user's own donations
    window.displayMyDonations = () => {
        const donationsList = document.getElementById('my-donations-list');
        if (!donationsList) return;

        const donationsHistoryList = document.getElementById('my-donations-history-list');

        // Fetch donations from localStorage
        const allDonations = JSON.parse(localStorage.getItem('pulserelief_donations')) || [];
        const userEmail = authSystem.currentUser ? authSystem.currentUser.email : 'anonymous@example.com';
        
        // Filter donations for current user
        const userDonations = allDonations.filter(don => don.email === userEmail);
        
        donationsList.innerHTML = '';
        if (donationsHistoryList) donationsHistoryList.innerHTML = '';

        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const getDonationTime = (d) => {
            const t = new Date(d && d.date ? d.date : 0).getTime();
            return Number.isFinite(t) ? t : 0;
        };

        const recentDonations = userDonations.filter(d => getDonationTime(d) >= cutoff);
        const previousDonations = userDonations.filter(d => getDonationTime(d) < cutoff);

        const renderDonationItem = (donation, container) => {
            const item = document.createElement('div');
            item.className = 'donation-item';
            const dateObj = donation.date ? new Date(donation.date) : null;
            const dateText = dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : '—';
            item.innerHTML = `
                <div class="donation-info">
                    <h4>${donation.caseTitle}</h4>
                    <p class="donation-amount">${currencyConverter.getSymbol(donation.currency || 'USD')}${donation.amount}</p>
                    <p class="donation-date">${dateText}</p>
                </div>
                <span class="donation-status completed">Completed</span>
            `;
            container.appendChild(item);
        };

        if (recentDonations.length === 0) {
            donationsList.innerHTML = `
                <div class="empty-state">
                    <p>No donations in the last 24 hours.</p>
                </div>
            `;
        } else {
            recentDonations
                .sort((a, b) => getDonationTime(b) - getDonationTime(a))
                .forEach(d => renderDonationItem(d, donationsList));
        }

        if (donationsHistoryList) {
            if (previousDonations.length === 0) {
                donationsHistoryList.innerHTML = `
                    <div class="empty-state">
                        <p>No previous cases yet.</p>
                    </div>
                `;
            } else {
                previousDonations
                    .sort((a, b) => getDonationTime(b) - getDonationTime(a))
                    .forEach(d => renderDonationItem(d, donationsHistoryList));
            }
        }

        // Add listener for the Donate Now button
        const donateNowBtn = document.getElementById('dashboard-donate-now-btn');
        if (donateNowBtn) {
            // Remove existing listener if any (by replacing the button or using a named function, 
            // but for simplicity here we'll just check if it already has the listener logic)
            donateNowBtn.onclick = () => {
                closeDashboard();
                const target = document.getElementById('live-cases');
                if (target) {
                    // Smooth scroll to the live emergencies section
                    target.scrollIntoView({ behavior: 'smooth' });
                    
                    // Highlight the section briefly
                    target.style.transition = 'background-color 0.5s';
                    const originalBg = target.style.backgroundColor;
                    target.style.backgroundColor = 'rgba(236, 72, 153, 0.05)';
                    setTimeout(() => {
                        target.style.backgroundColor = originalBg;
                    }, 2000);
                }
            };
        }
    };

    // Display pending requests for staff review
    window.displayPendingRequests = () => {
        const staffPendingList = document.getElementById('staff-pending-requests-list');
        if (!staffPendingList) return;

        const allRequests = JSON.parse(localStorage.getItem('pulserelief_emergency_requests')) || [];
        const pendingRequests = allRequests.filter(req => req.status === 'pending');
        
        staffPendingList.innerHTML = '';
        
        if (pendingRequests.length === 0) {
            staffPendingList.innerHTML = `
                <div class="empty-state">
                    <p>No pending emergency requests to review.</p>
                </div>
            `;
            return;
        }

        pendingRequests.sort((a, b) => {
            const aMeta = getCriticalMeta(a);
            const bMeta = getCriticalMeta(b);

            if (aMeta.isCritical !== bMeta.isCritical) {
                return aMeta.isCritical ? -1 : 1;
            }

            const aDue = a.neededBy ? Number(a.neededBy) : Infinity;
            const bDue = b.neededBy ? Number(b.neededBy) : Infinity;
            if (aDue !== bDue) return aDue - bDue;

            return (b.timestamp || 0) - (a.timestamp || 0);
        });

        pendingRequests.forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.className = 'request-item';

            const meta = getCriticalMeta(request);
            const urgencyText = meta.neededWithinHours
                ? `Needed within ${meta.neededWithinHours} hour(s)`
                : '';

            const criticalBadge = meta.isCritical
                ? `<span class="urgency-badge critical">CRITICAL</span>`
                : '';

            if (meta.isCritical) requestElement.classList.add('critical');
            requestElement.innerHTML = `
                <div class="request-info">
                    <h4>${request.userName}: ${request.type} ${criticalBadge}</h4>
                    <p class="request-amount">$${request.amount} requested</p>
                    ${urgencyText ? `<p class="request-date"><strong>${urgencyText}</strong></p>` : ''}
                    <p class="request-location">${request.location}</p>
                    <p class="request-description"><strong>Description:</strong> ${request.description}</p>
                    <p class="request-verifier"><strong>Verifier:</strong> ${request.verifier}</p>
                    <p class="request-date"><strong>Submitted:</strong> ${request.submittedDate}</p>
                </div>
                <div class="request-actions">
                    <button class="btn secondary" type="button" data-action="view-details" data-request-id="${request.id}">View Details</button>
                    <button class="btn secondary" type="button" data-action="reject" data-request-id="${request.id}">Reject</button>
                    <button class="btn primary" type="button" data-action="approve" data-request-id="${request.id}">Approve</button>
                </div>
            `;
            staffPendingList.appendChild(requestElement);
        });
    };

    const openStaffRequestDetails = (requestId) => {
        const modal = document.getElementById('staff-request-details-modal');
        if (!modal) return;

        const allRequests = JSON.parse(localStorage.getItem('pulserelief_emergency_requests')) || [];
        const req = allRequests.find(r => r.id === requestId);
        if (!req) {
            alert('Request not found. It may have been updated or removed.');
            return;
        }

        const meta = typeof getCriticalMeta === 'function' ? getCriticalMeta(req) : { isCritical: false, neededWithinHours: null };
        const urgencyText = meta && meta.neededWithinHours
            ? `Needed within ${meta.neededWithinHours} hour(s)`
            : '—';

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = (value === null || value === undefined || value === '') ? '—' : String(value);
        };

        const subtitle = document.getElementById('staff-request-details-subtitle');
        if (subtitle) {
            subtitle.textContent = meta && meta.isCritical
                ? 'Critical request — requires priority review.'
                : 'Review details before approving or rejecting.';
        }

        setText('staff-request-details-requester', req.userName);
        setText('staff-request-details-email', req.userEmail);
        setText('staff-request-details-type', req.type);
        setText('staff-request-details-location', req.location);
        setText('staff-request-details-amount', req.amount ? `$${req.amount}` : '—');
        setText('staff-request-details-urgency', urgencyText);
        setText('staff-request-details-status', req.status);
        setText('staff-request-details-submitted', req.submittedDate);
        setText('staff-request-details-description', req.description);
        setText('staff-request-details-verifier', req.verifier);

        const aiStatusEl = document.getElementById('staff-request-details-ai-status');
        const aiTextEl = document.getElementById('staff-request-details-ai-text');

        if (req.aiVerification) {
            if (aiStatusEl) {
                const score = req.aiVerification.trustScore || 0;
                let color = '#ef4444'; // low
                if (score >= 80) color = '#22c55e'; // high
                else if (score >= 60) color = '#f59e0b'; // medium
                
                aiStatusEl.innerHTML = `<span style="color: ${color}; font-weight: bold;">${score}% Trust Score</span> (${req.aiVerification.documentType || 'Unknown'})`;
            }
            if (aiTextEl) {
                aiTextEl.style.display = 'block';
                aiTextEl.textContent = req.aiVerification.extractedText || 'No text extracted.';
            }
        } else {
            if (aiStatusEl) aiStatusEl.textContent = 'Not Verified / No AI Data';
            if (aiTextEl) {
                aiTextEl.style.display = 'none';
                aiTextEl.textContent = '';
            }
        }

        const filesText = (req.files && req.files.length) ? req.files.join(', ') : '—';
        setText('staff-request-details-files', filesText);

        const gallery = document.getElementById('staff-request-details-proof-gallery');
        if (gallery) {
            gallery.innerHTML = '';
            const photos = Array.isArray(req.proofPhotos) ? req.proofPhotos : [];
            const validPhotos = photos.filter(p => p && p.dataUrl);

            if (validPhotos.length === 0) {
                gallery.innerHTML = '<p class="request-date">No preview available.</p>';
            } else {
                validPhotos.forEach((p) => {
                    const item = document.createElement('div');
                    item.className = 'proof-thumb';
                    item.setAttribute('role', 'button');
                    item.setAttribute('tabindex', '0');
                    item.setAttribute('data-proof-src', p.dataUrl);
                    item.setAttribute('data-proof-name', p.name || 'Proof photo');
                    item.innerHTML = `<img src="${p.dataUrl}" alt="${(p.name || 'Proof photo').replace(/\"/g, '')}">`;
                    gallery.appendChild(item);
                });
            }
        }

        const runAiVerification = async () => {
            try {
                const photos = Array.isArray(req.proofPhotos) ? req.proofPhotos : [];
                const first = photos.find(p => p && p.dataUrl);
                if (!first || !first.dataUrl) {
                    if (aiStatusEl) aiStatusEl.textContent = 'No proof photo available.';
                    return;
                }

                const cacheKey = `pulserelief_ai_verification_${requestId}`;
                const cachedRaw = localStorage.getItem(cacheKey);
                if (cachedRaw) {
                    const cached = JSON.parse(cachedRaw);
                    if (cached && cached.status) {
                        if (aiStatusEl) aiStatusEl.textContent = cached.status;
                        if (aiTextEl && cached.text) aiTextEl.textContent = cached.text;
                        return;
                    }
                }

                if (aiStatusEl) aiStatusEl.textContent = 'Verifying…';

                const resp = await fetch('/api/verify/document', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image: first.dataUrl,
                        mimeType: first.type || 'image/png'
                    })
                });

                const json = await resp.json().catch(() => ({}));
                if (!json || json.success !== true) {
                    if (aiStatusEl) aiStatusEl.textContent = 'Verification failed.';
                    return;
                }

                if (json.configured === false) {
                    const msg = json.message || 'AI verification not configured.';
                    if (aiStatusEl) aiStatusEl.textContent = 'Not configured';
                    if (aiTextEl) aiTextEl.textContent = msg;
                    localStorage.setItem(cacheKey, JSON.stringify({ status: 'Not configured', text: msg }));
                    return;
                }

                const extractedText = (json.data && typeof json.data.text === 'string') ? json.data.text : '';
                const normalizedText = extractedText ? extractedText.slice(0, 4000) : '';

                const isVerified = Boolean(json.data && json.data.verified);
                const reasonsArr = Array.isArray(json.data && json.data.reasons) ? json.data.reasons : [];
                const reasonsText = reasonsArr.length ? `\n\nReasons: ${reasonsArr.join(', ')}` : '';

                const status = isVerified
                    ? 'Verified'
                    : (extractedText ? 'Needs review' : 'No text detected');

                if (aiStatusEl) aiStatusEl.textContent = status;
                if (aiTextEl) aiTextEl.textContent = (normalizedText || '—') + (isVerified ? '' : reasonsText);

                localStorage.setItem(cacheKey, JSON.stringify({ status, text: (normalizedText || '') + (isVerified ? '' : reasonsText) }));
            } catch (e) {
                if (aiStatusEl) aiStatusEl.textContent = 'Verification error.';
            }
        };

        runAiVerification();

        modal.setAttribute('aria-hidden', 'false');
    };

    const proofImageModal = document.getElementById('proof-image-modal');
    const proofImagePreview = document.getElementById('proof-image-preview');
    const staffDetailsBody = document.getElementById('staff-request-details-body');

    if (staffDetailsBody && !staffDetailsBody.__hasProofPreviewHandler) {
        staffDetailsBody.__hasProofPreviewHandler = true;
        staffDetailsBody.addEventListener('click', (e) => {
            const target = e.target.closest('[data-proof-src]');
            if (!target) return;
            const src = target.getAttribute('data-proof-src');
            const name = target.getAttribute('data-proof-name') || 'Proof photo';
            if (!src || !proofImageModal || !proofImagePreview) return;

            proofImagePreview.src = src;
            proofImagePreview.alt = name;
            const title = document.getElementById('proof-image-title');
            if (title) title.textContent = name;
            proofImageModal.setAttribute('aria-hidden', 'false');
        });
    }

    const staffPendingListEl = document.getElementById('staff-pending-requests-list');
    if (staffPendingListEl && !staffPendingListEl.__hasPendingRequestHandlers) {
        staffPendingListEl.__hasPendingRequestHandlers = true;
        staffPendingListEl.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action][data-request-id]');
            if (!btn) return;
            const action = btn.getAttribute('data-action');
            const requestId = btn.getAttribute('data-request-id');
            if (!action || !requestId) return;

            if (action === 'view-details') {
                openStaffRequestDetails(requestId);
                return;
            }

            if (action === 'approve') {
                window.handleEmergencyRequest(requestId, 'approved');
                return;
            }

            if (action === 'reject') {
                window.handleEmergencyRequest(requestId, 'rejected');
                return;
            }
        });
    }

    // Handle emergency request action (Approve/Reject)
    window.handleEmergencyRequest = (requestId, newStatus) => {
        const allRequests = JSON.parse(localStorage.getItem('pulserelief_emergency_requests')) || [];
        const requestIndex = allRequests.findIndex(req => req.id === requestId);
        
        if (requestIndex !== -1) {
            allRequests[requestIndex].status = newStatus;
            localStorage.setItem('pulserelief_emergency_requests', JSON.stringify(allRequests));
            
            alert(`Request ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully!`);
            
            // Refresh views
            displayPendingRequests();
            if (typeof displayMyRequests === 'function') displayMyRequests();
            if (typeof renderMainCaseGrid === 'function') renderMainCaseGrid();
            if (typeof displayStaffActiveCases === 'function') displayStaffActiveCases();
        }
    };

    // Display partner requests in staff dashboard
    const displayPartnerRequests = () => {
        const partnerRequestsList = document.getElementById('partner-requests-list');
        if (!partnerRequestsList) return;
        
        // Get requests from localStorage
        const partnerRequests = JSON.parse(localStorage.getItem('partnerRequests')) || [];
        
        // Clear current list
        partnerRequestsList.innerHTML = '';
        
        if (partnerRequests.length === 0) {
            partnerRequestsList.innerHTML = `
                <div class="empty-state">
                    <p>No partner requests yet</p>
                </div>
            `;
            return;
        }
        
        // Sort by timestamp (newest first)
        partnerRequests.sort((a, b) => b.timestamp - a.timestamp);
        
        // Display each request
        partnerRequests.forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.className = 'request-item';
            requestElement.innerHTML = `
                <div class="request-info">
                    <h4>${request.org}</h4>
                    <p class="request-type">${request.type}</p>
                    <p class="request-email"><strong>📧 Email:</strong> ${request.email}</p>
                    <p class="request-region"><strong>🌍 Region:</strong> ${request.region}</p>
                    <p class="request-description"><strong>📝 Description:</strong> ${request.description}</p>
                    <p class="request-date"><strong>📅 Submitted:</strong> ${request.submittedDate}</p>
                    <p class="request-status"><span class="status-badge status-${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span></p>
                </div>
                <div class="request-actions">
                    <button class="btn secondary" data-action="view-partner-details" data-request-id="${request.id}">View Details</button>
                    ${request.status === 'pending' ? `
                        <button class="btn primary" data-action="approve-partner" data-request-id="${request.id}">Approve</button>
                        <button class="btn danger" data-action="reject-partner" data-request-id="${request.id}">Reject</button>
                    ` : ''}
                </div>
            `;
            partnerRequestsList.appendChild(requestElement);
        });

        // Add event listener for partner requests list if not already added
        if (!partnerRequestsList.__hasHandlers) {
            partnerRequestsList.__hasHandlers = true;
            partnerRequestsList.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-action]');
                if (!btn) return;

                const action = btn.getAttribute('data-action');
                const requestId = btn.getAttribute('data-request-id');

                if (action === 'view-partner-details') {
                    openPartnerDetails(requestId);
                } else if (action === 'approve-partner') {
                    window.approvePartnerRequest(requestId);
                } else if (action === 'reject-partner') {
                    window.rejectPartnerRequest(requestId);
                }
            });
        }
    };
    
    // Open partner request details in modal
    const openPartnerDetails = (requestId) => {
        const modal = document.getElementById('partner-details-modal');
        if (!modal) return;

        const partnerRequests = JSON.parse(localStorage.getItem('partnerRequests')) || [];
        const request = partnerRequests.find(r => r.id === requestId);
        if (!request) return;

        // Populate modal
        document.getElementById('partner-details-org').textContent = request.org || '—';
        document.getElementById('partner-details-type').textContent = request.type || '—';
        document.getElementById('partner-details-email').textContent = request.email || '—';
        document.getElementById('partner-details-region').textContent = request.region || '—';
        document.getElementById('partner-details-status').textContent = request.status || '—';
        document.getElementById('partner-details-submitted').textContent = request.submittedDate || '—';
        document.getElementById('partner-details-description').textContent = request.description || '—';

        // Show/hide approve button based on status
        const approveBtn = document.getElementById('partner-approve-btn');
        if (approveBtn) {
            approveBtn.style.display = request.status === 'pending' ? 'block' : 'none';
            // Update onclick for approve button in modal
            approveBtn.onclick = () => {
                window.approvePartnerRequest(requestId);
                modal.setAttribute('aria-hidden', 'true');
            };
        }

        modal.setAttribute('aria-hidden', 'false');
    };
    
    // Approve partner request
    window.approvePartnerRequest = (requestId) => {
        const partnerRequests = JSON.parse(localStorage.getItem('partnerRequests')) || [];
        const requestIndex = partnerRequests.findIndex(r => r.id === requestId);
        
        if (requestIndex !== -1) {
            partnerRequests[requestIndex].status = 'approved';
            localStorage.setItem('partnerRequests', JSON.stringify(partnerRequests));
            alert(`✅ Partner request approved! Sandbox access email will be sent to ${partnerRequests[requestIndex].email}`);
            displayPartnerRequests();
        }
    };
    
    // Reject partner request
    window.rejectPartnerRequest = (requestId) => {
        if (confirm('Are you sure you want to reject this partner request?')) {
            const partnerRequests = JSON.parse(localStorage.getItem('partnerRequests')) || [];
            const requestIndex = partnerRequests.findIndex(r => r.id === requestId);
            
            if (requestIndex !== -1) {
                partnerRequests[requestIndex].status = 'rejected';
                localStorage.setItem('partnerRequests', JSON.stringify(partnerRequests));
                alert(`❌ Partner request rejected. Notification will be sent to ${partnerRequests[requestIndex].email}`);
                displayPartnerRequests();
            }
        }
    };
    
    // Bank details form submission
    if (bankDetailsForm) {
        bankDetailsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const accountNumber = document.getElementById('account-number').value;
            const routingNumber = document.getElementById('routing-number').value;
            
            // In a real application, we would encrypt these values before sending to server
            // For this demo, we'll just show a success message
            alert('Bank details saved successfully! In a real application, these details would be securely encrypted and stored.');
            
            // In a real implementation, you would use proper encryption like:
            // 1. Client-side encryption before sending to server
            // 2. Secure server-side storage
            // 3. Proper access controls
        });
    }
    
    // Staff settings form submission
    const staffSettingsForm = document.getElementById('staff-settings-form');
    if (staffSettingsForm) {
        staffSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Staff settings saved successfully!');
        });
    }
    
    // Back Button Functionality
    const dashboardBack = document.getElementById('dashboard-back');
    if (dashboardBack) {
        dashboardBack.addEventListener('click', () => {
            // Go back to admin overview
            const adminNav = document.getElementById('admin-nav');
            if (adminNav && adminNav.style.display === 'flex') {
                showView('admin-overview');
                const navItems = adminNav.querySelectorAll('.nav-item');
                navItems.forEach(item => {
                    if (item.getAttribute('data-view') === 'admin-overview') {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
                dashboardBack.style.display = 'none';
            }
        });
    }
    
    // Update handleNavClick to show back button for non-overview pages
    const originalHandleNavClick = handleNavClick;
    window.handleNavClick = function() {
        const view = this.getAttribute('data-view');
        if (currentUserType === 'admin' && view !== 'admin-overview' && view !== 'logout') {
            dashboardBack.style.display = 'block';
        } else if (currentUserType === 'admin' && (view === 'admin-overview' || view === 'logout')) {
            dashboardBack.style.display = 'none';
        }
        originalHandleNavClick.call(this);
    };
    
    // Quick action button for adding staff
    const adminAddStaffBtn = document.getElementById('admin-add-staff-btn');
    if (adminAddStaffBtn) {
        adminAddStaffBtn.addEventListener('click', () => {
            const createStaffTab = document.querySelector('[data-view="create-staff"]');
            if (createStaffTab) {
                createStaffTab.click();
            }
        });
    }
    
    // Event listeners for the overlay and close button
    dashboardOverlay.addEventListener('click', closeDashboard);
    dashboardClose.addEventListener('click', closeDashboard);
    
    // Admin Dashboard Functions
    
    // Display active cases for staff
    window.displayStaffActiveCases = () => {
        const staffActiveList = document.getElementById('staff-active-cases-list');
        if (!staffActiveList) return;

        const staffActiveHistoryList = document.getElementById('staff-active-cases-history-list');

        const allRequests = JSON.parse(localStorage.getItem('pulserelief_emergency_requests')) || [];
        const activeRequests = allRequests.filter(req => req.status === 'approved');
        
        // Keep the hardcoded ones for demo
        const hardcodedCases = `
            <div class="case-item">
                <div class="case-info">
                    <h4>Emergency surgery for road accident victim</h4>
                    <p class="case-category">Medical • ICU</p>
                    <p class="case-location">Nairobi, Kenya</p>
                    <div class="case-progress">
                        <div class="progress-bar"><span style="width: 62%"></span></div>
                        <div class="progress-meta">
                            <span>$6,200 of $10,000</span>
                            <span>62% funded</span>
                        </div>
                    </div>
                </div>
                <div class="case-actions">
                    <button class="btn secondary">View Details</button>
                    <button class="btn primary">Update</button>
                </div>
                <div class="case-timeline">
                    <div class="timeline-step completed"><div class="step-dot"></div><span class="step-label">Submitted</span></div>
                    <div class="timeline-step completed"><div class="step-dot"></div><span class="step-label">Verified</span></div>
                    <div class="timeline-step active"><div class="step-dot"></div><span class="step-label">Funded</span></div>
                    <div class="timeline-step"><div class="step-dot"></div><span class="step-label">Resolved</span></div>
                </div>
            </div>
            <div class="case-item">
                <div class="case-info">
                    <h4>Clean water & shelter kits after flash floods</h4>
                    <p class="case-category">Disaster relief • Floods</p>
                    <p class="case-location">Assam, India</p>
                    <div class="case-progress">
                        <div class="progress-bar"><span style="width: 44%"></span></div>
                        <div class="progress-meta">
                            <span>$8,800 of $20,000</span>
                            <span>44% funded</span>
                        </div>
                    </div>
                </div>
                <div class="case-actions">
                    <button class="btn secondary">View Details</button>
                    <button class="btn primary">Update</button>
                </div>
                <div class="case-timeline">
                    <div class="timeline-step completed"><div class="step-dot"></div><span class="step-label">Submitted</span></div>
                    <div class="timeline-step active"><div class="step-dot"></div><span class="step-label">Verified</span></div>
                    <div class="timeline-step"><div class="step-dot"></div><span class="step-label">Funded</span></div>
                    <div class="timeline-step"><div class="step-dot"></div><span class="step-label">Resolved</span></div>
                </div>
            </div>
        `;

        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const recentCases = activeRequests.filter(r => Number(r.timestamp || 0) >= cutoff);
        const previousCases = activeRequests.filter(r => Number(r.timestamp || 0) < cutoff);

        const sortCases = (arr) => arr.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        sortCases(recentCases);
        sortCases(previousCases);

        const renderCasesHtml = (casesArr) => casesArr.map((req) => {
            const raised = req.raisedAmount || 0;
            const target = req.amount || 0;
            const percent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;

            return `
                <div class="case-item">
                    <div class="case-info">
                        <h4>${req.type} Help for ${req.userName}</h4>
                        <p class="case-category">${req.type}</p>
                        <p class="case-location">${req.location}</p>
                        <div class="case-progress">
                            <div class="progress-bar"><span style="width: ${percent}%"></span></div>
                            <div class="progress-meta">
                                <span>$${raised.toLocaleString()} of $${target.toLocaleString()}</span>
                                <span>${percent}% funded</span>
                            </div>
                        </div>
                        <p class="request-description"><strong>Description:</strong> ${req.description}</p>
                        <p class="request-date"><strong>Approved:</strong> ${req.submittedDate}</p>
                    </div>
                    <div class="case-actions">
                        <button class="btn secondary">View Details</button>
                        <button class="btn primary">Update</button>
                    </div>
                    <div class="case-timeline">
                        <div class="timeline-step completed"><div class="step-dot"></div><span class="step-label">Submitted</span></div>
                        <div class="timeline-step completed"><div class="step-dot"></div><span class="step-label">Verified</span></div>
                        <div class="timeline-step ${percent > 0 ? 'active' : ''}"><div class="step-dot"></div><span class="step-label">Funded</span></div>
                        <div class="timeline-step"><div class="step-dot"></div><span class="step-label">Resolved</span></div>
                    </div>
                </div>
            `;
        }).join('');

        staffActiveList.innerHTML = '';
        if (staffActiveHistoryList) staffActiveHistoryList.innerHTML = '';

        if (recentCases.length === 0) {
            staffActiveList.innerHTML = hardcodedCases;
        } else {
            staffActiveList.innerHTML = renderCasesHtml(recentCases);
        }

        if (staffActiveHistoryList) {
            if (previousCases.length === 0) {
                staffActiveHistoryList.innerHTML = `
                    <div class="empty-state">
                        <p>No previous cases yet.</p>
                    </div>
                `;
            } else {
                staffActiveHistoryList.innerHTML = renderCasesHtml(previousCases);
            }
        }
    };
    
    // Display users
    const displayUsers = () => {
        const usersList = document.getElementById('users-list');
        if (!usersList) return;

        const users = (authSystem && authSystem.users) ? authSystem.users : [];

        if (users.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <p>No users found yet. Create a user account to see it listed here.</p>
                </div>
            `;
            return;
        }

        usersList.innerHTML = [...users]
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 20)
            .map(u => {
                const country = u.country || '—';
                const donations = u.donations || 0;
                const status = u.status || 'active';

                return `
                    <div class="user-card">
                        <div class="user-info">
                            <h4>${u.name || 'User'}</h4>
                            <p class="user-email">${u.email || ''}</p>
                            <p class="user-country">${country}</p>
                            <p class="user-country">Joined: ${u.joinDate || '—'}</p>
                        </div>
                        <div class="user-stats">
                            <div class="stat"><span class="value">${donations}</span><span class="label">Donations</span></div>
                            <div class="stat"><span class="value">${status}</span><span class="label">Status</span></div>
                        </div>
                        <div class="user-status ${status === 'active' ? 'verified' : 'pending'}">${status === 'active' ? '✓ Active' : '⏳ ' + status}</div>
                    </div>
                `;
            })
            .join('');
    };
    
    // Display cases
    const displayCases = () => {
        const casesList = document.getElementById('cases-list');
        if (!casesList) return;

        const allRequests = JSON.parse(localStorage.getItem('pulserelief_emergency_requests')) || [];

        if (allRequests.length === 0) {
            casesList.innerHTML = `
                <div class="empty-state">
                    <p>No cases/requests yet. Submit an emergency request to see it listed here.</p>
                </div>
            `;
            return;
        }

        const items = [...allRequests]
            .sort((a, b) => {
                const aMeta = getCriticalMeta(a);
                const bMeta = getCriticalMeta(b);

                if (aMeta.isCritical !== bMeta.isCritical) {
                    return aMeta.isCritical ? -1 : 1;
                }

                const aDue = a.neededBy ? Number(a.neededBy) : Infinity;
                const bDue = b.neededBy ? Number(b.neededBy) : Infinity;
                if (aDue !== bDue) return aDue - bDue;

                return (b.timestamp || 0) - (a.timestamp || 0);
            })
            .slice(0, 20)
            .map(r => {
                const raised = r.raisedAmount || 0;
                const target = r.amount || 0;
                const percent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
                const status = r.status || 'pending';
                const statusClass = status === 'approved' ? 'active' : (status === 'rejected' ? 'rejected' : 'pending');

                const meta = getCriticalMeta(r);
                const urgencyText = meta.neededWithinHours
                    ? `Needed within ${meta.neededWithinHours} hour(s)`
                    : '';

                const criticalBadge = meta.isCritical
                    ? `<span class="urgency-badge critical">CRITICAL</span>`
                    : '';

                return `
                    <div class="case-card">
                        <div class="case-header">
                            <h4>${r.type || 'Emergency'} - ${r.location || 'Unknown location'} ${criticalBadge}</h4>
                            <span class="status-badge ${statusClass}">${status}</span>
                        </div>
                        <div class="case-details">
                            <p class="detail-item"><strong>Requester:</strong> ${r.userName || 'Anonymous'}</p>
                            <p class="detail-item"><strong>Email:</strong> ${r.userEmail || '—'}</p>
                            ${urgencyText ? `<p class="detail-item"><strong>${urgencyText}</strong></p>` : ''}
                            <p class="detail-item"><strong>Submitted:</strong> ${r.submittedDate || '—'}</p>
                            <p class="detail-item"><strong>Description:</strong> ${r.description || '—'}</p>
                        </div>
                        <div class="case-funding">
                            <div class="funding-bar"><span style="width: ${percent}%"></span></div>
                            <p class="funding-text">$${raised.toLocaleString()} of $${target.toLocaleString()} (${percent}% funded)</p>
                        </div>
                        <button class="btn primary" onclick="window.adminViewCaseDetails('${r.id || ''}')">View Details</button>
                    </div>
                `;
            })
            .join('');

        casesList.innerHTML = items;
    };

    // ===== ADMIN ACTION HANDLERS (Buttons must work) =====
    const ADMIN_SETTINGS_KEY = 'pulserelief_admin_settings';

    const getAdminSettings = () => {
        return JSON.parse(localStorage.getItem(ADMIN_SETTINGS_KEY)) || {
            platformName: 'PulseRelief',
            supportEmail: 'support@pulserelief.org',
            maxCases: 100,
            reviewTime: 30
        };
    };

    const setAdminSettings = (settings) => {
        localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
    };

    const applyAdminSettingsToForm = () => {
        const form = document.getElementById('admin-settings-form');
        if (!form) return;
        const settings = getAdminSettings();

        const platformName = document.getElementById('platform-name');
        const supportEmail = document.getElementById('support-email');
        const maxCases = document.getElementById('max-cases');
        const reviewTime = document.getElementById('case-review-time');

        if (platformName) platformName.value = settings.platformName || '';
        if (supportEmail) supportEmail.value = settings.supportEmail || '';
        if (maxCases) maxCases.value = settings.maxCases ?? 100;
        if (reviewTime) reviewTime.value = settings.reviewTime ?? 30;
    };

    const setActiveAdminNav = (viewName) => {
        const adminNav = document.getElementById('admin-nav');
        if (!adminNav) return;
        const navItems = adminNav.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-view') === viewName);
        });
    };

    window.adminEditStaff = (staffId) => {
        if (!authSystem || authSystem.currentUserType !== 'admin') return;
        const staff = authSystem.getStaffMember(staffId);
        if (!staff) {
            alert('Staff member not found');
            return;
        }

        const name = prompt('Full name:', staff.name || '');
        if (name === null) return;
        const email = prompt('Email:', staff.email || '');
        if (email === null) return;
        const role = prompt('Role (reviewer/manager/support/admin):', staff.role || 'staff');
        if (role === null) return;
        const department = prompt('Department:', staff.department || '');
        if (department === null) return;
        const status = prompt('Status (active/inactive):', staff.status || 'active');
        if (status === null) return;

        const result = authSystem.updateStaffMember(staffId, {
            name: name.trim(),
            email: email.trim(),
            role: role.trim(),
            department: department.trim(),
            status: status.trim()
        });

        if (!result.success) {
            alert(result.message || 'Failed to update staff');
            return;
        }

        displayStaffMembers();
        updateAdminOverview();
        alert('Staff updated');
    };

    window.adminResetStaffPassword = (staffId) => {
        if (!authSystem || authSystem.currentUserType !== 'admin') return;
        const staff = authSystem.getStaffMember(staffId);
        if (!staff) {
            alert('Staff member not found');
            return;
        }

        const newPassword = prompt(`Set a new password for ${staff.email}:`, '');
        if (!newPassword) return;
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        const result = authSystem.updateStaffMember(staffId, {
            password: authSystem.hashPassword(newPassword)
        });

        if (!result.success) {
            alert(result.message || 'Failed to reset password');
            return;
        }

        alert('Password reset successfully');
    };

    window.adminRemoveStaff = (staffId) => {
        if (!authSystem || authSystem.currentUserType !== 'admin') return;
        const staff = authSystem.getStaffMember(staffId);
        if (!staff) {
            alert('Staff member not found');
            return;
        }

        if (!confirm(`Remove staff member ${staff.email}?`)) return;

        const result = authSystem.deleteStaffMember(staffId);
        if (!result.success) {
            alert(result.message || 'Failed to remove staff');
            return;
        }

        displayStaffMembers();
        updateAdminOverview();
        alert('Staff removed');
    };

    window.adminViewCaseDetails = (caseId) => {
        const allRequests = JSON.parse(localStorage.getItem('pulserelief_emergency_requests')) || [];
        const req = allRequests.find(r => String(r.id) === String(caseId));

        if (!req) {
            alert('Case not found');
            return;
        }

        const raised = req.raisedAmount || 0;
        const target = req.amount || 0;
        const status = req.status || 'pending';

        const details = [
            `Type: ${req.type || '—'}`,
            `Location: ${req.location || '—'}`,
            `Requester: ${req.userName || 'Anonymous'} (${req.userEmail || '—'})`,
            `Submitted: ${req.submittedDate || '—'}`,
            `Status: ${status}`,
            `Funding: $${raised.toLocaleString()} / $${target.toLocaleString()}`,
            `Description: ${req.description || '—'}`
        ].join('\n');

        const action = prompt(`${details}\n\nActions: type APPROVE / REJECT / CLOSE (or Cancel)`, '');
        if (!action) return;

        const normalized = action.trim().toLowerCase();
        let newStatus = null;
        if (normalized === 'approve') newStatus = 'approved';
        if (normalized === 'reject') newStatus = 'rejected';
        if (normalized === 'close') newStatus = 'closed';

        if (!newStatus) {
            alert('Unknown action. Use APPROVE / REJECT / CLOSE');
            return;
        }

        const idx = allRequests.findIndex(r => String(r.id) === String(caseId));
        if (idx === -1) return;
        allRequests[idx].status = newStatus;
        localStorage.setItem('pulserelief_emergency_requests', JSON.stringify(allRequests));

        displayCases();
        updateAdminOverview();
        alert(`Case updated to: ${newStatus}`);
    };

    const downloadAdminReport = () => {
        const users = (authSystem && authSystem.users) ? authSystem.users : [];
        const staff = (authSystem && authSystem.staff) ? authSystem.staff : [];
        const requests = JSON.parse(localStorage.getItem('pulserelief_emergency_requests')) || [];
        const donations = JSON.parse(localStorage.getItem('pulserelief_donations')) || [];

        const lines = [];
        lines.push(['Metric', 'Value'].join(','));
        lines.push(['Users', users.length].join(','));
        lines.push(['Staff', staff.length].join(','));
        lines.push(['Requests', requests.length].join(','));
        lines.push(['Donations', donations.length].join(','));

        const csv = lines.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `pulserelief-admin-report-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    // Hook up admin quick actions + forms
    const adminViewCasesBtn = document.getElementById('admin-view-cases-btn');
    if (adminViewCasesBtn) {
        adminViewCasesBtn.addEventListener('click', () => {
            showView('admin-cases');
            setActiveAdminNav('admin-cases');
        });
    }

    const adminOpenSettingsBtn = document.getElementById('admin-open-settings-btn');
    if (adminOpenSettingsBtn) {
        adminOpenSettingsBtn.addEventListener('click', () => {
            applyAdminSettingsToForm();
            showView('admin-settings');
            setActiveAdminNav('admin-settings');
        });
    }

    const adminDownloadReportBtn = document.getElementById('admin-download-report-btn');
    if (adminDownloadReportBtn) {
        adminDownloadReportBtn.addEventListener('click', () => {
            downloadAdminReport();
        });
    }

    const createStaffForm = document.getElementById('create-staff-form');
    if (createStaffForm) {
        createStaffForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!authSystem || authSystem.currentUserType !== 'admin') {
                alert('Only admin can create staff');
                return;
            }

            const name = (document.getElementById('staff-full-name')?.value || '').trim();
            const email = (document.getElementById('staff-email')?.value || '').trim();
            const password = (document.getElementById('staff-password')?.value || '').trim();
            const role = (document.getElementById('staff-role')?.value || '').trim();
            const department = (document.getElementById('staff-department')?.value || '').trim();

            const result = authSystem.createStaffMember(name, email, password, role, department);
            if (!result.success) {
                alert(result.message || 'Failed to create staff');
                return;
            }

            createStaffForm.reset();
            showView('staff-management');
            setActiveAdminNav('staff-management');
            displayStaffMembers();
            updateAdminOverview();
            alert('Staff created successfully');
        });
    }

    const adminSettingsForm = document.getElementById('admin-settings-form');
    if (adminSettingsForm) {
        applyAdminSettingsToForm();
        adminSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const settings = {
                platformName: (document.getElementById('platform-name')?.value || '').trim(),
                supportEmail: (document.getElementById('support-email')?.value || '').trim(),
                maxCases: Number(document.getElementById('max-cases')?.value || 0),
                reviewTime: Number(document.getElementById('case-review-time')?.value || 0)
            };

            setAdminSettings(settings);
            alert('Settings saved');
        });
    }
    
    // Display analytics
    const displayAnalytics = () => {
        const analyticsDashboard = document.querySelector('.analytics-dashboard');
        if (!analyticsDashboard) return;

        const users = (authSystem && authSystem.users) ? authSystem.users : [];
        const staff = (authSystem && authSystem.staff) ? authSystem.staff : [];
        const allRequests = JSON.parse(localStorage.getItem('pulserelief_emergency_requests')) || [];
        const donations = JSON.parse(localStorage.getItem('pulserelief_donations')) || [];

        const totalDonationAmount = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        const approved = allRequests.filter(r => r.status === 'approved').length;
        const pending = allRequests.filter(r => r.status === 'pending').length;

        // Keep the existing cards layout, but make sure they show and reflect current data.
        const cards = analyticsDashboard.querySelectorAll('.analytics-card');
        cards.forEach(card => {
            card.style.display = '';
        });

        const impactGrid = analyticsDashboard.querySelector('.impact-grid');
        if (impactGrid) {
            impactGrid.innerHTML = `
                <div class="impact-item">
                    <span class="impact-value">${currencyConverter.getSymbol('USD')}${Math.round(totalDonationAmount).toLocaleString()}</span>
                    <span class="impact-label">Total Donations (demo)</span>
                </div>
                <div class="impact-item">
                    <span class="impact-value">${users.length}</span>
                    <span class="impact-label">Total Users</span>
                </div>
                <div class="impact-item">
                    <span class="impact-value">${approved}</span>
                    <span class="impact-label">Approved Cases</span>
                </div>
                <div class="impact-item">
                    <span class="impact-value">${pending}</span>
                    <span class="impact-label">Pending Reviews</span>
                </div>
            `;
        }
    };

    /* ===== NOTIFICATION SYSTEM LOGIC ===== */
    const createNotificationContainer = () => {
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    };

    window.showNotification = (options) => {
        const { title, message, type, icon = '🔔', duration = 5000, role = 'all' } = options;
        
        // Role filtering
        const currentUser = authSystem.currentUser;
        const currentUserType = authSystem.currentUserType;
        
        if (role !== 'all') {
            if (!currentUser) return; // Don't show role-specific notifs to guests
            if (role === 'staff' && currentUserType !== 'staff' && currentUserType !== 'admin') return;
            if (role === 'user' && currentUserType !== 'user') return;
        }

        const container = createNotificationContainer();
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        toast.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
                <span class="notification-time">${time}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        container.appendChild(toast);
        
        // Trigger entrance animation
        setTimeout(() => toast.classList.add('active'), 10);

        const closeToast = () => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 500);
        };

        toast.querySelector('.notification-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeToast();
        });

        toast.addEventListener('click', () => {
            // Optional: Click to open dashboard or specific view
            const dashboardToggle = document.getElementById('dashboard-toggle');
            if (dashboardToggle) dashboardToggle.click();
            closeToast();
        });

        if (duration > 0) {
            setTimeout(closeToast, duration);
        }
    };

    // Listen for storage events for cross-tab notifications
    window.addEventListener('storage', (e) => {
        if (e.key === 'pulserelief_notification_trigger') {
            const data = JSON.parse(e.newValue);
            if (data && data.timestamp > Date.now() - 2000) {
                window.showNotification(data.options);
            }
        }
    });

    window.triggerGlobalNotification = (options) => {
        // Show in current tab
        window.showNotification(options);
        
        // Trigger in other tabs
        localStorage.setItem('pulserelief_notification_trigger', JSON.stringify({
            options,
            timestamp: Date.now(),
            id: Math.random()
        }));
    };

    // Initialize dashboard session if user is logged in
    if (typeof initDashboardSession === 'function') {
        initDashboardSession();
    }

    /* ===== AFTER-ACTION REPORTS LOGIC ===== */
    const reportGrid = document.getElementById('impact-reports-grid');
    const reportCategorySwitch = document.getElementById('report-category-switch');

    const getJsPdfCtor = () => {
        // jsPDF UMD exposes window.jspdf.jsPDF
        if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
        // Some builds expose window.jsPDF
        if (window.jsPDF) return window.jsPDF;
        return null;
    };

    const ensureJsPdfLoaded = () => {
        const existing = getJsPdfCtor();
        if (existing) return Promise.resolve(existing);

        // Avoid injecting multiple times
        if (window.__pulsereliefJsPdfLoadingPromise) return window.__pulsereliefJsPdfLoadingPromise;

        window.__pulsereliefJsPdfLoadingPromise = new Promise((resolve, reject) => {
            const tryResolve = () => {
                const ctor = getJsPdfCtor();
                if (ctor) resolve(ctor);
            };

            tryResolve();

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.async = true;
            script.onload = () => {
                const ctor = getJsPdfCtor();
                if (ctor) {
                    resolve(ctor);
                } else {
                    reject(new Error('jsPDF loaded but constructor was not found'));
                }
            };
            script.onerror = () => reject(new Error('Failed to load jsPDF'));
            document.head.appendChild(script);
        });

        return window.__pulsereliefJsPdfLoadingPromise;
    };

    const downloadAfterActionReportPdf = async (report) => {
        let DocCtor;
        try {
            DocCtor = await ensureJsPdfLoaded();
        } catch (e) {
            alert('Unable to load the PDF generator. Please check your internet connection and try again.');
            return;
        }

        const doc = new DocCtor({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 48;
        const contentWidth = pageWidth - margin * 2;

        const safeText = (v) => (v === null || v === undefined) ? '' : String(v);
        const wrap = (text, maxWidth) => doc.splitTextToSize(safeText(text), maxWidth);

        const drawHeader = (pageNum) => {
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, pageWidth, 74, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text('PulseRelief', margin, 30);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text('After-Action Report', margin, 52);

            doc.setFontSize(9);
            doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 30, { align: 'right' });
            doc.text(`Page ${pageNum}`, pageWidth - margin, 52, { align: 'right' });
        };

        const drawSectionTitle = (label, y) => {
            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(label, margin, y);
            doc.setDrawColor(148, 163, 184);
            doc.setLineWidth(0.8);
            doc.line(margin, y + 6, margin + contentWidth, y + 6);
            return y + 22;
        };

        const drawKvRow = (label, value, y) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(15, 23, 42);
            doc.text(`${label}:`, margin, y);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 65, 85);
            const lines = wrap(value, contentWidth - 120);
            doc.text(lines, margin + 120, y);
            return y + Math.max(16, (lines.length * 14));
        };

        const ensureSpace = (y, needed) => {
            if (y + needed <= pageHeight - margin) return { y, page: doc.getCurrentPageInfo().pageNumber };
            doc.addPage();
            const pageNum = doc.getCurrentPageInfo().pageNumber;
            drawHeader(pageNum);
            return { y: 90, page: pageNum };
        };

        drawHeader(1);

        let y = 98;
        y = drawSectionTitle('Report Summary', y);

        y = drawKvRow('Category', safeText(report.type), y);
        y = drawKvRow('Title', safeText(report.title), y);
        y = drawKvRow('Report Date', safeText(report.date), y);
        y = drawKvRow('Funds Used', safeText(report.fundsUsed), y);
        y = drawKvRow('Impact Achieved', safeText(report.impact), y);

        ({ y } = ensureSpace(y, 40));
        y = drawSectionTitle('Achievement Summary', y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        const summaryLines = wrap(report.summary, contentWidth);
        doc.text(summaryLines, margin, y);
        y += Math.max(18, summaryLines.length * 14);

        ({ y } = ensureSpace(y, 40));
        y = drawSectionTitle('Full After-Action Detail', y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);

        const detailLines = wrap(report.details, contentWidth);
        const lineHeight = 14;
        let remaining = [...detailLines];
        while (remaining.length) {
            ({ y } = ensureSpace(y, 60));
            const availableLines = Math.floor((pageHeight - margin - y) / lineHeight);
            const chunk = remaining.splice(0, Math.max(1, availableLines));
            doc.text(chunk, margin, y);
            y += chunk.length * lineHeight;
        }

        ({ y } = ensureSpace(y, 54));
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - 66, pageWidth - margin, pageHeight - 66);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('Confidential — for donors, partners, and authorized stakeholders.', margin, pageHeight - 48);
        doc.text('© PulseRelief', pageWidth - margin, pageHeight - 48, { align: 'right' });

        const safeFile = safeText(report.title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .slice(0, 60) || 'after-action-report';
        const dateStamp = new Date().toISOString().slice(0, 10);
        doc.save(`pulserelief-${safeFile}-${dateStamp}.pdf`);
    };

    const sampleReports = [
        {
            id: 'report_1',
            type: 'Medical',
            title: 'Emergency Heart Surgery Success',
            date: 'Oct 15, 2025',
            fundsUsed: '$12,500',
            impact: 'Life Saved',
            summary: 'Funds covered the full surgical procedure and post-operative care at County Hospital. The patient has been discharged and is in stable condition.',
            details: 'The surgery was performed by a team of specialists. Contributions from 142 donors made this possible within 48 hours of request.'
        },
        {
            id: 'report_2',
            type: 'Disaster',
            title: 'Flood Relief: 500 Kits Distributed',
            date: 'Nov 02, 2025',
            fundsUsed: '$45,000',
            impact: '500 Families Helped',
            summary: 'Clean water filters, emergency food, and blankets were delivered to the most affected regions in Assam within 72 hours.',
            details: 'Partnered with Local NGO "Hope Assured" for last-mile delivery. Real-time GPS tracking confirmed all 500 kits reached registered families.'
        },
        {
            id: 'report_3',
            type: 'Education',
            title: 'University Tuition Crisis Resolved',
            date: 'Dec 12, 2025',
            fundsUsed: '$3,800',
            impact: 'Education Continued',
            summary: 'Direct disbursement to Cape Town University ensured the student remained enrolled for the final semester.',
            details: 'The funds covered tuition and textbook costs. The student is now on track to graduate in June 2026.'
        }
    ];

    const renderReports = (filter = 'all') => {
        if (!reportGrid) return;
        
        reportGrid.innerHTML = '';
        
        const filteredReports = filter === 'all' 
            ? sampleReports 
            : sampleReports.filter(r => r.type.toLowerCase() === filter);

        filteredReports.forEach(report => {
            const card = document.createElement('div');
            card.className = 'report-card';
            card.setAttribute('data-category', report.type.toLowerCase());
            
            card.innerHTML = `
                <div class="report-header">
                    <span class="report-badge">${report.type}</span>
                    <span class="report-date">${report.date}</span>
                </div>
                <h3 class="report-title">${report.title}</h3>
                <div class="impact-stats">
                    <div class="stat-item">
                        <span class="stat-value">${report.fundsUsed}</span>
                        <span class="stat-label">Funds Used</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${report.impact}</span>
                        <span class="stat-label">Impact Achieved</span>
                    </div>
                </div>
                <div class="report-details">
                    <h4>Achievement Summary</h4>
                    <p>${report.summary}</p>
                </div>
                <div class="report-footer">
                    <div class="view-full-report">
                        <span>📄 View Full After-Action Report</span>
                        <span>➡️</span>
                    </div>
                </div>
            `;
            
            card.querySelector('.view-full-report').addEventListener('click', () => {
                downloadAfterActionReportPdf(report);
            });

            reportGrid.appendChild(card);
        });
    };

    if (reportCategorySwitch) {
        reportCategorySwitch.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-category]');
            if (!btn) return;
            
            reportCategorySwitch.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            renderReports(btn.getAttribute('data-category'));
        });
    }

    // Initial render of reports
    renderReports();
});

// Geolocation function for emergency request form
function getCurrentLocation() {
    const locationInput = document.querySelector('input[name="location"]');
    const locationBtn = document.querySelector('.location-btn');
    
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    // Show loading state
    const originalText = locationBtn.innerHTML;
    locationBtn.innerHTML = '⏳ Getting location...';
    locationBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            try {
                // Use reverse geocoding to get city and country
                // Using a free service (nominatim) for demo purposes
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
                );
                const data = await response.json();
                
                if (data && data.address) {
                    const city = data.address.city || data.address.town || data.address.village || data.address.county;
                    const country = data.address.country;
                    
                    if (city && country) {
                        locationInput.value = `${city}, ${country}`;
                    } else {
                        locationInput.value = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                    }
                } else {
                    locationInput.value = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                }
            } catch (error) {
                console.error('Geocoding error:', error);
                locationInput.value = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
            }
            
            // Restore button state
            locationBtn.innerHTML = originalText;
            locationBtn.disabled = false;
        },
        (error) => {
            console.error('Geolocation error:', error);
            let errorMessage = 'Unable to get location. ';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Please allow location access in your browser settings.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out.';
                    break;
                default:
                    errorMessage += 'An unknown error occurred.';
            }
            
            alert(errorMessage);
            
            // Restore button state
            locationBtn.innerHTML = originalText;
            locationBtn.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Toggle extracted text visibility
function toggleExtractedText() {
    const extractedText = document.getElementById('extracted-text');
    const toggleArrow = document.querySelector('.toggle-arrow');
    
    if (extractedText.style.display === 'none') {
        extractedText.style.display = 'block';
        toggleArrow.classList.add('rotated');
    } else {
        extractedText.style.display = 'none';
        toggleArrow.classList.remove('rotated');
    }
}

// AI Document Verification using Google Cloud Vision API
async function verifyDocumentWithAI(file) {
    // Show verification panel
    const verificationPanel = document.getElementById('ai-verification-panel');
    const verificationBadge = document.getElementById('verification-status');
    verificationPanel.style.display = 'block';
    verificationBadge.className = 'verification-badge analyzing';
    verificationBadge.textContent = 'Analyzing...';
    
    try {
        const formData = new FormData();
        formData.append('document', file);
        
        // Call the real backend API
        const response = await fetch('/api/verify/document', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            const verificationData = {
                institution: result.extractedData.institution,
                amount: result.extractedData.amount,
                date: result.extractedData.date,
                documentType: result.extractedData.documentType,
                extractedText: result.data.text,
                trustScore: result.trustScore,
                warnings: result.data.reasons || []
            };
            
            latestVerificationResult = verificationData;
            
            // Update UI with real results from backend
            displayVerificationResults(verificationData);
        } else {
            throw new Error(result.message || 'Verification failed');
        }
        
    } catch (error) {
        console.error('Verification error:', error);
        verificationBadge.className = 'verification-badge failed';
        verificationBadge.textContent = 'Verification Failed';
        
        // Fallback to simulation if backend is not reachable during demo
        console.log('Falling back to simulation mode for demo...');
        const mockResult = simulateAIVerification(file.name);
        latestVerificationResult = mockResult;
        setTimeout(() => displayVerificationResults(mockResult), 1000);
    }
}

// Simulate AI verification results (replace with actual API call)
function simulateAIVerification(filename) {
    const isMedical = filename.toLowerCase().includes('medical') || filename.toLowerCase().includes('bill') || filename.toLowerCase().includes('receipt');
    const isInvoice = filename.toLowerCase().includes('invoice');
    
    // Simulate extracted data
    const institutions = ['City General Hospital', 'St. Mary Medical Center', 'Regional Emergency Clinic', 'University Hospital'];
    const amounts = [2500, 5800, 1200, 8900, 3400];
    const dates = ['2026-01-05', '2026-01-03', '2025-12-30', '2026-01-07'];
    
    const extractedData = {
        institution: institutions[Math.floor(Math.random() * institutions.length)],
        amount: amounts[Math.floor(Math.random() * amounts.length)],
        date: dates[Math.floor(Math.random() * dates.length)],
        documentType: isMedical ? 'Medical Bill' : isInvoice ? 'Invoice' : 'Receipt',
        extractedText: `MEDICAL RECEIPT

Date: ${dates[0]}
Patient ID: PT-${Math.floor(Math.random() * 10000)}

Services Rendered:
- Emergency Consultation: $500
- Laboratory Tests: $350
- Medical Imaging: $800
- Treatment & Medication: $850

Total Amount: $${amounts[0]}

Payment Status: Pending

This is a computer-generated document.`,
        trustScore: 85 + Math.floor(Math.random() * 15), // 85-100
        warnings: []
    };
    
    // Check for potential issues
    const today = new Date();
    const docDate = new Date(extractedData.date);
    const daysDiff = Math.floor((today - docDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 30) {
        extractedData.warnings.push('Document is older than 30 days');
        extractedData.trustScore -= 10;
    }
    
    if (extractedData.amount < 500) {
        extractedData.warnings.push('Amount seems low for typical medical emergency');
        extractedData.trustScore -= 5;
    }
    
    if (!isMedical && !isInvoice) {
        extractedData.warnings.push('Document type could not be clearly identified');
        extractedData.trustScore -= 15;
    }
    
    return extractedData;
}

// Display verification results in UI
function displayVerificationResults(result) {
    const verificationBadge = document.getElementById('verification-status');
    const trustScoreElement = document.getElementById('trust-score');
    
    // Update badge
    if (result.trustScore >= 80) {
        verificationBadge.className = 'verification-badge verified';
        verificationBadge.textContent = 'Verified';
        trustScoreElement.className = 'result-value trust-score high';
    } else if (result.trustScore >= 60) {
        verificationBadge.className = 'verification-badge warning';
        verificationBadge.textContent = 'Needs Review';
        trustScoreElement.className = 'result-value trust-score medium';
    } else {
        verificationBadge.className = 'verification-badge failed';
        verificationBadge.textContent = 'Low Confidence';
        trustScoreElement.className = 'result-value trust-score low';
    }
    
    // Update extracted data
    document.getElementById('extracted-institution').textContent = result.institution || 'Not detected';
    document.getElementById('extracted-amount').textContent = result.amount ? `$${result.amount.toLocaleString()}` : 'Not detected';
    document.getElementById('extracted-date').textContent = result.date || 'Not detected';
    document.getElementById('extracted-type').textContent = result.documentType || 'Unknown';
    trustScoreElement.textContent = `${result.trustScore}%`;
    
    // Show warnings if any
    const warningsDiv = document.getElementById('verification-warnings');
    if (result.warnings && result.warnings.length > 0) {
        warningsDiv.style.display = 'block';
        warningsDiv.innerHTML = `
            <strong>⚠️ Verification Warnings:</strong>
            <ul>
                ${result.warnings.map(warning => `<li>${warning}</li>`).join('')}
            </ul>
        `;
    } else {
        warningsDiv.style.display = 'none';
    }
    
    // Show extracted text
    if (result.extractedText) {
        const textSection = document.getElementById('extracted-text-section');
        const textArea = document.getElementById('extracted-text');
        if (textSection) textSection.style.display = 'block';
        if (textArea) {
            textArea.style.display = 'block';
            textArea.textContent = result.extractedText;
        }
    }
}

// AI verification initialized in handleFiles function above
// End of script

