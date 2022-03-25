const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}"
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },

    fontFamily: {
      sans: ['Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
      relax: ['Marcellus'],
      button: ['DMSerifText-Regular', 'BreeSerif'],
      title: ['BreeSerif']
    },
    extend: {
      colors: {

      },
      minWidth: {
        'nav': '230px'
      },
      maxWidth: {
        'nav': '300px'
      }
    },
  },
  plugins: [
    // https://tailwindcss.com/docs/plugins
    // addUtilities, addComponents, e, prefix, config
    plugin(({ addComponents }) => {
      addComponents({
        '.absolute-center': {
          'position': 'absolute',
          'top': '50%',
          'left': '50%',
          'transform': 'translate(-50%, -50%)'
        },
        '.primary-bg': {
          "background-color": "rgb(15 23 42 / 1)"
        },
        '.primary-bg-09': {
          "background-color": "rgb(15 23 42 / 0.9)"
        }
      })
    })
  ],
  // https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually
  // support light mode, dark mode, as well as respecting the operating system preference:
  darkMode: 'class' // false, media, class
}
