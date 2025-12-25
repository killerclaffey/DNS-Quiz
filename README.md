# DNS Knowledge Quiz 🎓

An interactive, comprehensive quiz application to test and improve your DNS and BIND 9 configuration knowledge. Perfect for learning DNS concepts for homelab setups, OKD/OpenShift deployments, and general DNS administration.

## Features

- **50 Comprehensive Questions** covering:
  - DNS fundamentals (A, AAAA, CNAME, MX, PTR, TXT, SOA records)
  - BIND 9 configuration and zone file management
  - OKD/OpenShift DNS requirements
  - DNS troubleshooting with `dig` and `nslookup`
  - Split-horizon DNS and views
  - DNSSEC and modern DNS security
  - DNS over HTTPS (DoH) and DNS over TLS (DoT)
  - Alternative DNS solutions (Unbound, Pi-hole, dnsmasq)
  - Public DNS providers (Cloudflare, Google, Quad9, AdGuard)

- **Randomized Domain Names** - Unique domains generated per session using combinations of domain words and TLDs, making the quiz reusable without being tied to specific examples

- **Detailed Explanations** - Each question includes comprehensive explanations with real-world context and practical examples

- **Progress Tracking** - Visual progress bar and score tracking as you progress through the quiz

- **Responsive Design** - Built with Tailwind CSS for beautiful, responsive UI on all devices

- **Instant Feedback** - See correct/incorrect answers immediately with visual indicators

- **Performance Scoring** - Final score with personalized feedback based on your performance

## Technologies

- **React** - UI framework
- **Tailwind CSS** - Styling and responsive design
- **Vite** - Build tool and dev server
- **React Icons** - UI icons

## Installation

### Prerequisites
- Node.js 16+ and npm (or yarn)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/killerclaffey/DNS-Quiz.git
cd DNS-Quiz
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in your terminal (typically `http://localhost:5173`)

## Usage

1. **Start the Quiz** - Click the first question to begin
2. **Select Answers** - Click on one of the four options to select your answer
3. **Review Explanations** - After selecting, the quiz shows if you're correct and provides a detailed explanation
4. **Progress** - Click "Next Question" to continue through the quiz
5. **See Results** - After the final question, view your final score and performance feedback
6. **Restart** - Click "Try Again" to retake the quiz with newly randomized domains

## Quiz Topics

### DNS Fundamentals
- Record types and their purposes (A, AAAA, CNAME, MX, TXT, PTR, SOA, NS, SRV, CAA, DS, DNAME, NAPTR)
- DNS resolution process (recursive vs. iterative queries)
- TTL and caching behavior
- FQDN structure and syntax

### BIND 9 Configuration
- Zone files and $ORIGIN directive
- The @ symbol and relative names
- SOA record fields and serial numbers
- Zone transfers (AXFR/IXFR) and replication
- Views and split-horizon DNS
- Forwarders and upstream servers
- ACLs and access control

### OKD/OpenShift
- Critical DNS records for cluster installation (`api`, `api-int`, `*.apps`)
- Wildcard DNS for application routing
- DNS preflight checks and validation
- Ingress controller and service routing

### DNS Tools & Troubleshooting
- `dig` command and common options (+trace, +short, +dnssec, +tcp, +norecurse)
- `nslookup` interactive mode and server selection
- Reverse DNS lookups (-x option)
- Query specific record types
- Querying specific nameservers

### DNS Security
- DNSSEC and cryptographic signatures
- DNSKEY and DS records
- Chain of trust and validation
- DNS cache poisoning prevention
- CAA records for certificate authority authorization
- SPF, DKIM, and DMARC (TXT records)

### Modern DNS Protocols
- DNS over HTTPS (DoH) - encryption in HTTPS
- DNS over TLS (DoT) - dedicated port 853
- Privacy considerations vs. network visibility
- Censorship resistance

### Alternative DNS Solutions
- **Unbound** - Modern validating recursive resolver
- **Pi-hole** - Network-wide ad blocking and DNS filtering
- **dnsmasq** - Lightweight DNS/DHCP for routers and embedded systems

### Public DNS Providers
- **Cloudflare DNS (1.1.1.1)** - Speed and privacy focused
- **Google Public DNS (8.8.8.8)** - Global, reliable infrastructure
- **Quad9 (9.9.9.9)** - Security and malware blocking
- **AdGuard DNS** - Ad and tracker blocking

## Question Examples

The quiz includes practical questions such as:

- "What type of DNS record maps a hostname to an IPv4 address?"
- "In an OKD/OpenShift cluster, what is the purpose of the wildcard DNS record `*.apps.cluster.domain`?"
- "What does the 'dig +trace' command do?"
- "What is the purpose of a PTR record?"
- "Why is it important to increment the SOA serial number when you update a zone file?"
- "What is DNSSEC and what problem does it solve?"
- "What are the differences between split-horizon DNS and normal DNS?"
- And 43 more comprehensive questions!

## Project Structure

```
DNS-Quiz/
├── Quiz.jsx          # Main React component with all quiz logic
├── README.md         # This file
├── package.json      # Project dependencies and scripts
└── [config files]    # Vite and other configuration
```

## Building for Production

To create an optimized production build:

```bash
npm run build
```

The compiled output will be in the `dist/` directory.

## Author

Created by **Ryan Claffey**

## License

MIT License - feel free to use and modify for learning purposes

## Contributing

Contributions are welcome! Feel free to:
- Suggest new questions
- Improve explanations
- Report issues
- Enhance the UI/UX
- Add new DNS topics

## Useful DNS Learning Resources

- [BIND 9 Administrator's Reference Manual](https://bind9.readthedocs.io/)
- [RFC 1035 - Domain Names - Implementation and Specification](https://tools.ietf.org/html/rfc1035)
- [DNS Made Easy - Cloudflare Learning Center](https://www.cloudflare.com/learning/dns/what-is-dns/)
- [OKD DNS Requirements](https://docs.okd.io/)
- [DNSSEC Documentation](https://www.dnssec.net/)

## Troubleshooting

### Quiz won't load
- Clear browser cache
- Ensure Node.js 16+ is installed
- Try `npm install` again

### Questions look similar
- This is expected! Domains are randomized per session, and many DNS concepts build on each other
- Review the explanations to deepen understanding

### Port already in use
- If port 5173 is in use, Vite will automatically try the next available port
- Check the terminal output for the actual URL

## Tips for Success

1. **Start with fundamentals** - If you're new to DNS, review basic concepts before advanced topics
2. **Understand the "why"** - Focus on understanding explanations, not just memorizing answers
3. **Use dig to verify** - After completing the quiz, try the real `dig` command to practice
4. **Take it multiple times** - Retake the quiz to reinforce learning and improve your score
5. **Deep dive on weak areas** - Use the explanations as jumping-off points for deeper research

Happy learning! 🚀
