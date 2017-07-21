(function($, window, document) {
  var Carousel = {
    init: function(opt, el) {
      this.actualIndex = 0;
      this.$elem = $(el);
      this.$wrapp = this.$elem.find('.wrapper');
      this.$items = this.$wrapp.find('.item');
      this.$next = this.$elem.find('.next');
      this.$prew = this.$elem.find('.prew');
      this.timer = null;
      this.opts = $.extend({}, this.default, this.$elem.data(), opt);

      this.userOpts = opt;
      this.start();
      this.setEvents();
    },
    setEvents: function() {
      var self = this;
      $(window).on('resize', function() {
        self.setWrapperWidth();
        self.step(0);
      });

      if (this.opts.arrows) {
        this.$next.on('click', function() {
          self.next();
        });

        this.$prew.on('click', function() {
          self.prew();
        });
      } else {
        this.$next.hide();
        this.$prew.hide();
      }

      if (this.opts.swipe) {
        this.$elem.on('swipeleft', function() {
          self.next();
        });

        this.$elem.on('swiperight', function() {
          self.prew();
        });
      }

      if (this.opts.autoplay) {
        this.autoplay().start();

        if (this.opts.autoplayStopOnHover) {
          this.$elem.on('mouseenter', function() {
            self.autoplay().stop();
          });

          this.$elem.on('mouseleave', function() {
            self.autoplay().start();
          })
        }
      }

      if (this.opts.keyboardArrows) {
        this.$elem.on('mouseenter', function() {
          $(document, this.$elem).on('keyup', function(ev) {
            self.handleKeypress(ev, self)
          });
        });

        this.$elem.on('mouseleave', function() {
          $(document, this.$elem).off('keyup');
        })
      }
    },
    start: function() {
      this.setWrapperWidth();
      if (this.opts.bullets) {
        this.generateBullets();
      }
    },
    setWrapperWidth: function() {
      this.hide();
      this.$items.width(this.$elem.outerWidth());

      var width = 0;
      this.$items.map(function(id, element) {
        width += $(element).outerWidth();
      });

      this.$wrapp.width(width);

      this.show();
    },
    show: function() {
      this.$elem.show();
    },
    hide: function() {
      this.$elem.hide();
    },
    next: function() {
      this.step(1);
    },
    prew: function() {
      this.step(-1);
    },
    goTo: function(itemIndex) {
      this.actualIndex = -itemIndex;
      this.step(0);
    },
    step: function(dir) {
      var nextIndex = (this.actualIndex - dir) % this.$items.length;
      nextIndex = nextIndex > 0 ? nextIndex - this.$items.length : nextIndex;
      var pixels = nextIndex * this.$elem.width();

      this.$wrapp.css({
        "transform": "translate3d(" + pixels + "px, 0px,0px)"
      });

      this.actualIndex = nextIndex;

      this.changeBulett();
    },
    changeBulett: function() {
      if (this.opts.bullets) {
        this.$buletts.find('li').removeClass('active');
        this.$buletts.find('li:nth-child(' + (this.actualIndex * -1 + 1) + ')').addClass('active');
      }
    },
    autoplay: function() {
      var self = this;
      return {
        start: function() {
          if (self.timer == null) {
            self.timer = setInterval(function() {
              self.next(1);
            }, self.opts.autoplayTime);
          }
        },
        stop: function() {
          clearInterval(self.timer);
          self.timer = null;
        }
      }
    },
    generateBullets: function() {
      var self = this;
      var buletts = $('<ul class="buletts">').html(function() {
        var array = Array.apply(null, Array(self.$items.length)).map(function(val, ind) {
          var element = $('<li>');
          element.on('click', function() {
            self.goTo(ind);
          });
          return element
        })
        return array;
      });
      this.$elem.find('.control').append(buletts);
      this.$buletts = buletts;
      this.step(0);
    },
    handleKeypress: function(ev, self) {
      switch (ev.keyCode) {
        case 39:
          self.next();
          break;
        case 37:
          self.prew();
          break;
      }
    },
    default: {
      swipe: true,
      arrows: true,
      autoplay: true,
      autoplayTime: 4000,
      autoplayStopOnHover: true,
      bullets: true,
      keyboardArrows: true,
    }
  };

  $.fn.carousel = function(options, xtraParam) {
    return this.each(function() {
      if ($(this).data('carosuel-init') === true) {
        var callables = [
          'next',
          'prew',
          'goTo'
        ];
        if (typeof(options) === 'string' && callables.indexOf(options) !== -1) {
          var carouselInst = $(this).data('carousel');
          carouselInst[options](xtraParam);
        }
        return false;
      }
      $(this).data('carosuel-init', true);
      var carousel = Object.create(Carousel);
      carousel.init(options, this);
      $.data(this, 'carousel', carousel);
    });
  };

})(jQuery, window, document);

/* INIT - ez indítja el az egészet */
$(document).ready(function() {
  $('.carousel').carousel();
});

(function($) {

  $.detectSwipe = {
    version: '2.1.1',
    enabled: 'ontouchstart' in document.documentElement,
    preventDefault: true,
    threshold: 20
  };

  var startX,
    startY,
    isMoving = false;

  function onTouchEnd() {
    this.removeEventListener('touchmove', onTouchMove);
    this.removeEventListener('touchend', onTouchEnd);
    isMoving = false;
  }

  function onTouchMove(e) {
    if ($.detectSwipe.preventDefault) {
      e.preventDefault();
    }
    if (isMoving) {
      var x = e.touches[0].pageX;
      var y = e.touches[0].pageY;
      var dx = startX - x;
      var dy = startY - y;
      var dir;
      if (Math.abs(dx) >= $.detectSwipe.threshold) {
        dir = dx > 0 ? 'left' : 'right'
      } else if (Math.abs(dy) >= $.detectSwipe.threshold) {
        dir = dy > 0 ? 'down' : 'up'
      }
      if (dir) {
        onTouchEnd.call(this);
        $(this).trigger('swipe', dir).trigger('swipe' + dir);
      }
    }
  }

  function onTouchStart(e) {
    if (e.touches.length == 1) {
      startX = e.touches[0].pageX;
      startY = e.touches[0].pageY;
      isMoving = true;
      this.addEventListener('touchmove', onTouchMove, false);
      this.addEventListener('touchend', onTouchEnd, false);
    }
  }

  function setup() {
    this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
  }

  function teardown() {
    this.removeEventListener('touchstart', onTouchStart);
  }

  $.event.special.swipe = {
    setup: setup
  };

  $.each(['left', 'up', 'down', 'right'], function() {
    $.event.special['swipe' + this] = {
      setup: function() {
        $(this).on('swipe', $.noop);
      }
    };
  });
})(jQuery);