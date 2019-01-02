import { encodeFromText } from "@common/common/textUtil";

export async function preparePostData(binData: Uint8Array, compiledBin: Uint8Array, mapBin: Uint8Array): Promise<{ buffer: Uint8Array, headers: Dict<string> }> {

    const buffer = new Uint8Array(binData.length + compiledBin.length + mapBin.length);
    buffer.set(binData);
    buffer.set(compiledBin, binData.length);
    buffer.set(mapBin, binData.length + compiledBin.length)

    return {
        buffer,
        headers: {
            "X-File-Length": binData.byteLength.toString(),
            "X-Build-File-Length": compiledBin.byteLength.toString(),
            "X-Build-Map-File-Length": mapBin.byteLength.toString()
        }
    };
}