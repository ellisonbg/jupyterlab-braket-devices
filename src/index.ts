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
  svgstr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M7 5h2V3H7zm0 8h2v-2H7zm0 8h2v-2H7zm4-4h2v-2h-2zm0 4h2v-2h-2zm-8 0h2v-2H3zm0-4h2v-2H3zm0-4h2v-2H3zm0-4h2V7H3zm0-4h2V3H3zm8 8h2v-2h-2zm8 4h2v-2h-2zm0-4h2v-2h-2zm0 8h2v-2h-2zm0-12h2V7h-2zm-8 0h2V7h-2zm8-6v2h2V3zm-8 2h2V3h-2zm4 16h2v-2h-2zm0-8h2v-2h-2zm0-8h2V3h-2z"/></svg>`
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

