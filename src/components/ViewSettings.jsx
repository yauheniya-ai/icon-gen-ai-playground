import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getSettings, deleteSettings } from '../api';
import './ViewSettings.css';

function ViewSettings({ user, onClose, onLoadSettings }) {
  const [settingsList, setSettingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSettings, setSelectedSettings] = useState(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSettings();
      setSettingsList(data);
    } catch (err) {
      setError('Failed to load settings: ' + err.message);
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (settingsId, settingsName) => {
    if (!confirm(`Delete settings "${settingsName}"?`)) {
      return;
    }

    try {
      await deleteSettings(settingsId);
      setSettingsList(settingsList.filter(s => s.id !== settingsId));
      if (selectedSettings?.id === settingsId) {
        setSelectedSettings(null);
      }
    } catch (err) {
      setError('Failed to delete settings: ' + err.message);
      console.error('Error deleting settings:', err);
    }
  };

  const handleLoadSettings = (settings) => {
    if (onLoadSettings) {
      onLoadSettings(settings);
      onClose();
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'Not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value === '') return 'Empty';
    return String(value);
  };

  const getSettingsGroups = (settings) => [
    {
      title: 'Icon Color',
      fields: [
        { label: 'Gradient Enabled', value: settings.iconGradient },
        { label: 'Solid Color', value: settings.iconColor, show: !settings.iconGradient },
        { label: 'Color 1', value: settings.iconColor1, show: settings.iconGradient },
        { label: 'Color 2', value: settings.iconColor2, show: settings.iconGradient },
        { label: 'Direction', value: settings.iconGradientDirection, show: settings.iconGradient },
      ]
    },
    {
      title: 'Background',
      fields: [
        { label: 'Gradient Enabled', value: settings.bgGradient },
        { label: 'Solid Color', value: settings.bgColor, show: !settings.bgGradient },
        { label: 'Color 1', value: settings.bgColor1, show: settings.bgGradient },
        { label: 'Color 2', value: settings.bgColor2, show: settings.bgGradient },
        { label: 'Direction', value: settings.bgGradientDirection, show: settings.bgGradient },
      ]
    },
    {
      title: 'Size & Scale',
      fields: [
        { label: 'Size', value: settings.size ? `${settings.size}px` : null },
        { label: 'Scale', value: settings.scale },
      ]
    },
    {
      title: 'Styling',
      fields: [
        { label: 'Border Radius', value: settings.borderRadius },
        { label: 'Outline Width', value: settings.outlineWidth },
        { label: 'Outline Color', value: settings.outlineColor, show: settings.outlineWidth > 0 },
      ]
    },
    {
      title: 'Animation',
      fields: [
        { label: 'Animation Enabled', value: settings.animationEnabled },
        { label: 'Type', value: settings.animationType, show: settings.animationEnabled },
        { label: 'Duration', value: settings.animationDuration ? `${settings.animationDuration}s` : null, show: settings.animationEnabled },
      ]
    }
  ];

  if (!user) {
    return (
      <div className="view-settings-modal">
        <div className="view-settings-content">
          <div className="modal-header">
            <h2>Saved Settings</h2>
            <button className="close-btn" onClick={onClose}>
              <Icon icon="ic:round-close" width="24" height="24" />
            </button>
          </div>
          <div className="auth-required">
            <Icon icon="ic:round-lock" width="48" height="48" />
            <p>Please log in to view saved settings</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-settings-modal" onClick={onClose}>
      <div className="view-settings-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Saved Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <Icon icon="ic:round-close" width="24" height="24" />
          </button>
        </div>

        {loading && (
          <div className="loading">
            <Icon icon="ic:round-refresh" className="spin" width="32" height="32" />
            <p>Loading settings...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <Icon icon="ic:round-error" width="24" height="24" />
            <p>{error}</p>
            <button onClick={loadSettings}>Retry</button>
          </div>
        )}

        {!loading && !error && settingsList.length === 0 && (
          <div className="empty-state">
            <Icon icon="mingcute:settings-6-line" width="64" height="64" />
            <p>No saved settings yet</p>
            <small>Configure your preferences and save them</small>
          </div>
        )}

        {!loading && !error && settingsList.length > 0 && (
          <div className="settings-layout">
            <div className="settings-list">
              <h3>Settings ({settingsList.length})</h3>
              {settingsList.map((settings) => (
                <div
                  key={settings.id}
                  className={`settings-item ${selectedSettings?.id === settings.id ? 'active' : ''}`}
                  onClick={() => setSelectedSettings(settings)}
                >
                  <div className="settings-info">
                    <Icon icon="mingcute:settings-6-line" width="20" height="20" />
                    <span className="settings-name">{settings.name}</span>
                  </div>
                  <div className="settings-actions">
                    <button
                      className="load-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadSettings(settings);
                      }}
                      title="Load these settings"
                    >
                      <Icon icon="ic:round-input" width="18" height="18" />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(settings.id, settings.name);
                      }}
                      title="Delete settings"
                    >
                      <Icon icon="ic:round-delete" width="18" height="18" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="settings-preview">
              {selectedSettings ? (
                <div className="settings-details">
                  <h3>{selectedSettings.name}</h3>
                  <div className="settings-container">
                    {getSettingsGroups(selectedSettings).map((group, idx) => (
                      <div key={idx} className="settings-group">
                        <h4>{group.title}</h4>
                        {group.fields.filter(f => f.show !== false).map((field, i) => (
                          <div key={i} className="setting-row">
                            <span className="setting-label">{field.label}</span>
                            <span className="setting-value">{formatValue(field.value)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    
                    {selectedSettings.updatedAt && (
                      <div className="settings-footer">
                        <Icon icon="ic:round-access-time" width="16" height="16" />
                        <span>Last updated: {
                          selectedSettings.updatedAt.seconds 
                            ? new Date(selectedSettings.updatedAt.seconds * 1000).toLocaleString()
                            : new Date(selectedSettings.updatedAt).toLocaleString()
                        }</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <Icon icon="ic:round-touch-app" width="48" height="48" />
                  <p>Select settings to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewSettings;
