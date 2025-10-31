import React from 'react';

/**
 * LoadingButton - Pulsante con stato di caricamento
 *
 * Features:
 * - Mostra spinner durante operazioni async
 * - Disabilitato automaticamente durante loading
 * - Supporta tutte le varianti (primary, danger, ghost)
 */
const LoadingButton = ({
  loading = false,
  disabled = false,
  children,
  onClick,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white disabled:hover:bg-blue-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:hover:bg-red-600',
    success: 'bg-green-600 hover:bg-green-700 text-white disabled:hover:bg-green-600',
    ghost: 'bg-transparent hover:bg-gray-100 hover:bg-gray-800 text-gray-700 text-gray-300',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:bg-blue-900/20',
  };

  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={finalClassName}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
};

export default React.memo(LoadingButton);
