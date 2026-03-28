import subprocess
import shlex

class BaseTool:
    def __init__(self, scan_id, target, save_callback):
        self.scan_id = scan_id
        self.target = target
        self.save = save_callback  # function to save finding

    def run(self):
        raise NotImplementedError

    def _run_cmd(self, cmd, timeout=120):
        """Run command with list arguments, return stdout, stderr, returncode."""
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
            return proc.stdout, proc.stderr, proc.returncode
        except subprocess.TimeoutExpired:
            return '', 'TIMEOUT', -1
        except FileNotFoundError:
            return '', 'TOOL_NOT_FOUND', -1

    def save_finding(self, severity, title, description='', evidence=''):
        self.save(self.scan_id, self.__class__.__name__, severity, title, description, evidence)

    def log_error(self, msg):
        self.save_finding('info', f'Error: {msg}', msg)
