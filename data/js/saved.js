'use strict';
/*jshint browser:true */
/*globals $,addon */

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
                // addon.port.emit'deleteItem', itemId: myself.savedItemId);
                thePKT_SAVED.sendMessage('deleteItem', myself.savedItemId,
                function(resp) {
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

        // Initialize functionality for overlay
        this.wrapper = $('.pkt_ext_containersaved');
        this.initTagInput();
        this.initAddTagInput();
        this.initRemovePageInput();
        this.initOpenListInput();
        this.initAutoCloseEvents();
    }
};

function Pocket() {
  // save options locally here
  addon.port.on('options', function(options) {
    console.log('options', options);
    this.options = options;
    this.premiumStatus = options.premiumStatus || false;
  }.bind(this));
  addon.port.on('getTags', this.handleGetTags);

}

// anything that needs the DOM should wire up here
Pocket.prototype.init = function() {
  addon.port.on('saved', this.handleSaved);
  addon.port.on('addTags', this.handleAddTags);
  addon.port.on('getSuggestedTags', this.handleSuggestedTags);
  this.initPremiumStatus();
  this.initTimer();
};

Pocket.prototype.initPremiumStatus = function() {
  if (this.premiumStatus) {
    $('.pkt_ext_suggestedtag_detail').show();
  }
};

Pocket.prototype.initTimer = function() {
  this.autocloseTiming = 3500;
  this.timer = null;
  var wrapper = $('.pkt_ext_containersaved');
  wrapper.on('mouseenter', function() {
      this.mouseInside = true;
      this.stopCloseTimer();
  }.bind(this));
  wrapper.on('mouseleave', function() {
    this.mouseInside = false;
    this.startCloseTimer();
  });
  wrapper.on('click', function() {
    this.closeValid = false;
  });
};

function clearTimer(timer) {
  clearTimeout(timer);
  timer = null;
}

Pocket.prototype.startTimer = function() {
  if (this.timer) {
    clearTimer(this.timer);
  }
  this.timer = setTimeout(function() {
    if (this.closeValid || this.preventCloseTimerCancel) {
      this.preventCloseTimerCancel = false;
      this.close();
    }
  }.bind(this), this.autocloseTiming);
};

Pocket.prototype.stopTimer = function() {
  if (this.preventCloseTimerCancel) {
    return;
  }
  clearTimer(this.timer);
};

Pocket.prototype.getTags = function() {
  addon.port.emit('getTags');
};

Pocket.prototype.handleGetTabs = function(resp) {
  if (typeof resp == 'object' && typeof resp.tags == 'object') {
    this.userTags = resp.tags;
  }
};

Pocket.prototype.close = function() {
  addon.port.emit('close');
};

Pocket.prototype.getSuggestedTags = function() {
  if (!$('.pkt_ext_suggestedtag_detail').length) {
    this.suggestedTagsLoaded = true;
    this.startCloseTimer();
    return;
  }
  console.log('calling suggested tags', this.savedUrl);
  addon.port.emit('getSuggestedTags', { url: this.savedUrl || window.location.toString() });
};

Pocket.prototype.handleSuggestedTags = function(resp) {
  $('.pkt_ext_suggestedtag_detail').removeClass('pkt_ext_suggestedtag_detail_loading');
  console.log('got suggested tags response',resp);
  if (resp.status == 'success')
  {
    var newtags = [];
    for (var i = 0; i < resp.value.suggestedTags.length; i++)
    {
      newtags.push(resp.value.suggestedTags[i].tag);
    }
    this.suggestedTagsLoaded = true;
    if (!this.mouseInside) {
      this.startCloseTimer();
    }
    this.fillTagContainer(newtags,$('.pkt_ext_suggestedtag_detail ul'),'token_suggestedtag');
  }
  else if (resp.status == 'error') {
    var msg = $('<p class="suggestedtag_msg">');
    msg.text(resp.error);
    $('.pkt_ext_suggestedtag_detail').append(msg);
    this.suggestedTagsLoaded = true;
    if (!this.mouseInside) {
      this.startCloseTimer();
    }
  }
};

Pocket.prototype.showStateFinalMsg = function(msg) {
  var wrapper = $('.pkt_ext_containersaved');
  wrapper.find('.pkt_ext_tag_detail').once('transitionend',
  function(e) {
    this.preventCloseTimerCancel = true;
    this.startCloseTimer(this.autocloseTimingFinalState);
  }.bind(this));
  wrapper.addClass('pkt_ext_container_finalstate');
  wrapper.find('.pkt_ext_detail h2').text(msg);
};

Pocket.prototype.handleAddTags = function(resp) {
  console.log('got a response',resp);
  if (resp.status == 'success') {
    this.showStateFinalMsg(this.dictJSON.tagssaved);
  } else if (resp.status == 'error') {
    $('.pkt_ext_edit_msg').addClass('pkt_ext_edit_msg_error pkt_ext_edit_msg_active').text(resp.error);
  }
};

Pocket.prototype.handleSaved = function(resp) {
  var wrapper = $('.pkt_ext_containersaved');
  console.log('sweet, switch to full mode because of registered hit', resp);
  console.log('start of saved state', resp);
  // wrapper.find('.pkt_ext_detail h2').text(this.dictJSON.pagesaved);
  wrapper.find('.pkt_ext_btn').addClass('pkt_ext_btn_disabled');
  if (typeof resp.item == 'object') {
    this.savedItemId = resp.item.item_id;
    this.savedUrl = resp.item.resolved_url;
  }
  $('.pkt_ext_containersaved').addClass('pkt_ext_container_detailactive').removeClass('pkt_ext_container_finalstate');

  this.getTags();
  if (this.suggestedTagsLoaded) {
    this.startCloseTimer();
  }
  else {
    this.getSuggestedTags();
  }
};

var theBigP = new Pocket();

$(document).ready(function() {
  theBigP.init();
});
