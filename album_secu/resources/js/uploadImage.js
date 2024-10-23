document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    async function fetchPublicKey() {
        const url = "/data";
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
            });

            const data = await response.json();

           
            if (data.success) {
                return data.publicKey;
            } else {
                console.error("Error fetching public key:", data.error);
            }
        } catch (error) {
            console.error("Request failed:", error);
        }
    }

    async function generateSymmetricKey() {
        return crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    }

    async function encryptData(key, data) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            data
        );
        return { iv, encryptedData };
    }

    async function importPublicKey(pem) {
        const binaryDerString = window.atob(pem);
        const binaryDer = str2ab(binaryDerString);

        return crypto.subtle.importKey(
            "spki",
            binaryDer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["encrypt"]
        );
    }

    function str2ab(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    function isValidBase64(str) {
        const base64Pattern = /^[A-Za-z0-9+/=]+$/;
        return base64Pattern.test(str) && str.length % 4 === 0;
    }

    async function encryptSymmetricKey(publicKey, symmetricKey) {
        const symmetricKeyData = await crypto.subtle.exportKey(
            "raw",
            symmetricKey
        );
        return crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            symmetricKeyData
        );
    }

    async function importPrivateKey(pem) {
        const binaryDerString = window.atob(pem);
        const binaryDer = str2ab(binaryDerString);

        return crypto.subtle.importKey(
            "pkcs8",
            binaryDer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["decrypt"]
        );
    }

    async function decryptSymmetricKey(privateKey, encryptedKey) {
        return crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            encryptedKey
        );
    }

    async function decryptData(key, iv, data) {
        return crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            data
        );
    }

    function downloadFile(data, filename, type) {
        const blob = new Blob([data], { type: type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    document.querySelector("form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const publicKeyPem = await fetchPublicKey();
        if (!publicKeyPem) {
            alert("Failed to fetch public key");
            return;
        }

        const publicKey = await importPublicKey(publicKeyPem);

        const symmetricKey = await generateSymmetricKey();

        const fileInputElement = document.getElementById("formFileMultiple");

        

        const ivs = [];
        const encryptedFiles = [];

        
        let container = new DataTransfer();

        for (let file of fileInputElement.files) {
            const fileData = await file.arrayBuffer();
            const { iv, encryptedData } = await encryptData(symmetricKey, fileData);

           
            const encryptedFile = new File([encryptedData], file.name, {
                type: file.type,
                lastModified: new Date().getTime(),
            });

           
            ivs.push(iv);
            encryptedFiles.push({ encryptedData, file });

            
            container.items.add(encryptedFile);
        }

        
        fileInputElement.files = container.files;

        

        const encryptedSymmetricKey = await encryptSymmetricKey(
            publicKey,
            symmetricKey
        );
        document.getElementById("encryptedKey").value = btoa(String.fromCharCode(...new Uint8Array(encryptedSymmetricKey)));
        document.getElementById("iv").value = JSON.stringify(ivs.map(iv => Array.from(iv)));

        

       

        
        document.getElementById("albumForm").submit();
    });
});
