$(function() {
  //SMOOTH PAGE SCROLL
  $("a[href*='#']:not([href='#'])").click(function() {
    // $(this).parents().toggleClass('active').siblings().removeClass('active');
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 500);
        return false;
      }
    }
  });
  // Header
  (function handleHeader() {
    var body = $('body');
    $(window).scroll(function() {
      if ($(this).scrollTop() > 0) {
        body.addClass('scrolling');
      } else {
        body.removeClass('scrolling');
      }
    })
  }());
  // Nav
  (function handleNav(){
    $('.navbar-toggle').click(function(e){
      var target = $('.nav-toggle');
      $('.nav-wrapper ul').slideToggle();
    });
  })();
  // Scrollspy
  $('body').scrollspy({
    target: '.nav-wrapper'
  });
  // Slider
  (function handleSlider() {
    var swiper = new Swiper('.swiper-container', {
      autoplay: 5000,
      slidesPerView: 4,
      slidePerGroup: 4,
      spaceBetween: 130,
      pagination : '.swiper-pagination',
      paginationClickable: true,
      parallax: true,
      speed: 600,
      loop: true,
      breakpoints: {
        480: {
          slidesPerView: 1,
          slidePerGroup: 1
        },
        768: {
          slidesPerView: 2,
          slidePerGroup: 2
        },
        1500: {
          slidesPerView: 3,
          slidePerGroup: 3
        }
      }
    });
  }());
});