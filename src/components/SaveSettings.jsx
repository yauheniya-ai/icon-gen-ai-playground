import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getSettings, saveSettings } from '../api';
import './SaveSettings.css';

function SaveSettings({ currentSettings, onClose, onSaved }) {
  const [existingSettings, setExistingSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [settingsName, setSettingsName] = useState('');
  const [selectedSettings, setSelectedSettings] = useState(null);

  useEffect(() => {
    loadExistingSettings();
  }, []);

  const loadExistingSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setExistingSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNew = async () => {
    if (!settingsName.trim()) {
      setError('Please enter a name for the settings');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await saveSettings({
        name: settingsName,
        ...currentSettings
      });

      onSaved?.();
      onClose();
    } catch (err) {
      setError('Failed to save settings: ' + err.message);
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateExisting = async (settings) => {
    try {
      setSaving(true);
      setError(null);

      await saveSettings({
        id: settings.id,
        name: settings.name,
        ...currentSettings
      });

      onSaved?.();
      onClose();
    } catch (err) {
      setError('Failed to update settings: ' + err.message);
      console.error('Error updating settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="save-settings-modal" onClick={onClose}>
      <div className="save-settings-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Save Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <Icon icon="ic:round-close" width="24" height="24" />
          </button>
        </div>

        {error && (
          <div className="error-message">
            <Icon icon="ic:round-error" width="20" height="20" />
            <span>{error}</span>
          </div>
        )}

        <div className="save-section">
          <h3>Save as New</h3>
          <div className="input-group">
            <input
              type="text"
              placeholder="e.g., banking-app, travel-app"
              value={settingsName}
              onChange={(e) => setSettingsName(e.target.value)}
              disabled={saving}
            />
            <button
              className="save-btn"
              onClick={handleSaveNew}
              disabled={saving || !settingsName.trim()}
            >
              {saving ? 'Saving...' : 'Create New'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <Icon icon="ic:round-refresh" className="spin" width="24" height="24" />
            <span>Loading existing settings...</span>
          </div>
        ) : existingSettings.length > 0 && (
          <div className="existing-section">
            <h3>Or Update Existing</h3>
            <div className="settings-list">
              {existingSettings.map((settings) => (
                <div
                  key={settings.id}
                  className="settings-item"
                  onClick={() => handleUpdateExisting(settings)}
                >
                  <div className="settings-info">
                    <Icon icon="mingcute:settings-6-line" width="20" height="20" />
                    <span>{settings.name}</span>
                  </div>
                  <Icon icon="ic:round-chevron-right" width="20" height="20" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SaveSettings;
