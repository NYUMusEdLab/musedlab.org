'use strict';

import Ractive from 'ractive';
import Header  from '../../templates/header.html';
import Footer  from '../../templates/footer.html';
import Page    from './home.html';

var pageData = {
    test : 'abc'
};

new Header({ el: '#header', data: pageData });
new Footer({ el: '#foot' });

var page = new Page({ el: '#page', data: pageData });

// save to window for debugging
window._pageDebug = page;

