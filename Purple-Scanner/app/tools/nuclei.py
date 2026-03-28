import json
from .base import BaseTool

class NucleiTool(BaseTool):
    def run(self):
        cmd = ['nuclei', '-u', self.target, '-json', '-severity', 'low,medium,high,critical', '-silent']
        stdout, stderr, code = self._run_cmd(cmd, timeout=300)
        if code != 0:
            self.log_error(f"Nuclei failed: {stderr}")
            return
        for line in stdout.splitlines():
            try:
                item = json.loads(line)
                sev = item.get('info', {}).get('severity', 'medium')
                name = item.get('info', {}).get('name', 'Nuclei finding')
                desc = item.get('info', {}).get('description', '')
                matched = item.get('matched-at', self.target)
                self.save_finding(sev, name, desc[:500], matched)
            except json.JSONDecodeError:
                pass
