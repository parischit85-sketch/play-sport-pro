// =============================================
// FILE: src/components/registration/AddressAutocomplete.jsx
// Google Places Autocomplete for address input
// =============================================
import React, { useEffect, useRef, useState } from 'react';

/**
 * Address autocomplete component using Google Places API
 * @param {string} value - Current address value
 * @param {Function} onChange - Callback when address changes
 * @param {Function} onAddressSelect - Callback with full address details
 * @param {string} placeholder - Input placeholder
 * @param {string} country - Country code for address restriction (default: IT)
 */
export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = 'Inserisci indirizzo...',
  country = 'IT',
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');

  // Load Google Places API
  useEffect(() => {
    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      return;
    }

    // Check if API key is configured
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      setError('Google Places API key not configured');
      console.error('Missing VITE_GOOGLE_PLACES_API_KEY in .env');
      return;
    }

    // Load script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=it`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      setError('Failed to load Google Places API');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      // Create autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: country },
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      });

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();

        if (!place || !place.address_components) {
          return;
        }

        // Parse address components
        const addressData = {
          formattedAddress: place.formatted_address || '',
          street: '',
          streetNumber: '',
          city: '',
          province: '',
          postalCode: '',
          country: '',
          latitude: place.geometry?.location?.lat() || null,
          longitude: place.geometry?.location?.lng() || null,
        };

        place.address_components.forEach((component) => {
          const types = component.types;

          if (types.includes('street_number')) {
            addressData.streetNumber = component.long_name;
          }
          if (types.includes('route')) {
            addressData.street = component.long_name;
          }
          if (types.includes('locality')) {
            addressData.city = component.long_name;
          }
          if (types.includes('administrative_area_level_2')) {
            addressData.province = component.short_name;
          }
          if (types.includes('postal_code')) {
            addressData.postalCode = component.long_name;
          }
          if (types.includes('country')) {
            addressData.country = component.short_name;
          }
        });

        // Combine street and number
        if (addressData.street && addressData.streetNumber) {
          addressData.fullStreet = `${addressData.street}, ${addressData.streetNumber}`;
        } else {
          addressData.fullStreet = addressData.street || '';
        }

        // Call callbacks
        onChange(place.formatted_address || '');
        if (onAddressSelect) {
          onAddressSelect(addressData);
        }
      });
    } catch (err) {
      console.error('Error initializing Google Places:', err);
      setError('Failed to initialize address autocomplete');
    }
  }, [isLoaded, country, onChange, onAddressSelect]);

  // Handle manual input
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  if (error) {
    // Fallback to regular input if API fails
    return (
      <div className="address-autocomplete">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="address-input"
        />
        <p className="api-error">⚠️ {error} - usando input manuale</p>
        <style jsx>{`
          .address-autocomplete {
            width: 100%;
          }

          .address-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--color-border, #ccc);
            border-radius: 6px;
            font-size: 1rem;
            transition: border-color 0.2s ease;
          }

          .address-input:focus {
            outline: none;
            border-color: var(--color-primary, #007bff);
          }

          .api-error {
            margin-top: 0.25rem;
            font-size: 0.75rem;
            color: var(--color-warning, #ffa500);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="address-autocomplete">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="address-input"
        disabled={!isLoaded}
      />
      {!isLoaded && <p className="loading-text">Caricamento autocomplete...</p>}

      <style jsx>{`
        .address-autocomplete {
          width: 100%;
        }

        .address-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border, #ccc);
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
          background-color: white;
        }

        .address-input:focus {
          outline: none;
          border-color: var(--color-primary, #007bff);
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .address-input:disabled {
          background-color: var(--color-bg-disabled, #f5f5f5);
          cursor: not-allowed;
        }

        .loading-text {
          margin-top: 0.25rem;
          font-size: 0.75rem;
          color: var(--color-text-light, #666);
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .address-input {
            background-color: var(--color-bg-dark, #2a2a2a);
            color: var(--color-text-dark, #e0e0e0);
            border-color: var(--color-border-dark, #444);
          }

          .address-input:disabled {
            background-color: var(--color-bg-dark-disabled, #1a1a1a);
          }
        }
      `}</style>
    </div>
  );
}

