from flask import Flask, render_template, jsonify, Response
import speedtest
import socket
import psutil
import time
import json

app = Flask(__name__)

def convert_units(bits):
    """ Convert speed to various units """
    units = ["Bit", "Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte",
             "Petabyte", "Exabyte", "Zettabyte", "Yottabyte"]
    
    values = [bits]  # Store converted values

    for i in range(9):  # Convert to next unit
        bits /= 1000
        values.append(round(bits, 4))

    return dict(zip(units, values))

def get_ip_details():
    """ Get local IP and hostname """
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    return {"hostname": hostname, "local_ip": local_ip}

def get_network_info():
    """ Get sent & received data in bytes """
    net_io = psutil.net_io_counters()
    return {
        "bytes_sent": net_io.bytes_sent,
        "bytes_recv": net_io.bytes_recv
    }

def run_speed_test():
    """ Run speed test and return results in real-time """
    st = speedtest.Speedtest()
    st.get_best_server()

    yield json.dumps({"progress": 10}) + "\n"
    time.sleep(1)

    yield json.dumps({"progress": 30}) + "\n"
    time.sleep(1)

    download_bits = st.download()
    yield json.dumps({"progress": 60}) + "\n"
    time.sleep(1)

    upload_bits = st.upload()
    yield json.dumps({"progress": 90}) + "\n"
    time.sleep(1)

    ping = st.results.ping
    yield json.dumps({
        "progress": 100,
        "download": convert_units(download_bits),
        "upload": convert_units(upload_bits),
        "ping": round(ping, 2),
        "ip_details": get_ip_details(),
        "network_info": get_network_info()
    }) + "\n"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/test-speed")
def test_speed():
    """ Stream real-time progress updates """
    return Response(run_speed_test(), mimetype="text/event-stream")

if __name__ == "__main__":
    app.run(debug=True)
