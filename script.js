document.addEventListener("DOMContentLoaded", function() {
    const shortenerInput = document.getElementById("shortener");
    const submitBtn = document.getElementById("submit__btn");
    const linksContainer = document.querySelector(".links__container");
    const errorMsg = document.querySelector(".error__msg");
    const toggleModeBtn = document.getElementById("toggleMode");
    const clearAllBtn = document.getElementById("clearAll");

    function generateShortLink(customAlias = "") {
        if (customAlias) {
            return `https://sho.rt/${customAlias}`;
        }
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let shortLink = "";
        for (let i = 0; i < 6; i++) {
            shortLink += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `https://sho.rt/${shortLink}`;
    }

    function showError() {
        errorMsg.classList.add("show");
        setTimeout(() => {
            errorMsg.classList.remove("show");
        }, 3000);
    }

    function addLink(url, customAlias = "", expiryTime = null) {
        if (!url || !url.match(/^(https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
            showError();
            return;
        }
        
        const shortUrl = generateShortLink(customAlias);
        
        const div = document.createElement("div");
        div.className = "link";
        div.innerHTML = `
            <span class="long__link">${url}</span>
            <span class="short__link"><a href="${shortUrl}" target="_blank">${shortUrl}</a></span>
            <button class="copy__btn">Copy</button>
            <button class="qr__btn">QR Code</button>
            <button class="delete__btn">Delete</button>
        `;
        linksContainer.appendChild(div);
        
        const linkData = { longUrl: url, shortUrl, expiryTime: expiryTime ? Date.now() + expiryTime : null };
        saveLinks(linkData);
    }

    submitBtn.addEventListener("click", function(event) {
        event.preventDefault();
        const customAlias = prompt("Enter a custom alias for the short URL (or leave blank for a random one):");
        const expiryTime = prompt("Enter expiry time in minutes (or leave blank for no expiry):");
        addLink(shortenerInput.value, customAlias, expiryTime ? parseInt(expiryTime) * 60000 : null);
        shortenerInput.value = "";
    });

    linksContainer.addEventListener("click", function(event) {
        if (event.target.classList.contains("copy__btn")) {
            const shortLink = event.target.parentElement.querySelector(".short__link a").textContent;
            navigator.clipboard.writeText(shortLink);
            event.target.textContent = "Copied!";
            setTimeout(() => event.target.textContent = "Copy", 2000);
        }
        
        if (event.target.classList.contains("delete__btn")) {
            event.target.parentElement.remove();
            saveLinks();
        }
        
        if (event.target.classList.contains("qr__btn")) {
            const shortLink = event.target.parentElement.querySelector(".short__link a").textContent;
            generateQRCode(shortLink);
        }
    });

    toggleModeBtn.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");
    });

    clearAllBtn.addEventListener("click", function() {
        linksContainer.innerHTML = "";
        localStorage.removeItem("savedLinks");
    });

    function saveLinks(newLink = null) {
        let links = JSON.parse(localStorage.getItem("savedLinks")) || [];
        if (newLink) links.push(newLink);
        links = links.filter(link => !link.expiryTime || link.expiryTime > Date.now());
        localStorage.setItem("savedLinks", JSON.stringify(links));
    }

    function loadLinks() {
        const savedLinks = JSON.parse(localStorage.getItem("savedLinks")) || [];
        savedLinks.forEach(link => addLink(link.longUrl, link.shortUrl.split("/").pop(), link.expiryTime));
    }

    function generateQRCode(url) {
        const qrWindow = window.open("", "QR Code", "width=300,height=300");
        qrWindow.document.write(`<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${url}" alt="QR Code"></body></html>`);
    }

    loadLinks();
});