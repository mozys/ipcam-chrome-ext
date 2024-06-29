/* utilities */
const $event = (event) => {
    return new Event(event, { bubbles: true })
}

const getBisForm = () => {
    const formElement = document.querySelector('div.bis .test-form')
    if (!formElement) {
        return null
    }

    const tests = [
        { groupNo: 3, groupTag: 'hardware', itemNo: 1, listIndex: 6, test: 'powerLED' },
        { groupNo: 3, groupTag: 'hardware', itemNo: 6, listIndex: 11, test: 'heater' },
        { groupNo: 2, groupTag: 'focus', itemNo: 1, listIndex: 3, test: 'autofocus', skipOffline: true },
        { groupNo: 1, groupTag: 'backend', itemNo: 1, listIndex: 0, test: 'batchToken', skipOffline: true },
        { groupNo: 1, groupTag: 'backend', itemNo: 2, listIndex: 1, test: 'backend', skipOffline: true },
        { groupNo: 1, groupTag: 'backend', itemNo: 3, listIndex: 2, test: 'statusLED' },
        { groupNo: 2, groupTag: 'focus', itemNo: 2, listIndex: 4, test: 'focus' },
        { groupNo: 2, groupTag: 'focus', itemNo: 3, listIndex: 5, test: 'snapshot' },
        { groupNo: 3, groupTag: 'hardware', itemNo: 2, listIndex: 7, test: 'digitalInputLED' },
        { groupNo: 3, groupTag: 'hardware', itemNo: 3, listIndex: 8, test: 'digitalInputVideo' },
        { groupNo: 3, groupTag: 'hardware', itemNo: 4, listIndex: 9, test: 'nfc', skipOffline: true },
        { groupNo: 3, groupTag: 'hardware', itemNo: 5, listIndex: 10, test: 'idleCurrent' },
    ]

    return { formElement, bisConfig: tests }
}

const getBrand = () => {
    const productName = document.querySelector('.bis.container div.h2:nth-of-type(2)').innerHTML
    if (productName.startsWith('LCAM')) {
        brand = 'LZ'
    } else if (productName.startsWith('Event')) {
        brand = 'PF'
    } else {
        brand = 'N/A'
    }

    return brand
}

const getSerioalNo = () => {
    const _el = document.querySelector('div.system-versionbar ul li > small:nth-child(2)')
    if (!_el) {
        return null
    }

    return _el.textContent
}

const rewriteListItemText = (listItemElement, text) => {
    listItemElement.querySelector('p').innerHTML = text
}

const createIdleCurrentControls = (listItemElement) => {
    const controlsElement = listItemElement.querySelector('.test-step-controls')
    const inputElement = controlsElement.querySelector('.txt-in')

    const btnGroup = document.createElement('div')
    btnGroup.setAttribute('role', 'group')
    btnGroup.classList.add('w-100', 'btn-group')

    const yesBtn = document.createElement('button')
    yesBtn.classList.add('btn', 'w-50', 'radio-btn', 'btn-outline-success')
    yesBtn.innerHTML = 'YES'

    const noBtn = document.createElement('button')
    noBtn.classList.add('btn', 'w-50', 'radio-btn', 'btn-outline-danger')
    noBtn.innerHTML = 'NO'

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
            return
        }

        const _value = parseInt(e.target.value)
        if (isNaN(_value)) return

        _value <= 200 ? setYes() : setNo()
    })

    inputElement.addEventListener('keydown', (e) => {
        const isSpecialKey = e.key.length > 1
        if (isSpecialKey) {
            return
        }

        const isFirstDigit = e.target.value.length === 0
        const isZero = (/0/).test(e.key)
        const isNumber = (/\d/).test(e.key)
        console.log({ isNumber, isZero, isFirstDigit })
        if (!isNumber || (isFirstDigit && isZero)) {
            console.log('bad input')
            return e.preventDefault()
        }
    })    

    yesBtn.addEventListener('click', () => {
        inputElement.value = '130'
        inputElement.dispatchEvent($event('input'))
        setYes()
    })


    noBtn.addEventListener('click', () => {
        inputElement.value = 'failed'
        inputElement.dispatchEvent($event('input'))
        setNo()
    })

    btnGroup.append(yesBtn)
    btnGroup.append(noBtn)
    controlsElement.append(btnGroup)
}

const toggleSetupMode = () => {
    const isOfflineMode = options.setupMode === 'offline'
    
    const elementsToSkip = document.querySelectorAll('.list-group-item[data-skip-offline=true]')
    const fakeSubmitBtn = document.getElementById('fake-submit-btn')
    const fakeBackendBtn = document.getElementById('fake-backend-btn')

    // online -> offline
    if (isOfflineMode) {
        elementsToSkip.forEach((el) => el.style.display = 'none')
        fakeSubmitBtn.style.display = 'none'
        fakeBackendBtn.style.display = 'inline-block'
        return
    }

    elementsToSkip.forEach((el) => el.style.display = 'block')
    fakeSubmitBtn.style.display = 'inline-block'
    fakeBackendBtn.style.display = 'none'
}

const redesignIdleCurrentTest = (listItemElement) => {
    rewriteListItemText(listItemElement, 'Idle current <= 200mA?')
    createIdleCurrentControls(listItemElement)
}

const presetBatchToken = (listItemElement) => {
    const badge = listItemElement.querySelector('.test-step-status .badge')
    badge.classList.remove('badge-secondary')
    badge.classList.add('badge-light')
    
    const input = listItemElement.querySelector('input.txt-in')
    input.value = options.bisToken
    input.dispatchEvent($event('input'))
}

const redesignStatusLEDTest = (listItemElement) => {
    const backendBtn = document.querySelector('.list-group-item[data-test=backend] .btn')
    const fakeBackendBtn = document.createElement('button')
    fakeBackendBtn.id = 'fake-backend-btn'
    fakeBackendBtn.classList.add('btn', 'btn-primary', 'btn-block', 'start-btn')
    fakeBackendBtn.innerHTML = 'Start'
    fakeBackendBtn.addEventListener('click', () => {
        backendBtn.click()
    })
    listItemElement.querySelector('.test-step-controls').prepend(fakeBackendBtn)

    if (options.setupMode === 'online') {
        fakeBackendBtn.style.display = 'none'
    }
}

const redesignBisPage = async () => {
    const _ulId = 'redesigned-test-list'
    if (document.getElementById(_ulId)) {
        return toggleSetupMode()
    }

    const isOfflineMode = options.setupMode === 'offline'
    console.log({ isOfflineMode })

    const listItems = document.querySelectorAll('.test-form .list-group-item')
    const _ul = document.createElement('ul')
    _ul.id = _ulId
    _ul.classList.add('list-group', 'mb-3')
    document.querySelector('.test-form').prepend(_ul)

    tests.forEach((testItem) => {
        const _label = document.createElement('span')
        _label.classList.add('badge', 'badge-light', 'text-muted', 'test-label')
        _label.innerText = `${testItem.groupNo}. ${testItem.groupTag.toUpperCase()}#${testItem.itemNo}`
        listItems[testItem.listIndex].setAttribute('data-test', testItem.test)
        listItems[testItem.listIndex].setAttribute('data-skip-offline', !!testItem.skipOffline)
        listItems[testItem.listIndex].prepend(_label)

        _ul.append(listItems[testItem.listIndex])

        if (testItem.test === 'idleCurrent') {
            redesignIdleCurrentTest(listItems[testItem.listIndex])
        }
        
        if (testItem.test === 'batchToken') {
            presetBatchToken(listItems[testItem.listIndex])
        }

        if (testItem.test === 'statusLED') {
            redesignStatusLEDTest(listItems[testItem.listIndex])
        }

        if (isOfflineMode && testItem?.skipOffline) {
            listItems[testItem.listIndex].style.display = 'none'
        }
    })

    const _cards = document.querySelectorAll('.test-form > .card')
    _cards.forEach(_card => {
        _card.style.display = 'none'
    })

    const originalSubmitBtn = document.getElementById('submit-results')
    const fakeSubmitBtn = document.createElement('button')
    fakeSubmitBtn.id = 'fake-submit-btn'
    fakeSubmitBtn.innerHTML = 'Send test results, obtain license key and reset camera to factory defaults'
    fakeSubmitBtn.classList.add('btn', 'btn-secondary')
    fakeSubmitBtn.addEventListener('click', () => {
        originalSubmitBtn.click()
    })

    originalSubmitBtn.parentElement.append(fakeSubmitBtn)
    originalSubmitBtn.style.display = 'none'
    if (isOfflineMode) {
        fakeSubmitBtn.style.display = 'none'
    }

    // TODO: hide
    /*
    if (isOfflineMode) {
        const backendStartBtn = document.querySelector('.start-btn')
        backendStartBtn.classList.add('mb-2')
        const _parent = document.querySelectorAll('.test-step-controls')[2]
        _parent.prepend(backendStartBtn)
    }
    */
}

const printLabel = async (id, brand, lensType) => {
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
}

const injectProvisioningCount = async () => {
    const serialNo = getSerioalNo()
    if (!serialNo) {
        return
    }

    const provisioningWrapper = document.createElement('div')
    provisioningWrapper.id = 'provisioning-wrapper'
    provisioningWrapper.innerHTML = `
        <span id="provisioning-count">?</span>x provisioned
    `
    footer.append(provisioningWrapper)

    await fetchProvisioningCount(serialNo)
}

const injectBarcode = async () => {
    const serialNo = getSerioalNo()
    if (!serialNo) {
        return
    }

    const barcodeType = options.barcodeType
    let hScale = 1
    if (barcodeType === 'code128') {
        hScale = 0.2
    }

    console.log({ serialNo, barcodeType })

    let barcodeWrapper = document.getElementById('barcode-wrapper')
    if (barcodeWrapper) {
        barcodeWrapper.remove()
    }

    barcodeWrapper = document.createElement('div')
    barcodeWrapper.id = 'barcode-wrapper'
    barcodeWrapper.addEventListener('click', async () => {
        printLabel(serialNo, getBrand(), options.lensType)
    })

    const canvas = document.createElement('canvas')
    const barcodeImage = new Image()
    barcodeImage.onload = function() {
        const width = this.width
        const height = Math.round(width * hScale)

        barcodeImage.style.width = `${width}px`
        barcodeImage.style.height = `${height}px`
    }

    bwipjs.toCanvas(canvas, {
        bcid: barcodeType,
        text: serialNo,
        includeText: false,
    })

    barcodeImage.src = canvas.toDataURL('image/png')
    // `http://bwipjs-api.metafloor.com/?bcid=${barcodeType}&text=${serialNo}`
    
    barcodeWrapper.append(barcodeImage)
    footer.append(barcodeWrapper)
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
    barcodeWrapper.classList.remove('provisioned')

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
        barcodeWrapper.classList.add('provisioned')
    }
}

const isEmptyObject = (obj) => {
    return !!!Object.keys(obj).length
}

const getOptions = async () => {
    let { options } = await chrome.storage.sync.get('options')
    if (isEmptyObject(options)) {
        options = await setDefaultOptions()
    }
    return new Proxy(options, {
        set(obj, prop, value) {
            obj[prop] = value
            chrome.storage.sync.set({ options: obj })
        }
    })
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

const injectOptionsControl = async () => {
    const optionsEl = document.createElement('div')
    optionsEl.id = 'options-control'
    optionsEl.innerHTML = `
    <div class="form-row">
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
        options.bisToken = e.target.value
        options.expiresAt = Date.now() + 8 * 60 * 60 * 1000

        const input = document.querySelector('[data-test=batchToken] .txt-in')
        input.value = options.bisToken
        input.dispatchEvent($event('input'))
    })

    barcodeTypeSelect.value = options.barcodeType
    setupModeSelect.value = options.setupMode
    lensTypeSelect.value = options.lensType
    
    if (options.expiresAt && options.expiresAt > Date.now()) {
        bisTokenInput.value = options.bisToken
    }

    barcodeTypeSelect.addEventListener('change', (e) => {
        options.barcodeType = e.target.value
        // injectBarcode()
    })
    setupModeSelect.addEventListener('change', (e) => {
        options.setupMode = e.target.value
        redesignBisPage()
    })
    lensTypeSelect.addEventListener('change', (e) => {
        options.lensType = e.target.value
    })
}

let options
let brand = ''
const labelPrintServiceBaseURL = 'http://192.168.1.90:8020'
const tests = [
    { groupNo: 3, groupTag: 'hardware', itemNo: 1, listIndex: 6, test: 'powerLED' },
    { groupNo: 3, groupTag: 'hardware', itemNo: 6, listIndex: 11, test: 'heater' },
    { groupNo: 2, groupTag: 'focus', itemNo: 1, listIndex: 3, test: 'autofocus', skipOffline: true },
    { groupNo: 1, groupTag: 'backend', itemNo: 1, listIndex: 0, test: 'batchToken', skipOffline: true },
    { groupNo: 1, groupTag: 'backend', itemNo: 2, listIndex: 1, test: 'backend', skipOffline: true },
    { groupNo: 1, groupTag: 'backend', itemNo: 3, listIndex: 2, test: 'statusLED' },
    { groupNo: 2, groupTag: 'focus', itemNo: 2, listIndex: 4, test: 'focus' },
    { groupNo: 2, groupTag: 'focus', itemNo: 3, listIndex: 5, test: 'snapshot' },
    { groupNo: 3, groupTag: 'hardware', itemNo: 2, listIndex: 7, test: 'digitalInputLED' },
    { groupNo: 3, groupTag: 'hardware', itemNo: 3, listIndex: 8, test: 'digitalInputVideo' },
    { groupNo: 3, groupTag: 'hardware', itemNo: 4, listIndex: 9, test: 'nfc', skipOffline: true },
    { groupNo: 3, groupTag: 'hardware', itemNo: 5, listIndex: 10, test: 'idleCurrent' },
]

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

;(async () => {
    options = await getOptions()
    await injectOptionsControl()
    await redesignBisPage()
    await sleep(1000)
    await injectBarcode()
    await injectProvisioningCount()
    /*
    observerMutations()
    */
})()