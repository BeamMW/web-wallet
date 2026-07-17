/// <reference types="chrome"/>

import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { initRemoteConnection } from '@app/core/api';

window.global = window;

initRemoteConnection();
