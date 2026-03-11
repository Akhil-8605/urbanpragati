import ImageKit from 'imagekit-javascript';

/**
 * Upload a file to ImageKit via the backend auth endpoint.
 * @param {File} file - The file to upload
 * @param {string} folder - ImageKit folder path (e.g. '/complaints/water')
 * @returns {Promise<string>} - URL of the uploaded file
 */
export async function uploadImageToImageKit(file, folder = '/complaints') {
    const baseUrl = process.env.REACT_APP_BASE_URL || "http://localhost:4000";
    if (!baseUrl) throw new Error('REACT_APP_BASE_URL is not configured.');

    const authRes = await fetch(`${baseUrl}/auth`);
    if (!authRes.ok) throw new Error('Failed to get ImageKit auth params.');
    const authData = await authRes.json();

    const imagekit = new ImageKit({
        publicKey: process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY,
        urlEndpoint: process.env.REACT_APP_IMAGEKIT_URL_ENDPOINT,
    });

    const fileName = `${folder.replace(/\//g, '_')}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    const result = await imagekit.upload({
        file,
        fileName,
        token: authData.token,
        signature: authData.signature,
        expire: authData.expire,
        folder,
    });

    return result.url;
}
