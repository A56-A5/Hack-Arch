import os
import requests
import time
from .base import BaseTool

class ZapTool(BaseTool):
    def run(self):
        zap_url = os.environ.get('ZAP_URL', 'http://localhost:8080')
        api_key = os.environ.get('ZAP_API_KEY', '')
        # Spider
        spider_url = f"{zap_url}/JSON/spider/action/scan/"
        params = {'url': self.target, 'maxChildren': '10', 'recurse': 'true', 'apikey': api_key}
        try:
            r = requests.get(spider_url, params=params, timeout=10)
            r.raise_for_status()
            time.sleep(15)  # wait for spider to finish (simplified)
            # Active scan
            ascan_url = f"{zap_url}/JSON/ascan/action/scan/"
            params = {'url': self.target, 'recurse': 'true', 'inScopeOnly': 'false', 'apikey': api_key}
            r = requests.get(ascan_url, params=params, timeout=10)
            r.raise_for_status()
            time.sleep(30)  # wait for scan to make progress
            # Get alerts
            alerts_url = f"{zap_url}/JSON/core/view/alerts/"
            params = {'baseurl': self.target, 'apikey': api_key}
            r = requests.get(alerts_url, params=params, timeout=10)
            r.raise_for_status()
            data = r.json()
            sev_map = {'3': 'high', '2': 'medium', '1': 'low', '0': 'info'}
            for alert in data.get('alerts', []):
                risk = sev_map.get(str(alert.get('riskcode', 0)), 'info')
                self.save_finding(risk,
                                  alert.get('name', 'ZAP alert'),
                                  alert.get('description', '')[:500],
                                  alert.get('url', self.target))
        except Exception as e:
            self.save_finding('info', 'ZAP not reachable',
                              f'Start ZAP with Docker: {e}', '')
