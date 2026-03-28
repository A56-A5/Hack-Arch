import json
import os
from .base import BaseTool

class SSLyzeTool(BaseTool):
    def run(self):
        hostname = self.target.split('://')[-1].split('/')[0]
        tmp_file = f'/tmp/sslyze_{self.scan_id}.json'
        cmd = ['sslyze', '--json_out', tmp_file, hostname]
        stdout, stderr, code = self._run_cmd(cmd, timeout=60)
        if code != 0:
            self.log_error(f"SSLyze failed: {stderr}")
            return
        try:
            with open(tmp_file) as f:
                data = json.load(f)
            for server_scan in data.get('server_scan_results', []):
                result = server_scan.get('scan_result', {})
                # Check for weak protocols
                for proto in ['ssl_2_0_cipher_suites', 'ssl_3_0_cipher_suites', 'tls_1_0_cipher_suites']:
                    proto_result = result.get(proto, {}).get('result', {})
                    accepted = proto_result.get('accepted_cipher_suites', [])
                    if accepted:
                        proto_name = proto.replace('_cipher_suites', '').replace('_', '.')
                        self.save_finding('high',
                                          f'Weak protocol accepted: {proto_name}',
                                          f'{len(accepted)} cipher suites accepted on deprecated protocol',
                                          hostname)
                # Heartbleed
                hb = result.get('heartbleed', {}).get('result', {})
                if hb.get('is_vulnerable_to_heartbleed'):
                    self.save_finding('critical', 'Heartbleed (CVE-2014-0160)',
                                      'Server is vulnerable to Heartbleed.', hostname)
        except Exception as e:
            self.log_error(f"SSLyze parse error: {e}")
        finally:
            if os.path.exists(tmp_file):
                os.unlink(tmp_file)
