import { header } from './Header/Header.component';
import * as pkg from '../../package.json';

const version = pkg.version;

export const cookieManagerSkeleton = `
    ${header}
    <div class="mw-cm-content"></div>
    <footer class="mw-cm-footer">
        <span class="mw-cm-footer__count js-mw-cm-footer-count"></span>
        <span class="mw-cm-footer__version">v${version}</span>
    </footer>
`;
