/*
  This is free and unencumbered software released into the public domain.
  -- 2014, Liudmil Mitev

  Git repo: https://github.com/liudmil-mitev/jquery.fn.more.js
*/

(function($) {

SCROLL_CONTAINER     = "<div class='jquery-fn-more container'></div>";
SCROLL_UP_TEMPLATE   = "<div class='jquery-fn-more scroll up'></div>";
SCROLL_DOWN_TEMPLATE = "<div class='jquery-fn-more scroll down'></div>";

// Measure the height of an off-dom element
var measureOuterHeight = function(element) {
    element = $(element).clone(false);
    element.css("display", "absolute")
           .css("visibility", "hidden")
           .appendTo(document.body);

    result = element.outerHeight(true);
    element.remove();
    return result;
};

var measureScrollSize = function(node) {
  var scrollTop = 0, scrollHeight = 0;
  if(node.is($('html, body'))) {
    node.each(function() {
      if($(this).scrollTop() > scrollTop) {
        scrollTop = $(this).scrollTop();
      }
        scrollHeight = $(this)[0].scrollHeight;
    });
  } else {
    scrollTop = node.scrollTop();
    scrollHeight = node[0].scrollHeight;
  }
  return { scrollTop: scrollTop, scrollHeight: scrollHeight };
};

var isTopScrollvisible = function(node, treshold) {
    // NOTE: when dealing with $('html, body'), consider the biggest scrollTop
    // http://stackoverflow.com/questions/8149155/animate-scrolltop-not-working-in-firefox
    var scrollTop = 0;
    node.each(function() {
      if($(this).scrollTop() > scrollTop) scrollTop = $(this).scrollTop();
    });
    return scrollTop >= treshold;
};

var isBotScrollvisible = function(node, treshold) {
    var height = 0;
    var size = measureScrollSize(node);

    if(node.is($('html, body')))
      height = $(window).height();
    else
      height = $(node).height();

    return treshold < size.scrollHeight - size.scrollTop - height;
};

$.fn.more = function(options) {
  options = options || {};
  var up = $(SCROLL_UP_TEMPLATE),
      down = $(SCROLL_DOWN_TEMPLATE),
      container = $(SCROLL_CONTAINER),
      parent = $(this),
      body = $(document.body),
      scrollAmount = options.scrollAmount || Math.round(0.33 * parent.height()),
      up_treshold = options.upTreshold || 0.2 * parent.height(),
      down_treshold = options.downTreshold || 0,
      smoothScroll = options.smoothScroll || false;


  var handle_body = function() {
    // NOTE: A different implementation is needed for <body>
    up.css("position", "fixed").css("top", 0);
    down.css("position", "fixed").css("bottom", 0);
    var scrollable = $('body, html');

    up.on("click touchstart", function() {
      var scrollTop = measureScrollSize(scrollable).scrollTop - scrollAmount;
      if(smoothScroll) scrollable.animate({scrollTop: scrollTop}, 1000);
      else scrollable.scrollTop(scrollTop);
    });

    down.on("click touchstart", function() {
      var scrollTop = measureScrollSize(scrollable).scrollTop + scrollAmount;
      if(smoothScroll) scrollable.animate({scrollTop: scrollTop}, 1000);
      else scrollable.scrollTop(scrollTop);
    });

    if(!isTopScrollvisible(scrollable, up_treshold)) up.hide();
    if(!isBotScrollvisible(scrollable, down_treshold)) down.hide();
    body.append(up);
    body.append(down);

    var scrolling = false;
    var timeout = false;
    var adjustContainer = function() {
        scrolling = false;
        if(!isTopScrollvisible(scrollable, up_treshold)) up.hide();
        else up.show();
        if(!isBotScrollvisible(scrollable, down_treshold)) down.hide();
        else down.show();
        up.removeClass('hidden');
        down.removeClass('hidden');
    };

    $(window).on('touchmove', function() {
        // XXX: iOS doesn't fire scroll until the scroll has ended
        scrolling = true;
        timeout = setTimeout(adjustContainer, 500);
        up.addClass('hidden');
        down.addClass('hidden');
    });

    $(window).scroll(function() {
      if(!scrolling) {
        scrolling = true;
        timeout = setTimeout(adjustContainer, 500);
        up.addClass('hidden');
        down.addClass('hidden');
      } else {
        // Do nothing if user is still scrolling
        clearTimeout(timeout);
        timeout = setTimeout(adjustContainer, 500);
      }
    });
  };

  this.each(function() {
    // NOTE: A different implementation is needed for <body>
    if($(this)[0] == document.body) return handle_body();

    container.css("position", "relative")
             .css("width", "auto")
             .css("height", 0)
             .css("overflow", "visible");
              
    up.css("position", "absolute").css("top", 0);

    down_offset = parent.outerHeight() + parent.scrollTop() - measureOuterHeight(down);
    down.css("position", "absolute").css("top", down_offset);
    if(!isTopScrollvisible(parent, up_treshold)) up.hide();
    if(!isBotScrollvisible(parent, down_treshold)) down.hide();

    container.append(up);
    container.append(down);

    up.on("click touchstart", function() {
      var scrollTop = parent.scrollTop() - scrollAmount;
      if(smoothScroll) scrollable.animate({scrollTop: scrollTop}, 1000);
      else scrollable.scrollTop(scrollTop);
    });

    down.on("click touchstart", function() {
      var scrollTop = parent.scrollTop() + scrollAmount;
      if(smoothScroll) parent.animate({scrollTop: scrollTop}, 1000);
      else parent.scrollTop(scrollTop);
    });

    var scrolling = false;
    var timeout = false;
    var adjustContainer = function() {
        scrolling = false;
        up.css("top", parent.scrollTop());
        down_offset = parent.outerHeight() + parent.scrollTop() - down.outerHeight(true);
        down.css("top", down_offset);
        container.css("visibility", "visible");
        container.removeClass("hidden");

        if(!isTopScrollvisible(parent, up_treshold)) up.hide();
        else up.show();
        if(!isBotScrollvisible(parent, down_treshold)) down.hide();
        else down.show();
    };

    parent.scroll(function() {
      if(!scrolling) {
        scrolling = true;
        timeout = setTimeout(adjustContainer, 500);
        container.css("visibility", "hidden");
        container.addClass("hidden");
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(adjustContainer, 500);
      }
    });

    $(this).prepend(container);
  });
};

})(jQuery);
