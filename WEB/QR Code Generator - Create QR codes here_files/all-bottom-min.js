(function(e,h,l,c){e.fn.sonar=function(o,n){if(typeof o==="boolean"){n=o;o=c}return e.sonar(this[0],o,n)};var f=l.body,a="scrollin",m="scrollout",b=function(r,n,t){if(r){f||(f=l.body);var s=r,u=0,v=f.offsetHeight,o=h.innerHeight||l.documentElement.clientHeight||f.clientHeight||0,q=l.documentElement.scrollTop||h.pageYOffset||f.scrollTop||0,p=r.offsetHeight||0;if(!r.sonarElemTop||r.sonarBodyHeight!==v){if(s.offsetParent){do{u+=s.offsetTop}while(s=s.offsetParent)}r.sonarElemTop=u;r.sonarBodyHeight=v}n=n===c?0:n;return(!(r.sonarElemTop+(t?0:p)<q-n)&&!(r.sonarElemTop+(t?p:0)>q+o+n))}},d={},j=0,i=function(){setTimeout(function(){var s,o,t,q,p,r,n;for(t in d){o=d[t];for(r=0,n=o.length;r<n;r++){q=o[r];s=q.elem;p=b(s,q.px,q.full);if(t===m?!p:p){if(!q.tr){if(s[t]){e(s).trigger(t);q.tr=1}else{o.splice(r,1);r--;n--}}}else{q.tr=0}}}},25)},k=function(n,o){n[o]=0},g=function(r,p){var t=p.px,q=p.full,s=p.evt,o=b(r,t,q),n=0;r[s]=1;if(s===m?!o:o){setTimeout(function(){e(r).trigger(s===m?m:a)},0);n=1}d[s].push({elem:r,px:t,full:q,tr:n});if(!j){e(h).bind("scroll",i);j=1}};e.sonar=b;d[a]=[];e.event.special[a]={add:function(n){var p=n.data||{},o=this;if(!o[a]){g(this,{px:p.distance,full:p.full,evt:a})}},remove:function(n){k(this,a)}};d[m]=[];e.event.special[m]={add:function(n){var p=n.data||{},o=this;if(!o[m]){g(o,{px:p.distance,full:p.full,evt:m})}},remove:function(n){k(this,m)}}})(jQuery,window,document);
(function($) {
	lazy_load_init();
	$( 'body' ).bind( 'post-load', lazy_load_init ); // Work with WP.com infinite scroll

	function lazy_load_init() {
		$( 'img[data-lazy-src-super]' ).bind( 'beforeShow' , function() {
			lazy_load_image( this );
		});

		$( 'img[data-lazy-src]' ).bind( 'scrollin', { distance: 150 }, function() {
			lazy_load_image( this );
		});

		// We need to force load gallery images in Jetpack Carousel and give up lazy-loading otherwise images don't show up correctly
		$( '[data-carousel-extra]' ).each( function() {
			$( this ).find( 'img[data-lazy-src]' ).each( function() {
				lazy_load_image( this );
			} );		
		} );
	}

	function lazy_load_image( img ) {
		var $img = jQuery( img ),
			src = $img.attr( 'data-lazy-src' );

		$img.unbind( 'scrollin' ) // remove event binding
			.hide()
			.removeAttr( 'data-lazy-src' )
			.attr( 'data-lazy-loaded', 'true' );

		img.src = src;
		$img.fadeIn();
	}
})(jQuery);

/*
 * jQuery FlexSlider v2.2.2
 * Copyright 2012 WooThemes
 * Contributing Author: Tyler Smith
 */
;
(function ($) {

  //FlexSlider: Object Instance
  $.flexslider = function(el, options) {
    var slider = $(el);

    // making variables public
    slider.vars = $.extend({}, $.flexslider.defaults, options);

    var namespace = slider.vars.namespace,
        msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture,
        touch = (( "ontouchstart" in window ) || msGesture || window.DocumentTouch && document instanceof DocumentTouch) && slider.vars.touch,
        // depricating this idea, as devices are being released with both of these events
        //eventType = (touch) ? "touchend" : "click",
        eventType = "click touchend MSPointerUp keyup",
        watchedEvent = "",
        watchedEventClearTimer,
        vertical = slider.vars.direction === "vertical",
        reverse = slider.vars.reverse,
        carousel = (slider.vars.itemWidth > 0),
        fade = slider.vars.animation === "fade",
        asNav = slider.vars.asNavFor !== "",
        methods = {},
        focused = true;

    // Store a reference to the slider object
    $.data(el, "flexslider", slider);

    // Private slider methods
    methods = {
      init: function() {
        slider.animating = false;
        // Get current slide and make sure it is a number
        slider.currentSlide = parseInt( ( slider.vars.startAt ? slider.vars.startAt : 0), 10 );
        if ( isNaN( slider.currentSlide ) ) slider.currentSlide = 0;
        slider.animatingTo = slider.currentSlide;
        slider.atEnd = (slider.currentSlide === 0 || slider.currentSlide === slider.last);
        slider.containerSelector = slider.vars.selector.substr(0,slider.vars.selector.search(' '));
        slider.slides = $(slider.vars.selector, slider);
        slider.container = $(slider.containerSelector, slider);
        slider.count = slider.slides.length;
        // SYNC:
        slider.syncExists = $(slider.vars.sync).length > 0;
        // SLIDE:
        if (slider.vars.animation === "slide") slider.vars.animation = "swing";
        slider.prop = (vertical) ? "top" : "marginLeft";
        slider.args = {};
        // SLIDESHOW:
        slider.manualPause = false;
        slider.stopped = false;
        //PAUSE WHEN INVISIBLE
        slider.started = false;
        slider.startTimeout = null;
        // TOUCH/USECSS:
        slider.transitions = !slider.vars.video && !fade && slider.vars.useCSS && (function() {
          var obj = document.createElement('div'),
              props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
          for (var i in props) {
            if ( obj.style[ props[i] ] !== undefined ) {
              slider.pfx = props[i].replace('Perspective','').toLowerCase();
              slider.prop = "-" + slider.pfx + "-transform";
              return true;
            }
          }
          return false;
        }());
        slider.ensureAnimationEnd = '';
        // CONTROLSCONTAINER:
        if (slider.vars.controlsContainer !== "") slider.controlsContainer = $(slider.vars.controlsContainer).length > 0 && $(slider.vars.controlsContainer);
        // MANUAL:
        if (slider.vars.manualControls !== "") slider.manualControls = $(slider.vars.manualControls).length > 0 && $(slider.vars.manualControls);

        // RANDOMIZE:
        if (slider.vars.randomize) {
          slider.slides.sort(function() { return (Math.round(Math.random())-0.5); });
          slider.container.empty().append(slider.slides);
        }

        slider.doMath();

        // INIT
        slider.setup("init");

        // CONTROLNAV:
        if (slider.vars.controlNav) methods.controlNav.setup();

        // DIRECTIONNAV:
        if (slider.vars.directionNav) methods.directionNav.setup();

        // KEYBOARD:
        if (slider.vars.keyboard && ($(slider.containerSelector).length === 1 || slider.vars.multipleKeyboard)) {
          $(document).bind('keyup', function(event) {
            var keycode = event.keyCode;
            if (!slider.animating && (keycode === 39 || keycode === 37)) {
              var target = (keycode === 39) ? slider.getTarget('next') :
                           (keycode === 37) ? slider.getTarget('prev') : false;
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }
          });
        }
        // MOUSEWHEEL:
        if (slider.vars.mousewheel) {
          slider.bind('mousewheel', function(event, delta, deltaX, deltaY) {
            event.preventDefault();
            var target = (delta < 0) ? slider.getTarget('next') : slider.getTarget('prev');
            slider.flexAnimate(target, slider.vars.pauseOnAction);
          });
        }

        // PAUSEPLAY
        if (slider.vars.pausePlay) methods.pausePlay.setup();

        //PAUSE WHEN INVISIBLE
        if (slider.vars.slideshow && slider.vars.pauseInvisible) methods.pauseInvisible.init();

        // SLIDSESHOW
        if (slider.vars.slideshow) {
          if (slider.vars.pauseOnHover) {
            slider.hover(function() {
              if (!slider.manualPlay && !slider.manualPause) slider.pause();
            }, function() {
              if (!slider.manualPause && !slider.manualPlay && !slider.stopped) slider.play();
            });
          }
          // initialize animation
          //If we're visible, or we don't use PageVisibility API
          if(!slider.vars.pauseInvisible || !methods.pauseInvisible.isHidden()) {
            (slider.vars.initDelay > 0) ? slider.startTimeout = setTimeout(slider.play, slider.vars.initDelay) : slider.play();
          }
        }

        // ASNAV:
        if (asNav) methods.asNav.setup();

        // TOUCH
        if (touch && slider.vars.touch) methods.touch();

        // FADE&&SMOOTHHEIGHT || SLIDE:
        if (!fade || (fade && slider.vars.smoothHeight)) $(window).bind("resize orientationchange focus", methods.resize);

        slider.find("img").attr("draggable", "false");

        // API: start() Callback
        setTimeout(function(){
          slider.vars.start(slider);
        }, 200);
      },
      asNav: {
        setup: function() {
          slider.asNav = true;
          slider.animatingTo = Math.floor(slider.currentSlide/slider.move);
          slider.currentItem = slider.currentSlide;
          slider.slides.removeClass(namespace + "active-slide").eq(slider.currentItem).addClass(namespace + "active-slide");
          if(!msGesture){
              slider.slides.on(eventType, function(e){
                e.preventDefault();
                var $slide = $(this),
                    target = $slide.index();
                var posFromLeft = $slide.offset().left - $(slider).scrollLeft(); // Find position of slide relative to left of slider container
                if( posFromLeft <= 0 && $slide.hasClass( namespace + 'active-slide' ) ) {
                  slider.flexAnimate(slider.getTarget("prev"), true);
                } else if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass(namespace + "active-slide")) {
                  slider.direction = (slider.currentItem < target) ? "next" : "prev";
                  slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
                }
              });
          }else{
              el._slider = slider;
              slider.slides.each(function (){
                  var that = this;
                  that._gesture = new MSGesture();
                  that._gesture.target = that;
                  that.addEventListener("MSPointerDown", function (e){
                      e.preventDefault();
                      if(e.currentTarget._gesture)
                          e.currentTarget._gesture.addPointer(e.pointerId);
                  }, false);
                  that.addEventListener("MSGestureTap", function (e){
                      e.preventDefault();
                      var $slide = $(this),
                          target = $slide.index();
                      if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass('active')) {
                          slider.direction = (slider.currentItem < target) ? "next" : "prev";
                          slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
                      }
                  });
              });
          }
        }
      },
      controlNav: {
        setup: function() {
          if (!slider.manualControls) {
            methods.controlNav.setupPaging();
          } else { // MANUALCONTROLS:
            methods.controlNav.setupManual();
          }
        },
        setupPaging: function() {
          var type = (slider.vars.controlNav === "thumbnails") ? 'control-thumbs' : 'control-paging',
              j = 1,
              item,
              slide;

          slider.controlNavScaffold = $('<ol class="'+ namespace + 'control-nav ' + namespace + type + '"></ol>');

          if (slider.pagingCount > 1) {
            for (var i = 0; i < slider.pagingCount; i++) {
              slide = slider.slides.eq(i);
              item = (slider.vars.controlNav === "thumbnails") ? '<img src="' + slide.attr( 'data-thumb' ) + '"/>' : '<a>' + j + '</a>';
              if ( 'thumbnails' === slider.vars.controlNav && true === slider.vars.thumbCaptions ) {
                var captn = slide.attr( 'data-thumbcaption' );
                if ( '' != captn && undefined != captn ) item += '<span class="' + namespace + 'caption">' + captn + '</span>';
              }
              slider.controlNavScaffold.append('<li>' + item + '</li>');
              j++;
            }
          }

          // CONTROLSCONTAINER:
          (slider.controlsContainer) ? $(slider.controlsContainer).append(slider.controlNavScaffold) : slider.append(slider.controlNavScaffold);
          methods.controlNav.set();

          methods.controlNav.active();

          slider.controlNavScaffold.delegate('a, img', eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              var $this = $(this),
                  target = slider.controlNav.index($this);

              if (!$this.hasClass(namespace + 'active')) {
                slider.direction = (target > slider.currentSlide) ? "next" : "prev";
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();

          });
        },
        setupManual: function() {
          slider.controlNav = slider.manualControls;
          methods.controlNav.active();

          slider.controlNav.bind(eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              var $this = $(this),
                  target = slider.controlNav.index($this);

              if (!$this.hasClass(namespace + 'active')) {
                (target > slider.currentSlide) ? slider.direction = "next" : slider.direction = "prev";
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        set: function() {
          var selector = (slider.vars.controlNav === "thumbnails") ? 'img' : 'a';
          slider.controlNav = $('.' + namespace + 'control-nav li ' + selector, (slider.controlsContainer) ? slider.controlsContainer : slider);
        },
        active: function() {
          slider.controlNav.removeClass(namespace + "active").eq(slider.animatingTo).addClass(namespace + "active");
        },
        update: function(action, pos) {
          if (slider.pagingCount > 1 && action === "add") {
            slider.controlNavScaffold.append($('<li><a>' + slider.count + '</a></li>'));
          } else if (slider.pagingCount === 1) {
            slider.controlNavScaffold.find('li').remove();
          } else {
            slider.controlNav.eq(pos).closest('li').remove();
          }
          methods.controlNav.set();
          (slider.pagingCount > 1 && slider.pagingCount !== slider.controlNav.length) ? slider.update(pos, action) : methods.controlNav.active();
        }
      },
      directionNav: {
        setup: function() {
          var directionNavScaffold = $('<ul class="' + namespace + 'direction-nav"><li><a class="' + namespace + 'prev" href="#">' + slider.vars.prevText + '</a></li><li><a class="' + namespace + 'next" href="#">' + slider.vars.nextText + '</a></li></ul>');

          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            $(slider.controlsContainer).append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider.controlsContainer);
          } else {
            slider.append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider);
          }

          methods.directionNav.update();

          slider.directionNav.bind(eventType, function(event) {
            event.preventDefault();
            var target;

            if (watchedEvent === "" || watchedEvent === event.type) {
              target = ($(this).hasClass(namespace + 'next')) ? slider.getTarget('next') : slider.getTarget('prev');
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function() {
          var disabledClass = namespace + 'disabled';
          if (slider.pagingCount === 1) {
            slider.directionNav.addClass(disabledClass).attr('tabindex', '-1');
          } else if (!slider.vars.animationLoop) {
            if (slider.animatingTo === 0) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "prev").addClass(disabledClass).attr('tabindex', '-1');
            } else if (slider.animatingTo === slider.last) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "next").addClass(disabledClass).attr('tabindex', '-1');
            } else {
              slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
            }
          } else {
            slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
          }
        }
      },
      pausePlay: {
        setup: function() {
          var pausePlayScaffold = $('<div class="' + namespace + 'pauseplay"><a></a></div>');

          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            slider.controlsContainer.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider.controlsContainer);
          } else {
            slider.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider);
          }

          methods.pausePlay.update((slider.vars.slideshow) ? namespace + 'pause' : namespace + 'play');

          slider.pausePlay.bind(eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              if ($(this).hasClass(namespace + 'pause')) {
                slider.manualPause = true;
                slider.manualPlay = false;
                slider.pause();
              } else {
                slider.manualPause = false;
                slider.manualPlay = true;
                slider.play();
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function(state) {
          (state === "play") ? slider.pausePlay.removeClass(namespace + 'pause').addClass(namespace + 'play').html(slider.vars.playText) : slider.pausePlay.removeClass(namespace + 'play').addClass(namespace + 'pause').html(slider.vars.pauseText);
        }
      },
      touch: function() {
        var startX,
          startY,
          offset,
          cwidth,
          dx,
          startT,
          scrolling = false,
          localX = 0,
          localY = 0,
          accDx = 0;

        if(!msGesture){
            el.addEventListener('touchstart', onTouchStart, false);

            function onTouchStart(e) {
              if (slider.animating) {
                e.preventDefault();
              } else if ( ( window.navigator.msPointerEnabled ) || e.touches.length === 1 ) {
                slider.pause();
                // CAROUSEL:
                cwidth = (vertical) ? slider.h : slider. w;
                startT = Number(new Date());
                // CAROUSEL:

                // Local vars for X and Y points.
                localX = e.touches[0].pageX;
                localY = e.touches[0].pageY;

                offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                         (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                         (carousel && slider.currentSlide === slider.last) ? slider.limit :
                         (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                         (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
                startX = (vertical) ? localY : localX;
                startY = (vertical) ? localX : localY;

                el.addEventListener('touchmove', onTouchMove, false);
                el.addEventListener('touchend', onTouchEnd, false);
              }
            }

            function onTouchMove(e) {
              // Local vars for X and Y points.

              localX = e.touches[0].pageX;
              localY = e.touches[0].pageY;

              dx = (vertical) ? startX - localY : startX - localX;
              scrolling = (vertical) ? (Math.abs(dx) < Math.abs(localX - startY)) : (Math.abs(dx) < Math.abs(localY - startY));

              var fxms = 500;

              if ( ! scrolling || Number( new Date() ) - startT > fxms ) {
                e.preventDefault();
                if (!fade && slider.transitions) {
                  if (!slider.vars.animationLoop) {
                    dx = dx/((slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0) ? (Math.abs(dx)/cwidth+2) : 1);
                  }
                  slider.setProps(offset + dx, "setTouch");
                }
              }
            }

            function onTouchEnd(e) {
              // finish the touch by undoing the touch session
              el.removeEventListener('touchmove', onTouchMove, false);

              if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
                var updateDx = (reverse) ? -dx : dx,
                    target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

                if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth/2)) {
                  slider.flexAnimate(target, slider.vars.pauseOnAction);
                } else {
                  if (!fade) slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                }
              }
              el.removeEventListener('touchend', onTouchEnd, false);

              startX = null;
              startY = null;
              dx = null;
              offset = null;
            }
        }else{
            el.style.msTouchAction = "none";
            el._gesture = new MSGesture();
            el._gesture.target = el;
            el.addEventListener("MSPointerDown", onMSPointerDown, false);
            el._slider = slider;
            el.addEventListener("MSGestureChange", onMSGestureChange, false);
            el.addEventListener("MSGestureEnd", onMSGestureEnd, false);

            function onMSPointerDown(e){
                e.stopPropagation();
                if (slider.animating) {
                    e.preventDefault();
                }else{
                    slider.pause();
                    el._gesture.addPointer(e.pointerId);
                    accDx = 0;
                    cwidth = (vertical) ? slider.h : slider. w;
                    startT = Number(new Date());
                    // CAROUSEL:

                    offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                        (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                            (carousel && slider.currentSlide === slider.last) ? slider.limit :
                                (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                                    (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
                }
            }

            function onMSGestureChange(e) {
                e.stopPropagation();
                var slider = e.target._slider;
                if(!slider){
                    return;
                }
                var transX = -e.translationX,
                    transY = -e.translationY;

                //Accumulate translations.
                accDx = accDx + ((vertical) ? transY : transX);
                dx = accDx;
                scrolling = (vertical) ? (Math.abs(accDx) < Math.abs(-transX)) : (Math.abs(accDx) < Math.abs(-transY));

                if(e.detail === e.MSGESTURE_FLAG_INERTIA){
                    setImmediate(function (){
                        el._gesture.stop();
                    });

                    return;
                }

                if (!scrolling || Number(new Date()) - startT > 500) {
                    e.preventDefault();
                    if (!fade && slider.transitions) {
                        if (!slider.vars.animationLoop) {
                            dx = accDx / ((slider.currentSlide === 0 && accDx < 0 || slider.currentSlide === slider.last && accDx > 0) ? (Math.abs(accDx) / cwidth + 2) : 1);
                        }
                        slider.setProps(offset + dx, "setTouch");
                    }
                }
            }

            function onMSGestureEnd(e) {
                e.stopPropagation();
                var slider = e.target._slider;
                if(!slider){
                    return;
                }
                if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
                    var updateDx = (reverse) ? -dx : dx,
                        target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

                    if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth/2)) {
                        slider.flexAnimate(target, slider.vars.pauseOnAction);
                    } else {
                        if (!fade) slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                    }
                }

                startX = null;
                startY = null;
                dx = null;
                offset = null;
                accDx = 0;
            }
        }
      },
      resize: function() {
        if (!slider.animating && slider.is(':visible')) {
          if (!carousel) slider.doMath();

          if (fade) {
            // SMOOTH HEIGHT:
            methods.smoothHeight();
          } else if (carousel) { //CAROUSEL:
            slider.slides.width(slider.computedW);
            slider.update(slider.pagingCount);
            slider.setProps();
          }
          else if (vertical) { //VERTICAL:
            slider.viewport.height(slider.h);
            slider.setProps(slider.h, "setTotal");
          } else {
            // SMOOTH HEIGHT:
            if (slider.vars.smoothHeight) methods.smoothHeight();
            slider.newSlides.width(slider.computedW);
            slider.setProps(slider.computedW, "setTotal");
          }
        }
      },
      smoothHeight: function(dur) {
        if (!vertical || fade) {
          var $obj = (fade) ? slider : slider.viewport;
          (dur) ? $obj.animate({"height": slider.slides.eq(slider.animatingTo).height()}, dur) : $obj.height(slider.slides.eq(slider.animatingTo).height());
        }
      },
      sync: function(action) {
        var $obj = $(slider.vars.sync).data("flexslider"),
            target = slider.animatingTo;

        switch (action) {
          case "animate": $obj.flexAnimate(target, slider.vars.pauseOnAction, false, true); break;
          case "play": if (!$obj.playing && !$obj.asNav) { $obj.play(); } break;
          case "pause": $obj.pause(); break;
        }
      },
      uniqueID: function($clone) {
        // Append _clone to current level and children elements with id attributes
        $clone.filter( '[id]' ).add($clone.find( '[id]' )).each(function() {
          var $this = $(this);
          $this.attr( 'id', $this.attr( 'id' ) + '_clone' );
        });
        return $clone;
      },
      pauseInvisible: {
        visProp: null,
        init: function() {
          var prefixes = ['webkit','moz','ms','o'];

          if ('hidden' in document) return 'hidden';
          for (var i = 0; i < prefixes.length; i++) {
            if ((prefixes[i] + 'Hidden') in document)
            methods.pauseInvisible.visProp = prefixes[i] + 'Hidden';
          }
          if (methods.pauseInvisible.visProp) {
            var evtname = methods.pauseInvisible.visProp.replace(/[H|h]idden/,'') + 'visibilitychange';
            document.addEventListener(evtname, function() {
              if (methods.pauseInvisible.isHidden()) {
                if(slider.startTimeout) clearTimeout(slider.startTimeout); //If clock is ticking, stop timer and prevent from starting while invisible
                else slider.pause(); //Or just pause
              }
              else {
                if(slider.started) slider.play(); //Initiated before, just play
                else (slider.vars.initDelay > 0) ? setTimeout(slider.play, slider.vars.initDelay) : slider.play(); //Didn't init before: simply init or wait for it
              }
            });
          }
        },
        isHidden: function() {
          return document[methods.pauseInvisible.visProp] || false;
        }
      },
      setToClearWatchedEvent: function() {
        clearTimeout(watchedEventClearTimer);
        watchedEventClearTimer = setTimeout(function() {
          watchedEvent = "";
        }, 3000);
      }
    };

    // public methods
    slider.flexAnimate = function(target, pause, override, withSync, fromNav) {
      if (!slider.vars.animationLoop && target !== slider.currentSlide) {
        slider.direction = (target > slider.currentSlide) ? "next" : "prev";
      }

      if (asNav && slider.pagingCount === 1) slider.direction = (slider.currentItem < target) ? "next" : "prev";

      if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(":visible")) {
        if (asNav && withSync) {
          var master = $(slider.vars.asNavFor).data('flexslider');
          slider.atEnd = target === 0 || target === slider.count - 1;
          master.flexAnimate(target, true, false, true, fromNav);
          slider.direction = (slider.currentItem < target) ? "next" : "prev";
          master.direction = slider.direction;

          if (Math.ceil((target + 1)/slider.visible) - 1 !== slider.currentSlide && target !== 0) {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            target = Math.floor(target/slider.visible);
          } else {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            return false;
          }
        }

        slider.animating = true;
        slider.animatingTo = target;

        // SLIDESHOW:
        if (pause) slider.pause();

        // API: before() animation Callback
        slider.vars.before(slider);

        // SYNC:
        if (slider.syncExists && !fromNav) methods.sync("animate");

        // CONTROLNAV
        if (slider.vars.controlNav) methods.controlNav.active();

        // !CAROUSEL:
        // CANDIDATE: slide active class (for add/remove slide)
        if (!carousel) slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide');

        // INFINITE LOOP:
        // CANDIDATE: atEnd
        slider.atEnd = target === 0 || target === slider.last;

        // DIRECTIONNAV:
        if (slider.vars.directionNav) methods.directionNav.update();

        if (target === slider.last) {
          // API: end() of cycle Callback
          slider.vars.end(slider);
          // SLIDESHOW && !INFINITE LOOP:
          if (!slider.vars.animationLoop) slider.pause();
        }

        // SLIDE:
        if (!fade) {
          var dimension = (vertical) ? slider.slides.filter(':first').height() : slider.computedW,
              margin, slideString, calcNext;

          // INFINITE LOOP / REVERSE:
          if (carousel) {
            //margin = (slider.vars.itemWidth > slider.w) ? slider.vars.itemMargin * 2 : slider.vars.itemMargin;
            margin = slider.vars.itemMargin;
            calcNext = ((slider.itemW + margin) * slider.move) * slider.animatingTo;
            slideString = (calcNext > slider.limit && slider.visible !== 1) ? slider.limit : calcNext;
          } else if (slider.currentSlide === 0 && target === slider.count - 1 && slider.vars.animationLoop && slider.direction !== "next") {
            slideString = (reverse) ? (slider.count + slider.cloneOffset) * dimension : 0;
          } else if (slider.currentSlide === slider.last && target === 0 && slider.vars.animationLoop && slider.direction !== "prev") {
            slideString = (reverse) ? 0 : (slider.count + 1) * dimension;
          } else {
            slideString = (reverse) ? ((slider.count - 1) - target + slider.cloneOffset) * dimension : (target + slider.cloneOffset) * dimension;
          }
          slider.setProps(slideString, "", slider.vars.animationSpeed);
          if (slider.transitions) {
            if (!slider.vars.animationLoop || !slider.atEnd) {
              slider.animating = false;
              slider.currentSlide = slider.animatingTo;
            }
            
            // Unbind previous transitionEnd events and re-bind new transitionEnd event
            slider.container.unbind("webkitTransitionEnd transitionend");
            slider.container.bind("webkitTransitionEnd transitionend", function() {
              clearTimeout(slider.ensureAnimationEnd);
              slider.wrapup(dimension);
            });

            // Insurance for the ever-so-fickle transitionEnd event
            clearTimeout(slider.ensureAnimationEnd);
            slider.ensureAnimationEnd = setTimeout(function() {
              slider.wrapup(dimension);
            }, slider.vars.animationSpeed + 100);

          } else {
            slider.container.animate(slider.args, slider.vars.animationSpeed, slider.vars.easing, function(){
              slider.wrapup(dimension);
            });
          }
        } else { // FADE:
          if (!touch) {
            //slider.slides.eq(slider.currentSlide).fadeOut(slider.vars.animationSpeed, slider.vars.easing);
            //slider.slides.eq(target).fadeIn(slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);

            slider.slides.eq(slider.currentSlide).css({"zIndex": 1}).animate({"opacity": 0}, slider.vars.animationSpeed, slider.vars.easing);
            slider.slides.eq(target).css({"zIndex": 2}).animate({"opacity": 1}, slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);

          } else {
            slider.slides.eq(slider.currentSlide).css({ "opacity": 0, "zIndex": 1 });
            slider.slides.eq(target).css({ "opacity": 1, "zIndex": 2 });
            slider.wrapup(dimension);
          }
        }
        // SMOOTH HEIGHT:
        if (slider.vars.smoothHeight) methods.smoothHeight(slider.vars.animationSpeed);
      }
    };
    slider.wrapup = function(dimension) {
      // SLIDE:
      if (!fade && !carousel) {
        if (slider.currentSlide === 0 && slider.animatingTo === slider.last && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpEnd");
        } else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpStart");
        }
      }
      slider.animating = false;
      slider.currentSlide = slider.animatingTo;
      // API: after() animation Callback
      slider.vars.after(slider);
    };

    // SLIDESHOW:
    slider.animateSlides = function() {
      if (!slider.animating && focused ) slider.flexAnimate(slider.getTarget("next"));
    };
    // SLIDESHOW:
    slider.pause = function() {
      clearInterval(slider.animatedSlides);
      slider.animatedSlides = null;
      slider.playing = false;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) methods.pausePlay.update("play");
      // SYNC:
      if (slider.syncExists) methods.sync("pause");
    };
    // SLIDESHOW:
    slider.play = function() {
      if (slider.playing) clearInterval(slider.animatedSlides);
      slider.animatedSlides = slider.animatedSlides || setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
      slider.started = slider.playing = true;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) methods.pausePlay.update("pause");
      // SYNC:
      if (slider.syncExists) methods.sync("play");
    };
    // STOP:
    slider.stop = function () {
      slider.pause();
      slider.stopped = true;
    };
    slider.canAdvance = function(target, fromNav) {
      // ASNAV:
      var last = (asNav) ? slider.pagingCount - 1 : slider.last;
      return (fromNav) ? true :
             (asNav && slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") ? true :
             (asNav && slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? false :
             (target === slider.currentSlide && !asNav) ? false :
             (slider.vars.animationLoop) ? true :
             (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
             (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
             true;
    };
    slider.getTarget = function(dir) {
      slider.direction = dir;
      if (dir === "next") {
        return (slider.currentSlide === slider.last) ? 0 : slider.currentSlide + 1;
      } else {
        return (slider.currentSlide === 0) ? slider.last : slider.currentSlide - 1;
      }
    };

    // SLIDE:
    slider.setProps = function(pos, special, dur) {
      var target = (function() {
        var posCheck = (pos) ? pos : ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo,
            posCalc = (function() {
              if (carousel) {
                return (special === "setTouch") ? pos :
                       (reverse && slider.animatingTo === slider.last) ? 0 :
                       (reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                       (slider.animatingTo === slider.last) ? slider.limit : posCheck;
              } else {
                switch (special) {
                  case "setTotal": return (reverse) ? ((slider.count - 1) - slider.currentSlide + slider.cloneOffset) * pos : (slider.currentSlide + slider.cloneOffset) * pos;
                  case "setTouch": return (reverse) ? pos : pos;
                  case "jumpEnd": return (reverse) ? pos : slider.count * pos;
                  case "jumpStart": return (reverse) ? slider.count * pos : pos;
                  default: return pos;
                }
              }
            }());

            return (posCalc * -1) + "px";
          }());

      if (slider.transitions) {
        target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + target + ",0,0)";
        dur = (dur !== undefined) ? (dur/1000) + "s" : "0s";
        slider.container.css("-" + slider.pfx + "-transition-duration", dur);
         slider.container.css("transition-duration", dur);
      }

      slider.args[slider.prop] = target;
      if (slider.transitions || dur === undefined) slider.container.css(slider.args);

      slider.container.css('transform',target);
    };

    slider.setup = function(type) {
      // SLIDE:
      if (!fade) {
        var sliderOffset, arr;

        if (type === "init") {
          slider.viewport = $('<div class="' + namespace + 'viewport"></div>').css({"overflow": "hidden", "position": "relative"}).appendTo(slider).append(slider.container);
          // INFINITE LOOP:
          slider.cloneCount = 0;
          slider.cloneOffset = 0;
          // REVERSE:
          if (reverse) {
            arr = $.makeArray(slider.slides).reverse();
            slider.slides = $(arr);
            slider.container.empty().append(slider.slides);
          }
        }
        // INFINITE LOOP && !CAROUSEL:
        if (slider.vars.animationLoop && !carousel) {
          slider.cloneCount = 2;
          slider.cloneOffset = 1;
          // clear out old clones
          if (type !== "init") slider.container.find('.clone').remove();
          slider.container.append(methods.uniqueID(slider.slides.first().clone().addClass('clone')).attr('aria-hidden', 'true'))
                          .prepend(methods.uniqueID(slider.slides.last().clone().addClass('clone')).attr('aria-hidden', 'true'));
        }
        slider.newSlides = $(slider.vars.selector, slider);

        sliderOffset = (reverse) ? slider.count - 1 - slider.currentSlide + slider.cloneOffset : slider.currentSlide + slider.cloneOffset;
        // VERTICAL:
        if (vertical && !carousel) {
          slider.container.height((slider.count + slider.cloneCount) * 200 + "%").css("position", "absolute").width("100%");
          setTimeout(function(){
            slider.newSlides.css({"display": "block"});
            slider.doMath();
            slider.viewport.height(slider.h);
            slider.setProps(sliderOffset * slider.h, "init");
          }, (type === "init") ? 100 : 0);
        } else {
          slider.container.width((slider.count + slider.cloneCount) * 200 + "%");
          slider.setProps(sliderOffset * slider.computedW, "init");
          setTimeout(function(){
            slider.doMath();
            slider.newSlides.css({"width": slider.computedW, "float": "left", "display": "block"});
            // SMOOTH HEIGHT:
            if (slider.vars.smoothHeight) methods.smoothHeight();
          }, (type === "init") ? 100 : 0);
        }
      } else { // FADE:
        slider.slides.css({"width": "100%", "float": "left", "marginRight": "-100%", "position": "relative"});
        if (type === "init") {
          if (!touch) {
            //slider.slides.eq(slider.currentSlide).fadeIn(slider.vars.animationSpeed, slider.vars.easing);
            if (slider.vars.fadeFirstSlide == false) {
              slider.slides.css({ "opacity": 0, "display": "block", "zIndex": 1 }).eq(slider.currentSlide).css({"zIndex": 2}).css({"opacity": 1});
            } else {
              slider.slides.css({ "opacity": 0, "display": "block", "zIndex": 1 }).eq(slider.currentSlide).css({"zIndex": 2}).animate({"opacity": 1},slider.vars.animationSpeed,slider.vars.easing);
            }
          } else {
            slider.slides.css({ "opacity": 0, "display": "block", "webkitTransition": "opacity " + slider.vars.animationSpeed / 1000 + "s ease", "zIndex": 1 }).eq(slider.currentSlide).css({ "opacity": 1, "zIndex": 2});
          }
        }
        // SMOOTH HEIGHT:
        if (slider.vars.smoothHeight) methods.smoothHeight();
      }
      // !CAROUSEL:
      // CANDIDATE: active slide
      if (!carousel) slider.slides.removeClass(namespace + "active-slide").eq(slider.currentSlide).addClass(namespace + "active-slide");

      //FlexSlider: init() Callback
      slider.vars.init(slider);
    };

    slider.doMath = function() {
      var slide = slider.slides.first(),
          slideMargin = slider.vars.itemMargin,
          minItems = slider.vars.minItems,
          maxItems = slider.vars.maxItems;

      slider.w = (slider.viewport===undefined) ? slider.width() : slider.viewport.width();
      slider.h = slide.height();
      slider.boxPadding = slide.outerWidth() - slide.width();

      // CAROUSEL:
      if (carousel) {
        slider.itemT = slider.vars.itemWidth + slideMargin;
        slider.minW = (minItems) ? minItems * slider.itemT : slider.w;
        slider.maxW = (maxItems) ? (maxItems * slider.itemT) - slideMargin : slider.w;
        slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * (minItems - 1)))/minItems :
                       (slider.maxW < slider.w) ? (slider.w - (slideMargin * (maxItems - 1)))/maxItems :
                       (slider.vars.itemWidth > slider.w) ? slider.w : slider.vars.itemWidth;

        slider.visible = Math.floor(slider.w/(slider.itemW));
        slider.move = (slider.vars.move > 0 && slider.vars.move < slider.visible ) ? slider.vars.move : slider.visible;
        slider.pagingCount = Math.ceil(((slider.count - slider.visible)/slider.move) + 1);
        slider.last =  slider.pagingCount - 1;
        slider.limit = (slider.pagingCount === 1) ? 0 :
                       (slider.vars.itemWidth > slider.w) ? (slider.itemW * (slider.count - 1)) + (slideMargin * (slider.count - 1)) : ((slider.itemW + slideMargin) * slider.count) - slider.w - slideMargin;
      } else {
        slider.itemW = slider.w;
        slider.pagingCount = slider.count;
        slider.last = slider.count - 1;
      }
      slider.computedW = slider.itemW - slider.boxPadding;
    };

    slider.update = function(pos, action) {
      slider.doMath();

      // update currentSlide and slider.animatingTo if necessary
      if (!carousel) {
        if (pos < slider.currentSlide) {
          slider.currentSlide += 1;
        } else if (pos <= slider.currentSlide && pos !== 0) {
          slider.currentSlide -= 1;
        }
        slider.animatingTo = slider.currentSlide;
      }

      // update controlNav
      if (slider.vars.controlNav && !slider.manualControls) {
        if ((action === "add" && !carousel) || slider.pagingCount > slider.controlNav.length) {
          methods.controlNav.update("add");
        } else if ((action === "remove" && !carousel) || slider.pagingCount < slider.controlNav.length) {
          if (carousel && slider.currentSlide > slider.last) {
            slider.currentSlide -= 1;
            slider.animatingTo -= 1;
          }
          methods.controlNav.update("remove", slider.last);
        }
      }
      // update directionNav
      if (slider.vars.directionNav) methods.directionNav.update();

    };

    slider.addSlide = function(obj, pos) {
      var $obj = $(obj);

      slider.count += 1;
      slider.last = slider.count - 1;

      // append new slide
      if (vertical && reverse) {
        (pos !== undefined) ? slider.slides.eq(slider.count - pos).after($obj) : slider.container.prepend($obj);
      } else {
        (pos !== undefined) ? slider.slides.eq(pos).before($obj) : slider.container.append($obj);
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.update(pos, "add");

      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      //FlexSlider: added() Callback
      slider.vars.added(slider);
    };
    slider.removeSlide = function(obj) {
      var pos = (isNaN(obj)) ? slider.slides.index($(obj)) : obj;

      // update count
      slider.count -= 1;
      slider.last = slider.count - 1;

      // remove slide
      if (isNaN(obj)) {
        $(obj, slider.slides).remove();
      } else {
        (vertical && reverse) ? slider.slides.eq(slider.last).remove() : slider.slides.eq(obj).remove();
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.doMath();
      slider.update(pos, "remove");

      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      // FlexSlider: removed() Callback
      slider.vars.removed(slider);
    };

    //FlexSlider: Initialize
    methods.init();
  };

  // Ensure the slider isn't focussed if the window loses focus.
  $( window ).blur( function ( e ) {
    focused = false;
  }).focus( function ( e ) {
    focused = true;
  });

  //FlexSlider: Default Settings
  $.flexslider.defaults = {
    namespace: "flex-",             //{NEW} String: Prefix string attached to the class of every element generated by the plugin
    selector: ".slides > li",       //{NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
    animation: "fade",              //String: Select your animation type, "fade" or "slide"
    easing: "swing",                //{NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
    direction: "horizontal",        //String: Select the sliding direction, "horizontal" or "vertical"
    reverse: false,                 //{NEW} Boolean: Reverse the animation direction
    animationLoop: true,            //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
    smoothHeight: false,            //{NEW} Boolean: Allow height of the slider to animate smoothly in horizontal mode
    startAt: 0,                     //Integer: The slide that the slider should start on. Array notation (0 = first slide)
    slideshow: true,                //Boolean: Animate slider automatically
    slideshowSpeed: 7000,           //Integer: Set the speed of the slideshow cycling, in milliseconds
    animationSpeed: 600,            //Integer: Set the speed of animations, in milliseconds
    initDelay: 0,                   //{NEW} Integer: Set an initialization delay, in milliseconds
    randomize: false,               //Boolean: Randomize slide order
    fadeFirstSlide: true,           //Boolean: Fade in the first slide when animation type is "fade"
    thumbCaptions: false,           //Boolean: Whether or not to put captions on thumbnails when using the "thumbnails" controlNav.

    // Usability features
    pauseOnAction: true,            //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
    pauseOnHover: false,            //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
    pauseInvisible: true,   		//{NEW} Boolean: Pause the slideshow when tab is invisible, resume when visible. Provides better UX, lower CPU usage.
    useCSS: true,                   //{NEW} Boolean: Slider will use CSS3 transitions if available
    touch: true,                    //{NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
    video: false,                   //{NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches

    // Primary Controls
    controlNav: true,               //Boolean: Create navigation for paging control of each slide? Note: Leave true for manualControls usage
    directionNav: true,             //Boolean: Create navigation for previous/next navigation? (true/false)
    prevText: "Previous",           //String: Set the text for the "previous" directionNav item
    nextText: "Next",               //String: Set the text for the "next" directionNav item

    // Secondary Navigation
    keyboard: true,                 //Boolean: Allow slider navigating via keyboard left/right keys
    multipleKeyboard: false,        //{NEW} Boolean: Allow keyboard navigation to affect multiple sliders. Default behavior cuts out keyboard navigation with more than one slider present.
    mousewheel: false,              //{UPDATED} Boolean: Requires jquery.mousewheel.js (https://github.com/brandonaaron/jquery-mousewheel) - Allows slider navigating via mousewheel
    pausePlay: false,               //Boolean: Create pause/play dynamic element
    pauseText: "Pause",             //String: Set the text for the "pause" pausePlay item
    playText: "Play",               //String: Set the text for the "play" pausePlay item

    // Special properties
    controlsContainer: "",          //{UPDATED} jQuery Object/Selector: Declare which container the navigation elements should be appended too. Default container is the FlexSlider element. Example use would be $(".flexslider-container"). Property is ignored if given element is not found.
    manualControls: "",             //{UPDATED} jQuery Object/Selector: Declare custom control navigation. Examples would be $(".flex-control-nav li") or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
    sync: "",                       //{NEW} Selector: Mirror the actions performed on this slider with another slider. Use with care.
    asNavFor: "",                   //{NEW} Selector: Internal property exposed for turning the slider into a thumbnail navigation for another slider

    // Carousel Options
    itemWidth: 0,                   //{NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
    itemMargin: 0,                  //{NEW} Integer: Margin between carousel items.
    minItems: 1,                    //{NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
    maxItems: 0,                    //{NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
    move: 0,                        //{NEW} Integer: Number of carousel items that should move on animation. If 0, slider will move all visible items.
    allowOneSlide: true,           //{NEW} Boolean: Whether or not to allow a slider comprised of a single slide

    // Callback API
    start: function(){},            //Callback: function(slider) - Fires when the slider loads the first slide
    before: function(){},           //Callback: function(slider) - Fires asynchronously with each slider animation
    after: function(){},            //Callback: function(slider) - Fires after each slider animation completes
    end: function(){},              //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
    added: function(){},            //{NEW} Callback: function(slider) - Fires after a slide is added
    removed: function(){},           //{NEW} Callback: function(slider) - Fires after a slide is removed
    init: function() {}             //{NEW} Callback: function(slider) - Fires after the slider is initially setup
  };

  //FlexSlider: Plugin Function
  $.fn.flexslider = function(options) {
    if (options === undefined) options = {};

    if (typeof options === "object") {
      return this.each(function() {
        var $this = $(this),
            selector = (options.selector) ? options.selector : ".slides > li",
            $slides = $this.find(selector);

      if ( ( $slides.length === 1 && options.allowOneSlide === true ) || $slides.length === 0 ) {
          $slides.fadeIn(400);
          if (options.start) options.start($this);
        } else if ($this.data('flexslider') === undefined) {
          new $.flexslider(this, options);
        }
      });
    } else {
      // Helper strings to quickly perform functions on the slider
      var $slider = $(this).data('flexslider');
      switch (options) {
        case "play": $slider.play(); break;
        case "pause": $slider.pause(); break;
        case "stop": $slider.stop(); break;
        case "next": $slider.flexAnimate($slider.getTarget("next"), true); break;
        case "prev":
        case "previous": $slider.flexAnimate($slider.getTarget("prev"), true); break;
        default: if (typeof options === "number") $slider.flexAnimate(options, true);
      }
    }
  };
})(jQuery);

function animateLogo(){
	$('#carousels ul').animate({
		left:-380
	},2000,'ease',function(){
		$('#carousels ul li:first-child').clone().appendTo('#carousels ul');
		$('#carousels ul li:first-child').remove();
		$('#carousels ul').css({
			left:0
		});
		animateLogo();
	});
}


function initiate(){
	$('#carousels ul').animate({
		left:-380
	},2000,'ease',function(){
		$('#carousels ul li:first-child').clone().appendTo('#carousels ul');
		$('#carousels ul li:first-child').remove();
		$('#carousels ul').css({
			left:0
		});
		animateLogo();
	});
	
	
	$('#carouselInnerWrapper').hover(
		function() {
			$('#carousels ul').stop();
		},
		function(){
			var p = $('#carousels ul');
			var position = p.position();
			var posCurrent = -position.left;
			var distanceLeft = 380-posCurrent
			var timeLeft = (distanceLeft/380)*2000;
			
			
			$('#carousels ul').animate({
				left:-380
			},timeLeft,'ease',function(){
				$('#carousels ul li:first-child').clone().appendTo('#carousels ul');
				$('#carousels ul li:first-child').remove();
				$('#carousels ul').css({
					left:0
				});
				animateLogo();
			});
	});
}

$(document).ready(function() {
  if($(window).width() <= 991){
  	$('#carousels #carouselInnerWrapper').width($('#scroller').width());
	}else{
  	$('#carousels #carouselInnerWrapper').removeAttr('style');
	}
  /*
  if($('#scroller ul li').length < 10){
    $('#scroller ul li').each(function(){
      $(this).clone().appendTo('#scroller ul');
    });
  }
  */
  

//$('#carouselInnerWrapper').width($('#scroller').width());

if($('html').hasClass('html')){
	//initiate();	
	
	$('.next').click(function(){
  	var leftWidth;
  	if($(window).width()>= 1200){
    	leftWidth = 380;
  	}else{
    	leftWidth = 310;
  	}
  	$('#carousels ul li.before-active').each(function(){
    	$(this).removeClass('before-active');
  	});
  	$('#carousels ul li.active').removeClass('active').next().addClass('active');
  	var temp = false;
  	$('#carousels ul li').each(function(){
    	if(temp == false && !$(this).hasClass('active')){
      	$(this).addClass('before-active');
    	}else{
      	temp = true;
    	}
  	});
		$('#carousels ul').animate({
			left:-leftWidth
		},'ease',function(){
			$('#carousels ul li:first-child').clone().appendTo('#carousels ul');
			$('#carousels ul li:first-child').remove();
			$('#carousels ul').css({
				left:0
			});
		});
	});
	
	$('.previous').click(function(){
  	var leftWidth;
  	if($(window).width()>= 1200){
    	leftWidth = 380;
  	}else{
    	leftWidth = 310;
  	}
		var p = $('#carousels ul');
		var position = p.position();
		var posCurrent = position.left;
		
		$('#carousels ul li:last-child').clone().prependTo('#carousels ul');
		$('#carousels ul li:last-child').remove();
		$('#carousels ul').css({
			left:-leftWidth
		});
		$('#carousels ul').animate({
			left:0
		},'ease');
		$('#carousels ul li.before-active').each(function(){
    	$(this).removeClass('before-active');
  	});
  	$('#carousels ul li.active').removeClass('active').prev().addClass('active');
  	var temp = false;
  	$('#carousels ul li').each(function(){
    	if(temp == false && !$(this).hasClass('active')){
      	$(this).addClass('before-active');
    	}else{
      	temp = true;
    	}
  	});
	});
}



$('.touchNext').click(function(){
  var scrollingLeft = $('#carousels .col-md-12').scrollLeft()+310;
	$('#carousels .col-md-12').animate({scrollLeft:scrollingLeft},400);
});
$('.touchPrevious').click(function(){
	var scrollingLeft = $('#carousels .col-md-12').scrollLeft()-310;
	$('#carousels .col-md-12').animate({scrollLeft:scrollingLeft},400);
});




	
	
	


});


function checkMode() {
  var o = window.orientation;

  if (o != 90 && o != -90) {
	  $('#carousels .col-md-12').scrollLeft(0);
  } else {
   $('#carousels .col-md-12').scrollLeft(0);
  }
}


// listen for orientation changes
$(window).bind('orientationchange', function() {
  checkMode();
 
});




$(window).resize(function() {
	if($(window).width() <= 991){
  	$('#carousels #carouselInnerWrapper').width($('#scroller').width());
	}else{
  	$('#carousels #carouselInnerWrapper').removeAttr('style');
	}
	
	
});


var lastWidth = $(window).width();

$(window).resize(function(){
   if($(window).width()!=lastWidth){
      $('#carousels .col-md-12').scrollLeft(0);
   }
});

/*






function debouncer( func , timeout ) {
   var timeoutID , timeout = timeout || 200;
   return function () {
      var scope = this , args = arguments;
      clearTimeout( timeoutID );
      timeoutID = setTimeout( function () {
          func.apply( scope , Array.prototype.slice.call( args ) );
      } , timeout );
   }
}


$( window ).resize( debouncer( function ( e ) {
	if($(window).width()>767 && !$('html').hasClass('touch')){
		$('#carouselInnerWrapper').width($('#scroller').width());
		initiate();
		
	}else{
		$('#carousels ul').stop();
		$('#carouselInnerWrapper').off('mouseenter mouseleave');
	}
} ) );
*/





























/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-csstransforms-csstransforms3d-csstransitions-cssclasses-prefixed-teststyles-testprop-testallprops-prefixes-domprefixes
 */
window.Modernizr=function(a,b,c){function z(a){j.cssText=a}function A(a,b){return z(m.join(a+";")+(b||""))}function B(a,b){return typeof a===b}function C(a,b){return!!~(""+a).indexOf(b)}function D(a,b){for(var d in a){var e=a[d];if(!C(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function E(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:B(f,"function")?f.bind(d||b):f}return!1}function F(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+o.join(d+" ")+d).split(" ");return B(b,"string")||B(b,"undefined")?D(e,b):(e=(a+" "+p.join(d+" ")+d).split(" "),E(e,b,c))}var d="2.6.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n="Webkit Moz O ms",o=n.split(" "),p=n.toLowerCase().split(" "),q={},r={},s={},t=[],u=t.slice,v,w=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},x={}.hasOwnProperty,y;!B(x,"undefined")&&!B(x.call,"undefined")?y=function(a,b){return x.call(a,b)}:y=function(a,b){return b in a&&B(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=u.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(u.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(u.call(arguments)))};return e}),q.csstransforms=function(){return!!F("transform")},q.csstransforms3d=function(){var a=!!F("perspective");return a&&"webkitPerspective"in g.style&&w("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a},q.csstransitions=function(){return F("transition")};for(var G in q)y(q,G)&&(v=G.toLowerCase(),e[v]=q[G](),t.push((e[v]?"":"no-")+v));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)y(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},z(""),i=k=null,e._version=d,e._prefixes=m,e._domPrefixes=p,e._cssomPrefixes=o,e.testProp=function(a){return D([a])},e.testAllProps=F,e.testStyles=w,e.prefixed=function(a,b,c){return b?F(a,b,c):F(a,"pfx")},g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+t.join(" "):""),e}(this,this.document);

/*!
 * Shuffle.js by @Vestride
 * Categorize, sort, and filter a responsive grid of items.
 * Dependencies: jQuery 1.9+, Modernizr 2.6.2+
 * @license MIT license
 * @version 3.0.0
 */
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'modernizr'], factory);
  } else {
    window.Shuffle = factory(window.jQuery, window.Modernizr);
  }
})(function($, Modernizr, undefined) {

'use strict';


// Validate Modernizr exists.
// Shuffle requires `csstransitions`, `csstransforms`, `csstransforms3d`,
// and `prefixed` to exist on the Modernizr object.
if (typeof Modernizr !== 'object') {
  throw new Error('Shuffle.js requires Modernizr.\n' +
      'http://vestride.github.io/Shuffle/#dependencies');
}


/**
 * Returns css prefixed properties like `-webkit-transition` or `box-sizing`
 * from `transition` or `boxSizing`, respectively.
 * @param {(string|boolean)} prop Property to be prefixed.
 * @return {string} The prefixed css property.
 */
function dashify( prop ) {
  if (!prop) {
    return '';
  }

  // Replace upper case with dash-lowercase,
  // then fix ms- prefixes because they're not capitalized.
  return prop.replace(/([A-Z])/g, function( str, m1 ) {
    return '-' + m1.toLowerCase();
  }).replace(/^ms-/,'-ms-');
}

// Constant, prefixed variables.
var TRANSITION = Modernizr.prefixed('transition');
var TRANSITION_DELAY = Modernizr.prefixed('transitionDelay');
var TRANSITION_DURATION = Modernizr.prefixed('transitionDuration');

// Note(glen): Stock Android 4.1.x browser will fail here because it wrongly
// says it supports non-prefixed transitions.
// https://github.com/Modernizr/Modernizr/issues/897
var TRANSITIONEND = {
  'WebkitTransition' : 'webkitTransitionEnd',
  'transition' : 'transitionend'
}[ TRANSITION ];

var TRANSFORM = Modernizr.prefixed('transform');
var CSS_TRANSFORM = dashify(TRANSFORM);

// Constants
var CAN_TRANSITION_TRANSFORMS = Modernizr.csstransforms && Modernizr.csstransitions;
var HAS_TRANSFORMS_3D = Modernizr.csstransforms3d;
var SHUFFLE = 'shuffle';
var COLUMN_THRESHOLD = 0.3;

// Configurable. You can change these constants to fit your application.
// The default scale and concealed scale, however, have to be different values.
var ALL_ITEMS = 'all';
var FILTER_ATTRIBUTE_KEY = 'groups';
var DEFAULT_SCALE = 1;
var CONCEALED_SCALE = 0.001;


// Underscore's throttle function.
function throttle(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  options = options || {};
  var later = function() {
    previous = options.leading === false ? 0 : $.now();
    timeout = null;
    result = func.apply(context, args);
    context = args = null;
  };
  return function() {
    var now = $.now();
    if (!previous && options.leading === false) {
      previous = now;
    }
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
      context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

function each(obj, iterator, context) {
  for (var i = 0, length = obj.length; i < length; i++) {
    if (iterator.call(context, obj[i], i, obj) === {}) {
      return;
    }
  }
}

function defer(fn, context, wait) {
  return setTimeout( $.proxy( fn, context ), wait );
}

function arrayMax( array ) {
  return Math.max.apply( Math, array );
}

function arrayMin( array ) {
  return Math.min.apply( Math, array );
}


/**
 * Always returns a numeric value, given a value.
 * @param {*} value Possibly numeric value.
 * @return {number} `value` or zero if `value` isn't numeric.
 * @private
 */
function getNumber(value) {
  return $.isNumeric(value) ? value : 0;
}


/**
 * Represents a coordinate pair.
 * @param {number} [x=0] X.
 * @param {number} [y=0] Y.
 */
var Point = function(x, y) {
  this.x = getNumber( x );
  this.y = getNumber( y );
};


/**
 * Whether two points are equal.
 * @param {Point} a Point A.
 * @param {Point} b Point B.
 * @return {boolean}
 */
Point.equals = function(a, b) {
  return a.x === b.x && a.y === b.y;
};


// Used for unique instance variables
var id = 0;
var $window = $( window );


/**
 * Categorize, sort, and filter a responsive grid of items.
 *
 * @param {Element} element An element which is the parent container for the grid items.
 * @param {Object} [options=Shuffle.options] Options object.
 * @constructor
 */
var Shuffle = function( element, options ) {
  options = options || {};
  $.extend( this, Shuffle.options, options, Shuffle.settings );

  this.$el = $(element);
  this.element = element;
  this.unique = 'shuffle_' + id++;

  this._fire( Shuffle.EventType.LOADING );
  this._init();

  // Dispatch the done event asynchronously so that people can bind to it after
  // Shuffle has been initialized.
  defer(function() {
    this.initialized = true;
    this._fire( Shuffle.EventType.DONE );
  }, this, 16);
};


/**
 * Events the container element emits with the .shuffle namespace.
 * For example, "done.shuffle".
 * @enum {string}
 */
Shuffle.EventType = {
  LOADING: 'loading',
  DONE: 'done',
  LAYOUT: 'layout',
  REMOVED: 'removed'
};


/** @enum {string} */
Shuffle.ClassName = {
  BASE: SHUFFLE,
  SHUFFLE_ITEM: 'shuffle-item',
  FILTERED: 'filtered',
  CONCEALED: 'concealed'
};


// Overrideable options
Shuffle.options = {
  group: ALL_ITEMS, // Initial filter group.
  speed: 250, // Transition/animation speed (milliseconds).
  easing: 'ease-out', // CSS easing function to use.
  itemSelector: '', // e.g. '.picture-item'.
  sizer: null, // Sizer element. Use an element to determine the size of columns and gutters.
  gutterWidth: 0, // A static number or function that tells the plugin how wide the gutters between columns are (in pixels).
  columnWidth: 0, // A static number or function that returns a number which tells the plugin how wide the columns are (in pixels).
  delimeter: null, // If your group is not json, and is comma delimeted, you could set delimeter to ','.
  buffer: 0, // Useful for percentage based heights when they might not always be exactly the same (in pixels).
  initialSort: null, // Shuffle can be initialized with a sort object. It is the same object given to the sort method.
  throttle: throttle, // By default, shuffle will throttle resize events. This can be changed or removed.
  throttleTime: 300, // How often shuffle can be called on resize (in milliseconds).
  sequentialFadeDelay: 150, // Delay between each item that fades in when adding items.
  supported: CAN_TRANSITION_TRANSFORMS // Whether to use transforms or absolute positioning.
};


// Not overrideable
Shuffle.settings = {
  useSizer: false,
  itemCss : { // default CSS for each item
    position: 'absolute',
    top: 0,
    left: 0,
    visibility: 'visible'
  },
  revealAppendedDelay: 300,
  lastSort: {},
  lastFilter: ALL_ITEMS,
  enabled: true,
  destroyed: false,
  initialized: false,
  _animations: [],
  styleQueue: []
};


// Expose for testing.
Shuffle.Point = Point;


/**
 * Static methods.
 */

/**
 * If the browser has 3d transforms available, build a string with those,
 * otherwise use 2d transforms.
 * @param {Point} point X and Y positions.
 * @param {number} scale Scale amount.
 * @return {string} A normalized string which can be used with the transform style.
 * @private
 */
Shuffle._getItemTransformString = function(point, scale) {
  if ( HAS_TRANSFORMS_3D ) {
    return 'translate3d(' + point.x + 'px, ' + point.y + 'px, 0) scale3d(' + scale + ', ' + scale + ', 1)';
  } else {
    return 'translate(' + point.x + 'px, ' + point.y + 'px) scale(' + scale + ')';
  }
};


/**
 * Retrieve the computed style for an element, parsed as a float. This should
 * not be used for width or height values because jQuery mangles them and they
 * are not precise enough.
 * @param {Element} element Element to get style for.
 * @param {string} style Style property.
 * @return {number} The parsed computed value or zero if that fails because IE
 *     will return 'auto' when the element doesn't have margins instead of
 *     the computed style.
 * @private
 */
Shuffle._getNumberStyle = function( element, style ) {
  return Shuffle._getFloat( $( element ).css( style )  );
};


/**
 * Parse a string as an integer.
 * @param {string} value String integer.
 * @return {number} The string as an integer or zero.
 * @private
 */
Shuffle._getInt = function(value) {
  return getNumber( parseInt( value, 10 ) );
};

/**
 * Parse a string as an float.
 * @param {string} value String float.
 * @return {number} The string as an float or zero.
 * @private
 */
Shuffle._getFloat = function(value) {
  return getNumber( parseFloat( value ) );
};


/**
 * Returns the outer width of an element, optionally including its margins.
 * The `offsetWidth` property must be used because having a scale transform
 * on the element affects the bounding box. Sadly, Firefox doesn't return an
 * integer value for offsetWidth (yet).
 * @param {Element} element The element.
 * @param {boolean} [includeMargins] Whether to include margins. Default is false.
 * @return {number} The width.
 */
Shuffle._getOuterWidth = function( element, includeMargins ) {
  var width = element.offsetWidth;

  // Use jQuery here because it uses getComputedStyle internally and is
  // cross-browser. Using the style property of the element will only work
  // if there are inline styles.
  if ( includeMargins ) {
    var marginLeft = Shuffle._getNumberStyle( element, 'marginLeft');
    var marginRight = Shuffle._getNumberStyle( element, 'marginRight');
    width += marginLeft + marginRight;
  }

  return width;
};


/**
 * Returns the outer height of an element, optionally including its margins.
 * @param {Element} element The element.
 * @param {boolean} [includeMargins] Whether to include margins. Default is false.
 * @return {number} The height.
 */
Shuffle._getOuterHeight = function( element, includeMargins ) {
  var height = element.offsetHeight;

  if ( includeMargins ) {
    var marginTop = Shuffle._getNumberStyle( element, 'marginTop');
    var marginBottom = Shuffle._getNumberStyle( element, 'marginBottom');
    height += marginTop + marginBottom;
  }

  return height;
};


/**
 * Change a property or execute a function which will not have a transition
 * @param {Element} element DOM element that won't be transitioned
 * @param {Function} callback A function which will be called while transition
 *     is set to 0ms.
 * @param {Object} [context] Optional context for the callback function.
 * @private
 */
Shuffle._skipTransition = function( element, callback, context ) {
  var duration = element.style[ TRANSITION_DURATION ];

  // Set the duration to zero so it happens immediately
  element.style[ TRANSITION_DURATION ] = '0ms'; // ms needed for firefox!

  callback.call( context );

  // Force reflow
  var reflow = element.offsetWidth;
  // Avoid jshint warnings: unused variables and expressions.
  reflow = null;

  // Put the duration back
  element.style[ TRANSITION_DURATION ] = duration;
};


/**
 * Instance methods.
 */

Shuffle.prototype._init = function() {
  this.$items = this._getItems();

  this.sizer = this._getElementOption( this.sizer );

  if ( this.sizer ) {
    this.useSizer = true;
  }

  // Add class and invalidate styles
  this.$el.addClass( Shuffle.ClassName.BASE );

  // Set initial css for each item
  this._initItems();

  // Bind resize events
  // http://stackoverflow.com/questions/1852751/window-resize-event-firing-in-internet-explorer
  $window.on('resize.' + SHUFFLE + '.' + this.unique, this._getResizeFunction());

  // Get container css all in one request. Causes reflow
  var containerCSS = this.$el.css(['position', 'overflow']);
  var containerWidth = Shuffle._getOuterWidth( this.element );

  // Add styles to the container if it doesn't have them.
  this._validateStyles( containerCSS );

  // We already got the container's width above, no need to cause another reflow getting it again...
  // Calculate the number of columns there will be
  this._setColumns( containerWidth );

  // Kick off!
  this.shuffle( this.group, this.initialSort );

  // The shuffle items haven't had transitions set on them yet
  // so the user doesn't see the first layout. Set them now that the first layout is done.
  if ( this.supported ) {
    defer(function() {
      this._setTransitions();
      this.element.style[ TRANSITION ] = 'height ' + this.speed + 'ms ' + this.easing;
    }, this);
  }
};


/**
 * Returns a throttled and proxied function for the resize handler.
 * @return {Function}
 * @private
 */
Shuffle.prototype._getResizeFunction = function() {
  var resizeFunction = $.proxy( this._onResize, this );
  return this.throttle ?
      this.throttle( resizeFunction, this.throttleTime ) :
      resizeFunction;
};


/**
 * Retrieve an element from an option.
 * @param {string|jQuery|Element} option The option to check.
 * @return {?Element} The plain element or null.
 * @private
 */
Shuffle.prototype._getElementOption = function( option ) {
  // If column width is a string, treat is as a selector and search for the
  // sizer element within the outermost container
  if ( typeof option === 'string' ) {
    return this.$el.find( option )[0] || null;

  // Check for an element
  } else if ( option && option.nodeType && option.nodeType === 1 ) {
    return option;

  // Check for jQuery object
  } else if ( option && option.jquery ) {
    return option[0];
  }

  return null;
};


/**
 * Ensures the shuffle container has the css styles it needs applied to it.
 * @param {Object} styles Key value pairs for position and overflow.
 * @private
 */
Shuffle.prototype._validateStyles = function(styles) {
  // Position cannot be static.
  if ( styles.position === 'static' ) {
    this.element.style.position = 'relative';
  }

  // Overflow has to be hidden
  if ( styles.overflow !== 'hidden' ) {
    this.element.style.overflow = 'hidden';
  }
};


/**
 * Filter the elements by a category.
 * @param {string} [category] Category to filter by. If it's given, the last
 *     category will be used to filter the items.
 * @param {ArrayLike} [$collection] Optionally filter a collection. Defaults to
 *     all the items.
 * @return {jQuery} Filtered items.
 * @private
 */
Shuffle.prototype._filter = function( category, $collection ) {
  category = category || this.lastFilter;
  $collection = $collection || this.$items;

  var set = this._getFilteredSets( category, $collection );

  // Individually add/remove concealed/filtered classes
  this._toggleFilterClasses( set.filtered, set.concealed );

  // Save the last filter in case elements are appended.
  this.lastFilter = category;

  // This is saved mainly because providing a filter function (like searching)
  // will overwrite the `lastFilter` property every time its called.
  if ( typeof category === 'string' ) {
    this.group = category;
  }

  return set.filtered;
};


/**
 * Returns an object containing the filtered and concealed elements.
 * @param {string|Function} category Category or function to filter by.
 * @param {ArrayLike.<Element>} $items A collection of items to filter.
 * @return {!{filtered: jQuery, concealed: jQuery}}
 * @private
 */
Shuffle.prototype._getFilteredSets = function( category, $items ) {
  var $filtered = $();
  var $concealed = $();

  // category === 'all', add filtered class to everything
  if ( category === ALL_ITEMS ) {
    $filtered = $items;

  // Loop through each item and use provided function to determine
  // whether to hide it or not.
  } else {
    each($items, function( el ) {
      var $item = $(el);
      if ( this._doesPassFilter( category, $item ) ) {
        $filtered = $filtered.add( $item );
      } else {
        $concealed = $concealed.add( $item );
      }
    }, this);
  }

  return {
    filtered: $filtered,
    concealed: $concealed
  };
};


/**
 * Test an item to see if it passes a category.
 * @param {string|Function} category Category or function to filter by.
 * @param {jQuery} $item A single item, wrapped with jQuery.
 * @return {boolean} Whether it passes the category/filter.
 * @private
 */
Shuffle.prototype._doesPassFilter = function( category, $item ) {
  if ( $.isFunction( category ) ) {
    return category.call( $item[0], $item, this );

  // Check each element's data-groups attribute against the given category.
  } else {
    var groups = $item.data( FILTER_ATTRIBUTE_KEY );
    var keys = this.delimeter && !$.isArray( groups ) ?
        groups.split( this.delimeter ) :
        groups;
    return $.inArray(category, keys) > -1;
  }
};


/**
 * Toggles the filtered and concealed class names.
 * @param {jQuery} $filtered Filtered set.
 * @param {jQuery} $concealed Concealed set.
 * @private
 */
Shuffle.prototype._toggleFilterClasses = function( $filtered, $concealed ) {
  $filtered
    .removeClass( Shuffle.ClassName.CONCEALED )
    .addClass( Shuffle.ClassName.FILTERED );
  $concealed
    .removeClass( Shuffle.ClassName.FILTERED )
    .addClass( Shuffle.ClassName.CONCEALED );
};


/**
 * Set the initial css for each item
 * @param {jQuery} [$items] Optionally specifiy at set to initialize
 */
Shuffle.prototype._initItems = function( $items ) {
  $items = $items || this.$items;
  $items.addClass([
    Shuffle.ClassName.SHUFFLE_ITEM,
    Shuffle.ClassName.FILTERED
  ].join(' '));
  $items.css( this.itemCss ).data('point', new Point()).data('scale', DEFAULT_SCALE);
};


/**
 * Updates the filtered item count.
 * @private
 */
Shuffle.prototype._updateItemCount = function() {
  this.visibleItems = this._getFilteredItems().length;
};


/**
 * Sets css transform transition on a an element.
 * @param {Element} element Element to set transition on.
 * @private
 */
Shuffle.prototype._setTransition = function( element ) {
  element.style[ TRANSITION ] = CSS_TRANSFORM + ' ' + this.speed + 'ms ' +
    this.easing + ', opacity ' + this.speed + 'ms ' + this.easing;
};


/**
 * Sets css transform transition on a group of elements.
 * @param {ArrayLike.<Element>} $items Elements to set transitions on.
 * @private
 */
Shuffle.prototype._setTransitions = function( $items ) {
  $items = $items || this.$items;
  each($items, function( el ) {
    this._setTransition( el );
  }, this);
};


/**
 * Sets a transition delay on a collection of elements, making each delay
 * greater than the last.
 * @param {ArrayLike.<Element>} $collection Array to iterate over.
 */
Shuffle.prototype._setSequentialDelay = function( $collection ) {
  if ( !this.supported ) {
    return;
  }

  // $collection can be an array of dom elements or jquery object
  each($collection, function( el, i ) {
    // This works because the transition-property: transform, opacity;
    el.style[ TRANSITION_DELAY ] = '0ms,' + ((i + 1) * this.sequentialFadeDelay) + 'ms';
  }, this);
};


Shuffle.prototype._getItems = function() {
  return this.$el.children( this.itemSelector );
};


Shuffle.prototype._getFilteredItems = function() {
  return this.$items.filter('.' + Shuffle.ClassName.FILTERED);
};


Shuffle.prototype._getConcealedItems = function() {
  return this.$items.filter('.' + Shuffle.ClassName.CONCEALED);
};


/**
 * Returns the column size, based on column width and sizer options.
 * @param {number} containerWidth Size of the parent container.
 * @param {number} gutterSize Size of the gutters.
 * @return {number}
 * @private
 */
Shuffle.prototype._getColumnSize = function( containerWidth, gutterSize ) {
  var size;

  // If the columnWidth property is a function, then the grid is fluid
  if ( $.isFunction( this.columnWidth ) ) {
    size = this.columnWidth(containerWidth);

  // columnWidth option isn't a function, are they using a sizing element?
  } else if ( this.useSizer ) {
    size = Shuffle._getOuterWidth(this.sizer);

  // if not, how about the explicitly set option?
  } else if ( this.columnWidth ) {
    size = this.columnWidth;

  // or use the size of the first item
  } else if ( this.$items.length > 0 ) {
    size = Shuffle._getOuterWidth(this.$items[0], true);

  // if there's no items, use size of container
  } else {
    size = containerWidth;
  }

  // Don't let them set a column width of zero.
  if ( size === 0 ) {
    size = containerWidth;
  }

  return size + gutterSize;
};


/**
 * Returns the gutter size, based on gutter width and sizer options.
 * @param {number} containerWidth Size of the parent container.
 * @return {number}
 * @private
 */
Shuffle.prototype._getGutterSize = function( containerWidth ) {
  var size;
  if ( $.isFunction( this.gutterWidth ) ) {
    size = this.gutterWidth(containerWidth);
  } else if ( this.useSizer ) {
    size = Shuffle._getNumberStyle(this.sizer, 'marginLeft');
  } else {
    size = this.gutterWidth;
  }

  return size;
};


/**
 * Calculate the number of columns to be used. Gets css if using sizer element.
 * @param {number} [theContainerWidth] Optionally specify a container width if it's already available.
 */
Shuffle.prototype._setColumns = function( theContainerWidth ) {
  var containerWidth = theContainerWidth || Shuffle._getOuterWidth( this.element );
  var gutter = this._getGutterSize( containerWidth );
  var columnWidth = this._getColumnSize( containerWidth, gutter );
  var calculatedColumns = (containerWidth + gutter) / columnWidth;

  // Widths given from getComputedStyle are not precise enough...
  if ( Math.abs(Math.round(calculatedColumns) - calculatedColumns) < COLUMN_THRESHOLD ) {
    // e.g. calculatedColumns = 11.998876
    calculatedColumns = Math.round( calculatedColumns );
  }

  this.cols = Math.max( Math.floor(calculatedColumns), 1 );
  this.containerWidth = containerWidth;
  this.colWidth = columnWidth;
};

/**
 * Adjust the height of the grid
 */
Shuffle.prototype._setContainerSize = function() {
  this.$el.css( 'height', this._getContainerSize() );
};


/**
 * Based on the column heights, it returns the biggest one.
 * @return {number}
 * @private
 */
Shuffle.prototype._getContainerSize = function() {
  return arrayMax( this.positions );
};


/**
 * Fire events with .shuffle namespace
 */
Shuffle.prototype._fire = function( name, args ) {
  this.$el.trigger( name + '.' + SHUFFLE, args && args.length ? args : [ this ] );
};


/**
 * Zeros out the y columns array, which is used to determine item placement.
 * @private
 */
Shuffle.prototype._resetCols = function() {
  var i = this.cols;
  this.positions = [];
  while (i--) {
    this.positions.push( 0 );
  }
};


/**
 * Loops through each item that should be shown and calculates the x, y position.
 * @param {Array.<Element>} items Array of items that will be shown/layed out in order in their array.
 *     Because jQuery collection are always ordered in DOM order, we can't pass a jq collection.
 * @param {boolean} [isOnlyPosition=false] If true this will position the items with zero opacity.
 */
Shuffle.prototype._layout = function( items, isOnlyPosition ) {
  each(items, function( item ) {
    this._layoutItem( item, !!isOnlyPosition );
  }, this);

  // `_layout` always happens after `_shrink`, so it's safe to process the style
  // queue here with styles from the shrink method.
  this._processStyleQueue();

  // Adjust the height of the container.
  this._setContainerSize();
};


/**
 * Calculates the position of the item and pushes it onto the style queue.
 * @param {Element} item Element which is being positioned.
 * @param {boolean} isOnlyPosition Whether to position the item, but with zero
 *     opacity so that it can fade in later.
 * @private
 */
Shuffle.prototype._layoutItem = function( item, isOnlyPosition ) {
  var $item = $(item);
  var itemData = $item.data();
  var currPos = itemData.point;
  var currScale = itemData.scale;
  var itemSize = {
    width: Shuffle._getOuterWidth( item, true ),
    height: Shuffle._getOuterHeight( item, true )
  };
  var pos = this._getItemPosition( itemSize );

  // If the item will not change its position, do not add it to the render
  // queue. Transitions don't fire when setting a property to the same value.
  if ( Point.equals(currPos, pos) && currScale === DEFAULT_SCALE ) {
    return;
  }

  // Save data for shrink
  itemData.point = pos;
  itemData.scale = DEFAULT_SCALE;

  this.styleQueue.push({
    $item: $item,
    point: pos,
    scale: DEFAULT_SCALE,
    opacity: isOnlyPosition ? 0 : 1,
    skipTransition: isOnlyPosition,
    callfront: function() {
      if ( !isOnlyPosition ) {
        $item.css( 'visibility', 'visible' );
      }
    },
    callback: function() {
      if ( isOnlyPosition ) {
        $item.css( 'visibility', 'hidden' );
      }
    }
  });
};


/**
 * Determine the location of the next item, based on its size.
 * @param {{width: number, height: number}} itemSize Object with width and height.
 * @return {Point}
 * @private
 */
Shuffle.prototype._getItemPosition = function( itemSize ) {
  var columnSpan = this._getColumnSpan( itemSize.width, this.colWidth, this.cols );

  var setY = this._getColumnSet( columnSpan, this.cols );

  // Finds the index of the smallest number in the set.
  var shortColumnIndex = this._getShortColumn( setY, this.buffer );

  // Position the item
  var point = new Point(
    Math.round( this.colWidth * shortColumnIndex ),
    Math.round( setY[shortColumnIndex] ));

  // Update the columns array with the new values for each column.
  // e.g. before the update the columns could be [250, 0, 0, 0] for an item
  // which spans 2 columns. After it would be [250, itemHeight, itemHeight, 0].
  var setHeight = setY[shortColumnIndex] + itemSize.height;
  var setSpan = this.cols + 1 - setY.length;
  for ( var i = 0; i < setSpan; i++ ) {
    this.positions[ shortColumnIndex + i ] = setHeight;
  }

  return point;
};


/**
 * Determine the number of columns an items spans.
 * @param {number} itemWidth Width of the item.
 * @param {number} columnWidth Width of the column (includes gutter).
 * @param {number} columns Total number of columns
 * @return {number}
 * @private
 */
Shuffle.prototype._getColumnSpan = function( itemWidth, columnWidth, columns ) {
  var columnSpan = itemWidth / columnWidth;

  // If the difference between the rounded column span number and the
  // calculated column span number is really small, round the number to
  // make it fit.
  if ( Math.abs(Math.round( columnSpan ) - columnSpan ) < COLUMN_THRESHOLD ) {
    // e.g. columnSpan = 4.0089945390298745
    columnSpan = Math.round( columnSpan );
  }

  // Ensure the column span is not more than the amount of columns in the whole layout.
  return Math.min( Math.ceil( columnSpan ), columns );
};


/**
 * Retrieves the column set to use for placement.
 * @param {number} columnSpan The number of columns this current item spans.
 * @param {number} columns The total columns in the grid.
 * @return {Array.<number>} An array of numbers represeting the column set.
 * @private
 */
Shuffle.prototype._getColumnSet = function( columnSpan, columns ) {
  // The item spans only one column.
  if ( columnSpan === 1 ) {
    return this.positions;

  // The item spans more than one column, figure out how many different
  // places it could fit horizontally.
  // The group count is the number of places within the positions this block
  // could fit, ignoring the current positions of items.
  // Imagine a 2 column brick as the second item in a 4 column grid with
  // 10px height each. Find the places it would fit:
  // [10, 0, 0, 0]
  //  |   |  |
  //  *   *  *
  //
  // Then take the places which fit and get the bigger of the two:
  // max([10, 0]), max([0, 0]), max([0, 0]) = [10, 0, 0]
  //
  // Next, find the first smallest number (the short column).
  // [10, 0, 0]
  //      |
  //      *
  //
  // And that's where it should be placed!
  } else {
    var groupCount = columns + 1 - columnSpan;
    var groupY = [];

    // For how many possible positions for this item there are.
    for ( var i = 0; i < groupCount; i++ ) {
      // Find the bigger value for each place it could fit.
      groupY[i] = arrayMax( this.positions.slice( i, i + columnSpan ) );
    }

    return groupY;
  }
};


/**
 * Find index of short column, the first from the left where this item will go.
 *
 * @param {Array.<number>} positions The array to search for the smallest number.
 * @param {number} buffer Optional buffer which is very useful when the height
 *     is a percentage of the width.
 * @return {number} Index of the short column.
 * @private
 */
Shuffle.prototype._getShortColumn = function( positions, buffer ) {
  var minPosition = arrayMin( positions );
  for (var i = 0, len = positions.length; i < len; i++) {
    if ( positions[i] >= minPosition - buffer && positions[i] <= minPosition + buffer ) {
      return i;
    }
  }
  return 0;
};


/**
 * Hides the elements that don't match our filter.
 * @param {jQuery} $collection jQuery collection to shrink.
 * @private
 */
Shuffle.prototype._shrink = function( $collection ) {
  var $concealed = $collection || this._getConcealedItems();

  each($concealed, function( item ) {
    var $item = $(item);
    var itemData = $item.data();

    // Continuing would add a transitionend event listener to the element, but
    // that listener would not execute because the transform and opacity would
    // stay the same.
    if ( itemData.scale === CONCEALED_SCALE ) {
      return;
    }

    itemData.scale = CONCEALED_SCALE;

    this.styleQueue.push({
      $item: $item,
      point: itemData.point,
      scale : CONCEALED_SCALE,
      opacity: 0,
      callback: function() {
        $item.css( 'visibility', 'hidden' );
      }
    });
  }, this);
};


/**
 * Resize handler.
 * @private
 */
Shuffle.prototype._onResize = function() {
  // If shuffle is disabled, destroyed, don't do anything
  if ( !this.enabled || this.destroyed || this.isTransitioning ) {
    return;
  }

  // Will need to check height in the future if it's layed out horizontaly
  var containerWidth = Shuffle._getOuterWidth( this.element );

  // containerWidth hasn't changed, don't do anything
  if ( containerWidth === this.containerWidth ) {
    return;
  }

  this.update();
};


/**
 * Returns styles for either jQuery animate or transition.
 * @param {Object} opts Transition options.
 * @return {!Object} Transforms for transitions, left/top for animate.
 * @private
 */
Shuffle.prototype._getStylesForTransition = function( opts ) {
  var styles = {
    opacity: opts.opacity
  };

  if ( this.supported ) {
    styles[ TRANSFORM ] = Shuffle._getItemTransformString( opts.point, opts.scale );
  } else {
    styles.left = opts.point.x;
    styles.top = opts.point.y;
  }

  return styles;
};


/**
 * Transitions an item in the grid
 *
 * @param {Object} opts options.
 * @param {jQuery} opts.$item jQuery object representing the current item.
 * @param {Point} opts.point A point object with the x and y coordinates.
 * @param {number} opts.scale Amount to scale the item.
 * @param {number} opts.opacity Opacity of the item.
 * @param {Function} opts.callback Complete function for the animation.
 * @param {Function} opts.callfront Function to call before transitioning.
 * @private
 */
Shuffle.prototype._transition = function( opts ) {
  var styles = this._getStylesForTransition( opts );
  this._startItemAnimation( opts.$item, styles, opts.callfront || $.noop, opts.callback || $.noop );
};


Shuffle.prototype._startItemAnimation = function( $item, styles, callfront, callback ) {
  // Transition end handler removes its listener.
  function handleTransitionEnd( evt ) {
    // Make sure this event handler has not bubbled up from a child.
    if ( evt.target === evt.currentTarget ) {
      $( evt.target ).off( TRANSITIONEND, handleTransitionEnd );
      callback();
    }
  }

  callfront();

  // Transitions are not set until shuffle has loaded to avoid the initial transition.
  if ( !this.initialized ) {
    $item.css( styles );
    callback();
    return;
  }

  // Use CSS Transforms if we have them
  if ( this.supported ) {
    $item.css( styles );
    $item.on( TRANSITIONEND, handleTransitionEnd );

  // Use jQuery to animate left/top
  } else {
    // Save the deferred object which jQuery returns.
    var anim = $item.stop( true ).animate( styles, this.speed, 'swing', callback );
    // Push the animation to the list of pending animations.
    this._animations.push( anim.promise() );
  }
};


/**
 * Execute the styles gathered in the style queue. This applies styles to elements,
 * triggering transitions.
 * @param {boolean} noLayout Whether to trigger a layout event.
 * @private
 */
Shuffle.prototype._processStyleQueue = function( noLayout ) {
  var $transitions = $();

  // Iterate over the queue and keep track of ones that use transitions.
  each(this.styleQueue, function( transitionObj ) {
    if ( transitionObj.skipTransition ) {
      this._styleImmediately( transitionObj );
    } else {
      $transitions = $transitions.add( transitionObj.$item );
      this._transition( transitionObj );
    }
  }, this);


  if ( $transitions.length > 0 && this.initialized ) {
    // Set flag that shuffle is currently in motion.
    this.isTransitioning = true;

    if ( this.supported ) {
      this._whenCollectionDone( $transitions, TRANSITIONEND, this._movementFinished );

    // The _transition function appends a promise to the animations array.
    // When they're all complete, do things.
    } else {
      this._whenAnimationsDone( this._movementFinished );
    }

  // A call to layout happened, but none of the newly filtered items will
  // change position. Asynchronously fire the callback here.
  } else if ( !noLayout ) {
    defer( this._layoutEnd, this );
  }

  // Remove everything in the style queue
  this.styleQueue.length = 0;
};


/**
 * Apply styles without a transition.
 * @param {Object} opts Transitions options object.
 * @private
 */
Shuffle.prototype._styleImmediately = function( opts ) {
  Shuffle._skipTransition(opts.$item[0], function() {
    opts.$item.css( this._getStylesForTransition( opts ) );
  }, this);
};

Shuffle.prototype._movementFinished = function() {
  this.isTransitioning = false;
  this._layoutEnd();
};

Shuffle.prototype._layoutEnd = function() {
  this._fire( Shuffle.EventType.LAYOUT );
};

Shuffle.prototype._addItems = function( $newItems, addToEnd, isSequential ) {
  // Add classes and set initial positions.
  this._initItems( $newItems );

  // Add transition to each item.
  this._setTransitions( $newItems );

  // Update the list of
  this.$items = this._getItems();

  // Shrink all items (without transitions).
  this._shrink( $newItems );
  each(this.styleQueue, function( transitionObj ) {
    transitionObj.skipTransition = true;
  });

  // Apply shrink positions, but do not cause a layout event.
  this._processStyleQueue( true );

  if ( addToEnd ) {
    this._addItemsToEnd( $newItems, isSequential );
  } else {
    this.shuffle( this.lastFilter );
  }
};


Shuffle.prototype._addItemsToEnd = function( $newItems, isSequential ) {
  // Get ones that passed the current filter
  var $passed = this._filter( null, $newItems );
  var passed = $passed.get();

  // How many filtered elements?
  this._updateItemCount();

  this._layout( passed, true );

  if ( isSequential && this.supported ) {
    this._setSequentialDelay( passed );
  }

  this._revealAppended( passed );
};


/**
 * Triggers appended elements to fade in.
 * @param {ArrayLike.<Element>} $newFilteredItems Collection of elements.
 * @private
 */
Shuffle.prototype._revealAppended = function( newFilteredItems ) {
  defer(function() {
    each(newFilteredItems, function( el ) {
      var $item = $( el );
      this._transition({
        $item: $item,
        opacity: 1,
        point: $item.data('point'),
        scale: DEFAULT_SCALE
      });
    }, this);

    this._whenCollectionDone($(newFilteredItems), TRANSITIONEND, function() {
      $(newFilteredItems).css( TRANSITION_DELAY, '0ms' );
      this._movementFinished();
    });
  }, this, this.revealAppendedDelay);
};


/**
 * Execute a function when an event has been triggered for every item in a collection.
 * @param {jQuery} $collection Collection of elements.
 * @param {string} eventName Event to listen for.
 * @param {Function} callback Callback to execute when they're done.
 * @private
 */
Shuffle.prototype._whenCollectionDone = function( $collection, eventName, callback ) {
  var done = 0;
  var items = $collection.length;
  var self = this;

  function handleEventName( evt ) {
    if ( evt.target === evt.currentTarget ) {
      $( evt.target ).off( eventName, handleEventName );
      done++;

      // Execute callback if all items have emitted the correct event.
      if ( done === items ) {
        callback.call( self );
      }
    }
  }

  // Bind the event to all items.
  $collection.on( eventName, handleEventName );
};


/**
 * Execute a callback after jQuery `animate` for a collection has finished.
 * @param {Function} callback Callback to execute when they're done.
 * @private
 */
Shuffle.prototype._whenAnimationsDone = function( callback ) {
  $.when.apply( null, this._animations ).always( $.proxy( function() {
    this._animations.length = 0;
    callback.call( this );
  }, this ));
};


/**
 * Public Methods
 */

/**
 * The magic. This is what makes the plugin 'shuffle'
 * @param {string|Function} [category] Category to filter by. Can be a function
 * @param {Object} [sortObj] A sort object which can sort the filtered set
 */
Shuffle.prototype.shuffle = function( category, sortObj ) {
  if ( !this.enabled || this.isTransitioning ) {
    return;
  }

  if ( !category ) {
    category = ALL_ITEMS;
  }

  this._filter( category );

  // How many filtered elements?
  this._updateItemCount();

  // Shrink each concealed item
  this._shrink();

  // Update transforms on .filtered elements so they will animate to their new positions
  this.sort( sortObj );
};


/**
 * Gets the .filtered elements, sorts them, and passes them to layout.
 * @param {Object} opts the options object for the sorted plugin
 */
Shuffle.prototype.sort = function( opts ) {
  if ( this.enabled && !this.isTransitioning ) {
    this._resetCols();

    var sortOptions = opts || this.lastSort;
    var items = this._getFilteredItems().sorted( sortOptions );

    this._layout( items );

    this.lastSort = sortOptions;
  }
};


/**
 * Reposition everything.
 * @param {boolean} isOnlyLayout If true, column and gutter widths won't be
 *     recalculated.
 */
Shuffle.prototype.update = function( isOnlyLayout ) {
  if ( this.enabled && !this.isTransitioning ) {

    if ( !isOnlyLayout ) {
      // Get updated colCount
      this._setColumns();
    }

    // Layout items
    this.sort();
  }
};


/**
 * Use this instead of `update()` if you don't need the columns and gutters updated
 * Maybe an image inside `shuffle` loaded (and now has a height), which means calculations
 * could be off.
 */
Shuffle.prototype.layout = function() {
  this.update( true );
};


/**
 * New items have been appended to shuffle. Fade them in sequentially
 * @param {jQuery} $newItems jQuery collection of new items
 * @param {boolean} [addToEnd=false] If true, new items will be added to the end / bottom
 *     of the items. If not true, items will be mixed in with the current sort order.
 * @param {boolean} [isSequential=true] If false, new items won't sequentially fade in
 */
Shuffle.prototype.appended = function( $newItems, addToEnd, isSequential ) {
  this._addItems( $newItems, addToEnd === true, isSequential !== false );
};


/**
 * Disables shuffle from updating dimensions and layout on resize
 */
Shuffle.prototype.disable = function() {
  this.enabled = false;
};


/**
 * Enables shuffle again
 * @param {boolean} [isUpdateLayout=true] if undefined, shuffle will update columns and gutters
 */
Shuffle.prototype.enable = function( isUpdateLayout ) {
  this.enabled = true;
  if ( isUpdateLayout !== false ) {
    this.update();
  }
};


/**
 * Remove 1 or more shuffle items
 * @param {jQuery} $collection A jQuery object containing one or more element in shuffle
 * @return {Shuffle} The shuffle object
 */
Shuffle.prototype.remove = function( $collection ) {

  // If this isn't a jquery object, exit
  if ( !$collection.length || !$collection.jquery ) {
    return;
  }

  function handleRemoved() {
    // Remove the collection in the callback
    $collection.remove();

    // Update things now that elements have been removed.
    this.$items = this._getItems();
    this._updateItemCount();

    this._fire( Shuffle.EventType.REMOVED, [ $collection, this ] );

    // Let it get garbage collected
    $collection = null;
  }

  // Hide collection first.
  this._toggleFilterClasses( $(), $collection );
  this._shrink( $collection );

  this.sort();

  this.$el.one( Shuffle.EventType.LAYOUT + '.' + SHUFFLE, $.proxy( handleRemoved, this ) );
};


/**
 * Destroys shuffle, removes events, styles, and classes
 */
Shuffle.prototype.destroy = function() {
  // If there is more than one shuffle instance on the page,
  // removing the resize handler from the window would remove them
  // all. This is why a unique value is needed.
  $window.off('.' + this.unique);

  // Reset container styles
  this.$el
      .removeClass( SHUFFLE )
      .removeAttr('style')
      .removeData( SHUFFLE );

  // Reset individual item styles
  this.$items
      .removeAttr('style')
      .removeData('point')
      .removeData('scale')
      .removeClass([
        Shuffle.ClassName.CONCEALED,
        Shuffle.ClassName.FILTERED,
        Shuffle.ClassName.SHUFFLE_ITEM
      ].join(' '));

  // Null DOM references
  this.$items = null;
  this.$el = null;
  this.sizer = null;
  this.element = null;

  // Set a flag so if a debounced resize has been triggered,
  // it can first check if it is actually destroyed and not doing anything
  this.destroyed = true;
};


// Plugin definition
$.fn.shuffle = function( opts ) {
  var args = Array.prototype.slice.call( arguments, 1 );
  return this.each(function() {
    var $this = $( this );
    var shuffle = $this.data( SHUFFLE );

    // If we don't have a stored shuffle, make a new one and save it
    if ( !shuffle ) {
      shuffle = new Shuffle( this, opts );
      $this.data( SHUFFLE, shuffle );
    } else if ( typeof opts === 'string' && shuffle[ opts ] ) {
      shuffle[ opts ].apply( shuffle, args );
    }
  });
};


// http://stackoverflow.com/a/962890/373422
function randomize( array ) {
  var tmp, current;
  var top = array.length;

  if ( !top ) {
    return array;
  }

  while ( --top ) {
    current = Math.floor( Math.random() * (top + 1) );
    tmp = array[ current ];
    array[ current ] = array[ top ];
    array[ top ] = tmp;
  }

  return array;
}


// You can return `undefined` from the `by` function to revert to DOM order
// This plugin does NOT return a jQuery object. It returns a plain array because
// jQuery sorts everything in DOM order.
$.fn.sorted = function(options) {
  var opts = $.extend({}, $.fn.sorted.defaults, options);
  var arr = this.get();
  var revert = false;

  if ( !arr.length ) {
    return [];
  }

  if ( opts.randomize ) {
    return randomize( arr );
  }

  // Sort the elements by the opts.by function.
  // If we don't have opts.by, default to DOM order
  if ( $.isFunction( opts.by ) ) {
    arr.sort(function(a, b) {

      // Exit early if we already know we want to revert
      if ( revert ) {
        return 0;
      }

      var valA = opts.by($(a));
      var valB = opts.by($(b));

      // If both values are undefined, use the DOM order
      if ( valA === undefined && valB === undefined ) {
        revert = true;
        return 0;
      }

      if ( valA < valB || valA === 'sortFirst' || valB === 'sortLast' ) {
        return -1;
      }

      if ( valA > valB || valA === 'sortLast' || valB === 'sortFirst' ) {
        return 1;
      }

      return 0;
    });
  }

  // Revert to the original array if necessary
  if ( revert ) {
    return this.get();
  }

  if ( opts.reverse ) {
    arr.reverse();
  }

  return arr;
};


$.fn.sorted.defaults = {
  reverse: false, // Use array.reverse() to reverse the results
  by: null, // Sorting function
  randomize: false // If true, this will skip the sorting and return a randomized order in the array
};

return Shuffle;

});

/*!
 * Social Share Kit v1.0.8 (http://socialsharekit.com)
 * Copyright 2015 Social Share Kit / Kaspars Sprogis.
 * Licensed under Creative Commons Attribution-NonCommercial 3.0 license:
 * https://github.com/darklow/social-share-kit/blob/master/LICENSE
 * ---
 */
;var SocialShareKit=(function(){var s=/(twitter|facebook|google-plus|pinterest|tumblr|vk|linkedin|email)/,o="*|*",j,b;b=function(z){var y=z||{},x=y.selector||".ssk";this.nodes=f(x);this.options=y};b.prototype={share:function(){var z=this.nodes,y=this.options,x={};l(function(){if(!z.length){return}e(z,function(D){var E=q(D),C;if(!E){return}p(D,"click",A);n(D,"click",A);if(D.parentNode.className.indexOf("ssk-count")!==-1){E=E[0];C=E+o+w(y,E,D);if(!(C in x)){x[C]=[]}x[C].push(D)}});B()});function A(I){var H=i(I),D=q(H),F=D[0],C;if(!D){return}C=r(y,F,H);if(!C){return}if(window.twttr&&H.getAttribute("href").indexOf("twitter.com/intent/")!==-1){H.setAttribute("href",C);return}if(F!="email"){var G=h(C);if(y.onOpen){y.onOpen(H,F,C,G)}if(y.onClose){var E=window.setInterval(function(){if(G.closed!==false){window.clearInterval(E);y.onClose(H,F,C,G)}},250)}}else{document.location=C}}function B(){var C,D;for(C in x){D=C.split(o);(function(E){t(D[0],D[1],y,function(F){for(var G in E){g(E[G],F)}})})(x[C])}}return this.nodes}};j=function(x){return new b(x)};function u(x){return j(x).share()}function l(x){if(document.readyState!="loading"){x()}else{if(document.addEventListener){document.addEventListener("DOMContentLoaded",x)}else{document.attachEvent("onreadystatechange",function(){if(document.readyState!="loading"){x()}})}}}function f(x){return document.querySelectorAll(x)}function e(z,y){for(var x=0;x<z.length;x++){y(z[x],x)}}function n(z,x,y){if(z.addEventListener){z.addEventListener(x,y)}else{z.attachEvent("on"+x,function(){y.call(z)})}}function p(z,x,y){if(z.removeEventListener){z.removeEventListener(x,y)}else{z.detachEvent("on"+x,y)}}function q(x){return x.className.match(s)}function i(y){var x=y||window.event;if(x.preventDefault){x.preventDefault()}else{x.returnValue=false;x.cancelBubble=true}return x.currentTarget||x.srcElement}function h(y){var z=575,x=400,D=(document.documentElement.clientWidth/2-z/2),C=(document.documentElement.clientHeight-x)/2,A="status=1,resizable=yes,width="+z+",height="+x+",top="+C+",left="+D,B=window.open(y,"",A);B.focus();return B}function r(H,A,z){var x,y=a(H,A,z),C=w(H,A,z,y),E=typeof y.title!=="undefined"?y.title:k(A),G=typeof y.text!=="undefined"?y.text:d(A),B=y.image?y.image:v("og:image"),F=typeof y.via!=="undefined"?y.via:v("twitter:site"),D={shareUrl:C,title:E,text:G,image:B,via:F,options:H,shareUrlEncoded:function(){return encodeURIComponent(this.shareUrl)}};switch(A){case"facebook":x="https://www.facebook.com/share.php?u="+D.shareUrlEncoded();break;case"twitter":x="https://twitter.com/intent/tweet?url="+D.shareUrlEncoded()+"&text="+encodeURIComponent(E+(G&&E?" - ":"")+G);if(F){x+="&via="+F.replace("@","")}break;case"google-plus":x="https://plus.google.com/share?url="+D.shareUrlEncoded();break;case"pinterest":x="https://pinterest.com/pin/create/button/?url="+D.shareUrlEncoded()+"&description="+encodeURIComponent(G);if(B){x+="&media="+encodeURIComponent(B)}break;case"tumblr":x="https://www.tumblr.com/share/link?url="+D.shareUrlEncoded()+"&name="+encodeURIComponent(E)+"&description="+encodeURIComponent(G);break;case"linkedin":x="https://www.linkedin.com/shareArticle?mini=true&url="+D.shareUrlEncoded()+"&title="+encodeURIComponent(E)+"&summary="+encodeURIComponent(G);break;case"vk":x="https://vkontakte.ru/share.php?url="+D.shareUrlEncoded();break;case"email":x="mailto:?subject="+encodeURIComponent(E)+"&body="+encodeURIComponent(E+"\n"+C+"\n\n"+G+"\n");break}D.networkUrl=x;if(H.onBeforeOpen){H.onBeforeOpen(z,A,D)}return D.networkUrl}function w(y,A,z,x){x=x||a(y,A,z);return x.url||window.location.href}function k(x){var y;if(x=="twitter"){y=v("twitter:title")}return y||document.title}function d(x){var y;if(x=="twitter"){y=v("twitter:description")}return y||v("description")}function v(z,y){var A,x=f("meta["+(y?y:z.indexOf("og:")===0?"property":"name")+'="'+z+'"]');if(x.length){A=x[0].getAttribute("content")||""}return A||""}function a(G,A,z){var y=["url","title","text","image"],x={},E,F,B,C,D=z.parentNode;A=="twitter"&&y.push("via");for(C in y){F=y[C];B="data-"+F;E=z.getAttribute(B)||D.getAttribute(B)||(G[A]&&typeof G[A][F]!="undefined"?G[A][F]:G[F]);if(typeof E!="undefined"){x[F]=E}}return x}function g(y,x){var z=document.createElement("div");z.innerHTML=x;z.className="ssk-num";y.appendChild(z)}function t(C,D,A,E){var z,y,x,B=encodeURIComponent(D);switch(C){case"facebook":z="https://graph.facebook.com/?id="+B;y=function(F){return E(F.shares?F.shares:0)};break;case"twitter":if(A&&A.twitter&&A.twitter.countCallback){A.twitter.countCallback(D,E)}break;case"google-plus":z="https://clients6.google.com/rpc?key=AIzaSyCKSbrvQasunBoV16zDH9R33D88CeLr9gQ";x='[{"method":"pos.plusones.get","id":"p","params":{"id":"'+D+'","userId":"@viewer","groupId":"@self","nolog":true},"jsonrpc":"2.0","key":"p","apiVersion":"v1"}]';y=function(F){F=JSON.parse(F);if(F.length){return E(F[0].result.metadata.globalCounts.count)}};m(z,y,x);return;case"linkedin":z="https://www.linkedin.com/countserv/count/share?url="+B;y=function(F){return E(F.count)};break;case"pinterest":z="https://api.pinterest.com/v1/urls/count.json?url="+B;y=function(F){return E(F.count)};break;case"vk":z="https://vk.com/share.php?act=count&url="+B;y=function(F){return E(F)};break}z&&y&&c(C,z,y,x)}function m(y,A,x){var z=new XMLHttpRequest();z.onreadystatechange=function(){if(this.readyState===4){if(this.status>=200&&this.status<400){A(this.responseText)}}};z.open("POST",y,true);z.setRequestHeader("Content-Type","application/json");z.send(x)}function c(z,y,B){var A="cb_"+z+"_"+Math.round(100000*Math.random()),x=document.createElement("script");window[A]=function(C){try{delete window[A]}catch(D){}document.body.removeChild(x);B(C)};if(z=="vk"){window.VK={Share:{count:function(D,C){window[A](C)}}}}else{if(z=="google-plus"){window.services={gplus:{cb:window[A]}}}}x.src=y+(y.indexOf("?")>=0?"&":"?")+"callback="+A;document.body.appendChild(x);return true}return{init:u}})();window.SocialShareKit=SocialShareKit;
//http://www.jqueryscript.net/layout/jQuery-Plugin-For-Sortable-Filterable-Grid-of-Items-Shuffle.html
  
var DEMO = (function( $ ) {
  'use strict';
 
  var $grid = $('#grid'),
      $filterOptions = $('.filter-options li'),
      $sizer = $grid.find('.shuffle__sizer'),
 
  init = function() {
 
    // None of these need to be executed synchronously
    setTimeout(function() {
      listen();
      setupFilters();
      setupSorting();
      setupSearching();
    }, 100);
 
    // instantiate the plugin
    $grid.shuffle({
      itemSelector: '.picture-item',
      sizer: $sizer
    });
 
    // Destroy it! o_O
    // $grid.shuffle('destroy');
 
    // You can subscribe to custom events:
    // shrink, shrunk, filter, filtered, sorted, load, done
    // $grid.on('shrink.shuffle shrunk.shuffle filter.shuffle filtered.shuffle sorted.shuffle layout.shuffle', function(evt, shuffle) {
    //   if ( window.console ) {
    //     console.log(evt.type, shuffle, this);
    //   }
    // });
  },
 
  // Set up button clicks
  setupFilters = function() {
    var $btns = $filterOptions.children();
    $btns.on('click', function() {
      var $this = $(this),
          isActive = $this.hasClass( 'active' ),
          group = isActive ? 'all' : $this.data('group');
 
      // Hide current label, show current label in title
      if ( !isActive ) {
        $('.filter-options .active').removeClass('active');
      }
 
      $this.toggleClass('active');
 
      // Filter elements
      $grid.shuffle( 'shuffle', group );
    });
 
    $btns = null;
  },
 
  setupSorting = function() {
    // Sorting options
    $('.sort-options').on('change', function() {
      var sort = this.value,
          opts = {};
 
      // We're given the element wrapped in jQuery
      if ( sort === 'date-created' ) {
        opts = {
          reverse: true,
          by: function($el) {
            return $el.data('date-created');
          }
        };
      } else if ( sort === 'title' ) {
        opts = {
          by: function($el) {
            return $el.data('title').toLowerCase();
          }
        };
      }
 
      // Filter elements
      $grid.shuffle('sort', opts);
    });
  },
 
  setupSearching = function() {
    // Advanced filtering
    $('.js-shuffle-search').on('keyup change', function() {
      var val = this.value.toLowerCase();
      $grid.shuffle('shuffle', function($el, shuffle) {
 
        // Only search elements in the current group
        if (shuffle.group !== 'all' && $.inArray(shuffle.group, $el.data('groups')) === -1) {
          return false;
        }
 
        var text = $.trim( $el.find('.shape__space-custom').text() ).toLowerCase();
        return text.indexOf(val) !== -1;
      });
      if($('figure.shape.filtered').length > 0){
        $('body').removeClass('none');
      }else{
        $('body').addClass('none');
      }
    });
  },
 
  // Re layout shuffle when images load. This is only needed
  // below 768 pixels because the .picture-item height is auto and therefore
  // the height of the picture-item is dependent on the image
  // I recommend using imagesloaded to determine when an image is loaded
  // but that doesn't support IE7
  listen = function() {
    
 
    // Get all images inside shuffle
    $grid.find('img').each(function() {
      var proxyImage;
 
      // Image already loaded
      if ( this.complete && this.naturalWidth !== undefined ) {
        return;
      }
 
      // If none of the checks above matched, simulate loading on detached element.
      proxyImage = new Image();
      $( proxyImage ).on('load', function() {
        $(this).off('load');
        //debouncedLayout();
      });
 
      proxyImage.src = this.src;
    });
  };
 
  return {
    init: init
  };
}( jQuery ));
 
 
 
$(document).ready(function() {
  
});




// Overrideable options
Shuffle.options = {
    group: 'all', // Filter group
    speed: 250, // Transition/animation speed (milliseconds)
    easing: 'ease-out', // css easing function to use
    itemSelector: '', // e.g. '.picture-item'
    sizer: null, // sizer element. Can be anything columnWidth is
    gutterWidth: 0, // a static number or function that tells the plugin how wide the gutters between columns are (in pixels)
    columnWidth: 0, // a static number or function that returns a number which tells the plugin how wide the columns are (in pixels)
    delimeter: null, // if your group is not json, and is comma delimeted, you could set delimeter to ','
    buffer: 0, // useful for percentage based heights when they might not always be exactly the same (in pixels)
    initialSort: null, // Shuffle can be initialized with a sort object. It is the same object given to the sort method
    throttle: $.throttle || null, // By default, shuffle will try to throttle the resize event. This option will change the method it uses
    throttleTime: 500, // How often shuffle can be called on resize (in milliseconds)
    sequentialFadeDelay: 150, // Delay between each item that fades in when adding items
    supported: Modernizr.csstransforms && Modernizr.csstransitions // supports transitions and transforms
};





$(document).on('click','.filter-options li button',function(event){
  $('.filter__search').val('');
  $('body').removeClass('none');
  
  
  if($('figure.shape.filtered').length > 0){
    $('body').removeClass('none');
  }else{
    $('body').addClass('none');
  }
  
  if(!$(this).hasClass('active')){
    $('.filter-options li button[data-group="all"]').addClass('active');
  }
});






















function setEqualHeight(columns) {
    var tallestcolumn = 0;
    columns.each(
    function() {
        currentHeight = $(this).height();
        if(currentHeight > tallestcolumn) {
            tallestcolumn  = currentHeight;
            }
        }
    );
 columns.height(tallestcolumn);
}

var delay = (function(){
        var timer = 0;
        return function(callback, ms){
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
    };
})();

$(window).resize(function() {
    delay(function(){
        $('figure.shape').css('height','auto'); //solve for all you browser stretchers out there!
        //setEqualHeight($('figure .image-wrapper'));
        setEqualHeight($('figure.shape'));
    }, 500);
    
    var $grid2 = $('#grid');
    setTimeout(function(){ $grid2.shuffle('update');}, 1000);
});







$(document).on('click','.create-overlay button',function(event){

  var choice = $(this).attr('data-choose');
  var h3 = $(this).closest('.shape').find('h3').text();
  
  $('#code_selector_chosen a span').text(h3);
  
  $('html, body').animate({scrollTop:0},300,function(){
    $('.tab-pane.active input[type="text"]').focus();
  });
  //$('.chosen-results li[data-option-array-index="'+55+'"]').trigger('click');
  
  $('#code_selector option[value="'+choice+'"]').change();
  
  //$('.chosen-container li.active-result[data-option-array-index="'+choice+'"]').addClass('result-selected"').trigger('click');
});












$(window).load(function() {
  //setEqualHeight($('figure .image-wrapper'));
  
  setEqualHeight($('figure.shape'));
  
  
  DEMO.init();
  
  
  setTimeout(function(){ 
    $('#grid').removeClass('loading');
    //console.log('loaded');
  }, 1000);
  
  
  
  
});
/*!
 * Bootstrap v3.1.1 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one(a.support.transition.end,function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b()})}(jQuery),+function(a){"use strict";var b='[data-dismiss="alert"]',c=function(c){a(c).on("click",b,this.close)};c.prototype.close=function(b){function c(){f.trigger("closed.bs.alert").remove()}var d=a(this),e=d.attr("data-target");e||(e=d.attr("href"),e=e&&e.replace(/.*(?=#[^\s]*$)/,""));var f=a(e);b&&b.preventDefault(),f.length||(f=d.hasClass("alert")?d:d.parent()),f.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one(a.support.transition.end,c).emulateTransitionEnd(150):c())};var d=a.fn.alert;a.fn.alert=function(b){return this.each(function(){var d=a(this),e=d.data("bs.alert");e||d.data("bs.alert",e=new c(this)),"string"==typeof b&&e[b].call(d)})},a.fn.alert.Constructor=c,a.fn.alert.noConflict=function(){return a.fn.alert=d,this},a(document).on("click.bs.alert.data-api",b,c.prototype.close)}(jQuery),+function(a){"use strict";var b=function(c,d){this.$element=a(c),this.options=a.extend({},b.DEFAULTS,d),this.isLoading=!1};b.DEFAULTS={loadingText:"loading..."},b.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",f.resetText||d.data("resetText",d[e]()),d[e](f[b]||this.options[b]),setTimeout(a.proxy(function(){"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},b.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")&&(c.prop("checked")&&this.$element.hasClass("active")?a=!1:b.find(".active").removeClass("active")),a&&c.prop("checked",!this.$element.hasClass("active")).trigger("change")}a&&this.$element.toggleClass("active")};var c=a.fn.button;a.fn.button=function(c){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof c&&c;e||d.data("bs.button",e=new b(this,f)),"toggle"==c?e.toggle():c&&e.setState(c)})},a.fn.button.Constructor=b,a.fn.button.noConflict=function(){return a.fn.button=c,this},a(document).on("click.bs.button.data-api","[data-toggle^=button]",function(b){var c=a(b.target);c.hasClass("btn")||(c=c.closest(".btn")),c.button("toggle"),b.preventDefault()})}(jQuery),+function(a){"use strict";var b=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=this.sliding=this.interval=this.$active=this.$items=null,"hover"==this.options.pause&&this.$element.on("mouseenter",a.proxy(this.pause,this)).on("mouseleave",a.proxy(this.cycle,this))};b.DEFAULTS={interval:5e3,pause:"hover",wrap:!0},b.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},b.prototype.getActiveIndex=function(){return this.$active=this.$element.find(".item.active"),this.$items=this.$active.parent().children(),this.$items.index(this.$active)},b.prototype.to=function(b){var c=this,d=this.getActiveIndex();return b>this.$items.length-1||0>b?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){c.to(b)}):d==b?this.pause().cycle():this.slide(b>d?"next":"prev",a(this.$items[b]))},b.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},b.prototype.next=function(){return this.sliding?void 0:this.slide("next")},b.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},b.prototype.slide=function(b,c){var d=this.$element.find(".item.active"),e=c||d[b](),f=this.interval,g="next"==b?"left":"right",h="next"==b?"first":"last",i=this;if(!e.length){if(!this.options.wrap)return;e=this.$element.find(".item")[h]()}if(e.hasClass("active"))return this.sliding=!1;var j=a.Event("slide.bs.carousel",{relatedTarget:e[0],direction:g});return this.$element.trigger(j),j.isDefaultPrevented()?void 0:(this.sliding=!0,f&&this.pause(),this.$indicators.length&&(this.$indicators.find(".active").removeClass("active"),this.$element.one("slid.bs.carousel",function(){var b=a(i.$indicators.children()[i.getActiveIndex()]);b&&b.addClass("active")})),a.support.transition&&this.$element.hasClass("slide")?(e.addClass(b),e[0].offsetWidth,d.addClass(g),e.addClass(g),d.one(a.support.transition.end,function(){e.removeClass([b,g].join(" ")).addClass("active"),d.removeClass(["active",g].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger("slid.bs.carousel")},0)}).emulateTransitionEnd(1e3*d.css("transition-duration").slice(0,-1))):(d.removeClass("active"),e.addClass("active"),this.sliding=!1,this.$element.trigger("slid.bs.carousel")),f&&this.cycle(),this)};var c=a.fn.carousel;a.fn.carousel=function(c){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},b.DEFAULTS,d.data(),"object"==typeof c&&c),g="string"==typeof c?c:f.slide;e||d.data("bs.carousel",e=new b(this,f)),"number"==typeof c?e.to(c):g?e[g]():f.interval&&e.pause().cycle()})},a.fn.carousel.Constructor=b,a.fn.carousel.noConflict=function(){return a.fn.carousel=c,this},a(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function(b){var c,d=a(this),e=a(d.attr("data-target")||(c=d.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"")),f=a.extend({},e.data(),d.data()),g=d.attr("data-slide-to");g&&(f.interval=!1),e.carousel(f),(g=d.attr("data-slide-to"))&&e.data("bs.carousel").to(g),b.preventDefault()}),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var b=a(this);b.carousel(b.data())})})}(jQuery),+function(a){"use strict";var b=function(c,d){this.$element=a(c),this.options=a.extend({},b.DEFAULTS,d),this.transitioning=null,this.options.parent&&(this.$parent=a(this.options.parent)),this.options.toggle&&this.toggle()};b.DEFAULTS={toggle:!0},b.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},b.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b=a.Event("show.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.$parent&&this.$parent.find("> .panel > .in");if(c&&c.length){var d=c.data("bs.collapse");if(d&&d.transitioning)return;c.collapse("hide"),d||c.data("bs.collapse",null)}var e=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[e](0),this.transitioning=1;var f=function(){this.$element.removeClass("collapsing").addClass("collapse in")[e]("auto"),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return f.call(this);var g=a.camelCase(["scroll",e].join("-"));this.$element.one(a.support.transition.end,a.proxy(f,this)).emulateTransitionEnd(350)[e](this.$element[0][g])}}},b.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"),this.transitioning=1;var d=function(){this.transitioning=0,this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};return a.support.transition?void this.$element[c](0).one(a.support.transition.end,a.proxy(d,this)).emulateTransitionEnd(350):d.call(this)}}},b.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var c=a.fn.collapse;a.fn.collapse=function(c){return this.each(function(){var d=a(this),e=d.data("bs.collapse"),f=a.extend({},b.DEFAULTS,d.data(),"object"==typeof c&&c);!e&&f.toggle&&"show"==c&&(c=!c),e||d.data("bs.collapse",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.collapse.Constructor=b,a.fn.collapse.noConflict=function(){return a.fn.collapse=c,this},a(document).on("click.bs.collapse.data-api","[data-toggle=collapse]",function(b){var c,d=a(this),e=d.attr("data-target")||b.preventDefault()||(c=d.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,""),f=a(e),g=f.data("bs.collapse"),h=g?"toggle":d.data(),i=d.attr("data-parent"),j=i&&a(i);g&&g.transitioning||(j&&j.find('[data-toggle=collapse][data-parent="'+i+'"]').not(d).addClass("collapsed"),d[f.hasClass("in")?"addClass":"removeClass"]("collapsed")),f.collapse(h)})}(jQuery),+function(a){"use strict";function b(b){a(d).remove(),a(e).each(function(){var d=c(a(this)),e={relatedTarget:this};d.hasClass("open")&&(d.trigger(b=a.Event("hide.bs.dropdown",e)),b.isDefaultPrevented()||d.removeClass("open").trigger("hidden.bs.dropdown",e))})}function c(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}var d=".dropdown-backdrop",e="[data-toggle=dropdown]",f=function(b){a(b).on("click.bs.dropdown",this.toggle)};f.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=c(e),g=f.hasClass("open");if(b(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click",b);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;f.toggleClass("open").trigger("shown.bs.dropdown",h),e.focus()}return!1}},f.prototype.keydown=function(b){if(/(38|40|27)/.test(b.keyCode)){var d=a(this);if(b.preventDefault(),b.stopPropagation(),!d.is(".disabled, :disabled")){var f=c(d),g=f.hasClass("open");if(!g||g&&27==b.keyCode)return 27==b.which&&f.find(e).focus(),d.click();var h=" li:not(.divider):visible a",i=f.find("[role=menu]"+h+", [role=listbox]"+h);if(i.length){var j=i.index(i.filter(":focus"));38==b.keyCode&&j>0&&j--,40==b.keyCode&&j<i.length-1&&j++,~j||(j=0),i.eq(j).focus()}}}};var g=a.fn.dropdown;a.fn.dropdown=function(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new f(this)),"string"==typeof b&&d[b].call(c)})},a.fn.dropdown.Constructor=f,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=g,this},a(document).on("click.bs.dropdown.data-api",b).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",e,f.prototype.toggle).on("keydown.bs.dropdown.data-api",e+", [role=menu], [role=listbox]",f.prototype.keydown)}(jQuery),+function(a){"use strict";var b=function(b,c){this.options=c,this.$element=a(b),this.$backdrop=this.isShown=null,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};b.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},b.prototype.toggle=function(a){return this[this.isShown?"hide":"show"](a)},b.prototype.show=function(b){var c=this,d=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(d),this.isShown||d.isDefaultPrevented()||(this.isShown=!0,this.escape(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.backdrop(function(){var d=a.support.transition&&c.$element.hasClass("fade");c.$element.parent().length||c.$element.appendTo(document.body),c.$element.show().scrollTop(0),d&&c.$element[0].offsetWidth,c.$element.addClass("in").attr("aria-hidden",!1),c.enforceFocus();var e=a.Event("shown.bs.modal",{relatedTarget:b});d?c.$element.find(".modal-dialog").one(a.support.transition.end,function(){c.$element.focus().trigger(e)}).emulateTransitionEnd(300):c.$element.focus().trigger(e)}))},b.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one(a.support.transition.end,a.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal())},b.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.focus()},this))},b.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keyup.dismiss.bs.modal")},b.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.removeBackdrop(),a.$element.trigger("hidden.bs.modal")})},b.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},b.prototype.backdrop=function(b){var c=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var d=a.support.transition&&c;if(this.$backdrop=a('<div class="modal-backdrop '+c+'" />').appendTo(document.body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus.call(this.$element[0]):this.hide.call(this))},this)),d&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;d?this.$backdrop.one(a.support.transition.end,b).emulateTransitionEnd(150):b()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(a.support.transition.end,b).emulateTransitionEnd(150):b()):b&&b()};var c=a.fn.modal;a.fn.modal=function(c,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},b.DEFAULTS,e.data(),"object"==typeof c&&c);f||e.data("bs.modal",f=new b(this,g)),"string"==typeof c?f[c](d):g.show&&f.show(d)})},a.fn.modal.Constructor=b,a.fn.modal.noConflict=function(){return a.fn.modal=c,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(b){var c=a(this),d=c.attr("href"),e=a(c.attr("data-target")||d&&d.replace(/.*(?=#[^\s]+$)/,"")),f=e.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(d)&&d},e.data(),c.data());c.is("a")&&b.preventDefault(),e.modal(f,this).one("hide",function(){c.is(":visible")&&c.focus()})}),a(document).on("show.bs.modal",".modal",function(){a(document.body).addClass("modal-open")}).on("hidden.bs.modal",".modal",function(){a(document.body).removeClass("modal-open")})}(jQuery),+function(a){"use strict";var b=function(a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",a,b)};b.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1},b.prototype.init=function(b,c,d){this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d);for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},b.prototype.getDefaults=function(){return b.DEFAULTS},b.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},b.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},b.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show()},b.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},b.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){if(this.$element.trigger(b),b.isDefaultPrevented())return;var c=this,d=this.tip();this.setContent(),this.options.animation&&d.addClass("fade");var e="function"==typeof this.options.placement?this.options.placement.call(this,d[0],this.$element[0]):this.options.placement,f=/\s?auto?\s?/i,g=f.test(e);g&&(e=e.replace(f,"")||"top"),d.detach().css({top:0,left:0,display:"block"}).addClass(e),this.options.container?d.appendTo(this.options.container):d.insertAfter(this.$element);var h=this.getPosition(),i=d[0].offsetWidth,j=d[0].offsetHeight;if(g){var k=this.$element.parent(),l=e,m=document.documentElement.scrollTop||document.body.scrollTop,n="body"==this.options.container?window.innerWidth:k.outerWidth(),o="body"==this.options.container?window.innerHeight:k.outerHeight(),p="body"==this.options.container?0:k.offset().left;e="bottom"==e&&h.top+h.height+j-m>o?"top":"top"==e&&h.top-m-j<0?"bottom":"right"==e&&h.right+i>n?"left":"left"==e&&h.left-i<p?"right":e,d.removeClass(l).addClass(e)}var q=this.getCalculatedOffset(e,h,i,j);this.applyPlacement(q,e),this.hoverState=null;var r=function(){c.$element.trigger("shown.bs."+c.type)};a.support.transition&&this.$tip.hasClass("fade")?d.one(a.support.transition.end,r).emulateTransitionEnd(150):r()}},b.prototype.applyPlacement=function(b,c){var d,e=this.tip(),f=e[0].offsetWidth,g=e[0].offsetHeight,h=parseInt(e.css("margin-top"),10),i=parseInt(e.css("margin-left"),10);isNaN(h)&&(h=0),isNaN(i)&&(i=0),b.top=b.top+h,b.left=b.left+i,a.offset.setOffset(e[0],a.extend({using:function(a){e.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),e.addClass("in");var j=e[0].offsetWidth,k=e[0].offsetHeight;if("top"==c&&k!=g&&(d=!0,b.top=b.top+g-k),/bottom|top/.test(c)){var l=0;b.left<0&&(l=-2*b.left,b.left=0,e.offset(b),j=e[0].offsetWidth,k=e[0].offsetHeight),this.replaceArrow(l-f+j,j,"left")}else this.replaceArrow(k-g,k,"top");d&&e.offset(b)},b.prototype.replaceArrow=function(a,b,c){this.arrow().css(c,a?50*(1-a/b)+"%":"")},b.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},b.prototype.hide=function(){function b(){"in"!=c.hoverState&&d.detach(),c.$element.trigger("hidden.bs."+c.type)}var c=this,d=this.tip(),e=a.Event("hide.bs."+this.type);return this.$element.trigger(e),e.isDefaultPrevented()?void 0:(d.removeClass("in"),a.support.transition&&this.$tip.hasClass("fade")?d.one(a.support.transition.end,b).emulateTransitionEnd(150):b(),this.hoverState=null,this)},b.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},b.prototype.hasContent=function(){return this.getTitle()},b.prototype.getPosition=function(){var b=this.$element[0];return a.extend({},"function"==typeof b.getBoundingClientRect?b.getBoundingClientRect():{width:b.offsetWidth,height:b.offsetHeight},this.$element.offset())},b.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},b.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},b.prototype.tip=function(){return this.$tip=this.$tip||a(this.options.template)},b.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},b.prototype.validate=function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},b.prototype.enable=function(){this.enabled=!0},b.prototype.disable=function(){this.enabled=!1},b.prototype.toggleEnabled=function(){this.enabled=!this.enabled},b.prototype.toggle=function(b){var c=b?a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;c.tip().hasClass("in")?c.leave(c):c.enter(c)},b.prototype.destroy=function(){clearTimeout(this.timeout),this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var c=a.fn.tooltip;a.fn.tooltip=function(c){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof c&&c;(e||"destroy"!=c)&&(e||d.data("bs.tooltip",e=new b(this,f)),"string"==typeof c&&e[c]())})},a.fn.tooltip.Constructor=b,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=c,this}}(jQuery),+function(a){"use strict";var b=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");b.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),b.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),b.prototype.constructor=b,b.prototype.getDefaults=function(){return b.DEFAULTS},b.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content")[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},b.prototype.hasContent=function(){return this.getTitle()||this.getContent()},b.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},b.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")},b.prototype.tip=function(){return this.$tip||(this.$tip=a(this.options.template)),this.$tip};var c=a.fn.popover;a.fn.popover=function(c){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof c&&c;(e||"destroy"!=c)&&(e||d.data("bs.popover",e=new b(this,f)),"string"==typeof c&&e[c]())})},a.fn.popover.Constructor=b,a.fn.popover.noConflict=function(){return a.fn.popover=c,this}}(jQuery),+function(a){"use strict";function b(c,d){var e,f=a.proxy(this.process,this);this.$element=a(a(c).is("body")?window:c),this.$body=a("body"),this.$scrollElement=this.$element.on("scroll.bs.scroll-spy.data-api",f),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||(e=a(c).attr("href"))&&e.replace(/.*(?=#[^\s]+$)/,"")||"")+" .nav li > a",this.offsets=a([]),this.targets=a([]),this.activeTarget=null,this.refresh(),this.process()}b.DEFAULTS={offset:10},b.prototype.refresh=function(){var b=this.$element[0]==window?"offset":"position";this.offsets=a([]),this.targets=a([]);{var c=this;this.$body.find(this.selector).map(function(){var d=a(this),e=d.data("target")||d.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[b]().top+(!a.isWindow(c.$scrollElement.get(0))&&c.$scrollElement.scrollTop()),e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){c.offsets.push(this[0]),c.targets.push(this[1])})}},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight,d=c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(b>=d)return g!=(a=f.last()[0])&&this.activate(a);if(g&&b<=e[0])return g!=(a=f[0])&&this.activate(a);for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(!e[a+1]||b<=e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){this.activeTarget=b,a(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")};var c=a.fn.scrollspy;a.fn.scrollspy=function(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=c,this},a(window).on("load",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);b.scrollspy(b.data())})})}(jQuery),+function(a){"use strict";var b=function(b){this.element=a(b)};b.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a")[0],f=a.Event("show.bs.tab",{relatedTarget:e});if(b.trigger(f),!f.isDefaultPrevented()){var g=a(d);this.activate(b.parent("li"),c),this.activate(g,g.parent(),function(){b.trigger({type:"shown.bs.tab",relatedTarget:e})})}}},b.prototype.activate=function(b,c,d){function e(){f.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),b.addClass("active"),g?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu")&&b.closest("li.dropdown").addClass("active"),d&&d()}var f=c.find("> .active"),g=d&&a.support.transition&&f.hasClass("fade");g?f.one(a.support.transition.end,e).emulateTransitionEnd(150):e(),f.removeClass("in")};var c=a.fn.tab;a.fn.tab=function(c){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new b(this)),"string"==typeof c&&e[c]()})},a.fn.tab.Constructor=b,a.fn.tab.noConflict=function(){return a.fn.tab=c,this},a(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(b){b.preventDefault(),a(this).tab("show")})}(jQuery),+function(a){"use strict";var b=function(c,d){this.options=a.extend({},b.DEFAULTS,d),this.$window=a(window).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(c),this.affixed=this.unpin=this.pinnedOffset=null,this.checkPosition()};b.RESET="affix affix-top affix-bottom",b.DEFAULTS={offset:0},b.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(b.RESET).addClass("affix");var a=this.$window.scrollTop(),c=this.$element.offset();return this.pinnedOffset=c.top-a},b.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},b.prototype.checkPosition=function(){if(this.$element.is(":visible")){var c=a(document).height(),d=this.$window.scrollTop(),e=this.$element.offset(),f=this.options.offset,g=f.top,h=f.bottom;"top"==this.affixed&&(e.top+=d),"object"!=typeof f&&(h=g=f),"function"==typeof g&&(g=f.top(this.$element)),"function"==typeof h&&(h=f.bottom(this.$element));var i=null!=this.unpin&&d+this.unpin<=e.top?!1:null!=h&&e.top+this.$element.height()>=c-h?"bottom":null!=g&&g>=d?"top":!1;if(this.affixed!==i){this.unpin&&this.$element.css("top","");var j="affix"+(i?"-"+i:""),k=a.Event(j+".bs.affix");this.$element.trigger(k),k.isDefaultPrevented()||(this.affixed=i,this.unpin="bottom"==i?this.getPinnedOffset():null,this.$element.removeClass(b.RESET).addClass(j).trigger(a.Event(j.replace("affix","affixed"))),"bottom"==i&&this.$element.offset({top:c-h-this.$element.height()}))}}};var c=a.fn.affix;a.fn.affix=function(c){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof c&&c;e||d.data("bs.affix",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.affix.Constructor=b,a.fn.affix.noConflict=function(){return a.fn.affix=c,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var b=a(this),c=b.data();c.offset=c.offset||{},c.offsetBottom&&(c.offset.bottom=c.offsetBottom),c.offsetTop&&(c.offset.top=c.offsetTop),b.affix(c)})})}(jQuery);
/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (e) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], e)
    } else if (typeof exports === "object") {
        e(require("jquery"))
    } else {
        e(jQuery)
    }
})(function (e) {
    function n(e) {
        return u.raw ? e : encodeURIComponent(e)
    }

    function r(e) {
        return u.raw ? e : decodeURIComponent(e)
    }

    function i(e) {
        return n(u.json ? JSON.stringify(e) : String(e))
    }

    function s(e) {
        if (e.indexOf('"') === 0) {
            e = e.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\")
        }
        try {
            e = decodeURIComponent(e.replace(t, " "));
            return u.json ? JSON.parse(e) : e
        } catch (n) {
        }
    }

    function o(t, n) {
        var r = u.raw ? t : s(t);
        return e.isFunction(n) ? n(r) : r
    }

    var t = /\+/g;
    var u = e.cookie = function (t, s, a) {
        if (s !== undefined && !e.isFunction(s)) {
            a = e.extend({}, u.defaults, a);
            if (typeof a.expires === "number") {
                var f = a.expires, l = a.expires = new Date;
                l.setTime(+l + f * 864e5)
            }
            return document.cookie = [n(t), "=", i(s), a.expires ? "; expires=" + a.expires.toUTCString() : "", a.path ? "; path=" + a.path : "", a.domain ? "; domain=" + a.domain : "", a.secure ? "; secure" : ""].join("")
        }
        var c = t ? undefined : {};
        var h = document.cookie ? document.cookie.split("; ") : [];
        for (var p = 0, d = h.length; p < d; p++) {
            var v = h[p].split("=");
            var m = r(v.shift());
            var g = v.join("=");
            if (t && t === m) {
                c = o(g, s);
                break
            }
            if (!t && (g = o(g)) !== undefined) {
                c[m] = g
            }
        }
        return c
    };
    u.defaults = {};
    e.removeCookie = function (t, n) {
        if (e.cookie(t) === undefined) {
            return false
        }
        e.cookie(t, "", e.extend({}, n, {expires: -1}));
        return !e.cookie(t)
    }
});


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function hashLinkAnimate() {

}


$(window).load(function () {


    prompt_normal();


    $(document).on('click', '.restart-tutorial', function (event) {
        $('#progress-numbers .first-number').trigger('click');
    });

    $('#progress-numbers').flexslider({
        animation: "slide",
        keyboard: false,
        controlNav: false,
        touch: false,
        directionNav: false,
        animationLoop: false,
        slideshow: false,
        itemWidth: 210,
        itemMargin: 0,
        asNavFor: '#progress-content',
        start: function () {
            $('#progress-numbers .slides').removeClass('loading');
        }
    });

    $('#progress-content').flexslider({
        animation: "slide",
        easing: 'linear',
        keyboard: false,
        prevText: "",
        nextText: "",
        controlNav: false,
        animationLoop: false,
        touch: false,
        slideshow: false,
        directionNav: true,
        sync: "#progress-numbers",
        animationSpeed: 1200,
        slideshowSpeed: 1000,
        start: function () {
            carousel_click();
            $('#progress-content .slides').removeClass('loading');
        },
        before: function (slider) {

            if ($('html').hasClass('touch')) {

            } else {
                var slideDifference = slider.animatingTo - slider.currentSlide;
                if (slideDifference < 0) {
                    slideDifference = (-slideDifference * .3).toFixed(1);
                } else {
                    slideDifference = (slideDifference * .3).toFixed(1);
                }
                slideDifference = slideDifference;
                if (slideDifference < .9) {
                    slideDifference = .9;
                }


                $('#progress-content ul.slides').css({
                    '-moz-transition': slideDifference + 's !important',
                    'transition': slideDifference + 's'
                });
            }

            carousel_click();
        },
        after: function () {
            if ($('html').hasClass('touch')) {
                carousel_click();
            }
        }
    });


    $('#examples-slideshow').flexslider({
        animation: "slide",
        slideshow: false
    });


    $("#eye")
        .mouseenter(function () {
            $('#intro').addClass('show-image');
        })
        .mouseleave(function () {
            $('#intro').removeClass('show-image');
        });


});


$(window).bind("load", function () {
    setEqualWidth($('#intro .btn'));
});
$(window).resize(function () {
    setEqualWidth($('#intro .btn'));
});


function setEqualWidth(columns) {
    var widestcolumn = 0;
    columns.each(
        function () {
            currentWidth = $(this).width();
            if (currentWidth > widestcolumn) {
                widestcolumn = currentWidth;
            }
        }
    );
    columns.width(widestcolumn);
}


$(window).scroll(function () {
    if ($('body').hasClass('careers-egoditor')) {
        if ($(window).scrollTop() > 300 && $(window).width() > 767) {
            $('body').addClass('scrolled');
        } else {
            $('body').removeClass('scrolled');
        }
    }
});


$(document).on('click', '.mobile_nav_wrapper .menu-item-has-children > a', function (e) {
    e.preventDefault();
    $(this).parent().children('.dropdown-menu').slideToggle();
    $(this).parent().toggleClass('open');
});


$(document).on('click', '#progress-numbers ul li,#progress-content ul li', function (event) {
    //alert('sdag');
    carousel_click();

});

var old_active_slide = 0;

function carousel_click() {
    //$('body').addClass('red');
    var listItem = $(".flex-active-slide");
    var index = $("#progress-numbers ul li").index(listItem);

    var difference = index - old_active_slide;


    i = 0;
    $('#progress-numbers ul li').each(function () {
        i++;
        $(this).removeClass('before');
        if (i <= index + 1) {
            $(this).addClass('before');
        }
    });


    if (index - old_active_slide > 1) {
        $('#progress-numbers').removeClass('old');
        ii = 0;
        $('#progress-numbers ul li').each(function () {
            ii++;
            $(this).removeClass('new').removeClass('oneBehind').removeAttr('id');
            if (ii <= index && ii > old_active_slide || (ii - 1) == index) {
                $(this).addClass('new').attr('id', 'id' + (ii - old_active_slide));
            }
        });
    } else if (index - old_active_slide < -1) {
        $('#progress-numbers').addClass('old');
        ii = 5;
        $($('#progress-numbers ul li').get().reverse()).each(function () {
            ii--;
            $(this).removeClass('new').removeClass('oneBehind').removeAttr('id');

            if (ii >= index - 1 && ii < old_active_slide || (ii - 1) == index) {
                $(this).addClass('new').attr('id', 'id' + ((ii - old_active_slide) * -1));
            }
        });
    } else if (difference == 0) {

    } else {
        $('#progress-numbers').removeClass('old');
        ii = 0;
        $('#progress-numbers ul li').each(function () {
            ii++;
            $(this).removeClass('new').removeClass('oneBehind').removeAttr('id');
            if (ii == index) {
                $(this).addClass('oneBehind');
            }
        });
    }


    old_active_slide = index;
}


$(document).on('click', '#change-nav-color', function (event) {
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
    if (!$('body').hasClass('nav-blue')) {
        $('body').addClass('nav-blue');
    } else {
        $('body').removeClass('nav-blue');
    }

});

$(document).on('click', '#change-logo', function (event) {
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
    $('body').toggleClass('logo-icon');
});

$(document).on('click', '#change-nav-width', function (event) {
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
    $('body').toggleClass('nav-full');
});

$(document).on('click', '#change-nav-left', function (event) {
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
    $('body').toggleClass('nav-left');

    /*
     if($('body').hasClass('nav-left')){
     $('#main-nav li.btn-login').insertAfter($('#main-nav li.btn-signup'));
     }else{
     $('#main-nav li.btn-signup').insertAfter($('#main-nav li.btn-login'));
     }
     */
});

$(document).on('click', '#change-sub-nav-color', function (event) {
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
    $('body').toggleClass('sub-nav-dark');
});


$(document).on('click', '#change-button-shape', function (event) {
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
    $('body').toggleClass('buttons-rounded');
});

$(document).on('click', '#change-signup', function (event) {
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
    $('body').toggleClass('signup-outline');
});


//Scroll to correct place on that page.
$(document).on('click', '.animatedscroll, .animatedscroll a', function (event) {
    scrollToElement($(this));
});


if (window.location.hash && window.location.hash.length > 1) {
    var scrollToSection = window.location.hash.substring(1);
    window.location.hash = '';
    window.scrollTo(0, 0);
    var navClick = '#' + scrollToSection;

    if ((navClick.includes(".") == false || typeof $(navClick).offset() !== "undefined") && scrollToSection) {

        var scrollheight = $(navClick).offset().top;
        var scrollDifference = $(window).scrollTop() - scrollheight;

        if (scrollDifference < 0) {
            scrollDifference = (scrollDifference * (-1));
        }

        scrollDifference = Math.round(scrollDifference / 3);

        if (scrollDifference < 500) {
            scrollDifference = 500;
        }

        if (scrollDifference > 3000) {
            scrollDifference = Math.round(scrollDifference / 5);
        }

        $('html, body').animate({scrollTop: scrollheight}, scrollDifference);
    }
}


//add correct class to active nav
function scrolling() {

    if ($('.scrollSection').length > 0 && $('#sub-nav-bar').length) {
        var sub_nav_difference = $(window).scrollTop() - $('#sub-nav-bar').offset().top + 10;//added 10 extra for it to look nice
        var past_ScrollWrapper = $(window).scrollTop() - $('.scrollSectionWrapper').outerHeight() - $('.scrollSectionWrapper').offset().top;
    }


    if (past_ScrollWrapper > 0) {
        $('#sub-nav-bar').addClass('relative');
    } else {
        $('#sub-nav-bar').removeClass('relative');
    }


    if ($('.scrollSection').length > 0 && $('#sub-nav-bar').length > 0 && sub_nav_difference >= 0) {
        var navHeight = $('#sub-nav-bar').outerHeight() + 1;//+1 for border
        var executeString = '';
        var sectionCount = 0;
        $('.scrollSection').each(function () {
            var thisID = $(this).attr('id');
            if (sectionCount == 0) {
                executeString = "if($(window).scrollTop() <$('#" + thisID + "').offset().top+$('#" + thisID + "').height()-navHeight ){$('#sub-nav-bar ." + thisID + "').addClass('active');}";
            } else {
                executeString = executeString + "else if($(window).scrollTop() >= $('#" + thisID + "').scrollTop() && $(window).scrollTop() <$('#" + thisID + "').offset().top+$('#" + thisID + "').height()-navHeight ){$('#sub-nav-bar ." + thisID + "').addClass('active');}";
            }

            sectionCount++;
        });
        $('#sub-nav-bar .active').removeClass('active');
        eval(executeString);

    } else {
        $('#sub-nav-bar .active').removeClass('active');
    }

}//end scrolling


function prompt_placement() {
    var prompt_height = $('.popup_prompt').height();


    /*
     if($('#index-tricks') && ($('#index-tricks').offset().top > ($(window).scrollTop() + $(window).height() - prompt_height - 50))){
     $('body').addClass('prompt_absolute');

     }else{
     $('body').removeClass('prompt_absolute');
     if($(window).scrollTop() > 100 && $(window).width()>767 && !$('html').hasClass('ltie9')){
     $('body').addClass('scrolled_prompt');
     }else{
     //$('body').removeClass('scrolled');
     }
     }*/
}


$(window).scroll(function () {


    if ($('body').hasClass('home') && !$('body').hasClass('pushed_left')) {
        // prompt_placement();
    }


    if ($('.scrollSection').length > 0 && $('#sub-nav-bar').length && $(window).width() > 767) {
        scrolling();
    }


    if ($('#sub-nav-bar').length > 0 && $(window).width() > 767) {
        if ($('#sub-nav-bar').offset().top - $(window).scrollTop() <= 0) {
            $('#sub-nav-bar').addClass('fixed');
        } else {
            $('#sub-nav-bar').removeClass('fixed');
        }
    }


});


!function ($) {

    var QRWebsite = {
        init: function () {
            QRWebsite.initPIDHandling();
            QRWebsite.initLinkAnimation();
        },


        initPIDHandling: function () {
            // GRAB PID AND PUT IT IN A COOKIE

            function _pidToCookie() {
                var pid = getParameterByName("PID");
                if (pid == "") pid = getParameterByName("pid");

                if (pid && pid != "") {
                    $.cookie('pid', pid, {expires: 1, path: '/'});
                }
            }

            function _addPIDToIframe() {
                var $iframe = $("#signup-iframe");
                var pid = $.cookie('pid');
                if ($iframe.length > 0 && pid && pid != "") {
                    var src = $iframe.attr("src");
                    if (typeof src === 'undefined')
                        src = $iframe.attr("buf-src");

                    if (typeof src === 'undefined')
                        return false;

                    $iframe.attr("src", src + "&PID=" + parseInt(pid));
                }
            }


            _pidToCookie();
            _addPIDToIframe();

        },

        initLinkAnimation: function () {
            hashLinkAnimate();
        }

    };

    QRWebsite.init();

}(window.jQuery);


//Checks for SVG support. Returns true/false.
function supportsSVG() {
    return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect;
}//end svg detection


//Checks for SVG support. If there is no SVG support, the extensions will be changed to "png".
function checkSVG() {
    if (!supportsSVG()) {
        $('.svgReplace').each(function () {
            var tempSRC = $(this).attr('data-lazy-src');
            tempSRC = tempSRC.replace('.svg', '.png');
            $(this).attr('data-lazy-src', tempSRC);
        });
        $('html').addClass('nosvg');
    } else {
        $('html').addClass('svg');
    }
}


//checks for touch screen capabilities 
//http://www.kirupa.com/html5/check_if_you_are_on_a_touch_enabled_device.htm
function isTouchSupported() {
    var msTouchEnabled = window.navigator.msMaxTouchPoints;
    var generalTouchEnabled = "ontouchstart" in document.createElement("div");

    if (msTouchEnabled || generalTouchEnabled) {
        return true;
    }
    return false;
}

$(window).load(function () {
    if ($('.scrollSection').length > 0 && $('#sub-nav-bar').length && $(window).width() > 767) {
        scrolling();
    }
});

$(document).ready(function () {
    checkSVG();
    if (isTouchSupported()) {
        $('html').addClass('touch');
    } else {
        $('html').addClass('notouch');
    }

    if ($('#sub-nav-bar').length > 0 && $(window).width() > 767) {
        if ($('#sub-nav-bar').offset().top - $(window).scrollTop() <= 0) {
            $('#sub-nav-bar').addClass('fixed');
        } else {
            $('#sub-nav-bar').removeClass('fixed');
        }
    }

    if ($('.scrollSection').length > 0 && $('#sub-nav-bar').length && $(window).width() > 767) {
        scrolling();
    }

    if ($('body').hasClass('ebook-page') && !$('html').hasClass('ltie9')) {
        var sidebarH = $('#sidebar').height();
        var sidebarOT = 70;
        var winH = $(window).height();

        if (sidebarH + sidebarOT > winH) {
            $('#sidebar').addClass('inherit');
            $('.chapter-list').addClass('show');
        } else {
            $('#sidebar').removeClass('inherit');
            $('.chapter-list').removeClass('show');
        }
    }


    $(document).on('click', '.popup_prompt .close_button', function (event) {
        $('.popup_prompt').addClass('closed');
    });


    $(document).on('click', '#phone_drop ul li', function (e) {
        e.preventDefault();

        var phone_number = 'tel:' + $(this).attr('data-call');
        $('#phone_drop a.with-phone').attr('href', phone_number);

        $('#phone_drop a.with-phone #current_number').html($(this).html());
        //$(this).parent().children('.dropdown-menu').slideToggle();
        //$(this).parent().toggleClass('open');
    });

    $(document).ready(function () {
        switch ($("html").attr("lang")) {
            case "pt-br":
                $("#phone_drop li.pt").click();
                break;
            case "de-DE":
                $("#phone_drop li.de").click();
                break;
            case "es-ES":
                $("#phone_drop li.es").click();
                break;
            case "fr-FR":
                $("#phone_drop li.fr").click();
                break;
            default:
                $("#phone_drop li.en").click();
        }

        if (typeof SocialShareKit !== "undefined")
            SocialShareKit.init();

        $("div[id^='share-']").click(function () {
            $(this).toggleClass("open")
        });

        $(window).click(function () {
            closeModal();
        });
        $('.chapter0-modal-container').click(function (event) {
            event.stopPropagation();
        });
        $('.chapters-bookmark, .close-modal').on('click', function (event) {
            event.stopPropagation();
            $('.chapter0-modal').toggle();
            $('.chapters-bookmark').toggleClass('active-modal');
        });
        $('.chapter0-modal .link-text a[href^="#"]').on('click', function (event) {
            scrollToElement($(this));
            closeModal();
        });
    });

    $(window).scroll(function () {
        if ($(window).scrollTop() >= 900) {
            $('.chapters-bookmark').show();
        } else {
            $('.chapters-bookmark').hide();
        }
    });

    function closeModal() {
        if ($('.chapter0-modal:visible')) {
            $('.chapter0-modal').hide();
            $('.chapters-bookmark').removeClass('active-modal');
        }
    }

    /*
     if($('body').hasClass('nav-left')){
     $('#main-nav li.btn-login').insertAfter($('#main-nav li.btn-signup'));
     }else{
     $('#main-nav li.btn-signup').insertAfter($('#main-nav li.btn-login'));
     }
     */


    sidebar_scroll_fixed();
    next_previous_chapter();

});
/**
 * function name: scrollToElement()
 * description:
 *      - on click of element with class .animatedscroll or call the function from any function
 *      - element must have href attribute to scroll to link
 *      - scrolling to the element with animation
 *      - verifying if the sub nav bar is open
 * @param jQuery element
 *
 */
function scrollToElement(self) {
    var is_sub_nav_bar;
    if ($('body').find('.sub-menu').length > 0) {
        is_sub_nav_bar = true;
    } else {
        is_sub_nav_bar = false;
    }

    if (self.attr('href')) {
        var navClick = self.attr('href');
        var i = navClick.indexOf("#");

        if (i != -1) {
            navClick = navClick.substring(i, navClick.length);
        }

        if ($(navClick).length) {
            //on this page.
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
        } else {
            //not on this page.
        }


        var scrollheight = $(navClick).offset().top;
        var scrollDifference = $(window).scrollTop() - scrollheight;

        if (scrollDifference < 0) {
            scrollDifference = (scrollDifference * (-1));
        }

        scrollDifference = Math.round(scrollDifference / 3);

        if (scrollDifference < 500) {
            scrollDifference = 500;
        }

        if (scrollDifference > 3000) {
            scrollDifference = Math.round(scrollDifference / 5);
        }
        if (is_sub_nav_bar && $(window).width() > 767) {
            scrollheight = scrollheight - 2*$('.sub-menu').outerHeight();
        }

        $('html, body').animate({scrollTop: scrollheight}, scrollDifference, function () {
            $(navClick).addClass('tooFar').delay(500).queue(function () {
                $(navClick).removeClass('tooFar');
                $(this).dequeue();
            });
        });
    }
}
$(window).resize(function () {
    if ($('.scrollSection').length > 0 && $('#sub-nav-bar').length && $(window).width() > 767) {
        scrolling();
    }


    if ($('body').hasClass('home')) {
        prompt_normal();
        prompt_placement();
    }

});


function prompt_normal() {
    var prompt_height = $('.popup_prompt').height();

    var offset_top = 0;


    if ($(window).height() > offset_top + prompt_height + 40) {
        $('body').addClass('prompt_normal');
    } else {
        $('body').removeClass('prompt_normal');
    }
}


// function addPIDToSignupButtons(){

//   if(!$.cookie('pid')){
//     var pid = getParameterByName("PID");

//     // $(".btn-signup a, a.btn-signup").each(function(){
//     $('a[href^="/signup"]').each(function(){
//       var $signuplink = $(this);
//   	   $signuplink.attr("href",$signuplink.attr("href")+"&PID="+pid); 
//     });
//   }
// }


// addPIDToSignupButtons();


//Next/Previous chapter buttons ------------------------------------------------


function scroll_handler_next_previous() {
    winS = $(window).scrollTop();

    var winS = $(window).scrollTop();
    var posTop = navTop - winS;
    var docH = $(document).height();
    var winH = $(window).height();
    var footerH = $('footer').outerHeight();
    var linkOffset = $('nav.nav-slide a').height() / 2;

    var contentH = $('.next-previous-content').outerHeight();
    var containerH = $('.next-previous-content > .container').outerHeight();
    var containerOffset = $('.next-previous-content > .container').offset().top;
    var contentOffset = $('.next-previous-content').offset().top;
    var contentBottomSpacing = contentH - containerH - containerOffset + contentOffset;


    if (posTop <= winH / 2 - linkOffset) {

        posTop = (winS * 2 + linkOffset);
        $('.nav-slide').addClass('fixed');
    } else {
        $('.nav-slide').removeClass('fixed');
    }


    if (winS > (docH - (winH / 2) - footerH - linkOffset - contentBottomSpacing)) {
        $('.nav-slide').addClass('bottom');
        $('.nav-slide a').css({
            bottom: contentBottomSpacing - linkOffset
        });
    } else {
        $('.nav-slide').removeClass('bottom');
        $('.nav-slide a').removeAttr('style');
    }

}


//run scroll checks on the next/previous buttons for ebook
function next_previous_chapter_check() {
    if ($('nav').hasClass('nav-slide') && $(window).width() > 767 && !$('html').hasClass('ltie9')) {

        scroll_handler_next_previous();

        $(window).scroll(scroll_handler_next_previous);

    } else {
        $(window).off("scroll", scroll_handler_next_previous);
    }
}

function next_previous_chapter() {
    if ($('nav').hasClass('nav-slide')) {
        // This cannot be declared in the scroll. It needs to be set on load and resize.
        if ($('.nav-slide a.next').length > 0) {
            navTop = $('.nav-slide a.next').offset().top;
        } else {
            navTop = $('.nav-slide a.prev').offset().top;
        }

        next_previous_chapter_check();

        $(window).resize(function () {
            $('.nav-slide').removeClass('fixed').removeClass('bottom');
            $('.nav-slide a').removeAttr('style');
            // This cannot be declared in the scroll. It needs to be set on load and resize.
            if ($('.nav-slide a.next').length > 0) {
                navTop = $('.nav-slide a.next').offset().top;
            } else {
                navTop = $('.nav-slide a.prev').offset().top;
            }
            $(window).off("scroll", scroll_handler_next_previous);
            next_previous_chapter_check();
        });
    }
}


//Sidebar fixed scrolling below. ------------------------------------------------

var docH;
var winH;
var winS;
var sidebarH;
var sidebarOT; //distance from top it should stop. Needs to match the CSS
var footerH;
var sidebarOffset;

//this is in order to dynamically find the content bottom padding for absolute positioning to the bottom
var contentH;
var containerH;
var containerOffset;
var contentOffset;
var contentBottomSpacing;
var navTop;

function scrollHandler() {
    winS = $(window).scrollTop();
    sidebarH = $('#sidebar').outerHeight();

    if (winS >= sidebarOffset) {
        $('#sidebar').addClass('fixed');
    } else {
        $('#sidebar').removeClass('fixed');
    }

    if (winS > (docH - footerH - sidebarH - sidebarOT - contentBottomSpacing)) {
        $('#sidebar').addClass('bottom');
    } else {
        $('#sidebar').removeClass('bottom');
    }
}


function custom_variables() {
    //VARIABLES
    docH = $(document).height();
    winH = $(window).height();
    winS = $(window).scrollTop();
    sidebarH = $('#sidebar').outerHeight();
    sidebarOT = 20; //distance from top it should stop. Needs to match the CSS
    footerH = $('footer').outerHeight();
    sidebarOffset = $('#sidebar').offset().top - sidebarOT;

    //this is in order to dynamically find the content bottom padding for absolute positioning to the bottom
    contentH = $('#sidebar').closest('.content').outerHeight();
    containerH = $('#sidebar').closest('.container').outerHeight();
    containerOffset = $('#sidebar').closest('.container').offset().top;
    contentOffset = $('#sidebar').closest('.content').offset().top;
    contentBottomSpacing = contentH - containerH - containerOffset + contentOffset;

}


function sidebar_scroll_fixed_check() {
    custom_variables();
    if ($('#sidebar').hasClass('scroll-fixed') && $(window).width() > 767 && !$('html').hasClass('ltie9') && winH > sidebarH + sidebarOT + contentBottomSpacing && sidebarH + 50 < containerH) {

        scrollHandler();
        $(window).scroll(scrollHandler);
    } else {
        $(window).off("scroll", scrollHandler);
        $('#sidebar').removeClass('bottom').removeClass('fixed');
    }

}


function sidebar_scroll_fixed() {
    if ($('#sidebar').hasClass('scroll-fixed')) {
        sidebar_scroll_fixed_check();

        $(window).resize(function () {
            $('#sidebar').removeClass('bottom').removeClass('fixed');
            $(window).off("scroll", scrollHandler);
            sidebar_scroll_fixed_check();
        });
    }
}

var window_top;

function remove_nav() {
    if ($('html').hasClass('menu-overflow')) {
        $('#super_menu').slideUp(10, function () {
            $('body').scrollTop(window_top);
        });
        $('body').removeClass('super-menu-open');
        $('html').removeClass('menu-overflow');
    } else if ($('body').hasClass('super-menu-open')) {
        $('#super_menu').slideUp(300);
        $('body').removeClass('super-menu-open');
        $('html').removeClass('menu-overflow');
    }
}

function add_nav() {
    $("#super_menu").css({'position': 'absolute', 'visibility': 'hidden', 'display': 'block'});// set the slement to get height
    optionHeight = $("#super_menu").height() + $('#top_bar').height();// get the element height
    $("#super_menu").removeAttr('style');// remove the temp css
    $('body').addClass('super-menu-open');
    if (optionHeight >= $(window).height()) {
        window_top = window.pageYOffset;
        $('html').addClass('menu-overflow');
        $('#super_menu').show();
        window.scrollTo(0, 0);

    } else {
        $('#super_menu').slideDown(300);
    }
}


$(document).on('click', '.as-title', function (event) {
    $(this).parent().find('.as-content').slideToggle();
    $(this).toggleClass('current');
});


$(document).on('click', '.menu-click a', function (event) {
    event.preventDefault();
    if ($('body').hasClass('super-menu-open')) {
        remove_nav()
    } else {
        add_nav()
    }
});


$(document).on('click', '.super-menu-open', function (event) {
    remove_nav();
});

$(document).on('click', '.super-menu-open #nav', function (event) {
    event.stopPropagation();
});


$(window).on('resize', function () {
    if (!$('html').hasClass('menu-overflow')) {
        remove_nav();
    }
});
//Spin JS
//fgnass.github.com/spin.js#v2.0.1
!function (a, b) {
    "object" == typeof exports ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.Spinner = b()
}(this, function () {
    "use strict";

    function a(a, b) {
        var c, d = document.createElement(a || "div");
        for (c in b) d[c] = b[c];
        return d
    }

    function b(a) {
        for (var b = 1, c = arguments.length; c > b; b++) a.appendChild(arguments[b]);
        return a
    }

    function c(a, b, c, d) {
        var e = ["opacity", b, ~~(100 * a), c, d].join("-"), f = .01 + c / d * 100,
            g = Math.max(1 - (1 - a) / b * (100 - f), a), h = j.substring(0, j.indexOf("Animation")).toLowerCase(),
            i = h && "-" + h + "-" || "";
        return l[e] || (m.insertRule("@" + i + "keyframes " + e + "{0%{opacity:" + g + "}" + f + "%{opacity:" + a + "}" + (f + .01) + "%{opacity:1}" + (f + b) % 100 + "%{opacity:" + a + "}100%{opacity:" + g + "}}", m.cssRules.length), l[e] = 1), e
    }

    function d(a, b) {
        var c, d, e = a.style;
        for (b = b.charAt(0).toUpperCase() + b.slice(1), d = 0; d < k.length; d++) if (c = k[d] + b, void 0 !== e[c]) return c;
        return void 0 !== e[b] ? b : void 0
    }

    function e(a, b) {
        for (var c in b) a.style[d(a, c) || c] = b[c];
        return a
    }

    function f(a) {
        for (var b = 1; b < arguments.length; b++) {
            var c = arguments[b];
            for (var d in c) void 0 === a[d] && (a[d] = c[d])
        }
        return a
    }

    function g(a, b) {
        return "string" == typeof a ? a : a[b % a.length]
    }

    function h(a) {
        this.opts = f(a || {}, h.defaults, n)
    }

    function i() {
        function c(b, c) {
            return a("<" + b + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', c)
        }

        m.addRule(".spin-vml", "behavior:url(#default#VML)"), h.prototype.lines = function (a, d) {
            function f() {
                return e(c("group", {coordsize: k + " " + k, coordorigin: -j + " " + -j}), {width: k, height: k})
            }

            function h(a, h, i) {
                b(m, b(e(f(), {
                    rotation: 360 / d.lines * a + "deg",
                    left: ~~h
                }), b(e(c("roundrect", {arcsize: d.corners}), {
                    width: j,
                    height: d.width,
                    left: d.radius,
                    top: -d.width >> 1,
                    filter: i
                }), c("fill", {color: g(d.color, a), opacity: d.opacity}), c("stroke", {opacity: 0}))))
            }

            var i, j = d.length + d.width, k = 2 * j, l = 2 * -(d.width + d.length) + "px", m = e(f(), {
                position: "absolute",
                top: l,
                left: l
            });
            if (d.shadow) for (i = 1; i <= d.lines; i++) h(i, -2, "progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");
            for (i = 1; i <= d.lines; i++) h(i);
            return b(a, m)
        }, h.prototype.opacity = function (a, b, c, d) {
            var e = a.firstChild;
            d = d.shadow && d.lines || 0, e && b + d < e.childNodes.length && (e = e.childNodes[b + d], e = e && e.firstChild, e = e && e.firstChild, e && (e.opacity = c))
        }
    }

    var j, k = ["webkit", "Moz", "ms", "O"], l = {}, m = function () {
        var c = a("style", {type: "text/css"});
        return b(document.getElementsByTagName("head")[0], c), c.sheet || c.styleSheet
    }(), n = {
        lines: 12,
        length: 7,
        width: 5,
        radius: 10,
        rotate: 0,
        corners: 1,
        color: "#000",
        direction: 1,
        speed: 1,
        trail: 100,
        opacity: .25,
        fps: 20,
        zIndex: 2e9,
        className: "spinner",
        top: "50%",
        left: "50%",
        position: "absolute"
    };
    h.defaults = {}, f(h.prototype, {
        spin: function (b) {
            this.stop();
            {
                var c = this, d = c.opts, f = c.el = e(a(0, {className: d.className}), {
                    position: d.position,
                    width: 0,
                    zIndex: d.zIndex
                });
                d.radius + d.length + d.width
            }
            if (e(f, {
                left: d.left,
                top: d.top
            }), b && b.insertBefore(f, b.firstChild || null), f.setAttribute("role", "progressbar"), c.lines(f, c.opts), !j) {
                var g, h = 0, i = (d.lines - 1) * (1 - d.direction) / 2, k = d.fps, l = k / d.speed,
                    m = (1 - d.opacity) / (l * d.trail / 100), n = l / d.lines;
                !function o() {
                    h++;
                    for (var a = 0; a < d.lines; a++) g = Math.max(1 - (h + (d.lines - a) * n) % l * m, d.opacity), c.opacity(f, a * d.direction + i, g, d);
                    c.timeout = c.el && setTimeout(o, ~~(1e3 / k))
                }()
            }
            return c
        }, stop: function () {
            var a = this.el;
            return a && (clearTimeout(this.timeout), a.parentNode && a.parentNode.removeChild(a), this.el = void 0), this
        }, lines: function (d, f) {
            function h(b, c) {
                return e(a(), {
                    position: "absolute",
                    width: f.length + f.width + "px",
                    height: f.width + "px",
                    background: b,
                    boxShadow: c,
                    transformOrigin: "left",
                    transform: "rotate(" + ~~(360 / f.lines * k + f.rotate) + "deg) translate(" + f.radius + "px,0)",
                    borderRadius: (f.corners * f.width >> 1) + "px"
                })
            }

            for (var i, k = 0, l = (f.lines - 1) * (1 - f.direction) / 2; k < f.lines; k++) i = e(a(), {
                position: "absolute",
                top: 1 + ~(f.width / 2) + "px",
                transform: f.hwaccel ? "translate3d(0,0,0)" : "",
                opacity: f.opacity,
                animation: j && c(f.opacity, f.trail, l + k * f.direction, f.lines) + " " + 1 / f.speed + "s linear infinite"
            }), f.shadow && b(i, e(h("#000", "0 0 4px #000"), {top: "2px"})), b(d, b(i, h(g(f.color, k), "0 0 1px rgba(0,0,0,.1)")));
            return d
        }, opacity: function (a, b, c) {
            b < a.childNodes.length && (a.childNodes[b].style.opacity = c)
        }
    });
    var o = e(a("group"), {behavior: "url(#default#VML)"});
    return !d(o, "transform") && o.adj ? i() : j = d(o, "animation"), h
});

//     Underscore.js 1.8.2
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function () {
    function n(n) {
        function t(t, r, e, u, i, o) {
            for (; i >= 0 && o > i; i += n) {
                var a = u ? u[i] : i;
                e = r(e, t[a], a, t)
            }
            return e
        }

        return function (r, e, u, i) {
            e = d(e, i, 4);
            var o = !w(r) && m.keys(r), a = (o || r).length, c = n > 0 ? 0 : a - 1;
            return arguments.length < 3 && (u = r[o ? o[c] : c], c += n), t(r, e, u, o, c, a)
        }
    }

    function t(n) {
        return function (t, r, e) {
            r = b(r, e);
            for (var u = null != t && t.length, i = n > 0 ? 0 : u - 1; i >= 0 && u > i; i += n) if (r(t[i], i, t)) return i;
            return -1
        }
    }

    function r(n, t) {
        var r = S.length, e = n.constructor, u = m.isFunction(e) && e.prototype || o, i = "constructor";
        for (m.has(n, i) && !m.contains(t, i) && t.push(i); r--;) i = S[r], i in n && n[i] !== u[i] && !m.contains(t, i) && t.push(i)
    }

    var e = this, u = e._, i = Array.prototype, o = Object.prototype, a = Function.prototype, c = i.push, l = i.slice,
        f = o.toString, s = o.hasOwnProperty, p = Array.isArray, h = Object.keys, v = a.bind, g = Object.create,
        y = function () {
        }, m = function (n) {
            return n instanceof m ? n : this instanceof m ? void(this._wrapped = n) : new m(n)
        };
    "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = m), exports._ = m) : e._ = m, m.VERSION = "1.8.2";
    var d = function (n, t, r) {
        if (t === void 0) return n;
        switch (null == r ? 3 : r) {
            case 1:
                return function (r) {
                    return n.call(t, r)
                };
            case 2:
                return function (r, e) {
                    return n.call(t, r, e)
                };
            case 3:
                return function (r, e, u) {
                    return n.call(t, r, e, u)
                };
            case 4:
                return function (r, e, u, i) {
                    return n.call(t, r, e, u, i)
                }
        }
        return function () {
            return n.apply(t, arguments)
        }
    }, b = function (n, t, r) {
        return null == n ? m.identity : m.isFunction(n) ? d(n, t, r) : m.isObject(n) ? m.matcher(n) : m.property(n)
    };
    m.iteratee = function (n, t) {
        return b(n, t, 1 / 0)
    };
    var x = function (n, t) {
        return function (r) {
            var e = arguments.length;
            if (2 > e || null == r) return r;
            for (var u = 1; e > u; u++) for (var i = arguments[u], o = n(i), a = o.length, c = 0; a > c; c++) {
                var l = o[c];
                t && r[l] !== void 0 || (r[l] = i[l])
            }
            return r
        }
    }, _ = function (n) {
        if (!m.isObject(n)) return {};
        if (g) return g(n);
        y.prototype = n;
        var t = new y;
        return y.prototype = null, t
    }, j = Math.pow(2, 53) - 1, w = function (n) {
        var t = n && n.length;
        return "number" == typeof t && t >= 0 && j >= t
    };
    m.each = m.forEach = function (n, t, r) {
        t = d(t, r);
        var e, u;
        if (w(n)) for (e = 0, u = n.length; u > e; e++) t(n[e], e, n); else {
            var i = m.keys(n);
            for (e = 0, u = i.length; u > e; e++) t(n[i[e]], i[e], n)
        }
        return n
    }, m.map = m.collect = function (n, t, r) {
        t = b(t, r);
        for (var e = !w(n) && m.keys(n), u = (e || n).length, i = Array(u), o = 0; u > o; o++) {
            var a = e ? e[o] : o;
            i[o] = t(n[a], a, n)
        }
        return i
    }, m.reduce = m.foldl = m.inject = n(1), m.reduceRight = m.foldr = n(-1), m.find = m.detect = function (n, t, r) {
        var e;
        return e = w(n) ? m.findIndex(n, t, r) : m.findKey(n, t, r), e !== void 0 && e !== -1 ? n[e] : void 0
    }, m.filter = m.select = function (n, t, r) {
        var e = [];
        return t = b(t, r), m.each(n, function (n, r, u) {
            t(n, r, u) && e.push(n)
        }), e
    }, m.reject = function (n, t, r) {
        return m.filter(n, m.negate(b(t)), r)
    }, m.every = m.all = function (n, t, r) {
        t = b(t, r);
        for (var e = !w(n) && m.keys(n), u = (e || n).length, i = 0; u > i; i++) {
            var o = e ? e[i] : i;
            if (!t(n[o], o, n)) return !1
        }
        return !0
    }, m.some = m.any = function (n, t, r) {
        t = b(t, r);
        for (var e = !w(n) && m.keys(n), u = (e || n).length, i = 0; u > i; i++) {
            var o = e ? e[i] : i;
            if (t(n[o], o, n)) return !0
        }
        return !1
    }, m.contains = m.includes = m.include = function (n, t, r) {
        return w(n) || (n = m.values(n)), m.indexOf(n, t, "number" == typeof r && r) >= 0
    }, m.invoke = function (n, t) {
        var r = l.call(arguments, 2), e = m.isFunction(t);
        return m.map(n, function (n) {
            var u = e ? t : n[t];
            return null == u ? u : u.apply(n, r)
        })
    }, m.pluck = function (n, t) {
        return m.map(n, m.property(t))
    }, m.where = function (n, t) {
        return m.filter(n, m.matcher(t))
    }, m.findWhere = function (n, t) {
        return m.find(n, m.matcher(t))
    }, m.max = function (n, t, r) {
        var e, u, i = -1 / 0, o = -1 / 0;
        if (null == t && null != n) {
            n = w(n) ? n : m.values(n);
            for (var a = 0, c = n.length; c > a; a++) e = n[a], e > i && (i = e)
        } else t = b(t, r), m.each(n, function (n, r, e) {
            u = t(n, r, e), (u > o || u === -1 / 0 && i === -1 / 0) && (i = n, o = u)
        });
        return i
    }, m.min = function (n, t, r) {
        var e, u, i = 1 / 0, o = 1 / 0;
        if (null == t && null != n) {
            n = w(n) ? n : m.values(n);
            for (var a = 0, c = n.length; c > a; a++) e = n[a], i > e && (i = e)
        } else t = b(t, r), m.each(n, function (n, r, e) {
            u = t(n, r, e), (o > u || 1 / 0 === u && 1 / 0 === i) && (i = n, o = u)
        });
        return i
    }, m.shuffle = function (n) {
        for (var t, r = w(n) ? n : m.values(n), e = r.length, u = Array(e), i = 0; e > i; i++) t = m.random(0, i), t !== i && (u[i] = u[t]), u[t] = r[i];
        return u
    }, m.sample = function (n, t, r) {
        return null == t || r ? (w(n) || (n = m.values(n)), n[m.random(n.length - 1)]) : m.shuffle(n).slice(0, Math.max(0, t))
    }, m.sortBy = function (n, t, r) {
        return t = b(t, r), m.pluck(m.map(n, function (n, r, e) {
            return {value: n, index: r, criteria: t(n, r, e)}
        }).sort(function (n, t) {
            var r = n.criteria, e = t.criteria;
            if (r !== e) {
                if (r > e || r === void 0) return 1;
                if (e > r || e === void 0) return -1
            }
            return n.index - t.index
        }), "value")
    };
    var A = function (n) {
        return function (t, r, e) {
            var u = {};
            return r = b(r, e), m.each(t, function (e, i) {
                var o = r(e, i, t);
                n(u, e, o)
            }), u
        }
    };
    m.groupBy = A(function (n, t, r) {
        m.has(n, r) ? n[r].push(t) : n[r] = [t]
    }), m.indexBy = A(function (n, t, r) {
        n[r] = t
    }), m.countBy = A(function (n, t, r) {
        m.has(n, r) ? n[r]++ : n[r] = 1
    }), m.toArray = function (n) {
        return n ? m.isArray(n) ? l.call(n) : w(n) ? m.map(n, m.identity) : m.values(n) : []
    }, m.size = function (n) {
        return null == n ? 0 : w(n) ? n.length : m.keys(n).length
    }, m.partition = function (n, t, r) {
        t = b(t, r);
        var e = [], u = [];
        return m.each(n, function (n, r, i) {
            (t(n, r, i) ? e : u).push(n)
        }), [e, u]
    }, m.first = m.head = m.take = function (n, t, r) {
        return null == n ? void 0 : null == t || r ? n[0] : m.initial(n, n.length - t)
    }, m.initial = function (n, t, r) {
        return l.call(n, 0, Math.max(0, n.length - (null == t || r ? 1 : t)))
    }, m.last = function (n, t, r) {
        return null == n ? void 0 : null == t || r ? n[n.length - 1] : m.rest(n, Math.max(0, n.length - t))
    }, m.rest = m.tail = m.drop = function (n, t, r) {
        return l.call(n, null == t || r ? 1 : t)
    }, m.compact = function (n) {
        return m.filter(n, m.identity)
    };
    var k = function (n, t, r, e) {
        for (var u = [], i = 0, o = e || 0, a = n && n.length; a > o; o++) {
            var c = n[o];
            if (w(c) && (m.isArray(c) || m.isArguments(c))) {
                t || (c = k(c, t, r));
                var l = 0, f = c.length;
                for (u.length += f; f > l;) u[i++] = c[l++]
            } else r || (u[i++] = c)
        }
        return u
    };
    m.flatten = function (n, t) {
        return k(n, t, !1)
    }, m.without = function (n) {
        return m.difference(n, l.call(arguments, 1))
    }, m.uniq = m.unique = function (n, t, r, e) {
        if (null == n) return [];
        m.isBoolean(t) || (e = r, r = t, t = !1), null != r && (r = b(r, e));
        for (var u = [], i = [], o = 0, a = n.length; a > o; o++) {
            var c = n[o], l = r ? r(c, o, n) : c;
            t ? (o && i === l || u.push(c), i = l) : r ? m.contains(i, l) || (i.push(l), u.push(c)) : m.contains(u, c) || u.push(c)
        }
        return u
    }, m.union = function () {
        return m.uniq(k(arguments, !0, !0))
    }, m.intersection = function (n) {
        if (null == n) return [];
        for (var t = [], r = arguments.length, e = 0, u = n.length; u > e; e++) {
            var i = n[e];
            if (!m.contains(t, i)) {
                for (var o = 1; r > o && m.contains(arguments[o], i); o++) ;
                o === r && t.push(i)
            }
        }
        return t
    }, m.difference = function (n) {
        var t = k(arguments, !0, !0, 1);
        return m.filter(n, function (n) {
            return !m.contains(t, n)
        })
    }, m.zip = function () {
        return m.unzip(arguments)
    }, m.unzip = function (n) {
        for (var t = n && m.max(n, "length").length || 0, r = Array(t), e = 0; t > e; e++) r[e] = m.pluck(n, e);
        return r
    }, m.object = function (n, t) {
        for (var r = {}, e = 0, u = n && n.length; u > e; e++) t ? r[n[e]] = t[e] : r[n[e][0]] = n[e][1];
        return r
    }, m.indexOf = function (n, t, r) {
        var e = 0, u = n && n.length;
        if ("number" == typeof r) e = 0 > r ? Math.max(0, u + r) : r; else if (r && u) return e = m.sortedIndex(n, t), n[e] === t ? e : -1;
        if (t !== t) return m.findIndex(l.call(n, e), m.isNaN);
        for (; u > e; e++) if (n[e] === t) return e;
        return -1
    }, m.lastIndexOf = function (n, t, r) {
        var e = n ? n.length : 0;
        if ("number" == typeof r && (e = 0 > r ? e + r + 1 : Math.min(e, r + 1)), t !== t) return m.findLastIndex(l.call(n, 0, e), m.isNaN);
        for (; --e >= 0;) if (n[e] === t) return e;
        return -1
    }, m.findIndex = t(1), m.findLastIndex = t(-1), m.sortedIndex = function (n, t, r, e) {
        r = b(r, e, 1);
        for (var u = r(t), i = 0, o = n.length; o > i;) {
            var a = Math.floor((i + o) / 2);
            r(n[a]) < u ? i = a + 1 : o = a
        }
        return i
    }, m.range = function (n, t, r) {
        arguments.length <= 1 && (t = n || 0, n = 0), r = r || 1;
        for (var e = Math.max(Math.ceil((t - n) / r), 0), u = Array(e), i = 0; e > i; i++, n += r) u[i] = n;
        return u
    };
    var O = function (n, t, r, e, u) {
        if (!(e instanceof t)) return n.apply(r, u);
        var i = _(n.prototype), o = n.apply(i, u);
        return m.isObject(o) ? o : i
    };
    m.bind = function (n, t) {
        if (v && n.bind === v) return v.apply(n, l.call(arguments, 1));
        if (!m.isFunction(n)) throw new TypeError("Bind must be called on a function");
        var r = l.call(arguments, 2), e = function () {
            return O(n, e, t, this, r.concat(l.call(arguments)))
        };
        return e
    }, m.partial = function (n) {
        var t = l.call(arguments, 1), r = function () {
            for (var e = 0, u = t.length, i = Array(u), o = 0; u > o; o++) i[o] = t[o] === m ? arguments[e++] : t[o];
            for (; e < arguments.length;) i.push(arguments[e++]);
            return O(n, r, this, this, i)
        };
        return r
    }, m.bindAll = function (n) {
        var t, r, e = arguments.length;
        if (1 >= e) throw new Error("bindAll must be passed function names");
        for (t = 1; e > t; t++) r = arguments[t], n[r] = m.bind(n[r], n);
        return n
    }, m.memoize = function (n, t) {
        var r = function (e) {
            var u = r.cache, i = "" + (t ? t.apply(this, arguments) : e);
            return m.has(u, i) || (u[i] = n.apply(this, arguments)), u[i]
        };
        return r.cache = {}, r
    }, m.delay = function (n, t) {
        var r = l.call(arguments, 2);
        return setTimeout(function () {
            return n.apply(null, r)
        }, t)
    }, m.defer = m.partial(m.delay, m, 1), m.throttle = function (n, t, r) {
        var e, u, i, o = null, a = 0;
        r || (r = {});
        var c = function () {
            a = r.leading === !1 ? 0 : m.now(), o = null, i = n.apply(e, u), o || (e = u = null)
        };
        return function () {
            var l = m.now();
            a || r.leading !== !1 || (a = l);
            var f = t - (l - a);
            return e = this, u = arguments, 0 >= f || f > t ? (o && (clearTimeout(o), o = null), a = l, i = n.apply(e, u), o || (e = u = null)) : o || r.trailing === !1 || (o = setTimeout(c, f)), i
        }
    }, m.debounce = function (n, t, r) {
        var e, u, i, o, a, c = function () {
            var l = m.now() - o;
            t > l && l >= 0 ? e = setTimeout(c, t - l) : (e = null, r || (a = n.apply(i, u), e || (i = u = null)))
        };
        return function () {
            i = this, u = arguments, o = m.now();
            var l = r && !e;
            return e || (e = setTimeout(c, t)), l && (a = n.apply(i, u), i = u = null), a
        }
    }, m.wrap = function (n, t) {
        return m.partial(t, n)
    }, m.negate = function (n) {
        return function () {
            return !n.apply(this, arguments)
        }
    }, m.compose = function () {
        var n = arguments, t = n.length - 1;
        return function () {
            for (var r = t, e = n[t].apply(this, arguments); r--;) e = n[r].call(this, e);
            return e
        }
    }, m.after = function (n, t) {
        return function () {
            return --n < 1 ? t.apply(this, arguments) : void 0
        }
    }, m.before = function (n, t) {
        var r;
        return function () {
            return --n > 0 && (r = t.apply(this, arguments)), 1 >= n && (t = null), r
        }
    }, m.once = m.partial(m.before, 2);
    var F = !{toString: null}.propertyIsEnumerable("toString"),
        S = ["valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
    m.keys = function (n) {
        if (!m.isObject(n)) return [];
        if (h) return h(n);
        var t = [];
        for (var e in n) m.has(n, e) && t.push(e);
        return F && r(n, t), t
    }, m.allKeys = function (n) {
        if (!m.isObject(n)) return [];
        var t = [];
        for (var e in n) t.push(e);
        return F && r(n, t), t
    }, m.values = function (n) {
        for (var t = m.keys(n), r = t.length, e = Array(r), u = 0; r > u; u++) e[u] = n[t[u]];
        return e
    }, m.mapObject = function (n, t, r) {
        t = b(t, r);
        for (var e, u = m.keys(n), i = u.length, o = {}, a = 0; i > a; a++) e = u[a], o[e] = t(n[e], e, n);
        return o
    }, m.pairs = function (n) {
        for (var t = m.keys(n), r = t.length, e = Array(r), u = 0; r > u; u++) e[u] = [t[u], n[t[u]]];
        return e
    }, m.invert = function (n) {
        for (var t = {}, r = m.keys(n), e = 0, u = r.length; u > e; e++) t[n[r[e]]] = r[e];
        return t
    }, m.functions = m.methods = function (n) {
        var t = [];
        for (var r in n) m.isFunction(n[r]) && t.push(r);
        return t.sort()
    }, m.extend = x(m.allKeys), m.extendOwn = m.assign = x(m.keys), m.findKey = function (n, t, r) {
        t = b(t, r);
        for (var e, u = m.keys(n), i = 0, o = u.length; o > i; i++) if (e = u[i], t(n[e], e, n)) return e
    }, m.pick = function (n, t, r) {
        var e, u, i = {}, o = n;
        if (null == o) return i;
        m.isFunction(t) ? (u = m.allKeys(o), e = d(t, r)) : (u = k(arguments, !1, !1, 1), e = function (n, t, r) {
            return t in r
        }, o = Object(o));
        for (var a = 0, c = u.length; c > a; a++) {
            var l = u[a], f = o[l];
            e(f, l, o) && (i[l] = f)
        }
        return i
    }, m.omit = function (n, t, r) {
        if (m.isFunction(t)) t = m.negate(t); else {
            var e = m.map(k(arguments, !1, !1, 1), String);
            t = function (n, t) {
                return !m.contains(e, t)
            }
        }
        return m.pick(n, t, r)
    }, m.defaults = x(m.allKeys, !0), m.clone = function (n) {
        return m.isObject(n) ? m.isArray(n) ? n.slice() : m.extend({}, n) : n
    }, m.tap = function (n, t) {
        return t(n), n
    }, m.isMatch = function (n, t) {
        var r = m.keys(t), e = r.length;
        if (null == n) return !e;
        for (var u = Object(n), i = 0; e > i; i++) {
            var o = r[i];
            if (t[o] !== u[o] || !(o in u)) return !1
        }
        return !0
    };
    var E = function (n, t, r, e) {
        if (n === t) return 0 !== n || 1 / n === 1 / t;
        if (null == n || null == t) return n === t;
        n instanceof m && (n = n._wrapped), t instanceof m && (t = t._wrapped);
        var u = f.call(n);
        if (u !== f.call(t)) return !1;
        switch (u) {
            case"[object RegExp]":
            case"[object String]":
                return "" + n == "" + t;
            case"[object Number]":
                return +n !== +n ? +t !== +t : 0 === +n ? 1 / +n === 1 / t : +n === +t;
            case"[object Date]":
            case"[object Boolean]":
                return +n === +t
        }
        var i = "[object Array]" === u;
        if (!i) {
            if ("object" != typeof n || "object" != typeof t) return !1;
            var o = n.constructor, a = t.constructor;
            if (o !== a && !(m.isFunction(o) && o instanceof o && m.isFunction(a) && a instanceof a) && "constructor" in n && "constructor" in t) return !1
        }
        r = r || [], e = e || [];
        for (var c = r.length; c--;) if (r[c] === n) return e[c] === t;
        if (r.push(n), e.push(t), i) {
            if (c = n.length, c !== t.length) return !1;
            for (; c--;) if (!E(n[c], t[c], r, e)) return !1
        } else {
            var l, s = m.keys(n);
            if (c = s.length, m.keys(t).length !== c) return !1;
            for (; c--;) if (l = s[c], !m.has(t, l) || !E(n[l], t[l], r, e)) return !1
        }
        return r.pop(), e.pop(), !0
    };
    m.isEqual = function (n, t) {
        return E(n, t)
    }, m.isEmpty = function (n) {
        return null == n ? !0 : w(n) && (m.isArray(n) || m.isString(n) || m.isArguments(n)) ? 0 === n.length : 0 === m.keys(n).length
    }, m.isElement = function (n) {
        return !(!n || 1 !== n.nodeType)
    }, m.isArray = p || function (n) {
        return "[object Array]" === f.call(n)
    }, m.isObject = function (n) {
        var t = typeof n;
        return "function" === t || "object" === t && !!n
    }, m.each(["Arguments", "Function", "String", "Number", "Date", "RegExp", "Error"], function (n) {
        m["is" + n] = function (t) {
            return f.call(t) === "[object " + n + "]"
        }
    }), m.isArguments(arguments) || (m.isArguments = function (n) {
        return m.has(n, "callee")
    }), "function" != typeof/./ && "object" != typeof Int8Array && (m.isFunction = function (n) {
        return "function" == typeof n || !1
    }), m.isFinite = function (n) {
        return isFinite(n) && !isNaN(parseFloat(n))
    }, m.isNaN = function (n) {
        return m.isNumber(n) && n !== +n
    }, m.isBoolean = function (n) {
        return n === !0 || n === !1 || "[object Boolean]" === f.call(n)
    }, m.isNull = function (n) {
        return null === n
    }, m.isUndefined = function (n) {
        return n === void 0
    }, m.has = function (n, t) {
        return null != n && s.call(n, t)
    }, m.noConflict = function () {
        return e._ = u, this
    }, m.identity = function (n) {
        return n
    }, m.constant = function (n) {
        return function () {
            return n
        }
    }, m.noop = function () {
    }, m.property = function (n) {
        return function (t) {
            return null == t ? void 0 : t[n]
        }
    }, m.propertyOf = function (n) {
        return null == n ? function () {
        } : function (t) {
            return n[t]
        }
    }, m.matcher = m.matches = function (n) {
        return n = m.extendOwn({}, n), function (t) {
            return m.isMatch(t, n)
        }
    }, m.times = function (n, t, r) {
        var e = Array(Math.max(0, n));
        t = d(t, r, 1);
        for (var u = 0; n > u; u++) e[u] = t(u);
        return e
    }, m.random = function (n, t) {
        return null == t && (t = n, n = 0), n + Math.floor(Math.random() * (t - n + 1))
    }, m.now = Date.now || function () {
        return (new Date).getTime()
    };
    var M = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "`": "&#x60;"
    }, N = m.invert(M), I = function (n) {
        var t = function (t) {
            return n[t]
        }, r = "(?:" + m.keys(n).join("|") + ")", e = RegExp(r), u = RegExp(r, "g");
        return function (n) {
            return n = null == n ? "" : "" + n, e.test(n) ? n.replace(u, t) : n
        }
    };
    m.escape = I(M), m.unescape = I(N), m.result = function (n, t, r) {
        var e = null == n ? void 0 : n[t];
        return e === void 0 && (e = r), m.isFunction(e) ? e.call(n) : e
    };
    var B = 0;
    m.uniqueId = function (n) {
        var t = ++B + "";
        return n ? n + t : t
    }, m.templateSettings = {evaluate: /<%([\s\S]+?)%>/g, interpolate: /<%=([\s\S]+?)%>/g, escape: /<%-([\s\S]+?)%>/g};
    var T = /(.)^/, R = {
        "'": "'",
        "\\": "\\",
        "\r": "r",
        "\n": "n",
        "\u2028": "u2028",
        "\u2029": "u2029"
    }, q = /\\|'|\r|\n|\u2028|\u2029/g, K = function (n) {
        return "\\" + R[n]
    };
    m.template = function (n, t, r) {
        !t && r && (t = r), t = m.defaults({}, t, m.templateSettings);
        var e = RegExp([(t.escape || T).source, (t.interpolate || T).source, (t.evaluate || T).source].join("|") + "|$", "g"),
            u = 0, i = "__p+='";
        n.replace(e, function (t, r, e, o, a) {
            return i += n.slice(u, a).replace(q, K), u = a + t.length, r ? i += "'+\n((__t=(" + r + "))==null?'':_.escape(__t))+\n'" : e ? i += "'+\n((__t=(" + e + "))==null?'':__t)+\n'" : o && (i += "';\n" + o + "\n__p+='"), t
        }), i += "';\n", t.variable || (i = "with(obj||{}){\n" + i + "}\n"), i = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + i + "return __p;\n";
        try {
            var o = new Function(t.variable || "obj", "_", i)
        } catch (a) {
            throw a.source = i, a
        }
        var c = function (n) {
            return o.call(this, n, m)
        }, l = t.variable || "obj";
        return c.source = "function(" + l + "){\n" + i + "}", c
    }, m.chain = function (n) {
        var t = m(n);
        return t._chain = !0, t
    };
    var z = function (n, t) {
        return n._chain ? m(t).chain() : t
    };
    m.mixin = function (n) {
        m.each(m.functions(n), function (t) {
            var r = m[t] = n[t];
            m.prototype[t] = function () {
                var n = [this._wrapped];
                return c.apply(n, arguments), z(this, r.apply(m, n))
            }
        })
    }, m.mixin(m), m.each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (n) {
        var t = i[n];
        m.prototype[n] = function () {
            var r = this._wrapped;
            return t.apply(r, arguments), "shift" !== n && "splice" !== n || 0 !== r.length || delete r[0], z(this, r)
        }
    }), m.each(["concat", "join", "slice"], function (n) {
        var t = i[n];
        m.prototype[n] = function () {
            return z(this, t.apply(this._wrapped, arguments))
        }
    }), m.prototype.value = function () {
        return this._wrapped
    }, m.prototype.valueOf = m.prototype.toJSON = m.prototype.value, m.prototype.toString = function () {
        return "" + this._wrapped
    }, "function" == typeof define && define.amd && define("underscore", [], function () {
        return m
    })
}).call(this);
$(document).ready(function () {
    function showAdvertising(value) {
        if (value.indexOf('play.google') >= 0 || value.indexOf('itunes.apple') >= 0) {
            $('.advertising-container__text--question').html(advertising_text.app.question);
            $('.advertising-container__text--solution').html(advertising_text.app.solution);
            $('.advertising-container__button').attr('href', advertising_text.app.url);


            $('.advertising-container').addClass('slideDown');

        } else if (value.indexOf('instagram') >= 0 ||
            value.indexOf('twitter') >= 0 ||
            value.indexOf('facebook') >= 0 ||
            value.indexOf('snapshat') >= 0 ||
            value.indexOf('pinterest') >= 0 ||
            value.indexOf('plus.google') >= 0 ||
            value.indexOf('flickr') >= 0 ||
            value.indexOf('vimeo') >= 0 ||
            value.indexOf('dribbble') >= 0 ||
            value.indexOf('reddit') >= 0 ||
            value.indexOf('tripadvisor') >= 0 ||
            value.indexOf('wechat') >= 0 ||
            value.indexOf('reddit') >= 0 ||
            value.indexOf('github') >= 0 ||
            value.indexOf('snapshat') >= 0 ||
            value.indexOf('skype') >= 0
        ) {
            $('.advertising-container__text--question').html(advertising_text.social.question);
            $('.advertising-container__text--solution').html(advertising_text.social.solution);
            $('.advertising-container__button').attr('href', advertising_text.social.url);

            $('.advertising-container').addClass('slideDown');
        } else if (value.indexOf('youtube') >= 0 || value.indexOf('youtu.be') >= 0) {
            $('.advertising-container__text--question').html(advertising_text.video.question);
            $('.advertising-container__text--solution').html(advertising_text.video.solution);
            $('.advertising-container__button').attr('href', advertising_text.video.url);

            $('.advertising-container').addClass('slideDown');
        } else if (value.indexOf('.pdf') >= 0) {
            $('.advertising-container__text--question').html(advertising_text.pdf.question);
            $('.advertising-container__text--solution').html(advertising_text.pdf.solution);
            $('.advertising-container__button').attr('href', advertising_text.pdf.url);

            $('.advertising-container').addClass('slideDown');
        } else
            $('.advertising-container').removeClass('slideDown');
    }

    var timer, delay = 500;
    $('#url_text').bind('keydown paste', function (e) {
        e.stopPropagation();
        var _this = $(this);
        clearTimeout(timer);
        timer = setTimeout(function () {
            showAdvertising(_this.val());
        }, delay);
    });

    $('.advertising-container__close').on('click', function () {
        $('.advertising-container').removeClass('slideDown');
    });

    var Generator = {
        getCodeFrame: function (toggleFrame, codeText) {
            var frameName = "";
            var color = "";
            var logo = "";
            var marker = "";

            if ($("#gendiv_needed_id").hasClass("menu-advanced")) {
                frameName = $('.menu-container__item__content .frame-toggle.active').attr('data-value');
            } else {
                frameName = $('.frame-style-row .frame-toggle.active').attr('data-value');
            }

            color = $('.menu-container__item__content .color-toggle.active').attr('data-value');

            logo = $('.menu-container__item__content .logo-toggle.active').attr('data-value');

            marker = $('.menu-container__item__content .edge-toggle.active').attr('data-value');

            $.ajax({
                method: "POST",
                url: "https://api.qr-code-generator.com/v1/create?access-token=EBephxedmZHs9OWzR2Kbv-125ifulLI1LemyW4NO2hwWifAzpHadEVcOq-OkFtNz&_lang=en",
                data: {
                    frame_name: frameName,
                    qr_code_text: codeText,
                    frame_text: 'Scan me',
                    frame_icon_name: 'mobile',
                    frame_color: color,
                    foreground_color: color,
                    qr_code_logo: logo,
                    marker_left_template: marker,
                    marker_right_template: marker,
                    marker_bottom_template: marker
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (response) {
                    setTimeout(function () {
                        $('.prevFrameImg').hide();
                        var $frameSVGBody = $('#frameBody #svgContainer');
                        $frameSVGBody.html('');
                        if (toggleFrame)
                            if ($('.frame-toggle[data-value="no-frame"]').hasClass('active'))
                                $('#frameBody').addClass('noFrame-body');
                            else
                                $('#frameBody').removeClass('noFrame-body');
                        $frameSVGBody.append(response.rootElement).css('opacity', '1');
                        stopQRCodeAnimation();
                    }, 500);
                }
            })
        },
        init: function () {

            $("#startDirectDownload").click(function () {
                setTimeout(function () {
                    window.location.assign($("#codeText").val());
                }, 1000);
            });

            $("#sendAgain").click(function () {
                $("#downloadForm #email").val("");
                $("#downloadForm").slideDown();
                $("#sendSuccess").slideUp();
            });

            var lazySendMail = _.debounce(function () {
                var email = $("#downloadForm #email").val();
                var text = $(".codeTextRaw").val();
                var name = $("#qrcodeName").val();

                $("#sendDownloadPerMail").attr("disabled", "disabled");
                $.post("/wp-content/themes/qr/mail/mailer.php", {
                    email: email,
                    text: text,
                    name: name
                }, function (data) {


                    $("#sendDownloadPerMail").removeAttr("disabled");
                    $("#downloadForm #email,#email_error,#downloadForm #createcodefirst").removeClass("error-on-submit");
                    if (data.status == "error") {
                        switch (parseInt(data.code)) {
                            case 1:
                                $("#downloadForm #email,#email_error").addClass("error-on-submit");
                                break;
                            case 2:
                                $("#downloadForm #createcodefirst").addClass("error-on-submit");
                                break;


                        }
                    }
                    else {
                        $("#downloadForm").slideUp();
                        $("#sendSuccess").slideDown();
                    }

                }, "json");

            }, 500);


            $("#sendDownloadPerMail").click(function () {
                lazySendMail();
            });


            // Download Button
            $(".btn-create").click(Generator.createCode);


            // Download Button
            $(".btn-download").on("click", Generator.downloadCode);
            $(".btn-download-mobile").off("click").on("click", Generator.downloadCodeDirectly);
            // Embed Button
            $(".btn-embed").click(Generator.embedCode);

            $(".generator input, .generator textarea").on("change keyup", function (e) {
                Generator.setState("changes-made");
                Generator.unsetState("qrcode-created");
                if ($(".btn-download").hasClass("active")) {
                    $(".btn-download").removeClass("active");
                    $(".btn-download").addClass("not-active");
                    $(".btn-create").removeClass("disabled");
                }
                if (e.keyCode == 13) {
                    Generator.createCode();
                }
            });
            $(".btn-svg, .btn-eps").click(function () {
                SlideshowModal.show("printquality");
            });

            $(".show-frame-modal").click(function () {
                SlideshowModal.show("frames");
            });

            $(".show-colors-modal").click(function () {
                SlideshowModal.show("colorcodes");
            });

            $(".show-logo-modal").click(function () {
                SlideshowModal.show("designcodes2");
            });

            $(".frame-toggle").click(function () {
                if (!$(this).parent().hasClass('frame-format-container') && !$(this).hasClass('active')) {
                    $(this).parent().find('.frame-toggle').removeClass('active');
                    $(this).addClass('active');
                    startQRCodeAnimation();
                    Generator.updateCode(true);
                }

            });

            $(".color-toggle").click(function () {
                if (!$(this).hasClass('active')) {
                    $(this).parent().find('.color-toggle').removeClass('active');
                    $(this).addClass('active');
                    startQRCodeAnimation();
                    Generator.updateCode(false);
                }

            });

            $(".logo-toggle").click(function () {
                if (!$(this).hasClass('active')) {
                    $(this).parent().find('.logo-toggle').removeClass('active');
                    $(this).addClass('active');
                    startQRCodeAnimation();
                    Generator.updateCode(false);
                }

            });

            $(".edge-toggle").click(function () {
                if (!$(this).hasClass('active')) {
                    $(this).parent().find('.edge-toggle').removeClass('active');
                    $(this).addClass('active');
                    startQRCodeAnimation();
                    Generator.updateCode(false);
                }

            });


            function _focusInput() {
                $(".tab-pane.active input, .tab-pane.active textarea").first().focus();
            }


// show/hide dynamiccode ad
            $(".generator input[name='type_selector']").change(radioValueChanged);


            function radioValueChanged() {
                var radioValue = $(this).val();
                if ($(this).is(":checked") && radioValue == "0") {
                    // $('#url_form .inputs').removeClass("hide");
                    // $(".btn-create").popover("hide");
                    Generator.unsetState("not-allowed");
                } else {
                    // $(".btn-create").popover({html:true,"content":$("#dynamiccodes_ad").html(),trigger:"manual"}).popover("show");
                    // $(".btn-create").popover("show");
                    Generator.setState("not-allowed");
                    // $('#url_form .inputs').addClass("hide");

                    // _gaq.push(['_trackEvent', 'Generator', 'dynamic ad', 'show', 1, false]);
                }
            }

            function refreshDynamicCodesAd() {
                $("input[name='type_selector']:checked").trigger("change");

            }

            _focusInput();


        },


        createCode: function () {
            if (!Generator.isState("not-allowed") && Generator.updateCode()) {
                Generator.unsetState("changes-made");
                startQRCodeAnimation();
                setTimeout(function () {
                    stopQRCodeAnimation();
                    Generator.setState("qrcode-created");
                    Generator.unsetState("start");
                    $(".btn-download").removeClass("not-active");
                    $(".btn-download").addClass("active");
                    $(".btn-create").addClass("disabled");
                }, 1000);
                if (window.innerWidth <= 1024) {
                    $(".logo").hide();
                    $(".back-button").show();
                    $("#content-features").hide();
                    $("body").toggleClass("background-blue-only");
                }
            }


        },

        unsetState: function (state) {
            // console.log("unsetState: " + state);
            $(".generator").removeClass("state-" + state);
        },
        setState: function (state) {
            // console.log("setState: " + state);
            $(".generator").addClass("state-" + state);
        },
        isState: function (state) {
            return $(".generator").hasClass("state-" + state);

        },
        embedCode: function () {
            if (Generator.isState("qrcode-created")) {
                $("#modalEmbed").modal();
            }
        },
        downloadCodeDirectly: function () {
            window.location.assign($("#codeText").val());
        },
        downloadCode: function () {
            if (Generator.isState("qrcode-created")) {

                if ($("#codeText").val() == "") {
                    alert($("#gendiv_needed_id").attr("data-empty-code"));
                    return false;
                }
                downloadDelay = 1;
                if ($("#downloaddelay")) {
                    downloadDelay = $("#downloaddelay").val();
                }


                text = $("#codeText").val();
                if ($("#testreadme").val() == 1) {
                    text = text + "&addReadme=true";
                }

                if ($('.frame-download-active').length != 0) {
                    var frameStyle = "";
                    var color = "";
                    var logo = "";
                    var marker = "";

                    if ($("#gendiv_needed_id").hasClass("menu-advanced")) {
                        frameStyle = $('.menu-container__item__content .frame-toggle.active').attr('data-value');
                    } else {
                        frameStyle = $('.frame-style-row .frame-toggle.active').attr('data-value');
                    }

                    color = $('.menu-container__item__content .color-toggle.active').attr('data-value');

                    logo = $('.menu-container__item__content .logo-toggle.active').attr('data-value');

                    marker = $('.menu-container__item__content .edge-toggle.active').attr('data-value');

                    //var frameStyle = $('.menu-container__item__content .frame-toggle.active').attr('data-value');
                    var url = "https://api.qr-code-generator.com/v1/create?access-token=EBephxedmZHs9OWzR2Kbv-125ifulLI1LemyW4NO2hwWifAzpHadEVcOq-OkFtNz";
                    url = url + '&frame_name=' + frameStyle;
                    url = url + '&frame_color=' + encodeURIComponent(color);
                    url = url + '&foreground_color=' + encodeURIComponent(color);

                    if(logo !== undefined)
                    url = url + '&qr_code_logo=' + logo;
                    url = url + '&marker_left_template=' + marker;
                    url = url + '&marker_right_template=' + marker;
                    url = url + '&marker_bottom_template=' + marker;
                    url = url + '&qr_code_text=' + encodeURIComponent(Generator.getCodeText());
                    url = url + '&frame_text=Scan me';
                    url = url + '&frame_icon_name=mobile';
                    url = url + '&image_format=PNG';
                    url = url + '&image_width=300';
                    url = url + '&download=1';


                    if(Math.floor(Math.random() * 100) + 1 <=5){
                        $("#modalDowloadV7").modal();
                    }else {
                        $("#modalDowloadV11").modal();
                    }

                    setTimeout(function () {
                        var downloadLink = document.createElement("a");
                        downloadLink.href = url;
                        downloadLink.download = "qrcode.png";
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                    }, downloadDelay);
                } else {
                    if(Math.floor(Math.random() * 100) + 1 <=5){
                        $("#modalDowloadV7").modal();
                        setTimeout(function () {
                            window.location.assign(text);
                        }, downloadDelay);
                    }
                    else if ($("#gendiv_needed_id").hasClass("downoad-dialog-v6")) {
                        $("#modalDowloadV6").modal();
                        setTimeout(function () {
                            window.location.assign(text);
                        }, downloadDelay);
                    }

                    else if ($("#gendiv_needed_id").hasClass("downoad-dialog-v7")) {
                        $("#modalDowloadV7").modal();
                        setTimeout(function () {
                            window.location.assign(text);
                        }, downloadDelay);
                    }

                    else if ($("#gendiv_needed_id").hasClass("downoad-dialog-v8")) {
                        $("#modalDowloadV8").modal();
                        setTimeout(function () {
                            window.location.assign(text);
                        }, downloadDelay);
                    }

                    else if ($("#gendiv_needed_id").hasClass("downoad-dialog-v9")) {
                        $("#modalDowloadV9").modal();
                        setTimeout(function () {
                            window.location.assign(text);
                        }, downloadDelay);
                    }
                    else if ($("#gendiv_needed_id").hasClass("downoad-dialog-v10")) {
                        $("#modalDowloadV10").modal();
                        setTimeout(function () {
                            window.location.assign(text);
                        }, downloadDelay);
                    }
                    else if ($("#gendiv_needed_id").hasClass("downoad-dialog-v11")) {
                        $("#modalDowloadV11").modal();
                        setTimeout(function () {
                            window.location.assign(text);

                        }, downloadDelay);
                    }
                    else if ($("#gendiv_needed_id").hasClass("downoad-dialog-v12")) {
                        $("#modalDowloadV12").modal();
                        setTimeout(function () {
                            window.location.assign(text);
                        }, downloadDelay);
                    }
                    else {
                        $("#modalDowload").modal();
                        setTimeout(function () {
                            window.location.assign(text);
                        }, downloadDelay);
                    }
                }

                if ($("#gendiv_needed_id").hasClass("scrollMe")) {
                    $('html, body').animate({
                        scrollTop: $("#customer-single-content").offset().top - 150
                    }, 2000);
                }


                //goog_report_conversion();

            }
        },
        getCodeText: function (toggleFrame) {
            var codeText = "";
            var labelText = "";
            switch ($(".tab-pane.active .forms").attr("form")) {

                case "url":
                    codeText = $("#url_text").val().length == 0 ? 'http://www.example.com' : $("#url_text").val();
                    if (!codeText.match(/^[a-zA-Z]+:\/\//i))
                    {
                        codeText = 'http://' + codeText;
                    }

                    labelText = codeText;

                    break;

                case "vcard":

                    VcardBarcode_last_name = $("#VcardBarcode_last_name").val();
                    VcardBarcode_first_name = $("#VcardBarcode_first_name").val();
                    VcardBarcode_organization = $("#VcardBarcode_organization").val();
                    VcardBarcode_birthday = $("#VcardBarcode_birthday").val();
                    VcardBarcode_zip = $("#VcardBarcode_zip").val();
                    VcardBarcode_state = $("#VcardBarcode_state").val();
                    VcardBarcode_land = $("#VcardBarcode_land").val();
                    VcardBarcode_city = $("#VcardBarcode_city").val();
                    VcardBarcode_street = $("#VcardBarcode_street").val();
                    VcardBarcode_fax = $("#VcardBarcode_fax").val();
                    VcardBarcode_phone = $("#VcardBarcode_phone").val();
                    VcardBarcode_web_address = $("#VcardBarcode_web_address").val();
                    VcardBarcode_mail_address = $("#VcardBarcode_mail_address").val();
                    VcardBarcode_mobile_number = $("#VcardBarcode_mobile_number").val();
                    VcardBarcode_job_title = $("#VcardBarcode_job_title").val();

                    if (VcardBarcode_last_name == "" && VcardBarcode_first_name == "") {
                        alert($("#gendiv_needed_id").attr("data-empty-vcard"));
                        return false;
                    }


                    codeText = "BEGIN:VCARD" + "\n";
                    codeText += "VERSION:3.0" + "\n";
                    codeText += "N:" + VcardBarcode_last_name + ";" + VcardBarcode_first_name + "\n";
                    codeText += "FN:" + VcardBarcode_first_name + " " + VcardBarcode_last_name + "\n";
                    codeText += "ORG:" + VcardBarcode_organization + "\n";
                    codeText += "TITLE:" + VcardBarcode_job_title + "\n";
                    codeText += "ADR:;;" + VcardBarcode_street + ";" + VcardBarcode_city + ";" + VcardBarcode_state + ";" + VcardBarcode_zip + ";" + VcardBarcode_land + "\n";
                    codeText += "TEL;WORK;VOICE:" + VcardBarcode_phone + "\n";
                    codeText += "TEL;CELL:" + VcardBarcode_mobile_number + "\n";
                    codeText += "TEL;FAX:" + VcardBarcode_fax + "\n";
                    codeText += "EMAIL;WORK;INTERNET:" + VcardBarcode_mail_address + "\n";
                    codeText += "URL:" + VcardBarcode_web_address + "\n";
                    codeText += "BDAY:" + VcardBarcode_birthday + "\n";
                    codeText += "END:VCARD" + "\n";

                    labelText = "";
                    if (VcardBarcode_first_name != "")
                        labelText += VcardBarcode_first_name + " ";

                    if (VcardBarcode_last_name != "")
                        labelText += VcardBarcode_last_name + " ";

                    if (VcardBarcode_organization != "")
                        labelText += " - ".VcardBarcode_organization;

                    if (labelText == "")
                        labelText = "vCard Code";

                    break;

                case "text":
                    codeText = $("#text_text").val();
                    if (codeText != "")
                        labelText = codeText;
                    else
                        labelText = "Text Code";

                    if (codeText == "") {
                        alert("Bitte geben Sie einen Text ein.");
                        return false;
                    }


                    break;

                case "email":
                    email_email = $("#email_email").val();
                    email_subject = $("#email_subject").val();
                    email_message = $("#email_message").val();
                    codeText = "MATMSG:TO:" + email_email + ";SUB:" + email_subject + ";BODY:" + email_message + ";;";

                    if (email_subject == "" && email_message == "")
                        codeText = "MAILTO:" + email_email;

                    if (email_email != "")
                        labelText = email_email;
                    else
                        labelText = "E-Mail Code";

                    if (email_email == "") {
                        alert($("#gendiv_needed_id").attr("data-empty-email"));
                        return false;
                    }
                    break;

                case "sms":

                    sms_number = $("#sms_number").val();
                    sms_message = $("#sms_message").val();
                    codeText = "SMSTO:" + sms_number + ":" + sms_message;

                    if (sms_number != "")
                        labelText = sms_number;
                    else
                        labelText = "SMS Code";


                    if (sms_number == "") {
                        alert($("#gendiv_needed_id").attr("data-empty-sms"));
                        return false;
                    }

                    break;
            }
            return codeText;
        },
        updateCode: function (toggleFrame) {
            var codeText = Generator.getCodeText();
            var labelText = "";

            var size = "180x180";
            var urlprefix = $("#gendiv_needed_id").attr("data-url-prefix");


            $('#frameBody #svgContainer').css('opacity', '0.2');
            Generator.getCodeFrame(toggleFrame, codeText);

            $("#codeText").attr("value", urlprefix + "/phpqrcode/getCode.php?cht=qr&chl=" + encodeURIComponent(codeText) + "&chs=" + size + "&choe=UTF-8&chld=L|0&download=true");
            $("#codeTextClean").attr("value", encodeURIComponent(codeText));
            $(".codeTextRaw").attr("value", codeText);

            $("#codeLabel").attr("value", labelText);

            var keywordlist = $("#seokeywords").text();//code, code generator, qr-code-generator, code qr, codes, codes qr,qr code erstellen, qr code erstellen,qr code generator,qr code,qr codes,qr,www.qrcode-generator.de,http://www.qrcode-generator.de,hier qr code erstellen,qr-code-generator,qr generator,generator qr,generator qr code,qr-codes,qrcode,qrcodes,qr code hier erstellen,qrcode-generator.de";
            var keywords = keywordlist.split(",");
            var keyword = keywords[Math.floor(Math.random() * keywords.length)];

            urlprefix = "http://" + $("#seodomain").text();

            switch (Math.floor((Math.random() * 5) + 1)) {
                case 1: //normal
                    $("#htmlcode_source").val("<a rel='nofollow' href='" + urlprefix + "' border='0' style='cursor:default'><img src='https://chart.googleapis.com/chart?cht=qr&chl=" + encodeURIComponent(codeText) + "&chs=" + size + "&choe=UTF-8&chld=L|2' alt='" + keyword + "'></a>");
                    break;
                case 2: //nofollow
                    $("#htmlcode_source").val("<a rel='nofollow' href='" + urlprefix + "' border='0' style='cursor:default'><img src='https://chart.googleapis.com/chart?cht=qr&chl=" + encodeURIComponent(codeText) + "&chs=" + size + "&choe=UTF-8&chld=L|2' alt='" + keyword + "'></a>");
                    break;
                case 3: //pre image
                    $("#htmlcode_source").val("<a rel='nofollow' href='" + urlprefix + "' border='0' style='cursor:default'>" + keyword + "</a><img src='https://chart.googleapis.com/chart?cht=qr&chl=" + encodeURIComponent(codeText) + "&chs=" + size + "&choe=UTF-8&chld=L|2' alt='" + keyword + "'>");
                    break;
                case 4: //postimage
                    $("#htmlcode_source").val("<img src='https://chart.googleapis.com/chart?cht=qr&chl=" + encodeURIComponent(codeText) + "&chs=" + size + "&choe=UTF-8&chld=L|2' alt='qr code'><a href='" + urlprefix + "' border='0' style='cursor:default'  rel='nofollow'>" + keyword + "</a>");
                    break;
                case 5: //postimage
                    $("#htmlcode_source").val("<img src='https://chart.googleapis.com/chart?cht=qr&chl=" + encodeURIComponent(codeText) + "&chs=" + size + "&choe=UTF-8&chld=L|2' rel='nofollow' alt='qr code'><a href='" + urlprefix + "' border='0' style='cursor:default'  rel='nofollow'>" + keyword + "</a>");
                    break;
            }

            if ($("#gendiv_needed_id").hasClass("genfade"))
                $("#downloadButtonSection").slideDown();


            return true;
        }


    };

    $(".back-button").click(function (e) {
        $(".back-button").hide();
        $(".logo").show();
        $("#content-features").show();
        $("body").toggleClass("background-blue-only");

        Generator.unsetState("qrcode-created");
        $(".btn-download").removeClass("active");
        $(".btn-download").addClass("not-active");
        $(".btn-create").removeClass("disabled");
    });

    $(".menu-container__item__label").click(function (event) {
        var clickedItem = event.currentTarget.parentElement;
        if (!clickedItem.classList.contains("menu-open")) {
            $(".menu-container__item.menu-open").toggleClass("menu-open");
        }
        clickedItem.classList.toggle("menu-open");
    });

    Generator.init();

    $(".dropdown-menu li").on('click', function () {
        $("#selected-item").html($(this.children).html());
        $(this).parent().find('li').removeClass('active');
        if ($(this.firstElementChild).attr('signup') == "true") {
            $('.generator-foot').hide();
        } else {
            $('.generator-foot').show();
        }
    });

    $(".generator .nav-tabs a").click(function (event) {
        if ($(event.currentTarget).attr('signup') == "true") {
            //dataLayer.push({'event': 'optimize.activate'});
            $('.generator-foot').hide();
        } else if (!$(event.currentTarget).hasClass("dropdown-toggle")) {
            $('.generator-foot').show();
        }

        if ($('.code-promotion').length) {
            if ($(event.currentTarget).attr('data-promo') == undefined) {
                $("div[id*='promo_tab']").hide();
                if ($('.frame-download-active').length) {
                    $('.prevFrameContainer').show();
                } else {
                    $('.qr-preview-container').show();
                    $('#downloadButtonSection').show();
                }
            } else {
                $("div[id*='promo_tab']").hide();
                $('.code-promotion').addClass('code-promotion--active');
                if ($('.frame-download-active').length)
                    $('.prevFrameContainer').hide();
                else {
                    $('.qr-preview-container').hide();
                    $('#downloadButtonSection').hide();
                }
                $('.code-promotion__container').show();

                var promoTab = $('#promo_' + $(event.currentTarget).attr('id'));
                promoTab.show();
                if (!promoTab.find('img').length) {
                    var imgUrl = promoTab.data('img-rel');
                    var frameUrl = promoTab.data('frame-rel');
                    promoTab.find(".code-promotion__images").append("<img src='" + imgUrl + "' class='code-promotion__container__image' />");
                    promoTab.find(".code-promotion__images").append("<img src='" + frameUrl + "' class='code-promotion__container__frameCode'/>");
                }
            }

        }
        setTimeout(function () {
            Generator.unsetState("not-allowed");

            Generator.unsetState("placeholder");
            if ($(".tab-pane.active .forms").attr("form") == "notallowed")
                Generator.setState("placeholder");

            $(".tab-pane.active input, .tab-pane.active textarea").first().focus();
            $('#is_static input').prop('checked', true);
            $("input[name='type_selector']:checked").trigger("change")
        }, 10);
    });

    window.SlideshowModal = {
        map: window.SlideshowModalMap,
        initialized: false,
        show: function (item) {
            $("#modalSlideshow").modal();
            $.each($("#modalSlideshow img[data-lazy-src-super]"), function () {
                var $img = $(this);
                var src = $img.attr('data-lazy-src-super');
                $img.attr("src", src);
                $img.removeAttr('data-lazy-src-super');
            });
            $('#modalSlideshow .carousel').carousel({
                interval: false
            });

            if (item)
                $('#modalSlideshow .carousel').carousel(SlideshowModal.map[item]);
        }
    };

// AJAX ANIMATION
    var opts = {
        lines: 8, // The number of lines to draw
        length: 0, // The length of each line
        width: 7, // The line thickness
        radius: 20, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb
        speed: 0.9, // Rounds per second
        trail: 100, // Afterglow percentage
        zIndex: 999, // The z-index (defaults to 2000000000)
        top: "50%", // Top position relative to parent in px
        left: "50%" // Left position relative to parent in px
    };

    var qrSpinner = false;


    function startQRCodeAnimation() {
        var spinner = $(".qr-preview-overlay")[0];
        if ($('.frame-download-active').length != 0)
            spinner = $(".frame-download-active .prevFrameContainer .qr-preview-overlay")[0];
        if (!qrSpinner)
            qrSpinner = new Spinner(opts).spin(spinner);
        else
            qrSpinner.spin(spinner);

        $(".generator").addClass("state-generating");
    }

    function stopQRCodeAnimation() {
        qrSpinner.stop();
        $(".generator").removeClass("state-generating");
        $("#downloadButton").removeClass("inactive");
    }

    //help screen
    $("#help-btn").on("click", show_help_screen);
    $(".help-text-inner").on("click", hide_help_screen);
    $(".help-text").on("click", hide_help_screen);

    function show_help_screen() {
        var darkBackground = $('#modal-backdrop');
        //show background
        if (darkBackground.length) {
            darkBackground.addClass('modal-backdrop in');
        } else {
            darkBackground = $('<div/>', {
                class: 'modal-backdrop fade in',
                id: 'modal-backdrop'
            }).click(hide_help_screen).appendTo('body');

            var closeButton = $('<i/>', {
                class: 'help-text icon icon-close right-top-corner qr-icon-20'
            });
            closeButton.appendTo(darkBackground);
        }
        //show text
        $('.help-text').show();
    }

    function hide_help_screen() {
        $('#modal-backdrop').removeClass('modal-backdrop in');
        $('.help-text').hide();
    }

    //end help screen
});
window.bioEp = {
    // Private variables
    bgEl: {},
    popupEl: {},
    closeBtnEl: {},
    shown: false,
    overflowDefault: "visible",
    transformDefault: "",

    // Popup options
    width: 400,
    height: 220,
    html: "",
    css: "",
    fonts: [],
    delay: 5,
    showOnDelay: false,
    cookieExp: 30,
    showOncePerSession: false,
    onPopup: null,

    // Object for handling cookies, taken from QuirksMode
    // http://www.quirksmode.org/js/cookies.html
    cookieManager: {
        // Create a cookie
        create: function(name, value, days, sessionOnly) {
            var expires = "";

            if(sessionOnly)
                expires = "; expires=0"
            else if(days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            }

            document.cookie = name + "=" + value + expires + "; path=/";
        },

        // Get the value of a cookie
        get: function(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(";");

            for(var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == " ") c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }

            return null;
        },

        // Delete a cookie
        erase: function(name) {
            this.create(name, "", -1);
        }
    },

    // Handle the bioep_shown cookie
    // If present and true, return true
    // If not present or false, create and return false
    checkCookie: function() {
        // Handle cookie reset
        if(this.cookieExp <= 0) {
            // Handle showing pop up once per browser session.
            if(this.showOncePerSession && this.cookieManager.get("bioep_shown_session") == "true")
                return true;

            this.cookieManager.erase("bioep_shown");
            return false;
        }

        // If cookie is set to true
        if(this.cookieManager.get("bioep_shown") == "true")
            return true;

        return false;
    },

    // Add font stylesheets and CSS for the popup
    addCSS: function() {
        // Add font stylesheets
        for(var i = 0; i < this.fonts.length; i++) {
            var font = document.createElement("link");
            font.href = this.fonts[i];
            font.type = "text/css";
            font.rel = "stylesheet";
            document.head.appendChild(font);
        }

        // Base CSS styles for the popup
        var css = document.createTextNode(
            "#bio_ep_bg {display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; opacity: 0.3; z-index: 10001;}" +
            "#bio_ep {display: none; position: fixed; width: " + this.width + "px; height: " + this.height + "px; font-family: 'Titillium Web', sans-serif; font-size: 16px; left: 50%; top: 50%; transform: translateX(-50%) translateY(-50%); -webkit-transform: translateX(-50%) translateY(-50%); -ms-transform: translateX(-50%) translateY(-50%); background-color: #fff; box-shadow: 0px 1px 4px 0 rgba(0,0,0,0.5); z-index: 10002;}" +
            "#bio_ep_close {position: absolute; left: 100%; margin: -8px 0 0 -12px; width: 20px; height: 20px; color: #fff; font-size: 12px; font-weight: bold; text-align: center; border-radius: 50%; background-color: #5c5c5c; cursor: pointer;}" +
            this.css
        );

        // Create the style element
        var style = document.createElement("style");
        style.type = "text/css";
        style.appendChild(css);

        // Insert it before other existing style
        // elements so user CSS isn't overwritten
        document.head.insertBefore(style, document.getElementsByTagName("style")[0]);
    },

    // Add the popup to the page
    addPopup: function() {
        // Add the background div
        this.bgEl = document.createElement("div");
        this.bgEl.id = "bio_ep_bg";
        document.body.appendChild(this.bgEl);

        // Add the popup
        if(document.getElementById("bio_ep"))
            this.popupEl = document.getElementById("bio_ep");
        else {
            this.popupEl = document.createElement("div");
            this.popupEl.id = "bio_ep";
            this.popupEl.innerHTML = this.html;
            document.body.appendChild(this.popupEl);
        }

        // Add the close button
        if(document.getElementById("bio_ep_close"))
            this.closeBtnEl = document.getElementById("bio_ep_close");
        else {
            this.closeBtnEl = document.createElement("div");
            this.closeBtnEl.id = "bio_ep_close";
            this.closeBtnEl.appendChild(document.createTextNode("X"));
            this.popupEl.insertBefore(this.closeBtnEl, this.popupEl.firstChild);
        }
    },

    // Show the popup
    showPopup: function() {
        if(this.shown) return;

        //this.bgEl.style.display = "block";
        //this.popupEl.style.display = "block";

        // Handle scaling
        //this.scalePopup();

        // Save body overflow value and hide scrollbars
        //this.overflowDefault = document.body.style.overflow;
        //document.body.style.overflow = "hidden";

        this.shown = true;

        this.cookieManager.create("bioep_shown", "true", this.cookieExp, false);
        this.cookieManager.create("bioep_shown_session", "true", 0, true);

        if(typeof this.onPopup === "function") {
            this.onPopup();
        }
    },

    // Hide the popup
    hidePopup: function() {
        this.bgEl.style.display = "none";
        this.popupEl.style.display = "none";

        // Set body overflow back to default to show scrollbars
        document.body.style.overflow = this.overflowDefault;
    },

    // Handle scaling the popup
    scalePopup: function() {
        var margins = { width: 40, height: 40 };
        var popupSize = { width: bioEp.popupEl.offsetWidth, height: bioEp.popupEl.offsetHeight };
        var windowSize = { width: window.innerWidth, height: window.innerHeight };
        var newSize = { width: 0, height: 0 };
        var aspectRatio = popupSize.width / popupSize.height;

        // First go by width, if the popup is larger than the window, scale it
        if(popupSize.width > (windowSize.width - margins.width)) {
            newSize.width = windowSize.width - margins.width;
            newSize.height = newSize.width / aspectRatio;

            // If the height is still too big, scale again
            if(newSize.height > (windowSize.height - margins.height)) {
                newSize.height = windowSize.height - margins.height;
                newSize.width = newSize.height * aspectRatio;
            }
        }

        // If width is fine, check for height
        if(newSize.height === 0) {
            if(popupSize.height > (windowSize.height - margins.height)) {
                newSize.height = windowSize.height - margins.height;
                newSize.width = newSize.height * aspectRatio;
            }
        }

        // Set the scale amount
        var scaleTo = newSize.width / popupSize.width;

        // If the scale ratio is 0 or is going to enlarge (over 1) set it to 1
        if(scaleTo <= 0 || scaleTo > 1) scaleTo = 1;

        // Save current transform style
        if(this.transformDefault === "")
            this.transformDefault = window.getComputedStyle(this.popupEl, null).getPropertyValue("transform");

        // Apply the scale transformation
        this.popupEl.style.transform = this.transformDefault + " scale(" + scaleTo + ")";
    },

    // Event listener initialisation for all browsers
    addEvent: function (obj, event, callback) {
        if(obj.addEventListener)
            obj.addEventListener(event, callback, false);
        else if(obj.attachEvent)
            obj.attachEvent("on" + event, callback);
    },

    // Load event listeners for the popup
    loadEvents: function() {
        // Track mouseout event on document
        this.addEvent(document, "mouseout", function(e) {
            e = e ? e : window.event;

            // If this is an autocomplete element.
            if(e.target.tagName.toLowerCase() == "input")
                return;

            // Get the current viewport width.
            var vpWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

            // If the current mouse X position is within 50px of the right edge
            // of the viewport, return.
            if(e.clientX >= (vpWidth - 50))
                return;

            // If the current mouse Y position is not within 50px of the top
            // edge of the viewport, return.
            if(e.clientY >= 50)
                return;

            // Reliable, works on mouse exiting window and
            // user switching active program
            var from = e.relatedTarget || e.toElement;
            if(!from)
                bioEp.showPopup();
        }.bind(this));

        // Handle the popup close button
        this.addEvent(this.closeBtnEl, "click", function() {
            bioEp.hidePopup();
        });

        // Handle window resizing
        this.addEvent(window, "resize", function() {
            bioEp.scalePopup();
        });
    },

    // Set user defined options for the popup
    setOptions: function(opts) {
        this.width = (typeof opts.width === 'undefined') ? this.width : opts.width;
        this.height = (typeof opts.height === 'undefined') ? this.height : opts.height;
        this.html = (typeof opts.html === 'undefined') ? this.html : opts.html;
        this.css = (typeof opts.css === 'undefined') ? this.css : opts.css;
        this.fonts = (typeof opts.fonts === 'undefined') ? this.fonts : opts.fonts;
        this.delay = (typeof opts.delay === 'undefined') ? this.delay : opts.delay;
        this.showOnDelay = (typeof opts.showOnDelay === 'undefined') ? this.showOnDelay : opts.showOnDelay;
        this.cookieExp = (typeof opts.cookieExp === 'undefined') ? this.cookieExp : opts.cookieExp;
        this.showOncePerSession = (typeof opts.showOncePerSession === 'undefined') ? this.showOncePerSession : opts.showOncePerSession;
        this.onPopup = (typeof opts.onPopup === 'undefined') ? this.onPopup : opts.onPopup;
    },

    // Ensure the DOM has loaded
    domReady: function(callback) {
        (document.readyState === "interactive" || document.readyState === "complete") ? callback() : this.addEvent(document, "DOMContentLoaded", callback);
    },

    // Initialize
    init: function(opts) {
        // Handle options
        if(typeof opts !== 'undefined')
            this.setOptions(opts);

        // Add CSS here to make sure user HTML is hidden regardless of cookie
        this.addCSS();

        // Once the DOM has fully loaded
        this.domReady(function() {
            // Handle the cookie
            if(bioEp.checkCookie()) return;

            // Add the popup
            bioEp.addPopup();

            // Load events
            setTimeout(function() {
                bioEp.loadEvents();

                if(bioEp.showOnDelay)
                    bioEp.showPopup();
            }, bioEp.delay * 1000);
        });
    }
}


window.bioEp.init({
    // Options
    onPopup:function(){
        if( $("#modalDowloadV12.exit-intend.active"))
            $("#modalDowloadV12.exit-intend.active").modal();
    }
});