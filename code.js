// https://spectrum.chat/figma/extensions-and-api/help-with-plugin-export-as-image~98512267-5e1a-466d-85da-669aefe38fc9
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
require('dotenv').config();
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
const getArtwork = () => __awaiter(this, void 0, void 0, function* () {
    var selected = figma.currentPage.selection[0];
    if (!selected)
        return;
    try {
        return selected.exportAsync({ format: 'PNG' })
            .then(data => { return { selected, data }; })
            .catch(e => { return e; });
    }
    catch (err) {
        return err;
    }
});
const encode = (canvas, ctx, imageData) => __awaiter(this, void 0, void 0, function* () {
    ctx.putImageData(imageData, 0, 0);
    return yield new Promise((resolve, reject) => {
        canvas.toBlob(blob => { resolve(blob); });
    });
}); // Decoding an image can be done by sticking it in an HTML canvas, // since we can read individual pixels off the canvas. 
const decode = (canvas, ctx, bytes) => __awaiter(this, void 0, void 0, function* () {
    const url = URL.createObjectURL(new Blob([bytes]));
    const image = yield new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject();
        img.src = url;
    });
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    return imageData;
});
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'create-rectangles') {
        const nodes = [];
        for (let i = 0; i < msg.count; i++) {
            const rect = figma.createRectangle();
            rect.x = i * 150;
            rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
            figma.currentPage.appendChild(rect);
            nodes.push(rect);
        }
        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
    }
    if (msg.type === 'get-image') {
        getArtwork().then(r => {
            if (!r)
                figma.ui.postMessage(null); // empty message ; 
            else
                figma.ui.postMessage({ data: r.data, UUID: "Xxxxx", access: "access", type: 'PICTURE' }); // message 
        });
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    // figma.closePlugin();
};
