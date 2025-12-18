/**
 * Logo mapper utility - maps provider names to their logo files.
 */

import aqtLogo from '../../style/logos/AQT.png';
import awsLogo from '../../style/logos/AWS.png';
import ionqLogo from '../../style/logos/IonQ.png';
import iqmLogo from '../../style/logos/IQM.png';
import queraLogo from '../../style/logos/QuEra.png';
import rigettiLogo from '../../style/logos/Rigetti.png';

/**
 * Mapping of provider names to their logo URLs.
 * Provider names should match the providerName field from the API.
 */
const providerLogos: Record<string, string> = {
  'Amazon Braket': awsLogo,
  AQT: aqtLogo,
  AWS: awsLogo,
  IonQ: ionqLogo,
  IQM: iqmLogo,
  QuEra: queraLogo,
  Rigetti: rigettiLogo
};

/**
 * Get the logo URL for a given provider name.
 * @param providerName - The name of the provider (e.g., 'AWS', 'IonQ')
 * @returns The logo URL string, or undefined if no logo exists for this provider
 */
export function getProviderLogo(providerName: string): string | undefined {
  return providerLogos[providerName];
}
