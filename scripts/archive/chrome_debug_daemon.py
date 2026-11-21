import subprocess
import time
import sys

cmd = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    '--headless=new',
    '--remote-debugging-port=9222',
    r'--user-data-dir=C:\Users\Luthfi\.chrome-debug-profile',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-allow-origins=*'
]

print('[DAEMON] Starting Chrome Headless on port 9222...')
proc = subprocess.Popen(cmd)
try:
    proc.wait()
except KeyboardInterrupt:
    proc.terminate()
