// State Management
const state = {
    currentSlide: 1,
    totalSlides: 7,
    isTransitioning: false,
    audio: null,
    audioPlaying: false,
    audioInitialized: false,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// Helper function to start audio
function startAudio() {
    if (!state.audio || state.audioPlaying) return;
    
    const playPromise = state.audio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            state.audioPlaying = true;
            state.audioInitialized = true;
            document.querySelector('.audio-control')?.classList.remove('muted');
        }).catch(err => {
            console.warn('Audio play failed:', err);
        });
    }
}

// Initialize background ambient animation
function initBackgroundAnimation() {
    if (state.reducedMotion) {
        document.body.classList.remove('ambient-motion');
        return;
    }
    
    // Add class to enable CSS-based ambient animation
    document.body.classList.add('ambient-motion');
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initAudio();
    initNavigation();
    initProgressIndicator();
    initBackgroundAnimation();
    enterSlide(1);
    
    // Attempt to auto-play audio (may be blocked by browser)
    setTimeout(() => {
        startAudio();
    }, 300);
    
    // Start audio on first user interaction (anywhere on page)
    const startAudioOnInteraction = () => {
        startAudio();
    };
    
    // Listen for any user interaction
    document.addEventListener('click', startAudioOnInteraction, { once: true });
    document.addEventListener('touchstart', startAudioOnInteraction, { once: true });
});

// Audio Initialization
function initAudio() {
    const audioElement = document.getElementById('background-music');
    const audioControl = document.querySelector('.audio-control');
    const audioError = document.getElementById('audio-error');
    
    if (!audioElement) return;
    
    state.audio = audioElement;
    state.audio.volume = 0.2;
    
    // Check if audio file exists
    state.audio.addEventListener('error', () => {
        audioError.style.display = 'block';
        setTimeout(() => {
            audioError.style.display = 'none';
        }, 5000);
    });
    
    // Audio control toggle
    audioControl.addEventListener('click', () => {
        if (!state.audioInitialized) {
            state.audioInitialized = true;
        }
        
        if (state.audioPlaying) {
            state.audio.pause();
            state.audioPlaying = false;
            audioControl.classList.add('muted');
        } else {
            startAudio();
        }
    });
    
    // Handle audio end (should loop, but just in case)
    state.audio.addEventListener('ended', () => {
        state.audio.play();
    });
}

// Navigation Initialization
function initNavigation() {
    const buttons = document.querySelectorAll('.nav-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Start audio on first interaction if not already playing
            startAudio();
            
            if (state.isTransitioning) return;
            
            const action = button.getAttribute('data-action');
            
            if (action === 'next') {
                goToNextSlide();
            } else if (action === 'restart') {
                restartSlideShow();
            }
        });
    });
}

// Progress Indicator
function initProgressIndicator() {
    updateProgressIndicator();
}

function updateProgressIndicator() {
    const currentEl = document.querySelector('.progress-current');
    const totalEl = document.querySelector('.progress-total');
    
    if (currentEl) currentEl.textContent = state.currentSlide;
    if (totalEl) totalEl.textContent = state.totalSlides;
}

// Slide Navigation
function goToNextSlide() {
    if (state.currentSlide >= state.totalSlides || state.isTransitioning) return;
    
    // Start audio on first interaction if not already playing (Slide 1 -> Slide 2)
    if (state.currentSlide === 1) {
        startAudio();
    }
    
    transitionToSlide(state.currentSlide + 1);
}

function restartSlideShow() {
    if (state.isTransitioning) return;
    transitionToSlide(1);
}

function transitionToSlide(slideNumber) {
    if (state.isTransitioning || slideNumber < 1 || slideNumber > state.totalSlides) return;
    
    state.isTransitioning = true;
    
    const currentSlideEl = document.querySelector(`.slide[data-slide="${state.currentSlide}"]`);
    const nextSlideEl = document.querySelector(`.slide[data-slide="${slideNumber}"]`);
    
    if (!currentSlideEl || !nextSlideEl) {
        state.isTransitioning = false;
        return;
    }
    
    // Exit animation for current slide
    exitSlide(currentSlideEl).then(() => {
        // Update state
        state.currentSlide = slideNumber;
        updateProgressIndicator();
        
        // Remove active class from all slides
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Add active class to next slide
        nextSlideEl.classList.add('active');
        
        // Small delay for smoother transition
        gsap.delayedCall(state.reducedMotion ? 0.1 : 0.15, () => {
            // Enter animation for next slide
            enterSlide(slideNumber).then(() => {
                state.isTransitioning = false;
            });
        });
    });
}

// Exit Animation
function exitSlide(slideEl) {
    return new Promise((resolve) => {
        if (state.reducedMotion) {
            gsap.to(slideEl, {
                opacity: 0,
                duration: 0.2,
                ease: 'power1.in',
                onComplete: resolve
            });
            return;
        }
        
        // Filter out empty text lines
        const allTextLines = Array.from(slideEl.querySelectorAll('.text-content .line'));
        const textLines = allTextLines.filter(line => line.textContent.trim() !== '');
        const button = slideEl.querySelector('.nav-button');
        const subtleText = slideEl.querySelector('.subtle-text');
        
        const tl = gsap.timeline({
            onComplete: resolve
        });
        
        // Smooth fade out with subtle vertical movement
        tl.to([textLines, button, subtleText].filter(Boolean), {
            opacity: 0,
            y: -8,
            duration: 0.5,
            ease: 'power1.in'
        }, 0);
        
        tl.to(slideEl, {
            opacity: 0,
            y: 4,
            duration: 0.6,
            ease: 'power1.in'
        }, 0.1);
    });
}

// Enter Animation (per slide)
function enterSlide(slideNumber) {
    return new Promise((resolve) => {
        const slideEl = document.querySelector(`.slide[data-slide="${slideNumber}"]`);
        if (!slideEl) {
            resolve();
            return;
        }
        
        // Filter out empty text lines
        const allTextLines = Array.from(slideEl.querySelectorAll('.text-content .line'));
        const textLines = allTextLines.filter(line => line.textContent.trim() !== '');
        const button = slideEl.querySelector('.nav-button');
        const subtleText = slideEl.querySelector('.subtle-text');
        
        // Reset all elements with subtle starting position
        const startY = state.reducedMotion ? 0 : 12;
        gsap.set([textLines, button, subtleText].filter(Boolean), {
            opacity: 0,
            y: startY
        });
        
        // Reset slide position
        gsap.set(slideEl, {
            opacity: 1,
            y: -4
        });
        
        if (state.reducedMotion) {
            // Simple fade for reduced motion
            gsap.to([textLines, button, subtleText].filter(Boolean), {
                opacity: 1,
                duration: 0.4,
                ease: 'power1.inOut',
                onComplete: resolve
            });
            gsap.to(slideEl, {
                y: 0,
                duration: 0.4,
                ease: 'power1.inOut'
            }, 0);
            return;
        }
        
        // Staggered text animation with subtle, non-mechanical timing
        const tl = gsap.timeline({
            onComplete: resolve
        });
        
        // Slide fades in with subtle movement
        tl.to(slideEl, {
            y: 0,
            duration: 0.75,
            ease: 'power1.out'
        }, 0);
        
        // Animate text lines with gentle, irregular stagger
        if (textLines.length > 0) {
            tl.to(textLines, {
                opacity: 1,
                y: 0,
                duration: 0.75,
                stagger: {
                    amount: 0.5,
                    from: 'start',
                    ease: 'power1.inOut'
                },
                ease: 'power1.out'
            }, 0.1);
        }
        
        // Animate button with subtle delay after text starts appearing
        if (button) {
            // Button appears after first few lines have started
            const buttonStartTime = textLines.length > 0 ? 0.1 + Math.min(0.4, textLines.length * 0.1) : 0.3;
            tl.to(button, {
                opacity: 1,
                y: 0,
                duration: 0.65,
                ease: 'power1.out'
            }, buttonStartTime);
        }
        
        // Animate subtle text (for slide 7) - very gradual, appears after button
        if (subtleText) {
            // Subtle text appears well after button has started
            const subtleStartTime = button ? 
                (textLines.length > 0 ? 0.1 + Math.min(0.4, textLines.length * 0.1) + 0.5 : 0.8) : 
                (textLines.length > 0 ? 0.1 + Math.min(0.6, textLines.length * 0.15) : 0.5);
            tl.to(subtleText, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power1.out'
            }, subtleStartTime);
        }
    });
}

// Keyboard Navigation (optional enhancement)
document.addEventListener('keydown', (e) => {
    if (state.isTransitioning) return;
    
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (state.currentSlide < state.totalSlides) {
            goToNextSlide();
        }
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (state.currentSlide > 1) {
            transitionToSlide(state.currentSlide - 1);
        }
    }
});

// Prevent default spacebar scrolling
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
});

