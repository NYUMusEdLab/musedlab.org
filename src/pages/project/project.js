'use strict';

import Ractive from 'ractive';

import Util    from '../../js/util';
import Header  from '../../templates/header.html';
import Footer  from '../../templates/footer.html';
import Page    from './project.html';

var urlOptions = {
    id : { name: 'museid', inUI: false, value: '', type: 'string' }
};

var options = Util.initOptions(urlOptions);

var headerData = {
};

var footerData = {
};

new Header({ el: '#header', data: headerData });
new Footer({ el: '#foot', data: footerData });


var pageData = {
    id : options.id
};

var projectURL = 'https://musedlab.org/api/applications/' + options.id;

Util.get(projectURL).then(JSON.parse).then(
    function (data) {
        var page = new Page({ el: '#page', data: data.application });

        window._pageDebug = page;
    },
    function (error) {
        console.log("Couldn't load " + projectURL + " because " + error);
    }
);
