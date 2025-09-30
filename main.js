// Livestock Fattening SPV - Main JavaScript File
// Handles all interactive functionality and animations

class LivestockSPV {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api';
        this.token = localStorage.getItem('authToken');
        this.user = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.setupFormHandlers();
        this.initializeCharts();
        this.startCounters();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', this.toggleMobileMenu);
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Investment option radio buttons
        const investmentOptions = document.querySelectorAll('input[name="investmentOption"]');
        investmentOptions.forEach(option => {
            option.addEventListener('change', this.handleInvestmentOptionChange);
        });

        // Window scroll events
        window.addEventListener('scroll', this.handleScroll);
    }

    initializeAnimations() {
        // Typewriter effect for hero text
        const typedElement = document.getElementById('typed-text');
        if (typedElement) {
            new Typed('#typed-text', {
                strings: [
                    'Invest in <span class="text-yellow-400">Livestock</span>',
                    'Grow Your <span class="text-yellow-400">Wealth</span>',
                    'Join Our <span class="text-yellow-400">Cooperative</span>'
                ],
                typeSpeed: 80,
                backSpeed: 50,
                backDelay: 2000,
                loop: true,
                contentType: 'html'
            });
        }

        // Animate elements on scroll
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.metric-card, .glass-card, .splide__slide').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    setupFormHandlers() {
        // Main application form
        const applicationForm = document.getElementById('application-form');
        if (applicationForm) {
            applicationForm.addEventListener('submit', this.handleApplicationSubmit);
        }

        // Quick application form
        const quickApplication = document.getElementById('quick-application');
        if (quickApplication) {
            quickApplication.addEventListener('submit', this.handleQuickApplication);
        }

        // Form validation
        this.setupFormValidation();
    }

    setupFormValidation() {
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', this.validateField);
            input.addEventListener('input', this.clearFieldError);
        });

        // NIN format validation
        const ninInput = document.getElementById('nin');
        if (ninInput) {
            ninInput.addEventListener('input', this.formatNIN);
        }
    }

    validateField(event) {
        const field = event.target;
        const value = field.value.trim();
        
        // Remove existing error styling
        field.classList.remove('border-red-500');
        
        // Check if required field is empty
        if (field.required && !value) {
            field.classList.add('border-red-500');
            return false;
        }

        // Specific validations
        if (field.id === 'nin' && value) {
            if (!/^\d{11}$/.test(value)) {
                field.classList.add('border-red-500');
                return false;
            }
        }

        if (field.id === 'fullName' && value) {
            if (value.length < 3) {
                field.classList.add('border-red-500');
                return false;
            }
        }

        return true;
    }

    clearFieldError(event) {
        event.target.classList.remove('border-red-500');
    }

    formatNIN(event) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        event.target.value = value;
    }

    handleInvestmentOptionChange(event) {
        const creditConsent = document.getElementById('credit-consent');
        const creditCheckbox = document.getElementById('creditConsent');
        
        if (event.target.value === 'financing') {
            creditConsent.classList.remove('hidden');
            creditCheckbox.required = true;
        } else {
            creditConsent.classList.add('hidden');
            creditCheckbox.required = false;
            creditCheckbox.checked = false;
        }
    }

    async handleApplicationSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = document.getElementById('submit-btn');
        
        // Validate form
        if (!this.validateForm(form)) {
            return;
        }

        // Show loading state
        submitBtn.innerHTML = '<span class="animate-spin">⏳</span> Submitting...';
        submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = {
                full_name: document.getElementById('fullName').value,
                national_id: document.getElementById('nin').value,
                employment_status: document.getElementById('employmentStatus').value,
                location: document.getElementById('location').value,
                investment_option: document.querySelector('input[name="investmentOption"]:checked').value,
                investment_amount: null,
                monthly_repayment: null,
                credit_consent: false
            };

            // Add investment-specific data
            if (formData.investment_option === 'outright') {
                formData.investment_amount = parseFloat(prompt('Enter investment amount (minimum ₦500,000):') || 500000);
            } else if (formData.investment_option === 'financing') {
                formData.monthly_repayment = parseFloat(prompt('Enter monthly repayment amount (minimum ₦50,000):') || 50000);
                formData.credit_consent = document.getElementById('creditConsent').checked;
            }

            // Submit to backend
            const response = await this.submitToBackend(formData);
            
            if (response.success) {
                // Store application data temporarily
                localStorage.setItem('applicationData', JSON.stringify(response.application));
                window.location.href = 'confirmation.html';
            } else {
                throw new Error(response.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Submission failed. Please try again.');
            submitBtn.innerHTML = 'Submit Application';
            submitBtn.disabled = false;
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField({ target: input })) {
                isValid = false;
            }
        });

        // Check investment option selection
        const investmentOption = form.querySelector('input[name="investmentOption"]:checked');
        if (!investmentOption) {
            isValid = false;
            alert('Please select an investment option.');
        }

        // Check credit consent if financing selected
        if (investmentOption && investmentOption.value === 'financing') {
            const creditConsent = document.getElementById('creditConsent');
            if (!creditConsent.checked) {
                isValid = false;
                alert('Please consent to credit search for financing option.');
            }
        }

        return isValid;
    }

    async submitToBackend(formData) {
        const response = await fetch(`${this.apiUrl}/applications/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(formData)
        });

        return await response.json();
    }

    // Authentication methods
    async login(email, password) {
        const response = await fetch(`${this.apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        
        if (result.success) {
            this.token = result.token;
            this.user = result.user;
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
        }

        return result;
    }

    async register(userData) {
        const response = await fetch(`${this.apiUrl}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        return await response.json();
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            this.token = token;
            this.user = JSON.parse(user);
            
            // Update UI for authenticated user
            this.updateAuthUI();
        }
    }

    updateAuthUI() {
        // Update navigation and other UI elements for authenticated users
        const authElements = document.querySelectorAll('[data-auth]');
        authElements.forEach(element => {
            const authType = element.getAttribute('data-auth');
            if (authType === 'authenticated') {
                element.style.display = this.user ? 'block' : 'none';
            } else if (authType === 'guest') {
                element.style.display = this.user ? 'none' : 'block';
            }
        });

        // Update user name display
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(element => {
            element.textContent = this.user ? this.user.full_name : '';
        });
    }

    // API helper methods
    async apiCall(endpoint, options = {}) {
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
                ...options.headers
            }
        };

        const response = await fetch(`${this.apiUrl}${endpoint}`, config);
        
        if (response.status === 401) {
            this.logout();
            throw new Error('Authentication expired');
        }

        return await response.json();
    }

    async getDashboardData() {
        return await this.apiCall('/investments/dashboard/summary');
    }

    async getInvestments() {
        return await this.apiCall('/investments');
    }

    async getApplications() {
        return await this.apiCall('/applications');
    }

    // Initialize dashboard if on dashboard page
    async initializeDashboard() {
        if (!this.user) {
            window.location.href = 'index.html';
            return;
        }

        try {
            const dashboardData = await this.getDashboardData();
            const investmentsData = await this.getInvestments();

            // Update dashboard UI with real data
            this.updateDashboardUI(dashboardData, investmentsData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    updateDashboardUI(dashboardData, investmentsData) {
        // Update metrics with real data
        if (dashboardData.success) {
            const dashboard = dashboardData.dashboard;
            
            // Update metric cards
            this.updateMetricCard('total-investment', dashboard.total_invested);
            this.updateMetricCard('current-value', dashboard.current_value);
            this.updateMetricCard('total-returns', dashboard.total_returns);
            this.updateMetricCard('active-investments', dashboard.active_investments);
        }
    }

    updateMetricCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = this.formatCurrency(value);
        }
    }

    handleQuickApplication(event) {
        event.preventDefault();
        // Redirect to main application form
        document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
    }

    startCounters() {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };

            // Start animation when element is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(counter);
        });
    }

    initializeCharts() {
        // Growth Chart
        const growthChartElement = document.getElementById('growth-chart');
        if (growthChartElement) {
            this.initGrowthChart();
        }

        // Portfolio Chart
        const portfolioChartElement = document.getElementById('portfolio-chart');
        if (portfolioChartElement) {
            this.initPortfolioChart();
        }
    }

    initGrowthChart() {
        const chart = echarts.init(document.getElementById('growth-chart'));
        
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '₦{value}'
                }
            },
            series: [{
                name: 'Investment Value',
                type: 'line',
                smooth: true,
                data: [2000000, 2100000, 2200000, 2350000, 2400000, 2450000, 2500000, 2650000, 2700000, 2800000, 2895900, 2895900],
                lineStyle: {
                    color: '#2D5016',
                    width: 3
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(45, 80, 22, 0.3)'
                        }, {
                            offset: 1, color: 'rgba(45, 80, 22, 0.05)'
                        }]
                    }
                }
            }]
        };

        chart.setOption(option);
        
        // Make chart responsive
        window.addEventListener('resize', () => {
            chart.resize();
        });
    }

    initPortfolioChart() {
        const chart = echarts.init(document.getElementById('portfolio-chart'));
        
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: ₦{c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            series: [{
                name: 'Portfolio',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: 1500000, name: 'Cattle Purchase', itemStyle: { color: '#2D5016' } },
                    { value: 600000, name: 'Feed & Care', itemStyle: { color: '#D4AF37' } },
                    { value: 400000, name: 'Insurance', itemStyle: { color: '#8B4513' } },
                    { value: 445900, name: 'Returns', itemStyle: { color: '#10B981' } }
                ]
            }]
        };

        chart.setOption(option);
        
        // Make chart responsive
        window.addEventListener('resize', () => {
            chart.resize();
        });
    }

    handleScroll() {
        const navbar = document.querySelector('nav');
        if (window.scrollY > 100) {
            navbar.classList.add('bg-white/98');
        } else {
            navbar.classList.remove('bg-white/98');
        }
    }

    toggleMobileMenu() {
        // Mobile menu implementation
        console.log('Mobile menu toggled');
    }
}

// Utility functions for page-specific functionality
function scrollToApply() {
    document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
}

function scrollToAbout() {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
}

// Update existing functions to work with backend
async function showRequestModal() {
    if (!window.livestockSPV || !window.livestockSPV.user) {
        alert('Please login to access this feature');
        return;
    }
    
    // Existing modal code...
    const modal = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
        <h3 class="text-2xl font-bold mb-4">Create New Request</h3>
        <form class="space-y-4" onsubmit="handleRequestSubmit(event)">
            <div>
                <label class="block text-sm font-semibold mb-2">Request Type</label>
                <select class="w-full p-3 border border-gray-300 rounded-lg" name="requestType">
                    <option>Asset Allocation</option>
                    <option>Management Change</option>
                    <option>Information Update</option>
                    <option>Withdrawal Request</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-semibold mb-2">Description</label>
                <textarea class="w-full p-3 border border-gray-300 rounded-lg h-24" 
                          name="description" placeholder="Describe your request..."></textarea>
            </div>
            <div class="flex space-x-4">
                <button type="button" onclick="closeModal()" 
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" 
                        class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Submit
                </button>
            </div>
        </form>
    `;
    
    modal.classList.remove('hidden');
}

async function handleRequestSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const requestData = {
        type: formData.get('requestType'),
        description: formData.get('description')
    };
    
    try {
        // Send request to backend
        const result = await window.livestockSPV.apiCall('/users/requests', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
        
        if (result.success) {
            alert('Request submitted successfully');
            closeModal();
        } else {
            alert('Failed to submit request: ' + result.message);
        }
    } catch (error) {
        console.error('Error submitting request:', error);
        alert('An error occurred while submitting your request');
    }
}

function showRequestModal() {
    const modal = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
        <h3 class="text-2xl font-bold mb-4">Create New Request</h3>
        <form class="space-y-4">
            <div>
                <label class="block text-sm font-semibold mb-2">Request Type</label>
                <select class="w-full p-3 border border-gray-300 rounded-lg">
                    <option>Asset Allocation</option>
                    <option>Management Change</option>
                    <option>Information Update</option>
                    <option>Withdrawal Request</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-semibold mb-2">Description</label>
                <textarea class="w-full p-3 border border-gray-300 rounded-lg h-24" 
                          placeholder="Describe your request..."></textarea>
            </div>
            <div class="flex space-x-4">
                <button type="button" onclick="closeModal()" 
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" 
                        class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Submit
                </button>
            </div>
        </form>
    `;
    
    modal.classList.remove('hidden');
}

function showProjectsModal() {
    const modal = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
        <h3 class="text-2xl font-bold mb-4">Available Projects</h3>
        <div class="space-y-4">
            <div class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 class="font-semibold mb-2">Dairy Farm Expansion SPV</h4>
                <p class="text-sm text-gray-600 mb-2">Modern dairy facility with automated milking systems</p>
                <div class="flex justify-between text-sm">
                    <span class="text-green-600 font-semibold">Expected ROI: 16-20%</span>
                    <span class="text-gray-500">Min: ₦300,000</span>
                </div>
            </div>
            <div class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 class="font-semibold mb-2">Poultry Layer Operation</h4>
                <p class="text-sm text-gray-600 mb-2">Large-scale egg production facility</p>
                <div class="flex justify-between text-sm">
                    <span class="text-green-600 font-semibold">Expected ROI: 14-18%</span>
                    <span class="text-gray-500">Min: ₦200,000</span>
                </div>
            </div>
            <div class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 class="font-semibold mb-2">Goat Meat Production</h4>
                <p class="text-sm text-gray-600 mb-2">Specialized goat farming for premium meat market</p>
                <div class="flex justify-between text-sm">
                    <span class="text-green-600 font-semibold">Expected ROI: 15-19%</span>
                    <span class="text-gray-500">Min: ₦250,000</span>
                </div>
            </div>
        </div>
        <button onclick="closeModal()" 
                class="w-full mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Close
        </button>
    `;
    
    modal.classList.remove('hidden');
}

function connectWallet() {
    // Simulate wallet connection
    const button = event.target;
    const originalText = button.textContent;
    
    button.textContent = 'Connecting...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = 'Wallet Connected ✓';
        button.classList.remove('wallet-connect');
        button.classList.add('bg-green-600');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.classList.add('wallet-connect');
            button.classList.remove('bg-green-600');
        }, 3000);
    }, 2000);
}

function showQuickActions() {
    alert('Quick actions menu - Coming soon!');
}

function closeModal() {
    document.getElementById('modal-container').classList.add('hidden');
}

function showContactInfo() {
    alert('Contact Support:\nEmail: support@livestockspv.com\nPhone: +234-800-SPVSUPPORT\nWhatsApp: +234-700-CATTLE-INVEST');
}

function startCountdown() {
    const countdownElement = document.getElementById('countdown-hours');
    if (!countdownElement) return;
    
    let hours = 24;
    const interval = setInterval(() => {
        hours--;
        countdownElement.textContent = hours;
        
        if (hours <= 0) {
            clearInterval(interval);
            countdownElement.textContent = '0';
        }
    }, 3600000); // Update every hour
}

// Initialize carousel if Splide is available
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Splide !== 'undefined') {
        const facilityCarousel = document.getElementById('facility-carousel');
        if (facilityCarousel) {
            new Splide('#facility-carousel', {
                type: 'loop',
                autoplay: true,
                interval: 4000,
                pauseOnHover: true,
                arrows: false,
                pagination: true
            }).mount();
        }
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    new LivestockSPV();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LivestockSPV;
}