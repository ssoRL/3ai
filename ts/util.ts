function getDocumentElementById(id: string) {
    const element = document.getElementById(id);
    if(!element) throw `3AI Error: could not get element ${id}`;
    return element;
}