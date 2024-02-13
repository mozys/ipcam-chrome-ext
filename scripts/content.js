setTimeout(() => {
    const el = document.querySelector('div.system-versionbar ul li > small:nth-child(2)');
    // `document.querySelector` may return null if the selector doesn't match anything.
    if (el) {
        if (!el.textContent) {
            console.log({ textContent: el.textContent })
            return console.log('S/N NOT FOUND')
        }

        console.log('S/N:', el.textContent || 'NOT FOUND')
        const serialNo = el.textContent
        el.id = 'serial-no'

        const styleElem = document.head.appendChild(document.createElement("style"));
        styleElem.innerHTML = `#serial-no:after {content: ''; background: yellow url('http://bwipjs-api.metafloor.com/?bcid=datamatrix&text=${serialNo}') no-repeat 8px 8px; background-size: 32px 32px; width: 48px; height: 48px; bottom: 32px; left: 0; position: absolute; display: inline-block;}`;
    }
}, 1000)
