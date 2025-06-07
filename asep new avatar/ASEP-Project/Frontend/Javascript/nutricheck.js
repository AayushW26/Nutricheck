// script.js
var id;
document.addEventListener("DOMContentLoaded", () => {
   
    // Theme Management
    const themeToggle = document.getElementById('themeToggle');
    let isDarkTheme = localStorage.getItem('darkTheme') === 'true';

    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
        localStorage.setItem('darkTheme', isDarkTheme);
    }

    themeToggle.addEventListener('click', toggleTheme);
    // Set initial theme
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');

    // Authentication & Session Management
    const loginSection = document.getElementById('login');
    const mainContent = document.getElementById('mainContent');
    const logoutContainer = document.getElementById('logoutContainer');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    function checkSession() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            if (loginSection) loginSection.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
            if (logoutContainer) {
                logoutContainer.style.display = 'block';
                // Add user info if logged in with Google
                const userName = sessionStorage.getItem('userName');
                if (userName) {
                    const userPicture = sessionStorage.getItem('userPicture');
                    logoutContainer.innerHTML = `
                        ${userPicture ? `<img src="${userPicture}" alt="Profile" class="profile-pic">` : ''}
                        <span>${userName}</span>
                        <button id="logoutBtn">Logout</button>
                    `;
                }
            }
        } else {
            if (loginSection) loginSection.style.display = 'block';
            if (mainContent) mainContent.style.display = 'none';
            if (logoutContainer) logoutContainer.style.display = 'none';
        }
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const username = this.querySelector("input[type='text']").value;
            const password = this.querySelector("input[type='password']").value;

            if (username === 'admin' && password === 'admin') {
                sessionStorage.setItem('isLoggedIn', 'true');
                checkSession();
                // Scroll to top after successful login
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert("Invalid credentials. Use admin/admin");
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear all session data
            sessionStorage.clear();
            // Handle Google sign-out if necessary
            if (google.accounts.id) {
                google.accounts.id.disableAutoSelect();
            }
            checkSession();
            // Scroll to login section after logout
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // QR Scanner Implementation
    const scannerSection = document.querySelector("#scanner");
    const scanNowBtn = document.querySelector("#scanNowBtn");
    const closeScanner = document.querySelector("#closeScanner");
    let html5QrCode = null;

    scanNowBtn.addEventListener('click', () => {
        scannerSection.classList.remove('hidden');
        initializeScanner();
    });

    closeScanner.addEventListener('click', () => {
        if (html5QrCode) {
            html5QrCode.stop().then(() => {
                scannerSection.classList.add('hidden');
            });
        }
    });

    function initializeScanner() {
        html5QrCode = new Html5Qrcode("reader");
        startScanning('environment');
    }

    function startScanning(facingMode) {
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        };

        html5QrCode.start(
            { facingMode },
            config,
            handleScanSuccess,
            handleScanError
        );
    }
    
    // function handleScanSuccess(decodedText) {
    //     id=decodedText;
    //     const resultElement = document.getElementById('scanResult');
    //     resultElement.innerHTML = `<div class="scan-success">
    //         <h3>QR Code Detected!</h3>
    //         <p>${decodedText}</p>
    //     </div>`;
        
    //     html5QrCode.stop();
    //     // Add your logic to handle the QR code data here
    // }

    function handleScanError(error) {
        console.warn("QR Scan Error:", error);
    }

    document.getElementById("switchCamera").addEventListener('click', () => {
        if (html5QrCode) {
            const newMode = html5QrCode._facing === 'environment' ? 'user' : 'environment';
            html5QrCode.stop().then(() => startScanning(newMode));
        }
    });

    // Check session on page load
    checkSession();

    function handleQRData(data) {
        try {
            const parsedData = JSON.parse(data);
            displayDataInTable(parsedData);
        } catch {
            displayDataInTable({ "Raw Data": data });
        }
    }

    function displayDataInTable(data) {
        const table = document.getElementById("aadharTable");
        table.innerHTML = '<tr><th>Field</th><th>Value</th></tr>';
        
        function addRowsRecursively(obj, prefix = '') {
            for (const [key, value] of Object.entries(obj)) {
                const row = table.insertRow(-1);
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);
                
                cell1.textContent = prefix + key;
                
                if (typeof value === 'object' && value !== null) {
                    cell2.textContent = '';
                    addRowsRecursively(value, `${prefix}${key}.`);
                } else {
                    cell2.textContent = value;
                }
            }
        }
        
        addRowsRecursively(data);
        table.style.display = "table";
    }

    // Chat functionality
    const chatSection = document.getElementById('chatSection');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendMessage = document.getElementById('sendMessage');

    async function sendToBot(message) {
        try {
            // Show loading state
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'chat-message bot-message';
            loadingMessage.textContent = 'Typing...';
            chatMessages.appendChild(loadingMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            const response = await fetch('http://127.0.0.1:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    context: id ? `Consider this product barcode: ${id}` : ''
                })
            });

            const data = await response.json();
            
            // Remove loading message
            chatMessages.removeChild(loadingMessage);
            
            if (data.success) {
                // Add bot response
                addMessage(data.response, false);
            } else {
                addMessage("I apologize, but I encountered an error. Please try again.", false);
            }
            
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, I encountered a connection error. Please check your internet connection and try again.', false);
        } finally {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Enhanced message display with animations
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        messageDiv.textContent = message;
        
        chatMessages.appendChild(messageDiv);
        
        // Trigger animation
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 100);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendMessage.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            sendToBot(message);
            userInput.value = '';
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage.click();
        }
    });

    // Show chat section when product is scanned
    function handleScanSuccess(decodedText) {
        id = decodedText; // The scanned barcode
        const resultElement = document.getElementById('scanResult');

        // Fetch product details from Flask backend
        fetch(`http://127.0.0.1:5000/get_product?barcode=${id}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    resultElement.innerHTML = `<div class="scan-error">
                        <h3>Product Not Found</h3>
                        <p>No product details available for barcode: ${id}</p>
                    </div>`;
                } else {
                    resultElement.innerHTML = `<div class="scan-success">
                        <h3>Product Found!</h3>
                        <p><strong>Name:</strong> ${data.name}</p>
                        <p><strong>Calories:</strong> ${data.calories}</p>
                        <p><strong>Proteins:</strong> ${data.protein}g</p>
                        <p><strong>Fats:</strong> ${data.fat}g</p>
                        <p><strong>fiber:</strong> ${data.fiber}g</p>
                        <p><strong>Sugar:</strong> ${data.sugar}g</p>
                        <p><strong>Sodium:</strong> ${data.sodium}g</p>
                        <p><strong>Carbohydrates:</strong> ${data.carbohydrates}g</p> 
                        <p><strong>Analysis:</strong> ${data.analysis}</p> 
                        <p><strong>Allergen:</strong> ${data.allergen}</p>     
                         <p><strong>Alternative:</strong> ${data.alternative}</p>               
                    </div>`;
                }
            })
            .catch(error => {
                resultElement.innerHTML = `<p>Error fetching product details.</p>`;
                console.error("Error fetching product:", error);
            });
   
        // Stop the scanner after detecting the barcode
        html5QrCode.stop();
        // Removed chatSection.classList.remove('hidden') since we want it visible by default
    }
    
    // Google Sign-In Handler
    function handleGoogleSignIn(response) {
        const credentials = jwt_decode(response.credential);
        
        if (credentials.email_verified) {
            // Store user info
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userEmail', credentials.email);
            sessionStorage.setItem('userName', credentials.name);
            sessionStorage.setItem('userPicture', credentials.picture);
            
            // Update UI
            checkSession();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            alert("Email verification failed. Please try again.");
        }
    }

    window.handleGoogleSignIn = handleGoogleSignIn; // Expose to global scope
});








