$(document).ready(function(){
	// Calculate height of page here

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
				// $('#navbar').stop().animate({top: '-100%'}, 800);
				atTop = true;

				// name on blurred picture
				$('#intro_title').stop().animate({
					opacity: '1'
				}, 10);

				$('.footer-wrapper').stop().animate({
					opacity: '0'
				}, 10);

			} else if (currPos >= offset*2/3 && atTop) {

				// $('#navbar').stop().animate({top: '0%'}, 800);
				$('#navbar').addClass("active");
				atTop = false;

				$('#description').addClass("showing");
				// $('#description').stop().animate({
				// 	opacity: '1',
				// 	margin: '17.5% 20%'
				// }, 500);

				// name on blurred image at top
				$('#intro_title').stop().animate({
					opacity: '0'
				}, 10);

				$('.footer-wrapper').stop().animate({
					opacity: '1'
				}, 10);
			}

			// nav bar coloring code
			if (currPos > projectsTop-50) { // change nav to black, icons and text to white
				// $('#navbar ul').stop().animate({
				// 		backgroundColor: '#ffffff'
				// 	}, 100);

				$('#navbar ul').addClass("white");

				$('#navbar ul li a').addClass("white");
				// $('#navbar ul li a').stop().animate({
				// 		color: '#000000'
				// 	}, 100);

				$('#nav_title a').addClass("black");
				// $('#nav_title a').stop().animate({
				// 		color: '#000000'
				// 	}, 100);

				$('#twitter').attr('src', 'img/twitter_black.png');
				$('#linkedin').attr('src', 'img/linkedin_black.png');
				$('#github').attr('src', 'img/octocat_black.png');

			} else { // change nav to white, icons and text to black
			
				// $('#navbar ul').stop().animate({
				// 		backgroundColor: '#000000',
				// 		color: '#ffffff'
				// 	}, 100);
				$('#navbar ul').removeClass("white");


				$('#navbar ul li a').removeClass("white");

				// $('#navbar ul li a').stop().animate({
				// 		color: '#ffffff'
				// 	}, 100);

				$('#nav_title a').removeClass("black");

				// $('#nav_title a').stop().animate({
				// 		color: '#ffffff'
				// 	}, 100);

				$('#twitter').attr('src', 'img/twitter_white.png');
				$('#linkedin').attr('src', 'img/linkedin_white.png');
				$('#github').attr('src', 'img/octocat_white.png');

			}

			// scroll to bottom when 3/4 way through footer
			if (pos > lastScroll && $(window).scrollTop() + $(window).height() >= $(document).height()-75) {
				$('html, body').stop().animate({
					scrollTop: $(document).height()
				}, 250);
			}

			if($(window).scrollTop() + $(window).height() == $(document).height()) {
		       $('.footer-wrapper').css('z-index', 1);
		    } else {
		    	$('.footer-wrapper').css('z-index', -2);
		    }

		    lastScroll = pos;

		}, 20);
	});
});