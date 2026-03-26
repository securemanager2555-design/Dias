import React from 'react';
import './TopNav.css';

export function TopNav({ route, onNavigate, user }) {
  const authItem = user
    ? { label: '\u0410\u043a\u043a\u0430\u0443\u043d\u0442', path: '/account' }
    : { label: '\u0412\u0445\u043e\u0434', path: '/auth' };

  const adminItem =
    user?.role === 'admin'
      ? { label: '\u0410\u0434\u043c\u0438\u043d', path: '/admin' }
      : null;

  const primaryItems = [
    { label: '\u041b\u0430\u0431\u043e\u0440\u0430\u0442\u043e\u0440\u0438\u044f', path: '/' },
    { label: 'OWASP Shield', path: '/security' },
    { label: '\u0417\u0430\u043c\u0435\u0442\u043a\u0438', path: '/notes' },
  ];

  const handleNavigate = path => {
    onNavigate(path);
  };

  return (
    <header className="top-nav">
      <div className="top-nav__brand">Secure by Design</div>
      <nav className="top-nav__links">
        {[...primaryItems, adminItem, authItem].filter(Boolean).map(item => (
          <button
            key={item.path}
            className={`top-nav__link ${
              route === item.path ? 'top-nav__link--active' : ''
            }`}
            onClick={() => handleNavigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
