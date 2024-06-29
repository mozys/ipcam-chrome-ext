const labelPrintServiceBaseURL = 'http://192.168.1.90:8020'
let brand = ''

const dispatch = (event) => {
    return new Event(event, { bubbles: true })
}

const getBisForm = () => {
    const formElement = document.querySelector('div.bis .test-form')
    if (!formElement) {
        return null
    }

    const bisConfig = [
        { groupNo: 3, groupTag: 'hardware', itemNo: 1, listIndex: 6, test: 'powerLED' },
        { groupNo: 3, groupTag: 'hardware', itemNo: 6, listIndex: 11, test: 'heater' },
        { groupNo: 2, groupTag: 'focus', itemNo: 1, listIndex: 3, test: 'autofocus', disabled: true },
        { groupNo: 1, groupTag: 'backend', itemNo: 1, listIndex: 0, test: 'batchToken', disabled: true },
        { groupNo: 1, groupTag: 'backend', itemNo: 2, listIndex: 1, test: 'backend', disabled: true },
        { groupNo: 1, groupTag: 'backend', itemNo: 3, listIndex: 2, test: 'statusLED' },
        { groupNo: 2, groupTag: 'focus', itemNo: 2, listIndex: 4, test: 'focus' },
        { groupNo: 2, groupTag: 'focus', itemNo: 3, listIndex: 5, test: 'snapshot' },
        { groupNo: 3, groupTag: 'hardware', itemNo: 2, listIndex: 7, test: 'digitalInputLED' },
        { groupNo: 3, groupTag: 'hardware', itemNo: 3, listIndex: 8, test: 'digitalInputVideo' },
        { groupNo: 3, groupTag: 'hardware', itemNo: 4, listIndex: 9, test: 'nfc', disabled: true },
        { groupNo: 3, groupTag: 'hardware', itemNo: 5, listIndex: 10, test: 'idleCurrent' },
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

    const setYes = () => {
        yesBtn.classList.remove('btn-outline-success')
        yesBtn.classList.add('btn-success')
        noBtn.classList.add('btn-outline-danger')
        noBtn.classList.remove('btn-danger')
    }

    const setNo = () => {
        noBtn.classList.remove('btn-outline-danger')
        noBtn.classList.add('btn-danger')
        yesBtn.classList.add('btn-outline-success')
        yesBtn.classList.remove('btn-success')
    }

    const reset = () => {
        yesBtn.classList.add('btn-outline-success')
        yesBtn.classList.remove('btn-success')
        noBtn.classList.add('btn-outline-danger')
        noBtn.classList.remove('btn-danger')
        yesBtn.blur()
        noBtn.blur()
    }

    inputElement.addEventListener('change', (e) => {
        if (!e.target.value) {
            reset()
        }
    })

    yesBtn.addEventListener('click', () => {
        console.log('yes')
        inputElement.value = '130'
        inputElement.dispatchEvent(dispatch('input'))
        setYes()
    })

    const noBtn = document.createElement('button')
    noBtn.classList.add('btn', 'w-50', 'radio-btn', 'btn-outline-danger')
    noBtn.innerHTML = 'NO'

    noBtn.addEventListener('click', () => {
        inputElement.value = 'failed'
        inputElement.dispatchEvent(dispatch('input'))
        setNo()
    })

    btnGroup.append(yesBtn)
    btnGroup.append(noBtn)
    controlsElement.append(btnGroup)
}

const redesignBisPage = async () => {
    console.log(optionsProxy)

    const isOfflineMode = optionsProxy.setupMode === 'offline'

    const mainElement = document.getElementById('main')
    mainElement.style['padding-bottom'] = '96px'
    mainElement.style['padding-top'] = '36px'

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

    const submitBtn = document.getElementById('submit-results')
    submitBtn.innerHTML = 'Send test results, obtain license key and reset camera to factory defaults'
    submitBtn.addEventListener('click', (e) => {
        e.target.classList.remove('btn-primary')
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
        listItems[bisItem.listIndex].setAttribute('data-test', bisItem.test)

        if (bisItem.test === 'idleCurrent') {
            const listItemElement = listItems[bisItem.listIndex]
            rewriteListItemText(listItemElement, 'Idle current <= 200mA?')
            createControls(listItemElement)
        }

        _ul.appendChild(listItems[bisItem.listIndex])

        if (bisItem.test === 'batchToken' ) {
            console.log('Remove status badge')
            const badge = listItems[bisItem.listIndex].querySelector('.test-step-status .badge')
            badge.classList.remove('badge-secondary')
            badge.classList.add('badge-light')

            const input = listItems[bisItem.listIndex].querySelector('input.txt-in')
            input.value = optionsProxy.bisToken
            input.dispatchEvent(dispatch('change'))
        }
    })

    formElement.prepend(_ul)

    const _cards = document.querySelectorAll('div.card')
    _cards.forEach(_card => _card.remove())
}

const injectBarcode = async () => {
    const serialNo = getSerioalNo()
    if (!serialNo) {
        return
    }

    const barcodeType = optionsProxy.barcodeType
    let hScale = 1
    if (barcodeType === 'code128') {
        hScale = 0.2
    }

    console.log({ serialNo, barcodeType })

    let imageWrapper = document.getElementById('barcode-wrapper')
    if (imageWrapper) {
        imageWrapper.remove()
        document.querySelector('[data-barcode]').remove()
    }

    imageWrapper = document.createElement('div')
    imageWrapper.id = 'barcode-wrapper'
    imageWrapper.style.cursor = 'pointer'
    imageWrapper.addEventListener('click', async () => {
        const id = serialNo
        const lensType = optionsProxy.lensType

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
        
        return console.log({
            id,
            deviceType,
            lensType,
        })

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
        console.log('w x h', width, height)

        let styleElem = document.querySelector('[data-barcode]')
        if (styleElem) {
            styleElem.remove()
        }

        styleElem = document.createElement("style")
        styleElem.toggleAttribute('data-barcode')
        document.head.appendChild(styleElem)
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

    console.debug({ hScale })

    await fetchProvisioningCount(serialNo)
}

const updateStats = () => {
    const notStarted = document.querySelectorAll('.test-step-status .badge-secondary').length
    const passed = document.querySelectorAll('.test-step-status .badge-success').length
    const failed = document.querySelectorAll('.test-step-status .badge-danger').length
    console.log({
        notStarted,
        passed,
        failed
    })

    const submitBtn = document.getElementById('submit-results')
    // submitBtn.innerHTML = 'Send test results, obtain license key and reset camera factory defaults'
    let statsElement = document.getElementById('injected-stats')
    if (!statsElement) {
        statsElement = document.createElement('ul')
        submitBtn.parentElement.append(statsElement)
        statsElement.id = 'injected-stats'
        statsElement.style.display = 'flex'
        statsElement.style.gap = '1rem'
        statsElement.style.justifyContent = 'center'
        statsElement.style.listStyleType = 'none'
    }

    const newHTML = `<li><span class="badge badge-secondary">${notStarted}</span> not started</li><li><span class="badge badge-danger">${failed}</span> failed</li><li><span class="badge badge-success">${passed}</span> passed</li>`

    if (statsElement.innerHTML !== newHTML) {
        statsElement.innerHTML = newHTML

        if (failed) {
            submitBtn.classList.remove('btn-primary', 'btn-secondary', 'btn-success')
            submitBtn.classList.add('btn-danger')
        } else if (notStarted) {
            submitBtn.classList.remove('btn-primary', 'btn-danger', 'btn-success')
            submitBtn.classList.add('btn-secondary')
        } else {
            submitBtn.classList.remove('btn-primary', 'btn-danger', 'btn-secondary')
            submitBtn.classList.add('btn-success')
        }
    }
}

const observerMutations = () => {
    const targetNode = document.getElementById('main')
    const config = { attributes: true, childList: true, subtree: true }

    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            const modalHeader = document.querySelector('.modal-title')
            if (modalHeader) {
                updateStats()
            }
            if (modalHeader && (modalHeader.textContent === 'Activation and transmission successful!')) {
                fetchProvisioningCount(getSerioalNo())
                observer.disconnect()
                break
            }
        }

        try {
            updateStats()
        } catch (e) {
            //
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

const isEmptyObject = (obj) => {
    return !!!Object.keys(obj).length
}

const getOptions = async () => {
    const { options } = await chrome.storage.sync.get('options')
    if (!isEmptyObject(options)) {
        return options
    }

    const defaultOptions = await setDefaultOptions()
    return defaultOptions
}

const setOptions = async (options) => {
    chrome.storage.sync.set({ options })
}

const setDefaultOptions = async () => {
    const defaultOptions = {
        barcodeType: 'datamatrix',
        setupMode: 'offline',
        lensType: 'standard',
        bisToken: '',
        expiresAt: null,
    }

    await chrome.storage.sync.set({ options: defaultOptions })
    return defaultOptions
}

const selectTestForm = () => {
    return document.querySelector('.test-form')
}

let optionsProxy
const injectOptionsControl = async () => {
    const optionsEl = document.createElement('div')
    optionsEl.id = 'options-control'
    optionsEl.style.position = 'absolute'
    optionsEl.style.top = 0
    optionsEl.style.padding = '0.5rem'
    optionsEl.style.backgroundColor = 'rgba(0, 0, 0, .03)'
    optionsEl.style.border = '1px solid rgba(0, 0, 0, .125)'   
    optionsEl.style.borderRadius = '0.25rem' 
    optionsEl.classList.add('form-row')

    optionsEl.setAttribute('data-prop', 'barcodeType')
    optionsEl.innerHTML = `
    <div class="col">
        <select class="form-control-sm" id="setupModeSelect">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
        </select>
    </div>
    <div class="col">
        <select class="form-control-sm" id="lensTypeSelect">
            <option value="standard">Standard</option>
            <option value="weitwinkel">Weitwinkel</option>
        </select>
    </div>
    <div class="col">
        <select class="form-control-sm" id="barcodeTypeSelect">
            <option value="datamatrix">Datamatrix</option>
            <option value="code128">Code128</option>
        </select>
    </div>
    <div class="col">
        <input type="text" class="form-control-sm bg-light text-muted border" placeholder="BIS token" id="bisTokenInput" readonly>
    </div>
    `
    document.getElementById('app').append(optionsEl)

    const barcodeTypeSelect = document.getElementById('barcodeTypeSelect')
    const setupModeSelect = document.getElementById('setupModeSelect')
    const lensTypeSelect = document.getElementById('lensTypeSelect')
    const bisTokenInput = document.getElementById('bisTokenInput')

    bisTokenInput.addEventListener('dblclick', (e) => {
        e.target.toggleAttribute('readonly')
        bisTokenInput.classList.add('bg-white')
        bisTokenInput.classList.remove('bg-light')
        bisTokenInput.classList.remove('text-muted')
    })
    bisTokenInput.addEventListener('blur', (e) => {
        e.target.toggleAttribute('readonly')
        bisTokenInput.classList.remove('bg-white')
        bisTokenInput.classList.add('bg-light')
        bisTokenInput.classList.add('text-muted')
        optionsProxy.bisToken = e.target.value
        optionsProxy.expiresAt = Date.now() + 8 * 60 * 60 * 1000

        const input = document.querySelector('[data-test=batchToken] .txt-in')
        input.value = optionsProxy.bisToken
        input.dispatchEvent(dispatch('change'))
    })

    const options = await getOptions()
    barcodeTypeSelect.value = options.barcodeType
    setupModeSelect.value = options.setupMode
    lensTypeSelect.value = options.lensType
    
    if (options.expiresAt && options.expiresAt > Date.now()) {
        bisTokenInput.value = options.bisToken
    }

    optionsProxy = new Proxy(options, {
        set(obj, prop, value) {
            obj[prop] = value
            chrome.storage.sync.set({ options: obj })
        }
    })
    
    barcodeTypeSelect.addEventListener('change', (e) => {
        optionsProxy.barcodeType = e.target.value
        injectBarcode()
    })
    setupModeSelect.addEventListener('change', (e) => {
        optionsProxy.setupMode = e.target.value
        redesignBisPage()
    })
    lensTypeSelect.addEventListener('change', (e) => {
        optionsProxy.lensType = e.target.value
    })
}

(async () => {
    await injectOptionsControl()
    setBrand()
    redesignBisPage()
    observerMutations()
    setTimeout(injectBarcode, 1000)
})()