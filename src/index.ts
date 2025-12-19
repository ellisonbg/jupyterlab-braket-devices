import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { LabIcon } from '@jupyterlab/ui-components';
import { BraketDevicesWidget } from './widget';

/**
 * Icon for the Braket Devices extension using filled circular dot pattern in teal.
 * Teal color (#00BCD4) works well on both light and dark backgrounds.
 */
const borderClearIcon = new LabIcon({
  name: 'braket:border-clear',
  svgstr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle fill="#00BCD4" stroke="none" cx="4" cy="4" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="8" cy="4" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="12" cy="4" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="16" cy="4" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="20" cy="4" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="4" cy="8" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="12" cy="8" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="20" cy="8" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="4" cy="12" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="8" cy="12" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="12" cy="12" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="16" cy="12" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="20" cy="12" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="4" cy="16" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="12" cy="16" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="20" cy="16" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="4" cy="20" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="8" cy="20" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="12" cy="20" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="16" cy="20" r="1"/>
  <circle fill="#00BCD4" stroke="none" cx="20" cy="20" r="1"/>
</svg>`
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
        const content = new BraketDevicesWidget(commands);
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

