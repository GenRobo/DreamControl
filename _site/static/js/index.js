window.HELP_IMPROVE_VIDEOJS = false;



$(document).ready(function() {
    // Check for click events on the navbar burger icon
    // $(".navbar-burger").click(function() {
    //   // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    //   $(".navbar-burger").toggleClass("is-active");
    //   $(".navbar-menu").toggleClass("is-active");

    // });

    // Device detection function
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }

    // Set autoplay based on device type
    var isMobile = isMobileDevice();
    var autoplay = !isMobile; // true for desktop, false for mobile
    var slidesToShow = isMobile ? 1 : 3;
    // Debug logging
    console.log('Device detection - isMobile:', isMobile, 'autoplay:', autoplay);
    var options = {
      slidesToScroll: 1,
      slidesToShow: slidesToShow,
      loop: true,
      infinite: true,
      autoplay: false,
      autoplaySpeed: 5000,
      playsinline: true,
      preload: 'none',
    };

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
    
    // Handle background video autoplay
    var backgroundVideo = document.getElementById('tree');
    if (backgroundVideo) {
        console.log('Background video found, setting autoplay:', autoplay);
        if (autoplay) {
            backgroundVideo.setAttribute('autoplay', '');
            backgroundVideo.setAttribute('preload', 'auto');
            console.log('Added autoplay to background video and set preload to auto');
            
            // Try to play the background video programmatically as a fallback
            backgroundVideo.play().then(function() {
                console.log('Background video started playing successfully');
            }).catch(function(error) {
                console.log('Background video autoplay failed:', error);
            });
        } else {
          backgroundVideo.setAttribute('autoplay', '');
          backgroundVideo.setAttribute('preload', 'auto');
          console.log('Added autoplay to background video and set preload to auto');
          
          // Try to play the background video programmatically as a fallback
          backgroundVideo.play().then(function() {
              console.log('Background video started playing successfully');
          }).catch(function(error) {
              console.log('Background video autoplay failed:', error);
          });
        }
    } else {
        console.log('Background video not found!');
    }
    // Optimize carousel videos: only play when sufficiently visible (desktop only)
    var carouselVideos = document.querySelectorAll('.carousel video');

    if (!isMobile) {
        // Desktop behavior: play/pause based on visibility
        carouselVideos.forEach(function(video) {
            video.muted = true;
            video.removeAttribute('autoplay');
            video.setAttribute('preload', 'metadata');
        });

        var visibilityObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                var video = entry.target;
                var isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.9;

                if (isVisible) {
                    video.setAttribute('preload', 'auto');

                    var carouselRoot = video.closest('.carousel');
                    // if (carouselRoot) {
                    //     carouselRoot.querySelectorAll('video').forEach(function(sibling) {
                    //         if (sibling !== video && !sibling.paused) {
                    //             try { sibling.pause(); } catch (e) { /* no-op */ }
                    //         }
                    //     });
                    // }

                    video.play().catch(function() { /* Autoplay might be blocked; ignore */ });
                } else {
                    try { video.pause(); } catch (e) { /* no-op */ }
                }
            });
        }, { threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] });

        carouselVideos.forEach(function(video) {
            visibilityObserver.observe(video);
        });

        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                document.querySelectorAll('.carousel video').forEach(function(video) {
                    try { video.pause(); } catch (e) { /* no-op */ }
                });
            }
        });
    } else {
        // Mobile behavior: never autoplay, keep minimal preload, ensure paused
        carouselVideos.forEach(function(video) {
            video.muted = true;
            video.removeAttribute('autoplay');
            video.setAttribute('preload', 'none');
            // try { video.pause(); } catch (e) { /* no-op */ }
        });
    }
    
    // Loop on each carousel initialized
    // for(var i = 0; i < carousels.length; i++) {
    // 	// Add listener to  event
    // 	carousels[i].on('before:show', state => {
    // 		console.log(state);
    // 	});
    // }

    // // Access to bulmaCarousel instance of an element
    // var element = document.querySelector('#my-element');
    // if (element && element.bulmaCarousel) {
    // 	// bulmaCarousel instance is available as element.bulmaCarousel
    // 	element.bulmaCarousel.on('before-show', function(state) {
    // 		console.log(state);
    // 	});
    // }

    

    bulmaSlider.attach();

})
