
jQuery(document).ready(function() {
    /* Mega Menu */
    $('#menu ul > li > a + div').each(function() {
        var menu = $('#menu').offset();
        var dropdown = $(this).parent().offset();

        var i = (dropdown.left + $(this).outerWidth()) - (menu.left + $('#menu').outerWidth());

        if (i > 0) {
            $(this).css('margin-left', '-' + (i + 5) + 'px');
        }
    });
    
    $("body").on('click', '#search-header', function(e) {
        $(".header-search-box").toggle();
        e.preventDefault();
    });
    $("body").on('click', '#notification-header', function(e) {
        $(".notification-menu").toggle();
        e.preventDefault();

    });
    $('body').on('click', '#muserlogout', function(e) {
        $("#minicart-menu").toggle();
        e.preventDefault();
    });
    $(document).click(function(event) {
        if (!($(event.target).parent().hasClass("menu-notification") || $(event.target).parent().hasClass("fa fa-bell"))) {
            if (!($(event.target).parent().hasClass("morebutton") || $(event.target).parent().parent().hasClass("notification-ago") || $(event.target).parent().hasClass("notification-ago"))) {
                $(".notification-menu").hide();
            }
        }
        $("#minicart-menu").hide();
    });
    $('body').on('click', '.mobile-search-menu', function(e) {
        $(".header-search-box").toggle();
        e.preventDefault();
    });
    $("body").on('click', '#userlogout', function(e) {
        $(".notification-menu").hide();
        $("#minicart-menu").toggle();
        e.preventDefault();
    });
    $(window).bind('scroll', function() {
        if ($(window).scrollTop() > 82) {
            $('.nav-container').addClass('fixednavbar');
            $('.header-search-box').addClass('hsbScroll');

        } else {
            $('.nav-container').removeClass('fixednavbar');
            $('.header-search-box').removeClass('hsbScroll');

        }
    });
    $(window).bind('scroll', function() {
        if ($(window).scrollTop() > 120) {
            $('.leftnavSearch').addClass('Searchscroll');
        } else {
            $('.leftnavSearch').removeClass('Searchscroll');
        }
    });

    jQuery("#back-to-top-link").hide();
    jQuery(function() {
        jQuery(window).scroll(function() {
            if (jQuery(this).scrollTop() > 100) {
                jQuery('#back-to-top-link').fadeIn();
            } else {
                jQuery('#back-to-top-link').fadeOut();
            }
        });
        jQuery('#back-to-top-link').click(function() {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            return false;
        });
    });
    $('body').on('mouseenter', '.product-image img', function() {
        $(this).parent().parent().find('.sale-label').hide();
    }).on('mouseout', function() {
        $(this).parent().parent().find('.sale-label').show();
    });
});
if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        value: function(predicate) {
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            var len = o.length >>> 0;
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var thisArg = arguments[1];
            var k = 0;
            while (k < len) {
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return kValue;
                }
                k++;
            }
            return undefined;
        }
    });
}
var isEmpty = function(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}