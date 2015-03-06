$(document).ready(function(){
	$('html, body').stop().animate({
		scrollTop: 0
	}, 1000);
	return false;
});

$(function() {

	var atTop = !$(document).scrollTop();

	var offset = $('.container').offset().top;
	var projectsTop = $('#projects').offset().top;
	var lastScroll = 0;

	var timer;

	$('#name').click(function(){
		$('html, body').stop().animate({
			scrollTop: $('.container').offset().top
		}, 1000);
		return false;
	});

	$(window).scroll(function() {

		if (timer) {
			clearTimeout(timer);
		}

		timer = setTimeout(function(){
			var currPos = $(window).scrollTop();
			var pos = $(this).scrollTop();

			// nav bar appear code
			if (currPos < offset*2/3 && !atTop)
			{

				$('#navbar').removeClass("active");
				atTop = true;

				// name on blurred picture
				$('#intro_title').stop().animate({
					opacity: '1'
				}, 10);

			} else if (currPos >= offset*2/3 && atTop) {

				$('#navbar').addClass("active");
				atTop = false;

				$('#description').addClass("showing");

				// name on blurred image at top
				$('#intro_title').stop().animate({
					opacity: '0'
				}, 10);
			}

			// nav bar coloring code
			if (currPos > projectsTop-50) { // change nav to black, icons and text to white

				$('#navbar ul').addClass("white");
				$('#navbar ul li a').addClass("white");
				$('#nav_title a').addClass("black");

				$('#twitter').attr('src', 'img/twitter_black.png');
				$('#linkedin').attr('src', 'img/linkedin_black.png');
				$('#github').attr('src', 'img/octocat_black.png');

			} else { // change nav to white, icons and text to black
			
				$('#navbar ul').removeClass("white");
				$('#navbar ul li a').removeClass("white");
				$('#nav_title a').removeClass("black");

				$('#twitter').attr('src', 'img/twitter_white.png');
				$('#linkedin').attr('src', 'img/linkedin_white.png');
				$('#github').attr('src', 'img/octocat_white.png');

			}

		    lastScroll = pos;

		}, 20);
	});
});