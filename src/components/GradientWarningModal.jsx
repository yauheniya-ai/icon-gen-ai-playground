import { Icon } from '@iconify/react';
import './GradientWarningModal.css';

function GradientWarningModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content gradient-warning" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>×</button>
        
        <div className="warning-header">
          <Icon icon="line-md:alert" width="32" height="32" />
          <h2>Gradient Icons Cannot Be Saved to Collection</h2>
        </div>
        
        <div className="warning-body">
          <div className="warning-item">
            <Icon icon="heroicons-outline:save-as" width="24" height="24" />
            <p>To keep this icon, use the download buttons to save it to your computer.</p>
          </div>
          
          <div className="warning-item">
            <Icon icon="mingcute:settings-6-line" width="24" height="24" />
            <p>You can save your settings using the "Save Settings" button to recreate this icon later.</p>
          </div>
        </div>
        
        <button className="modal-btn" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

export default GradientWarningModal;
