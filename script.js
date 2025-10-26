// Enhanced Photography Blog with Modern Features
// Security: Input validation, XSS prevention, secure file handling

(function() {
    'use strict';
    
    // Security: Input sanitization
    function sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }
    
    // Security: File type validation
    function validateImageFile(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.');
        }
        
        if (file.size > maxSize) {
            throw new Error('File too large. Please upload images smaller than 10MB.');
        }
        
        return true;
    }
    
    // Theme Management with Local Storage
    class ThemeManager {
        constructor() {
            this.themeToggle = document.getElementById('themeToggle');
            this.currentTheme = localStorage.getItem('theme') || 'light';
            this.init();
        }
        
        init() {
            this.applyTheme(this.currentTheme);
            this.bindEvents();
        }
        
        applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            this.updateThemeIcon(theme);
            localStorage.setItem('theme', theme);
        }
        
        updateThemeIcon(theme) {
            const icon = this.themeToggle.querySelector('.theme-icon');
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        
        toggleTheme() {
            this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            this.applyTheme(this.currentTheme);
            
            // Add smooth transition effect
            document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        }
        
        bindEvents() {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            
            // Listen for system theme changes
            if (window.matchMedia) {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                mediaQuery.addEventListener('change', (e) => {
                    if (!localStorage.getItem('theme')) {
                        this.currentTheme = e.matches ? 'dark' : 'light';
                        this.applyTheme(this.currentTheme);
                    }
                });
            }
        }
    }
    
    // Loading State Management
    class LoadingManager {
        constructor() {
            this.loadingIndicator = document.getElementById('loadingIndicator');
        }
        
        show() {
            this.loadingIndicator.style.display = 'block';
        }
        
        hide() {
            this.loadingIndicator.style.display = 'none';
        }
    }
    
    // Gallery Management with Filtering
    class GalleryManager {
        constructor() {
            this.photoItems = document.querySelectorAll('.photo-item');
            this.filterButtons = document.querySelectorAll('.filter-btn');
            this.currentFilter = 'all';
            this.init();
        }
        
        init() {
            this.bindEvents();
            this.setupPhotoUploads();
            this.setupPhotoActions();
        }
        
        bindEvents() {
            this.filterButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const filter = e.target.dataset.filter;
                    this.filterPhotos(filter);
                    this.updateActiveButton(e.target);
                });
            });
        }
        
        filterPhotos(filter) {
            this.currentFilter = filter;
            
            this.photoItems.forEach(item => {
                const category = item.dataset.category;
                const shouldShow = filter === 'all' || category === filter;
                
                if (shouldShow) {
                    item.classList.remove('hidden');
                    item.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    item.classList.add('hidden');
                    item.style.animation = 'fadeOutDown 0.3s ease forwards';
                }
            });
        }
        
        updateActiveButton(activeBtn) {
            this.filterButtons.forEach(btn => btn.classList.remove('active'));
            activeBtn.classList.add('active');
        }
        
        setupPhotoUploads() {
            const photoPlaceholders = document.querySelectorAll('.photo-placeholder');
            
            photoPlaceholders.forEach(placeholder => {
                placeholder.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handlePhotoUpload(placeholder);
                });
                
                // Keyboard accessibility
                placeholder.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handlePhotoUpload(placeholder);
                    }
                });
            });
        }
        
        async handlePhotoUpload(placeholder) {
            try {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
                input.style.display = 'none';
                
                const file = await new Promise((resolve, reject) => {
                    input.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            try {
                                validateImageFile(file);
                                resolve(file);
                            } catch (error) {
                                reject(error);
                            }
                        } else {
                            reject(new Error('No file selected'));
                        }
                    });
                    
                    input.addEventListener('cancel', () => {
                        reject(new Error('Upload cancelled'));
                    });
                    
                    document.body.appendChild(input);
                    input.click();
                });
                
                document.body.removeChild(input);
                
                // Show loading state
                const loadingManager = new LoadingManager();
                loadingManager.show();
                
                // Process image
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.displayUploadedPhoto(placeholder, e.target.result);
                    loadingManager.hide();
                };
                
                reader.onerror = () => {
                    this.showError('Failed to read file. Please try again.');
                    loadingManager.hide();
                };
                
                reader.readAsDataURL(file);
                
            } catch (error) {
                this.showError(error.message);
            }
        }
        
        displayUploadedPhoto(placeholder, imageSrc) {
            placeholder.style.backgroundImage = `url(${imageSrc})`;
            placeholder.style.backgroundSize = 'cover';
            placeholder.style.backgroundPosition = 'center';
            placeholder.innerHTML = '';
            placeholder.style.color = 'transparent';
            
            // Add success animation
            placeholder.style.animation = 'pulse 0.6s ease';
            setTimeout(() => {
                placeholder.style.animation = '';
            }, 600);
        }
        
        setupPhotoActions() {
            const likeButtons = document.querySelectorAll('.photo-action-btn[aria-label*="Like"]');
            const viewButtons = document.querySelectorAll('.photo-action-btn[aria-label*="View"]');
            
            likeButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleLike(btn);
                });
            });
            
            viewButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleView(btn);
                });
            });
        }
        
        handleLike(button) {
            const photoItem = button.closest('.photo-item');
            const likesElement = photoItem.querySelector('.photo-likes');
            const currentLikes = parseInt(likesElement.textContent) || 0;
            const newLikes = currentLikes + 1;
            
            likesElement.textContent = `${newLikes} likes`;
            
            // Add like animation
            button.style.animation = 'heartBeat 0.6s ease';
            setTimeout(() => {
                button.style.animation = '';
            }, 600);
            
            // Store likes in localStorage
            const photoId = photoItem.querySelector('h3').textContent;
            const likes = JSON.parse(localStorage.getItem('photoLikes') || '{}');
            likes[photoId] = newLikes;
            localStorage.setItem('photoLikes', JSON.stringify(likes));
        }
        
        handleView(button) {
            const photoItem = button.closest('.photo-item');
            const photoContainer = photoItem.querySelector('.photo-container');
            const backgroundImage = photoContainer.style.backgroundImage;
            
            if (backgroundImage && backgroundImage !== 'none') {
                // Create modal for full-size view
                this.createPhotoModal(backgroundImage);
            } else {
                this.showError('No photo to view. Please upload a photo first.');
            }
        }
        
        createPhotoModal(imageSrc) {
            const modal = document.createElement('div');
            modal.className = 'photo-modal';
            modal.innerHTML = `
                <div class="modal-backdrop">
                    <div class="modal-content">
                        <button class="modal-close" aria-label="Close modal">&times;</button>
                        <img src="${imageSrc}" alt="Full size photo" class="modal-image">
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close modal functionality
            const closeBtn = modal.querySelector('.modal-close');
            const backdrop = modal.querySelector('.modal-backdrop');
            
            const closeModal = () => {
                modal.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            };
            
            closeBtn.addEventListener('click', closeModal);
            backdrop.addEventListener('click', closeModal);
            
            // Keyboard accessibility
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                }
            });
            
            modal.focus();
        }
        
        showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4444;
                color: white;
                padding: 1rem 2rem;
                border-radius: 8px;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
            `;
            
            document.body.appendChild(errorDiv);
            
            setTimeout(() => {
                errorDiv.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => {
                    document.body.removeChild(errorDiv);
                }, 300);
            }, 3000);
        }
    }
    
    // Navigation Management
    class NavigationManager {
        constructor() {
            this.navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
            this.sections = document.querySelectorAll('section[id]');
            this.init();
        }
        
        init() {
            this.bindEvents();
            this.setupScrollSpy();
        }
        
        bindEvents() {
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetSection = document.querySelector(targetId);
                    
                    if (targetSection) {
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Update active state
                        this.updateActiveLink(link);
                    }
                });
            });
        }
        
        setupScrollSpy() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const sectionId = entry.target.id;
                        const correspondingLink = document.querySelector(`.main-nav a[href="#${sectionId}"]`);
                        if (correspondingLink) {
                            this.updateActiveLink(correspondingLink);
                        }
                    }
                });
            }, {
                threshold: 0.3,
                rootMargin: '-50px 0px -50px 0px'
            });
            
            this.sections.forEach(section => {
                observer.observe(section);
            });
        }
        
        updateActiveLink(activeLink) {
            this.navLinks.forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            });
            
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
        }
    }
    
    // Animation Manager
    class AnimationManager {
        constructor() {
            this.init();
        }
        
        init() {
            this.setupScrollAnimations();
            this.setupHoverEffects();
            this.addCustomAnimations();
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
            
            const animatedElements = document.querySelectorAll('.photo-item, .blog-post, .about-content, .contact-content');
            animatedElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        }
        
        setupHoverEffects() {
            const photoPlaceholders = document.querySelectorAll('.photo-placeholder');
            photoPlaceholders.forEach(placeholder => {
                placeholder.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.02)';
                });
                
                placeholder.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                });
            });
        }
        
        addCustomAnimations() {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeOutDown {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                @keyframes heartBeat {
                    0%, 100% { transform: scale(1); }
                    25% { transform: scale(1.1); }
                    50% { transform: scale(1.2); }
                    75% { transform: scale(1.1); }
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                
                .photo-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                
                .modal-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-content {
                    position: relative;
                    max-width: 90vw;
                    max-height: 90vh;
                }
                
                .modal-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    border-radius: 8px;
                }
                
                .modal-close {
                    position: absolute;
                    top: -40px;
                    right: 0;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    font-size: 2rem;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Typing Animation for Subtitle
    class TypingAnimation {
        constructor() {
            this.subtitle = document.querySelector('.site-subtitle');
            this.init();
        }
        
        init() {
            if (this.subtitle) {
                const text = this.subtitle.textContent;
                this.subtitle.textContent = '';
                this.subtitle.style.borderRight = '2px solid var(--accent-primary-current)';
                
                let i = 0;
                const typeWriter = () => {
                    if (i < text.length) {
                        this.subtitle.textContent += text.charAt(i);
                        i++;
                        setTimeout(typeWriter, 100);
                    } else {
                        this.subtitle.style.borderRight = 'none';
                    }
                };
                
                setTimeout(typeWriter, 1000);
            }
        }
    }
    
    // Performance Optimization
    class PerformanceManager {
        constructor() {
            this.init();
        }
        
        init() {
            this.setupLazyLoading();
            this.optimizeImages();
        }
        
        setupLazyLoading() {
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
        
        optimizeImages() {
            // Add image optimization for uploaded photos
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            window.optimizeImage = function(file, maxWidth = 1200, quality = 0.8) {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                        canvas.width = img.width * ratio;
                        canvas.height = img.height * ratio;
                        
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        canvas.toBlob(resolve, 'image/jpeg', quality);
                    };
                    img.src = URL.createObjectURL(file);
                });
            };
        }
    }
    
    // Dynamic Year Update
    function updateCurrentYear() {
        const yearElements = document.querySelectorAll('#currentYear');
        const currentYear = new Date().getFullYear();
        yearElements.forEach(element => {
            if (element) {
                element.textContent = currentYear;
            }
        });
    }

    // Initialize all managers when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        try {
            // Update current year first
            updateCurrentYear();
            
            new ThemeManager();
            new GalleryManager();
            new NavigationManager();
            new AnimationManager();
            new TypingAnimation();
            new PerformanceManager();
            
            // Load saved likes
            const savedLikes = JSON.parse(localStorage.getItem('photoLikes') || '{}');
            Object.entries(savedLikes).forEach(([photoTitle, likes]) => {
                const photoItem = Array.from(document.querySelectorAll('.photo-item')).find(item => 
                    item.querySelector('h3').textContent === photoTitle
                );
                if (photoItem) {
                    const likesElement = photoItem.querySelector('.photo-likes');
                    likesElement.textContent = `${likes} likes`;
                }
            });
            
        } catch (error) {
            console.error('Error initializing application:', error);
        }
    });
    
    // Error handling for unhandled errors
    window.addEventListener('error', function(e) {
        console.error('Unhandled error:', e.error);
    });
    
    // Service Worker registration for offline functionality (optional)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            // Service worker would be implemented here for offline functionality
        });
    }
    
})();