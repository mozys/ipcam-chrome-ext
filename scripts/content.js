const optionsPage = `chrome://extensions/?options=${chrome.runtime.id}`
const labelPrintServiceBaseURL = 'http://192.168.1.90:8020'
let brand = ''

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

const setBrand = () => {
    const productName = document.querySelectorAll('.h2')[1].innerHTML
    if (productName.startsWith('LCAM')) {
        brand = 'LZ'
    } else if (productName.startsWith('Event')) {
        brand = 'PF'
    }
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

const rewriteListItemText = (listItemElement, text) => {
    listItemElement.childNodes[2].childNodes[0].childNodes[0].innerHTML = text
}

const createControls = (listItemElement) => {
    const controlsElement = listItemElement.childNodes[2].childNodes[1].childNodes[0]
    const inputElement = controlsElement.childNodes[0].childNodes[1]

    // controlsElement.childNodes[0].style.visibility = 'hidden'

    const btnGroup = document.createElement('div')
    btnGroup.setAttribute('role', 'group')
    btnGroup.classList.add('w-100', 'btn-group')

    const yesBtn = document.createElement('button')
    yesBtn.classList.add('btn', 'w-50', 'radio-btn', 'btn-outline-success')
    yesBtn.innerHTML = 'YES'

    yesBtn.addEventListener('click', () => {
        console.log('yes')
        inputElement.focus()
        inputElement.value = '130'
        inputElement.blur()
        yesBtn.classList.remove('btn-outline-success')
        yesBtn.classList.add('btn-success')
        noBtn.classList.add('btn-outline-danger')
        noBtn.classList.remove('btn-danger')
    })

    const noBtn = document.createElement('button')
    noBtn.classList.add('btn', 'w-50', 'radio-btn', 'btn-outline-danger')
    noBtn.innerHTML = 'NO'

    noBtn.addEventListener('click', () => {
        inputElement.focus()
        inputElement.value = ''
        inputElement.blur()
        noBtn.classList.remove('btn-outline-danger')
        noBtn.classList.add('btn-danger')
        yesBtn.classList.add('btn-outline-success')
        yesBtn.classList.remove('btn-success')
    })

    btnGroup.append(yesBtn)
    btnGroup.append(noBtn)
    controlsElement.append(btnGroup)
}

const redesignBisPage = async () => {
    const options = await chrome.storage.sync.get()
    console.log(options)
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

        if (_num.innerText === '3. HARDWARE#5') {
            const listItemElement = listItems[bisItem.listIndex]
            rewriteListItemText(listItemElement, 'Idle current <= 200mA?')
            createControls(listItemElement)
        }

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


    const optionsList = document.createElement('div')
    optionsList.style.position = 'absolute'
    optionsList.style.top = '1rem'
    optionsList.style.left = '1rem'
    optionsList.style.border = '1px solid lightgray'
    optionsList.style.borderRadius = '0.25rem'
    optionsList.style.padding = '1rem'

    document.body.append(optionsList)
    for (key in options) {
        const _keyEl = document.createElement('small')
        _keyEl.innerHTML = key
        _keyEl.style.display = 'block'
        optionsList.append(_keyEl)

        const _valueEl = document.createElement('strong')
        _valueEl.innerHTML = options[key]
        _valueEl.style.display = 'block'
        _valueEl.style.marginBottom = '1rem'
        if (key === 'lensType') {
            _valueEl.style.backgroundColor = 'yellow'
        }
        optionsList.append(_valueEl)
    }
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
    imageWrapper.style.cursor = 'pointer'
    imageWrapper.addEventListener('click', async () => {
        const id = serialNo
        const lensType = options.lensType

        let deviceType = ''
        switch (`${brand}.${lensType}`) {
            case 'PF.standard':
                deviceType = 'voc10'
                break
            case 'PF.weitwinkel':
                deviceType = 'voc5'
                break
            case 'LZ.standard':
                deviceType = 'lcamf'
                break
            case 'LZ.weitwinkel':
                deviceType = 'lcamw'
                break
        }

        let labelData
        try {
            res = await fetch(`${labelPrintServiceBaseURL}/api/ipcams/${id}/data`)
            labelData = await res.json()
        } catch (err) {
            alert('could not fetch label data')
            return
        }

        try {
            await fetch(`${labelPrintServiceBaseURL}/api/labels/print`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ deviceType, data: labelData, description: `${deviceType}#${id}` }),
            })

        } catch (err) {
            alert('could not print label')
            return
        }

    })

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
    const provisioningWrapper = document.createElement('div')
    const provisioningCountEl = document.createElement('span')
    provisioningCountEl.innerHTML = '?'
    provisioningCountEl.id = 'provisioning-count'

    provisioningWrapper.style.position = 'absolute'
    provisioningWrapper.style.bottom = 'calc(100% + 0.125rem)'
    provisioningWrapper.style.fontWeight = 'bold'
    provisioningWrapper.textContent = 'x provisioned'

    provisioningWrapper.prepend(provisioningCountEl)

    imageWrapper.append(provisioningWrapper)

    footer.appendChild(imageWrapper)

    await fetchProvisioningCount(serialNo)
}

const observeActivation = () => {
    const targetNode = document.getElementById('main')
    const config = { childList: true, subtree: true }

    const callback = (mutationList, observer) => {
        console.log('mutation observed')
        for (const mutation of mutationList) {
            const modalHeader = document.querySelector('.modal-title')
            if (modalHeader && (modalHeader.textContent === 'Activation and transmission successful!')) {
                fetchProvisioningCount(getSerioalNo())
                observer.disconnect()
                break
            }
        }
    }

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
}

const fetchProvisioningCount = async (id) => {
    console.log('fetch provCount for', id)
    let count = '?'

    const barcodeWrapper = document.getElementById('barcode-wrapper')
    barcodeWrapper.style.background = 'yellow'

    try {
        res = await fetch(`${labelPrintServiceBaseURL}/api/ipcams/${id}/data`)
    } catch (err) {
        console.error('could not fetch label data')
        return
    }

    if (res.status === 404) {
        count = 0
    } else if (res.status === 200) {
        const labelData = await res.json()
        count = labelData.provisioningCount
    }

    const countEl = document.getElementById('provisioning-count')
    countEl.innerHTML = count

    if (count > 0) {
        barcodeWrapper.style.background = 'lime'
    }
}

if (formElement) {
    setBrand()
    redesignBisPage()
    observeActivation()
    setTimeout(injectBarcode, 1000)
}
