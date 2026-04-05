import { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, logout } from '../store/slices/authSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe());
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, logout: () => dispatch(logout()) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);