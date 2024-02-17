const saveOptions = () => {
  console.log('saveOptions')
  const barcodeType = document.getElementById('barcode-type').value
  console.log(barcodeType)

  const setupMode = document.getElementById('setup-mode').value
  console.log(setupMode)

  chrome.storage.sync.set(
    { barcodeType, setupMode},
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.style.visibility = 'visible'
      setTimeout(() => {
        status.style.visibility = 'hidden'
      }, 750);
    }
  );
}

const restoreOptions = () => {
  console.log('restoreOptions')
  chrome.storage.sync.get(['barcodeType', 'setupMode'],
    (items) => {
      console.log(items)
      document.getElementById('barcode-type').value = items.barcodeType || 'datamatrix';
      document.getElementById('setup-mode').value = items.setupMode || 'offline';
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('barcode-type').addEventListener('change', saveOptions)
document.getElementById('setup-mode').addEventListener('change', saveOptions)