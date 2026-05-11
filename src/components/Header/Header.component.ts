import { closeBtn } from './CloseBtn.component';
import { refreshBtn } from './RefreshBtn.component';
import { removeBtn } from './RemoveBtn.component';
import { settingsBtn } from './SettingsBtn.component';

export const header = `
    <header class="mw-cm__header">
        <h2 class="mw-cm__header-text">Cookie Manager</h2>
        <button type="button" class="mw-cm__header-remove-btn" title="Delete all handled cookies">${removeBtn}</button>
        <button type="button" class="mw-cm__header-settings-btn" title="Configure cookies">${settingsBtn}</button>
        <button type="button" class="mw-cm__header-refresh-btn" title="Refresh the page">${refreshBtn}</button>
        <button type="button" class="mw-cm__header-close-btn" title="Close Cookie Manager">${closeBtn}</button>
    </header>
`;
