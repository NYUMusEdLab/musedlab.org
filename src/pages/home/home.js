'use strict';

import Ractive from 'ractive';
import Header  from '../../templates/header.html';
import Footer  from '../../templates/footer.html';
import Page    from './home.html';
import Util    from '../../js/util';

var headerData = {
    test : 'abc'
};

new Header({ el: '#header', data: headerData });
new Footer({ el: '#foot' });

var projectsURL = 'https://musedlab.org/api/applications'; // TODO: lighter-weight API call for app summary

Util.get(projectsURL).then(JSON.parse).then(
    function (data) {
        var page = new Page({ el: '#page', data: {
            projects: data.applications
        } });

        window._pageDebug = page;
    },
    function (error) {
        console.log("Couldn't load " + projectsURL + " because " + error);
    }
);

