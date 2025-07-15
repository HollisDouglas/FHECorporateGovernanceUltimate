const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing PrivacyPad Frontend Installation...\n');

try {
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
        console.error('❌ package.json not found. Please run this from the frontend directory.');
        process.exit(1);
    }

    // Remove node_modules and lock files
    console.log('🧹 Cleaning existing installations...');
    if (fs.existsSync('node_modules')) {
        execSync('rm -rf node_modules', { stdio: 'inherit' });
    }
    if (fs.existsSync('package-lock.json')) {
        fs.unlinkSync('package-lock.json');
    }
    if (fs.existsSync('yarn.lock')) {
        fs.unlinkSync('yarn.lock');
    }

    // Install core dependencies first
    console.log('📦 Installing React and core dependencies...');
    execSync('npm install react@18.2.0 react-dom@18.2.0 --save', { stdio: 'inherit' });
    
    console.log('📦 Installing React Scripts...');
    execSync('npm install react-scripts@5.0.1 --save-dev', { stdio: 'inherit' });
    
    console.log('📦 Installing other dependencies...');
    execSync('npm install ethers@6.9.2 react-hot-toast@2.4.1 --save', { stdio: 'inherit' });
    
    // Try to install lucide-react
    try {
        execSync('npm install lucide-react@0.292.0 --save', { stdio: 'inherit' });
    } catch (error) {
        console.warn('⚠️  Could not install lucide-react, will use fallback icons');
    }

    console.log('✅ Installation completed successfully!');
    console.log('\n🚀 You can now run: npm start');
    
} catch (error) {
    console.error('❌ Installation failed:', error.message);
    
    console.log('\n💡 Alternative solutions:');
    console.log('1. Try using our static server: node start-simple.js');
    console.log('2. Open index.html directly in browser');
    console.log('3. Use a simple HTTP server like: npx serve public');
    
    process.exit(1);
}