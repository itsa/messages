/**
 * Creating floating Panel-nodes which can be shown and hidden.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module panel
 * @class Panel
 * @since 0.0.1
*/

require('js-ext');
require('polyfill');

(function (global) {

    "use strict";

    var NAME = '[messages]: ',
        MESSAGE_LEVELS = {
            1: 'message',
            2: 'warning',
            3: 'error'
        },
        createHashMap = require('js-ext/extra/hashmap.js').createMap,
        later = require('utils').later,
        messages, Event;

    global._ITSAmodules || Object.protectedProp(global, '_ITSAmodules', createHashMap());

/*jshint boss:true */
    if (messages=global._ITSAmodules.messages) {
/*jshint boss:false */
        module.exports = messages; // messages was already created
        return;
    }

    Event = require('event');

    messages = {
        message: function(message, options) {
            var messagePromise = global.Promise.manage(),
                emitter, level, timeout, icon, stayActive;
            message || (message='');
            options || (options={});
            emitter = options.emitter || 'global';
            icon = options.icon;
            level = MESSAGE_LEVELS[options.level] || MESSAGE_LEVELS[1];
            timeout = options.timeout;
            stayActive = options.stayActive;
            messagePromise.merge(options);
            stayActive && messagePromise.stayActive(stayActive);
            if (icon) {
                message = '<div class="dialog-message-icon"><i icon="'+icon+'"></i></div><div class="dialog-message">'+message+'</div>';
            }
            messagePromise.content = message;
            if ((typeof timeout==='number') && (timeout>0)) {
                // with nothing to notify it was timeout
                later(messagePromise.fulfill, timeout);
            }
            Event.emit(options.target || global, emitter+':'+level, {messagePromise: messagePromise});
            return messagePromise;
        },
        alert: function(message, icon) {
            return this.message(message, {
                footer: '<button class="pure-button pure-button-primary">Ok</button>',
                icon: icon
            });
        },
        warn: function(message) {
            return this.message(message, {
                footer: '<button class="pure-button pure-button-primary">Ok</button>',
                icon: 'alert',
                level: 2
            });
        },
        prompt: function(message, options) {
            var placeholder, defaultValue, label, icon, validate;
            options || (options={});
            defaultValue = options.defaultValue;
            label = options.label;
            icon = options.icon;
            validate = options.validate;
            placeholder = defaultValue ? ' value="'+String(defaultValue)+'"' : '';
            if ((typeof message ==='string') || (message!=='')) {
                message = '<div class="dialog-prompt">'+message+'</div>';
            }
            else {
                message = '';
            }
            label = (typeof label==='string') ? (label='<label for="iprompt">'+label+'</label>') : '';
            return this.message(
                '<div class="pure-form">'+message+label+'<input id="iprompt" type="text"'+placeholder+' fm-defaultitem="true" fm-primaryonenter="true"></div>',
                {
                    footer: '<button is="cancel" class="pure-button">Cancel</button><button is="ok" class="pure-button pure-button-primary">Ok</button>',
                    icon: icon,
                    validate: validate
                }
            ).then(function(container) {
console.warn(container.getOuterHTML());
                var button = container.getElement('button');
                if (button.getAttr('is')==='ok') {
                    return container.getElement('input').getValue();
                }
            });
        },
        catchErrors: function(catchOrNot) {
            // DO NOT use `this` --> when merged, `this` will become the host
            // while `global.onerror` refers to `messages`
            messages._catchErrors = catchOrNot;
        }
    };

    global.onerror = function(msg, url, line) {
        if (messages._catchErrors) {
            messages.message(msg, {
                header: 'Javascript-error (line '+line+')',
                footer: url,
                icon: 'error',
                level: 3
            });
            return true;
        }
    };

    module.exports = messages;

}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this));
