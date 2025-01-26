module.exports = {
    content: [
      './src/**/*.{html,js,jsx,ts,tsx}', // Add paths to your source files
    ],
    theme: {
      extend: {
        keyframes: {
          flash: {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.5' },
          },
        },
        animation: {
          flash: 'flash 1s infinite',
        },
      },
    },
    plugins: [],
  };
  