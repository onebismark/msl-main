        // Music Toggle Functionality
        function start() {
            const audio = document.getElementById('bgMusic');
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        }

 

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add fade-in animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });

        // Header background opacity on scroll
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            const scrolled = window.pageYOffset;
            const opacity = Math.min(scrolled / 100, 0.95);
            
            if (document.body.classList.contains('lightMode')) {
                header.style.background = `rgba(255, 255, 255, ${opacity})`;
            } else {
                header.style.background = `rgba(10, 10, 10, ${opacity})`;
            }
        });
        
        
