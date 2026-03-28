import xml.etree.ElementTree as ET
from .base import BaseTool

class NmapTool(BaseTool):
    def run(self):
        # Build command as list
        cmd = ['nmap', '-sV', '--script=vuln', '-oX', '-', self.target]
        stdout, stderr, code = self._run_cmd(cmd, timeout=180)
        if code != 0:
            self.log_error(f"Nmap failed: {stderr}")
            return
        try:
            root = ET.fromstring(stdout)
            for host in root.findall('host'):
                for port in host.findall('.//port'):
                    state = port.find('state')
                    service = port.find('service')
                    portid = port.get('portid')
                    if state is not None and state.get('state') == 'open':
                        svc_name = service.get('name', 'unknown') if service is not None else 'unknown'
                        svc_version = service.get('version', '') if service is not None else ''
                        self.save_finding('info',
                                          f'Open port {portid}/{svc_name}',
                                          f'Service: {svc_name} {svc_version}',
                                          f'port={portid}')
                    # Script output (vuln findings)
                    for script in port.findall('script'):
                        script_id = script.get('id', '')
                        script_out = script.get('output', '')
                        if 'VULNERABLE' in script_out.upper():
                            self.save_finding('high',
                                              f'Vulnerability: {script_id}',
                                              script_out[:500],
                                              f'port={portid}')
        except ET.ParseError:
            if stdout:
                self.save_finding('info', 'Nmap raw output', stdout[:1000])
