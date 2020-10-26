import React from 'react';
import ReactDom from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { LocaleProvider } from 'antd';
import koKR from 'antd/lib/locale-provider/ko_KR';
import enUS from 'antd/lib/locale-provider/en_US';

import { i18nClient } from './i18n';
import App from './containers/App';

const antResources = {
    ko: koKR,
    'ko-KR': koKR,
    en: enUS,
    'en-US': enUS,
};

//uncomment lines for work in a browser
// const root = document.createElement('div');
// root.id = 'themeBuilder';
// document.body.appendChild(root);

const render = (Component) => {
    const rootElement = document.getElementById('themeBuilder');
    ReactDom.render(
        <AppContainer>
            <LocaleProvider locale={antResources[i18nClient.language]}>
                <Component />
            </LocaleProvider>
        </AppContainer>,
        rootElement,
    );
};

render(App);
if (module.hot) {
    module.hot.accept('./containers/App', () => {
        render(App);
    });
}
