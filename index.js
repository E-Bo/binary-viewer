
class HexaViewer {

    /**
     * @param {string} id Viewer DOM id, to ease CSS styling
     * @param {Blob|string} [content] binary content to display, may be a base64 encoded string
     * @param {boolean} [base64] flag to declare the content as base64 encoded
     * @param {string} [mime] Binary content media type. default to application/octet-stream
     **/
    constructor(id, content, base64, mime) {
        this.table = document.createElement('TABLE');
        this.table.id = id;
        if (content) {
            this.load(content, base64, mime);
        }
    }

    addLine(address) {
        const addressCol = document.createElement('TH');
        addressCol.append(address);
        const line = document.createElement('TR');
        line.id = `${this.table.id}-row-${address}`;
        line.append(addressCol);
        return line;
    }

    createHexaColumn(offset, byte) {
        const hexaCol = document.createElement('TD');
        hexaCol.setAttribute('data-offset', offset);
        hexaCol.append(HexaViewer.bytesToHexa(byte));
        return hexaCol;
    }

    createAsciiColumn(offset, byte) {
        const acsiiCol = document.createElement('TD');
        acsiiCol.setAttribute('data-offset', offset);
        acsiiCol.append(HexaViewer.bytesToAscii(byte));
        return acsiiCol;
    }

    /**
     * Load the binary content and build the Viewer table
     *
     * @param {Blob|string} [content] binary content to display, may be a base64 encoded string
     * @param {boolean} [base64] flag to declare the content as base64 encoded
     * @param {string} [mime] Binary content media type. default to application/octet-stream
     * @return {Promise}
     **/
    async load(rawData, base64, mime = 'application/octet-stream') {
        const blob = base64
            ? await (await fetch(`data:${mime};base64,${rawData}`)).blob()
            : rawData;
        const fileReader = new FileReader();
        fileReader.addEventListener(
            'load',
            loadedEvent => this.fillTable(loadedEvent.target.result)
        );
        fileReader.readAsBinaryString(blob);
    }

    fillTable(data) {
        const hexaLine = [];
        const asciiLine = [];
        let currentLine;
        for (let offset = 0, size = data.length; offset < size; offset += 1) {
            const newLine = !(offset % 16);
            if (newLine) {
                if (currentLine) {
                    currentLine.append(...hexaLine, ...asciiLine);
                    this.table.append(currentLine);
                    hexaLine.length = 0;
                    asciiLine.length = 0;
                }
                currentLine = this.addLine(offset.toString(16).padStart(8, '0'));
            }

            const byte = data.charCodeAt(offset);
            hexaLine.push(this.createHexaColumn(offset, byte));
            asciiLine.push(this.createAsciiColumn(offset, byte));
        }
    }

    /**
     * Clear the viewver table
     **/
    reset() {
        this.table.innerHTML = '';
    }

    static bytesToHexa(byte) {
        return byte.toString(16).padStart(2, '0');
    }

    static bytesToAscii(byte) {
        // use '.' for "Non Printable" characters & Non Visible characters (exception for the SPACE)
        // see https://web.itu.edu.tr/sgunduz/courses/mikroisl/ascii.html
        return (byte < 32 || byte === 127 || byte === 160 || byte === 173)
            ? '.'
            : String.fromCharCode(byte);
    }
}
