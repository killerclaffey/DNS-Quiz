# DNS Knowledge Quiz 🎓

A comprehensive React component quiz application to test and improve your DNS and BIND 9 configuration knowledge. Perfect for learning DNS concepts for homelab setups, OKD/OpenShift deployments, and general DNS administration.

## Overview

This repository contains a single React component (`Quiz.jsx`) that implements a 50-question interactive DNS knowledge quiz. The component is self-contained and can be easily integrated into any React application.

## Features

- **50 Comprehensive DNS Questions** covering:
  - DNS fundamentals (A, AAAA, CNAME, MX, PTR, TXT, SOA records and more)
  - BIND 9 configuration and zone file management
  - OKD/OpenShift DNS requirements
  - DNS troubleshooting with `dig` and `nslookup`
  - Split-horizon DNS and views
  - DNSSEC and modern DNS security
  - DNS over HTTPS (DoH) and DNS over TLS (DoT)
  - Alternative DNS solutions (Unbound, Pi-hole, dnsmasq)
  - Public DNS providers (Cloudflare, Google, Quad9, AdGuard)

- **Randomized Domain Names** - Unique domains generated per session for generic examples

- **Detailed Explanations** - Comprehensive explanations with real-world context and practical examples

- **Progress Tracking** - Visual progress bar and score tracking

- **Responsive Design** - Built with Tailwind CSS for all devices

- **Instant Feedback** - See correct/incorrect answers with visual indicators

## Repository Contents

```
DNS-Quiz/
├── Quiz.jsx     # Main React component (all quiz logic and questions)
├── README.md    # This file
└── LICENSE      # MIT License
```

## Integration

To use this component in your React project:

1. Copy `Quiz.jsx` into your React application's components directory
2. Import and use it in your app:

```jsx
import DNSQuiz from './components/Quiz';

function App() {
  return <DNSQuiz />;
}
```

## Dependencies

The component requires:
- **React** (with `useState` and `useMemo` hooks)
- **Tailwind CSS** (for styling)
- **React Icons** (specifically `CheckCircle`, `XCircle`, `ArrowRight`, `RotateCcw`)

Make sure these are installed in your React project:

```bash
npm install react react-icons
npm install -D tailwindcss
```

## Component Props

The `DNSQuiz` component is self-contained and accepts no props. All state management and quiz logic is handled internally.

## How It Works

### Domain Generation
When the component mounts, it generates randomized domain names:
- Primary homelab domain: `[word].[tld]`
- OKD cluster subdomain: `okd.[primary domain]`
- Secondary domain: `[different word].[different tld]`
- Generic example domain: `[another word].[another tld]`

These domains are used throughout the quiz explanations, making each session unique.

### Quiz Flow
1. User reads a question with 4 multiple choice options
2. User clicks an answer
3. Component shows if correct/incorrect with visual feedback
4. Detailed explanation is displayed
5. User clicks "Next Question" to continue
6. After final question, results screen shows total score and personalized feedback
7. User can click "Try Again" to restart with newly randomized domains

## Quiz Topics Covered

- **DNS Records**: A, AAAA, CNAME, MX, PTR, TXT, SOA, NS, SRV, CAA, DS, DNAME, NAPTR
- **BIND 9**: Zone files, $ORIGIN, SOA records, zone transfers, views, forwarders, ACLs
- **OKD/OpenShift**: Critical DNS records (api, api-int, *.apps), wildcard routing
- **DNS Tools**: dig command options, nslookup usage, query types, server selection
- **DNS Security**: DNSSEC, DNS cache poisoning, CAA records, SPF/DKIM/DMARC
- **Modern Protocols**: DoH, DoT, privacy considerations
- **Alternative Solutions**: Unbound, Pi-hole, dnsmasq
- **Public DNS**: Cloudflare, Google, Quad9, AdGuard

## Styling

The component uses Tailwind CSS utility classes for styling. Ensure Tailwind is configured in your project's `tailwind.config.js` and `postcss.config.js`.

The quiz features:
- Gradient backgrounds (blue to indigo)
- Card-based layout with shadows
- Color-coded feedback (green for correct, red for incorrect)
- Responsive design that works on mobile and desktop
- Smooth transitions and animations

## Author

Created by **Ryan Claffey**

## License

MIT License - Feel free to use and modify for educational purposes

## Using This Component

### In a React App
```jsx
import DNSQuiz from './Quiz';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <DNSQuiz />
    </div>
  );
}
```

### Customization

To modify the quiz:
- Edit the `questions` array in `Quiz.jsx` to change or add questions
- Modify the `domains` generation logic to change how example domains are created
- Adjust Tailwind classes to change styling
- Modify component state handlers (`handleAnswer`, `handleNext`, `handleRestart`) to change behavior

## Learning Resources

- [BIND 9 Administrator's Reference Manual](https://bind9.readthedocs.io/)
- [RFC 1035 - Domain Names](https://tools.ietf.org/html/rfc1035)
- [Cloudflare DNS Learning](https://www.cloudflare.com/learning/dns/what-is-dns/)
- [OKD Documentation](https://docs.okd.io/)
- [DNSSEC Guide](https://www.dnssec.net/)

## Contributing

Found an issue or have a suggestion? Contributions are welcome:
- Report bugs or suggest new questions
- Improve question explanations
- Add new DNS topics
- Enhance the UI

Happy learning! 🚀
