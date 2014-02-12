$(function () {

	$(window).scroll(function(){

		var offset = $('.container').offset().top;
		console.log(offset);

		if ($(window).scrollTop() >= offset)
		{
			console.log($(window).scrollTop());
			// show nav bar in here
			$('#navbar').animate({top: '0%'}, 500);
		}

		// if ($(window).scrollTop() <= offset){
		// 	console.log($(window).scrollTop());
		// 	// show nav bar in here
		// 	$('#navbar').animate({top: '-100%'}, 500);
		
		// }

		return false;
	});
	
});