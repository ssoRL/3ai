function getDocumentElementById(id: string) {
    const elemenet = document.getElementById(id);
    if(!elemenet) throw `3AI Error: could not get element ${id}`;
    return elemenet;
}