import React, { useMemo, useState } from 'react';
import './TopNav.css';

export function TopNav({ route, onNavigate, user }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

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

  const secondaryItems = [
    ...(user
      ? [{ label: '\u041a\u0430\u0440\u0442\u0430 \u0437\u0430\u0449\u0438\u0442\u044b', path: '/protection-map' }]
      : []),
    { label: 'Secure by Design', path: '/secure-by-design' },
    { label: '\u041a\u043e\u043d\u0442\u0440\u043c\u0435\u0440\u044b', path: '/controls' },
  ];

  const isMoreActive = useMemo(
    () => secondaryItems.some(item => item.path === route),
    [route]
  );

  const handleNavigate = path => {
    setIsMoreOpen(false);
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

        <div className="top-nav__moreWrap">
          <button
            className={`top-nav__link ${isMoreActive || isMoreOpen ? 'top-nav__link--active' : ''}`}
            onClick={() => setIsMoreOpen(prev => !prev)}
          >
            {'\u0415\u0449\u0451'}
          </button>
          {isMoreOpen && (
            <div className="top-nav__moreMenu glass-strong">
              {secondaryItems.map(item => (
                <button
                  key={item.path}
                  className={`top-nav__moreItem ${
                    route === item.path ? 'top-nav__moreItem--active' : ''
                  }`}
                  onClick={() => handleNavigate(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
