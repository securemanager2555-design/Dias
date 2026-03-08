import React, { useEffect, useState } from "react";
import { changePassword, fetchProfile, updateProfile } from "../../../api/profile";
import "./AccountPage.css";

export function AccountPage({ user, onNavigate, onProfileUpdate }) {
  const [profile, setProfile] = useState(user || null);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");

  useEffect(() => {
    fetchProfile()
      .then(data => {
        setProfile(data);
        setDisplayName(data.displayName || "");
        setAvatarUrl(data.avatarUrl || "");
        setBio(data.bio || "");
      })
      .catch(() => {
        setProfile(null);
      });
  }, []);

  const handleSaveProfile = async event => {
    event.preventDefault();
    setProfileStatus("");
    try {
      const updated = await updateProfile({ displayName, avatarUrl, bio });
      setProfile(updated);
      if (onProfileUpdate) {
        onProfileUpdate(updated);
      }
      setProfileStatus("Профиль обновлен.");
    } catch {
      setProfileStatus("Не удалось сохранить профиль.");
    }
  };

  const handleChangePassword = async event => {
    event.preventDefault();
    setPasswordStatus("");
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordStatus("Пароль обновлен.");
    } catch {
      setPasswordStatus("Не удалось обновить пароль.");
    }
  };

  if (!profile) {
    return (
      <div className="account-page">
        <div className="account-page__card glass">
          <h1>Профиль недоступен</h1>
          <p>Сначала войдите в аккаунт.</p>
          <button onClick={() => onNavigate("/auth")}>Перейти ко входу</button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-page__header">
        <div>
          <h1>Аккаунт</h1>
          <p>Управляй профилем и безопасностью.</p>
        </div>
        <button className="account-page__back" onClick={() => onNavigate("/")}>
          Назад в лабораторию
        </button>
      </div>

      <div className="account-page__grid">
        <form className="account-page__panel glass" onSubmit={handleSaveProfile}>
          <h2>Профиль</h2>
          <label>
            Отображаемое имя
            <input
              type="text"
              value={displayName}
              onChange={event => setDisplayName(event.target.value)}
              maxLength={80}
            />
          </label>
          <label>
            Ссылка на аватар
            <input
              type="url"
              value={avatarUrl}
              onChange={event => setAvatarUrl(event.target.value)}
              placeholder="https://example.com/avatar.png"
              maxLength={500}
            />
          </label>
          <label>
            О себе
            <textarea
              value={bio}
              onChange={event => setBio(event.target.value)}
              rows={4}
              maxLength={500}
            />
          </label>
          <button type="submit">Сохранить</button>
          {profileStatus && <div className="account-page__status">{profileStatus}</div>}
        </form>

        <form className="account-page__panel glass" onSubmit={handleChangePassword}>
          <h2>Безопасность</h2>
          <label>
            Текущий пароль
            <input
              type="password"
              value={currentPassword}
              onChange={event => setCurrentPassword(event.target.value)}
              required
            />
          </label>
          <label>
            Новый пароль
            <input
              type="password"
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>
          <button type="submit">Обновить пароль</button>
          {passwordStatus && (
            <div className="account-page__status">{passwordStatus}</div>
          )}
        </form>
      </div>
    </div>
  );
}
