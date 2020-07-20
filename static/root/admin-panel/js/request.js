const request = (url, body = {}, files = []) => {
    return new Promise(async (resolve, reject) => {
        const socket = io({
            transportOptions: {
                polling: {
                    extraHeaders: {
                        path: url
                    }
                }
            }
        });
        socket.on('response', (res) => {
            if (res.status >= 200 && res.status < 300) {
                resolve(res);
            }
            else {
                reject({ status: res.status, response: res.body });
            }
        });
        // Send body
        socket.emit('body', body);
        // Send files
        for (let file of files) {
            // Send file meta
            socket.emit('file meta', {
                name: file.name,
                lastModified: file.lastModified,
                size: file.size,
                type: file.type
            });
            const stream = file.stream();
            const reader = stream.getReader();
            while (true) {
                const chunk = await reader.read();
                if (!chunk.done) {
                    socket.emit('file chunk', chunk.value.buffer);
                }
                else {
                    break;
                }
            }
        }
        // End the request
        socket.emit('end');
    });
};
const handleRequestError = (err) => {
    if (err.status == 403) {
        // This should only happen on a session timeout
        // Clear the suToken
        globalSuToken = undefined;
        setPadlock('locked');
        notification('Session Timed Out', `Please retry.`);
    }
    else {
        // This should never happen
        notification('Unhandled Error', `status code: ${err.status}, body: <code>${err.response}</code>`);
    }
};
const stringToUint8Array = (str) => {
    const arr = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i);
    }
    return arr;
};
