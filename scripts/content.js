setTimeout(async () => {
    const el = document.querySelector('div.system-versionbar ul li > small:nth-child(2)');
    const footer = document.getElementById('footer')

    // `document.querySelector` may return null if the selector doesn't match anything.
    if (el) {
        const serialNo = el.textContent
        if (!serialNo) {
            return console.log('S/N: NOT FOUND')
        }
        console.log('S/N:', serialNo)

        const options = await chrome.storage.sync.get()
        let hScale = 1
        if (options.barcodeType === 'code128') {
            hScale = 0.2
        }
        
        const imageWrapper = document.createElement('div')
        imageWrapper.id = 'barcode-wrapper'

        const img = new Image()
        img.onload = function() {
            const width = this.width
            const height = Math.round(width * hScale)
            const styleElem = document.head.appendChild(document.createElement("style"));
            styleElem.innerHTML = `#barcode-wrapper { position: absolute; bottom: 30px; background: yellow; padding: 0.875rem; } #barcode-wrapper img { width: ${width}px; height: ${height}px; }`
        }
        img.src = `http://bwipjs-api.metafloor.com/?bcid=${options.barcodeType}&text=${serialNo}`
        
        imageWrapper.appendChild(img)
        footer.appendChild(imageWrapper)
    }
}, 1000)
