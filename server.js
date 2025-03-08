const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Increase the size limit to 100MB to handle large files
app.use(express.json({limit: '100mb'}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle artwork saves
app.post('/save', (req, res) => {
    try {
        const { imageData, filename } = req.body;
        if (!imageData || !filename) {
            throw new Error('Missing required data');
        }
        
        // Handle both base64 formats that browsers might send
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
        
        // Create artworks directory if it doesn't exist
        const artworksDir = path.join(__dirname, 'artworks');
        if (!fs.existsSync(artworksDir)) {
            fs.mkdirSync(artworksDir, { recursive: true });
        }
        
        // Save the file
        const filePath = path.join(artworksDir, filename);
        fs.writeFileSync(filePath, base64Data, 'base64');
        
        console.log('Artwork saved successfully to:', filePath);
        res.json({ success: true, path: filePath });
    } catch (error) {
        console.error('Error saving artwork:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Handle recording saves
app.post('/save-recording', (req, res) => {
    try {
        const { blob, filename, mimeType } = req.body;
        if (!blob || !filename || !mimeType) {
            throw new Error('Missing required data');
        }
        
        // Create artworks directory if it doesn't exist
        const artworksDir = path.join(__dirname, 'artworks');
        if (!fs.existsSync(artworksDir)) {
            fs.mkdirSync(artworksDir, { recursive: true });
        }
        
        // Extract the base64 data, handling both webm and mp4 formats
        const base64Data = blob.replace(new RegExp(`^data:${mimeType};base64,`), '');
        
        // Save the video file
        const filePath = path.join(artworksDir, filename);
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        
        console.log('Recording saved successfully to:', filePath);
        res.json({ success: true, path: filePath });
    } catch (error) {
        console.error('Error saving recording:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Save endpoints available at:');
    console.log('  - POST /save');
    console.log('  - POST /save-recording');
}); 