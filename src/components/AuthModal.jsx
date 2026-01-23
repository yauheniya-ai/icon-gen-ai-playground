import { useState } from 'react';
import { Icon } from '@iconify/react';
import { 
  signInWithGoogle, 
  signInWithGithub, 
  loginWithEmail, 
  signupWithEmail 
} from '../firebase';

function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSocialLogin = async (provider) => {
    setError('');
    setLoading(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'github') {
        await signInWithGithub();
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <Icon icon="mdi:close" width="24" height="24" />
        </button>
        
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <p className="modal-subtitle">Save your icon collections to the cloud</p>

        <div className="social-auth">
          <button 
            className="social-btn google-btn" 
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            <Icon icon="logos:google-icon" width="20" height="20" />
            <span>Continue with Google</span>
          </button>
          
          <button 
            className="social-btn github-btn" 
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
          >
            <Icon icon="mdi:github" width="20" height="20" />
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={handleEmailAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          
          {error && <div className="auth-error">{error}</div>}
          
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            disabled={loading}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
