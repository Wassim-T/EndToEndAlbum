document.addEventListener("DOMContentLoaded", function () {
    

    let finalAlbum = [];

    async function fetchImages() {
        const url = "/dataImage";

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
                displayImages(data.images);
            } else {
                console.error("Error fetching images:", data.error);
            }
        } catch (error) {
            console.error("Request failed:", error);
        }
    }

    function str2ab(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    async function getPrivateKey() {
        const privateKeyBase64 = localStorage.getItem('privateKey');
        if (!privateKeyBase64) {
            throw new Error('No private key found in local storage');
        }

        const binaryDerString = window.atob(privateKeyBase64);
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

    function isValidBase64(str) {
        const base64Pattern = /^[A-Za-z0-9+/=]+$/;
        return base64Pattern.test(str) && str.length % 4 === 0;
    }

    async function decryptImage(encryptedImage, encryptedKey, iv) {
        try {
            const privateKey = await getPrivateKey();
            const encryptedSymmetricKey = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
            const decryptedSymmetricKeyBuffer = await window.crypto.subtle.decrypt(
                { name: 'RSA-OAEP' },
                privateKey,
                encryptedSymmetricKey
            );

            const symmetricKey = await window.crypto.subtle.importKey(
                'raw',
                decryptedSymmetricKeyBuffer,
                { name: 'AES-GCM' },
                true,
                ['decrypt']
            );

            const ivArray = iv.split(",");
            const ivIntArray = ivArray.map(Number);
            const ivBuffer = new Uint8Array(ivIntArray);
            const encryptedBytes = Uint8Array.from(atob(encryptedImage), c => c.charCodeAt(0));

            const decryptedImageData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: ivBuffer },
                symmetricKey,
                encryptedBytes
            );

            return URL.createObjectURL(new Blob([decryptedImageData]));
        } catch (error) {
            console.error("Error decrypting image:", error);
        }
    }

    async function decryptText(encryptedText) {
        try {
            const privateKey = await getPrivateKey();
            const encryptedTextBytes = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
            const decryptedTextBuffer = await window.crypto.subtle.decrypt(
                { name: 'RSA-OAEP' },
                privateKey,
                encryptedTextBytes
            );

            const decryptedText = new TextDecoder().decode(decryptedTextBuffer);
            return decryptedText;
        } catch (error) {
            console.error("Error decrypting text:", error);
        }
    }


    async function displayImages(images) {
        const gallery = document.getElementById('imageGallery');
        gallery.innerHTML = '';

        const backButton = document.getElementById('backButton');
        backButton.style.display = 'none';

        let mySet = new Set();

        for (let i = 0; i < images.length; i++) {
            const image = images[i];

       

            try {
                if (!mySet.has(image.album_id)) {
                    const albumImages = images.filter(img => img.album_id === image.album_id);

                    const decryptedImageUrl = await decryptImage(image.image, image.key, image.iv);

                    let decryptedText;

                    if (image.description === "") {
                        decryptedText = " ";
                    } else {
                        decryptedText = await decryptText(image.description);
                    }

                    const id = image.album_id;
                    const time = image.created_at;
                    const id_image = image.id;

                    const curAlbum = {
                        decryptedImageUrl,
                        decryptedText,
                        id,
                        time,
                        id_image
                    };

                    finalAlbum.push(curAlbum);

                    const imgElement = document.createElement('img');
                    imgElement.src = decryptedImageUrl;
                    imgElement.alt = decryptedText;
                    imgElement.classList.add('bd-placeholder-img', 'card-img-top');
                    imgElement.width = 100;
                    imgElement.height = 225;

                    const card = document.createElement('div');
                    card.classList.add('card', 'shadow-sm');

                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body');

                    const cardText = document.createElement('p');
                    cardText.classList.add('card-text');
                    cardText.innerText = decryptedText;

                    const smallText = document.createElement('small');
                    smallText.classList.add('text-body-secondary');
                    smallText.innerText = image.created_at;

                    
                     if (image.album_id == null) {
                        const deleteImageButton = document.createElement('button');
                        deleteImageButton.classList.add('btn', 'btn-danger', 'mt-auto');
                        deleteImageButton.innerText = 'Delete Image';
                        deleteImageButton.addEventListener('click', async () => {
                            await deleteEntity('image', image.id);

                        });
                        cardBody.appendChild(deleteImageButton);
                    }

                  
                    if (image.album_id !== null) {
                        const deleteAlbumButton = document.createElement('button');
                        deleteAlbumButton.classList.add('btn', 'btn-danger', 'mt-auto');
                        deleteAlbumButton.innerText = 'Delete Album';
                        deleteAlbumButton.addEventListener('click', async () => {
                            await deleteEntity('album', image.album_id);

                        });
                        cardBody.appendChild(deleteAlbumButton);
                    }

                    if (image.Owner) {
                        const ownerLabel = document.createElement('span');
                        ownerLabel.classList.add('badge', 'bg-primary');
                        ownerLabel.innerText = 'Owner';
                        cardBody.appendChild(ownerLabel);

                       
                        const shareButton = document.createElement('button');
                        shareButton.classList.add('btn', 'btn-info', 'mt-auto');
                        shareButton.innerText = 'Share';



                      
                        let isShareButtonClicked = false;

                        shareButton.addEventListener('click', async () => {
                       
                            if (isShareButtonClicked) {
                      
                                const shareContainer = cardBody.querySelector('.share-container');
                                const shareAlbumContainer = cardBody.querySelector('.share-album-container');
                                if (shareContainer) {
                                    shareContainer.remove();
                                }
                                if (shareAlbumContainer) {
                                    shareAlbumContainer.remove();
                                }
                                isShareButtonClicked = false;
                            } else {
                              
                                const url = "/getUsers";
                                const response = await fetch(url, {
                                    method: 'GET',
                                    headers: {
                                        "X-Requested-With": "XMLHttpRequest",
                                        "X-CSRF-TOKEN": document
                                            .querySelector('meta[name="csrf-token"]')
                                            .getAttribute("content"),
                                    },
                                });
                                const data = await response.json();
                                if (data.success) {
                               
                                    const users = data.users;
                                    const shareContainer = document.createElement('div'); 
                                    shareContainer.classList.add('share-container');
                        
                                    const content = document.createElement('select');
                                    const userLabel = document.createElement('label');
                                    userLabel.innerText = "Users";
                                    users.forEach(user => {
                                        const opt = document.createElement('option');
                                        opt.value = user.id;
                                        opt.innerHTML = `${user.name}`;
                                        content.appendChild(opt);
                                    });
                        
                                    const buttonShare = document.createElement('button');
                                    buttonShare.innerText = "Share";
                        
                                    buttonShare.addEventListener('click', async () => {
                                       
                        
                                      
                                        const url = `/data/${content.value}`;
                                        const response = await fetch(url, {
                                            method: 'GET',
                                            headers: {
                                                "X-Requested-With": "XMLHttpRequest",
                                                "X-CSRF-TOKEN": document
                                                    .querySelector('meta[name="csrf-token"]')
                                                    .getAttribute("content"),
                                            },
                                        });
                        
                                        const data = await response.json();
                        
                                        if (data.success) {
                                            const otherPublicKey = data.key;
                        
                                           
                                            const url2 = `/images/symmetricKey`;
                                            const id2 = image.id;
                        
                                           
                        
                                            const response2 = await fetch(url2, {
                                                method: 'POST',
                                                headers: {
                                                    "X-Requested-With": "XMLHttpRequest",
                                                    "X-CSRF-TOKEN": document
                                                        .querySelector('meta[name="csrf-token"]')
                                                        .getAttribute("content"),
                                                },
                                                body: id2
                                            });
                        
                                            const data2 = await response2.json();
                        
                                            if (data2.success) {
                                                const privateK = await getPrivateKey();
                                                const symmetricKey = Uint8Array.from(atob(data2.key), c => c.charCodeAt(0));
                        
                                                const decryptedSymmetricKey = await window.crypto.subtle.decrypt(
                                                    { name: 'RSA-OAEP' },
                                                    privateK,
                                                    symmetricKey
                                                );
                                                const otherPublicKeyArrayBuffer = Uint8Array.from(atob(otherPublicKey), c => c.charCodeAt(0));
                        
                                                const otherPublicKeyCryptoKey = await window.crypto.subtle.importKey(
                                                    "spki",
                                                    otherPublicKeyArrayBuffer,
                                                    { name: "RSA-OAEP", hash: { name: "SHA-256" } },
                                                    false,
                                                    ["encrypt"]
                                                );
                        
                                               
                                                const encryptedSymmetricKey = await window.crypto.subtle.encrypt(
                                                    { name: 'RSA-OAEP' },
                                                    otherPublicKeyCryptoKey,
                                                    decryptedSymmetricKey
                                                );
                        
                                                const finalEncryptedSymmetricKey = btoa(String.fromCharCode(...new Uint8Array(encryptedSymmetricKey)));
                        
                                                if (image.album_id !== null) {
                                                  
                                                    const otherPublicKeyCryptoKey = await window.crypto.subtle.importKey(
                                                        "spki",
                                                        otherPublicKeyArrayBuffer,
                                                        { name: "RSA-OAEP", hash: { name: "SHA-256" } },
                                                        false,
                                                        ["encrypt"]
                                                    );
                        
                                                    const decryptedTextBuffer = new TextEncoder().encode(decryptedText);
                                                    const encryptedText = await crypto.subtle.encrypt(
                                                        { name: 'RSA-OAEP' },
                                                        otherPublicKeyCryptoKey,
                                                        decryptedTextBuffer
                                                    );
                        
                                                    const url3 = '/albums/shared';
                                                    const destUser = content.value; 
                                                    const albumId = image.album_id;
                                                    const finalEncryptedTexte = btoa(String.fromCharCode(...new Uint8Array(encryptedText)));
                        
                                                    const response3 = await fetch(url3, {
                                                        method: 'POST',
                                                        headers: {
                                                            "Content-Type": "application/json", 
                                                            "X-Requested-With": "XMLHttpRequest",
                                                            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                                                        },
                                                        body: JSON.stringify({
                                                            albumId: albumId,
                                                            finalEncryptedSymmetricKey: finalEncryptedSymmetricKey,
                                                            destUser: destUser,
                                                            encryptedText: finalEncryptedTexte
                                                        })
                                                    });
                        
                                                    if (!response3.ok) {
                                                        const error = await response3.json();
                                                        console.error('Error:', error);
                                                    } else {
                                                        const result = await response3.json();
                                                       
                                                    }
                                                } else {
                                                    const url3 = '/images/shared';
                                                    const destUser = content.value; 
                                                    const id2 = image.id;
                        
                                             
                        
                                                    const response3 = await fetch(url3, {
                                                        method: 'POST',
                                                        headers: {
                                                            "Content-Type": "application/json", 
                                                            "X-Requested-With": "XMLHttpRequest",
                                                            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                                                        },
                                                        body: JSON.stringify({
                                                            id2: id2,
                                                            finalEncryptedSymmetricKey: finalEncryptedSymmetricKey,
                                                            destUser: destUser
                                                        })
                                                    });
                        
                                                    if (!response3.ok) {
                                                        const error = await response3.json();
                                                        console.error('Error:', error);
                                                    } else {
                                                        const result = await response3.json();
                                                        
                                                    }
                                                }
                                            }
                                        } else {
                                            alert('error when sharing');
                                        }
                                    });
                        
                                    
                                    if (image.album_id === null) {
                                        const urlAlbum = "/userAlbums";
                                        const responseAlbum = await fetch(urlAlbum, {
                                            method: 'GET',
                                            headers: {
                                                "X-Requested-With": "XMLHttpRequest",
                                                "X-CSRF-TOKEN": document
                                                    .querySelector('meta[name="csrf-token"]')
                                                    .getAttribute("content"),
                                            },
                                        });
                                        const dataAlbum = await responseAlbum.json();
                        
                                      
                        
                                        
                                        const albums = dataAlbum.albums;
                                        const shareAlbumContainer = document.createElement('div');
                                        shareAlbumContainer.classList.add('share-album-container');
                        
                                        const contentAlbum = document.createElement('select');
                                        const albumLabel = document.createElement('label');
                                        albumLabel.innerText = "Albums";
                        
                                        albums.forEach(async album => {
                                            const opt = document.createElement('option');
                                            opt.value = album.album;
                        
                                            const decryptedText = await decryptText(album.description);
                                            opt.innerText = `${decryptedText}`;
                                            contentAlbum.appendChild(opt);
                                        });
                        
                                        const buttonShareAlbum = document.createElement('button');
                                        buttonShareAlbum.innerText = "Add to Album";



                                        buttonShareAlbum.addEventListener('click', async() =>{


                                            const url4 = "/attachImage";

                                            const destAlbum = contentAlbum.value;

                                            const id3 = image.id;

                                            const response4 = await fetch(url4, {
                                                method: 'POST',
                                                headers: {
                                                    "Content-Type": "application/json", 
                                                    "X-Requested-With": "XMLHttpRequest",
                                                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                                                },
                                                body: JSON.stringify({
                                                    id3: id3,
                                                    destAlbum: destAlbum
                                                })
                                            });

                                            const data4 = await response4.json();

                                          

                                            if(!data4.success){
                                                alert(data4.message);
                                            } else{
                                                location.reload();
                                            }





                                        });
                        
                                        shareAlbumContainer.appendChild(albumLabel);
                                        shareAlbumContainer.appendChild(contentAlbum);
                                        shareAlbumContainer.appendChild(buttonShareAlbum);
                                        shareContainer.appendChild(userLabel);
                                        shareContainer.appendChild(content);
                                        shareContainer.appendChild(buttonShare);
                                        cardBody.appendChild(shareContainer);
                                        cardBody.appendChild(shareAlbumContainer);
                                    } else {
                                        shareContainer.appendChild(userLabel);
                                        shareContainer.appendChild(content);
                                        shareContainer.appendChild(buttonShare);
                                        cardBody.appendChild(shareContainer);
                                    }
                        
                                  
                        
                                    isShareButtonClicked = true; 
                                } else {
                                    alert('pas bon');
                                }
                            }
                        });


                        cardBody.appendChild(shareButton);
                    }

                    cardBody.appendChild(cardText);
                    cardBody.appendChild(smallText);
                    card.appendChild(imgElement);
                    card.appendChild(cardBody);

                    if (image.album_id !== null) {
                        const button = document.createElement('button');
                        button.innerText = 'See More';
                        button.classList.add('btn', 'btn-primary', 'mt-auto');

                        button.addEventListener('click', async () => {
                            gallery.innerHTML = '';

                            for (const img of albumImages) {
                                const decryptedImageUrl = await decryptImage(img.image, img.key, img.iv);

                                let decryptedText;

                                if (img.description === "") {
                                    decryptedText = " ";
                                } else {
                                    decryptedText = await decryptText(img.description);
                                }

                                const albumImgElement = document.createElement('img');
                                albumImgElement.src = decryptedImageUrl;
                                albumImgElement.alt = decryptedText;
                                albumImgElement.classList.add('bd-placeholder-img', 'card-img-top');
                                albumImgElement.width = 100;
                                albumImgElement.height = 225;

                                const albumCard = document.createElement('div');
                                albumCard.classList.add('card', 'shadow-sm');

                                const albumCardBody = document.createElement('div');
                                albumCardBody.classList.add('card-body');

                                const albumCardText = document.createElement('p');
                                albumCardText.classList.add('card-text');
                                albumCardText.innerText = decryptedText;

                                albumCardBody.appendChild(albumCardText);
                                albumCard.appendChild(albumImgElement);
                                albumCard.appendChild(albumCardBody);
                                gallery.appendChild(albumCard);
                            }

                            backButton.style.display = 'block';
                        });

                        card.appendChild(button);
                    }

                    gallery.appendChild(card);
                }
            } catch (error) {
                console.error("Error displaying image:", error);
            }
            if (image.album_id !== null) {
                mySet.add(image.album_id);
            }
        }

        backButton.addEventListener('click', async () => {
            location.reload();
        });
    }















































    

    async function deleteEntity(type, id) {
        try {

           
            const response = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ type, id })
            });

            const data = await response.json();
            if (data.success) {
                location.reload();
            }
        } catch (error) {
            
            alert("Error deleting" + error);
        }
    }

    fetchImages();
});
