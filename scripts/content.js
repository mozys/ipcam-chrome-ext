const getBisForm = () => {
    const formElement = document.querySelector('div.bis .test-form')
    if (!formElement) {
        return null
    }

    const bisConfig = [
        { groupNo: 3, groupTag: 'hardware', itemNo: 1, listIndex: 6 },
        { groupNo: 3, groupTag: 'hardware', itemNo: 6, listIndex: 11 },
        { groupNo: 2, groupTag: 'focus', itemNo: 1, listIndex: 3, disabled: true },
        { groupNo: 1, groupTag: 'backend', itemNo: 1, listIndex: 0, disabled: true },
        { groupNo: 1, groupTag: 'backend', itemNo: 2, listIndex: 1, disabled: true },
        { groupNo: 1, groupTag: 'backend', itemNo: 3, listIndex: 2 },
        { groupNo: 2, groupTag: 'focus', itemNo: 2, listIndex: 4 },
        { groupNo: 2, groupTag: 'focus', itemNo: 3, listIndex: 5 },
        { groupNo: 3, groupTag: 'hardware', itemNo: 2, listIndex: 7 },
        { groupNo: 3, groupTag: 'hardware', itemNo: 3, listIndex: 8 },
        { groupNo: 3, groupTag: 'hardware', itemNo: 4, listIndex: 9, disabled: true },
        { groupNo: 3, groupTag: 'hardware', itemNo: 5, listIndex: 10 },
    ]

    return { formElement, bisConfig }
}

const getSerioalNo = () => {
    const _el = document.querySelector('div.system-versionbar ul li > small:nth-child(2)')
    if (!_el) {
        return null
    }

    return _el.textContent
}

const _bisForm = getBisForm()
const formElement = _bisForm?.formElement
const bisConfig = _bisForm?.bisConfig

const redesignBisPage = async () => {
    const options = await chrome.storage.sync.get()
    const setupMode = options.setupMode || 'offline'
    const isOfflineMode = setupMode === 'offline'

    const mainElement = document.getElementById('main')
    mainElement.style['padding-bottom'] = '96px'

    const listItems = document.querySelectorAll('div.list-group-item')
    const _ul = document.createElement('ul')
    _ul.classList.add('list-group', 'mb-3')

    const idleCurrentInput = document.querySelectorAll('.txt-in')[1]
    idleCurrentInput.addEventListener('keydown', (e) => {
        console.log(e.key)
        const isSpecialKey = e.key.length > 1
        console.log({ isSpecialKey })
        if (isSpecialKey) {
            return
        }

        const isFirstDigit = idleCurrentInput.value.length === 0
        const isZero = (/0/).test(e.key)
        const isNumber = (/\d/).test(e.key)
        console.log({ isNumber, isZero, isFirstDigit })
        if (!isNumber || (isFirstDigit && isZero)) {
            console.log('bad input')
            return e.preventDefault()
        }
    })

    if (isOfflineMode) {
        const badge = document.createElement('span')
        badge.classList.add('badge', 'badge-light', 'text-muted')
        badge.textContent = 'offline'.toUpperCase()
        badge.style['font-size'] = '0.75rem'

        const h = document.querySelector('div.h2')
        h.textContent = h.textContent + ' '
        h.appendChild(badge)
        
        const backendStartBtn = document.querySelector('.start-btn')
        backendStartBtn.classList.add('mb-2')
        const _parent = document.querySelectorAll('.test-step-controls')[2]
        _parent.prepend(backendStartBtn)
    
        const submitBtn = document.getElementById('submit-results')
        submitBtn.remove()
    }
    
    bisConfig.forEach((bisItem) => {
        if (isOfflineMode && bisItem?.disabled) {
            listItems[bisItem.listIndex].style.visibility = 'hidden'
            return
        }

        const _num = document.createElement('span')
        _num.classList.add('badge', 'badge-light', 'text-muted')
        _num.style.position = 'absolute'
        _num.style.top = '0'
        _num.style.left = '0'
        _num.innerText = `${bisItem.groupNo}. ${bisItem.groupTag.toUpperCase()}#${bisItem.itemNo}`
        listItems[bisItem.listIndex].prepend(_num)
        listItems[bisItem.listIndex].classList.add('pt-4')
        _ul.appendChild(listItems[bisItem.listIndex])
    })

    const alert = document.createElement('div')
    alert.classList.add('list-group-item', 'font-weight-bold')
    alert.style.background = 'yellow'
    // alert.style.padding = '0.75rem 1.25rem'
    alert.innerText = 'If all tests passed print label with serial number as DataMatrix code!!!'
    _ul.appendChild(alert)

    formElement.prepend(_ul)

    const _cards = document.querySelectorAll('div.card')
    _cards.forEach(_card => _card.remove())
}

const injectBarcode = async () => {
    const serialNo = getSerioalNo()
    if (!serialNo) {
        return
    }

    console.log('S/N:', serialNo)

    const options = await chrome.storage.sync.get()
    const barcodeType = options.barcodeType || 'datamatrix'
    let hScale = 1
    if (options.barcodeType === 'code128') {
        hScale = 0.2
    }
    
    const imageWrapper = document.createElement('div')
    imageWrapper.id = 'barcode-wrapper'

    const canvas = document.createElement('canvas')
    const img = new Image()
    img.onload = function() {
        const width = this.width
        const height = Math.round(width * hScale)
        const styleElem = document.head.appendChild(document.createElement("style"));
        styleElem.innerHTML = `#barcode-wrapper { position: absolute; bottom: 30px; background: yellow; padding: 0.875rem; } #barcode-wrapper img { width: ${width}px; height: ${height}px; }`
    }
    bwipjs.toCanvas(canvas, {
        bcid: barcodeType,
        text: serialNo,
        includeText: false,
    })
    img.src = canvas.toDataURL('image/png')
    // `http://bwipjs-api.metafloor.com/?bcid=${barcodeType}&text=${serialNo}`
    
    imageWrapper.appendChild(img)
    footer.appendChild(imageWrapper)
}

if (formElement) {
    redesignBisPage()
    setTimeout(injectBarcode, 1000)
}
