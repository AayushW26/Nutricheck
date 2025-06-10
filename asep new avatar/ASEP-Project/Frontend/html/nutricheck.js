let html5QrcodeScanner = null;

function startScanner() {
    if (html5QrcodeScanner) {
        // Scanner already exists, stop it first
        html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
    }
    
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: 250 });
    html5QrcodeScanner.render(onScanSuccess);
}

function stopScanner() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
    }
}
