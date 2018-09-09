export const otherContentTypes: Dict<string> = {
    pdf: "application/pdf",
};

export const textContentTypes: Dict<string> = {
    html: "text/html; charset=utf-8",
    js: "application/javascript; charset=utf-8",
    ts: "application/x-typescript; charset=utf-8",
    json: "application/json; charset=utf-8",
    css: "text/css; charset=utf-8",
}

export const imageContentTypes: Dict<string> = {
    ico: "image/x-icon",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
}

export const textExtensions = new Set<string>('txt htm html js jsx ts tsx scss sass css json'.split(' ').map(s => `.${s}`));

export const imageExtensions = new Set<string>('ico png jpg jpeg gif'.split(' ').map(s => `.${s}`));