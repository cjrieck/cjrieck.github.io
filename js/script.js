$(function () {
	
	window.scrollTo(0,0);

	var atTop = !$(document).scrollTop();

	var offset = $('.container').offset().top;
	var projectsTop = $('#projects').offset().top;

	$(window).scroll(function() {

		
		var currPos = $(window).scrollTop();

		if (currPos < offset && !atTop)
		{

			$('#navbar').animate({top: '-100%'}, 500);
			atTop = true;

		} else if (currPos >= offset && atTop) {

			$('#navbar').animate({top: '0%'}, 500);
			atTop = false;
		}

		console.log(projectsTop);

		if (currPos > projectsTop) {
			$('#navbar ul').stop().animate({
					backgroundColor: '#ffffff'
				}, 100);

			$('#navbar ul li a').stop().animate({
					color: '#000000'
				}, 100);

			$('#twitter').attr('src', 'img/twitter_black.png');
			$('#linkedin').attr('src', 'img/linkedin_black.png');
			$('#github').attr('src', 'img/octocat_black.png');	
		
		} else {
		
			$('#navbar ul').stop().animate({
					backgroundColor: '#000000',
					color: '#ffffff'
				}, 100);

			$('#navbar ul li a').stop().animate({
					color: '#ffffff'
				}, 100);

			$('#twitter').attr('src', 'img/twitter_white.png');
			$('#linkedin').attr('src', 'img/linkedin_white.png');
			$('#github').attr('src', 'img/octocat_white.png');
			
		}

	});
	
});