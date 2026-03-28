import json
import os
from .base import BaseTool

class WhatWebTool(BaseTool):
    def run(self):
        tmp_file = f'/tmp/whatweb_{self.scan_id}.json'
        cmd = ['whatweb', '--log-json', tmp_file, self.target]
        stdout, stderr, code = self._run_cmd(cmd, timeout=60)
        if code != 0:
            self.log_error(f"WhatWeb failed: {stderr}")
            return
        try:
            with open(tmp_file) as f:
                for line in f:
                    item = json.loads(line)
                    plugins = item.get('plugins', {})
                    for name, info in plugins.items():
                        versions = info.get('version', [])
                        if versions:
                            self.save_finding('info',
                                              f'Technology detected: {name} {versions[0]}',
                                              f'Version info may reveal attack surface.',
                                              self.target)
        except Exception as e:
            self.log_error(f"WhatWeb parse error: {e}")
        finally:
            if os.path.exists(tmp_file):
                os.unlink(tmp_file)
