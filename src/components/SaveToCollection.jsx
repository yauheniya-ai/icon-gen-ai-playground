import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { saveCollection, getCollections } from '../api';
import './SaveToCollection.css';

function SaveToCollection({ user, iconSvg, iconName, onClose, onSaved }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    if (user) {
      loadCollections();
    }
    // Load SVG content from blob URL
    if (iconSvg) {
      fetchSvgContent(iconSvg);
    }
  }, [user, iconSvg]);

  const fetchSvgContent = async (blobUrl) => {
    try {
      const response = await fetch(blobUrl);
      const text = await response.text();
      setSvgContent(text);
    } catch (err) {
      console.error('Failed to fetch SVG:', err);
      setError('Failed to load icon preview');
    }
  };

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCollections();
      setCollections(data);
    } catch (err) {
      setError('Failed to load collections: ' + err.message);
      console.error('Error loading collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToExisting = async (collection) => {
    try {
      setSaving(true);
      setError(null);

      // Add the new icon to existing collection
      const updatedIcons = [
        ...collection.icons,
        {
          name: iconName,
          svg: svgContent,
          createdAt: new Date().toISOString()
        }
      ];

      // Pass collection ID to update existing collection
      await saveCollection({
        id: collection.id,
        name: collection.name,
        icons: updatedIcons
      });

      onSaved?.();
      onClose();
    } catch (err) {
      setError('Failed to save icon: ' + err.message);
      console.error('Error saving icon:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = async (e) => {
    e.preventDefault();
    
    if (!newCollectionName.trim()) {
      setError('Please enter a collection name');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await saveCollection({
        name: newCollectionName.trim(),
        icons: [{
          name: iconName,
          svg: svgContent,
          createdAt: new Date().toISOString()
        }]
      });

      onSaved?.();
      onClose();
    } catch (err) {
      setError('Failed to create collection: ' + err.message);
      console.error('Error creating collection:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="save-to-collection-modal" onClick={onClose}>
        <div className="save-to-collection-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Save Icon</h2>
            <button className="close-btn" onClick={onClose}>
              <Icon icon="ic:round-close" width="24" height="24" />
            </button>
          </div>
          <div className="auth-required">
            <Icon icon="ic:round-lock" width="48" height="48" />
            <p>Please log in to save icons</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="save-to-collection-modal" onClick={onClose}>
      <div className="save-to-collection-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Save Icon to Collection</h2>
          <button className="close-btn" onClick={onClose}>
            <Icon icon="ic:round-close" width="24" height="24" />
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <Icon icon="ic:round-error" width="20" height="20" />
            <span>{error}</span>
          </div>
        )}

        <div className="modal-body">
          {/* Icon Preview */}
          <div className="icon-preview-section">
            {svgContent ? (
              <div className="icon-preview-box" dangerouslySetInnerHTML={{ __html: svgContent }} />
            ) : (
              <div className="icon-preview-box">
                <Icon icon="ic:round-image" width="40" height="40" />
              </div>
            )}
            <p className="icon-name">{iconName}</p>
          </div>

          {/* Collections List */}
          {loading ? (
            <div className="loading-state">
              <Icon icon="ic:round-refresh" className="spin" width="24" height="24" />
              <p>Loading collections...</p>
            </div>
          ) : (
            <>
              {collections.length > 0 && !showNewCollection && (
                <div className="collections-section">
                  <h3>Add to existing collection:</h3>
                  <div className="collections-list-save">
                    {collections.map((collection) => (
                      <button
                        key={collection.id}
                        className="collection-option"
                        onClick={() => handleSaveToExisting(collection)}
                        disabled={saving}
                      >
                        <Icon icon="ic:round-folder" width="20" height="20" />
                        <span className="collection-name">{collection.name}</span>
                        <span className="icon-count">({collection.icons?.length || 0})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* New Collection Form */}
              {showNewCollection ? (
                <form className="new-collection-form" onSubmit={handleCreateNew}>
                  <h3>Create new collection:</h3>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Collection name..."
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      autoFocus
                      disabled={saving}
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowNewCollection(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="create-btn"
                      disabled={saving || !newCollectionName.trim()}
                    >
                      {saving ? 'Creating...' : 'Create & Save'}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  className="new-collection-btn"
                  onClick={() => setShowNewCollection(true)}
                  disabled={saving}
                >
                  <Icon icon="ic:round-add" width="20" height="20" />
                  Create New Collection
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SaveToCollection;
