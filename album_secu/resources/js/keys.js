
document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault();
            generateAndSubmitKeys();
        });
    }
});

async function generateAndSubmitKeys() {
    try {
   
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: { name: "SHA-256" }
            },
            true,
            ["encrypt", "decrypt"]
        );

        const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
        const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));

      
        const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
        const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)));

     
        localStorage.setItem('privateKey', privateKeyBase64);

        downloadPrivateKey(privateKeyBase64);

        
        document.getElementById('public_key').value = publicKeyBase64;










        const passwordField = document.getElementById('password');
        const password = passwordField.value;
        const passwordHash = await hashPassword(password);


        document.getElementById('passwordHash').value = passwordHash;


        
        document.getElementById('passwordHashConfirmation').value = passwordHash;




          









        document.getElementById('register-form').submit();
    } catch (error) {
        console.error("Key generation error: ", error);
    }
}

function downloadPrivateKey(privateKeyBase64) {
    const element = document.createElement('a');
    const privateKeyBlob = new Blob([privateKeyBase64], { type: 'text/plain' });
    element.href = URL.createObjectURL(privateKeyBlob);
    element.download = document.getElementById('name').value + '_private_key.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}




async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
