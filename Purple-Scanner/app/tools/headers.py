import requests
from .base import BaseTool

class HeadersTool(BaseTool):
    REQUIRED_HEADERS = {
        'Strict-Transport-Security': ('high', 'Missing HSTS header — site vulnerable to downgrade attacks'),
        'Content-Security-Policy': ('medium', 'Missing CSP header — increases XSS risk'),
        'X-Content-Type-Options': ('medium', 'Missing X-Content-Type-Options — MIME sniffing possible'),
        'X-Frame-Options': ('medium', 'Missing X-Frame-Options — clickjacking possible'),
        'Referrer-Policy': ('low', 'Missing Referrer-Policy header'),
        'Permissions-Policy': ('low', 'Missing Permissions-Policy header'),
    }
    LEAK_HEADERS = ['server', 'x-powered-by', 'x-aspnet-version', 'x-aspnetmvc-version']

    def run(self):
        try:
            resp = requests.get(self.target, timeout=10, headers={'User-Agent': 'Mozilla/5.0 VulnScanner'})
            headers = {k.lower(): v for k, v in resp.headers.items()}
            for header, (severity, desc) in self.REQUIRED_HEADERS.items():
                if header.lower() not in headers:
                    self.save_finding(severity, f'Missing: {header}', desc, self.target)
                else:
                    self.save_finding('info', f'Present: {header}', headers[header.lower()], self.target)
            for leak in self.LEAK_HEADERS:
                if leak in headers:
                    self.save_finding('low', f'Info leak: {leak}: {headers[leak]}',
                                      'Exposing server software aids fingerprinting.', self.target)
        except Exception as e:
            self.save_finding('info', 'Header check failed', str(e))
