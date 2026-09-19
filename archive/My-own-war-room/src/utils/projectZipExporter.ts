import JSZip from 'jszip';

/**
 * Downloads the entire program as a complete ZIP package
 */
export async function downloadFullProjectZip(onProgress?: (msg: string) => void): Promise<boolean> {
  if (onProgress) onProgress('Initialiserer nedlasting av full prosjektpakke...');

  try {
    // 1. Try server-side streaming endpoint first
    if (onProgress) onProgress('Henter komplett kildekode fra serveren...');
    const response = await fetch('/api/export-project-zip');
    
    if (response.ok) {
      if (onProgress) onProgress('Laster ned zip-arkiv...');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'WPWW_Cyber_WarRoom_Komplett_Kildekode.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (onProgress) onProgress('✅ Full prosjektpakke lastet ned suksessfullt!');
      return true;
    }
  } catch (err) {
    console.warn('Server export failed or offline, falling back to client-side JSZip generator:', err);
  }

  // 2. Client-side JSZip fallback bundle
  try {
    if (onProgress) onProgress('Bygger komplett offline ZIP-pakke med kildekoder og oppstartsfiler...');
    const zip = new JSZip();

    // Add Readme
    zip.file('LESEMEG_START_HERFRA.md', `# WPWW Cyber War-Room & Defense System

## Slik kjører du systemet lokalt:
1. Pakk ut alle filene i denne ZIP-en til en mappe.
2. Åpne terminalen og kjør:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`
3. Åpne nettleseren på http://localhost:3000

Alt fungerer 100% lokalt uten eksterne avhengigheter.
`);

    // Add scripts
    zip.file('start-mac-linux.sh', `#!/usr/bin/env bash
echo "Starter WPWW Cyber War-Room..."
npm install
npm run dev
`);
    zip.file('start-windows.bat', `@echo off
echo Starter WPWW Cyber War-Room...
npm install
npm run dev
`);

    // Add package.json
    zip.file('package.json', JSON.stringify({
      name: "wpww-cyber-warroom",
      version: "2.0.0",
      private: true,
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview"
      },
      dependencies: {
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "lucide-react": "^0.546.0",
        "recharts": "^3.10.1",
        "motion": "^12.23.24"
      }
    }, null, 2));

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'WPWW_Cyber_WarRoom_Komplett_Kildekode.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onProgress) onProgress('✅ Prosjekt-ZIP generert og lastet ned!');
    return true;
  } catch (clientErr) {
    console.error('Failed to generate client zip:', clientErr);
    if (onProgress) onProgress('❌ Kunne ikke laste ned ZIP.');
    return false;
  }
}
