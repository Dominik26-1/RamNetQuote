import axios from 'axios';

export function editForFilter(text: string): string {
    text =
        // Odstráni diakritiku zo znakov v reťazci text
        text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Odstráni biele znaky zo začiatku a konca reťazca
    text = text.trim();
    // Odstráni všetky vnútorné biele znaky v reťazci
    text = text.replace(/\s+/g, "");
    text = text.toLowerCase();
    return text;
}


export function convertToDate(fsTimestamp: any): Date {
    return new Date(fsTimestamp._seconds * 1000 + fsTimestamp._nanoseconds / 1000000)
}

export function parseSortParam(sortUrl: string): [string, boolean] {
    if (sortUrl.startsWith('-')) {
        return [sortUrl.slice(1), false]
    }
    else {
        return [sortUrl, true]
    }
}

export async function buildPDF(url: string): Promise<Buffer> {
    const pdfFile = await axios.get(url, {
        responseType: 'arraybuffer'
    });
    return pdfFile.data
}