import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { reactIcon } from '@jupyterlab/ui-components';
import { BraketDevicesWidget } from './widget';

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
      icon: args => (args['isPalette'] ? undefined : reactIcon),
      execute: () => {
        const content = new BraketDevicesWidget();
        const widget = new MainAreaWidget<BraketDevicesWidget>({ content });
        widget.title.label = 'Braket Devices';
        widget.title.icon = reactIcon;
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

