'use strict';

var
    DEF_MIMETYPE = 'application/octet-stream',
    MIMETYPES = {
        'txt': 'text/plain',
        'text': 'text/plain',
        'html': 'text/html',
        'htm': 'text/html',
        'json': 'application/json',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'bin': 'application/octet-stream'
    };

function mimetype(extension, fallback) {
    var dotIndex = extension.lastIndexOf('.');
    if (dotIndex != -1) {
        extension = extension.substring(dotIndex + 1);
    }
    return MIMETYPES[extension] || fallback || DEF_MIMETYPE;
}

module.exports = mimetype;
