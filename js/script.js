$(document).ready(function(){
	$('html, body').stop().animate({
		scrollTop: 0
	}, 'slow');
	return false;
});

$(function() {

	var atTop = !$(document).scrollTop();

	var offset = $('.container').offset().top;
	var projectsTop = $('#projects').offset().top;

	$('#name').click(function(){
		$('html, body').stop().animate({
			scrollTop: $('.container').offset().top
		}, 1000);
		return false;
	});

	$(window).scroll(function() {

		
		var currPos = $(window).scrollTop();
		console.log(currPos);
		// nav bar appear code
		if (currPos < offset*2/3 && !atTop)
		{

			$('#navbar').stop().animate({top: '-100%'}, 800);
			atTop = true;

			$('#intro_title').stop().animate({
				opacity: '1'
			}, 10);

		} else if (currPos >= offset*2/3 && atTop) {

			$('#navbar').stop().animate({top: '0%'}, 800);
			atTop = false;

			$('#description').stop().animate({
				opacity: '1',
				margin: '17.5% 20%'
			}, 500);

			$('#intro_title').stop().animate({
				opacity: '0'
			}, 10);
		}

		// nav bar coloring code
		if (currPos > projectsTop-50) { // change nav to black, icons and text to white
			$('#navbar ul').stop().animate({
					backgroundColor: '#ffffff'
				}, 100);

			$('#navbar ul li a').stop().animate({
					color: '#000000'
				}, 100);

			$('#nav_title a').stop().animate({
					color: '#000000'
				}, 100);

			$('#twitter').attr('src', 'img/twitter_black.png');
			$('#linkedin').attr('src', 'img/linkedin_black.png');
			$('#github').attr('src', 'img/octocat_black.png');

			// $('#resume').css('-webkit-filter', 'invert(100%)');	
		
		} else { // change nav to white, icons and text to black
		
			$('#navbar ul').stop().animate({
					backgroundColor: '#000000',
					color: '#ffffff'
				}, 100);

			$('#navbar ul li a').stop().animate({
					color: '#ffffff'
				}, 100);

			$('#nav_title a').stop().animate({
					color: '#ffffff'
				}, 100);

			$('#twitter').attr('src', 'img/twitter_white.png');
			$('#linkedin').attr('src', 'img/linkedin_white.png');
			$('#github').attr('src', 'img/octocat_white.png');

		}

		// if (currPos + $(window).height() == $(document).height() {
		// 	$('.footer-wrapper').css('z-index', 7);
		// }

		// else {
		// 	$('.footer-wrapper').css('z-index', -1);
		// }

	});

	// $('#resume').click(function(){
	// 	alert("Clicked!");
	// });
	
});