/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08111f',
        mist: '#e2f0ff',
        flame: '#ff6b2c',
        glow: '#8ee3ff'
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 20px 60px rgba(8, 17, 31, 0.22)'
      },
      backgroundImage: {
        mesh:
          'radial-gradient(circle at top left, rgba(142, 227, 255, 0.22), transparent 30%), radial-gradient(circle at top right, rgba(255, 107, 44, 0.24), transparent 25%), linear-gradient(135deg, #07111f 0%, #10213f 45%, #0c182e 100%)'
      }
    }
  },
  plugins: []
};
