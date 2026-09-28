module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      colors: {
        slate: {
          950: '#030712',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
