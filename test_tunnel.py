import sys
import os
import json
import time
import urllib.request
import urllib.error
import ssl

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def print_header(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def test_url(target_url, use_vite_proxy=False, vite_port=5173):
    target_url = target_url.strip().rstrip('/')
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    if use_vite_proxy:
        print_header(f"TEST 2: Vite Local Proxy Test (http://127.0.0.1:{vite_port}/tunnel-api)")
        req_url = f"http://127.0.0.1:{vite_port}/tunnel-api/api/library"
        headers = {
            'x-target-url': target_url,
            'Accept': 'application/json',
            'User-Agent': 'TunnelTester/1.0'
        }
        timeout_sec = 4
    else:
        print_header(f"TEST 1: Direct Tunnel Connection ({target_url})")
        req_url = f"{target_url}/api/library"
        headers = {
            'bypass-tunnel-reminder': 'true',
            'Bypass-Tunnel-Reminder': 'true',
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'curl/7.68.0',
            'Accept': 'application/json'
        }
        timeout_sec = 60

    print(f"Request URL : {req_url}")
    print(f"Headers     : {json.dumps(headers, indent=2)}")
    
    start_time = time.time()
    req = urllib.request.Request(req_url, headers=headers, method='GET')
    
    try:
        with urllib.request.urlopen(req, timeout=timeout_sec, context=ctx) as response:
            elapsed = (time.time() - start_time) * 1000
            status = response.status
            content_type = response.headers.get('Content-Type', '')
            raw_body = response.read().decode('utf-8', errors='replace')
            
            print(f"\n[OK] SUCCESS!")
            print(f"Status Code  : {status}")
            print(f"Latency      : {elapsed:.1f} ms")
            print(f"Content-Type : {content_type}")
            
            try:
                data = json.loads(raw_body)
                if isinstance(data, list):
                    print(f"Received JSON array with {len(data)} items.")
                    if len(data) > 0:
                        print(f"First item sample: {json.dumps(data[0], indent=2)}")
                else:
                    print(f"Response data: {json.dumps(data, indent=2)}")
            except json.JSONDecodeError:
                print(f"Raw Output (first 300 chars):\n{raw_body[:300]}")
            return True

    except urllib.error.HTTPError as e:
        elapsed = (time.time() - start_time) * 1000
        print(f"\n[FAIL] HTTP Error {e.code}: {e.reason} ({elapsed:.1f} ms)")
        try:
            err_body = e.read().decode('utf-8', errors='replace')
            print(f"Error Body: {err_body[:300]}")
        except Exception:
            pass
        return False

    except urllib.error.URLError as e:
        elapsed = (time.time() - start_time) * 1000
        print(f"\n[FAIL] URL / Network Error: {e.reason} ({elapsed:.1f} ms)")
        return False

    except Exception as e:
        elapsed = (time.time() - start_time) * 1000
        print(f"\n[FAIL] Unexpected Error: {type(e).__name__}: {e} ({elapsed:.1f} ms)")
        return False

def main():
    if len(sys.argv) > 1:
        target_url = sys.argv[1]
    else:
        print_header("CineGrade Colab / Jupyter Tunnel Tester")
        target_url = input("Enter your Tunnel URL (e.g. https://xxxx.loca.lt): ").strip()
    
    if not target_url:
        print("No URL entered. Exiting.")
        sys.exit(1)
        
    if "colab.research.google.com" in target_url:
        print("\n[!] NOTE: You entered the Google Colab notebook webpage link.")
        print("You need to run Cell 2 inside Colab and copy the generated 'loca.lt' URL printed in its output (e.g., https://cute-bugs-send.loca.lt).")
        return
        
    print(f"\nTarget Tunnel: {target_url}")
    
    # 1. Direct Test
    direct_ok = test_url(target_url, use_vite_proxy=False)
    
    # 2. Vite Proxy Test
    proxy_ok = test_url(target_url, use_vite_proxy=True)
    
    print_header("TEST RESULTS SUMMARY")
    print(f"1. Direct Tunnel Endpoint : {'[PASS] WORKING' if direct_ok else '[FAIL] FAILED'}")
    print(f"2. Vite Proxy Integration : {'[PASS] WORKING' if proxy_ok else '[FAIL] FAILED (Make sure Vite dev server is running)'}")
    
    if direct_ok and proxy_ok:
        print("\nAll tests passed! You are ready to connect in the web app.")
    elif direct_ok:
        print("\nDirect tunnel is 100% WORKING and serving your presets library!")
        print("To test the web app locally, start your dev server with: npm run dev")
    else:
        print("\nTunnel connection failed. Check if Colab/Jupyter notebook is currently running cell 2.")

if __name__ == '__main__':
    main()
