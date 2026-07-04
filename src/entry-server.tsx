/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './App';
import { NavPage } from './types';

export function render(pageId: NavPage['id']) {
  return ReactDOMServer.renderToString(<App initialPage={pageId} />);
}
