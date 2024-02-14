const saveOptions = () => {
  console.log('saveOptions')
  const barcodeType = document.getElementById('barcode-type').value
  console.log(barcodeType)

  chrome.storage.sync.set(
    { barcodeType: barcodeType },
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
  chrome.storage.sync.get(['barcodeType'],
    (items) => {
      document.getElementById('barcode-type').value = items.barcodeType || 'datamatrix';
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('barcode-type').addEventListener('change', saveOptions)