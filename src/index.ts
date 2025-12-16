import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './request';

/**
 * Initialization data for the jupyterlab-braket-devices extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-braket-devices:plugin',
  description: 'A JupyterLab extension for Amazon Braket Devices',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab-braket-devices is activated!');

    requestAPI<any>('hello')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jupyterlab_braket_devices server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
