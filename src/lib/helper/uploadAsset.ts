export async function createAsset() {
  const response = await fetch('/api/asset/create');
  const requiredFields = ['url', 'date', 'key', 'signature', 'algorithm', 'policy', 'credential', 'securityToken'];

  let assetId: string;
  let uploadData: any;

  if (!response.ok) {
    console.error('Upload Asset API Error:', response.status, response.statusText);
    assetId = 'error';
  } else {
    const json = await response.json();
    console.log('Upload Asset API Response:', json);
    // Überprüfe die Struktur der API-Antwort
    if (!json || !json.createAsset) {
      console.error('Invalid API response structure:', json);
      assetId = 'error';
    } else {
      const createAsset = json.createAsset;
      if (!createAsset.id) {
        console.error('No asset ID in response:', createAsset);
        assetId = 'error';
      } else {
        assetId = createAsset.id;
        if (!createAsset.upload || !createAsset.upload.requestPostData) {
          console.error('No upload data in response:', createAsset);
          assetId = 'error';
        } else {
          uploadData = createAsset.upload.requestPostData;
          for (const field of requiredFields) {
            if (!uploadData[field]) {
              console.error(`Missing required upload field: ${field}`, uploadData);
              assetId = 'error';
            }
          }
        }
      }
    }
  }

  return {
    id: assetId,
    uploadData: uploadData
  };
}

export async function uploadAsset(file: File) {
  try {
    const createdAssetResponse = await createAsset();
    if (createdAssetResponse.id != 'error') {
      const form = new FormData();
      form.append('X-Amz-Date', createdAssetResponse.uploadData.date);
      form.append('key', createdAssetResponse.uploadData.key);
      form.append('X-Amz-Signature', createdAssetResponse.uploadData.signature);
      form.append('X-Amz-Algorithm', createdAssetResponse.uploadData.algorithm);
      form.append('policy', createdAssetResponse.uploadData.policy);
      form.append('X-Amz-Credential', createdAssetResponse.uploadData.credential);
      form.append('X-Amz-Security-Token', createdAssetResponse.uploadData.securityToken);
      form.append('file', file);

      const fileUploadResponse = await fetch(createdAssetResponse.uploadData.url, {
        method: 'POST',
        body: form
      });

      if (fileUploadResponse.ok) {
        console.log('File uploaded successfully:', file.name, 'Asset ID:', createdAssetResponse.id);
        return createdAssetResponse.id;
      } else {
        console.error('File upload failed:', fileUploadResponse.status, fileUploadResponse.statusText);
        return 'error';
      }
    } else {
      return 'error';
    }
  } catch (error) {
    console.error('Upload Asset Error:', error);
    return 'error';
  }
}

export async function uploadImage(fileName, dataUrlString) {
  if (!fileName || !dataUrlString) {
    console.error('Missing fileName or dataUrlString');
    return 'error';
  }

  try {
    const createdAssetResponse = await createAsset();
    const imageData = dataUrlToFile(dataUrlString, fileName);
    const imageId = createdAssetResponse.id;
    const form = new FormData();
    form.append('X-Amz-Date', createdAssetResponse.uploadData.date);
    form.append('key', createdAssetResponse.uploadData.key);
    form.append('X-Amz-Signature', createdAssetResponse.uploadData.signature);
    form.append('X-Amz-Algorithm', createdAssetResponse.uploadData.algorithm);
    form.append('policy', createdAssetResponse.uploadData.policy);
    form.append('X-Amz-Credential', createdAssetResponse.uploadData.credential);
    form.append('X-Amz-Security-Token', createdAssetResponse.uploadData.securityToken);
    form.append('file', imageData);

    const fileUploadResponse = await fetch(createdAssetResponse.uploadData.url, {
      method: 'POST',
      body: form
    });

    if (fileUploadResponse.ok) {
      console.log('Image uploaded successfully:', fileName, 'Asset ID:', imageId);
      return imageId;
    } else {
      console.error('Image upload failed:', fileUploadResponse.status, fileUploadResponse.statusText);
      return 'error';
    }
  } catch (error) {
    console.error('Upload Image Error:', error);
    return 'error';
  }
}

export async function publishAsset(id: string) {
  if (id === 'error ') return id;
  const fetchString = '/api/asset/publish/' + id;
  const publishAssetsResponse = await fetch(fetchString);
  if (publishAssetsResponse.ok) {
    const json = await publishAssetsResponse.json();
    return JSON.stringify(json);
  } else {
    return 'error';
  }
}

export async function getAssetStatus(id: string) {
  if (id === 'error') return { status: 'error' };

  try {
    const fetchString = '/api/asset/status/get/' + id;
    const assetStatusResponse = await fetch(fetchString);

    if (assetStatusResponse.ok) {
      const json = await assetStatusResponse.json();
      return {
        status: 'success',
        data: json
      };
    } else {
      return { status: 'error' };
    }
  } catch (error) {
    console.error('Get Asset Status Error:', error);
    return { status: 'error' };
  }
}

export async function waitForAssetProcessing(id: string, maxWaitTime: number = 60000): Promise<boolean> {
  const startTime = Date.now();
  let attempt = 0;
  const maxAttempts = 10;

  while (Date.now() - startTime < maxWaitTime && attempt < maxAttempts) {
    attempt++;

    try {
      const statusResult = await getAssetStatus(id);

      if (statusResult.status === 'success' && statusResult.data) {
        // Check if asset exists in DRAFT stage (means it's processed and ready)
        if (statusResult.data.draft && statusResult.data.draft.id) {
          console.log(`Asset ${id} is ready for publishing after ${attempt} attempts`);
          return true;
        }
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, etc.
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
      console.log(`Asset ${id} not ready yet, waiting ${waitTime}ms before retry ${attempt}/${maxAttempts}`);

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    } catch (error) {
      console.error(`Error checking asset status for ${id}:`, error);

      // Wait before retry even on error
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  console.error(`Asset ${id} was not ready within ${maxWaitTime}ms after ${attempt} attempts`);
  return false;
}

export async function uploadAssetWithStatusCheck(file: File, onProgress?: (message: string) => void): Promise<string> {
  try {
    // Step 1: Create asset and upload file
    onProgress?.(`Erstelle Asset für ${file.name}...`);
    const assetId = await uploadAsset(file);

    if (assetId === 'error') {
      onProgress?.(`Fehler beim Hochladen von ${file.name}`);
      return 'error';
    }

    onProgress?.(`${file.name} hochgeladen, warte auf Verarbeitung...`);

    // Step 2: Wait for asset to be processed
    const isReady = await waitForAssetProcessing(assetId);

    if (!isReady) {
      onProgress?.(`Timeout: ${file.name} konnte nicht verarbeitet werden`);
      return 'error';
    }

    onProgress?.(`${file.name} verarbeitet, veröffentliche Asset...`);

    // Step 3: Publish the asset
    const publishResult = await publishAsset(assetId);

    if (publishResult === 'error') {
      onProgress?.(`Fehler beim Veröffentlichen von ${file.name}`);
      return 'error';
    }

    onProgress?.(`${file.name} erfolgreich veröffentlicht`);
    return assetId;
  } catch (error) {
    console.error('Upload Asset With Status Check Error:', error);
    onProgress?.(`Unerwarteter Fehler bei ${file.name}: ${error.message}`);
    return 'error';
  }
}

export async function uploadMultipleAssetsWithStatusCheck(
  files: File[],
  onProgress?: (message: string, current: number, total: number) => void
): Promise<string[]> {
  const uploadedAssetIds: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const current = i + 1;
    const total = files.length;

    onProgress?.(`Verarbeite Datei ${current} von ${total}: ${file.name}`, current, total);

    const assetId = await uploadAssetWithStatusCheck(file, (message) => {
      onProgress?.(message, current, total);
    });

    if (assetId !== 'error') {
      uploadedAssetIds.push(assetId);
    } else {
      console.error(`Failed to upload file: ${file.name}`);
      // Continue with other files even if one fails
    }
  }

  return uploadedAssetIds;
}

export async function uploadMultipleAssetsWithDelay(
  files: File[],
  delayBetweenUploads: number = 2000,
  onProgress?: (message: string, current: number, total: number, assetId?: string) => void
): Promise<string[]> {
  const uploadedAssetIds: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const current = i + 1;
    const total = files.length;

    onProgress?.(`Lade Datei ${current} von ${total} hoch: ${file.name}`, current, total);

    // Only upload and wait for processing, don't publish yet
    const assetId = await uploadAssetOnly(file, (message) => {
      onProgress?.(message, current, total);
    });

    if (assetId !== 'error') {
      uploadedAssetIds.push(assetId);
      onProgress?.(`Datei ${current} von ${total} erfolgreich hochgeladen: ${file.name}`, current, total, assetId);
    } else {
      console.error(`Failed to upload file: ${file.name}`);
      onProgress?.(`Fehler bei Datei ${current} von ${total}: ${file.name}`, current, total);
    }

    // Add delay between uploads to avoid rate limiting (except for the last file)
    if (i < files.length - 1) {
      onProgress?.(`Warte ${delayBetweenUploads / 1000}s vor nächstem Upload...`, current, total);
      await new Promise((resolve) => setTimeout(resolve, delayBetweenUploads));
    }
  }

  return uploadedAssetIds;
}

export async function uploadAssetOnly(file: File, onProgress?: (message: string) => void): Promise<string> {
  try {
    // Step 1: Create asset and upload file
    onProgress?.(`Erstelle Asset für ${file.name}...`);
    const assetId = await uploadAsset(file);

    if (assetId === 'error') {
      onProgress?.(`Fehler beim Hochladen von ${file.name}`);
      return 'error';
    }

    onProgress?.(`${file.name} hochgeladen, warte auf Verarbeitung...`);

    // Step 2: Wait for asset to be processed (but don't publish yet)
    const isReady = await waitForAssetProcessing(assetId);

    if (!isReady) {
      onProgress?.(`Timeout: ${file.name} konnte nicht verarbeitet werden`);
      return 'error';
    }

    onProgress?.(`${file.name} erfolgreich verarbeitet (bereit zum Veröffentlichen)`);
    return assetId;
  } catch (error) {
    console.error('Upload Asset Only Error:', error);
    onProgress?.(`Unerwarteter Fehler bei ${file.name}: ${error.message}`);
    return 'error';
  }
}

export async function publishMultipleAssets(assetIds: string[], onProgress?: (message: string, current: number, total: number) => void): Promise<string[]> {
  const publishedAssetIds: string[] = [];

  for (let i = 0; i < assetIds.length; i++) {
    const assetId = assetIds[i];
    const current = i + 1;
    const total = assetIds.length;

    onProgress?.(`Veröffentliche Asset ${current} von ${total}...`, current, total);

    const publishResult = await publishAsset(assetId);

    if (publishResult !== 'error') {
      publishedAssetIds.push(assetId);
      onProgress?.(`Asset ${current} von ${total} erfolgreich veröffentlicht`, current, total);
    } else {
      console.error(`Failed to publish asset: ${assetId}`);
      onProgress?.(`Fehler beim Veröffentlichen von Asset ${current} von ${total}`, current, total);
    }

    // Small delay between publishes to avoid rate limiting
    if (i < assetIds.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return publishedAssetIds;
}

function dataUrlToFile(dataUrl: string, fileName: string) {
  const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
  return new File([buffer], fileName, { type: 'image/png' });
}
