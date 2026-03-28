import json
import os
from .base import BaseTool

class NiktoTool(BaseTool):
    def run(self):
        # Nikto JSON output to a temporary file
        tmp_file = f'/tmp/nikto_{self.scan_id}.json'
        cmd = ['nikto', '-h', self.target, '-Format', 'json', '-output', tmp_file]
        stdout, stderr, code = self._run_cmd(cmd, timeout=180)
        if code != 0:
            self.log_error(f"Nikto failed: {stderr}")
            return
        try:
            with open(tmp_file) as f:
                data = json.load(f)
            for vuln in data.get('vulnerabilities', []):
                self.save_finding('medium',
                                  vuln.get('msg', 'Nikto finding'),
                                  vuln.get('namelink', ''),
                                  vuln.get('uri', ''))
        except Exception:
            # Fallback to parse plain text output
            for line in stdout.splitlines():
                if line.startswith('+ ') and len(line) > 3:
                    severity = 'high' if any(k in line.lower() for k in ['xss', 'sql', 'inject']) else 'medium'
                    self.save_finding(severity, line[2:100], line[2:], self.target)
        finally:
            if os.path.exists(tmp_file):
                os.unlink(tmp_file)
