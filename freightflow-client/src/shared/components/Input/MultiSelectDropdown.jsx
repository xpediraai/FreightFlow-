import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import clsx from 'clsx';
import './MultiSelectDropdown.css';

/**
 * MultiSelectDropdown component
 * 
 * @param {Array<string | { label: string, value: string }>} options - List of available options
 * @param {Array<string>} value - Array of currently selected values
 * @param {Function} onChange - Change handler receiving the updated array of values
 * @param {string} placeholder - Placeholder text when nothing is selected
 * @param {boolean} disabled - Whether the control is disabled
 * @param {boolean|string} error - Error flag or message
 * @param {boolean} searchable - Whether to show search filter inside dropdown
 * @param {string} className - Optional container class
 * @param {object} style - Custom inline styles for container
 */
const MultiSelectDropdown = ({
  options = [],
  value = [],
  onChange,
  placeholder = '-- Select --',
  disabled = false,
  error = false,
  searchable = true,
  className = '',
  style = {},
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to { label, value } format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { label: opt.label || opt.value, value: opt.value };
    }
    return { label: String(opt), value: String(opt) };
  });

  // Ensure current value is always an array
  const selectedValues = Array.isArray(value)
    ? value
    : value
    ? [String(value)]
    : [];

  // Filtered options based on search term
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const toggleOption = (optionValue, e) => {
    e && e.stopPropagation();
    if (disabled) return;

    let newSelected;
    if (selectedValues.includes(optionValue)) {
      newSelected = selectedValues.filter((v) => v !== optionValue);
    } else {
      newSelected = [...selectedValues, optionValue];
    }

    onChange && onChange(newSelected);
  };

  const removeChip = (optionValue, e) => {
    e.stopPropagation();
    if (disabled) return;
    const newSelected = selectedValues.filter((v) => v !== optionValue);
    onChange && onChange(newSelected);
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    if (disabled) return;
    onChange && onChange([]);
  };

  const handleSelectAll = (e) => {
    e.stopPropagation();
    if (disabled) return;
    const allFilteredValues = filteredOptions.map((opt) => opt.value);
    const combined = Array.from(new Set([...selectedValues, ...allFilteredValues]));
    onChange && onChange(combined);
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div
      ref={containerRef}
      id={id}
      className={clsx('multiselect-container', className)}
      style={style}
    >
      <div
        className={clsx('multiselect-trigger', {
          focused: isOpen,
          'is-invalid': !!error,
          disabled: disabled,
        })}
        onClick={handleTriggerClick}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isOpen) {
            e.preventDefault();
            handleTriggerClick();
          } else if (e.key === 'Escape' && isOpen) {
            setIsOpen(false);
          }
        }}
      >
        <div className="multiselect-values">
          {selectedValues.length === 0 ? (
            <span className="multiselect-placeholder">{placeholder}</span>
          ) : (
            selectedValues.map((val) => {
              const matched = normalizedOptions.find((opt) => opt.value === val);
              const label = matched ? matched.label : val;
              return (
                <span key={val} className="multiselect-chip">
                  <span>{label}</span>
                  {!disabled && (
                    <button
                      type="button"
                      className="multiselect-chip-remove"
                      onClick={(e) => removeChip(val, e)}
                      title={`Remove ${label}`}
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              );
            })
          )}
        </div>

        <div className="multiselect-actions">
          {selectedValues.length > 0 && !disabled && (
            <button
              type="button"
              className="multiselect-clear-btn"
              onClick={handleClearAll}
              title="Clear all"
            >
              <X size={14} />
            </button>
          )}
          <span className={clsx('multiselect-arrow', { open: isOpen })}>
            <ChevronDown size={16} />
          </span>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="multiselect-dropdown">
          {searchable && (
            <div className="multiselect-search-wrapper">
              <Search size={14} className="multiselect-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="multiselect-search-input"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="multiselect-header-actions">
            <span className="multiselect-header-count">
              {selectedValues.length} of {normalizedOptions.length} selected
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="multiselect-header-btn"
                onClick={handleSelectAll}
              >
                Select All
              </button>
              {selectedValues.length > 0 && (
                <button
                  type="button"
                  className="multiselect-header-btn"
                  onClick={handleClearAll}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="multiselect-options-list">
            {filteredOptions.length === 0 ? (
              <div className="multiselect-no-options">No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    className={clsx('multiselect-option', { selected: isSelected })}
                    onClick={(e) => toggleOption(opt.value, e)}
                  >
                    <div className="multiselect-checkbox">
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </div>
                    <span className="multiselect-option-label">{opt.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
