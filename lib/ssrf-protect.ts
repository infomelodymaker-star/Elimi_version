/**
 * Server-Side Request Forgery (SSRF) Protection Utility.
 * Validates URLs against private network IP ranges, link-local addresses,
 * metadata services, loopback hosts, and internal domain patterns.
 */

const PRIVATE_IP_PATTERNS = [
  /^127\./,                         // Loopback 127.0.0.0/8
  /^10\./,                          // Private 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private 172.16.0.0/12
  /^192\.168\./,                    // Private 192.168.0.0/16
  /^169\.254\./,                    // Link-local / Cloud Metadata 169.254.0.0/16
  /^0\./,                           // Zero address 0.0.0.0/8
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // Shared CGNAT 100.64.0.0/10
  /^192\.0\.0\./,                   // IETF Protocol Assignments
  /^192\.0\.2\./,                   // TEST-NET-1
  /^198\.51\.100\./,                // TEST-NET-2
  /^203\.0\.113\./,                 // TEST-NET-3
  /^224\./,                         // Multicast 224.0.0.0/4
  /^240\./,                         // Reserved 240.0.0.0/4
  /^255\.255\.255\.255$/,          // Broadcast
];

const DISALLOWED_HOSTNAMES = [
  'localhost',
  'localhost.localdomain',
  'broadcasthost',
  'metadata.google.internal',
  'metadata.internal',
  '169.254.169.254',
  'instance-data',
  '0.0.0.0',
  '::1',
  'ip6-localhost',
  'ip6-loopback',
];

export function isSafePublicUrl(urlString: string): { safe: boolean; reason?: string; url?: URL } {
  try {
    const trimmed = urlString.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return { safe: false, reason: 'Invalid protocol. Only HTTP and HTTPS are permitted.' };
    }

    const parsed = new URL(trimmed);

    // Enforce HTTP / HTTPS protocol
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Disallowed URL scheme.' };
    }

    const hostname = parsed.hostname.toLowerCase().trim();

    // Check disallowed hostnames
    if (DISALLOWED_HOSTNAMES.includes(hostname)) {
      return { safe: false, reason: 'Host access restricted (internal host).' };
    }

    // Disallow internal domain extensions
    if (
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.lan') ||
      hostname.endsWith('.home') ||
      hostname.endsWith('.corp')
    ) {
      return { safe: false, reason: 'Access to internal domain zones is forbidden.' };
    }

    // Check numeric IPv4 addresses against private/reserved ranges
    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return { safe: false, reason: 'Access to non-public/private IP addresses is forbidden.' };
      }
    }

    // Disallow raw IPv6 brackets or local addresses
    if (hostname.startsWith('[') || hostname.includes(':')) {
      if (
        hostname === '[::1]' ||
        hostname.startsWith('[fc00:') ||
        hostname.startsWith('[fd00:') ||
        hostname.startsWith('[fe80:')
      ) {
        return { safe: false, reason: 'Private IPv6 addresses are forbidden.' };
      }
    }

    // Disallow non-standard ports commonly used for internal services
    if (parsed.port && !['80', '443', '8080', '8443'].includes(parsed.port)) {
      return { safe: false, reason: 'Requests restricted to standard web ports (80, 443).' };
    }

    return { safe: true, url: parsed };
  } catch {
    return { safe: false, reason: 'Malformed or invalid URL.' };
  }
}
