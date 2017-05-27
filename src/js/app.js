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
});