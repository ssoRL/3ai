class Popup {
    /** The translucent screen that covers the rest of the content */
    private screen: HTMLDivElement;
    /** The centered box with the modal content */
    private content_box: HTMLDivElement;
    /** a promise that is completed when the popup is closed */
    public when_closed: Promise<void>;
    private resolve_closed: () => void;

    /**
     * Creates a new popup and puts it in front of the other content
     * @param content The string of html that will be displayed
     */
    constructor(uri: string) {
        const container = getDocumentElementById('container');
        this.when_closed = new Promise((resolve) => {
            this.resolve_closed = resolve;
        })

        this.screen = document.createElement('div');
        this.screen.classList.add('pop-up-screen');
        this.screen.onclick  = (me) => this.destroy(me);
        container.appendChild(this.screen);

        const popup = document.createElement('div');
        popup.classList.add('popup');
        this.screen.appendChild(popup);

        // Make the content box
        this.content_box = document.createElement('div');
        this.content_box.classList.add('pop-up-content');
        //this.content_box.onclick  = (me) => this.destroy(me);
        popup.appendChild(this.content_box);

        // Make the close button
        const close = document.createElement('a');
        close.classList.add('popup-close');
        close.innerText = "Close";
        popup.appendChild(close);


        this.initializeContent(uri);
    }

    /**
     * Call this to remove the popup from view
     */
    private destroy(me: MouseEvent) {
        const container = getDocumentElementById('container');
        container.removeChild(this.screen);
        me.stopPropagation();
        this.resolve_closed();
    }

    private async initializeContent(uri: string) {
        const content = await fetchContent(uri);
        this.content_box.innerHTML = content;
    }
}