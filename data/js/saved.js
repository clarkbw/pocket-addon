/*
PKT_SAVED_OVERLAY is the view itself and contains all of the methods to manipute the overlay and messaging.
It does not contain any logic for saving or communication with the extension or server.
*/
// jscs:disable
var PKT_SAVED_OVERLAY = function (options)
{
    var myself = this;
    this.inited = false;
    this.active = false;
    this.wrapper = null;
    this.savedItemId = 0;
    this.savedUrl = '';
    this.premiumStatus = false;
    this.preventCloseTimerCancel = false;
    this.closeValid = true;
    this.mouseInside = false;
    this.autocloseTimer = null;
    this.dictJSON = {};
    // TODO: allow the timer to be editable?
    this.autocloseTiming = 3500;
    this.autocloseTimingFinalState = 1500;
    this.mouseInside = false;
    this.userTags = [];
    this.cxt_suggested_available = 0;
    this.cxt_entered = 0;
    this.cxt_suggested = 0;
    this.cxt_removed = 0;
    this.justaddedsuggested = false;
    this.fillTagContainer = function(tags,container,tagclass) {
        var newtagleft = 0;
        container.children().remove();
        for (var i = 0; i < tags.length; i++) {
            var newtag = $('<li><a href="#" class="token_tag ' + tagclass + '">' + tags[i] + '</a></li>');
            container.append(newtag);
            var templeft = newtag.position().left;
            if (templeft > newtagleft) {
                this.cxt_suggested_available++;
                newtagleft = templeft;
            }
            else {
                newtag.remove();
                break;
            }
        }
    };
    addon.port.on('getTags', function(resp) {
      if (typeof resp == 'object' && typeof resp.tags == 'object') {
        myself.userTags = resp.tags;
      }
    });
    this.fillUserTags = function() {
      addon.port.emit('getTags');

        console.log('start of logic for fillUserTags');
        // thePKT_SAVED.sendMessage("getTags",{},function(resp)
        // {
        //     console.log('got a big tag response',resp);
        //     if (typeof resp == 'object' && typeof resp.tags == 'object')
        //     {
        //         myself.userTags = resp.tags;
        //     }
        // });
    };
    addon.port.on('getSuggestedTags', function(resp) {
        $('.pkt_ext_suggestedtag_detail').removeClass('pkt_ext_suggestedtag_detail_loading');
        console.log('got suggested tags response',resp);
        if (resp.status == 'success')
        {
            var newtags = [];
            for (var i = 0; i < resp.value.suggestedTags.length; i++)
            {
                newtags.push(resp.value.suggestedTags[i].tag);
            }
            myself.suggestedTagsLoaded = true;
            if (!myself.mouseInside) {
                myself.startCloseTimer();
            }
            myself.fillTagContainer(newtags,$('.pkt_ext_suggestedtag_detail ul'),'token_suggestedtag');
        }
        else if (resp.status == 'error') {
            var msg = $('<p class="suggestedtag_msg">');
            msg.text(resp.error);
            $('.pkt_ext_suggestedtag_detail').append(msg);
            this.suggestedTagsLoaded = true;
            if (!myself.mouseInside) {
                myself.startCloseTimer();
            }
        }
    });
    this.fillSuggestedTags = function() {
        if (!$('.pkt_ext_suggestedtag_detail').length)
        {
            myself.suggestedTagsLoaded = true;
            myself.startCloseTimer();
            return;
        }
        console.log('calling suggested tags',myself.savedUrl);
        addon.port.emit('getSuggestedTags', { url: myself.savedUrl || window.location.toString() });

        // thePKT_SAVED.sendMessage("getSuggestedTags",
        // {
        //     url: myself.savedUrl || window.location.toString()
        // }, function(resp) {
        //     $('.pkt_ext_suggestedtag_detail').removeClass('pkt_ext_suggestedtag_detail_loading');
        //     console.log('got suggested tags response',resp);
        //     if (resp.status == 'success')
        //     {
        //         var newtags = [];
        //         for (var i = 0; i < resp.value.suggestedTags.length; i++)
        //         {
        //             newtags.push(resp.value.suggestedTags[i].tag);
        //         }
        //         myself.suggestedTagsLoaded = true;
        //         if (!myself.mouseInside) {
        //             myself.startCloseTimer();
        //         }
        //         myself.fillTagContainer(newtags,$('.pkt_ext_suggestedtag_detail ul'),'token_suggestedtag');
        //     }
        //     else if (resp.status == 'error') {
        //         var msg = $('<p class="suggestedtag_msg">');
        //         msg.text(resp.error);
        //         $('.pkt_ext_suggestedtag_detail').append(msg);
        //         this.suggestedTagsLoaded = true;
        //         if (!myself.mouseInside) {
        //             myself.startCloseTimer();
        //         }
        //     }
        // });
    }
    this.initAutoCloseEvents = function() {
        this.wrapper.on('mouseenter',function() {
            myself.mouseInside = true;
            myself.stopCloseTimer();
        });
        this.wrapper.on('mouseleave',function() {
            myself.mouseInside = false;
            myself.startCloseTimer();
        });
        this.wrapper.on('click',function(e) {
            myself.closeValid = false;
        });
    };
    this.startCloseTimer = function(manualtime)
    {
        var settime = manualtime ? manualtime : myself.autocloseTiming;
        if (typeof myself.autocloseTimer == 'number')
        {
            clearTimeout(myself.autocloseTimer);
        }
        myself.autocloseTimer = setTimeout(function()
        {
            if (myself.closeValid || myself.preventCloseTimerCancel)
            {
                myself.preventCloseTimerCancel = false;
                myself.closePopup();
            }
        }, settime);
    };
    this.stopCloseTimer = function()
    {
        if (myself.preventCloseTimerCancel)
        {
            return;
        }
        clearTimeout(myself.autocloseTimer);
    };
    this.closePopup = function() {
        myself.stopCloseTimer();
        addon.port.emit('close');
        // thePKT_SAVED.sendMessage("close");
    };
    this.checkValidTagSubmit = function() {
        var inputlength = $.trim($('.pkt_ext_tag_input_wrapper').find('.token-input-input-token').children('input').val()).length;
        if ($('.pkt_ext_containersaved').find('.token-input-token').length || (inputlength > 0 && inputlength < 26))
        {
            $('.pkt_ext_containersaved').find('.pkt_ext_btn').removeClass('pkt_ext_btn_disabled');
        }
        else
        {
            $('.pkt_ext_containersaved').find('.pkt_ext_btn').addClass('pkt_ext_btn_disabled');
        }
        myself.updateSlidingTagList();
    };
    this.updateSlidingTagList = function() {
        var inputleft = $('.token-input-input-token input').position().left;
        var listleft = $('.token-input-list').position().left;
        var listleftmanual = parseInt($('.token-input-list').css('left'));
        var listleftnatural = listleft - listleftmanual;
        var leftwidth = $('.pkt_ext_tag_input_wrapper').outerWidth();

        if ((inputleft + listleft + 20) > leftwidth)
        {
            $('.token-input-list').css('left',Math.min(((inputleft + listleftnatural - leftwidth + 20)*-1),0) + 'px');
        }
        else
        {
            $('.token-input-list').css('left','0');
        }
    };
    this.checkPlaceholderStatus = function() {
        if (this.wrapper.find('.pkt_ext_tag_input_wrapper').find('.token-input-token').length)
        {
            this.wrapper.find('.token-input-input-token input').attr('placeholder','');
        }
        else
        {
            this.wrapper.find('.token-input-input-token input').attr('placeholder',$('.pkt_ext_tag_input').attr('placeholder')).css('width','200px');
        }
    };
    this.initTagInput = function() {
        var inputwrapper = $('.pkt_ext_tag_input_wrapper');
        inputwrapper.find('.pkt_ext_tag_input').tokenInput([], {
            searchDelay: 200,
            minChars: 1,
            animateDropdown: false,
            noResultsHideDropdown: true,
            scrollKeyboard: true,
            emptyInputLength: 200,
            search_function: function(term, cb) {
                var returnlist = [];
                if (term.length) {
                    var limit = 15;
                    var r = new RegExp('^' + term);
                    for (var i = 0; i < myself.userTags.length; i++) {
                        if (r.test(myself.userTags[i]) && limit > 0) {
                            returnlist.push({name:myself.userTags[i]});
                            limit--;
                        }
                    }
                }
                else {
                    returnlist.push({name:'blah'});
                }
                if (!$('.token-input-dropdown-tag').data('init')) {
                    $('.token-input-dropdown-tag').css('width',inputwrapper.outerWidth()).data('init');
                    inputwrapper.append($('.token-input-dropdown-tag'));
                }
                cb(returnlist);
            },
            textToData: function(text) {
                if($.trim(text).length > 25 || !$.trim(text).length) {
                    if (text.length > 25) {
                        $('.pkt_ext_edit_msg').addClass('pkt_ext_edit_msg_error pkt_ext_edit_msg_active').text(myself.dictJSON.invalidTags);
                        changestamp = Date.now();
                        setTimeout(function() {
                            $('.token-input-input-token input').val(text).focus();
                        },10);
                    }
                    return null;
                }
                else {
                    $('.pkt_ext_edit_msg').removeClass('pkt_ext_edit_msg_error pkt_ext_edit_msg_active').text('');
                    return {name:myself.sanitizeText(text.toLowerCase())};
                }
            },
            onReady: function() {
                console.log('got to autoinput ready');
                $('.token-input-dropdown').addClass('token-input-dropdown-tag');
                inputwrapper.find('.token-input-input-token input').attr('placeholder',$('.tag-input').attr('placeholder')).css('width','200px');
                if ($('.pkt_ext_suggestedtag_detail').length) {
                    myself.wrapper.find('.pkt_ext_suggestedtag_detail').on('click','.token_tag',function(e) {
                        e.preventDefault();
                        var tag = $(e.target);
                        if ($(this).parents('.pkt_ext_suggestedtag_detail_disabled').length) {
                            return;
                        }
                        myself.justaddedsuggested = true;
                        inputwrapper.find('.pkt_ext_tag_input').tokenInput('add',{id:inputwrapper.find('.token-input-token').length,name:tag.text()});
                        tag.addClass('token-suggestedtag-inactive');
                        $('.token-input-input-token input').focus();
                    });
                }
                $('.token-input-list').on('keydown','input',function(e) {
                    if (e.which == 37) {
                        myself.updateSlidingTagList();
                    }
                }).on('keypress','input',function(e) {
                    if (e.which == 13) {
                        if (Date.now() - changestamp > 250) {
                            e.preventDefault();
                            myself.wrapper.find('.pkt_ext_btn').trigger('click');
                        }
                    }
                }).on('keyup','input',function(e) {
                    myself.checkValidTagSubmit();
                });
                myself.checkPlaceholderStatus();
            },
            onAdd: function() {
                myself.checkValidTagSubmit();
                changestamp = Date.now();
                myself.hideInactiveTags();
                myself.checkPlaceholderStatus();
            },
            onDelete: function() {
                myself.checkValidTagSubmit();
                changestamp = Date.now();
                myself.showActiveTags();
                myself.checkPlaceholderStatus();
            }
        });
        $('body').on('keydown',function(e) {
            var key = e.keyCode || e.which;
            if (key == 8) {
                var selected = $('.token-input-selected-token');
                if (selected.length) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    inputwrapper.find('.pkt_ext_tag_input').tokenInput('remove',{name:selected.find('p').text()});
                }
            }
            else {
                if ($(e.target).parent().hasClass('token-input-input-token')) {
                    e.stopImmediatePropagation();
                }
            }
        });
    };
    this.disableInput = function() {
        this.wrapper.find('.pkt_ext_item_actions').addClass('pkt_ext_item_actions_disabled');
        this.wrapper.find('.pkt_ext_btn').addClass('pkt_ext_btn_disabled');
        this.wrapper.find('.pkt_ext_tag_input_wrapper').addClass('pkt_ext_tag_input_wrapper_disabled');
        if (this.wrapper.find('.pkt_ext_suggestedtag_detail').length) {
            this.wrapper.find('.pkt_ext_suggestedtag_detail').addClass('pkt_ext_suggestedtag_detail_disabled');
        }
    };
    this.enableInput = function() {
        this.wrapper.find('.pkt_ext_item_actions').removeClass('pkt_ext_item_actions_disabled');
        this.checkValidTagSubmit();
        this.wrapper.find('.pkt_ext_tag_input_wrapper').removeClass('pkt_ext_tag_input_wrapper_disabled');
        if (this.wrapper.find('.pkt_ext_suggestedtag_detail').length) {
            this.wrapper.find('.pkt_ext_suggestedtag_detail').removeClass('pkt_ext_suggestedtag_detail_disabled');
        }
    };
    addon.port.on('addTags', function(resp)
    {
        console.log('got a response',resp);
        if (resp.status == 'success')
        {
            myself.showStateFinalMsg(myself.dictJSON.tagssaved);
        }
        else if (resp.status == 'error')
        {
            $('.pkt_ext_edit_msg').addClass('pkt_ext_edit_msg_error pkt_ext_edit_msg_active').text(resp.error);
        }
    });

    this.initAddTagInput = function() {
        $('.pkt_ext_btn').click(function(e) {
            e.preventDefault();
            if ($(this).hasClass('pkt_ext_btn_disabled') || $('.pkt_ext_edit_msg_active').filter('.pkt_ext_edit_msg_error').length)
            {
                return;
            }
            myself.disableInput();
            $('.pkt_ext_containersaved').find('.pkt_ext_detail h2').text(myself.dictJSON.processingtags);
            var originaltags = [];
            $('.token-input-token').each(function()
            {
                var text = $.trim($(this).find('p').text());
                if (text.length)
                {
                    originaltags.push(text);
                }
            });
            console.log('submitting addtags message');
            addon.port.emit('addTags', {
              url: myself.savedUrl || window.location.toString(),
              tags: originaltags
            });
            // thePKT_SAVED.sendMessage("addTags",
            // {
            //     url: myself.savedUrl || window.location.toString(),
            //     tags: originaltags
            // }, function(resp)
            // {
            //     console.log('got a response',resp);
            //     if (resp.status == 'success')
            //     {
            //         myself.showStateFinalMsg(myself.dictJSON.tagssaved);
            //     }
            //     else if (resp.status == 'error')
            //     {
            //         $('.pkt_ext_edit_msg').addClass('pkt_ext_edit_msg_error pkt_ext_edit_msg_active').text(resp.error);
            //     }
            // });
        });
    };
    this.initRemovePageInput = function() {
        $('.pkt_ext_removeitem').click(function(e) {
            if ($(this).parents('.pkt_ext_item_actions_disabled').length) {
                e.preventDefault();
                return;
            }
            if ($(this).hasClass('pkt_ext_removeitem')) {
                e.preventDefault();
                myself.disableInput();
                $('.pkt_ext_containersaved').find('.pkt_ext_detail h2').text(myself.dictJSON.processingremove);
                console.log('processing page removal',myself.savedItemId);
                thePKT_SAVED.sendMessage("deleteItem",
                {
                    itemId: myself.savedItemId
                },function(resp) {
                    console.log('got a removal message',resp);
                    if (resp.status == 'success') {
                        myself.showStateFinalMsg(myself.dictJSON.pageremoved);
                    }
                    else if (resp.status == 'error') {
                        $('.pkt_ext_edit_msg').addClass('pkt_ext_edit_msg_error pkt_ext_edit_msg_active').text(resp.error);
                    }
                });
            }
        });
    };
    this.initOpenListInput = function() {
        $('.pkt_ext_openpocket').click(function(e)
        {
            e.preventDefault();
            console.log('sending new tab messsage',$(this).attr('href'));
            addon.port.emit('openTabWithUrl', $(this).attr('href'));
            // thePKT_SAVED.sendMessage("openTabWithUrl",
            // {
            //     url: $(this).attr('href'),
            //     activate: true
            // });
            // myself.closePopup();
        });
    };
    this.showActiveTags = function() {
        if (!$('.pkt_ext_suggestedtag_detail').length) {
            return;
        }
        var activetokenstext = '|';
        $('.token-input-token').each(function(index, element) {
            activetokenstext += $(element).find('p').text() + '|';
        });

        var inactivetags = $('.pkt_ext_suggestedtag_detail').find('.token_tag_inactive');
        inactivetags.each(function(index,element) {
            if (activetokenstext.indexOf('|' + $(element).text() + '|') == -1) {
                $(element).removeClass('token_tag_inactive');
            }
        });
    };
    this.hideInactiveTags = function() {
        if (!$('.pkt_ext_suggestedtag_detail').length) {
            return;
        }
        var activetokenstext = '|';
        $('.token-input-token').each(function(index, element) {
            activetokenstext += $(element).find('p').text() + '|';
        });
        var activesuggestedtags = $('.token_tag').not('.token_tag_inactive');
        activesuggestedtags.each(function(index,element) {
            if (activetokenstext.indexOf('|' + $(element).text() + '|') > -1) {
                $(element).addClass('token_tag_inactive');
            }
        });
    };
    this.showStateSaved = function(initobj) {
        console.log('start of saved state',initobj);
        this.wrapper.find('.pkt_ext_detail h2').text(this.dictJSON.pagesaved);
        this.wrapper.find('.pkt_ext_btn').addClass('pkt_ext_btn_disabled');
        if (typeof initobj.item == 'object')
        {
            this.savedItemId = initobj.item.item_id;
            this.savedUrl = initobj.item.resolved_url;
        }
        $('.pkt_ext_containersaved').addClass('pkt_ext_container_detailactive').removeClass('pkt_ext_container_finalstate');

        myself.fillUserTags();
        if (myself.suggestedTagsLoaded) {
            myself.startCloseTimer();
        }
        else {
            myself.fillSuggestedTags();
        }
    };
    this.sanitizeText = function(s) {
        var sanitizeMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;'
        };
        if (typeof s !== 'string')
        {
            return '';
        }
        else
        {
            return String(s).replace(/[&<>"']/g, function (str) {
                return sanitizeMap[str];
            });
        }
    };
    this.showStateFinalMsg = function(msg) {
        this.wrapper.find('.pkt_ext_tag_detail').one('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd',function(e)
        {
            $(this).off('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd');
            myself.preventCloseTimerCancel = true;
            myself.startCloseTimer(myself.autocloseTimingFinalState);
        });
        this.wrapper.addClass('pkt_ext_container_finalstate');
        this.wrapper.find('.pkt_ext_detail h2').text(msg);
    };
    this.getTranslations = function()
    {
        var language = window.navigator.language.toLowerCase();
        this.dictJSON = {};

        var dictsuffix = 'en-US';

        if (language.indexOf('en') == 0)
        {
            dictsuffix = 'en';
        }
        else if (language.indexOf('it') == 0)
        {
            dictsuffix = 'it';
        }
        else if (language.indexOf('fr-ca') == 0)
        {
            dictsuffix = 'fr';
        }
        else if (language.indexOf('fr') == 0)
        {
            dictsuffix = 'fr';
        }
        else if (language.indexOf('de') == 0)
        {
            dictsuffix = 'de';
        }
        else if (language.indexOf('es-es') == 0)
        {
            dictsuffix = 'es';
        }
        else if (language.indexOf('es-419') == 0)
        {
            dictsuffix = 'es_419';
        }
        else if (language.indexOf('es') == 0)
        {
            dictsuffix = 'es';
        }
        else if (language.indexOf('ja') == 0)
        {
            dictsuffix = 'ja';
        }
        else if (language.indexOf('nl') == 0)
        {
            dictsuffix = 'nl';
        }
        else if (language.indexOf('pt-pt') == 0)
        {
            dictsuffix = 'pt_PT';
        }
        else if (language.indexOf('pt') == 0)
        {
            dictsuffix = 'pt_BR';
        }
        else if (language.indexOf('ru') == 0)
        {
            dictsuffix = 'ru';
        }
        else if (language.indexOf('zh-tw') == 0)
        {
            dictsuffix = 'zh_TW';
        }
        else if (language.indexOf('zh') == 0)
        {
            dictsuffix = 'zh_CN';
        }
        else if (language.indexOf('ko') == 0)
        {
            dictsuffix = 'ko';
        }
        else if (language.indexOf('pl') == 0)
        {
            dictsuffix = 'pl';
        }

        // TODO: when we add all dictionaries, modify this, but for now hard code to English
        dictsuffix = 'en';

        this.dictJSON = Translations[dictsuffix];

    };
};

PKT_SAVED_OVERLAY.prototype = {
    create : function()
    {
        console.log('creating overlay',this.active);
        if (this.active)
        {
            return;
        }
        this.active = true;

        // set translations
        this.getTranslations();

        // Create actual content
        $('body').append(Handlebars.templates.saved_shell(this.dictJSON));

        // Add in premium content (if applicable based on premium status)
        this.createPremiumFunctionality();

        // Initialize functionality for overlay
        this.wrapper = $('.pkt_ext_containersaved');
        this.initTagInput();
        this.initAddTagInput();
        this.initRemovePageInput();
        this.initOpenListInput();
        this.initAutoCloseEvents();
    },
    createPremiumFunctionality: function()
    {
        if (this.premiumStatus && !$('.pkt_ext_suggestedtag_detail').length)
        {
            console.log('make premium');
            $('body').append(Handlebars.templates.saved_premiumshell(this.dictJSON));
        }
    }
};


// Layer between Bookmarklet and Extensions
var PKT_SAVED = function () {};

PKT_SAVED.prototype = {
    init: function () {
        if (this.inited) {
            return;
        }
        this.overlay = new PKT_SAVED_OVERLAY();

        this.inited = true;
    },

    addMessageListener: function(messageId, callback) {
      self.port.on(messageId, callback);
        // Messaging.addMessageListener(messageId, callback);
    },

    sendMessage: function(messageId, payload, callback) {
      self.port.emit(messageId, payload);
        // Messaging.sendMessage(messageId, payload, callback);
    },

    create: function() {
        var myself = this;
        var url = window.location.href.split('premiumStatus=');
        if (url.length > 1)
        {
            myself.overlay.premiumStatus = (url[1] == '1');
        }
        myself.overlay.create();

        // tell back end we're ready
        // thePKT_SAVED.sendMessage("show");

        // wait confirmation of save before flipping to final saved state
        addon.port.on('saved', function(resp) {
            console.log('sweet, switch to full mode because of registered hit',resp);
            myself.overlay.showStateSaved(resp);
        });
        // thePKT_SAVED.addMessageListener("saveLink", function(resp)
        // {
        //     console.log('sweet, switch to full mode because of registered hit',resp);
        //     myself.overlay.showStateSaved(resp);
        // });

    }
}

$(function()
{
    if(!window.thePKT_SAVED){
        var thePKT_SAVED = new PKT_SAVED();
        window.thePKT_SAVED = thePKT_SAVED;
        thePKT_SAVED.init();
    }

    window.thePKT_SAVED.create();
});
