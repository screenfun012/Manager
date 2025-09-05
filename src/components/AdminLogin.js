import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';

const AdminLogin = ({ onLogin, isLoading }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Minimalna implementacija - admin/admin ili admin secret iz konfiguracije
    const validCredentials = [
      { username: 'admin', password: 'fabrikamotora1968' }
    ];

    const isValid = validCredentials.some(cred => 
      cred.username === credentials.username && cred.password === credentials.password
    );

    if (isValid) {
      // Save credentials only if remember me is checked
      if (rememberMe) {
        const hashedPassword = btoa(credentials.password);
        localStorage.setItem('adminAuth', JSON.stringify({
          username: credentials.username,
          token: hashedPassword,
          timestamp: Date.now()
        }));
      }
      
      onLogin(true);
    } else {
      setError('Pogrešno korisničko ime ili lozinka');
    }
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      padding: '2rem'
    }}>
      <div style={{
        background: '#1f2937',
        border: '2px solid #374151',
        borderRadius: '16px',
        padding: '3rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* MR Engines Logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <img 
            src="/mr-engines-logo.png" 
            alt="MR Engines Logo" 
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              objectFit: 'cover'
            }}
          />
        </div>

        <h2 style={{
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: '0.5rem',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          Admin Panel
        </h2>
        
        <p style={{
          color: '#d1d5db',
          textAlign: 'center',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}>
          Unesite kredencijale za pristup administraciji
        </p>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={20} style={{ color: '#dc2626' }} />
            <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              color: '#d1d5db',
              fontSize: '0.9rem',
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Korisničko ime
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Unesite korisničko ime"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '2px solid #4b5563',
                  background: '#374151',
                  color: '#ffffff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#4b5563'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              color: '#d1d5db',
              fontSize: '0.9rem',
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Lozinka
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Unesite lozinku"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 3rem 0.75rem 1rem',
                  borderRadius: '8px',
                  border: '2px solid #4b5563',
                  background: '#374151',
                  color: '#ffffff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#4b5563'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              color: '#d1d5db',
              fontSize: '0.9rem'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#059669'
                }}
              />
              Zapamti me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: isLoading ? '#6b7280' : '#059669',
              border: `2px solid ${isLoading ? '#4b5563' : '#047857'}`,
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              <Lock size={20} />
            )}
            {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;
