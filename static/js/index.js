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
    // var backgroundVideo = document.getElementById('tree');
    // if (backgroundVideo) {
    //     if (autoplay) {
    //         backgroundVideo.setAttribute('autoplay', '');
    //     } else {
    //         backgroundVideo.removeAttribute('autoplay');
    //     }
    // }
    console.log('autoplay:', autoplay);
    // print some value so that I know it is working
    // Handle carousel videos autoplay
    var carouselVideos = document.querySelectorAll('.carousel video');
    carouselVideos.forEach(function(video) {
        console.log('autoplay:', autoplay);
        if (autoplay) {
            video.setAttribute('autoplay', '');
        } else {
            video.removeAttribute('autoplay');
        }
    });
    
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
