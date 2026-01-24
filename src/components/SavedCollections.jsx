import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getCollections, deleteCollection, saveCollection } from '../api';
import './SavedCollections.css';

function SavedCollections({ user, onClose }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    if (user) {
      loadCollections();
    }
  }, [user]);

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

  const handleDelete = async (collectionId, collectionName) => {
    if (!confirm(`Delete collection "${collectionName}"?`)) {
      return;
    }

    try {
      await deleteCollection(collectionId);
      setCollections(collections.filter(c => c.id !== collectionId));
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
      }
    } catch (err) {
      setError('Failed to delete collection: ' + err.message);
      console.error('Error deleting collection:', err);
    }
  };

  const handleDownloadIcon = (icon, index) => {
    // Create blob from SVG string
    const blob = new Blob([icon.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `${icon.name || 'icon'}-${index + 1}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteIcon = async (collectionId, iconIndex) => {
    if (!confirm('Delete this icon from the collection?')) {
      return;
    }

    try {
      const collection = collections.find(c => c.id === collectionId);
      const updatedIcons = collection.icons.filter((_, index) => index !== iconIndex);
      
      // Update collection with remaining icons
      await saveCollection({
        id: collection.id,
        name: collection.name,
        icons: updatedIcons
      });
      
      // Update local state
      const updatedCollections = collections.map(c => 
        c.id === collectionId ? { ...c, icons: updatedIcons } : c
      );
      setCollections(updatedCollections);
      
      // Update selected collection if it's the one being modified
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection({ ...selectedCollection, icons: updatedIcons });
      }
    } catch (err) {
      setError('Failed to delete icon: ' + err.message);
      console.error('Error deleting icon:', err);
    }
  };

  if (!user) {
    return (
      <div className="saved-collections-modal">
        <div className="saved-collections-content">
          <div className="modal-header">
            <h2>Saved Collections</h2>
            <button className="close-btn" onClick={onClose}>
              <Icon icon="ic:round-close" width="24" height="24" />
            </button>
          </div>
          <div className="auth-required">
            <Icon icon="ic:round-lock" width="48" height="48" />
            <p>Please log in to view your saved collections</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-collections-modal" onClick={onClose}>
      <div className="saved-collections-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Saved Collections</h2>
          <button className="close-btn" onClick={onClose}>
            <Icon icon="ic:round-close" width="24" height="24" />
          </button>
        </div>

        {loading && (
          <div className="loading">
            <Icon icon="ic:round-refresh" className="spin" width="32" height="32" />
            <p>Loading collections...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <Icon icon="ic:round-error" width="24" height="24" />
            <p>{error}</p>
            <button onClick={loadCollections}>Retry</button>
          </div>
        )}

        {!loading && !error && collections.length === 0 && (
          <div className="empty-state">
            <Icon icon="ic:round-collections-bookmark" width="64" height="64" />
            <p>No saved collections yet</p>
            <small>Generate icons and save them to collections</small>
          </div>
        )}

        {!loading && !error && collections.length > 0 && (
          <div className="collections-layout">
            <div className="collections-list">
              <h3>Collections ({collections.length})</h3>
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`collection-item ${selectedCollection?.id === collection.id ? 'active' : ''}`}
                  onClick={() => setSelectedCollection(collection)}
                >
                  <div className="collection-info">
                    <Icon icon="ic:round-folder" width="20" height="20" />
                    <span className="collection-name">{collection.name}</span>
                    <span className="icon-count">({collection.icons?.length || 0})</span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(collection.id, collection.name);
                    }}
                    title="Delete collection"
                  >
                    <Icon icon="ic:round-delete" width="18" height="18" />
                  </button>
                </div>
              ))}
            </div>

            <div className="collection-preview">
              {selectedCollection ? (
                <>
                  <h3>{selectedCollection.name}</h3>
                  <div className="icons-grid">
                    {selectedCollection.icons.map((icon, index) => (
                      <div key={index} className="icon-card">
                        <div
                          className="icon-preview"
                          dangerouslySetInnerHTML={{ __html: icon.svg }}
                        />
                        <div className="icon-actions">
                          <button
                            onClick={() => handleDownloadIcon(icon, index)}
                            title="Download SVG"
                            className="download-icon-btn"
                          >
                            <Icon icon="ic:round-download" width="16" height="16" />
                          </button>
                          <button
                            onClick={() => handleDeleteIcon(selectedCollection.id, index)}
                            title="Delete icon"
                            className="delete-icon-btn"
                          >
                            <Icon icon="ic:round-delete" width="16" height="16" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  <Icon icon="ic:round-touch-app" width="48" height="48" />
                  <p>Select a collection to view icons</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedCollections;
