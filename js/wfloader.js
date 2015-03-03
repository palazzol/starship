// Load them google fonts before starting...!
WebFontConfig = {
  google: {
	//families: [ 'Snippet', 'Arvo:700italic', 'Podkova:700', 'Inconsolata:400' ]
	families: [ 'Inconsolata:400' ]
  },

  active: function() {
	// do something
	main();
  }
};
(function() {
	var wf = document.createElement('script');
	wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
		'://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
	wf.type = 'text/javascript';
	wf.async = 'true';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(wf, s);
})();
