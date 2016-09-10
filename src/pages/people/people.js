'use strict';

import Ractive from 'ractive';
import Header  from '../../templates/header.html';
import Footer  from '../../templates/footer.html';
import Page    from './people.html';

var headerData = {
    test : 'abc'
};

var footerData = {
    scriptPath : '../shared/js/',
    scripts : [
        //'vendor/jquery-2.1.3.min.js',
        //'vendor/mugcakes/miso.ds.deps.min.0.4.0.js',
        //'vendor/mugcakes/mugcakes-templates.js',
        //'vendor/mugcakes/mugcakes.js'
    ]
};

new Header({ el: '#header', data: headerData });
new Footer({ el: '#foot', data: footerData });

var page = new Page({ el: '#page', data: {} });

window._pageDebug = page;
