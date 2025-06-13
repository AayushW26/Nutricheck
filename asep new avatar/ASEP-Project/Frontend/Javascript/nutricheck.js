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
        // Add smooth scroll to scanner section
        scannerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    // Configure marked options
    marked.setOptions({
        breaks: true, // Enable line breaks
        gfm: true,    // Enable GitHub Flavored Markdown
        sanitize: true // Sanitize HTML input
    });

    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        
        if (isUser) {
            messageDiv.textContent = message;
        } else {
            const formattedContent = document.createElement('div');
            formattedContent.className = 'markdown-content';
            formattedContent.innerHTML = marked.parse(message);
            messageDiv.appendChild(formattedContent);
        }
        
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
                        <h3>${data.name || 'Product Found'}</h3>
                        <div class="product-details">
                            <div class="nutrition-facts">
                                <h4>Nutrition Facts</h4>
                                <p><strong>Calories:</strong> ${data.calories || 0} kcal</p>
                                <p><strong>Proteins:</strong> ${data.protein || 0}g</p>
                                <p><strong>Carbohydrates:</strong> ${data.carbohydrates || 0}g</p>
                                <p><strong>Fats:</strong> ${data.fat || 0}g</p>
                                <p><strong>Fiber:</strong> ${data.fiber || 0}g</p>
                                <p><strong>Sugar:</strong> ${data.sugar || 0}g</p>
                                <p><strong>Sodium:</strong> ${data.sodium || 0}mg</p>
                            </div>
                            <div class="product-analysis">
                                <h4>Analysis</h4>
                                <p>${data.analysis || 'No analysis available'}</p>
                                <h4>Allergens</h4>
                                <p>${data.allergen || 'No allergens listed'}</p>
                                <h4>Healthier Alternatives</h4>
                                <p>${data.alternative || 'No alternatives suggested'}</p>
                            </div>
                        </div>
                    </div>`;

                    // Update visualizations
                    if (isValidNutritionData(data)) {
                        createNutrientsPieChart(data, 'nutrientsPieChart');
                        displayNutrientAlerts(data, 'nutrientAlerts');
                    }

                    // Show nutrition visualization section
                    document.querySelector('.nutrition-visualization').style.display = 'block';
                }
            })
            .catch(error => {
                resultElement.innerHTML = `<div class="scan-error">
                    <h3>Error</h3>
                    <p>Failed to fetch product details. Please try again.</p>
                </div>`;
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

    const NUTRIENT_THRESHOLDS = {
        calories: { low: 100, high: 300 },
        sugar: { low: 5, high: 10 },
        sodium: { low: 120, high: 300 },
        fat: { low: 1.1, high: 4 },
        saturated_fat: { low: 1.1, high: 4 }
    };

    function createNutrientsPieChart(data) {
        const ctx = document.getElementById('nutrientsPieChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.nutrientsChart) {
            window.nutrientsChart.destroy();
        }

        window.nutrientsChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Proteins', 'Carbohydrates', 'Fats', 'Fiber'],
                datasets: [{
                    data: [
                        parseFloat(data.protein),
                        parseFloat(data.carbohydrates),
                        parseFloat(data.fat),
                        parseFloat(data.fiber)
                    ],
                    backgroundColor: [
                        '#4CAF50',
                        '#2196F3',
                        '#FFC107',
                        '#9C27B0'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Nutrient Distribution'
                    }
                }
            }
        });
    }

    function displayNutrientAlerts(data) {
        const alertsContainer = document.getElementById('nutrientAlerts');
        alertsContainer.innerHTML = '';

        const checkThreshold = (value, thresholds) => {
            if (value > thresholds.high) return 'high';
            if (value < thresholds.low) return 'low';
            return 'moderate';
        };

        const nutrients = [
            { name: 'Calories', value: data.calories, unit: 'kcal', threshold: NUTRIENT_THRESHOLDS.calories },
            { name: 'Sugar', value: data.sugar, unit: 'g', threshold: NUTRIENT_THRESHOLDS.sugar },
            { name: 'Sodium', value: data.sodium, unit: 'mg', threshold: NUTRIENT_THRESHOLDS.sodium },
            { name: 'Total Fat', value: data.fat, unit: 'g', threshold: NUTRIENT_THRESHOLDS.fat },
            { name: 'Saturated Fat', value: data.saturated_fat, unit: 'g', threshold: NUTRIENT_THRESHOLDS.saturated_fat }
        ];

        nutrients.forEach(nutrient => {
            const level = checkThreshold(nutrient.value, nutrient.threshold);
            const alert = document.createElement('div');
            alert.className = `nutrient-alert alert-${level}`;
            alert.innerHTML = `
                <span>${nutrient.name}: ${nutrient.value}${nutrient.unit}</span>
                <span>${level.toUpperCase()}</span>
            `;
            alertsContainer.appendChild(alert);
        });
    }

    // Modify existing handleScanSuccess function
    function handleScanSuccess(decodedText) {
        id = decodedText;
        const resultElement = document.getElementById('scanResult');
        console.log("Scanning barcode:", id); // Debug log

        fetch(`http://127.0.0.1:5000/get_product?barcode=${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Received data:", data); // Debug log
                if (data.error) {
                    resultElement.innerHTML = `<div class="scan-error">
                        <h3>Product Not Found</h3>
                        <p>No product details available for barcode: ${id}</p>
                    </div>`;
                } else {
                    // Create product info section
                    resultElement.innerHTML = `<div class="scan-success">
                        <h3>${data.name || 'Product Found'}</h3>
                        <div class="product-details">
                            <div class="nutrition-facts">
                                <h4>Nutrition Facts</h4>
                                <p><strong>Calories:</strong> ${data.calories || 0} kcal</p>
                                <p><strong>Proteins:</strong> ${data.protein || 0}g</p>
                                <p><strong>Carbohydrates:</strong> ${data.carbohydrates || 0}g</p>
                                <p><strong>Fats:</strong> ${data.fat || 0}g</p>
                                <p><strong>Fiber:</strong> ${data.fiber || 0}g</p>
                                <p><strong>Sugar:</strong> ${data.sugar || 0}g</p>
                                <p><strong>Sodium:</strong> ${data.sodium || 0}mg</p>
                            </div>
                            <div class="product-analysis">
                                <h4>Analysis</h4>
                                <p>${data.analysis || 'No analysis available'}</p>
                                <h4>Allergens</h4>
                                <p>${data.allergen || 'No allergens listed'}</p>
                                <h4>Healthier Alternatives</h4>
                                <p>${data.alternative || 'No alternatives suggested'}</p>
                            </div>
                        </div>
                    </div>`;

                    // Update visualizations
                    if (isValidNutritionData(data)) {
                        createNutrientsPieChart(data, 'nutrientsPieChart');
                        displayNutrientAlerts(data, 'nutrientAlerts');
                    }

                    // Show nutrition visualization section
                    document.querySelector('.nutrition-visualization').style.display = 'block';
                }
            })
            .catch(error => {
                resultElement.innerHTML = `<div class="scan-error">
                    <h3>Error</h3>
                    <p>Failed to fetch product details. Please try again.</p>
                </div>`;
                console.error("Error fetching product:", error);
            });

        html5QrCode.stop();
    }

    function isValidNutritionData(data) {
        return data && typeof data === 'object' &&
               !isNaN(parseFloat(data.calories)) &&
               !isNaN(parseFloat(data.protein)) &&
               !isNaN(parseFloat(data.carbohydrates)) &&
               !isNaN(parseFloat(data.fat));
    }

    // Product Search Implementation
    const searchBtn = document.getElementById('searchBtn');
    const productSearch = document.getElementById('productSearch');
    const searchResult = document.getElementById('searchResult');

    async function searchProduct(productName) {
        try {
            const response = await fetch('http://127.0.0.1:5000/search_product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product: productName })
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Create visualization for search results
            createNutrientsPieChart(data, 'searchNutrientsPieChart');
            displayNutrientAlerts(data, 'searchNutrientAlerts');
            
            // Display ingredients for search results
            if (data.ingredients) {
                const searchIngredientsAnalysis = {
                    'Main Ingredients': data.ingredients.filter(i => i.category === 'Main ingredients').map(i => i.name),
                    'Preservatives': data.ingredients.filter(i => i.category === 'Preservatives').map(i => i.name),
                    'Food Additives': data.ingredients.filter(i => i.category === 'Additives').map(i => i.name),
                    'Minerals & Vitamins': data.ingredients.filter(i => i.category === 'Vitamins and minerals').map(i => i.name)
                };
                displayIngredients(searchIngredientsAnalysis, 'searchIngredientsList');
            }
            
            // Show results section with animation
            searchResult.classList.remove('hidden');
            setTimeout(() => searchResult.classList.add('visible'), 100);
            
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to fetch product information. Please try again.');
        }
    }

    searchBtn.addEventListener('click', () => {
        const product = productSearch.value.trim();
        if (product) {
            searchProduct(product);
        }
    });

    productSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    // Modify createNutrientsPieChart to accept chartId parameter
    function createNutrientsPieChart(data, chartId) {
        const ctx = document.getElementById(chartId).getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.nutrientsChart) {
            window.nutrientsChart.destroy();
        }

        window.nutrientsChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Proteins', 'Carbohydrates', 'Fats', 'Fiber'],
                datasets: [{
                    data: [
                        parseFloat(data.protein),
                        parseFloat(data.carbohydrates),
                        parseFloat(data.fat),
                        parseFloat(data.fiber)
                    ],
                    backgroundColor: [
                        '#4CAF50',
                        '#2196F3',
                        '#FFC107',
                        '#9C27B0'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Nutrient Distribution'
                    }
                }
            }
        });
    }

    // Modify displayNutrientAlerts to accept containerId parameter
    function displayNutrientAlerts(data, containerId) {
        const alertsContainer = document.getElementById(containerId);
        alertsContainer.innerHTML = '';

        const checkThreshold = (value, thresholds) => {
            if (value > thresholds.high) return 'high';
            if (value < thresholds.low) return 'low';
            return 'moderate';
        };

        const nutrients = [
            { name: 'Calories', value: data.calories, unit: 'kcal', threshold: NUTRIENT_THRESHOLDS.calories },
            { name: 'Sugar', value: data.sugar, unit: 'g', threshold: NUTRIENT_THRESHOLDS.sugar },
            { name: 'Sodium', value: data.sodium, unit: 'mg', threshold: NUTRIENT_THRESHOLDS.sodium },
            { name: 'Total Fat', value: data.fat, unit: 'g', threshold: NUTRIENT_THRESHOLDS.fat },
            { name: 'Saturated Fat', value: data.saturated_fat, unit: 'g', threshold: NUTRIENT_THRESHOLDS.saturated_fat }
        ];

        nutrients.forEach(nutrient => {
            const level = checkThreshold(nutrient.value, nutrient.threshold);
            const alert = document.createElement('div');
            alert.className = `nutrient-alert alert-${level}`;
            alert.innerHTML = `
                <span>${nutrient.name}: ${nutrient.value}${nutrient.unit}</span>
                <span>${level.toUpperCase()}</span>
            `;
            alertsContainer.appendChild(alert);
        });
    }

    // Update displayIngredients to accept a target container ID
    function displayIngredients(ingredients, targetId = 'ingredientsList') {
        const ingredientsList = document.getElementById(targetId);
        if (!ingredientsList) return;
        
        ingredientsList.innerHTML = '';

        const categoryIcons = {
            'Main Ingredients': '🥗',
            'Preservatives': '⚠️',
            'Food Additives': '🔬',
            'Artificial Colors': '🎨',
            'Minerals & Vitamins': '💊',
            'Chemicals/Synthetic Ingredients': '⚗️'
        };

        Object.entries(ingredients).forEach(([category, items]) => {
            if (items && items.length > 0) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'ingredient-category';
                categoryDiv.innerHTML = `
                    <h4>${categoryIcons[category] || '📋'} ${category}</h4>
                    <div class="ingredient-items">
                        ${items.map(item => `
                            <div class="ingredient-item">
                                <span class="ingredient-name">${item}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                ingredientsList.appendChild(categoryDiv);
            }
        });
    }
});








