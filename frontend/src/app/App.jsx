import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LabDashboard } from '../features/dashboard/components/LabDashboard';
import { ModuleDetail } from '../features/modules/components/ModuleDetail';
import { ProfileCard } from '../features/profile/components/ProfileCard';
import { owaspModules } from '../features/modules/data/owaspModules';
import { fetchModules } from '../api/modules';
import { fetchMe } from '../api/auth';
import { AuthPage } from '../features/auth/components/AuthPage';
import { ProtectionMapPage } from '../features/modules/pages/ProtectionMapPage';
import { SecureByDesignPage } from '../features/modules/pages/SecureByDesignPage';
import { ControlsPage } from '../features/modules/pages/ControlsPage';
import { NotesPage } from '../features/notes/pages/NotesPage';
import { AdminPage } from '../features/admin/pages/AdminPage';
import { AccountPage } from '../features/profile/pages/AccountPage';
import { SecurityShieldPage } from '../features/security/pages/SecurityShieldPage';
import { SecurityEventsPage } from '../features/security/pages/SecurityEventsPage';
import { TopNav } from './TopNav';
import './App.css';

export function App() {
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [route, setRoute] = useState(window.location.pathname);
  const [modules, setModules] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    fetchMe()
      .then(data => {
        setUser(data);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchModules()
      .then(data => {
        if (isMounted) {
          setModules(Array.isArray(data) ? data : []);
        }
      })
      .catch(error => {
        if (isMounted) {
          console.warn('Failed to load modules from API', error);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const navigate = path => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const localModulesById = useMemo(
    () => new Map(owaspModules.map(module => [module.id, module])),
    []
  );
  const mergedModules = modules.length
    ? modules.map(module => {
        const localModule =
          localModulesById.get(module.slug) || localModulesById.get(module.id);
        return {
          ...localModule,
          ...module,
          id: module.slug || module.id,
        };
      })
    : owaspModules;
  const selectedModule = selectedModuleId
    ? mergedModules.find(
        module => module.id === selectedModuleId || module.slug === selectedModuleId
      )
    : null;

  if (route === '/auth') {
    return (
      <div className="app-root">
        <AuthPage
          onNavigate={navigate}
          onAuthSuccess={currentUser => setUser(currentUser)}
        />
      </div>
    );
  }

  if (route === '/account') {
    return (
      <div className="app-root">
        <TopNav route={route} onNavigate={navigate} user={user} />
        <AccountPage
          user={user}
          onNavigate={navigate}
          onProfileUpdate={currentUser => setUser(currentUser)}
        />
      </div>
    );
  }

  return (
    <div className="app-root">
      <TopNav route={route} onNavigate={navigate} user={user} />

      {route === '/' && (
        <>
          <LabDashboard
            modules={mergedModules}
            onModuleSelect={setSelectedModuleId}
            user={user}
            onNavigate={navigate}
          />
          <ProfileCard onNavigate={navigate} user={user} onLogout={() => setUser(null)} />

          <AnimatePresence>
            {selectedModule && (
              <ModuleDetail
                key={selectedModule.id}
                module={selectedModule}
                onClose={() => setSelectedModuleId(null)}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {route === '/protection-map' &&
        (user ? (
          <ProtectionMapPage />
        ) : (
          <AuthPage
            onNavigate={navigate}
            onAuthSuccess={currentUser => setUser(currentUser)}
          />
        ))}
      {route === '/secure-by-design' && <SecureByDesignPage />}
      {route === '/controls' && <ControlsPage />}
      {route === '/notes' && <NotesPage user={user} onNavigate={navigate} />}
      {route === '/admin' && <AdminPage user={user} onNavigate={navigate} />}
      {route === '/security' &&
        (user ? (
          <SecurityShieldPage user={user} onNavigate={navigate} />
        ) : (
          <AuthPage
            onNavigate={navigate}
            onAuthSuccess={currentUser => setUser(currentUser)}
          />
        ))}
      {route === '/security-events' &&
        (user ? (
          <SecurityEventsPage user={user} onNavigate={navigate} />
        ) : (
          <AuthPage
            onNavigate={navigate}
            onAuthSuccess={currentUser => setUser(currentUser)}
          />
        ))}

      {!route.match(
        /^\/(|protection-map|secure-by-design|controls|notes|admin|account|security|security-events)$/i
      ) && (
        <div className="app-page">
          <h1 className="app-page__title">{"\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430"}</h1>
          <p className="app-page__subtitle">{"\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u0438\u043b\u0438 \u0432\u0435\u0440\u043d\u0438\u0442\u0435\u0441\u044c \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u0443\u044e."}</p>
        </div>
      )}
    </div>
  );
}
