const express = require('express');
const axios = require('axios');
const router = express.Router();
const { getNextApiKey, reportRateLimit, reportSuccess } = require('../utils/sketchfabKeyManager');

const SKETCHFAB_API_BASE = 'https://api.sketchfab.com/v3';

/**
 * GET /api/sketchfab/search
 * Search for downloadable models
 * Query params: q (search query), limit (default 10)
 */
router.get('/search', async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query (q) is required' });
  }

  try {
    console.log(`🔍 Searching Sketchfab for: "${q}"`);

    const apiKey = getNextApiKey();
    
    const response = await axios.get(`${SKETCHFAB_API_BASE}/search`, {
      params: {
        q,
        type: 'models',
        downloadable: true,
        count: limit,
        sort_by: '-likeCount',
      },
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });

    reportSuccess(apiKey);

    const models = response.data.results.map(model => ({
      uid: model.uid,
      name: model.name,
      description: model.description,
      thumbnailUrl: model.thumbnails?.images?.[0]?.url,
      viewerUrl: model.viewerUrl,
      isDownloadable: model.isDownloadable,
      license: model.license?.label,
      vertexCount: model.vertexCount,
      faceCount: model.faceCount,
    }));

    res.json({
      success: true,
      count: models.length,
      models,
    });

  } catch (error) {
    // Check if it's a rate limit error (429)
    if (error.response?.status === 429) {
      const apiKey = getNextApiKey(); // Get the key that was used
      reportRateLimit(apiKey);
    }
    
    console.error('❌ Sketchfab search error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to search Sketchfab',
      details: error.response?.data?.detail || error.message,
    });
  }
});

/**
 * GET /api/sketchfab/model/:uid
 * Get detailed info about a specific model
 */
router.get('/model/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    console.log(`📦 Fetching model info for UID: ${uid}`);

    const apiKey = getNextApiKey();
    
    const response = await axios.get(`${SKETCHFAB_API_BASE}/models/${uid}`, {
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });

    reportSuccess(apiKey);

    const model = response.data;

    res.json({
      success: true,
      model: {
        uid: model.uid,
        name: model.name,
        description: model.description,
        isDownloadable: model.isDownloadable,
        license: model.license?.label,
        thumbnailUrl: model.thumbnails?.images?.[0]?.url,
        viewerUrl: model.viewerUrl,
        vertexCount: model.vertexCount,
        faceCount: model.faceCount,
      },
    });

  } catch (error) {
    // Check if it's a rate limit error (429)
    if (error.response?.status === 429) {
      const apiKey = getNextApiKey();
      reportRateLimit(apiKey);
    }
    
    console.error('❌ Sketchfab model fetch error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch model info',
      details: error.response?.data?.detail || error.message,
    });
  }
});

/**
 * GET /api/sketchfab/download/:uid
 * Get download URL for a model's GLTF file
 */
router.get('/download/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    console.log(`⬇️ Fetching download link for UID: ${uid}`);

    const apiKey = getNextApiKey();
    
    // First check if model is downloadable
    const modelInfo = await axios.get(`${SKETCHFAB_API_BASE}/models/${uid}`, {
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });

    if (!modelInfo.data.isDownloadable) {
      return res.status(403).json({
        error: 'Model is not available for download',
        modelName: modelInfo.data.name,
      });
    }

    // Get download archives
    const downloadResponse = await axios.get(`${SKETCHFAB_API_BASE}/models/${uid}/download`, {
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });

    reportSuccess(apiKey);

    // Find GLTF format
    const gltfUrl = downloadResponse.data.gltf?.url;

    if (!gltfUrl) {
      return res.status(404).json({
        error: 'GLTF format not available for this model',
        availableFormats: Object.keys(downloadResponse.data),
      });
    }

    console.log(`✅ Download URL found for ${modelInfo.data.name}`);

    res.json({
      success: true,
      downloadUrl: gltfUrl,
      modelName: modelInfo.data.name,
      license: modelInfo.data.license?.label,
    });

  } catch (error) {
    // Check if it's a rate limit error (429)
    if (error.response?.status === 429) {
      const apiKey = getNextApiKey();
      reportRateLimit(apiKey);
    }
    
    console.error('❌ Sketchfab download error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get download URL',
      details: error.response?.data?.detail || error.message,
    });
  }
});

module.exports = router;