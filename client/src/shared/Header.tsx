import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Settings, 
  Plus,
  Sparkles,
  Gem,
  X,
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Trash2,
  Shield,
  Flag,
  MapPin,
  LogOut,
  Target,
  Menu
} from 'lucide-react';
import { useAuth } from '.././contexts/AuthContext';
import { realDonorSearchEngine } from '.././services/realDonorSearchEngine';
import NotificationCenter from '../components/NotificationCenter';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const [userCountry, setUserCountry] = useState<string>('');
  const [countryFlag, setCountryFlag] = useState<string>('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const getBrowserCountry = () => {
    try {
      // Try to get country from browser locale
      const locale = navigator.language || navigator.languages?.[0] || 'en-US';
      const countryCode = locale.split('-')[1]?.toUpperCase();
      
      // Map common country codes to country names and flags
      const countryMap: { [key: string]: { name: string; flag: string } } = {
        'US': { name: 'United States', flag: '🇺🇸' },
        'UG': { name: 'Uganda', flag: '🇺🇬' },
        'KE': { name: 'Kenya', flag: '🇰🇪' },
        'SS': { name: 'South Sudan', flag: '🇸🇸' },
        'GB': { name: 'United Kingdom', flag: '🇬🇧' },
        'DE': { name: 'Germany', flag: '🇩🇪' },
        'FR': { name: 'France', flag: '🇫🇷' },
        'CA': { name: 'Canada', flag: '🇨🇦' },
        'AU': { name: 'Australia', flag: '🇦🇺' },
        'IN': { name: 'India', flag: '🇮🇳' },
        'ZA': { name: 'South Africa', flag: '🇿🇦' },
        'NG': { name: 'Nigeria', flag: '🇳🇬' },
        'GH': { name: 'Ghana', flag: '🇬🇭' },
        'ET': { name: 'Ethiopia', flag: '🇪🇹' },
        'TZ': { name: 'Tanzania', flag: '🇹🇿' },
        'RW': { name: 'Rwanda', flag: '🇷🇼' }
      };
      
      if (countryCode && countryMap[countryCode]) {
        return { 
          code: countryCode, 
          name: countryMap[countryCode].name, 
          flag: countryMap[countryCode].flag 
        };
      }
      
      // Default to Uganda for East African focus
      return { code: 'UG', name: 'Uganda', flag: '🇺🇬' };
    } catch (error) {
      return null;
    }
  };

  const setDefaultCountry = () => {
    setUserCountry('Global');
    setCountryFlag('🌍');
  };

  const detectUserCountry = async () => {
    try {
      // Get country from search engine (which has better fallbacks)
      const country = realDonorSearchEngine.getUserCountry();
      if (country) {
        setUserCountry(country);
        const countryCode = realDonorSearchEngine.getCountryCode();
        setCountryFlag(realDonorSearchEngine.getFlagEmoji(countryCode));
        return;
      }
      
      // Try to detect from browser locale as fallback
      const browserCountry = getBrowserCountry();
      if (browserCountry) {
        setUserCountry(browserCountry.name);
        setCountryFlag(browserCountry.flag);
        console.log('User country detected:', browserCountry.code);
        return;
      }
      
      // Final fallback to default
      setDefaultCountry();
    } catch (error) {
      console.warn('Country detection failed, using default:', error);
      setDefaultCountry();
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Detect user's country
    detectUserCountry();
  }, [isAuthenticated]);

  const getFlagEmoji = (countryCode: string) => {
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch (error) {
      console.warn('Error generating flag emoji:', error);
      return '🌍'; // Fallback to world emoji
    }
  };



  const handleLogout = () => {
    logout();
    navigate('/landing');
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-gradient-to-r from-white to-blue-50 shadow-sm z-50 border-b border-gray-200"
    >
      <div className="flex items-center justify-between h-full px-3 sm:px-4 md:px-6">
        {/* Logo */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 sm:space-x-3"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Granada</span>
        </motion.button>

        {/* Mobile Right Side */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Mobile Credits */}
          {user && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <Gem className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">{user.credits || 0}</span>
            </div>
          )}
          
          {/* Mobile Notifications */}
          <NotificationCenter userId={user?.id} showCount={true} className="md:hidden" />
          
          {/* Mobile User Menu */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-1 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg touch-target"
          >
            <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
          </motion.button>
        </div>

        {/* Right Side - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Country Flag */}
          {countryFlag && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
              <span className="text-lg" role="img" aria-label={`Flag of ${userCountry}`}>
                {countryFlag}
              </span>
              <span className="text-gray-700 text-sm hidden sm:inline">{userCountry}</span>
            </div>
          )}

          {/* Admin Link for Superusers */}
          {user?.is_superuser && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-100 border border-red-200 text-red-600 rounded-lg hover:bg-red-200 transition-all"
            >
              <Shield className="w-4 h-4" />
              <span className="font-medium">Admin</span>
            </motion.button>
          )}

          {/* Credits Display */}
          {user && (
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/credits')}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg cursor-pointer hover:shadow-md transition-all"
              >
                <Gem className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 font-semibold">{user.credits.toLocaleString()}</span>
                <span className="text-gray-600 text-sm">Credits</span>
              </motion.div>

              {user.isTrialUser && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 border border-blue-200 rounded-lg">
                  <span className="text-blue-600 text-sm">Trial: {user.trialDaysRemaining} days left</span>
                </div>
              )}
            </div>
          )}

          {/* Theme Selector removed due to context hierarchy */}

          {/* New Proposal Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/proposal-generator')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">New Proposal</span>
          </motion.button>

          {/* Notifications */}
          <NotificationCenter userId={user?.id} showCount={true} className="hidden md:block" />

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
            </motion.button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowUserMenu(false)}
                  className="fixed inset-0 z-40"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50"
                >
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Log Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-b border-gray-200 shadow-md"
        >
          <div className="p-4 space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.fullName || 'User'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Credits */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center space-x-2">
                <Gem className="w-5 h-5 text-emerald-500" />
                <span className="text-emerald-700 font-medium">{user?.credits.toLocaleString()} Credits</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  navigate('/credits');
                  setShowMobileMenu(false);
                }}
                className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm"
              >
                Buy More
              </motion.button>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate('/proposal-generator');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all"
              >
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-blue-700 font-medium">Create Proposal</span>
              </button>
              
              <button
                onClick={() => {
                  navigate('/donor-discovery');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-all"
              >
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-purple-700 font-medium">Find Donors</span>
              </button>
              
              <button
                onClick={() => {
                  navigate('/settings');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Settings</span>
              </button>
              
              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition-all"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-medium">Log Out</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;