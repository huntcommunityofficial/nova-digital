/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
   theme: {
        extend: {
          // Add custom gradient directions
          backgroundImage: {
            'gradient-text-left': 'linear-gradient(to left, var(--tw-gradient-stops))',
          },
          // Add custom text shadow
          textShadow: {
            glow: '0 0 15px rgba(0, 238, 255, 0.7)',
          },
          // Add arbitrary gradient stops directly to the class if needed
          // This is often handled by Tailwind's default gradient plugin,
          // but explicitly defining the colors can be useful.
          // For this specific case, it's often easier to use the arbitrary value directly.
        },
      },
      plugins: [
        // You might need this plugin for background-clip, though newer Tailwind versions have it built-in
        // require('@tailwindcss/forms'), // Or other plugins if needed
        // For background-clip to be directly usable without arbitrary values:
        function({ addUtilities }) {
          addUtilities({
            '.bg-clip-text': {
              '-webkit-background-clip': 'text',
              'background-clip': 'text',
            },
          });
        },
        // For text-shadow if not already supported or you want specific names
        function({ addUtilities, theme }) {
          addUtilities({
            '.text-shadow-glow': {
              textShadow: theme('textShadow.glow'),
            },
          });
        },
      ],
    };