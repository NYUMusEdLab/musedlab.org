var Util = {

    randomIntFromInterval: function(min,max) {
        return Math.floor((max - min + 1) * Math.random() + min);
    },

    get: function (url) {
        // Return a new promise.
        return new Promise(function (resolve, reject) {
            // Do the usual XHR stuff
            var req = new XMLHttpRequest();
            req.open('GET', url);

            req.onload = function () {
                // This is called even on 404 etc
                // so check the status
                if (req.status == 200) {
                    // Resolve the promise with the response text
                    resolve(req.response);
                }
                else {
                    // Otherwise reject with the status text
                    // which will hopefully be a meaningful error
                    reject(Error(req.statusText));
                }
            };

            // Handle network errors
            req.onerror = function () {
                reject(Error("Network Error"));
            };

            // Make the request
            req.send();
        });
    },

    del: function(url) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: url,
                type: 'DELETE',
                success: function (result) {
                    console.log('deleted ' + url);
                    resolve(result);
                },
                error: function (e) {
                  reject(e);
                }
            });
        });
    },

    trim: function(str, characters) {
        var c_array = characters.split('');
        var result  = '';

        for (var i=0; i < characters.length; i++)
            result += '\\' + c_array[i];

        return str.replace(new RegExp('^[' + result + ']+|['+ result +']+$', 'g'), '');
    },

    sluggify: function (name) {
        return name.toLowerCase().replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s/g, '-');
    },

    initOptions: function(fullOptions)
    {
        var queryString = window.location.search.substring(1);
        var params = queryString.split('&');
        var liteOptions = {};

        for (var optionKey in fullOptions) {
            var option = fullOptions[optionKey];
            liteOptions[optionKey] = option.value;

            for (var i = 0; i < params.length; i++) {
                var param = params[i].split('=');

                if (param[0] == option.name) {
                    var value = Util.trim(param[1], '/');

                    if (option.type == 'bool') {
                        value = (value == 'true');
                    }
                    else if (option.type == 'int') {
                        value = parseInt(value);
                    }
                    else if (option.type == 'float') {
                        value = parseFloat(value);
                    }

                    liteOptions[optionKey] = value;
                    fullOptions[optionKey].value = value;

                    break;
                }
            }
        }

        return liteOptions;
    },

    extend: function(child, parent) {
        function Ctor() {
            this.constructor = child;
        }
        Ctor.prototype = parent.prototype;
        var oldProto = child.prototype;
        child.prototype = new Ctor();

        for (var key in oldProto) {
            if (oldProto.hasOwnProperty(key)) {
                child.prototype[key] = oldProto[key];
            }
        }
        child.__super__ = parent.prototype;
        // create reference to parent
        child.super = parent;
    },

    addMethods: function(constructor, methods) {
        var key;

        for (key in methods) {
            constructor.prototype[key] = methods[key];
        }
    },

    patchElementsFromPoint: function() {
        if(!document.elementsFromPoint) {
            document.elementsFromPoint = function(x, y) {
                var elementList = [];
                var pointerEventsList = [];

                do {
                    var element = document.elementFromPoint(x, y);
                    elementList.push(element);
                    pointerEventsList.push(element.style.pointerEvents);
                    element.style.pointerEvents = 'none';
                } while(element.tagName != 'BODY');
                
                for(var i = 0; i < elementList.length; ++i) {
                    elementList[i].style.pointerEvents = pointerEventsList[i];
                }

                return elementList;
            }
        }
    }
};


module.exports = Util;
