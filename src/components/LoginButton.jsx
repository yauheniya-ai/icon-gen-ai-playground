import { Icon } from '@iconify/react';

function LoginButton({ user, onLoginClick, onLogout }) {
  const displayName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  
  return (
    <div className="login-button-container">
      {user ? (
        <div className="user-logged-in">
          <span className="user-greeting">Hi, {displayName}</span>
          <button className="login-btn" onClick={onLogout}>
            <Icon icon="ic:round-logout" width="40" height="40" />
          </button>
        </div>
      ) : (
        <div className="login-btn-wrapper">
          <button 
            className="login-btn" 
            onClick={onLoginClick}
          >
            <Icon icon="ic:round-login" width="40" height="40" />
          </button>
          <span className="login-tooltip">Login</span>
        </div>
      )}
    </div>
  );
}

export default LoginButton;
