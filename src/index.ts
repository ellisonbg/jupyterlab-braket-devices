import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { LabIcon } from '@jupyterlab/ui-components';
import { BraketDevicesWidget } from './widget';

/**
 * Icon for the Braket Devices extension using MUI BorderClear icon.
 */
const borderClearIcon = new LabIcon({
  name: 'braket:border-clear',
  svgstr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M7 5h10v2h2V3c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v4h2zm0 14h2v-2H7zm12-2h-2v2h2c1.1 0 2-.9 2-2v-4h-2zm0-12h2v2h-2zM5 7H3v2h2zm0 4H3v2h2zm0 4H3v2h2zm12 0h2v2h-2zM9 19v2h2v-2zm4 0v2h2v-2z"/></svg>`
});

/**
 * The command IDs used by the react-widget plugin.
 */
namespace CommandIDs {
  export const create = 'create-braket-devices-widget';
}

/**
 * Initialization data for the react-widget extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'braket-widget',
  description: 'Amazon Braket Device Information',
  autoStart: true,
  optional: [ILauncher],
  activate: (app: JupyterFrontEnd, launcher: ILauncher) => {
    const { commands } = app;

    const command = CommandIDs.create;
    commands.addCommand(command, {
      caption: 'Create a new Amazon Braket Device Information Widget',
      label: 'Braket Devices',
      icon: args => (args['isPalette'] ? undefined : borderClearIcon),
      execute: () => {
        const content = new BraketDevicesWidget();
        const widget = new MainAreaWidget<BraketDevicesWidget>({ content });
        widget.title.label = 'Braket Devices';
        widget.title.icon = borderClearIcon;
        app.shell.add(widget, 'main');
      }
    });

    if (launcher) {
      launcher.add({
        command
      });
    }
  }
};

export default extension;

