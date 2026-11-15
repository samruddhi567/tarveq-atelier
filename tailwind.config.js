/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // TARVEQ ATELIER Brand Design System
        burgundy: {
          DEFAULT: '#7C3031', // Primary Burgundy
          hover: '#672728',
          light: '#F5ECEB',
          border: '#D8A7A8',
          dark: '#521F20',
        },
        ivory: {
          DEFAULT: '#F8F4EC', // Warm Ivory
          light: '#FCFAF5',
          dark: '#EFE8DA',
        },
        gold: {
          DEFAULT: '#B58C50', // Muted Gold
          hover: '#9E773F',
          light: '#FAF5ED',
          border: '#D9C4A1',
        },
        charcoal: {
          DEFAULT: '#29211F', // Deep Charcoal
          muted: '#5C4F4B',
          soft: '#857672',
          border: '#3D3330',
        },
        beige: {
          DEFAULT: '#E8E0D3', // Soft Beige
          light: '#F3EFE7',
          dark: '#D8CDBC',
          border: '#D0C3AF',
        },
        sage: {
          DEFAULT: '#54715F', // Sage Green
          hover: '#435B4C',
          light: '#EDF3EF',
          border: '#A7BEB0',
          dark: '#35483C',
        },
        // Aliases for backwards compatibility with existing UI components
        lotus: {
          DEFAULT: '#F8F4EC',
          light: '#FCFAF5',
          dark: '#EFE8DA',
        },
        silk: {
          DEFAULT: '#E8E0D3',
          light: '#F3EFE7',
          dark: '#D8CDBC',
        },
        tamarind: {
          DEFAULT: '#29211F',
          soft: '#5C4F4B',
          muted: '#857672',
        },
        kumkum: {
          DEFAULT: '#7C3031',
          hover: '#672728',
          light: '#F5ECEB',
          border: '#D8A7A8',
        },
        banarasi: {
          DEFAULT: '#54715F',
          light: '#EDF3EF',
          border: '#A7BEB0',
          dark: '#35483C',
        },
        terracotta: {
          DEFAULT: '#7C3031',
          hover: '#672728',
          light: '#F5ECEB',
          border: '#D8A7A8',
        },
        sand: {
          DEFAULT: '#E8E0D3',
          light: '#F3EFE7',
          border: '#D0C3AF',
          dark: '#D8CDBC',
        },
        espresso: {
          DEFAULT: '#29211F',
          muted: '#5C4F4B',
          soft: '#857672',
          border: '#3D3330',
        },
        olive: {
          DEFAULT: '#54715F',
          light: '#EDF3EF',
          border: '#A7BEB0',
          dark: '#35483C',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-luxe': '0 4px 20px -2px rgba(41, 33, 31, 0.05), 0 2px 6px -1px rgba(41, 33, 31, 0.03)',
        'elevated-luxe': '0 12px 32px -4px rgba(41, 33, 31, 0.08), 0 4px 12px -2px rgba(41, 33, 31, 0.04)',
        'modal-luxe': '0 24px 48px -12px rgba(41, 33, 31, 0.25)',
      }
    },
  },
  plugins: [],
}
