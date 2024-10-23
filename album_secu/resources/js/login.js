document.addEventListener('DOMContentLoaded', async function () {


    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();





    const passwordField = document.getElementById('password');
    const password = passwordField.value;
    const passwordHash = await hashPassword(password);

    document.getElementById('passwordHash').value = passwordHash;




    document.getElementById('login-form').submit();







    
    
     });



   




    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }




});