/**
 * Generate favicon files from SVG
 * Run with: node generate-favicons.js
 */

const fs = require('fs');
const path = require('path');

// Create a simple HTML canvas-based favicon generator
const generateFavicons = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Favicon Generator</title>
</head>
<body>
    <canvas id="canvas" width="32" height="32" style="display: none;"></canvas>
    <script>
        // Read the SVG content
        const svgContent = \`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="16" cy="16" rx="12" ry="14" fill="#4CAF50"/>
  <ellipse cx="16" cy="10" rx="8" ry="1.5" fill="#388E3C" opacity="0.8"/>
  <ellipse cx="16" cy="14" rx="9" ry="1.5" fill="#388E3C" opacity="0.8"/>
  <ellipse cx="16" cy="18" rx="8.5" ry="1.5" fill="#388E3C" opacity="0.8"/>
  <ellipse cx="16" cy="22" rx="7" ry="1.5" fill="#388E3C" opacity="0.8"/>
  <ellipse cx="13" cy="12" rx="3" ry="4" fill="#66BB6A" opacity="0.6"/>
  <circle cx="11" cy="15" r="0.5" fill="#2E7D32" opacity="0.7"/>
  <circle cx="20" cy="17" r="0.5" fill="#2E7D32" opacity="0.7"/>
  <circle cx="14" cy="20" r="0.5" fill="#2E7D32" opacity="0.7"/>
  <circle cx="18" cy="13" r="0.5" fill="#2E7D32" opacity="0.7"/>
  <ellipse cx="16" cy="4" rx="2" ry="2" fill="#2E7D32"/>
  <rect x="15" y="2" width="2" height="4" fill="#2E7D32" rx="1"/>
</svg>\`;

        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // Create image from SVG
        const img = new Image();
        const svgBlob = new Blob([svgContent], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = function() {
            // Clear canvas
            ctx.clearRect(0, 0, 32, 32);
            
            // Draw SVG to canvas
            ctx.drawImage(img, 0, 0, 32, 32);
            
            // Convert to ICO data URL
            const dataURL = canvas.toDataURL('image/png');
            
            // Create download link
            const link = document.createElement('a');
            link.download = 'favicon.png';
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            
            // Also create 16x16 version
            const canvas16 = document.createElement('canvas');
            canvas16.width = 16;
            canvas16.height = 16;
            const ctx16 = canvas16.getContext('2d');
            ctx16.drawImage(img, 0, 0, 16, 16);
            
            const link16 = document.createElement('a');
            link16.download = 'favicon-16x16.png';
            link16.href = canvas16.toDataURL('image/png');
            document.body.appendChild(link16);
            link16.click();
            
            URL.revokeObjectURL(url);
            
            console.log('Favicons generated!');
        };
        
        img.src = url;
    </script>
</body>
</html>`;

    fs.writeFileSync('favicon-generator.html', html);
    console.log('Created favicon-generator.html');
    console.log('Open this file in a browser to generate PNG favicons');
};

generateFavicons();