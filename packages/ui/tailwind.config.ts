import typography from '@tailwindcss/typography';

const config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/layout/**/*.{js,ts,jsx,tsx}',
    './src/modules/**/*.{js,ts,jsx,tsx}',
    './node_modules/destiny/dist/components/**/*.{js,ts}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/tanstack-table/**/*.{ts,tsx}',
    '../../packages/chat/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter Variable',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Open Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        GRAY_20: 'var(--GRAY_20)',
        GRAY_50: 'var(--GRAY_50)',
        GRAY_70: 'var(--GRAY_70)',
        GRAY_80: 'var(--GRAY_80)',
        GRAY_100: 'var(--GRAY_100)',
        GRAY_200: 'var(--GRAY_200)',
        GRAY_300: 'var(--GRAY_300)',
        GRAY_400: 'var(--GRAY_400)',
        GRAY_450: 'var(--GRAY_450)',
        GRAY_500: 'var(--GRAY_500)',
        GRAY_600: 'var(--GRAY_600)',
        GRAY_700: 'var(--GRAY_700)',
        GRAY_800: 'var(--GRAY_800)',
        GRAY_900: 'var(--GRAY_900)',
        GRAY_950: 'var(--GRAY_950)',
        GRAY_1000: 'var(--GRAY_1000)',
        BG_GRAY_1: 'var(--BG_GRAY_1)',
        BG_GRAY_2: 'var(--BG_GRAY_2)',
        BG_GRAY_3: 'var(--BG_GRAY_3)',
        BG_GRAY_4: 'var(--BG_GRAY_4)',
        BG_GRAY_5: 'var(--BG_GRAY_5)',
        BORDER_GRAY_400: 'var(--BORDER_GRAY_400)',
        BLUE_50: 'var(--BLUE_50)',
        BLUE_100: 'var(--BLUE_100)',
        BLUE_200: 'var(--BLUE_200)',
        BLUE_300: 'var(--BLUE_300)',
        BLUE_400: 'var(--BLUE_400)',
        BLUE_450: 'var(--BLUE_450)',
        BLUE_500: 'var(--BLUE_500)',
        BLUE_600: 'var(--BLUE_600)',
        BLUE_700: 'var(--BLUE_700)',
        BLUE_800: 'var(--BLUE_800)',
        BLUE_900: 'var(--BLUE_900)',
        BLUE_1000: 'var(--BLUE_1000)',
        GREEN_100: 'var(--GREEN_100)',
        GREEN_200: 'var(--GREEN_200)',
        GREEN_300: 'var(--GREEN_300)',
        GREEN_400: 'var(--GREEN_400)',
        GREEN_500: 'var(--GREEN_500)',
        GREEN_600: 'var(--GREEN_600)',
        GREEN_700: 'var(--GREEN_700)',
        GREEN_800: 'var(--GREEN_800)',
        GREEN_900: 'var(--GREEN_900)',
        GREEN_1000: 'var(--GREEN_1000)',
        ORANGE_100: 'var(--ORANGE_100)',
        ORANGE_200: 'var(--ORANGE_200)',
        ORANGE_300: 'var(--ORANGE_300)',
        ORANGE_400: 'var(--ORANGE_400)',
        ORANGE_500: 'var(--ORANGE_500)',
        ORANGE_600: 'var(--ORANGE_600)',
        ORANGE_700: 'var(--ORANGE_700)',
        ORANGE_800: 'var(--ORANGE_800)',
        ORANGE_900: 'var(--ORANGE_900)',
        ORANGE_1000: 'var(--ORANGE_1000)',
        RED_100: 'var(--RED_100)',
        RED_200: 'var(--RED_200)',
        RED_300: 'var(--RED_300)',
        RED_400: 'var(--RED_400)',
        RED_500: 'var(--RED_500)',
        RED_600: 'var(--RED_600)',
        RED_700: 'var(--RED_700)',
        RED_800: 'var(--RED_800)',
        RED_900: 'var(--RED_900)',
        RED_1000: 'var(--RED_1000)',
        VIOLET_100: 'var(--VIOLET_100)',
        BACKGROUND_GRAY_1: 'var(--BG_GRAY_1)',
        BACKGROUND_GRAY_2: 'var(--BG_GRAY_2)',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          background: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        gray: {
          '20': 'var(--GRAY_20)',
          '50': 'var(--GRAY_50)',
          '70': 'var(--GRAY_70)',
          '80': 'var(--GRAY_80)',
          '100': 'var(--GRAY_100)',
          '150': '#F1F0F0',
          '200': 'var(--GRAY_200)',
          '300': 'var(--GRAY_300)',
          '400': 'var(--GRAY_400)',
          '500': 'var(--GRAY_500)',
          '550': 'var(--GRAY_550)',
          '600': 'var(--GRAY_600)',
          '700': 'var(--GRAY_700)',
          '800': 'var(--GRAY_800)',
          '900': 'var(--GRAY_900)',
          '950': 'var(--GRAY_950)',
          '1000': 'var(--GRAY_1000)',
        },
        'bg-gray': {
          '1': 'var(--BG_GRAY_1)',
          '2': 'var(--BG_GRAY_2)',
          '3': 'var(--BG_GRAY_3)',
          '4': 'var(--BG_GRAY_4)',
          '5': 'var(--BG_GRAY_5)',
        },
        'border-gray': {
          '400': 'var(--BORDER_GRAY_400)',
        },
        blue: {
          '50': 'var(--BLUE_50)',
          '100': 'var(--BLUE_100)',
          '150': '#DFF0FF',
          '200': 'var(--BLUE_200)',
          '300': 'var(--BLUE_300)',
          '400': 'var(--BLUE_400)',
          '500': 'var(--BLUE_500)',
          '600': 'var(--BLUE_600)',
          '700': 'var(--BLUE_700)',
          '800': 'var(--BLUE_800)',
          '900': 'var(--BLUE_900)',
          '1000': 'var(--BLUE_1000)',
        },
        yellow: {
          '100': '#FFF3C9',
        },
        violet: {
          '100': '#E3E5FB',
        },
        pink: {
          '100': '#FFB6D5',
        },
        green: {
          '100': 'var(--GREEN_100)',
          '150': '#E2F1E0',
          '200': 'var(--GREEN_200)',
          '300': 'var(--GREEN_300)',
          '400': 'var(--GREEN_400)',
          '500': 'var(--GREEN_500)',
          '600': 'var(--GREEN_600)',
          '700': 'var(--GREEN_700)',
          '800': 'var(--GREEN_800)',
          '900': 'var(--GREEN_900)',
          '1000': 'var(--GREEN_1000)',
        },
        orange: {
          '100': 'var(--ORANGE_100)',
          '150': '#FAE5D6',
          '200': 'var(--ORANGE_200)',
          '300': 'var(--ORANGE_300)',
          '400': 'var(--ORANGE_400)',
          '500': 'var(--ORANGE_500)',
          '600': 'var(--ORANGE_600)',
          '700': 'var(--ORANGE_700)',
          '800': 'var(--ORANGE_800)',
          '900': 'var(--ORANGE_900)',
          '1000': 'var(--ORANGE_1000)',
        },
        red: {
          '100': 'var(--RED_100)',
          '200': 'var(--RED_200)',
          '300': 'var(--RED_300)',
          '350': '#FBE3E5',
          '400': 'var(--RED_400)',
          '500': 'var(--RED_500)',
          '600': 'var(--RED_600)',
          '700': 'var(--RED_700)',
          '800': 'var(--RED_800)',
          '900': 'var(--RED_900)',
          '950': 'var(--RED_950)',
          '1000': 'var(--RED_1000)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2.5': '10px',
        '3.5': '14px',
        '4.5': '18px',
      },
      boxShadow: {
        overlay: '1px 2px 10px rgba(197, 220, 255, 0.54)',
        'input-outline-shadow': '0px 0px 0px 3px var(--GRAY_400)',
        'input-error-outline-shadow': '0px 0px 0px 3px var(--RED_100)',
        'table-filter-menu': '1px 2px 10px 0px #A6A6A61A',
        'page-bottom-bar': '0px -4px 0px 0px #00000005',
        'side-drawer': '-3px 0px 0px 0px #00000005',
        'side-drawer-inner': '10px 0px 50px 0px #0000000d',
        'menu-list': '1px 2px 20px 0px #0000001A',
        'select-account-dropdown': '1px 2px 10px 0px #a6a6a61a',
        'menu-shadow': 'var(--menu-shadow)',
        'chart-highlight': '0px 0px 0px 3px var(--GRAY_200)',
        'chatbot-shadow': '0px 2px 9.5px 1px #4141411F',
        smooth:
          '0 15px 80px 0 rgba(0, 0, 0, 0.05), 0 6.267px 33.422px 0 rgba(0, 0, 0, 0.04), 0 3.35px 17.869px 0 rgba(0, 0, 0, 0.03), 0 1.878px 10.017px 0 rgba(0, 0, 0, 0.03), 0 0.998px 5.32px 0 rgba(0, 0, 0, 0.02), 0 0.415px 2.214px 0 rgba(0, 0, 0, 0.01)',
        'keyboard-keys-shadow': '-1px -1px 0.25px 0px #00000017 inset',
      },
      fontSize: {
        '8': [
          '0.5rem',
          {
            lineHeight: '0.625rem',
          },
        ],
        '9': [
          '0.5625rem',
          {
            lineHeight: '0.75rem',
          },
        ],
        '10': [
          '0.625rem',
          {
            lineHeight: '0.813rem',
          },
        ],
        '11': [
          '0.6875rem',
          {
            lineHeight: '0.875rem',
          },
        ],
        '12': [
          '0.75rem',
          {
            lineHeight: '0.9375rem',
          },
        ],
        '13': [
          '0.8125rem',
          {
            lineHeight: '1rem',
          },
        ],
        '14': [
          '0.875rem',
          {
            lineHeight: '1.188rem',
          },
        ],
        '15': [
          '0.9375rem',
          {
            lineHeight: '1.1875rem',
          },
        ],
        '16': [
          '1rem',
          {
            lineHeight: '1.313rem',
          },
        ],
        '17': [
          '1.0625rem',
          {
            lineHeight: '1.3125rem',
          },
        ],
        '18': [
          '1.125rem',
          {
            lineHeight: '1.438rem',
          },
        ],
        '19': [
          '1.1875rem',
          {
            lineHeight: '1.5rem',
          },
        ],
        '20': [
          '1.25rem',
          {
            lineHeight: '1.688rem',
          },
        ],
        '21': [
          '1.313rem',
          {
            lineHeight: '1.625rem',
          },
        ],
        '22': [
          '1.375rem',
          {
            lineHeight: '1.75rem',
          },
        ],
        '24': [
          '1.5rem',
          {
            lineHeight: '2rem',
          },
        ],
        '28': [
          '1.75rem',
          {
            lineHeight: '2.188rem',
          },
        ],
        '32': [
          '2rem',
          {
            lineHeight: '2.625rem',
          },
        ],
        '36': [
          '2.25rem',
          {
            lineHeight: '2.813rem',
          },
        ],
        '40': [
          '2.5rem',
          {
            lineHeight: '3.125rem',
          },
        ],
      },
      fontWeight: {
        '300': '300',
        '400': '400',
        '450': '450',
        '500': '500',
        '550': '550',
        '600': '600',
        '700': '700',
        '800': '800',
      },
      height: {
        '15': '60px',
        '18': '72px',
        '105': '420px',
        '115': '460px',
        '0.25': '1px',
        '3.5': '14px',
        '4.5': '18px',
        '5.5': '22px',
        '7.5': '30px',
        '8.5': '34px',
        '11.5': '42px',
        '62.5': '250px',
        '107.5': '430px',
        '112.5': '450px',
        topbar: '72px',
        body: 'calc(100vh - 72px)',
      },
      maxHeight: {
        '100': '400px',
        '105': '420px',
        '125': '500px',
        '10.5': '42px',
      },
      width: {
        '18': '72px',
        '25': '100px',
        '30': '120px',
        '34': '136px',
        '36': '144px',
        '50': '200px',
        '55': '220px',
        '60': '240px',
        '65': '260px',
        '75': '300px',
        '100': '400px',
        '104': '416px',
        '0.25': '1px',
        '3.5': '14px',
        '4.5': '18px',
        '5.5': '22px',
        '7.5': '30px',
        '12.5': '50px',
        '13.5': '54px',
        '34.5': '138px',
        '42.5': '170px',
        '64.5': '258px',
        '69.5': '278px',
        '87.5': '350px',
        content: 'calc(100vw - 272px)',
        sideDrawer: '480px',
        sideDrawerMedium: '500px',
        sideDrawerLarge: '600px',
      },
      maxWidth: {
        '40': '160px',
        '55': '220px',
        '60': '240px',
        '75': '300px',
        '94': '376px',
        '104': '416px',
        '145': '580px',
        '360': '1440px',
        formLayout: '438px',
        '95.5': '382px',
      },
      minWidth: {
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '14': '56px',
        '25': '100px',
        '32': '128px',
        '40': '160px',
        '50': '200px',
        '64': '256px',
        '75': '300px',
        '83': '332px',
        '86': '344px',
        '4.5': '18px',
        sidebar: '200px',
        sidebarmini: '60px',
        '17.5': '70px',
      },
      minHeight: {
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '9': '36px',
        '12': '48px',
      },
      lineHeight: {
        '3.5': '14px',
        '4.5': '18px',
      },
      margin: {
        '19': '76px',
        '38': '152px',
        '45': '180px',
        '0.25': '1px',
        '1.5': '6px',
        '4.5': '18px',
        '5.5': '22px',
        '2.5': '10px',
        '12.5': '50px',
        '13.5': '54px',
        '17.5': '70px',
      },
      inset: {
        '12.5': '50px',
        '13.5': '54px',
        '37.5': '150px',
      },
      padding: {
        '18': '72px',
        '34': '136px',
        '0.5': '2.5px',
        '2.5': '10px',
        '4.5': '18px',
        '5.5': '22px',
        '6.5': '26px',
        '8.5': '34px',
      },
      marginTop: {
        '5.5': '22px',
      },
      screens: {
        '2xl_custom': {
          max: '1440px',
        },
      },
      borderWidth: {
        '0.5': '0.5px',
      },
      zIndex: {
        '1000': '1000',
      },
      backgroundImage: {
        'faded-white':
          'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.8) 5%, white 10%, white 80%, white 90%, rgba(255,255,255,0.8) 95%, transparent 100%)',
        'gradient-to-white': 'linear-gradient(90deg, rgba(255,255,255,0) 0%, #FFF 100%)',
        'gradient-to-transparent': 'linear-gradient(0deg, #FFF 50%, rgba(255,255,255,0) 100%)',
        'chatbot-gradient': 'repeating-linear-gradient(135deg, #e5e5e5 0, #e5e5e5 1px, white 1px, white 6px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-in-from-center': {
          '0%': { transform: 'translate(-50%, -50%) scale(0.95)', opacity: '0' },
          '100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '1' },
        },
        'slide-out-to-center': {
          '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -50%) scale(0.95)', opacity: '0' },
        },
        'reverse-spin': {
          from: {
            transform: 'rotate(360deg)',
          },
        },
        'file-upload': {
          from: {
            opacity: '0',
            marginTop: '-56px',
            zIndex: '-1',
          },
          to: {
            opacity: '1',
            marginTop: '0px',
            zIndex: '-1',
          },
        },
        opacity: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        rightSideDrawerTransition: {
          '0%': {
            right: '-50vw',
          },
          '100%': {
            right: '0px',
          },
        },
        bottomSideDrawerTransition: {
          '0%': {
            bottom: '-50vw',
          },
          '100%': {
            bottom: '0px',
          },
        },
        rightSideDrawerUnMountTransition: {
          '0%': {
            right: '0px',
          },
          '100%': {
            right: '-50vw',
          },
        },
        bottomSideDrawerUnMountTransition: {
          '0%': {
            bottom: '0px',
          },
          '100%': {
            bottom: '-50vw',
          },
        },
        'shimmer-round': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
        position: {
          '0%': {
            left: '1px',
          },
          '50%': {
            left: '6px',
          },
          '100%': {
            left: '1px',
          },
        },
        'shimmer-skeleton': {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        slide: {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(200%)',
          },
        },
        slideInOut: {
          '0%': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          '10%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
          '90%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
        },
        slideIn: {
          '0%': {
            transform: 'translateY(-100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0%)',
            opacity: '1',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'fade-out': {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in-from-center': 'slide-in-from-center 0.2s ease-out',
        'slide-out-to-center': 'slide-out-to-center 0.2s ease-out',
        opacity: 'opacity 0.3s ease-in-out',
        'file-upload': 'file-upload 0.5s linear ',
        'reverse-spin': 'reverse-spin 1.5s linear infinite',
        'right-side-drawer-mount': 'rightSideDrawerTransition 0.4s normal forwards ease-out',
        'bottom-side-drawer-mount': 'bottomSideDrawerTransition 0.4s normal forwards ease-out',
        'right-side-drawer-un-mount': 'rightSideDrawerUnMountTransition 0.4s normal forwards ease-out',
        'bottom-side-drawer-un-mount': 'bottomSideDrawerUnMountTransition 0.4s normal forwards ease-out',
        'shimmer-round': 'shimmer-round 1.5s infinite linear',
        width: 'position 1.5s linear infinite',
        slide: 'slide 1.5s linear infinite',
        'slide-in-out': 'slideInOut 5s cubic-bezier(0.85, 0, 0.15, 1) forwards',
        'slide-in': 'slideIn 0.5s ease-in-out',
        'fade-in': 'fade-in 0.5s ease-in-out',
        'fade-out': 'fade-out 0.5s ease-in-out 0.3s',
      },
    },
  },
  plugins: [typography],
};

export default config;
