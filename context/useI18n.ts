import { useGameSettings } from './GameSettingsContext';
import { translate } from '../config/i18n';

export function useI18n() {
  const { language } = useGameSettings();

  return {
    language,
    t: (key: string, params?: Record<string, string | number>) =>
      translate(language, key, params),
  };
}
