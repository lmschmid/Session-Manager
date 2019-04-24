

let restoreSessionInput = document.getElementById('restore-sessions');
restoreSessionInput.addEventListener("change", handleFiles, false);
function handleFiles() {
    const fileList = this.files; /* now you can work with the file list */
    console.log(fileList);
}