class Popup {
    /** The translucent screen that covers the rest of the content */
    private screen: HTMLDivElement;
    /** The centered box with the modal content */
    private content_box: HTMLDivElement;
    /** A function to call when this popup is closed */
    private callback: () => void;

    /**
     * Creates a new popup and puts it in front of the other content
     * @param content The string of html that will be displayed
     */
    constructor(uri: string, callback = () => {}){
        const container = getDocumentElementById('container');
        this.callback = callback;

        this.screen = document.createElement('div');
        this.screen.classList.add('pop-up-screen');
        this.screen.onclick  = (me) => this.destroy(me);
        container.appendChild(this.screen);

        // Make the content box
        this.content_box = document.createElement('div');
        this.content_box.classList.add('pop-up-content');
        this.content_box.onclick  = (me) => this.destroy(me);
        this.screen.appendChild(this.content_box);

        this.initializeContent(uri);
    }

    /**
     * Call this to remove the popup from view
     */
    destroy(me: MouseEvent) {
        const container = getDocumentElementById('container');
        container.removeChild(this.screen);
        me.stopPropagation();
        this.callback();
    }

    async initializeContent(uri: string) {
        const content = await fetchContent(uri);
        this.content_box.innerHTML = content;
    }
}