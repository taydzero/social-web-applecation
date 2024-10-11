// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/styles.css';
import Layout from './components/layout/Layout';
import Home from './components/pages/home/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Message from './components/pages/message/Message';
import MessageList from './components/pages/message/MessageList';
import Contacts from './components/pages/Contacts/Contacts';
import Settings from './components/pages/Settings/Settings';
import { ThemeProvider } from './ThemeContext';
import Main from './components/pages/main/Main';
import Player from './components/pages/Player/Player';
import { PlayerProvider } from './components/pages/Player/PlayerContext';
import { MessageProvider } from './components/pages/message/MessageContext';
import UserProfile from './components/pages/Profile/UserProfile';
import { UserProvider } from './components/pages/Profile/UserContext';
import { AuthProvider } from './contexts/AuthContext'; // Убедитесь, что путь правильный
import Register from './Register'; // Путь к вашему Register компоненту
import Login from './Login'; // Путь к вашему Login компоненту
import PrivateRoute from './Private/PrivateRoute'; // Путь к вашему PrivateRoute компоненту
import Groups from './components/pages/Groups/Groups';
import ProtectedComponent from './components/ProtectedComponent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from './axiosConfig'; // Используем настроенный экземпляр Axios
import EditProfile from './components/pages/Profile/EditProfile';

// Настройка базового URL для Axios
axiosInstance.defaults.baseURL = 'http://localhost:5000'; // Замените на ваш бэкенд URL

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <UserProvider>
          <ThemeProvider>
            <PlayerProvider>
              <MessageProvider>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/News" element={<Main />} />
                    <Route path="/Message" element={<MessageList />} />
                    <Route path="/message/:id" element={<Message />} />
                    <Route path="/Contacts" element={<Contacts />} />
                    <Route path="/:id" element={<UserProfile />} />
                    <Route
                        path="/edit-profile"
                        element={
                            <PrivateRoute>
                                <EditProfile />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/groups" element={<Groups />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/Player" element={<Player />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    {/* Пример защищённого маршрута */}
                    <Route
                      path="/protected"
                      element={
                        <PrivateRoute>
                          <ProtectedComponent />
                        </PrivateRoute>
                      }
                    />
                  </Routes>
                  <ToastContainer /> {/* Добавляем ToastContainer здесь */}
                </Layout>
              </MessageProvider>
            </PlayerProvider>
          </ThemeProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
