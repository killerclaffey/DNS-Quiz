/**
 * DNS Knowledge Quiz
 * 
 * An interactive quiz application to test DNS and BIND 9 configuration knowledge.
 * Perfect for learning DNS concepts for homelab setups, OKD/OpenShift deployments,
 * and general DNS administration.
 * 
 * Features:
 * - 50 comprehensive questions covering DNS fundamentals and advanced topics
 * - dig and nslookup command usage and troubleshooting
 * - Alternative DNS solutions (Unbound, Pi-hole, dnsmasq)
 * - Public DNS providers (Cloudflare, Google, Quad9, AdGuard)
 * - DNSSEC, DoH, DoT, and modern DNS security
 * - Randomized domain names generated at startup for generic examples
 * - Detailed explanations after each answer
 * - Progress tracking and scoring
 * - Responsive design with Tailwind CSS
 * 
 * Domain Randomization:
 * - Uses 10 domain words and 10 TLDs to generate unique examples
 * - Domains are generated once per session and used consistently
 * - Makes the quiz reusable without being tied to specific domains
 * 
 * License: MIT (or your preferred open source license)
 * Author: Ryan Claffey
 * 
 */

import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

const DNSQuiz = () => {
  // Generate random domains once on component mount
  const domains = useMemo(() => {
    const domainWords = ['stellar', 'quantum', 'nexus', 'apex', 'zenith', 'vertex', 'pulse', 'forge', 'orbit', 'prism'];
    const tlds = ['.com', '.org', '.net', '.pro', '.cloud', '.tech', '.io', '.dev', '.app', '.site'];
    
    const getRandomDomain = () => {
      const word = domainWords[Math.floor(Math.random() * domainWords.length)];
      const tld = tlds[Math.floor(Math.random() * tlds.length)];
      return word + tld;
    };
    
    const getUniqueDomain = (existing) => {
      let domain;
      do {
        domain = getRandomDomain();
      } while (existing.includes(domain));
      return domain;
    };
    
    const primary = getRandomDomain();
    const secondary = getUniqueDomain([primary]);
    const example = getUniqueDomain([primary, secondary]);
    
    return {
      primary: primary,           // Main homelab domain
      cluster: 'okd.' + primary,  // Cluster subdomain
      secondary: secondary,       // Public website domain
      example: example,           // Generic example
      subdomain: primary.split('.')[0], // Just the name part
      tld: '.' + primary.split('.')[1]  // Just the TLD part
    };
  }, []);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const questions = [
    {
      question: "What type of DNS record maps a hostname to an IPv4 address?",
      options: ["AAAA record", "A record", "CNAME record", "PTR record"],
      correct: 1,
      explanation: `An A record (Address record) maps a hostname to an IPv4 address. For example, 'web.${domains.example} A 192.168.1.10' tells DNS that web.${domains.example} is at IP 192.168.1.10. AAAA records are for IPv6 addresses, CNAME creates aliases, and PTR does reverse lookups (IP to hostname).`
    },
    {
      question: "In a BIND zone file, what does the @ symbol represent?",
      options: ["The DNS server's IP", "The zone origin/domain name", "A comment", "An alias"],
      correct: 1,
      explanation: `The @ symbol is shorthand for the zone origin, which is the domain name of the zone itself. If your zone file is for '${domains.primary}', then @ represents '${domains.primary}'. This saves you from typing the full domain name repeatedly. For example, '@ IN A 10.0.1.1' means '${domains.primary} IN A 10.0.1.1'.`
    },
    {
      question: "What is split-horizon DNS?",
      options: [
        "DNS that works over two ISPs",
        "Serving different DNS answers to internal vs external clients",
        "A backup DNS configuration",
        "DNS that splits traffic between servers"
      ],
      correct: 1,
      explanation: `Split-horizon DNS means serving different DNS responses based on who's asking. Internal clients might get private IPs (like 10.0.1.30 for ${domains.secondary}) while external clients get your public IP. This is accomplished in BIND using 'views' - one for trusted/internal clients and one for external. It's perfect for homelabs where you want internal direct access but also public access to services.`
    },
    {
      question: "Which DNS record type is used to specify mail servers for a domain?",
      options: ["A record", "MX record", "CNAME record", "TXT record"],
      correct: 1,
      explanation: `MX (Mail Exchange) records specify which servers handle email for a domain. They include a priority number - lower numbers are tried first. For example: '${domains.example} MX 10 mail.${domains.example}' means mail.${domains.example} handles email, and the priority is 10. If you have multiple mail servers, you can list them with different priorities for redundancy.`
    },
    {
      question: "What is the purpose of a PTR record?",
      options: [
        "Points to a primary server",
        "Creates an alias for a hostname",
        "Maps an IP address back to a hostname (reverse DNS)",
        "Specifies the mail server priority"
      ],
      correct: 2,
      explanation: `PTR (Pointer) records provide reverse DNS - mapping an IP address back to a hostname. While normal DNS goes from name to IP (forward lookup), PTR goes from IP to name (reverse lookup). These are crucial for mail servers (spam filters check them) and are stored in special reverse zones like '1.0.10.in-addr.arpa' for the 10.0.1.0/24 network. Example: '11 IN PTR master01.${domains.cluster}' maps 10.0.1.11 to master01.${domains.cluster}.`
    },
    {
      question: `In an OKD/OpenShift cluster, what is the purpose of the wildcard DNS record *.apps.${domains.cluster}?`,
      options: [
        "To load balance between API servers",
        "To route all application traffic through the ingress controller",
        "To enable cluster communication",
        "To configure storage"
      ],
      correct: 1,
      explanation: `The wildcard *.apps record points ALL application routes to the OKD ingress controller/router. When you deploy an app that creates a route like 'myapp.apps.${domains.cluster}' or '${domains.secondary.split('.')[0]}.apps.${domains.cluster}', the wildcard catches it and sends traffic to your ingress IP (like 10.0.1.30). The ingress controller then uses HTTP host headers to route to the correct application pod. This is how OpenShift/OKD does multi-tenancy and dynamic routing without creating individual DNS records for each app.`
    },
    {
      question: "What does TTL stand for in DNS, and what does it control?",
      options: [
        "Total Transfer Limit - maximum zone size",
        "Time To Live - how long a DNS record is cached",
        "Transfer Time Limit - maximum query time",
        "Tunneling Transport Layer - encryption method"
      ],
      correct: 1,
      explanation: "TTL (Time To Live) specifies how long (in seconds) a DNS record should be cached by resolvers before checking for updates. A TTL of 300 means 5 minutes - clients can cache that record for 5 minutes before querying again. Lower TTLs mean more frequent queries (more load) but faster propagation of changes. Higher TTLs reduce load but changes take longer to propagate. For dynamic IPs, you want low TTLs (300-600). For stable infrastructure, higher TTLs (3600-86400) are fine."
    },
    {
      question: "What is the difference between a CNAME and an A record?",
      options: [
        "CNAME is for IPv6, A is for IPv4",
        "CNAME creates an alias to another name, A points to an IP",
        "CNAME is faster than A records",
        "A records cost more than CNAMEs"
      ],
      correct: 1,
      explanation: `A CNAME (Canonical Name) creates an alias that points to another hostname, while an A record points directly to an IP address. For example: 'www CNAME @' means www.${domains.example} is an alias for ${domains.example} (which has the A record). CNAMEs cannot exist at the zone apex (@) and cannot coexist with other record types for the same name. The resolver follows the CNAME to find the eventual A/AAAA record. CNAMEs are useful when multiple names should point to the same place - change one A record instead of many.`
    },
    {
      question: "What information is contained in a DNS SOA (Start of Authority) record?",
      options: [
        "Server IP addresses",
        "Mail server settings",
        "Zone metadata: primary server, admin email, serial, timers",
        "Security certificates"
      ],
      correct: 2,
      explanation: "The SOA record appears at the start of every zone file and contains critical metadata: (1) Primary nameserver for the zone, (2) Administrator's email (with @ replaced by .), (3) Serial number (used to track zone versions - increment when you make changes!), (4) Refresh timer (how often secondaries check for updates), (5) Retry timer (how long to wait if refresh fails), (6) Expire timer (when to stop serving if primary is unreachable), (7) Negative TTL (how long to cache 'domain doesn't exist' responses). This is the zone's 'birth certificate' - it must be correct!"
    },
    {
      question: "In BIND configuration, what is the purpose of 'views'?",
      options: [
        "To monitor DNS traffic",
        "To serve different DNS answers to different clients",
        "To create DNS dashboards",
        "To replicate zones"
      ],
      correct: 1,
      explanation: "Views in BIND allow you to serve completely different DNS responses based on who's asking (matched by source IP). This is how you implement split-horizon DNS. You might have an 'internal' view that matches your LAN IPs (ACL 'trusted') with full zone data including private IPs, and an 'external' view for everyone else with only public-facing records. Each view can have its own zones, forwarders, and recursion settings. This is perfect for homelab scenarios where internal clients need private IPs but external clients need public IPs for the same hostnames."
    },
    {
      question: "Why is it important to increment the SOA serial number when you update a zone file?",
      options: [
        "For backup purposes",
        "To notify secondary servers that the zone has changed",
        "To improve DNS speed",
        "It's not important"
      ],
      correct: 1,
      explanation: "The SOA serial number is THE mechanism that tells secondary (slave) DNS servers that a zone has been updated. Secondaries periodically check the primary's serial number. If it's HIGHER than their cached version, they request a zone transfer (AXFR or IXFR) to get the updates. If you forget to increment it, secondaries won't know to update! Convention is YYYYMMDDNN (2024122401 for first edit on Dec 24, 2024). Even if you don't have secondaries now, it's good practice - you might add them later, and the serial tracks your change history."
    },
    {
      question: "What type of DNS query does a recursive resolver perform?",
      options: [
        "It only checks its cache",
        "It queries the entire DNS hierarchy on behalf of the client",
        "It only forwards to other servers",
        "It only serves authoritative answers"
      ],
      correct: 1,
      explanation: `A recursive resolver does the FULL DNS resolution work for the client. When you ask it for '${domains.secondary}', it: (1) Checks its cache first, (2) If not cached, queries root servers to find ${domains.secondary.split('.')[1]} nameservers, (3) Queries ${domains.secondary.split('.')[1]} servers to find ${domains.secondary} nameservers, (4) Queries ${domains.secondary} nameservers for the final answer, (5) Returns the result to you and caches it. The client gets a single answer - the resolver did all the work. This is different from iterative queries where each server says 'ask this next server' and the client does the work. Most DNS servers you configure (like BIND on OPNsense) are recursive resolvers for your internal network.`
    },
    {
      question: "For your OKD cluster, what DNS record must resolve BEFORE installation will succeed?",
      options: [
        `*.apps.${domains.cluster} only`,
        `api.${domains.cluster} only`,
        `Both api.${domains.cluster} and api-int.${domains.cluster}`,
        "Only the worker node records"
      ],
      correct: 2,
      explanation: `OKD/OpenShift installation REQUIRES both api.${domains.cluster} and api-int.${domains.cluster} to resolve before it will even start. The installer validates DNS as a preflight check. 'api' is the external API endpoint and 'api-int' is the internal API endpoint - they often point to the same IP/load balancer but MUST both exist. Additionally, the installer checks that *.apps.${domains.cluster} resolves (for application routing) and that reverse DNS works for the nodes. Missing or incorrect DNS is the #1 reason OKD installations fail. Always test with 'dig' before running the installer!`
    },
    {
      question: "What is the purpose of SRV records in DNS?",
      options: [
        "To serve web pages",
        "To specify the location (hostname + port) of specific services",
        "To create subdomains",
        "To handle email routing"
      ],
      correct: 1,
      explanation: `SRV (Service) records specify not just WHERE a service is (hostname) but also WHAT PORT it runs on and its priority/weight for load balancing. Format: '_service._protocol.domain SRV priority weight port target'. For example, OKD uses SRV records for etcd discovery: '_etcd-server-ssl._tcp.${domains.cluster} SRV 0 10 2380 etcd-0.${domains.cluster}' tells clients that the etcd SSL service runs on etcd-0.${domains.cluster} at port 2380. This allows clients to automatically discover services without hardcoding ports. Common uses: LDAP, SIP (VoIP), XMPP (chat), and Kubernetes/etcd.`
    },
    {
      question: "When using Cloudflare for dynamic DNS, what gets updated when your public IP changes?",
      options: [
        "Your BIND configuration on OPNsense",
        "The A records at Cloudflare pointing to your public IP",
        "Your internal zone files",
        "The TTL values"
      ],
      correct: 1,
      explanation: `When using dynamic DNS with Cloudflare, a client (like OPNsense's ddclient or a script) detects when your ISP-assigned public IP changes and uses Cloudflare's API to UPDATE the A record(s) at Cloudflare to point to your NEW public IP. For example, if '${domains.secondary}' pointed to 203.0.113.45 and your IP changes to 203.0.113.67, the dynamic DNS client updates Cloudflare so ${domains.secondary} now points to .67. Your BIND configuration and internal zone files DON'T change - they still point to internal IPs (10.0.1.x). This is why split-horizon is important: internal clients use BIND (private IPs), external clients use Cloudflare (public IP).`
    },
    {
      question: "What is the purpose of the 'forwarders' directive in BIND configuration?",
      options: [
        "To send email",
        "To specify upstream DNS servers for queries you can't answer",
        "To copy zone files to other servers",
        "To enable IPv6"
      ],
      correct: 1,
      explanation: `The 'forwarders' directive tells BIND which upstream DNS servers to query for domains you're not authoritative for. Instead of doing full recursive resolution (querying root servers, TLD servers, etc.), BIND forwards the query to these servers (like 1.1.1.1 or 8.8.8.8) and caches their response. This is faster and reduces load. Example: Your BIND is authoritative for ${domains.primary} and ${domains.cluster}, but when someone queries 'google.com', BIND forwards to Cloudflare (1.1.1.1), gets the answer, caches it, and returns it to the client. You can set global forwarders or per-zone forwarders.`
    },
    {
      question: "In a zone file, what does it mean if a hostname DOESN'T end with a dot (.)?",
      options: [
        "It's an error",
        "It's a relative name - the zone origin will be appended",
        "It means it's a CNAME",
        "It disables caching"
      ],
      correct: 1,
      explanation: `In DNS zone files, names without a trailing dot are RELATIVE - BIND automatically appends the zone origin. Names WITH a trailing dot are FQDN (Fully Qualified). Example in the ${domains.primary} zone: 'www' becomes 'www.${domains.primary}' (relative), but 'www.${domains.primary}.' stays as-is (FQDN with trailing dot). This is a common source of errors! If you write 'www.${domains.primary}' (no trailing dot), BIND appends the zone origin and you get 'www.${domains.primary}.${domains.primary}' - probably not what you wanted! Always use EITHER relative names ('www') OR FQDNs with trailing dots ('www.${domains.primary}').`
    },
    {
      question: "What is DNSSEC and what problem does it solve?",
      options: [
        "It encrypts DNS traffic",
        "It speeds up DNS queries",
        "It cryptographically signs DNS responses to prevent tampering",
        "It provides DNS over HTTPS"
      ],
      correct: 2,
      explanation: "DNSSEC (DNS Security Extensions) uses cryptographic signatures to ensure DNS responses haven't been tampered with. It solves the problem of DNS cache poisoning and man-in-the-middle attacks where attackers could redirect you to fake sites by sending false DNS answers. DNSSEC doesn't ENCRYPT queries (that's DNS-over-HTTPS/TLS), but it does AUTHENTICATE them. When you enable DNSSEC validation on your resolver, it checks the digital signatures in DNS responses against a chain of trust from the root servers down. If signatures don't match, the response is rejected. It's complex to implement as an authoritative server (key management), but easy to enable validation on your resolver."
    },
    {
      question: "Why might you want to run BIND on your firewall rather than a separate server?",
      options: [
        "It's required by law",
        "Centralized control, first point of network entry, can enforce DNS-based policies",
        "BIND only works on firewalls",
        "It's cheaper"
      ],
      correct: 1,
      explanation: "Running DNS on your firewall (like OPNsense) offers several advantages: (1) Centralized control - all clients must use it, can't bypass easily, (2) Network choke point - you can log all DNS queries, (3) DNS-based filtering - block malware/ad domains before they resolve, (4) Integration - can work with DHCP to auto-create DNS entries, (5) Single point of management - firewall already handles routing, now DNS too. Downsides: firewall becomes more critical (if it fails, everything fails), potential performance impact if handling lots of queries, and separation of concerns - some prefer dedicated DNS servers. For homelabs, firewall-based DNS is very common and practical."
    },
    {
      question: "What is the difference between an authoritative DNS server and a recursive resolver?",
      options: [
        "There is no difference",
        "Authoritative has the actual zone data, recursive looks up answers on behalf of clients",
        "Authoritative is faster",
        "Recursive is only for root servers"
      ],
      correct: 1,
      explanation: `An AUTHORITATIVE server has the official source data for specific zones - it's the 'owner' of that zone's records. When asked about its zones, it gives definitive answers (AA flag set). A RECURSIVE RESOLVER doesn't own any zones - it looks up answers on behalf of clients by querying other servers. Your BIND will be BOTH: authoritative for ${domains.primary} and ${domains.cluster} (you maintain the zone files), AND recursive for everything else (it queries on behalf of your internal clients). Public DNS like 8.8.8.8 are purely recursive - they don't own zones, just answer queries. Your domain registrar's nameservers are authoritative for your domain (from the internet's perspective).`
    },
    {
      question: "What does the 'dig +trace' command do?",
      options: [
        "Shows DNS packet traces",
        "Traces the full DNS resolution path from root servers down",
        "Monitors DNS traffic",
        "Traces network routes"
      ],
      correct: 1,
      explanation: `The 'dig +trace' command shows the ENTIRE DNS resolution process, starting from the root servers. It queries root servers for the TLD servers, then queries TLD servers for the authoritative servers, then queries authoritative servers for the final answer. This is incredibly useful for debugging DNS issues and understanding the delegation chain. For example, 'dig +trace ${domains.secondary}' would show: (1) query to root servers, (2) referral to ${domains.tld} servers, (3) referral to ${domains.secondary} nameservers, (4) final answer. You can see exactly where in the chain something might be broken.`
    },
    {
      question: "What is the purpose of a CAA (Certification Authority Authorization) record?",
      options: [
        "To specify mail server priorities",
        "To authorize which Certificate Authorities can issue SSL certificates for your domain",
        "To cache DNS records",
        "To authenticate zone transfers"
      ],
      correct: 1,
      explanation: `CAA records specify which Certificate Authorities (CAs) are allowed to issue SSL/TLS certificates for your domain. This prevents unauthorized CAs from issuing certificates for your domain, which could be used for man-in-the-middle attacks. Example: '${domains.secondary} CAA 0 issue "letsencrypt.org"' means only Let's Encrypt can issue certificates for ${domains.secondary}. You can also use 'issuewild' for wildcards and 'iodef' to specify where to report violations. CAs are required to check CAA records before issuing certificates, making this an important security feature.`
    },
    {
      question: "In dig output, what does the 'aa' flag mean?",
      options: [
        "Abbreviated Answer",
        "Authoritative Answer - the server is authoritative for this zone",
        "Always Available",
        "Authenticated Answer"
      ],
      correct: 1,
      explanation: "The 'aa' (Authoritative Answer) flag in dig output indicates that the DNS server that responded is authoritative for the zone being queried - it has the official source data, not a cached copy. When you query your BIND server for records in your zones, you'll see 'aa' in the flags. When you query for external domains, you won't see 'aa' because your server is just forwarding/recursing. This flag helps you verify you're getting answers from the right place. If you expect an authoritative answer but don't see 'aa', you might be querying the wrong server or there's a delegation issue."
    },
    {
      question: "What is Unbound and how does it differ from BIND?",
      options: [
        "Unbound is just a newer version of BIND",
        "Unbound is a validating, recursive DNS resolver focused on security, while BIND can be both authoritative and recursive",
        "Unbound only works on Windows",
        "They are exactly the same"
      ],
      correct: 1,
      explanation: "Unbound is a modern, security-focused validating recursive DNS resolver. Unlike BIND which can serve both authoritative and recursive roles, Unbound focuses ONLY on recursive resolution with built-in DNSSEC validation. It's designed to be faster, more secure, and easier to configure than BIND for recursive-only setups. Unbound is often used in combination with an authoritative server - for example, you might use Unbound for recursive queries and BIND (or NSD) for authoritative zones. Unbound is particularly popular for privacy-focused setups, DNS filtering, and as the DNS component in Pi-hole installations."
    },
    {
      question: "What is Pi-hole and what DNS functionality does it provide?",
      options: [
        "A DNS server for Raspberry Pi only",
        "A network-wide ad blocker that works as a DNS sinkhole",
        "A VPN solution",
        "A firewall application"
      ],
      correct: 1,
      explanation: "Pi-hole is a network-wide ad blocking solution that works as a DNS sinkhole. It runs a DNS server (typically using dnsmasq or Unbound) that blocks requests to known advertising and tracking domains by returning a null response (0.0.0.0). When a client queries an ad domain, Pi-hole blocks it at the DNS level before it even loads. It provides: (1) DNS-based ad blocking for all devices on your network, (2) DHCP server capabilities, (3) Web dashboard with statistics, (4) Custom blacklists/whitelists, (5) Query logging. You configure your network to use Pi-hole as the DNS server, and it forwards legitimate queries to upstream DNS servers like Cloudflare or Google while blocking ads."
    },
    {
      question: "What does the 'dig +short' command do?",
      options: [
        "Makes the query faster",
        "Returns only the answer section with minimal output",
        "Queries only short domain names",
        "Uses UDP instead of TCP"
      ],
      correct: 1,
      explanation: `The '+short' flag makes dig output only the essential answer, omitting all the header information, question section, authority section, and additional section. For example, 'dig +short ${domains.secondary}' might return just '10.0.1.30' instead of the full verbose output. This is extremely useful in scripts where you just need the IP address or for quick lookups where you don't need to see all the DNS metadata. You can combine it with other flags: 'dig +short +trace' or 'dig +short @8.8.8.8 ${domains.secondary}' to get concise output from specific servers.`
    },
    {
      question: "What is the purpose of a DNAME record?",
      options: [
        "Same as a CNAME record",
        "Creates an alias for an entire subtree of the domain",
        "Specifies domain administrators",
        "Encrypts DNS responses"
      ],
      correct: 1,
      explanation: `DNAME (Delegation Name) creates an alias for an ENTIRE subtree, unlike CNAME which only aliases a single name. If you set 'old.${domains.primary} DNAME new.${domains.primary}', then ANY query under old.${domains.primary} gets redirected to new.${domains.primary}. For example, www.old.${domains.primary} becomes www.new.${domains.primary}, mail.old.${domains.primary} becomes mail.new.${domains.primary}, etc. This is useful for domain migrations or when you want to redirect an entire subdomain tree without creating individual CNAMEs for every record.`
    },
    {
      question: "How do you query a specific DNS server using dig?",
      options: [
        "dig -server 8.8.8.8 domain.com",
        "dig @8.8.8.8 domain.com",
        "dig --server=8.8.8.8 domain.com",
        "dig domain.com > 8.8.8.8"
      ],
      correct: 1,
      explanation: `The '@' symbol specifies which DNS server to query. 'dig @8.8.8.8 ${domains.secondary}' queries Google's DNS, 'dig @1.1.1.1 ${domains.secondary}' queries Cloudflare, and 'dig @10.0.1.1 ${domains.secondary}' queries your local BIND server. This is crucial for troubleshooting - you can verify that specific servers have the correct records. For example, after updating a zone file, you can query your BIND server directly to confirm it has the new records before testing from other networks. You can also query root servers directly: 'dig @a.root-servers.net' to see if there are issues at the root level.`
    },
    {
      question: "What is the difference between nslookup and dig?",
      options: [
        "They are identical tools",
        "nslookup is older/simpler, dig is more powerful with detailed output and more options",
        "nslookup is for Windows only",
        "dig is deprecated"
      ],
      correct: 1,
      explanation: "nslookup is an older, simpler DNS query tool that's available on most platforms but is somewhat deprecated in favor of dig. dig (Domain Information Groper) is more powerful with detailed output, better formatting, and more query options. dig shows all sections of the DNS response (header, question, answer, authority, additional) and supports features like +trace, +short, DNSSEC validation, specific record type queries, and more. nslookup is interactive by default and easier for beginners, but dig is preferred by DNS professionals for its flexibility and detailed output. On Linux, dig is standard; on Windows, nslookup is more commonly available though dig can be installed."
    },
    {
      question: "What DNS record type is used to specify IPv6 addresses?",
      options: [
        "A6 record",
        "AAAA record",
        "IPv6 record",
        "A record with special syntax"
      ],
      correct: 1,
      explanation: `AAAA (quad-A) records map hostnames to IPv6 addresses, just like A records do for IPv4. Example: 'www.${domains.primary} AAAA 2001:0db8:85a3:0000:0000:8a2e:0370:7334'. The name comes from IPv6 addresses being 128 bits (four times the 32 bits of IPv4, hence four A's). As IPv6 adoption grows, AAAA records become increasingly important. A single hostname can have both A and AAAA records, allowing dual-stack operation where clients can use either IPv4 or IPv6. Modern DNS servers should return both record types when querying for a hostname, and clients choose which to use based on their connectivity.`
    },
    {
      question: "What does the dig query type 'ANY' do?",
      options: [
        "Returns all record types for a domain",
        "Matches any character in the domain name",
        "Queries all DNS servers",
        "It's deprecated and should not be used"
      ],
      correct: 3,
      explanation: `The ANY query type is largely DEPRECATED and many DNS servers now refuse to answer it. Originally, 'dig ${domains.secondary} ANY' would return all record types (A, AAAA, MX, TXT, etc.) for a domain. However, this became a vector for DNS amplification attacks where attackers would send small ANY queries that generated large responses, which they'd reflect at victims. Modern DNS servers (including Cloudflare, Google) either ignore ANY queries or return minimal responses. Instead, you should query for specific record types: 'dig ${domains.secondary} A', 'dig ${domains.secondary} MX', etc. RFC 8482 officially discourages the use of ANY queries.`
    },
    {
      question: "What is DNS cache poisoning and how does DNSSEC prevent it?",
      options: [
        "When DNS servers run out of memory",
        "When attackers inject false DNS records into a resolver's cache; DNSSEC uses cryptographic signatures to verify authenticity",
        "When DNS records expire too quickly",
        "It's not a real security issue"
      ],
      correct: 1,
      explanation: `DNS cache poisoning (also called DNS spoofing) is when an attacker manages to insert false DNS records into a resolver's cache, causing users to be directed to malicious sites. For example, an attacker might poison the cache so ${domains.secondary} points to their server instead of yours. DNSSEC prevents this by adding cryptographic signatures to DNS records. Each zone is signed with a private key, and resolvers can verify the signatures using the public key. If a response has been tampered with, the signature won't match and the resolver rejects it. DNSSEC creates a chain of trust from the root servers down, ensuring DNS responses are authentic and haven't been modified.`
    },
    {
      question: "What command in nslookup switches to query a different DNS server?",
      options: [
        "set server=8.8.8.8",
        "server 8.8.8.8",
        "use 8.8.8.8",
        "query 8.8.8.8"
      ],
      correct: 1,
      explanation: `In nslookup's interactive mode, you use 'server 8.8.8.8' to switch to querying a different DNS server. The workflow is: (1) Type 'nslookup' to enter interactive mode, (2) Type 'server 8.8.8.8' to switch to Google's DNS, (3) Type your domain queries like '${domains.secondary}', (4) Type 'exit' when done. You can also specify the server on the command line: 'nslookup ${domains.secondary} 8.8.8.8'. The 'server' command is particularly useful when you want to query multiple servers in sequence to compare their responses or troubleshoot DNS propagation issues.`
    },
    {
      question: "What is the purpose of a TXT record?",
      options: [
        "To store plain text only",
        "To store arbitrary text data used for SPF, DKIM, domain verification, and other purposes",
        "To encrypt DNS responses",
        "To create text-based aliases"
      ],
      correct: 1,
      explanation: `TXT records store arbitrary text data and have become crucial for email authentication and domain verification. Common uses: (1) SPF records - 'v=spf1 include:_spf.google.com ~all' specifies which servers can send email for your domain, (2) DKIM keys - public keys for email signature verification, (3) Domain verification - proving ownership to services like Google or Microsoft (e.g., 'google-site-verification=abc123'), (4) DMARC policies - email authentication policies, (5) General metadata - any text information you want to publish. TXT records can be queried with 'dig ${domains.secondary} TXT'. They're limited to 255 characters per string but can have multiple strings concatenated.`
    },
    {
      question: "How do you query only MX records using dig?",
      options: [
        "dig --mx domain.com",
        "dig domain.com MX",
        "dig -t MX domain.com",
        "Both B and C are correct"
      ],
      correct: 3,
      explanation: `You can specify the record type in dig in two ways: 'dig ${domains.secondary} MX' or 'dig -t MX ${domains.secondary}' - both are correct and do the same thing. The -t flag explicitly specifies the query type. You can use this for any record type: 'dig ${domains.primary} AAAA', 'dig ${domains.cluster} NS', 'dig ${domains.secondary} TXT', etc. This is much more efficient than querying for all records (which is discouraged anyway). Combining with +short is common: 'dig +short ${domains.secondary} MX' gives you just the mail servers without all the extra output.`
    },
    {
      question: "What is dnsmasq and where is it commonly used?",
      options: [
        "A DNS security scanner",
        "A lightweight DNS/DHCP server often used in routers and embedded systems",
        "A DNS monitoring tool",
        "A BIND configuration helper"
      ],
      correct: 1,
      explanation: "dnsmasq is a lightweight DNS forwarder and DHCP server designed for small networks and embedded systems. It's commonly found in home routers, Pi-hole installations, and development environments. Unlike BIND which is full-featured but complex, dnsmasq is simple and efficient with a small memory footprint. It can: (1) Forward DNS queries to upstream servers, (2) Cache DNS responses, (3) Serve local DNS records from /etc/hosts, (4) Provide DHCP services, (5) Offer DNS-based ad blocking (as in Pi-hole). Configuration is simple - typically just one config file. It's perfect for homelabs and small networks where you don't need BIND's full authoritative server capabilities."
    },
    {
      question: "What does 'dig +norecurse' do?",
      options: [
        "Disables recursion, getting only what the queried server knows directly",
        "Makes the query faster",
        "Prevents caching",
        "It's an invalid option"
      ],
      correct: 0,
      explanation: "The '+norecurse' flag tells dig to set the RD (Recursion Desired) flag to 0 in the query, meaning 'don't do recursive resolution'. When you query an authoritative server with +norecurse, it will only return records it's authoritative for - it won't go lookup answers elsewhere. This is useful for testing: (1) Verifying an authoritative server has the correct records, (2) Preventing recursive servers from doing lookups, (3) Understanding what each server in the chain knows directly. Example: 'dig @ns1.example.com +norecurse test.example.com' will only return an answer if ns1.example.com is authoritative for that domain."
    },
    {
      question: "What is the purpose of the negative TTL in an SOA record?",
      options: [
        "How long to cache negative responses (domain doesn't exist)",
        "How long before the zone expires",
        "The minimum TTL for all records",
        "It's deprecated and unused"
      ],
      correct: 0,
      explanation: "The last field in the SOA record (historically called 'minimum TTL', now called 'negative TTL') specifies how long resolvers should cache 'NXDOMAIN' (non-existent domain) responses. If someone queries for 'doesnotexist.${domains.primary}' and your server responds that it doesn't exist, resolvers will cache that negative answer for this duration. A value of 300 (5 minutes) means clients won't re-query for that non-existent domain for 5 minutes, reducing load. This is important for typos and scanning - you don't want resolvers repeatedly asking about domains that don't exist. RFC 2308 redefined this field specifically for negative caching."
    },
    {
      question: "How can you use dig to check if DNSSEC is enabled for a domain?",
      options: [
        "dig +dnssec domain.com",
        "dig --check-dnssec domain.com",
        "dig domain.com DNSSEC",
        "dig +secure domain.com"
      ],
      correct: 0,
      explanation: `Use 'dig +dnssec ${domains.secondary}' to request DNSSEC-related records. If DNSSEC is enabled, you'll see RRSIG (signature) records in the response, and the 'ad' (authenticated data) flag will be set if your resolver validated the signatures. You can also query specifically for DNSSEC records: 'dig ${domains.secondary} DNSKEY' (public keys), 'dig ${domains.secondary} DS' (delegation signer), or 'dig ${domains.secondary} RRSIG' (signatures). The presence of these records indicates DNSSEC is configured. To verify the chain of trust is working, check that the 'ad' flag appears in the response when querying through a validating resolver.`
    },
    {
      question: "What is DNS over HTTPS (DoH) and how does it differ from traditional DNS?",
      options: [
        "DNS queries encrypted in HTTPS, preventing ISP snooping",
        "Faster DNS resolution",
        "A backup DNS protocol",
        "DNS for web servers only"
      ],
      correct: 0,
      explanation: "DNS over HTTPS (DoH) encrypts DNS queries inside HTTPS connections (port 443), making them look like regular web traffic. Traditional DNS uses unencrypted UDP/TCP on port 53, allowing ISPs and network operators to see all your DNS queries. DoH provides: (1) Privacy - queries can't be intercepted or logged by ISPs, (2) Security - prevents DNS spoofing on untrusted networks, (3) Bypass censorship - harder to block than traditional DNS. Browsers like Firefox and Chrome support DoH. Cloudflare (1.1.1.1/https://cloudflare-dns.com/dns-query) and Google (8.8.8.8/https://dns.google/dns-query) offer DoH endpoints. Some argue it bypasses network-level DNS filtering (like Pi-hole or parental controls)."
    },
    {
      question: "What does the dig option '+answer' do?",
      options: [
        "Shows only the answer section",
        "Forces an answer even if cached",
        "Validates the answer",
        "It's an invalid option"
      ],
      correct: 0,
      explanation: "The '+answer' option tells dig to show only the answer section of the DNS response, hiding the question, authority, and additional sections. This provides cleaner output than the full response but more detail than +short. Example: 'dig +answer ${domains.secondary}' will show just the answer records with their TTLs and record types, but not the full verbose output. You can combine flags: 'dig +answer +noall' first suppresses all sections, then +answer re-enables just the answer section. This is useful when you want to see the formatted answer section without all the metadata but with more context than +short provides."
    },
    {
      question: "What is a DNS zone transfer and what command requests one?",
      options: [
        "Moving a zone file; cp command",
        "Copying all records from primary to secondary server; dig AXFR",
        "Transferring ownership; whois update",
        "It's a deprecated feature"
      ],
      correct: 1,
      explanation: `A zone transfer (AXFR - full transfer, or IXFR - incremental transfer) copies all DNS records from a primary server to a secondary server. This is how secondary DNS servers stay synchronized. You can request one with 'dig ${domains.primary} AXFR @ns1.${domains.primary}'. However, most servers restrict zone transfers to authorized secondaries only for security reasons - allowing public zone transfers lets anyone download your entire DNS database. In BIND, you control this with 'allow-transfer { trusted_servers; };'. Zone transfers are different from normal queries - they return the entire zone at once rather than individual records. Attackers historically used zone transfers for reconnaissance, which is why they're now typically blocked.`
    },
    {
      question: "What is the purpose of the 'rd' (Recursion Desired) flag in DNS queries?",
      options: [
        "Requests read-only access",
        "Tells the server whether to perform recursive resolution",
        "Marks records as deprecated",
        "Enables debugging"
      ],
      correct: 1,
      explanation: "The RD (Recursion Desired) flag in a DNS query tells the server whether the client wants recursive resolution. When RD=1 (default in most clients), the server should do all the work of finding the answer by querying other servers if needed. When RD=0 (like with dig +norecurse), the server should only return what it knows directly from its own authoritative data or cache. Recursive resolvers check this flag - if set, they'll perform full resolution; if not set, they'll only return cached results or referrals. Authoritative-only servers might ignore this flag. You can see the RD flag in dig output in the flags section."
    },
    {
      question: "What DNS server software does Pi-hole use by default?",
      options: [
        "BIND 9",
        "Unbound",
        "dnsmasq (or optionally Unbound)",
        "PowerDNS"
      ],
      correct: 2,
      explanation: "Pi-hole uses dnsmasq as its default DNS server, though it can be configured to use Unbound instead. dnsmasq is lightweight and perfect for Pi-hole's use case - it forwards queries to upstream DNS servers while checking requests against blocklists first. If a domain is on the blocklist, Pi-hole returns 0.0.0.0 instead of forwarding the query. Many users install Unbound alongside Pi-hole for additional privacy and DNSSEC validation. The combination of Pi-hole (for ad blocking) + Unbound (for recursive resolution with DNSSEC) is popular because it eliminates dependency on upstream DNS providers while still blocking ads."
    },
    {
      question: "What is DNS over TLS (DoT) and how does it differ from DoH?",
      options: [
        "They are the same thing",
        "DoT uses dedicated port 853, DoH uses port 443 (HTTPS)",
        "DoT is faster than DoH",
        "DoT is deprecated"
      ],
      correct: 1,
      explanation: "DNS over TLS (DoT) encrypts DNS queries using TLS on dedicated port 853, while DNS over HTTPS (DoH) encrypts queries inside HTTPS on port 443. Both provide privacy and security, but differ in approach: DoT is more easily identifiable as DNS traffic (port 853) and can be blocked or allowed separately from web traffic. DoH blends into HTTPS traffic, making it harder to distinguish or block. Network administrators prefer DoT because it's transparent - they can see DoT is being used even if they can't see the queries. DoH is preferred for censorship resistance. Both require supporting clients and servers. Cloudflare and Google support both protocols."
    },
    {
      question: "What does 'dig +stats' show you?",
      options: [
        "Domain statistics",
        "Query statistics including time, size, and flags",
        "Server performance metrics",
        "Historical DNS data"
      ],
      correct: 1,
      explanation: `The '+stats' option (which is on by default) shows statistics about the DNS query at the bottom of dig output: query time (how long the query took in milliseconds), server queried, when it was queried, message size (bytes sent/received), and flags. This information helps troubleshoot performance issues. If query time is consistently high, there might be network issues or a slow DNS server. You can disable it with '+nostats' for cleaner output. The stats section also shows the 'MSG SIZE rcvd' which is useful for understanding response sizes and checking if responses are being truncated (TC flag) requiring TCP instead of UDP.`
    },
    {
      question: "What is the purpose of a DS (Delegation Signer) record in DNSSEC?",
      options: [
        "Signs email messages",
        "Establishes the chain of trust from parent zone to child zone",
        "Delegates subdomains",
        "It's a deprecated record type"
      ],
      correct: 1,
      explanation: `DS (Delegation Signer) records are crucial for DNSSEC's chain of trust. They're placed in the PARENT zone and contain a hash of the child zone's public key (DNSKEY). For example, the ${domains.tld} zone would have a DS record for ${domains.primary}, containing a hash of ${domains.primary}'s DNSKEY. This connects the trust chain: root signs TLD's DS record, TLD signs your domain's DS record, your domain signs its own records. Without DS records in the parent zone, there's a break in the chain of trust. When you enable DNSSEC for your domain, you must submit DS records to your registrar so they can publish them in the TLD zone. Query with: 'dig +dnssec ${domains.primary} DS'.`
    },
    {
      question: "How do you perform a reverse DNS lookup using dig?",
      options: [
        "dig -r 10.0.1.1",
        "dig -x 10.0.1.1",
        "dig reverse 10.0.1.1",
        "dig 10.0.1.1 PTR"
      ],
      correct: 1,
      explanation: "Use 'dig -x IP_ADDRESS' for reverse lookups. dig automatically converts the IP to the proper format. 'dig -x 10.0.1.11' automatically queries for '11.1.0.10.in-addr.arpa PTR'. This is much easier than manually constructing the reverse zone name. Reverse lookups are important for: (1) Mail servers - spam filters check reverse DNS, (2) Logging - converting IPs to hostnames in logs, (3) Security - verifying IP/hostname relationships, (4) Troubleshooting - confirming PTR records are configured correctly. You can also specify a server: 'dig -x 10.0.1.11 @10.0.1.1' to check reverse DNS on your local BIND server."
    },
    {
      question: "What is the purpose of NAPTR records?",
      options: [
        "Network address translation",
        "Name Authority Pointer - used for ENUM, SIP, and complex rewrite rules",
        "Network performance testing",
        "They're deprecated"
      ],
      correct: 1,
      explanation: "NAPTR (Name Authority Pointer) records provide rule-based rewriting of domain names, primarily used for ENUM (telephone number mapping) and SIP (VoIP). They're complex records with fields for order, preference, flags, service, regexp (regular expression), and replacement. For example, ENUM uses NAPTR to convert phone numbers to SIP URIs or email addresses. The records can chain together, with each step transforming the query until reaching a final answer. While less common than A or MX records, NAPTR is crucial in telecommunications and VoIP systems. Most homelab users won't need them unless running VoIP infrastructure or ENUM services."
    },
    {
      question: "What does the 'dig +tcp' option do?",
      options: [
        "Forces dig to use TCP instead of UDP for the query",
        "Tests TCP connectivity",
        "Queries only TCP services",
        "It's an invalid option"
      ],
      correct: 0,
      explanation: "The '+tcp' flag forces dig to use TCP for the DNS query instead of the default UDP. DNS normally uses UDP for efficiency, but falls back to TCP for large responses (over 512 bytes for traditional DNS, or when the TC (truncated) flag is set). You might manually force TCP to: (1) Test if TCP queries work (firewalls might block TCP/53), (2) Test large zone transfers (AXFR requires TCP), (3) Troubleshoot truncation issues, (4) Verify server supports TCP. Example: 'dig +tcp ${domains.secondary}'. TCP queries have slightly higher overhead but are more reliable for large responses. Some security tools block TCP/53 to prevent zone transfers, so testing both protocols is useful."
    },
    {
      question: "What is Quad9 (9.9.9.9) and what makes it different from other public DNS services?",
      options: [
        "A gaming DNS service",
        "A privacy-focused DNS service that blocks malicious domains",
        "The fastest DNS resolver",
        "A corporate DNS only"
      ],
      correct: 1,
      explanation: "Quad9 (9.9.9.9) is a free, privacy-focused public DNS resolver operated by a nonprofit. Unlike Google (8.8.8.8) and Cloudflare (1.1.1.1) which focus on speed, Quad9 emphasizes security and privacy. It automatically blocks access to malicious domains using threat intelligence from multiple sources, protecting users from phishing, malware, and botnets. Quad9: (1) Doesn't log IP addresses, (2) Blocks known bad domains, (3) Supports DNSSEC, (4) Offers DoH and DoT, (5) Is nonprofit/privacy-focused. It's slower than Cloudflare but provides built-in threat protection. Good choice for homelabs wanting security without maintaining blocklists like Pi-hole."
    },
    {
      question: "What does the '+search' option do in dig?",
      options: [
        "Searches for the domain on Google",
        "Uses the search domains from resolv.conf to try different suffixes",
        "Performs a deep DNS search",
        "It's deprecated"
      ],
      correct: 1,
      explanation: `The '+search' option tells dig to use the search domains from /etc/resolv.conf. If your resolv.conf has 'search ${domains.primary} ${domains.cluster}' and you run 'dig +search webserver', dig will try: (1) webserver.${domains.primary}, (2) webserver.${domains.cluster}, (3) webserver (as-is). This mimics how applications normally resolve names. By default, dig does NOT use search domains (+nosearch is default), which differs from how ping or ssh work. This can cause confusion - 'ping webserver' might work but 'dig webserver' fails because dig doesn't automatically append search domains. Use '+search' to troubleshoot why applications can resolve names that dig cannot.`
    },
    {
      question: "What is the purpose of the '$ORIGIN' directive in BIND zone files?",
      options: [
        "Specifies the server's IP address",
        "Sets the base domain name that @ and relative names refer to",
        "Defines the origin country",
        "It's optional and unused"
      ],
      correct: 1,
      explanation: `The $ORIGIN directive in zone files sets what the @ symbol and relative names refer to. If you have '$ORIGIN ${domains.cluster}' in a zone file, then '@' means '${domains.cluster}' and relative names like 'api' become 'api.${domains.cluster}'. You can change $ORIGIN multiple times in a zone file to organize records. This is useful when including multiple subdomains in one file: '$ORIGIN apps.${domains.cluster}' followed by records, then '$ORIGIN services.${domains.cluster}' for another section. If $ORIGIN isn't specified, it defaults to the zone name from named.conf. The $ORIGIN must be a fully qualified domain name (end with a dot): '$ORIGIN ${domains.cluster}.' not '$ORIGIN ${domains.cluster}'.`
    },
    {
      question: "What is Google Public DNS (8.8.8.8) and why might you use it?",
      options: [
        "A private DNS for Google services only",
        "A free, fast, global anycast DNS resolver with good uptime",
        "A paid DNS service",
        "Only for Android devices"
      ],
      correct: 1,
      explanation: "Google Public DNS (8.8.8.8 and 8.8.4.4) is a free, globally distributed anycast DNS resolver launched in 2009. It's known for: (1) Speed - extensive global infrastructure with low latency, (2) Reliability - excellent uptime and DDoS protection, (3) Security - DNSSEC validation, (4) Standards compliance - follows RFCs strictly. However, privacy-conscious users avoid it because Google logs queries (they claim for 24-48 hours for troubleshooting). Alternative use cases: (1) Upstream resolver for Pi-hole or BIND, (2) Fallback DNS, (3) Testing/troubleshooting, (4) When ISP DNS is unreliable. Supports both IPv4 (8.8.8.8) and IPv6 (2001:4860:4860::8888), plus DoH and DoT."
    },
    {
      question: "What does the 'AA' flag in a DNS response mean?",
      options: [
        "Anonymous Access",
        "Authoritative Answer - from an authoritative server",
        "Always Available",
        "Authenticated Answer"
      ],
      correct: 1,
      explanation: `The 'AA' (Authoritative Answer) flag indicates the responding server is authoritative for the queried zone - it owns the official data, not a cached copy. In dig output: 'flags: qr aa rd ra' shows the AA flag is set. When you query your BIND server for ${domains.primary} records, you should see AA because it's authoritative for that zone. When querying for google.com, you won't see AA from your BIND server (it's recursing/forwarding). If you query Google's nameservers directly for google.com, you WILL see AA. This flag helps verify: (1) You're querying the right server, (2) Answers are official, not cached, (3) Delegation is working correctly.`
    },
    {
      question: "What is AdGuard DNS and how does it compare to Pi-hole?",
      options: [
        "A DNS server software you install",
        "A cloud-based DNS service with ad blocking (vs Pi-hole which is self-hosted)",
        "A VPN service",
        "A monitoring tool"
      ],
      correct: 1,
      explanation: "AdGuard DNS is a cloud-based DNS service (94.140.14.14, 94.140.15.15) that blocks ads and trackers at the DNS level, similar to what Pi-hole does but hosted by AdGuard instead of on your network. Differences: Pi-hole is self-hosted (you control it, customize blocklists, see local stats), AdGuard DNS is cloud-hosted (easier setup, no maintenance, but less control). Pi-hole gives you full visibility and customization of what's blocked. AdGuard DNS is good for: (1) Devices outside your network, (2) Quick setup without hardware, (3) Mobile devices. However, your DNS queries go to AdGuard (privacy trade-off). You could use AdGuard DNS as upstream for Pi-hole (combining benefits), or use Pi-hole at home and AdGuard DNS when traveling."
    },
    {
      question: "What is the maximum length of a DNS name (FQDN)?",
      options: [
        "63 characters",
        "255 characters",
        "253 characters (255 including length bytes)",
        "512 characters"
      ],
      correct: 2,
      explanation: "DNS names (FQDNs - Fully Qualified Domain Names) have a maximum total length of 253 characters in text representation (255 in wire format, which includes length bytes). Additionally, each label (part between dots) can be at most 63 characters. So 'www.example.com' has three labels: 'www' (3), 'example' (7), 'com' (3). While you COULD create very long domains like 'this-is-a-really-long-subdomain-name-that-approaches-the-63-character-limit.example.com', practical domains are much shorter for usability. These limits are defined in RFC 1035 and are fundamental to DNS protocol design. Hitting these limits is rare but can occur with auto-generated subdomains or overly specific naming schemes."
    },
    {
      question: "What does 'dig +bufsize=4096' do?",
      options: [
        "Increases cache size",
        "Sets EDNS buffer size for receiving larger responses via UDP",
        "Limits query size",
        "It's an invalid option"
      ],
      correct: 1,
      explanation: "The '+bufsize' option sets the EDNS0 (Extension Mechanisms for DNS) buffer size, telling the server how large a UDP response you can accept. Traditional DNS over UDP is limited to 512 bytes, but EDNS0 allows larger responses. '+bufsize=4096' means you can accept UDP responses up to 4096 bytes. This is important for: (1) DNSSEC responses (which are large due to signatures), (2) Large TXT records, (3) Responses with many IPs. Without EDNS0, servers must truncate large responses (set TC flag) forcing a TCP retry. Most modern resolvers negotiate larger buffer sizes automatically. You might manually set it to test: (1) If large responses work, (2) What buffer size a server supports, (3) Path MTU issues."
    },
    {
      question: "What is Cloudflare DNS (1.1.1.1) known for?",
      options: [
        "Being the cheapest",
        "Being one of the fastest public DNS resolvers with strong privacy focus",
        "Best for gaming only",
        "Enterprise-only service"
      ],
      correct: 1,
      explanation: "Cloudflare DNS (1.1.1.1 and 1.0.0.1) launched in 2018 as one of the fastest public DNS resolvers with a strong privacy commitment. Key features: (1) Speed - consistently ranks as fastest or near-fastest in benchmarks globally, (2) Privacy - commits to not logging IP addresses, purges logs within 24 hours, (3) Security - DNSSEC validation, (4) Free - no cost for public or premium versions, (5) Modern protocols - supports DoH and DoT, (6) Malware blocking - 1.1.1.2 variant blocks malware, (7) Family filtering - 1.1.1.3 blocks adult content. Popular choice for upstream resolver in Pi-hole, BIND, and Unbound. The 1.1.1.1 IP is easy to remember and type, contributing to its popularity in homelabs and enterprise."
    }
  ];

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizComplete(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "Perfect! You've mastered DNS! 🎉";
    if (percentage >= 80) return "Excellent work! You have a strong grasp of DNS concepts. 🌟";
    if (percentage >= 60) return "Good job! You understand the fundamentals. Keep practicing! 👍";
    if (percentage >= 40) return "Not bad! Review the explanations and try again. 📚";
    return "Keep learning! DNS takes time to master. Review and retry! 💪";
  };

  if (quizComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete! 🎓</h2>
          <div className="bg-white rounded-lg p-8 mb-6 shadow">
            <p className="text-6xl font-bold text-indigo-600 mb-2">{score}/{questions.length}</p>
            <p className="text-xl text-gray-600 mb-4">
              {Math.round((score / questions.length) * 100)}% correct
            </p>
            <p className="text-lg text-gray-700">{getScoreMessage()}</p>
          </div>
          <button
            onClick={handleRestart}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={20} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isCorrect = selectedAnswer === currentQ.correct;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg">
      {/* Domain Info Panel */}
      <div className="mb-4 bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">📚 Domains used in this quiz:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div><span className="font-mono bg-indigo-50 px-2 py-0.5 rounded">{domains.primary}</span> <span className="text-gray-500">- Primary homelab domain</span></div>
          <div><span className="font-mono bg-indigo-50 px-2 py-0.5 rounded">{domains.cluster}</span> <span className="text-gray-500">- OKD cluster subdomain</span></div>
          <div><span className="font-mono bg-indigo-50 px-2 py-0.5 rounded">{domains.secondary}</span> <span className="text-gray-500">- Public website domain</span></div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">DNS Knowledge Quiz</h2>
          <div className="text-sm font-semibold text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-right text-sm text-gray-600">
          Score: {score}/{currentQuestion + (showExplanation ? 1 : 0)}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">{currentQ.question}</h3>
        
        <div className="space-y-3">
          {currentQ.options.map((option, index) => {
            let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition ";
            
            if (showExplanation) {
              if (index === currentQ.correct) {
                buttonClass += "border-green-500 bg-green-50 text-green-900";
              } else if (index === selectedAnswer) {
                buttonClass += "border-red-500 bg-red-50 text-red-900";
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
              }
            } else {
              buttonClass += selectedAnswer === index
                ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                : "border-gray-300 hover:border-indigo-300 hover:bg-indigo-50";
            }

            return (
              <button
                key={index}
                onClick={() => !showExplanation && handleAnswer(index)}
                disabled={showExplanation}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {showExplanation && index === currentQ.correct && (
                    <CheckCircle className="text-green-600" size={24} />
                  )}
                  {showExplanation && index === selectedAnswer && index !== currentQ.correct && (
                    <XCircle className="text-red-600" size={24} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showExplanation && (
        <div className={`rounded-lg p-6 mb-6 ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
          <div className="flex items-start gap-3 mb-3">
            {isCorrect ? (
              <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={24} />
            ) : (
              <XCircle className="text-red-600 mt-1 flex-shrink-0" size={24} />
            )}
            <div>
              <h4 className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                {isCorrect ? 'Correct! ✓' : 'Not quite...'}
              </h4>
              <p className={`${isCorrect ? 'text-green-800' : 'text-red-800'} leading-relaxed`}>
                {currentQ.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {showExplanation && (
        <button
          onClick={handleNext}
          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
        >
          {currentQuestion < questions.length - 1 ? (
            <>
              Next Question
              <ArrowRight size={20} />
            </>
          ) : (
            'See Results'
          )}
        </button>
      )}
    </div>
  );
};

export default DNSQuiz;