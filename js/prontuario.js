
        document.addEventListener('DOMContentLoaded', function() {
            const tabs = document.querySelectorAll('[role="tab"]');
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    tabs.forEach(t => {
                        t.setAttribute('aria-selected', 'false');
                        t.classList.remove('active');
                    });
                    this.setAttribute('aria-selected', 'true');
                    this.classList.add('active');
                    
                    console.log('Tab clicked:', this.textContent);
                });
            });
            document.querySelector('.btn-close').addEventListener('click', function() {
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.close();
                }
            });
        });