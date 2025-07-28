import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useSuggestionStore } from '@/store/suggestionStore';

const { FiChevronDown, FiSearch, FiTrendingUp } = FiIcons;

const SuggestionInput = ({ 
  category, 
  value, 
  onChange, 
  placeholder, 
  className = '',
  required = false,
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getSuggestionsByCategory, searchSuggestions, incrementUsage } = useSuggestionStore();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const suggestions = searchQuery 
    ? searchSuggestions(category, searchQuery)
    : getSuggestionsByCategory(category);

  const filteredSuggestions = suggestions.slice(0, 8); // Limit to 8 suggestions

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSearchQuery(newValue);
    setIsOpen(true);
  };

  const handleSuggestionSelect = (suggestion) => {
    onChange(suggestion.value);
    incrementUsage(suggestion.id);
    setIsOpen(false);
    setSearchQuery('');
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setSearchQuery(value || '');
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value || ''}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-10 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent ${className}`}
          required={required}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-nordic-400 hover:text-nordic-600"
        >
          <SafeIcon 
            icon={FiChevronDown} 
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && filteredSuggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-nordic-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {searchQuery && (
              <div className="px-3 py-2 bg-nordic-50 border-b border-nordic-100">
                <div className="flex items-center gap-2 text-sm text-nordic-600">
                  <SafeIcon icon={FiSearch} className="w-4 h-4" />
                  <span>Suggerimenti per "{searchQuery}"</span>
                </div>
              </div>
            )}
            
            <div className="py-1">
              {filteredSuggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.id}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-sage-50 focus:bg-sage-50 focus:outline-none transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-nordic-800 truncate">
                        {suggestion.value}
                      </p>
                      {suggestion.description && (
                        <p className="text-xs text-nordic-500 truncate mt-1">
                          {suggestion.description}
                        </p>
                      )}
                    </div>
                    {suggestion.usage > 0 && (
                      <div className="flex items-center gap-1 ml-3">
                        <SafeIcon icon={FiTrendingUp} className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                          {suggestion.usage}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {searchQuery && filteredSuggestions.length === 0 && (
              <div className="px-4 py-3 text-sm text-nordic-500 text-center">
                Nessun suggerimento trovato
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuggestionInput;